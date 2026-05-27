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
import DashboardLayout from "../components/DashboardLayout";
import SummaryCard from "../components/SummaryCard";
import DataTable from "../components/DataTable";
import Alert from "../components/Alert";
import { getDashboard } from "../api/dashboardApi";
import { displayStockType } from "../utils/roles";

export default function DashboardPage() {
  const [dashboard, setDashboard] = useState(null);
  const [error, setError] = useState("");

  const fetchDashboard = async () => {
    setError("");
    try {
      const response = await getDashboard();
      setDashboard(response.data.data);
    } catch {
      setError("Dasbor inventaris gagal dimuat.");
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchDashboard();
  }, []);

  const criticalCount = dashboard?.critical_stock_products?.length || 0;

  return (
    <DashboardLayout title="Dasbor Inventaris" subtitle="Ringkasan langsung" onRefresh={fetchDashboard}>
      {criticalCount > 0 && (
        <Alert
          type="error"
          message={`${criticalCount} produk berada pada atau di bawah minimum stock.`}
        />
      )}
      {error && <Alert message={error} onClose={() => setError("")} />}

      <div className="ss-page-head">
        <div>
          <h1>Dasbor Inventaris</h1>
          <p>Ringkasan stok, transaksi terbaru, dan produk kritis.</p>
        </div>
        <button className="ss-primary" onClick={fetchDashboard}>
          <span className="material-symbols-outlined">refresh</span>
          Muat Ulang Dasbor
        </button>
      </div>

      <section className="ss-grid-4">
        <SummaryCard label="Total Produk" value={dashboard?.total_products || 0} icon="inventory_2" hint="Aktif" />
        <SummaryCard label="Total Stok Masuk" value={dashboard?.total_stock_in || 0} icon="login" hint="Masuk" />
        <SummaryCard label="Total Stok Keluar" value={dashboard?.total_stock_out || 0} icon="logout" hint="Keluar" />
        <SummaryCard label="Stok Kritis" value={criticalCount} icon="error" tone="danger" hint="Prioritas" />
      </section>

      <section className="ss-card">
        <h2>Pergerakan Stok per Kategori</h2>
        <div className="ss-chart">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dashboard?.stock_movement_by_category || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="category" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Bar dataKey="stock_in" fill="#0f172a" name="Stok Masuk" />
              <Bar dataKey="stock_out" fill="#d3e4fe" name="Stok Keluar" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <div className="ss-grid-2">
        <section className="ss-card">
          <h2>Produk Stok Kritis</h2>
          <DataTable
            columns={[
              { key: "name", label: "Produk" },
              { key: "current_stock", label: "Stok" },
              { key: "minimum_stock", label: "Minimum" },
            ]}
            rows={dashboard?.critical_stock_products || []}
          />
        </section>

        <section className="ss-card">
          <h2>Transaksi Stok Terbaru</h2>
          <DataTable
            columns={[
              { key: "transaction_date", label: "Tanggal" },
              { key: "product", label: "Produk", render: (row) => row.product?.name || "-" },
              { key: "type", label: "Tipe", render: (row) => <span className={`ss-badge ${row.type}`}>{displayStockType(row.type)}</span> },
              { key: "quantity", label: "Jumlah" },
            ]}
            rows={dashboard?.latest_stock_transactions || []}
          />
        </section>
      </div>
    </DashboardLayout>
  );
}
