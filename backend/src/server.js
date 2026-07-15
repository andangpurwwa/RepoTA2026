require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const multer = require('multer');

const authRoutes = require('./routes/auth.routes');
const repositoryRoutes = require('./routes/repository.routes');
const categoryRoutes = require('./routes/category.routes');
const keywordRoutes = require('./routes/keyword.routes');
const similarityRoutes = require('./routes/similarity.routes');
const statsRoutes = require('./routes/stats.routes');
const userRoutes = require('./routes/user.routes');
const docsRoutes = require('./routes/docs.routes');

const app = express();
const PORT = Number(process.env.PORT) || 5000;

app.disable('x-powered-by');
app.set('trust proxy', 1);

app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);

const defaultLocalOrigins = [
  'http://localhost:4173',
  'http://127.0.0.1:4173',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5174',
  'http://localhost:5175',
  'http://127.0.0.1:5175',
];

const allowedOrigins = new Set([
  ...defaultLocalOrigins,
  ...String(process.env.CLIENT_URL || '')
    .split(',')
    .map((origin) => origin.trim().replace(/\/$/, ''))
    .filter(Boolean),
]);

function isAllowedOrigin(origin) {
  if (!origin) return true;

  const normalizedOrigin = origin.replace(/\/$/, '');
  if (allowedOrigins.has(normalizedOrigin)) return true;

  if (process.env.NODE_ENV !== 'production') {
    return /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(
      normalizedOrigin
    );
  }

  return false;
}

app.use(
  cors({
    origin: (origin, callback) => {
      if (isAllowedOrigin(origin)) return callback(null, true);
      return callback(
        new Error(`CORS blocked for origin: ${origin}`)
      );
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

app.get('/', (req, res) => {
  res.json({
    app: 'RepoTA API',
    status: 'running',
    health: '/api/health',
    docs: '/api/docs',
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

app.use('/api/docs', docsRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/repositories', repositoryRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/keywords', keywordRoutes);
app.use('/api/similarity', similarityRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/users', userRoutes);

app.use((req, res) => {
  res.status(404).json({ message: 'Endpoint tidak ditemukan.' });
});

app.use((error, req, res, next) => {
  if (res.headersSent) return next(error);

  console.error(error);

  if (error.message?.startsWith('CORS blocked for origin:')) {
    return res.status(403).json({
      message:
        'Akses frontend diblokir CORS. Periksa CLIENT_URL pada backend/.env.',
    });
  }

  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      const isAvatarUpload = req.originalUrl.includes('/users/me/photo');
      const maxSize = isAvatarUpload
        ? process.env.MAX_AVATAR_SIZE_MB || 2
        : process.env.MAX_FILE_SIZE_MB || 10;

      return res.status(400).json({
        message: isAvatarUpload
          ? `Ukuran foto profil maksimal ${maxSize} MB.`
          : `Ukuran dokumen maksimal ${maxSize} MB.`,
      });
    }

    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        message: 'Hanya satu file yang dapat diunggah.',
      });
    }

    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        message: 'Nama field upload tidak sesuai dengan konfigurasi server.',
      });
    }

    return res.status(400).json({
      message: error.message || 'Upload file gagal.',
    });
  }

  if (
    error.code === 'INVALID_PDF_TYPE' ||
    error.code === 'INVALID_AVATAR_TYPE'
  ) {
    return res.status(error.status || 400).json({ message: error.message });
  }

  const status = Number(error.status) || 500;
  const response = {
    message: error.message || 'Terjadi kesalahan pada server.',
  };

  if (
    process.env.NODE_ENV !== 'production' &&
    Array.isArray(error.details)
  ) {
    response.details = error.details;
  }

  return res.status(status).json(response);
});

if (require.main === module) {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`RepoTA API berjalan di http://0.0.0.0:${PORT}`);
  });
}

module.exports = app;
