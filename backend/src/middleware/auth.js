const jwt = require('jsonwebtoken');
const pool = require('../config/db');

const USER_QUERY = `
  SELECT
    id,
    name,
    email,
    nim,
    role,
    profile_photo_url
  FROM users
  WHERE id = $1
  LIMIT 1
`;

function getJwtSecret() {
  const secret = String(process.env.JWT_SECRET || '').trim();

  if (!secret) {
    const error = new Error('JWT_SECRET belum dikonfigurasi pada backend.');
    error.status = 500;
    throw error;
  }

  return secret;
}

function readBearerToken(req) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  return authHeader.slice(7).trim() || null;
}

async function findAuthenticatedUser(token) {
  const decoded = jwt.verify(token, getJwtSecret());
  const result = await pool.query(USER_QUERY, [decoded.id]);
  return result.rows[0] || null;
}

async function optionalAuth(req, res, next) {
  const token = readBearerToken(req);

  if (!token) {
    req.user = null;
    return next();
  }

  try {
    req.user = await findAuthenticatedUser(token);
  } catch {
    req.user = null;
  }

  return next();
}

function requireAuth(allowedRoles = []) {
  return async (req, res, next) => {
    const token = readBearerToken(req);

    if (!token) {
      return res.status(401).json({
        message: 'Token tidak ditemukan. Silakan login.',
      });
    }

    try {
      const user = await findAuthenticatedUser(token);

      if (!user) {
        return res.status(401).json({ message: 'User tidak valid.' });
      }

      if (
        allowedRoles.length > 0 &&
        !allowedRoles.includes(user.role)
      ) {
        return res.status(403).json({
          message: 'Akses ditolak untuk role ini.',
        });
      }

      req.user = user;
      return next();
    } catch (error) {
      if (error.message === 'JWT_SECRET belum dikonfigurasi pada backend.') {
        return next(error);
      }

      return res.status(401).json({
        message: 'Token tidak valid atau sudah kedaluwarsa.',
      });
    }
  };
}

module.exports = {
  optionalAuth,
  requireAuth,
};
