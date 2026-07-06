export default function Modal({ title, children, onClose, wide = false }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4">
      <div className={`w-full ${wide ? 'max-w-4xl' : 'max-w-2xl'} max-h-[90vh] overflow-auto rounded-3xl bg-white shadow-modal`}>
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-outline/50 bg-white px-5 py-4">
          <h2 className="text-base font-bold text-on-surface">{title}</h2>
          <button className="btn-ghost px-2" onClick={onClose} aria-label="Tutup modal">
            <span className="material-symbols-rounded">close</span>
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}
