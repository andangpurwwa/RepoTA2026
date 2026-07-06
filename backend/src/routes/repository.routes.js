const express = require('express');
const crypto = require('crypto');
const pool = require('../config/db');
const supabase = require('../config/supabase');
const uploadPdf = require('../middleware/upload');
const jwt = require('jsonwebtoken');
const { optionalAuth, requireAuth } = require('../middleware/auth');
const { categorizeRepository } = require('../utils/categorize');

const router = express.Router();

const STORAGE_BUCKET = process.env.SUPABASE_STORAGE_BUCKET || 'repota-documents';

function sanitizeFileName(originalName = 'document.pdf') {
  return originalName
    .replace(/[^a-zA-Z0-9.\-_ ]/g, '')
    .replace(/\s+/g, '-');
}

async function uploadPdfToStorage(file) {
  const safeName = sanitizeFileName(file.originalname);
  const objectPath = `repositories/${Date.now()}-${crypto.randomUUID()}-${safeName}`;

  const { error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(objectPath, file.buffer, {
      contentType: file.mimetype,
      upsert: false
    });

  if (error) {
    throw new Error(`Gagal upload PDF ke Supabase Storage: ${error.message}`);
  }

  return objectPath;
}

async function deletePdfFromStorage(objectPath) {
  if (!objectPath) return;

  const { error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .remove([objectPath]);

  if (error) {
    console.warn(`Gagal menghapus PDF dari Supabase Storage: ${error.message}`);
  }
}

function mapStatusLabel(status) {
  const map = { draft: 'Draft', pending: 'Menunggu Verifikasi', approved: 'Terverifikasi', rejected: 'Ditolak', revision: 'Revisi' };
  return map[status] || status;
}
function normalizeDate(input) {
  if (!input) return null;
  const date = new Date(input);
  return Number.isNaN(date.getTime()) ? null : input;
}
function yearFromDate(input) { return new Date(input || Date.now()).getFullYear(); }
function selectedFields(isGuest) {
  if (isGuest) {
    return `
      r.id,
      r.title,
      r.research_year,
      c.name AS category_name,
      c.id AS category_id
    `;
  }

  return `
    r.*,
    c.name AS category_name,
    u.name AS submitter_name,
    u.email AS submitter_email,
    u.nim AS submitter_nim
  `;
}
router.get('/', optionalAuth, async (req, res, next) => {
  try {
    const {
      search = '',
      category_id,
      year,
      advisor,
      date_from,
      date_to,
      date,
      status = 'all',
      sort = 'latest',
      page = 1,
      limit = 20
    } = req.query;

    const params = [];
    const conditions = [];

    const isAdmin = req.user?.role === 'admin';
    const isGuest = !req.user;

    const currentPage = Math.max(Number(page) || 1, 1);
    const perPage = Math.min(Math.max(Number(limit) || 20, 1), 100);
    const offset = (currentPage - 1) * perPage;

    if (!isAdmin) {
      conditions.push(`r.status = 'approved'`);
    } else if (status && status !== 'all') {
      params.push(status);
      conditions.push(`r.status = $${params.length}`);
    }

    if (search) {
      params.push(`%${search}%`);
      conditions.push(`
        (
          LOWER(r.title) LIKE LOWER($${params.length})
          OR LOWER(COALESCE(r.abstract,'')) LIKE LOWER($${params.length})
          OR LOWER(COALESCE(r.author_name,'')) LIKE LOWER($${params.length})
          OR LOWER(COALESCE(c.name,'')) LIKE LOWER($${params.length})
          OR LOWER(COALESCE(r.advisor,'')) LIKE LOWER($${params.length})
        )
      `);
    }

    if (category_id) {
      params.push(Number(category_id));
      conditions.push(`r.category_id = $${params.length}`);
    }

    if (year) {
      params.push(Number(year));
      conditions.push(`r.research_year = $${params.length}`);
    }

    if (advisor) {
      params.push(`%${advisor}%`);
      conditions.push(`LOWER(COALESCE(r.advisor,'')) LIKE LOWER($${params.length})`);
    }

    if (date) {
      params.push(date);
      conditions.push(`r.research_date = $${params.length}`);
    }

    if (date_from) {
      params.push(date_from);
      conditions.push(`r.research_date >= $${params.length}`);
    }

    if (date_to) {
      params.push(date_to);
      conditions.push(`r.research_date <= $${params.length}`);
    }

    const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const orderBy = sort === 'oldest'
      ? `COALESCE(r.research_date, r.created_at::date) ASC, r.created_at ASC`
      : sort === 'title'
        ? `LOWER(r.title) ASC`
        : `COALESCE(r.research_date, r.created_at::date) DESC, r.created_at DESC`;

    const countResult = await pool.query(
      `SELECT COUNT(*)::int AS total
       FROM repositories r
       LEFT JOIN categories c ON c.id = r.category_id
       LEFT JOIN users u ON u.id = r.submitted_by
       ${whereClause}`,
      params
    );

    const dataParams = [...params, perPage, offset];

    const result = await pool.query(
      `SELECT ${selectedFields(isGuest)}
       FROM repositories r
       LEFT JOIN categories c ON c.id = r.category_id
       LEFT JOIN users u ON u.id = r.submitted_by
       ${whereClause}
       ORDER BY ${orderBy}
       LIMIT $${dataParams.length - 1}
       OFFSET $${dataParams.length}`,
      dataParams
    );

    const total = countResult.rows[0]?.total || 0;

    return res.json({
      data: result.rows.map((row) => ({
        ...row,
        status_label: row.status ? mapStatusLabel(row.status) : undefined
      })),
      pagination: {
        page: currentPage,
        limit: perPage,
        total,
        totalPages: Math.ceil(total / perPage)
      }
    });
  } catch (error) {
    return next(error);
  }
});
router.get('/mine', requireAuth(['mahasiswa', 'admin']), async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT r.*, c.name AS category_name
       FROM repositories r
       LEFT JOIN categories c ON c.id = r.category_id
       WHERE r.submitted_by = $1
       ORDER BY r.updated_at DESC, r.created_at DESC`,
      [req.user.id]
    );
    return res.json({ data: result.rows.map((row) => ({ ...row, status_label: mapStatusLabel(row.status) })) });
  } catch (error) { return next(error); }
});

router.get('/pending', requireAuth(['admin']), async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT r.*, c.name AS category_name, u.name AS submitter_name, u.email AS submitter_email, u.nim AS submitter_nim
       FROM repositories r
       LEFT JOIN categories c ON c.id = r.category_id
       LEFT JOIN users u ON u.id = r.submitted_by
       WHERE r.status = 'pending'
       ORDER BY r.created_at ASC`
    );
    return res.json({ data: result.rows.map((row) => ({ ...row, status_label: mapStatusLabel(row.status) })) });
  } catch (error) { return next(error); }
});

