const express = require('express');
const pool = require('../config/db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT c.*, COUNT(r.id)::int AS repository_count
       FROM categories c
       LEFT JOIN repositories r ON r.category_id = c.id AND r.status = 'approved'
       GROUP BY c.id
       ORDER BY c.name ASC`
    );
    return res.json({ data: result.rows });
  } catch (error) {
    return next(error);
  }
});

router.post('/', requireAuth(['admin']), async (req, res, next) => {
  try {
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ message: 'Nama kategori wajib diisi.' });

    const result = await pool.query(
      'INSERT INTO categories (name, description) VALUES ($1, $2) RETURNING *',
      [name, description || null]
    );
    return res.status(201).json({ message: 'Kategori berhasil ditambahkan.', data: result.rows[0] });
  } catch (error) {
    if (error.code === '23505') return res.status(409).json({ message: 'Nama kategori sudah ada.' });
    return next(error);
  }
});

router.put('/:id', requireAuth(['admin']), async (req, res, next) => {
  try {
    const { name, description } = req.body;
    const result = await pool.query(
      `UPDATE categories SET name = COALESCE($1, name), description = COALESCE($2, description)
       WHERE id = $3 RETURNING *`,
      [name || null, description || null, req.params.id]
    );
    if (!result.rows[0]) return res.status(404).json({ message: 'Kategori tidak ditemukan.' });
    return res.json({ message: 'Kategori berhasil diperbarui.', data: result.rows[0] });
  } catch (error) {
    if (error.code === '23505') return res.status(409).json({ message: 'Nama kategori sudah ada.' });
    return next(error);
  }
});

router.delete('/:id', requireAuth(['admin']), async (req, res, next) => {
  try {
    const result = await pool.query('DELETE FROM categories WHERE id = $1 RETURNING id', [req.params.id]);
    if (!result.rows[0]) return res.status(404).json({ message: 'Kategori tidak ditemukan.' });
    return res.json({ message: 'Kategori berhasil dihapus.' });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
