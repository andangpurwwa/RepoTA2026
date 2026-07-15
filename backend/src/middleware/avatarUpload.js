const multer = require('multer');

const DEFAULT_MAX_AVATAR_SIZE_MB = 2;
const AVATAR_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
]);

function positiveNumber(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

const avatarUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    files: 1,
    fileSize:
      positiveNumber(
        process.env.MAX_AVATAR_SIZE_MB,
        DEFAULT_MAX_AVATAR_SIZE_MB
      ) *
      1024 *
      1024,
  },
  fileFilter: (req, file, callback) => {
    if (!AVATAR_MIME_TYPES.has(file.mimetype)) {
      const error = new Error(
        'Foto profil harus berformat JPG, PNG, atau WEBP.'
      );
      error.status = 400;
      error.code = 'INVALID_AVATAR_TYPE';
      return callback(error);
    }

    return callback(null, true);
  },
});

module.exports = avatarUpload;
