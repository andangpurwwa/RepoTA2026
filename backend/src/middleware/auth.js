const jwt = require('jsonwebtoken');
const pool = require('../config/db');

async function optionalAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      req.user = null;
      return next();
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    const result = await pool.query(
      'SELECT id, name, email, nim, role FROM users WHERE id = $1',
      [decoded.id]
    );

    req.user = result.rows[0] || null;
    return next();
  } catch (error) {
    req.user = null;
    return next();
  }
}

function requireAuth(allowedRoles = []) {
  return async (req, res, next) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Token tidak ditemukan. Silakan login.' });
      }

      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
      const result = await pool.query(
        'SELECT id, name, email, nim, role FROM users WHERE id = $1',
        [decoded.id]
      );

      const user = result.rows[0];
      if (!user) {
        return res.status(401).json({ message: 'User tidak valid.' });
      }

      if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
        return res.status(403).json({ message: 'Akses ditolak untuk role ini.' });
      }

      req.user = user;
      return next();
    } catch (error) {
      return res.status(401).json({ message: 'Token tidak valid atau sudah kedaluwarsa.' });
    }
  };
}

module.exports = { optionalAuth, requireAuth };
