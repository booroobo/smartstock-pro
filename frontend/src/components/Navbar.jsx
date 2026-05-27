export default function Navbar({ title, subtitle, onRefresh, onPrepared }) {
  return (
    <header className="ss-navbar">
      <div className="ss-search">
        <span className="material-symbols-outlined">search</span>
        <input placeholder="Cari inventaris, SKU, gudang..." onFocus={onPrepared} />
      </div>
      <div className="ss-navbar-title">
        <strong>{title}</strong>
        {subtitle && <span>{subtitle}</span>}
      </div>
      <div className="ss-navbar-actions">
        {onRefresh && (
          <button className="ss-icon-btn" title="Muat Ulang" onClick={onRefresh}>
            <span className="material-symbols-outlined">refresh</span>
          </button>
        )}
        <button className="ss-icon-btn" title="Notifikasi" onClick={onPrepared}>
          <span className="material-symbols-outlined">notifications</span>
          <i />
        </button>
        <button className="ss-icon-btn" title="Bantuan" onClick={onPrepared}>
          <span className="material-symbols-outlined">help_outline</span>
        </button>
      </div>
    </header>
  );
}
