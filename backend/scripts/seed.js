const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const pool = require('../src/config/db');

async function ensureSchema(client) {
  const schemaPath = path.join(__dirname, '../database/schema.sql');
  const schema = fs.readFileSync(schemaPath, 'utf8');
  await client.query(schema);
}

async function upsertUser(client, { name, email, nim, password, role }) {
  const hash = await bcrypt.hash(password, 10);
  const result = await client.query(
    `INSERT INTO users (name, email, nim, password_hash, role)
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (email) DO UPDATE SET
       name = EXCLUDED.name,
       nim = EXCLUDED.nim,
       password_hash = EXCLUDED.password_hash,
       role = EXCLUDED.role
     RETURNING id`,
    [name, email, nim || null, hash, role]
  );
  return result.rows[0].id;
}

async function upsertCategory(client, name, description) {
  const result = await client.query(
    `INSERT INTO categories (name, description)
     VALUES ($1, $2)
     ON CONFLICT (name) DO UPDATE SET description = EXCLUDED.description
     RETURNING id`,
    [name, description]
  );
  return result.rows[0].id;
}

async function upsertKeyword(client, keyword, categoryId) {
  await client.query(
    `INSERT INTO keywords (keyword, category_id)
     VALUES ($1, $2)
     ON CONFLICT (keyword, category_id) DO NOTHING`,
    [keyword, categoryId]
  );
}

