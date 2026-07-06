const fs = require('fs');
const path = require('path');
const pool = require('../src/config/db');

async function setup() {
  try {
    const schemaPath = path.join(__dirname, '../database/schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    await pool.query(schema);
    console.log('Database schema berhasil dibuat/diperbarui.');
  } catch (error) {
    console.error('Gagal setup database:', error.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

setup();
