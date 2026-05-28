import { useEffect, useState } from "react";
import { getCriticalStockNotifications } from "../api/notificationApi";

export default function Navbar({ title, subtitle, onRefresh, onPrepared }) {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState({ total_critical_stock: 0, products: [] });
  const [error, setError] = useState("");

  const fetchNotifications = async () => {
    try {
      setError("");
      const response = await getCriticalStockNotifications();
      setNotifications(response.data.data);
    } catch {
      setError("Notifikasi gagal dimuat.");
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

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
        <div className="ss-notification-wrap">
          <button className="ss-icon-btn" title="Notifikasi" onClick={() => setOpen((value) => !value)}>
            <span className="material-symbols-outlined">notifications</span>
            {notifications.total_critical_stock > 0 && <b>{notifications.total_critical_stock}</b>}
          </button>
          {open && (
            <div className="ss-notification-dropdown">
              <div className="ss-notification-head">
                <strong>Notifikasi Stok Kritis</strong>
                <button className="ss-secondary" type="button" onClick={fetchNotifications}>Muat Ulang</button>
              </div>
              {error && <p className="ss-small-error">{error}</p>}
              {!error && notifications.products.length === 0 && <p>Tidak ada notifikasi stok kritis.</p>}
              {!error && notifications.products.map((product) => (
                <div className="ss-notification-item" key={product.product_id}>
                  <strong>{product.product_name}</strong>
                  <span>SKU: {product.sku || "-"} | Stok {product.current_stock}/{product.minimum_stock}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        <button className="ss-icon-btn" title="Bantuan" onClick={onPrepared}>
          <span className="material-symbols-outlined">help_outline</span>
        </button>
      </div>
    </header>
  );
}
