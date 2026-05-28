import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
  canUseStockTransactions,
  displayRole,
} from "../utils/roles";

const mainItems = [
  { path: "/dashboard", icon: "dashboard", label: "Dasbor", roles: ["admin", "warehouse_manager", "staff", "viewer"] },
  { path: "/products", icon: "inventory_2", label: "Produk", roles: ["admin", "warehouse_manager"] },
  { path: "/categories", icon: "category", label: "Kategori Produk", roles: ["admin", "warehouse_manager"] },
  { path: "/warehouses", icon: "warehouse", label: "Gudang", roles: ["admin", "warehouse_manager"] },
  { path: "/suppliers", icon: "local_shipping", label: "Supplier", roles: ["admin", "warehouse_manager"] },
  { path: "/stock-transactions", icon: "receipt_long", label: "Transaksi Stok", roles: ["admin", "warehouse_manager", "staff"] },
  { path: "/stock-transfers", icon: "sync_alt", label: "Transfer Stok", roles: ["admin", "warehouse_manager", "staff"] },
  { path: "/reports", icon: "analytics", label: "Laporan", roles: ["admin", "warehouse_manager", "staff", "viewer"] },
];

const systemItems = [
  { path: "/system-status", icon: "terminal", label: "Status Sistem", roles: ["admin", "warehouse_manager", "staff", "viewer"] },
  { path: "/audit-logs", icon: "history", label: "Log Aktivitas", roles: ["admin", "warehouse_manager"] },
  { path: "/import-data", icon: "upload_file", label: "Impor Data", roles: ["admin", "warehouse_manager"] },
  { path: "/queue-jobs", icon: "queue", label: "Antrian Proses", roles: ["admin", "warehouse_manager"] },
  { path: "/role-access", icon: "admin_panel_settings", label: "Hak Akses", roles: ["admin"] },
];

export default function Sidebar({ onPrepared }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const role = user?.role || "viewer";
  const visibleMainItems = mainItems.filter((item) => item.roles.includes(role));
  const visibleSystemItems = systemItems.filter((item) => item.roles.includes(role));
  const canAddStock = canUseStockTransactions(role);

  return (
    <aside className="ss-sidebar">
      <div className="ss-brand">
        <h1>SmartStock Pro</h1>
        <p>Sistem Inventaris</p>
      </div>

      <nav className="ss-nav">
        {visibleMainItems.map((item) => (
          <Link key={item.path} className={pathname === item.path ? "active" : ""} to={item.path}>
            <span className="material-symbols-outlined">{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}

        <div className="ss-nav-label">Sistem</div>
        {visibleSystemItems.map((item) => (
          <Link key={item.path} className={pathname === item.path ? "active" : ""} to={item.path}>
            <span className="material-symbols-outlined">{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>

      <div className="ss-sidebar-footer">
        {canAddStock && (
          <button className="ss-primary ss-full" onClick={() => navigate("/stock-transactions")}>
            <span className="material-symbols-outlined">add</span>
            Tambah Stok Baru
          </button>
        )}
        <button className="ss-profile" onClick={logout} title="Keluar">
          <span className="ss-avatar">{user?.name?.charAt(0) || "S"}</span>
          <span>
            <strong>{user?.name || "Pengguna SmartStock"}</strong>
            <small>{displayRole(role)}</small>
          </span>
          <span className="material-symbols-outlined">logout</span>
        </button>
        <button className="ss-ghost ss-full" onClick={onPrepared}>
          <span className="material-symbols-outlined">bolt</span>
          Simulasi MVP
        </button>
      </div>
    </aside>
  );
}
