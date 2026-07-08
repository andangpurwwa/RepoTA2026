const express = require('express');
const pool = require('../config/db');
const { requireAuth } = require('../middleware/auth');
const { similarityPercent, interpretSimilarity } = require('../utils/similarity');

const router = express.Router();

router.post('/check', requireAuth(['mahasiswa', 'admin']), async (req, res, next) => {
  try {
    const { title } = req.body;
    if (!title) return res.status(400).json({ message: 'Judul usulan wajib diisi.' });

    const result = await pool.query(
      `SELECT r.id, r.title, r.research_year, r.research_date, c.name AS category_name
       FROM repositories r
       LEFT JOIN categories c ON c.id = r.category_id
       WHERE r.status = 'approved'`
    );

    const ranked = result.rows
      .map((row) => {
        const score = similarityPercent(title, row.title);
        return { ...row, similarity: score, interpretation: interpretSimilarity(score) };
      })
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 10);

    const topScore = ranked[0]?.similarity || 0;

    return res.json({
      query_title: title,
      top_score: topScore,
      interpretation: interpretSimilarity(topScore),
      data: ranked
    });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
