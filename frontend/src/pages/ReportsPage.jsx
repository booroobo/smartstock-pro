import { useEffect, useState } from "react";
import DashboardLayout from "../components/DashboardLayout";
import DataTable from "../components/DataTable";
import Alert from "../components/Alert";
import { useAuth } from "../contexts/AuthContext";
import { getAuditLogs } from "../api/auditLogApi";
import { exportStockReport } from "../api/reportApi";
import { canViewAuditLogs, deniedMessage } from "../utils/roles";

export default function ReportsPage() {
  const { user } = useAuth();
  const canSeeAudit = canViewAuditLogs(user?.role);
  const [logs, setLogs] = useState([]);
  const [filters, setFilters] = useState({ start_date: "", end_date: "", type: "" });
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  const fetchLogs = async () => {
    if (!canSeeAudit) return;
    try {
      const response = await getAuditLogs();
      setLogs(response.data.data);
    } catch (err) {
      setError(err.response?.status === 403 ? deniedMessage : "Log aktivitas gagal dimuat.");
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchLogs();
  }, []);

  const downloadCsv = async () => {
    const response = await exportStockReport(filters);
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "smartstock-report.csv");
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    setNotice("Laporan berhasil diekspor.");
  };

  const exportPdf = () => {
    setNotice("Dialog cetak untuk ekspor PDF dibuka.");
    window.setTimeout(() => window.print(), 100);
  };

  return (
    <DashboardLayout title="Laporan" subtitle="Ekspor CSV dan ringkasan audit" onRefresh={fetchLogs}>
      {error && <Alert message={error} onClose={() => setError("")} />}
      {notice && <Alert type="info" message={notice} onClose={() => setNotice("")} />}

      <div className="ss-page-head">
        <div>
          <h1>Laporan</h1>
          <p>Ekspor transaksi stok dan lihat log aktivitas terakhir.</p>
        </div>
        <div className="ss-actions">
          <button className="ss-secondary" onClick={exportPdf}>
            <span className="material-symbols-outlined">picture_as_pdf</span>
            Ekspor PDF
          </button>
          <button className="ss-primary" onClick={downloadCsv}>
            <span className="material-symbols-outlined">file_download</span>
            Ekspor Laporan
          </button>
        </div>
      </div>

      <section className="ss-card">
        <h2>Filter Ekspor</h2>
        <div className="ss-form-grid">
          <label>Tanggal Mulai<input type="date" value={filters.start_date} onChange={(e) => setFilters({ ...filters, start_date: e.target.value })} /></label>
          <label>Tanggal Selesai<input type="date" value={filters.end_date} onChange={(e) => setFilters({ ...filters, end_date: e.target.value })} /></label>
          <label>
            Tipe
            <select value={filters.type} onChange={(e) => setFilters({ ...filters, type: e.target.value })}>
              <option value="">Semua tipe</option><option value="stock_in">Stok Masuk</option><option value="stock_out">Stok Keluar</option>
            </select>
          </label>
          <div className="ss-form-actions">
            <button className="ss-secondary" type="button" onClick={() => setFilters({ start_date: "", end_date: "", type: "" })}>Reset Filter</button>
            <button className="ss-primary" type="button" onClick={downloadCsv}>Ekspor CSV</button>
          </div>
        </div>
      </section>

      <section className="ss-card print-report">
        <h2>Laporan Stok SmartStock Pro</h2>
        <p>Filter laporan: {filters.start_date || "Semua tanggal mulai"} - {filters.end_date || "Semua tanggal selesai"} · {filters.type || "Semua tipe transaksi"}</p>
      </section>

      {canSeeAudit ? <section className="ss-card">
        <h2>Log Aktivitas</h2>
        <DataTable
          columns={[
            { key: "created_at", label: "Waktu" },
            { key: "action", label: "Aksi" },
            { key: "table_name", label: "Modul" },
            { key: "record_id", label: "Record" },
          ]}
          rows={logs}
        />
      </section> : <section className="ss-card">
        <h2>Log Aktivitas</h2>
        <p>Disiapkan untuk pengembangan lanjutan. Role ini hanya dapat melihat dan mengekspor laporan.</p>
        <span className="ss-badge preview">Simulasi MVP</span>
      </section>}
    </DashboardLayout>
  );
}
