// ── Status badge helper ───────────────────────────────────────────
export function statusBadge(status) {
  const map = {
    Terverifikasi: 'badge-success',
    Menunggu:      'badge-warning',
    Revisi:        'badge-error',
    Ditolak:       'badge-error',
    Diproses:      'badge-info',
  };
  return map[status] || 'badge-default';
}

// ── Similarity color ──────────────────────────────────────────────
export function similarityColor(pct) {
  if (pct <= 15)  return 'text-green-600 bg-green-50';
  if (pct <= 30)  return 'text-yellow-600 bg-yellow-50';
  return 'text-red-600 bg-red-50';
}

// ── Format date ───────────────────────────────────────────────────
export function formatDate(dateStr) {
  const d = new Date(dateStr);
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric', month: 'short', year: 'numeric',
  }).format(d);
}

// ── Truncate text ─────────────────────────────────────────────────
export function truncate(str, n = 60) {
  return str.length > n ? str.slice(0, n) + '…' : str;
}
