const stopwords = new Set([
  'dan', 'atau', 'yang', 'di', 'ke', 'dari', 'untuk', 'pada', 'dengan', 'dalam',
  'menggunakan', 'berbasis', 'studi', 'kasus', 'analisis', 'sistem', 'aplikasi',
  'the', 'of', 'a', 'an', 'in', 'on', 'for', 'to', 'and'
]);

function normalizeText(text = '') {
  return String(text)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function tokenize(text = '') {
  return normalizeText(text)
    .split(' ')
    .filter((word) => word.length > 2 && !stopwords.has(word));
}

function termFrequency(tokens) {
  return tokens.reduce((acc, token) => {
    acc[token] = (acc[token] || 0) + 1;
    return acc;
  }, {});
}

function cosineSimilarity(textA, textB) {
  const freqA = termFrequency(tokenize(textA));
  const freqB = termFrequency(tokenize(textB));
  const vocabulary = new Set([...Object.keys(freqA), ...Object.keys(freqB)]);

  let dot = 0;
  let magnitudeA = 0;
  let magnitudeB = 0;

  vocabulary.forEach((term) => {
    const a = freqA[term] || 0;
    const b = freqB[term] || 0;
    dot += a * b;
    magnitudeA += a * a;
    magnitudeB += b * b;
  });

  if (magnitudeA === 0 || magnitudeB === 0) return 0;
  return dot / (Math.sqrt(magnitudeA) * Math.sqrt(magnitudeB));
}

function similarityPercent(textA, textB) {
  return Math.round(cosineSimilarity(textA, textB) * 10000) / 100;
}

function interpretSimilarity(score) {
  if (score >= 70) return 'Kemiripan tinggi, judul perlu dipertimbangkan ulang.';
  if (score >= 40) return 'Kemiripan sedang, judul masih perlu diperdalam atau dibedakan.';
  if (score >= 20) return 'Kemiripan rendah-sedang, masih cukup aman tetapi tetap cek substansi.';
  return 'Kemiripan rendah, judul relatif aman sebagai usulan awal.';
}

module.exports = {
  normalizeText,
  tokenize,
  cosineSimilarity,
  similarityPercent,
  interpretSimilarity
};
