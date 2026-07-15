require('dotenv').config();

const path = require('path');
const readXlsxFile = require('read-excel-file/node');
const pool = require('../src/config/db');
const { categorizeRepository } = require('../src/utils/categorize');

const EXCEL_PATH = path.join(__dirname, '../data/Arsip_SI.xlsx');

function cleanText(value) {
  if (value === undefined || value === null) return null;
  const text = String(value).replace(/\s+/g, ' ').trim();
  if (!text || text === '-' || text === '#REF!' || text === '#NAME?') return null;
  return text;
}

function cleanNim(value) {
  if (value === undefined || value === null || value === '') return null;

  if (typeof value === 'number') {
    return String(Math.round(value));
  }

  const text = String(value).trim();

  if (/e\+/i.test(text)) {
    const parsed = Number(text);
    if (!Number.isNaN(parsed)) return String(Math.round(parsed));
  }

  return text.replace(/\.0$/, '');
}

function excelDateToJS(value) {
  if (!value) return null;

  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString().slice(0, 10);
  }

  if (typeof value === 'number') {
    // Excel menggunakan epoch 1899-12-30 untuk serial tanggal.
    const milliseconds = Math.round(value * 86400 * 1000);
    const date = new Date(Date.UTC(1899, 11, 30) + milliseconds);
    return Number.isNaN(date.getTime())
      ? null
      : date.toISOString().slice(0, 10);
  }

  const text = cleanText(value);
  if (!text) return null;

  const date = new Date(text);
  if (!Number.isNaN(date.getTime())) {
    return date.toISOString().slice(0, 10);
  }

  return null;
}

function getYear(value, fallbackDate) {
  if (value !== undefined && value !== null && value !== '') {
    const n = Number(value);
    if (!Number.isNaN(n) && n > 1900 && n < 2100) return Math.round(n);
  }

  if (fallbackDate) {
    const y = new Date(fallbackDate).getFullYear();
    if (!Number.isNaN(y)) return y;
  }

  return null;
}

function validTitle(title) {
  if (!title) return false;
  const lower = title.toLowerCase();

  if (lower.includes('judul')) return false;
  if (lower.includes('timestamp')) return false;
  if (lower.includes('#ref')) return false;

  return title.length > 8;
}

async function insertRepository(client, data, adminId) {
  const detected = await categorizeRepository(client, data.title, data.abstract || '');
  const categoryId = detected?.category_id || null;

  await client.query(
    `INSERT INTO repositories
      (
        title,
        abstract,
        research_year,
        research_date,
        advisor,
        author_name,
        category_id,
        file_name,
        file_path,
        status,
        submitted_by,
        approved_by,
        approved_at,
        nim,
        email_uad,
        no_hp,
        program_studi,
        jenis_ujian,
        penguji,
        hari_ujian,
        jam_ujian,
        link_dokumen
      )
     VALUES
      (
        $1,$2,$3,$4,$5,$6,$7,
        $8,$9,$10,$11,$12,CURRENT_TIMESTAMP,
        $13,$14,$15,$16,$17,$18,$19,$20,$21
      )`,
    [
      data.title,
      data.abstract,
      data.research_year,
      data.research_date,
      data.advisor,
      data.author_name,
      categoryId,
      'Arsip_SI.xlsx',
      null,
      'approved',
      adminId,
      adminId,
      data.nim,
      data.email_uad,
      data.no_hp,
      data.program_studi,
      data.jenis_ujian,
      data.penguji,
      data.hari_ujian,
      data.jam_ujian,
      data.link_dokumen
    ]
  );
}

