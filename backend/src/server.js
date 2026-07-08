const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const authRoutes = require('./routes/auth.routes');
const repositoryRoutes = require('./routes/repository.routes');
const categoryRoutes = require('./routes/category.routes');
const keywordRoutes = require('./routes/keyword.routes');
const similarityRoutes = require('./routes/similarity.routes');
const statsRoutes = require('./routes/stats.routes');
const userRoutes = require('./routes/user.routes');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet({ crossOriginResourcePolicy: false }));

const defaultLocalOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5174',
  'http://localhost:5175',
  'http://127.0.0.1:5175'
];

const allowedOrigins = new Set([
  ...defaultLocalOrigins,
  ...(process.env.CLIENT_URL || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean)
]);

function isAllowedOrigin(origin) {
  if (!origin) return true;
  if (allowedOrigins.has(origin)) return true;

  if (process.env.NODE_ENV !== 'production') {
    return /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin);
  }

  return false;
}

app.use(cors({
  origin: (origin, callback) => {
    if (isAllowedOrigin(origin)) return callback(null, true);
    return callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true
}));

app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

app.get('/', (req, res) => {
  res.json({
    app: 'RepoTA API',
    status: 'running',
    docs: '/api/health'
  });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

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
  console.error(error);

  if (error.message?.startsWith('CORS blocked for origin:')) {
    return res.status(403).json({
      message: 'Akses frontend diblokir CORS. Periksa CLIENT_URL di backend/.env atau gunakan localhost port 5173/5174.'
    });
  }

  if (error.message === 'File harus berformat PDF.') {
    return res.status(400).json({ message: error.message });
  }

  if (error.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ message: 'Ukuran file maksimal 10 MB.' });
  }

  return res.status(error.status || 500).json({
    message: error.message || 'Terjadi kesalahan pada server.'
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`RepoTA API berjalan di http://0.0.0.0:${PORT}`);
});
