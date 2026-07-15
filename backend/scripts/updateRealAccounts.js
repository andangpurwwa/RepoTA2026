require('dotenv').config();

const bcrypt = require('bcryptjs');
const pool = require('../src/config/db');

function required(name) {
  const value = String(process.env[name] || '').trim();
  if (!value) throw new Error(`${name} belum diisi pada backend/.env.`);
  return value;
}

async function upsertAccount(client, {
  name,
  email,
  nim,
  password,
  role,
}) {
  const passwordHash = await bcrypt.hash(password, 12);

  const result = await client.query(
    `INSERT INTO users (name, email, nim, password_hash, role)
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (email)
     DO UPDATE SET
       name = EXCLUDED.name,
       nim = EXCLUDED.nim,
       password_hash = EXCLUDED.password_hash,
       role = EXCLUDED.role,
       updated_at = CURRENT_TIMESTAMP
     RETURNING id, name, email, nim, role`,
    [name, email.toLowerCase(), nim || null, passwordHash, role]
  );

  return result.rows[0];
}

async function main() {
  if (String(process.env.CONFIRM_ACCOUNT_UPDATE || '').toLowerCase() !== 'yes') {
    throw new Error(
      'Script dibatalkan. Isi CONFIRM_ACCOUNT_UPDATE=yes hanya saat benar-benar ingin memperbarui akun.'
    );
  }

  const admin = {
    name: required('REAL_ADMIN_NAME'),
    email: required('REAL_ADMIN_EMAIL'),
    nim: null,
    password: required('REAL_ADMIN_PASSWORD'),
    role: 'admin',
  };

  const student = {
    name: required('REAL_STUDENT_NAME'),
    email: required('REAL_STUDENT_EMAIL'),
    nim: required('REAL_STUDENT_NIM'),
    password: required('REAL_STUDENT_PASSWORD'),
    role: 'mahasiswa',
  };

  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    const adminResult = await upsertAccount(client, admin);
    const studentResult = await upsertAccount(client, student);
    await client.query('COMMIT');

    console.log('Akun berhasil diperbarui.');
    console.table([adminResult, studentResult]);
    console.log('Password tidak ditampilkan pada log.');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((error) => {
  console.error('Gagal memperbarui akun:', error.message);
  process.exitCode = 1;
});
