const multer = require('multer');

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (file.mimetype !== 'application/pdf') {
    return cb(new Error('File harus berformat PDF.'));
  }

  return cb(null, true);
};

const uploadPdf = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: Number(process.env.MAX_FILE_SIZE_MB || 10) * 1024 * 1024
  }
});

module.exports = uploadPdf;
