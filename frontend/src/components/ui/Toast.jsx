export default function Toast({
  type = 'success',
  message,
  onClose,
}) {
  if (!message) return null;

  const isError = type === 'error';

  const styleClass = isError
    ? 'border-red-200 bg-red-50 text-red-700'
    : 'border-emerald-200 bg-emerald-50 text-emerald-700';

  return (
    <div
      role={isError ? 'alert' : 'status'}
      aria-live={isError ? 'assertive' : 'polite'}
      className={`flex items-start justify-between gap-3 rounded-2xl border px-4 py-3 text-sm ${styleClass}`}
    >
      <div className="flex min-w-0 items-start gap-2">
        <span className="material-symbols-rounded mt-0.5 shrink-0 text-[18px]">
          {isError ? 'error' : 'check_circle'}
        </span>

        <span className="break-words">
          {message}
        </span>
      </div>

      {onClose && (
        <button
          type="button"
          aria-label="Tutup notifikasi"
          className="material-symbols-rounded shrink-0 text-[18px] opacity-70 transition hover:opacity-100"
          onClick={onClose}
        >
          close
        </button>
      )}
    </div>
  );
}
