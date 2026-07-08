const nodemailer = require('nodemailer');

function hasSmtpConfig() {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
}

function requireSmtpConfig() {
  if (!hasSmtpConfig()) {
    const error = new Error('Email pengirim OTP belum disambungkan. Isi Gmail pengirim dan App Password di backend/.env agar OTP benar-benar masuk ke email akun.');
    error.status = 500;
    throw error;
  }
}

async function sendPasswordResetEmail({ to, name, code }) {
  requireSmtpConfig();

  const subject = 'Kode OTP Reset Password RepoTA';
  const text = `Halo ${name || 'Pengguna'},\n\nKode OTP reset password RepoTA kamu adalah: ${code}\nKode berlaku selama 10 menit. Jika kamu tidak meminta reset password, abaikan email ini.\n\nRepoTA - Program Studi Sistem Informasi`;
  const html = `
    <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111827;max-width:560px;margin:auto;padding:24px;border:1px solid #e5e7eb;border-radius:18px">
      <h2 style="color:#3525cd;margin:0 0 8px">Kode OTP Reset Password RepoTA</h2>
      <p>Halo ${name || 'Pengguna'},</p>
      <p>Gunakan kode OTP berikut untuk mengubah password akun RepoTA kamu:</p>
      <div style="font-size:28px;font-weight:800;letter-spacing:8px;background:#f3f4f6;border-radius:14px;padding:16px 20px;display:inline-block;color:#111827">${code}</div>
      <p style="margin-top:16px">Kode berlaku selama <b>10 menit</b>. Jika kamu tidak meminta reset password, abaikan email ini.</p>
      <p style="font-size:12px;color:#6b7280">RepoTA · Program Studi Sistem Informasi</p>
    </div>`;

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: String(process.env.SMTP_SECURE || '').toLowerCase() === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  await transporter.sendMail({
    from: process.env.MAIL_FROM || `RepoTA <${process.env.SMTP_USER}>`,
    to,
    subject,
    text,
    html,
  });

  return { sent: true, message: 'Kode OTP sudah dikirim ke email akun.' };
}

module.exports = { sendPasswordResetEmail, hasSmtpConfig };
