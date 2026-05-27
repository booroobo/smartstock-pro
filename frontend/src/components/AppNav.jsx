import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const links = [
  ["/dashboard", "Dasbor"],
  ["/categories", "Kategori Produk"],
  ["/warehouses", "Gudang"],
  ["/products", "Produk"],
  ["/stock-transactions", "Transaksi Stok"],
  ["/reports", "Laporan"],
  ["/system-status", "Status Sistem"],
];

export default function AppNav() {
  const { pathname } = useLocation();
  const { user, logout } = useAuth();

  return (
    <aside className="sidebar">
      <div>
        <h2>SmartStock Pro</h2>
        <p>{user?.name} · {user?.role || "admin"}</p>
      </div>
      <nav>
        {links.map(([to, label]) => (
          <Link key={to} className={pathname === to ? "active" : ""} to={to}>
            {label}
          </Link>
        ))}
      </nav>
      <button className="secondary" onClick={logout}>Keluar</button>
    </aside>
  );
}
