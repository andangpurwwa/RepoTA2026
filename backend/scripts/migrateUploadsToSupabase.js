const fs = require('fs');
const path = require('path');
require('dotenv').config();

const pool = require('../src/config/db');
const supabase = require('../src/config/supabase');

const STORAGE_BUCKET = process.env.SUPABASE_STORAGE_BUCKET || 'repota-documents';
const uploadsDir = path.join(__dirname, '../uploads');

function isAlreadyStoragePath(filePath) {
  return filePath && filePath.startsWith('repositories/');
}

async function main() {
  console.log('Mulai migrasi file PDF lokal ke Supabase Storage...');

  const result = await pool.query(
    `SELECT id, file_name, file_path
     FROM repositories
     WHERE file_path IS NOT NULL
     ORDER BY id ASC`
  );

  for (const repo of result.rows) {
    if (!repo.file_path) continue;

    if (isAlreadyStoragePath(repo.file_path)) {
      console.log(`SKIP ID ${repo.id}: sudah memakai storage path.`);
      continue;
    }

    const localPath = path.join(uploadsDir, repo.file_path);

    if (!fs.existsSync(localPath)) {
      console.warn(`SKIP ID ${repo.id}: file lokal tidak ditemukan: ${localPath}`);
      continue;
    }

    const fileBuffer = fs.readFileSync(localPath);
    const safeName = repo.file_path.replace(/[^a-zA-Z0-9.\-_]/g, '-');
    const objectPath = `repositories/migrated-${Date.now()}-${repo.id}-${safeName}`;

    console.log(`UPLOAD ID ${repo.id}: ${repo.file_path} -> ${objectPath}`);

    const { error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(objectPath, fileBuffer, {
        contentType: 'application/pdf',
        upsert: false
      });

    if (error) {
      console.error(`GAGAL ID ${repo.id}: ${error.message}`);
      continue;
    }

    await pool.query(
      `UPDATE repositories
       SET file_path = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2`,
      [objectPath, repo.id]
    );

    console.log(`SUKSES ID ${repo.id}`);
  }

  await pool.end();
  console.log('Migrasi selesai.');
}

main().catch(async (error) => {
  console.error(error);
  await pool.end();
  process.exit(1);
});