async function seed() {
  const client = await pool.connect();
  try {
    await ensureSchema(client);
    await client.query('BEGIN');

    const adminId = await upsertUser(client, { name: 'Admin Prodi SI', email: 'admin.repota.prodi@gmail.com', nim: null, password: 'admin123', role: 'admin' });
    await upsertUser(client, { name: 'Admin RepoTA Lama', email: 'admin@repota.test', nim: null, password: 'admin123', role: 'admin' });
    const mahasiswaId = await upsertUser(client, { name: 'Mahasiswa Demo', email: '2300016106@webmail.uad.ac.id', nim: '2300016106', password: 'mhs123', role: 'mahasiswa' });
    await upsertUser(client, { name: 'Mahasiswa Demo Lama', email: 'mahasiswa@repota.test', nim: '2300016999', password: 'mhs123', role: 'mahasiswa' });
    const mahasiswa2Id = await upsertUser(client, { name: 'Nadia Safitri', email: '2300016107@webmail.uad.ac.id', nim: '2300016107', password: 'mhs123', role: 'mahasiswa' });

    const categorySeeds = {
      'Sistem Informasi': 'Penelitian tentang sistem informasi, proses bisnis, dashboard, dan implementasi sistem.',
      'Data Mining': 'Penelitian terkait clustering, klasifikasi, prediksi, dan analisis data.',
      'Artificial Intelligence': 'Penelitian terkait kecerdasan buatan, machine learning, NLP, dan chatbot.',
      'E-Business': 'Penelitian terkait bisnis digital, e-commerce, marketplace, dan layanan online.',
      'Software Engineering': 'Penelitian terkait pengembangan perangkat lunak, testing, dan arsitektur aplikasi.',
      'Internet of Things': 'Penelitian terkait sensor, perangkat pintar, monitoring, dan otomasi berbasis IoT.',
      'Cyber Security': 'Penelitian terkait keamanan sistem, audit, enkripsi, dan mitigasi risiko keamanan.',
      'UI/UX Design': 'Penelitian terkait pengalaman pengguna, usability testing, dan desain antarmuka.',
      'Decision Support System': 'Penelitian terkait sistem pendukung keputusan, SAW, TOPSIS, AHP, dan metode sejenis.',
      'Business Intelligence': 'Penelitian terkait dashboard BI, visualisasi data, dan analisis performa bisnis.',
      'E-Learning': 'Penelitian terkait pembelajaran digital, LMS, Google Classroom, dan teknologi pendidikan.',
      'Enterprise Resource Planning': 'Penelitian terkait ERP, Odoo, proses bisnis, inventaris, POS, dan purchase.',
      'Mobile Application': 'Penelitian terkait aplikasi Android/iOS, mobile commerce, dan layanan mobile.',
      'Web Development': 'Penelitian terkait pengembangan aplikasi web, frontend, backend, dan API.',
      'Database Management': 'Penelitian terkait basis data, optimasi query, data warehouse, dan manajemen data.'
    };
    const categories = {};
    for (const [name, description] of Object.entries(categorySeeds)) {
      categories[name] = await upsertCategory(client, name, description);
    }

    const keywordMap = {
      'Sistem Informasi': ['sistem informasi', 'proses bisnis', 'dashboard', 'repository', 'manajemen data'],
      'Data Mining': ['data mining', 'clustering', 'klasifikasi', 'prediksi', 'association rule'],
      'Artificial Intelligence': ['artificial intelligence', 'machine learning', 'deep learning', 'nlp', 'chatbot'],
      'E-Business': ['e-business', 'e-commerce', 'marketplace', 'digital business', 'transaksi online'],
      'Software Engineering': ['software engineering', 'pengujian perangkat lunak', 'testing', 'arsitektur aplikasi'],
      'Internet of Things': ['iot', 'internet of things', 'sensor', 'monitoring', 'otomasi'],
      'Cyber Security': ['cyber security', 'keamanan', 'enkripsi', 'audit keamanan', 'vulnerability'],
      'UI/UX Design': ['ui ux', 'usability', 'user experience', 'antarmuka', 'wireframe'],
      'Decision Support System': ['spk', 'sistem pendukung keputusan', 'saw', 'topsis', 'ahp'],
      'Business Intelligence': ['business intelligence', 'bi dashboard', 'visualisasi data', 'kpi', 'power bi'],
      'E-Learning': ['e-learning', 'lms', 'google classroom', 'pembelajaran digital', 'moodle'],
      'Enterprise Resource Planning': ['erp', 'odoo', 'inventaris', 'point of sale', 'purchase'],
      'Mobile Application': ['mobile', 'android', 'ios', 'flutter', 'react native'],
      'Web Development': ['web', 'react', 'node js', 'express', 'api'],
      'Database Management': ['database', 'postgresql', 'mysql', 'data warehouse', 'query']
    };
    for (const [categoryName, words] of Object.entries(keywordMap)) for (const word of words) await upsertKeyword(client, word, categories[categoryName]);

    const repos = [
      ['Pengembangan Dashboard Repository Tugas Akhir Berbasis Web pada Program Studi Sistem Informasi', 'Penelitian ini membangun sistem repository tugas akhir yang menyediakan pencarian, filter kategori, dan dashboard statistik penelitian mahasiswa.', '2026-06-10', 'Dr. Budi Santoso, M.Kom.', 'Mahasiswa Demo', 'Sistem Informasi', 'approved', mahasiswaId],
      ['Analisis Tren Topik Penelitian Mahasiswa Menggunakan Metode Clustering K-Means', 'Penelitian ini menganalisis tren topik penelitian mahasiswa melalui teknik data mining dan visualisasi dashboard.', '2025-11-15', 'Dr. Siti Rahma, M.Cs.', 'Nadia Safitri', 'Data Mining', 'approved', mahasiswa2Id],
      ['Implementasi Similarity Check Judul Tugas Akhir Menggunakan Cosine Similarity', 'Sistem dikembangkan untuk mengecek kemiripan judul tugas akhir agar mahasiswa dapat mengevaluasi keunikan usulan penelitian.', '2025-08-21', 'Dr. Ahmad Fauzi, M.Kom.', 'Rizky Ananda', 'Artificial Intelligence', 'approved', mahasiswaId],
      ['Perancangan Sistem Informasi Pengelolaan Repository Akademik Berbasis Rule-Based Categorization', 'Penelitian ini merancang sistem pengelompokan repository akademik berdasarkan keyword yang dikelola oleh admin.', '2024-12-05', 'Dr. Rina Pratiwi, M.Kom.', 'Dewi Anggraeni', 'Software Engineering', 'approved', mahasiswa2Id],
      ['Analisis Penerapan E-Business pada Layanan Repository Digital Perguruan Tinggi', 'Penelitian ini membahas penerapan konsep e-business pada layanan repository digital untuk meningkatkan akses referensi akademik.', '2023-09-18', 'Dr. Hendra Wijaya, M.M.', 'Fajar Ramadhan', 'E-Business', 'approved', mahasiswaId],
      ['Pengembangan Aplikasi Upload Dokumen Tugas Akhir Menggunakan React dan Express', 'Penelitian ini mengembangkan fitur upload dokumen dan alur verifikasi admin untuk repository tugas akhir mahasiswa.', '2026-07-01', 'Dr. Lina Marlina, M.Cs.', 'Mahasiswa Demo', 'Software Engineering', 'pending', mahasiswaId],
      ['Rancang Bangun Sistem Monitoring Suhu Ruang Server Berbasis Internet of Things', 'Penelitian ini membangun monitoring suhu ruang server menggunakan sensor IoT dan dashboard realtime.', '2024-07-12', 'Dr. Heru Nugroho, M.Kom.', 'Andi Pratama', 'Internet of Things', 'approved', mahasiswa2Id],
      ['Evaluasi Usability Portal Akademik Menggunakan Metode System Usability Scale', 'Penelitian ini mengevaluasi pengalaman pengguna portal akademik menggunakan metode SUS dan rekomendasi UI/UX.', '2025-04-20', 'Dr. Rina Pratiwi, M.Kom.', 'Salsa Aulia', 'UI/UX Design', 'approved', mahasiswaId],
      ['Sistem Pendukung Keputusan Pemilihan Topik Tugas Akhir Menggunakan Metode TOPSIS', 'Penelitian ini mengembangkan SPK untuk membantu mahasiswa memilih topik Tugas Akhir berdasarkan kriteria akademik.', '2026-02-17', 'Dr. Ahmad Fauzi, M.Kom.', 'Bagas Saputra', 'Decision Support System', 'approved', mahasiswa2Id],
      ['Dashboard Business Intelligence untuk Analisis Kinerja Layanan Akademik', 'Penelitian ini merancang dashboard BI untuk memantau kinerja layanan akademik dan visualisasi indikator utama.', '2024-03-09', 'Dr. Siti Rahma, M.Cs.', 'Mira Wulandari', 'Business Intelligence', 'approved', mahasiswaId]
    ];

    for (const repo of repos) {
      const [title, abstract, researchDate, advisor, author, category, status, submittedBy] = repo;
      const isApproved = status === 'approved';
      await client.query(
        `INSERT INTO repositories
         (title, abstract, research_year, research_date, advisor, author_name, category_id, status, submitted_by, approved_by, approved_at)
         SELECT $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,CASE WHEN $11::boolean THEN CURRENT_TIMESTAMP ELSE NULL END
         WHERE NOT EXISTS (SELECT 1 FROM repositories WHERE title = $1)`,
        [title, abstract, new Date(researchDate).getFullYear(), researchDate, advisor, author, categories[category], status, submittedBy, isApproved ? adminId : null, isApproved]
      );
    }
    await client.query('COMMIT');
    console.log('Seed data berhasil dibuat.');
    console.log('Admin: admin.repota.prodi@gmail.com / admin123');
    console.log('Mahasiswa: 2300016106@webmail.uad.ac.id / mhs123');
  } catch (error) {
    try { await client.query('ROLLBACK'); } catch (_) {}
    console.error('Gagal seed database:', error.message);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}
seed();
