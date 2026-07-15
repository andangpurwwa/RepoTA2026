const crypto = require('crypto');
const express = require('express');
const pool = require('../config/db');
const supabase = require('../config/supabase');
const { requireAuth } = require('../middleware/auth');
const avatarUpload = require('../middleware/avatarUpload');
const { cleanString, ensureValidation } = require('../utils/validation');

const router = express.Router();

const AVATAR_BUCKET =
  supabase.config?.avatarBucket ||
  process.env.SUPABASE_AVATAR_BUCKET ||
  'repota-avatars';

const EXTENSION_BY_MIME = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

function publicUser(row) {
  if (!row) return null;

  return {
    id: row.id,
    name: row.name,
    email: row.email,
    nim: row.nim,
    role: row.role,
    profile_photo_url: row.profile_photo_url || null,
  };
}

function isValidImageContent(buffer, mimeType) {
  if (!Buffer.isBuffer(buffer) || buffer.length < 12) return false;

  if (mimeType === 'image/jpeg') {
    return (
      buffer[0] === 0xff &&
      buffer[1] === 0xd8 &&
      buffer[2] === 0xff
    );
  }

  if (mimeType === 'image/png') {
    const signature = Buffer.from([
      0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
    ]);
    return buffer.subarray(0, 8).equals(signature);
  }

  if (mimeType === 'image/webp') {
    return (
      buffer.subarray(0, 4).toString('ascii') === 'RIFF' &&
      buffer.subarray(8, 12).toString('ascii') === 'WEBP'
    );
  }

  return false;
}

async function removeStorageObject(objectPath) {
  if (!objectPath) return;

  try {
    const { error } = await supabase.storage
      .from(AVATAR_BUCKET)
      .remove([objectPath]);

    if (error) {
      console.warn(
        `Avatar lama tidak dapat dihapus dari Storage: ${error.message}`
      );
    }
  } catch (error) {
    console.warn(
      `Avatar lama tidak dapat dihapus dari Storage: ${error.message}`
    );
  }
}

router.get(
  '/me',
  requireAuth(['mahasiswa', 'admin']),
  async (req, res, next) => {
    try {
      const result = await pool.query(
        `SELECT id, name, email, nim, role, profile_photo_url
         FROM users
         WHERE id = $1
         LIMIT 1`,
        [req.user.id]
      );

      if (!result.rows[0]) {
        return res.status(404).json({ message: 'Akun tidak ditemukan.' });
      }

      return res.json({ user: publicUser(result.rows[0]) });
    } catch (error) {
      return next(error);
    }
  }
);

router.put(
  '/me',
  requireAuth(['mahasiswa', 'admin']),
  async (req, res, next) => {
    try {
      const name = cleanString(req.body?.name);
      const errors = [];

      if (!name) errors.push('Nama wajib diisi.');
      if (name && name.length < 3) errors.push('Nama minimal 3 karakter.');
      if (name.length > 120) errors.push('Nama maksimal 120 karakter.');
      ensureValidation(errors);

      const result = await pool.query(
        `UPDATE users
         SET name = $1
         WHERE id = $2
         RETURNING id, name, email, nim, role, profile_photo_url`,
        [name, req.user.id]
      );

      if (!result.rows[0]) {
        return res.status(404).json({ message: 'Akun tidak ditemukan.' });
      }

      return res.json({
        message: 'Profil berhasil diperbarui.',
        user: publicUser(result.rows[0]),
      });
    } catch (error) {
      return next(error);
    }
  }
);

