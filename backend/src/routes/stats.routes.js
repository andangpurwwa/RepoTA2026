const express = require('express');
const pool = require('../config/db');
const { requireAuth } = require('../middleware/auth');
const router = express.Router();

router.get('/overview', requireAuth(['admin']), async (req, res, next) => {
  try {
    const [total, status, byCategory, byYear, latestPending, students, uploadedStudents] = await Promise.all([
      pool.query(`SELECT COUNT(*)::int AS total FROM repositories WHERE status <> 'draft'`),
      pool.query(`SELECT status, COUNT(*)::int AS total FROM repositories GROUP BY status`),
      pool.query(`SELECT COALESCE(c.name,'Tanpa Kategori') AS name, COUNT(r.id)::int AS total FROM repositories r LEFT JOIN categories c ON c.id=r.category_id WHERE r.status='approved' GROUP BY c.name ORDER BY total DESC`),
      pool.query(`SELECT research_year AS year, COUNT(*)::int AS total FROM repositories WHERE status='approved' GROUP BY research_year ORDER BY research_year ASC`),
      pool.query(`SELECT r.id,r.title,r.research_year,r.research_date,u.name AS submitter_name,r.created_at,r.file_name,r.file_path FROM repositories r LEFT JOIN users u ON u.id=r.submitted_by WHERE r.status='pending' ORDER BY r.created_at ASC LIMIT 5`),
      pool.query(`SELECT id,name,email,nim,created_at FROM users WHERE role='mahasiswa' ORDER BY name ASC`),
      pool.query(`SELECT u.id,u.name,u.email,u.nim,COUNT(r.id)::int AS upload_count,MAX(r.created_at) AS last_upload_at FROM users u LEFT JOIN repositories r ON r.submitted_by=u.id AND r.status <> 'draft' WHERE u.role='mahasiswa' GROUP BY u.id ORDER BY upload_count DESC,u.name ASC LIMIT 10`)
    ]);
    const counts = status.rows.reduce((acc, row) => ({ ...acc, [row.status]: row.total }), { draft: 0, pending: 0, approved: 0, rejected: 0, revision: 0 });
    return res.json({ data: {
      total_repository: total.rows[0].total,
      total_draft: counts.draft || 0,
      total_pending: counts.pending || 0,
      total_approved: counts.approved || 0,
      total_rejected: counts.rejected || 0,
      total_revision: counts.revision || 0,
      total_students: students.rows.length,
      total_students_uploaded: uploadedStudents.rows.filter((item) => item.upload_count > 0).length,
      by_category: byCategory.rows,
      by_year: byYear.rows,
      latest_pending: latestPending.rows,
      students: students.rows,
      uploaded_students: uploadedStudents.rows
    } });
  } catch (error) { return next(error); }
});
module.exports = router;
