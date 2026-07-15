require('dotenv').config();

const { verifyMailConnection } = require('../src/utils/mailer');

async function main() {
  try {
    await verifyMailConnection();
    console.log('MAIL CHECK LULUS: koneksi SMTP berhasil.');
  } catch (error) {
    console.error('MAIL CHECK GAGAL:', error.message);
    process.exitCode = 1;
  }
}

main();
