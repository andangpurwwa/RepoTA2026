require('dotenv').config();

const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const email = process.env.ADMIN_EMAIL || 'repository.ta.uad@gmail.com';
const password = process.env.ADMIN_PASSWORD;

if (!password || password.length < 8) {
  console.error('ADMIN_PASSWORD wajib diisi dan minimal 8 karakter.');
  process.exit(1);
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('supabase.co')
    ? { rejectUnauthorized: false }
    : false,
});

async function main() {
  const hash = await bcrypt.hash(password, 10);

  const { rows: columns } = await pool.query(`
    select column_name
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'users'
  `);

  const cols = new Set(columns.map((c) => c.column_name));

  const passwordCol = cols.has('password_hash')
    ? 'password_hash'
    : cols.has('password')
    ? 'password'
    : null;

  if (!passwordCol) {
    throw new Error('Kolom password tidak ditemukan. Cek tabel users.');
  }

  const nameCol = cols.has('name')
    ? 'name'
    : cols.has('full_name')
    ? 'full_name'
    : null;

  const now = new Date();

  const data = {};

  if (cols.has('email')) data.email = email;
  if (nameCol) data[nameCol] = 'Admin RepoTA';
  if (cols.has('role')) data.role = 'admin';
  if (cols.has('nim')) data.nim = 'ADMIN-REPO-TA';
  if (cols.has('is_active')) data.is_active = true;
  if (cols.has(passwordCol)) data[passwordCol] = hash;
  if (cols.has('updated_at')) data.updated_at = now;

  const existing = await pool.query('select * from users where email = $1 limit 1', [email]);

  if (existing.rowCount > 0) {
    const entries = Object.entries(data).filter(([key]) => key !== 'email');
    const setSql = entries.map(([key], i) => `${key} = $${i + 2}`).join(', ');
    const values = [email, ...entries.map(([, value]) => value)];

    await pool.query(`update users set ${setSql} where email = $1`, values);
    console.log(`Admin berhasil diperbarui: ${email}`);
  } else {
    if (cols.has('created_at')) data.created_at = now;

    const entries = Object.entries(data);
    const keys = entries.map(([key]) => key).join(', ');
    const placeholders = entries.map((_, i) => `$${i + 1}`).join(', ');
    const values = entries.map(([, value]) => value);

    await pool.query(`insert into users (${keys}) values (${placeholders})`, values);
    console.log(`Admin berhasil dibuat: ${email}`);
  }

  await pool.end();
}

main().catch(async (err) => {
  console.error(err.message);
  await pool.end();
  process.exit(1);
});
