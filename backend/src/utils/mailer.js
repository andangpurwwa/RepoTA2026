const nodemailer = require('nodemailer');

const DEFAULT_CONNECTION_TIMEOUT_MS = 15000;
const DEFAULT_GREETING_TIMEOUT_MS = 15000;
const DEFAULT_SOCKET_TIMEOUT_MS = 20000;
const DEFAULT_SEND_TIMEOUT_MS = 30000;

function hasSmtpConfig() {
  return Boolean(
    process.env.SMTP_HOST &&
      process.env.SMTP_USER &&
      process.env.SMTP_PASS
  );
}

function requireSmtpConfig() {
  if (!hasSmtpConfig()) {
    const error = new Error(
      'Email pengirim OTP belum disambungkan. Isi konfigurasi SMTP dan App Password pada backend/.env.'
    );
    error.status = 500;
    throw error;
  }
}

function getPositiveNumber(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function createTransporter() {
  requireSmtpConfig();

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure:
      String(process.env.SMTP_SECURE || '').toLowerCase() === 'true',
    pool: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    connectionTimeout: getPositiveNumber(
      process.env.SMTP_CONNECTION_TIMEOUT_MS,
      DEFAULT_CONNECTION_TIMEOUT_MS
    ),
    greetingTimeout: getPositiveNumber(
      process.env.SMTP_GREETING_TIMEOUT_MS,
      DEFAULT_GREETING_TIMEOUT_MS
    ),
    socketTimeout: getPositiveNumber(
      process.env.SMTP_SOCKET_TIMEOUT_MS,
      DEFAULT_SOCKET_TIMEOUT_MS
    ),
    tls: {
      minVersion: 'TLSv1.2',
    },
  });
}

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function withTimeout(promise, timeoutMs, timeoutMessage) {
  let timeoutId;

  const timeoutPromise = new Promise((_, reject) => {
    timeoutId = setTimeout(() => {
      const error = new Error(timeoutMessage);
      error.status = 504;
      reject(error);
    }, timeoutMs);
  });

  return Promise.race([promise, timeoutPromise]).finally(() => {
    clearTimeout(timeoutId);
  });
}

async function verifyMailConnection() {
  const transporter = createTransporter();

  try {
    await withTimeout(
      transporter.verify(),
      getPositiveNumber(
        process.env.SMTP_SEND_TIMEOUT_MS,
        DEFAULT_SEND_TIMEOUT_MS
      ),
      'Pemeriksaan koneksi SMTP terlalu lama. Periksa konfigurasi SMTP dan jaringan server.'
    );

    return true;
  } finally {
    transporter.close();
  }
}

async function sendPasswordResetEmail({ to, name, code }) {
  const transporter = createTransporter();
  const safeName = escapeHtml(name || 'Pengguna');
  const safeCode = escapeHtml(code);
  const subject = 'Kode OTP Reset Password RepoTA';

  const text =
    `Halo ${name || 'Pengguna'},\n\n` +
    `Kode OTP reset password RepoTA kamu adalah: ${code}\n` +
    `Kode berlaku selama 10 menit. Jika kamu tidak meminta reset password, abaikan email ini.\n\n` +
    'RepoTA - Program Studi Sistem Informasi';

  const html = `
    <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111827;max-width:560px;margin:auto;padding:24px;border:1px solid #e5e7eb;border-radius:18px">
      <h2 style="color:#3525cd;margin:0 0 8px">Kode OTP Reset Password RepoTA</h2>
      <p>Halo ${safeName},</p>
      <p>Gunakan kode OTP berikut untuk mengubah password akun RepoTA:</p>
      <div style="font-size:28px;font-weight:800;letter-spacing:8px;background:#f3f4f6;border-radius:14px;padding:16px 20px;display:inline-block;color:#111827">${safeCode}</div>
      <p style="margin-top:16px">Kode berlaku selama <b>10 menit</b>. Jika kamu tidak meminta reset password, abaikan email ini.</p>
      <p style="font-size:12px;color:#6b7280">RepoTA · Program Studi Sistem Informasi</p>
    </div>
  `;

  try {
    await withTimeout(
      transporter.sendMail({
        from:
          process.env.MAIL_FROM ||
          `RepoTA <${process.env.SMTP_USER}>`,
        to,
        subject,
        text,
        html,
      }),
      getPositiveNumber(
        process.env.SMTP_SEND_TIMEOUT_MS,
        DEFAULT_SEND_TIMEOUT_MS
      ),
      'Pengiriman OTP terlalu lama. Silakan coba lagi setelah beberapa saat.'
    );

    return {
      sent: true,
      message: 'Kode OTP sudah dikirim ke email akun.',
    };
  } finally {
    transporter.close();
  }
}

module.exports = {
  sendPasswordResetEmail,
  verifyMailConnection,
  hasSmtpConfig,
};
