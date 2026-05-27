export default function Modal({ title, children, onClose }) {
  return (
    <div className="ss-modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section className="ss-modal" role="dialog" aria-modal="true" onMouseDown={(e) => e.stopPropagation()}>
        <header>
          <h2>{title}</h2>
          <button className="ss-icon-btn" onClick={onClose} type="button" title="Tutup Modal">
            <span className="material-symbols-outlined">close</span>
          </button>
        </header>
        {children}
      </section>
    </div>
  );
}
