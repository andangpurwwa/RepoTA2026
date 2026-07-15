const test = require('node:test');
const assert = require('node:assert/strict');
const {
  cleanString,
  countWords,
  isValidPhone,
  validatePassword,
  ensureValidation,
} = require('../src/utils/validation');

test('cleanString membersihkan spasi awal dan akhir', () => {
  assert.equal(cleanString('  RepoTA  '), 'RepoTA');
});

test('countWords menghitung kata dan mengabaikan spasi berlebih', () => {
  assert.equal(countWords('  dashboard   repository tugas akhir  '), 4);
  assert.equal(countWords(''), 0);
});

test('nomor telepon valid untuk 08 dan +62', () => {
  assert.equal(isValidPhone('081234567890'), true);
  assert.equal(isValidPhone('+6281234567890'), true);
});

test('nomor telepon invalid jika terlalu pendek', () => {
  assert.equal(isValidPhone('12345'), false);
});

test('password minimal 8 karakter', () => {
  assert.ok(validatePassword('1234567').includes('Password minimal 8 karakter.'));
  assert.equal(validatePassword('12345678').length, 0);
});

test('ensureValidation melempar error status 400', () => {
  assert.throws(
    () => ensureValidation(['Nama wajib diisi.']),
    (error) => error.status === 400 && error.message === 'Nama wajib diisi.'
  );
});
