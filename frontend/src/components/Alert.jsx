export default function Alert({ type = "error", message, onClose }) {
  return (
    <div className={`ss-alert ${type}`}>
      <span className="material-symbols-outlined">{type === "error" ? "warning" : "info"}</span>
      <span>{message}</span>
      {onClose && (
        <button className="ss-icon-btn" onClick={onClose} type="button">
          <span className="material-symbols-outlined">close</span>
        </button>
      )}
    </div>
  );
}