function buildSemproRows(rows) {
  const data = [];

  // File asli Sempro: data mulai sekitar baris 4.
  for (let i = 3; i < rows.length; i++) {
    const row = rows[i];

    const tahunRaw = row[0];              // A
    const timestamp = row[2];             // C
    const nama = cleanText(row[3]);       // D
    const nim = cleanNim(row[4]);         // E
    const email = cleanText(row[5]);      // F
    const hp = cleanText(row[6]);         // G
    const judul = cleanText(row[7]);      // H
    const prodi = cleanText(row[8]);      // I
    const pembimbing = cleanText(row[9]); // J
    const link = cleanText(row[13]);      // N
    const penguji = cleanText(row[15]) || cleanText(row[14]); // P atau O
    const hariRaw = row[16];              // Q
    const jam = cleanText(row[17]);       // R

    if (!validTitle(judul) || !nama) continue;

    const researchDate = excelDateToJS(hariRaw) || excelDateToJS(timestamp);
    const tahun = getYear(tahunRaw, researchDate);
    const hariDisplay = researchDate || cleanText(hariRaw);

    data.push({
      jenis_ujian: 'Sempro',
      title: judul,
      abstract: `Arsip Seminar Proposal Program Studi Sistem Informasi. Judul: ${judul}`,
      research_year: tahun,
      research_date: researchDate,
      advisor: pembimbing,
      author_name: nama,
      nim,
      email_uad: email,
      no_hp: hp,
      program_studi: prodi,
      penguji,
      hari_ujian: hariDisplay,
      jam_ujian: jam,
      link_dokumen: link
    });
  }

  return data;
}

function buildPendadaranRows(rows) {
  const data = [];

  // File asli Pendadaran: data mulai sekitar baris 3.
  for (let i = 2; i < rows.length; i++) {
    const row = rows[i];

    const tahunRaw = row[0];              // A
    const timestamp = row[1];             // B
    const nama = cleanText(row[2]);       // C
    const nim = cleanNim(row[3]);         // D
    const email = cleanText(row[4]);      // E
    const hp = cleanText(row[5]);         // F
    const judul = cleanText(row[6]);      // G
    const prodi = cleanText(row[9]);      // J
    const pembimbing = cleanText(row[10]); // K
    const link = cleanText(row[17]);      // R
    const penguji = cleanText(row[18]);   // S
    const hariRaw = row[19];              // T
    const jam = cleanText(row[20]);       // U

    if (!validTitle(judul) || !nama) continue;

    const researchDate = excelDateToJS(hariRaw) || excelDateToJS(timestamp);
    const tahun = getYear(tahunRaw, researchDate);
    const hariDisplay = researchDate || cleanText(hariRaw);

    data.push({
      jenis_ujian: 'Pendadaran',
      title: judul,
      abstract: `Arsip Pendadaran Program Studi Sistem Informasi. Judul: ${judul}`,
      research_year: tahun,
      research_date: researchDate,
      advisor: pembimbing,
      author_name: nama,
      nim,
      email_uad: email,
      no_hp: hp,
      program_studi: prodi,
      penguji,
      hari_ujian: hariDisplay,
      jam_ujian: jam,
      link_dokumen: link
    });
  }

  return data;
}

async function main() {
  const client = await pool.connect();

  try {
    const [semproRows, pendadaranRows] = await Promise.all([
      readXlsxFile(EXCEL_PATH, { sheet: 'Archive Sempro_2020-2023' }),
      readXlsxFile(EXCEL_PATH, { sheet: 'Archive Pendadaran 2020-2023' }),
    ]);

    const semproData = buildSemproRows(semproRows);
    const pendadaranData = buildPendadaranRows(pendadaranRows);
    const allData = [...semproData, ...pendadaranData];

    console.log(`Data Sempro terbaca: ${semproData.length}`);
    console.log(`Data Pendadaran terbaca: ${pendadaranData.length}`);
    console.log(`Total data siap import: ${allData.length}`);

    await client.query('BEGIN');

    const adminResult = await client.query(
      `SELECT id FROM users WHERE role = 'admin' ORDER BY id ASC LIMIT 1`
    );

    const adminId = adminResult.rows[0]?.id || null;

    // Biar kalau script dijalankan ulang, data Excel lama tidak dobel.
    await client.query(
      `DELETE FROM repositories WHERE file_name = 'Arsip_SI.xlsx'`
    );

    for (const item of allData) {
      await insertRepository(client, item, adminId);
    }

    await client.query('COMMIT');

    console.log('Import Excel berhasil.');
    console.log(`Total masuk database: ${allData.length}`);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Import Excel gagal:', error.message);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}

main();