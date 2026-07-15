const crypto = require('crypto');
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const { requireAuth } = require('../middleware/auth');
const { sendPasswordResetEmail } = require('../utils/mailer');
const {
  cleanString,
  validatePassword,
  ensureValidation,
} = require('../utils/validation');

const router = express.Router();

const OTP_EXPIRY_MINUTES = Math.max(
  Number(process.env.OTP_EXPIRY_MINUTES) || 10,
  1
);
const OTP_COOLDOWN_SECONDS = Math.max(
  Number(process.env.OTP_COOLDOWN_SECONDS) || 60,
  15
);

function getJwtSecret() {
  const secret = cleanString(process.env.JWT_SECRET);
  if (!secret) {
    const error = new Error('JWT_SECRET belum dikonfigurasi pada backend.');
    error.status = 500;
    throw error;
  }
  return secret;
}

function parseStudentEmail(email) {
  const normalized = cleanString(email).toLowerCase();
  const match = normalized.match(
    /^([0-9]{8,12})@(?:student\.)?webmail\.uad\.ac\.id$/
  );
  return match ? { email: normalized, nim: match[1] } : null;
}

function publicUser(user) {
  if (!user) return null;

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    nim: user.nim,
    role: user.role,
    profile_photo_url: user.profile_photo_url || null,
  };
}

function signToken(user) {
  return jwt.sign(
    { id: user.id, role: user.role },
    getJwtSecret(),
    { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
  );
}

function randomOtp() {
  return String(crypto.randomInt(100000, 1000000));
}

async function findUserByIdentifier(identifier, client = pool) {
  const rawIdentifier = cleanString(identifier);
  const key = rawIdentifier.toLowerCase();

  const result = await client.query(
    `SELECT
       id,
       name,
       email,
       nim,
       role,
       profile_photo_url,
       password_hash
     FROM users
     WHERE LOWER(email) = $1 OR nim = $2
     LIMIT 1`,
    [key, rawIdentifier]
  );

  return result.rows[0] || null;
}

router.post('/login', async (req, res, next) => {
  try {
    const identifier = cleanString(req.body?.identifier);
    const password = String(req.body?.password || '');

    if (!identifier || !password) {
      return res.status(400).json({
        message: 'Email/NIM dan password wajib diisi.',
      });
    }

    const user = await findUserByIdentifier(identifier);
    const valid = user
      ? await bcrypt.compare(password, user.password_hash)
      : false;

    if (!user || !valid) {
      return res.status(401).json({
        message: 'Email/NIM atau password salah.',
      });
    }

    return res.json({
      token: signToken(user),
      user: publicUser(user),
    });
  } catch (error) {
    return next(error);
  }
});

router.post('/register', async (req, res, next) => {
  try {
    const name = cleanString(req.body?.name);
    const finalEmail = cleanString(req.body?.email).toLowerCase();
    const password = String(req.body?.password || '');
    const parsedEmail = parseStudentEmail(finalEmail);
    const errors = [];

    if (!name) errors.push('Nama wajib diisi.');
    if (name && name.length < 3) errors.push('Nama minimal 3 karakter.');
    if (name.length > 120) errors.push('Nama maksimal 120 karakter.');
    if (!finalEmail) errors.push('Email webmail UAD wajib diisi.');
    if (!parsedEmail) {
      errors.push(
        'Format email mahasiswa harus menggunakan NIM, contoh: 2300016106@webmail.uad.ac.id.'
      );
    }
    errors.push(...validatePassword(password));
    ensureValidation(errors);

    const finalNim = cleanString(req.body?.nim || parsedEmail.nim);

    if (finalNim !== parsedEmail.nim) {
      return res.status(400).json({
        message: 'NIM harus sama dengan angka di depan email webmail UAD.',
      });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const result = await pool.query(
      `INSERT INTO users (name, email, nim, password_hash, role)
       VALUES ($1, $2, $3, $4, 'mahasiswa')
       RETURNING id, name, email, nim, role, profile_photo_url`,
      [name, finalEmail, finalNim, passwordHash]
    );

    const user = result.rows[0];
    return res.status(201).json({
      token: signToken(user),
      user: publicUser(user),
    });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({
        message: 'Email atau NIM sudah digunakan.',
      });
    }
    return next(error);
  }
});

router.post('/password/request-otp', async (req, res, next) => {
  const client = await pool.connect();
  let otpId = null;

  try {
    const identifier = cleanString(req.body?.identifier);

    if (!identifier) {
      return res.status(400).json({ message: 'Email akun wajib diisi.' });
    }

    const user = await findUserByIdentifier(identifier, client);

    if (!user) {
      return res.status(404).json({
        message: 'Akun tidak ditemukan. Pastikan email sudah terdaftar.',
      });
    }

    const cooldownResult = await client.query(
      `SELECT EXTRACT(EPOCH FROM (NOW() - created_at))::int AS seconds_ago
       FROM password_reset_otps
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT 1`,
      [user.id]
    );

    const secondsAgo = cooldownResult.rows[0]?.seconds_ago;

    if (
      Number.isFinite(secondsAgo) &&
      secondsAgo < OTP_COOLDOWN_SECONDS
    ) {
      return res.status(429).json({
        message: `Tunggu ${OTP_COOLDOWN_SECONDS - secondsAgo} detik sebelum meminta OTP baru.`,
      });
    }

    const code = randomOtp();
    const codeHash = await bcrypt.hash(code, 10);

    await client.query('BEGIN');
    await client.query(
      `UPDATE password_reset_otps
       SET used_at = NOW()
       WHERE user_id = $1 AND used_at IS NULL`,
      [user.id]
    );

    const insertResult = await client.query(
      `INSERT INTO password_reset_otps
       (user_id, email, code_hash, expires_at)
       VALUES ($1, $2, $3, NOW() + ($4 || ' minutes')::interval)
       RETURNING id`,
      [user.id, user.email, codeHash, String(OTP_EXPIRY_MINUTES)]
    );

    otpId = insertResult.rows[0].id;
    await client.query('COMMIT');

    try {
      await sendPasswordResetEmail({
        to: user.email,
        name: user.name,
        code,
      });
    } catch (mailError) {
      await client.query(
        `DELETE FROM password_reset_otps WHERE id = $1`,
        [otpId]
      );
      return next(mailError);
    }

    return res.json({
      message:
        'Kode OTP sudah dikirim ke email akun terdaftar. Cek inbox atau folder spam.',
      email: user.email,
      expires_in_minutes: OTP_EXPIRY_MINUTES,
    });
  } catch (error) {
    try {
      await client.query('ROLLBACK');
    } catch {
      // Tidak ada transaksi aktif.
    }
    return next(error);
  } finally {
    client.release();
  }
});

router.post('/password/reset', async (req, res, next) => {
  const client = await pool.connect();

  try {
    const identifier = cleanString(req.body?.identifier);
    const code = cleanString(req.body?.code);
    const newPassword = String(req.body?.new_password || '');
    const errors = [];

    if (!identifier) errors.push('Email/NIM wajib diisi.');
    if (!/^\d{6}$/.test(code)) errors.push('Kode OTP harus terdiri dari 6 angka.');
    errors.push(...validatePassword(newPassword, 'Password baru'));
    ensureValidation(errors);

    const user = await findUserByIdentifier(identifier, client);

    if (!user) {
      return res.status(404).json({ message: 'Akun tidak ditemukan.' });
    }

    await client.query('BEGIN');

    const otpResult = await client.query(
      `SELECT id, code_hash
       FROM password_reset_otps
       WHERE user_id = $1
         AND used_at IS NULL
         AND expires_at > NOW()
       ORDER BY created_at DESC
       LIMIT 1
       FOR UPDATE`,
      [user.id]
    );

    const otp = otpResult.rows[0];

    if (!otp) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        message: 'Kode OTP tidak ditemukan atau sudah kedaluwarsa.',
      });
    }

    const valid = await bcrypt.compare(code, otp.code_hash);

    if (!valid) {
      await client.query('ROLLBACK');
      return res.status(400).json({ message: 'Kode OTP salah.' });
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);

    await client.query(
      `UPDATE users SET password_hash = $1 WHERE id = $2`,
      [passwordHash, user.id]
    );
    await client.query(
      `UPDATE password_reset_otps SET used_at = NOW() WHERE id = $1`,
      [otp.id]
    );
    await client.query('COMMIT');

    return res.json({
      message:
        'Password berhasil diubah. Silakan login menggunakan password baru.',
    });
  } catch (error) {
    try {
      await client.query('ROLLBACK');
    } catch {
      // Tidak ada transaksi aktif.
    }
    return next(error);
  } finally {
    client.release();
  }
});

