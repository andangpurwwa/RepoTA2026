const {
  cleanString,
  countWords,
  isValidPhone,
  validatePassword,
  ensureValidation,
} = require('../src/utils/validation');

describe('validation utils', () => {
  test('cleanString membersihkan spasi awal dan akhir', () => {
    expect(cleanString('  RepoTA  ')).toBe('RepoTA');
  });

  test('countWords menghitung kata dan mengabaikan spasi berlebih', () => {
    expect(countWords('  dashboard   repository tugas akhir  ')).toBe(4);
    expect(countWords('')).toBe(0);
  });

  test('nomor telepon valid untuk 08 dan +62', () => {
    expect(isValidPhone('081234567890')).toBe(true);
    expect(isValidPhone('+6281234567890')).toBe(true);
  });

  test('nomor telepon invalid jika terlalu pendek', () => {
    expect(isValidPhone('12345')).toBe(false);
  });

  test('password minimal 8 karakter', () => {
    expect(validatePassword('1234567')).toContain('Password minimal 8 karakter.');
    expect(validatePassword('12345678')).toHaveLength(0);
  });

  test('ensureValidation melempar error 400', () => {
    expect(() => ensureValidation(['Nama wajib diisi.'])).toThrow('Nama wajib diisi.');
  });
});
