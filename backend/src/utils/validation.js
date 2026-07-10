function countWords(value = '') {
  return cleanString(value)
    .split(/\s+/)
    .filter(Boolean).length;
}

function cleanString(value, fallback = '') {
  return String(value ?? fallback).trim();
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanString(value).toLowerCase());
}

function isValidDate(value) {
  if (!value) return false;
  const date = new Date(value);
  return !Number.isNaN(date.getTime());
}

function normalizePhone(value) {
  const phone = cleanString(value);
  if (!phone) return '';
  return phone.replace(/[^0-9+]/g, '');
}

function isValidPhone(value) {
  const normalized = normalizePhone(value);
  if (!normalized) return true;
  const digits = normalized.replace(/\D/g, '');
  return digits.length >= 10 && digits.length <= 15 && /^\+?[0-9]+$/.test(normalized);
}

function isValidUrl(value) {
  const url = cleanString(value);
  if (!url) return true;

  try {
    const parsed = new URL(url);
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch {
    return false;
  }
}

function buildValidationError(message, details = []) {
  const error = new Error(message);
  error.status = 400;
  error.details = details;
  return error;
}

function collectErrors(rules) {
  return rules
    .filter((rule) => !rule.valid)
    .map((rule) => rule.message);
}

function validatePassword(password, label = 'Password') {
  const value = String(password || '');
  const errors = [];

  if (!value) errors.push(`${label} wajib diisi.`);
  if (value && value.length < 8) errors.push(`${label} minimal 8 karakter.`);
  if (value && value.length > 72) errors.push(`${label} maksimal 72 karakter.`);

  return errors;
}

function ensureValidation(errors) {
  if (errors.length > 0) {
    throw buildValidationError(errors[0], errors);
  }
}

module.exports = {
  countWords,
  cleanString,
  isValidEmail,
  isValidDate,
  normalizePhone,
  isValidPhone,
  isValidUrl,
  collectErrors,
  validatePassword,
  ensureValidation,
  buildValidationError,
};
