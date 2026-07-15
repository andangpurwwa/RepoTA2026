const multer = require('multer');

const DEFAULT_MAX_FILE_SIZE_MB = 10;
const PDF_MIME_TYPES = new Set(['application/pdf']);

function positiveNumber(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

const uploadPdf = multer({
  storage: multer.memoryStorage(),
  limits: {
    files: 1,
    fileSize:
      positiveNumber(process.env.MAX_FILE_SIZE_MB, DEFAULT_MAX_FILE_SIZE_MB) *
      1024 *
      1024,
  },
  fileFilter: (req, file, callback) => {
    if (!PDF_MIME_TYPES.has(file.mimetype)) {
      const error = new Error('Dokumen harus berformat PDF.');
      error.status = 400;
      error.code = 'INVALID_PDF_TYPE';
      return callback(error);
    }

    return callback(null, true);
  },
});

module.exports = uploadPdf;
