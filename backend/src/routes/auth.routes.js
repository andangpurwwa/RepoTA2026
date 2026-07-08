const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const { requireAuth } = require('../middleware/auth');
const { sendPasswordResetEmail } = require('../utils/mailer');

const router = express.Router();

function parseStudentEmail(email) {
  const normalized = String(email || '').trim().toLowerCase();
  const match = normalized.match(/^([0-9]{8,12})@(?:student\.)?webmail\.uad\.ac\.id$/);
  return match ? { email: normalized, nim: match[1] } : null;
}

function isAllowedStudentEmail(email) {
  return Boolean(parseStudentEmail(email));
}

function publicUser(user) {
  if (!user) return null;
  return { id: user.id, name: user.name, email: user.email, nim: user.nim, role: user.role };
}

function signToken(user) {
  return jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET || 'secret',
    { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
  );
}

function randomOtp() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

async function findUserByIdentifier(identifier) {
  const key = String(identifier || '').trim().toLowerCase();
  const result = await pool.query(
    `SELECT id, name, email, nim, role, password_hash
     FROM users
     WHERE LOWER(email) = $1 OR nim = $2
     LIMIT 1`,
    [key, String(identifier || '').trim()]
  );
  return result.rows[0];
}

router.post('/login', async (req, res, next) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({ message: 'Email/NIM dan password wajib diisi.' });
    }

    const user = await findUserByIdentifier(identifier);
    if (!user) {
      return res.status(401).json({ message: 'Akun tidak ditemukan.' });
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ message: 'Password salah.' });
    }

    return res.json({ token: signToken(user), user: publicUser(user) });
  } catch (error) {
    return next(error);
  }
});

router.post('/register', async (req, res, next) => {
  try {
    const { name, email, nim, password } = req.body;
    const finalEmail = String(email || '').trim().toLowerCase();

    if (!name || !finalEmail || !password) {
      return res.status(400).json({ message: 'Nama, email webmail UAD, dan password wajib diisi.' });
    }

    const parsedEmail = parseStudentEmail(finalEmail);
    if (!parsedEmail) {
      return res.status(400).json({ message: 'Format email mahasiswa harus menggunakan NIM, contoh: 2300016106@webmail.uad.ac.id.' });
    }

    const finalNim = String(nim || parsedEmail.nim).trim();
    if (!finalNim || finalNim !== parsedEmail.nim) {
      return res.status(400).json({ message: 'NIM harus sama dengan angka di depan email webmail UAD.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password minimal 6 karakter.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const result = await pool.query(
      `INSERT INTO users (name, email, nim, password_hash, role)
       VALUES ($1, $2, $3, $4, 'mahasiswa')
       RETURNING id, name, email, nim, role`,
      [name.trim(), finalEmail, finalNim, passwordHash]
    );

    const user = result.rows[0];
    return res.status(201).json({ token: signToken(user), user });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ message: 'Email atau NIM sudah digunakan.' });
    }
    return next(error);
  }
});

router.post('/password/request-otp', async (req, res, next) => {
  try {
    const { identifier } = req.body;
    if (!identifier) return res.status(400).json({ message: 'Email akun wajib diisi.' });

    const user = await findUserByIdentifier(identifier);
    if (!user) return res.status(404).json({ message: 'Akun tidak ditemukan. Pastikan email sudah terdaftar.' });

    const code = randomOtp();
    await sendPasswordResetEmail({ to: user.email, name: user.name, code });

    const codeHash = await bcrypt.hash(code, 10);
    await pool.query(
      `INSERT INTO password_reset_otps (user_id, email, code_hash, expires_at)
       VALUES ($1, $2, $3, NOW() + INTERVAL '10 minutes')`,
      [user.id, user.email, codeHash]
    );

    return res.json({
      message: 'Kode OTP sudah dikirim ke email akun terdaftar. Cek inbox atau folder spam.',
      email: user.email,
    });
  } catch (error) {
    return next(error);
  }
});

router.post('/password/reset', async (req, res, next) => {
  const client = await pool.connect();
  try {
    const { identifier, code, new_password } = req.body;
    if (!identifier || !code || !new_password) return res.status(400).json({ message: 'Email/NIM, kode OTP, dan password baru wajib diisi.' });
    if (String(new_password).length < 6) return res.status(400).json({ message: 'Password baru minimal 6 karakter.' });

    const user = await findUserByIdentifier(identifier);
    if (!user) return res.status(404).json({ message: 'Akun tidak ditemukan.' });

    await client.query('BEGIN');
    const otpResult = await client.query(
      `SELECT id, code_hash
       FROM password_reset_otps
       WHERE user_id = $1 AND used_at IS NULL AND expires_at > NOW()
       ORDER BY created_at DESC
       LIMIT 1`,
      [user.id]
    );
    const otp = otpResult.rows[0];
    if (!otp) {
      await client.query('ROLLBACK');
      return res.status(400).json({ message: 'Kode OTP tidak ditemukan atau sudah kedaluwarsa.' });
    }

    const valid = await bcrypt.compare(String(code).trim(), otp.code_hash);
    if (!valid) {
      await client.query('ROLLBACK');
      return res.status(400).json({ message: 'Kode OTP salah.' });
    }

    const passwordHash = await bcrypt.hash(new_password, 10);
    await client.query('UPDATE users SET password_hash = $1 WHERE id = $2', [passwordHash, user.id]);
    await client.query('UPDATE password_reset_otps SET used_at = NOW() WHERE id = $1', [otp.id]);
    await client.query('COMMIT');

    return res.json({ message: 'Password berhasil diubah. Silakan login menggunakan password baru.' });
  } catch (error) {
    await client.query('ROLLBACK');
    return next(error);
  } finally {
    client.release();
  }
});

router.post('/change-password', requireAuth(['mahasiswa', 'admin']), async (req, res, next) => {
  try {
    const { current_password, new_password } = req.body;
    if (!current_password || !new_password) return res.status(400).json({ message: 'Password lama dan password baru wajib diisi.' });
    if (String(new_password).length < 6) return res.status(400).json({ message: 'Password baru minimal 6 karakter.' });

    const result = await pool.query('SELECT id, password_hash FROM users WHERE id = $1', [req.user.id]);
    const user = result.rows[0];
    if (!user) return res.status(404).json({ message: 'User tidak ditemukan.' });

    const valid = await bcrypt.compare(current_password, user.password_hash);
    if (!valid) return res.status(400).json({ message: 'Password lama salah.' });

    const passwordHash = await bcrypt.hash(new_password, 10);
    await pool.query('UPDATE users SET password_hash = $1 WHERE id = $2', [passwordHash, user.id]);
    return res.json({ message: 'Password berhasil diubah.' });
  } catch (error) {
    return next(error);
  }
});

router.get('/me', requireAuth(), (req, res) => {
  return res.json({ user: req.user });
});

module.exports = router;
