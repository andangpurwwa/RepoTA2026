const path = require('path');
const dotenv = require('dotenv');
const { createClient } = require('@supabase/supabase-js');

// Memastikan backend/.env tetap terbaca meskipun server dijalankan
// dari direktori yang berbeda.
dotenv.config({
  path: path.resolve(__dirname, '../../.env'),
});

const supabaseUrl = String(process.env.SUPABASE_URL || '').trim();
const supabaseServiceRoleKey = String(
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
).trim();

const documentBucket = String(
  process.env.SUPABASE_STORAGE_BUCKET || 'RepoTA-document'
).trim();

const avatarBucket = String(
  process.env.SUPABASE_AVATAR_BUCKET || 'repota-avatars'
).trim();

const maxAvatarSizeMb = Number(process.env.MAX_AVATAR_SIZE_MB || 2);

/**
 * Memastikan konfigurasi Supabase wajib telah tersedia.
 */
function validateSupabaseConfig() {
  const missingVariables = [];

  if (!supabaseUrl) {
    missingVariables.push('SUPABASE_URL');
  }

  if (!supabaseServiceRoleKey) {
    missingVariables.push('SUPABASE_SERVICE_ROLE_KEY');
  }

  if (missingVariables.length > 0) {
    throw new Error(
      `Konfigurasi Supabase belum lengkap. Variabel yang belum diisi: ${missingVariables.join(
        ', '
      )}`
    );
  }

  try {
    const parsedUrl = new URL(supabaseUrl);

    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      throw new Error('Protokol URL tidak didukung.');
    }
  } catch {
    throw new Error(
      'SUPABASE_URL tidak valid. Gunakan URL project Supabase yang benar.'
    );
  }

  if (!avatarBucket) {
    throw new Error('SUPABASE_AVATAR_BUCKET tidak boleh kosong.');
  }

  if (!documentBucket) {
    throw new Error('SUPABASE_STORAGE_BUCKET tidak boleh kosong.');
  }

  if (
    !Number.isFinite(maxAvatarSizeMb) ||
    maxAvatarSizeMb <= 0
  ) {
    throw new Error(
      'MAX_AVATAR_SIZE_MB harus berupa angka yang lebih besar dari 0.'
    );
  }
}

validateSupabaseConfig();

/**
 * Client ini menggunakan service role key sehingga hanya boleh digunakan
 * pada backend. Jangan pernah mengirim service role key ke frontend.
 */
const supabase = createClient(
  supabaseUrl,
  supabaseServiceRoleKey,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },

    db: {
      schema: 'public',
    },

    global: {
      headers: {
        'X-Client-Info': 'repota-backend',
      },
    },
  }
);

// Properti konfigurasi tambahan agar dapat digunakan oleh route/middleware.
supabase.config = Object.freeze({
  documentBucket,
  avatarBucket,
  maxAvatarSizeMb,
  maxAvatarSizeBytes: maxAvatarSizeMb * 1024 * 1024,
});

module.exports = supabase;