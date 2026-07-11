import Modal from './Modal';

export default function ConfirmModal({
  open,
  title = 'Konfirmasi',
  message,
  confirmText = 'Ya, lanjutkan',
  cancelText = 'Batal',
  danger = false,
  loading = false,
  onCancel,
  onConfirm,
}) {
  if (!open) return null;

  return (
    <Modal
      title={title}
      onClose={loading ? undefined : onCancel}
    >
      <div className="space-y-5">
        <p className="text-sm leading-6 text-gray-600">
          {message}
        </p>

        <div className="flex flex-col justify-end gap-2 sm:flex-row">
          <button
            type="button"
            className="btn-secondary justify-center disabled:cursor-not-allowed disabled:opacity-60"
            disabled={loading}
            onClick={onCancel}
          >
            {cancelText}
          </button>

          <button
            type="button"
            className={`${
              danger ? 'btn-danger' : 'btn-primary'
            } justify-center disabled:cursor-not-allowed disabled:opacity-60`}
            disabled={loading}
            onClick={onConfirm}
          >
            {loading ? 'Memproses...' : confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
}
