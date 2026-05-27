import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import AppNav from "../components/AppNav";
import { getDashboard } from "../api/dashboardApi";

export default function DashboardPage() {
  const [dashboard, setDashboard] = useState(null);

  useEffect(() => {
    getDashboard().then((response) => setDashboard(response.data.data));
  }, []);

  const chartData = dashboard?.stock_movement_by_category || [];

  return (
    <div className="app-shell">
      <AppNav />
      <main className="content">
        <div className="page-header">
          <div>
            <h1>Inventory Dashboard</h1>
            <p>Ringkasan stok, transaksi terbaru, dan produk kritis.</p>
          </div>
        </div>

        <section className="metric-grid">
          <div className="metric"><span>Total Products</span><strong>{dashboard?.total_products || 0}</strong></div>
          <div className="metric"><span>Total Stock In</span><strong>{dashboard?.total_stock_in || 0}</strong></div>
          <div className="metric"><span>Total Stock Out</span><strong>{dashboard?.total_stock_out || 0}</strong></div>
          <div className="metric"><span>Critical Stock</span><strong>{dashboard?.critical_stock_products?.length || 0}</strong></div>
        </section>

        <section className="panel">
          <h2>Stock Movement by Category</h2>
          <div className="chart-wrap">
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Bar dataKey="stock_in" fill="#2563eb" name="Stock In" />
                <Bar dataKey="stock_out" fill="#dc2626" name="Stock Out" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <div className="two-column">
          <section className="panel">
            <h2>Critical Stock Products</h2>
            <table>
              <thead><tr><th>Product</th><th>Stock</th><th>Minimum</th></tr></thead>
              <tbody>
                {(dashboard?.critical_stock_products || []).map((product) => (
                  <tr key={product.id}>
                    <td>{product.name}</td>
                    <td>{product.current_stock}</td>
                    <td>{product.minimum_stock}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          <section className="panel">
            <h2>Latest Stock Transactions</h2>
            <table>
              <thead><tr><th>Date</th><th>Product</th><th>Type</th><th>Qty</th></tr></thead>
              <tbody>
                {(dashboard?.latest_stock_transactions || []).map((transaction) => (
                  <tr key={transaction.id}>
                    <td>{transaction.transaction_date}</td>
                    <td>{transaction.product?.name}</td>
                    <td><span className={`badge ${transaction.type}`}>{transaction.type}</span></td>
                    <td>{transaction.quantity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </div>
      </main>
    </div>
  );
}
