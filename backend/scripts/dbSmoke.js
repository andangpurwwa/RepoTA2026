require('dotenv').config();

const pool = require('../src/config/db');

async function main() {
  try {
    const result = await pool.query(`
      SELECT
        EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_schema = 'public'
            AND table_name = 'users'
            AND column_name = 'profile_photo_url'
        ) AS has_profile_photo_url,
        EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_schema = 'public'
            AND table_name = 'users'
            AND column_name = 'profile_photo_path'
        ) AS has_profile_photo_path,
        to_regclass('public.password_reset_otps') IS NOT NULL AS has_otp_table,
        to_regclass('public.repository_verification_logs') IS NOT NULL AS has_audit_table
    `);

    const checks = result.rows[0];
    const failed = Object.entries(checks)
      .filter(([, value]) => value !== true)
      .map(([key]) => key);

    if (failed.length > 0) {
      throw new Error(
        `Schema belum lengkap: ${failed.join(', ')}. Jalankan npm run db:migrate.`
      );
    }

    await pool.query('SELECT 1');
    console.log('DB SMOKE LULUS: koneksi dan schema utama tersedia.');
  } catch (error) {
    console.error('DB SMOKE GAGAL:', error.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

main();
