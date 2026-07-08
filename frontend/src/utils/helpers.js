export function formatDate(value) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }).format(date);
}

export function truncate(text = '', length = 90) {
  const str = String(text || '');
  return str.length > length ? `${str.slice(0, length)}…` : str;
}

export function statusLabel(status) {
  const map = {
    draft: 'Draft',
    pending: 'Menunggu Verifikasi',
    approved: 'Terverifikasi',
    rejected: 'Ditolak',
    revision: 'Revisi',
  };
  return map[status] || status || '-';
}

export function statusClass(status) {
  const map = {
    draft: 'badge-default',
    pending: 'badge-warning',
    approved: 'badge-success',
    rejected: 'badge-error',
    revision: 'badge-info',
  };
  return map[status] || 'badge-default';
}

export function similarityClass(score = 0) {
  if (score >= 70) return 'bg-red-50 text-red-700 border-red-200';
  if (score >= 40) return 'bg-amber-50 text-amber-700 border-amber-200';
  if (score >= 20) return 'bg-blue-50 text-blue-700 border-blue-200';
  return 'bg-emerald-50 text-emerald-700 border-emerald-200';
}

export function getErrorMessage(error) {
  return error?.message || 'Terjadi kesalahan. Silakan coba lagi.';
}