router.post(
  '/me/photo',
  requireAuth(['mahasiswa', 'admin']),
  avatarUpload.single('photo'),
  async (req, res, next) => {
    let uploadedPath = null;

    try {
      if (!req.file) {
        return res.status(400).json({
          message: 'Pilih foto profil terlebih dahulu.',
        });
      }

      if (!isValidImageContent(req.file.buffer, req.file.mimetype)) {
        return res.status(400).json({
          message:
            'Isi file tidak sesuai dengan format JPG, PNG, atau WEBP.',
        });
      }

      const currentResult = await pool.query(
        `SELECT profile_photo_path
         FROM users
         WHERE id = $1
         LIMIT 1`,
        [req.user.id]
      );

      const currentUser = currentResult.rows[0];

      if (!currentUser) {
        return res.status(404).json({ message: 'Akun tidak ditemukan.' });
      }

      const extension = EXTENSION_BY_MIME[req.file.mimetype];
      uploadedPath = `avatars/${req.user.id}/${Date.now()}-${crypto.randomUUID()}.${extension}`;

      const { error: uploadError } = await supabase.storage
        .from(AVATAR_BUCKET)
        .upload(uploadedPath, req.file.buffer, {
          contentType: req.file.mimetype,
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) {
        const error = new Error(
          `Gagal mengunggah foto ke Supabase Storage: ${uploadError.message}`
        );
        error.status = 502;
        throw error;
      }

      const { data: publicUrlData } = supabase.storage
        .from(AVATAR_BUCKET)
        .getPublicUrl(uploadedPath);

      const profilePhotoUrl = publicUrlData?.publicUrl;

      if (!profilePhotoUrl) {
        const error = new Error('URL foto profil gagal dibuat.');
        error.status = 500;
        throw error;
      }

      const updateResult = await pool.query(
        `UPDATE users
         SET profile_photo_url = $1,
             profile_photo_path = $2
         WHERE id = $3
         RETURNING id, name, email, nim, role, profile_photo_url`,
        [profilePhotoUrl, uploadedPath, req.user.id]
      );

      if (!updateResult.rows[0]) {
        const error = new Error('Akun tidak ditemukan.');
        error.status = 404;
        throw error;
      }

      const oldPath = currentUser.profile_photo_path;
      uploadedPath = null;

      if (oldPath) {
        await removeStorageObject(oldPath);
      }

      return res.json({
        message: 'Foto profil berhasil diunggah.',
        user: publicUser(updateResult.rows[0]),
      });
    } catch (error) {
      if (uploadedPath) {
        await removeStorageObject(uploadedPath);
      }
      return next(error);
    }
  }
);

router.delete(
  '/me/photo',
  requireAuth(['mahasiswa', 'admin']),
  async (req, res, next) => {
    try {
      const currentResult = await pool.query(
        `SELECT profile_photo_path
         FROM users
         WHERE id = $1
         LIMIT 1`,
        [req.user.id]
      );

      if (!currentResult.rows[0]) {
        return res.status(404).json({ message: 'Akun tidak ditemukan.' });
      }

      const result = await pool.query(
        `UPDATE users
         SET profile_photo_url = NULL,
             profile_photo_path = NULL
         WHERE id = $1
         RETURNING id, name, email, nim, role, profile_photo_url`,
        [req.user.id]
      );

      await removeStorageObject(currentResult.rows[0].profile_photo_path);

      return res.json({
        message: 'Foto profil berhasil dihapus.',
        user: publicUser(result.rows[0]),
      });
    } catch (error) {
      return next(error);
    }
  }
);

router.get('/students', requireAuth(['admin']), async (req, res, next) => {
  try {
    const search = cleanString(req.query.search);
    const params = [];
    let where = `WHERE u.role = 'mahasiswa'`;

    if (search) {
      params.push(`%${search}%`);
      where += ` AND (
        LOWER(u.name) LIKE LOWER($1)
        OR LOWER(u.email) LIKE LOWER($1)
        OR LOWER(COALESCE(u.nim, '')) LIKE LOWER($1)
      )`;
    }

    const result = await pool.query(
      `SELECT
         u.id,
         u.name,
         u.email,
         u.nim,
         u.profile_photo_url,
         u.created_at,
         COUNT(r.id)::int AS total_upload,
         COUNT(r.id) FILTER (WHERE r.status = 'draft')::int AS total_draft,
         COUNT(r.id) FILTER (WHERE r.status = 'pending')::int AS total_pending,
         COUNT(r.id) FILTER (WHERE r.status = 'approved')::int AS total_approved,
         COUNT(r.id) FILTER (WHERE r.status = 'rejected')::int AS total_rejected,
         COUNT(r.id) FILTER (WHERE r.status = 'revision')::int AS total_revision,
         MAX(r.created_at) AS last_upload_at
       FROM users u
       LEFT JOIN repositories r ON r.submitted_by = u.id
       ${where}
       GROUP BY u.id
       ORDER BY u.name ASC`,
      params
    );

    return res.json({ data: result.rows });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
