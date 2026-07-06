const express = require('express');
const pool = require('../config/db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.get('/', requireAuth(['admin']), async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT k.*, c.name AS category_name
       FROM keywords k
       JOIN categories c ON c.id = k.category_id
       ORDER BY c.name ASC, k.keyword ASC`
    );
    return res.json({ data: result.rows });
  } catch (error) {
    return next(error);
  }
});

router.post('/', requireAuth(['admin']), async (req, res, next) => {
  try {
    const { keyword, category_id } = req.body;
    if (!keyword || !category_id) {
      return res.status(400).json({ message: 'Keyword dan kategori wajib diisi.' });
    }

    const result = await pool.query(
      'INSERT INTO keywords (keyword, category_id) VALUES ($1, $2) RETURNING *',
      [keyword, Number(category_id)]
    );
    return res.status(201).json({ message: 'Keyword berhasil ditambahkan.', data: result.rows[0] });
  } catch (error) {
    if (error.code === '23505') return res.status(409).json({ message: 'Keyword pada kategori tersebut sudah ada.' });
    return next(error);
  }
});

router.put('/:id', requireAuth(['admin']), async (req, res, next) => {
  try {
    const { keyword, category_id } = req.body;
    const result = await pool.query(
      `UPDATE keywords
       SET keyword = COALESCE($1, keyword), category_id = COALESCE($2, category_id)
       WHERE id = $3 RETURNING *`,
      [keyword || null, category_id ? Number(category_id) : null, req.params.id]
    );
    if (!result.rows[0]) return res.status(404).json({ message: 'Keyword tidak ditemukan.' });
    return res.json({ message: 'Keyword berhasil diperbarui.', data: result.rows[0] });
  } catch (error) {
    if (error.code === '23505') return res.status(409).json({ message: 'Keyword pada kategori tersebut sudah ada.' });
    return next(error);
  }
});

router.delete('/:id', requireAuth(['admin']), async (req, res, next) => {
  try {
    const result = await pool.query('DELETE FROM keywords WHERE id = $1 RETURNING id', [req.params.id]);
    if (!result.rows[0]) return res.status(404).json({ message: 'Keyword tidak ditemukan.' });
    return res.json({ message: 'Keyword berhasil dihapus.' });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