router.post(
  '/change-password',
  requireAuth(['mahasiswa', 'admin']),
  async (req, res, next) => {
    try {
      const currentPassword = String(req.body?.current_password || '');
      const newPassword = String(req.body?.new_password || '');
      const errors = [];

      if (!currentPassword) errors.push('Password lama wajib diisi.');
      errors.push(...validatePassword(newPassword, 'Password baru'));
      ensureValidation(errors);

      if (currentPassword === newPassword) {
        return res.status(400).json({
          message: 'Password baru harus berbeda dari password lama.',
        });
      }

      const result = await pool.query(
        `SELECT id, password_hash FROM users WHERE id = $1 LIMIT 1`,
        [req.user.id]
      );
      const user = result.rows[0];

      if (!user) {
        return res.status(404).json({ message: 'User tidak ditemukan.' });
      }

      const valid = await bcrypt.compare(
        currentPassword,
        user.password_hash
      );

      if (!valid) {
        return res.status(400).json({ message: 'Password lama salah.' });
      }

      const passwordHash = await bcrypt.hash(newPassword, 12);
      await pool.query(
        `UPDATE users SET password_hash = $1 WHERE id = $2`,
        [passwordHash, user.id]
      );

      return res.json({ message: 'Password berhasil diubah.' });
    } catch (error) {
      return next(error);
    }
  }
);

router.get('/me', requireAuth(), (req, res) => {
  return res.json({ user: publicUser(req.user) });
});

module.exports = router;
