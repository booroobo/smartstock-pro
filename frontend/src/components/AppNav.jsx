import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const links = [
  ["/dashboard", "Dashboard"],
  ["/categories", "Categories"],
  ["/warehouses", "Warehouses"],
  ["/products", "Products"],
  ["/stock-transactions", "Stock Transactions"],
  ["/reports", "Reports"],
  ["/system-status", "System Status"],
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
      <button className="secondary" onClick={logout}>Logout</button>
    </aside>
  );
}
