export function LoadingState({ text = 'Memuat data...' }) {
  return (
    <div className="card flex items-center justify-center gap-3 py-10 text-gray-500">
      <span className="material-symbols-rounded animate-spin">refresh</span>
      <span className="text-sm font-medium">{text}</span>
    </div>
  );
}

export function EmptyState({ icon = 'inbox', title = 'Data belum tersedia', description = 'Belum ada data yang dapat ditampilkan.' }) {
  return (
    <div className="card text-center py-12">
      <span className="material-symbols-rounded text-[48px] text-gray-300">{icon}</span>
      <h3 className="mt-3 font-semibold text-on-surface">{title}</h3>
      <p className="mt-1 text-sm text-gray-500">{description}</p>
    </div>
  );
}

export function ErrorState({ message, onRetry }) {
  return (
    <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 flex items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        <span className="material-symbols-rounded">error</span>
        <span>{message}</span>
      </div>
      {onRetry && <button className="btn-secondary py-1.5" onClick={onRetry}>Coba lagi</button>}
    </div>
  );
}