router.get('/download/:fileName', async (req, res) => {
  try {
    let token = null;

    const authHeader = req.headers.authorization;

    if (authHeader?.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }

    if (!token && req.query.token) {
      token = req.query.token;
    }

    if (!token) {
      return res.status(401).json({ message: 'Silakan login untuk membuka dokumen.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');

    const userResult = await pool.query(
      'SELECT id, role FROM users WHERE id = $1',
      [decoded.id]
    );

    const user = userResult.rows[0];

    if (!user || !['mahasiswa', 'admin'].includes(user.role)) {
      return res.status(403).json({ message: 'Akses dokumen ditolak.' });
    }

    const objectPath = req.params.fileName;

    const repoResult = await pool.query(
      `SELECT id, file_name, file_path, status, submitted_by
       FROM repositories
       WHERE file_path = $1
       LIMIT 1`,
      [objectPath]
    );

    const repo = repoResult.rows[0];

    if (!repo) {
      return res.status(404).json({ message: 'Dokumen tidak ditemukan di database.' });
    }

    const isAdmin = user.role === 'admin';
    const isOwner = Number(repo.submitted_by) === Number(user.id);
    const isApproved = repo.status === 'approved';

    if (!isAdmin && !isOwner && !isApproved) {
      return res.status(403).json({ message: 'Dokumen belum dapat diakses.' });
    }

    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .createSignedUrl(repo.file_path, 60);

    if (error) {
      return res.status(404).json({
        message: `File tidak ditemukan di Supabase Storage: ${error.message}`
      });
    }

    const signedUrl = data?.signedUrl || data?.signedURL;

    if (!signedUrl) {
      return res.status(500).json({ message: 'Gagal membuat link dokumen.' });
    }

    return res.redirect(signedUrl);
  } catch (error) {
    return res.status(401).json({ message: 'Sesi tidak valid. Silakan login ulang.' });
  }
});

router.get('/:id', optionalAuth, async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT 
         r.*, 
         c.name AS category_name, 
         u.name AS submitter_name, 
         u.email AS submitter_email, 
         u.nim AS submitter_nim
       FROM repositories r
       LEFT JOIN categories c ON c.id = r.category_id
       LEFT JOIN users u ON u.id = r.submitted_by
       WHERE r.id = $1`,
      [req.params.id]
    );

    const repo = result.rows[0];

    if (!repo) {
      return res.status(404).json({ message: 'Repository tidak ditemukan.' });
    }

    const isAdmin = req.user?.role === 'admin';
    const isMahasiswa = req.user?.role === 'mahasiswa';
    const isOwner = req.user && repo.submitted_by === req.user.id;
    const isApproved = repo.status === 'approved';

    if (!isApproved && !isAdmin && !isOwner) {
      return res.status(403).json({ message: 'Repository belum dipublikasikan.' });
    }

    // Guest hanya dapat data terbatas
    if (!req.user) {
      return res.json({
        data: {
          id: repo.id,
          title: repo.title,
          research_year: repo.research_year,
          category_id: repo.category_id,
          category_name: repo.category_name
        }
      });
    }

    // Mahasiswa dan Admin dapat data lengkap
    if (isMahasiswa || isAdmin) {
      return res.json({
        data: {
          ...repo,
          status_label: mapStatusLabel(repo.status)
        }
      });
    }

    return res.status(403).json({ message: 'Akses ditolak.' });
  } catch (error) {
    return next(error);
  }
});

router.post('/', requireAuth(['mahasiswa', 'admin']), uploadPdf.single('document'), async (req, res, next) => {
  const client = await pool.connect();
  let uploadedStoragePath = null;

  try {
    const { title, abstract, research_date, advisor, author_name, category_id } = req.body;

    const isDraft = false;
    const finalTitle = title?.trim() || '';
    const finalDate = normalizeDate(research_date);

    // Jika mahasiswa yang upload, nama penulis otomatis dari akun login.
    // Jika admin yang input, nama penulis boleh dari form.
    const finalAuthorName = req.user.role === 'mahasiswa'
      ? req.user.name
      : (author_name || req.user.name);

    if (!isDraft) {
      if (!finalTitle) return res.status(400).json({ message: 'Judul Tugas Akhir wajib diisi.' });
      if (!finalDate) return res.status(400).json({ message: 'Tanggal Tugas Akhir wajib diisi.' });
      if (!abstract) return res.status(400).json({ message: 'Abstrak wajib diisi.' });
      if (!advisor) return res.status(400).json({ message: 'Dosen pembimbing wajib diisi.' });
      if (!finalAuthorName) return res.status(400).json({ message: 'Nama mahasiswa/penulis wajib diisi.' });
      if (!req.file) return res.status(400).json({ message: 'Dokumen PDF wajib diunggah.' });
    }

    if (req.file) {
      uploadedStoragePath = await uploadPdfToStorage(req.file);
    }

    await client.query('BEGIN');

    let finalCategoryId = category_id ? Number(category_id) : null;

    if (!finalCategoryId && !isDraft) {
      const detected = await categorizeRepository(client, finalTitle, abstract || '');
      finalCategoryId = detected?.category_id || null;
    }

    const status = isDraft ? 'draft' : (req.user.role === 'admin' ? 'approved' : 'pending');

    const result = await client.query(
      `INSERT INTO repositories
       (title, abstract, research_year, research_date, advisor, author_name, category_id, file_name, file_path, status, submitted_by, approved_by, approved_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
       RETURNING *`,
      [
        finalTitle,
        abstract || null,
        finalDate ? yearFromDate(finalDate) : null,
        finalDate,
        advisor || null,
        finalAuthorName,
        finalCategoryId,
        req.file?.originalname || null,
        uploadedStoragePath,
        status,
        req.user.id,
        status === 'approved' ? req.user.id : null,
        status === 'approved' ? new Date() : null
      ]
    );

    await client.query('COMMIT');

    return res.status(201).json({
      message: 'Tugas Akhir berhasil dikirim untuk verifikasi admin.',
      data: {
        ...result.rows[0],
        status_label: mapStatusLabel(status)
      }
    });
  } catch (error) {
    await client.query('ROLLBACK');

    if (uploadedStoragePath) {
      await deletePdfFromStorage(uploadedStoragePath);
    }

    return next(error);
  } finally {
    client.release();
  }
});

router.put('/:id', requireAuth(['admin']), async (req, res, next) => {
  try {
    const {
      title,
      abstract,
      research_date,
      advisor,
      author_name,
      category_id,
      status
    } = req.body;

    const finalTitle = title?.trim() || '';
    const finalDate = normalizeDate(research_date);
    const finalCategoryId =
      category_id === '' || category_id === null || category_id === undefined
        ? null
        : Number(category_id);

    const finalStatus = status || 'pending';
    const isApproved = finalStatus === 'approved';

    if (!finalTitle) {
      return res.status(400).json({ message: 'Judul Tugas Akhir wajib diisi.' });
    }

    if (!['draft', 'pending', 'approved', 'revision', 'rejected'].includes(finalStatus)) {
      return res.status(400).json({ message: 'Status repository tidak valid.' });
    }

    const result = await pool.query(
      `UPDATE repositories
       SET
         title = $1::text,
         abstract = $2::text,
         research_year = $3::integer,
         research_date = $4::date,
         advisor = COALESCE($5::text, advisor),
         author_name = COALESCE($6::text, author_name),
         category_id = $7::integer,
         status = $8::varchar,
         approved_by = CASE WHEN $10::boolean THEN $9::integer ELSE approved_by END,
         approved_at = CASE WHEN $10::boolean THEN CURRENT_TIMESTAMP ELSE approved_at END,
         updated_at = CURRENT_TIMESTAMP
       WHERE id = $11::integer
       RETURNING *`,
      [
        finalTitle,
        abstract || null,
        finalDate ? yearFromDate(finalDate) : null,
        finalDate,
        advisor || null,
        author_name || null,
        finalCategoryId,
        finalStatus,
        Number(req.user.id),
        isApproved,
        Number(req.params.id)
      ]
    );

    if (!result.rows[0]) {
      return res.status(404).json({ message: 'Repository tidak ditemukan.' });
    }

    return res.json({
      message: 'Repository berhasil diperbarui.',
      data: {
        ...result.rows[0],
        status_label: mapStatusLabel(result.rows[0].status)
      }
    });
  } catch (error) {
    return next(error);
  }
});

router.patch('/:id/verify', requireAuth(['admin']), async (req, res, next) => {
  try {
    const { status, rejection_note } = req.body;

    if (!['approved', 'rejected', 'revision'].includes(status)) {
      return res.status(400).json({ message: 'Status verifikasi tidak valid.' });
    }

    const isApproved = status === 'approved';

    const result = await pool.query(
      `UPDATE repositories
       SET 
         status = $1,
         rejection_note = $2,
         approved_by = CASE WHEN $5 THEN $3 ELSE approved_by END,
         approved_at = CASE WHEN $5 THEN CURRENT_TIMESTAMP ELSE approved_at END,
         updated_at = CURRENT_TIMESTAMP
       WHERE id = $4
       RETURNING *`,
      [
        status,
        rejection_note || null,
        req.user.id,
        req.params.id,
        isApproved
      ]
    );

    if (!result.rows[0]) {
      return res.status(404).json({ message: 'Repository tidak ditemukan.' });
    }

    return res.json({
      message: 'Status repository berhasil diperbarui.',
      data: {
        ...result.rows[0],
        status_label: mapStatusLabel(result.rows[0].status)
      }
    });
  } catch (error) {
    return next(error);
  }
});

router.delete('/:id', requireAuth(['admin']), async (req, res, next) => {
  try {
    const result = await pool.query(
      'DELETE FROM repositories WHERE id = $1 RETURNING file_path',
      [req.params.id]
    );

    if (!result.rows[0]) {
      return res.status(404).json({ message: 'Repository tidak ditemukan.' });
    }

    const filePath = result.rows[0].file_path;

    if (filePath) {
      await deletePdfFromStorage(filePath);
    }

    return res.json({ message: 'Repository berhasil dihapus.' });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
