const express = require('express');
const pool = require('../config/db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.get('/students', requireAuth(['admin']), async (req, res, next) => {
  try {
    const { search = '' } = req.query;
    const params = [];
    let where = `WHERE u.role = 'mahasiswa'`;

    if (search) {
      params.push(`%${search}%`);
      where += ` AND (LOWER(u.name) LIKE LOWER($1) OR LOWER(u.email) LIKE LOWER($1) OR LOWER(COALESCE(u.nim, '')) LIKE LOWER($1))`;
    }

    const result = await pool.query(
      `SELECT
        u.id,
        u.name,
        u.email,
        u.nim,
        u.created_at,
        COUNT(r.id)::int AS total_upload,
        COUNT(r.id) FILTER (WHERE r.status = 'draft')::int AS total_draft,
        COUNT(r.id) FILTER (WHERE r.status = 'pending')::int AS total_pending,
        COUNT(r.id) FILTER (WHERE r.status = 'approved')::int AS total_approved,
        COUNT(r.id) FILTER (WHERE r.status = 'rejected')::int AS total_rejected,
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
