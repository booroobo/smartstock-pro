import { useEffect, useState } from "react";
import DashboardLayout from "../components/DashboardLayout";
import DataTable from "../components/DataTable";
import Alert from "../components/Alert";
import { useAuth } from "../contexts/AuthContext";
import { getAuditLogs } from "../api/auditLogApi";
import { exportStockReport } from "../api/reportApi";
import { getTransactions } from "../api/transactionApi";
import { canViewAuditLogs, deniedMessage, displayStockType } from "../utils/roles";

export default function ReportsPage() {
  const { user } = useAuth();
  const canSeeAudit = canViewAuditLogs(user?.role);
  const [logs, setLogs] = useState([]);
  const [reportRows, setReportRows] = useState([]);
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

  const fetchReportRows = async (nextFilters = filters) => {
    const response = await getTransactions({
      ...nextFilters,
      per_page: 100,
      sort_by: "transaction_date",
      sort_direction: "desc",
    });
    const payload = response.data.data;
    setReportRows(payload.data || payload);
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchLogs();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchReportRows();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const exportPdf = async () => {
    try {
      await fetchReportRows();
      setNotice("Dialog cetak untuk ekspor PDF dibuka.");
      window.setTimeout(() => window.print(), 100);
    } catch {
      setError("Data laporan gagal dimuat untuk cetak PDF.");
    }
  };

  const applyFilters = async () => {
    try {
      await fetchReportRows();
      setNotice("Filter laporan diterapkan.");
    } catch {
      setError("Filter laporan gagal diterapkan.");
    }
  };

  const resetFilters = () => {
    const nextFilters = { start_date: "", end_date: "", type: "" };
    setFilters(nextFilters);
    fetchReportRows(nextFilters).catch(() => setError("Data laporan gagal dimuat ulang."));
  };

  const totalStockIn = reportRows
    .filter((row) => row.type === "stock_in")
    .reduce((total, row) => total + Number(row.quantity || 0), 0);

  const totalStockOut = reportRows
    .filter((row) => row.type === "stock_out")
    .reduce((total, row) => total + Number(row.quantity || 0), 0);

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
              <option value="">Semua tipe</option>
              <option value="stock_in">Stok Masuk</option>
              <option value="stock_out">Stok Keluar</option>
            </select>
          </label>
          <div className="ss-form-actions">
            <button className="ss-secondary" type="button" onClick={resetFilters}>Reset Filter</button>
            <button className="ss-secondary" type="button" onClick={applyFilters}>Terapkan Filter</button>
            <button className="ss-primary" type="button" onClick={downloadCsv}>Ekspor CSV</button>
          </div>
        </div>
      </section>

      <section className="ss-card print-report">
        <div className="print-report-header">
          <div className="print-logo">SS</div>
          <div>
            <h1>SmartStock Pro</h1>
            <p>Sistem Manajemen Inventaris Multi Gudang</p>
          </div>
        </div>
        <h2>Laporan Transaksi Stok</h2>
        <p>Tanggal cetak: {new Date().toLocaleString("id-ID")}</p>
        <p>Filter laporan: {filters.start_date || "Semua tanggal mulai"} - {filters.end_date || "Semua tanggal selesai"} | {filters.type ? displayStockType(filters.type) : "Semua tipe transaksi"}</p>
        <div className="print-summary">
          <strong>Total transaksi: {reportRows.length}</strong>
          <strong>Total stok masuk: {totalStockIn}</strong>
          <strong>Total stok keluar: {totalStockOut}</strong>
        </div>
        <table className="print-table">
          <thead>
            <tr>
              <th>Tanggal</th>
              <th>Produk</th>
              <th>Gudang</th>
              <th>Tipe</th>
              <th>Jumlah</th>
              <th>Catatan</th>
            </tr>
          </thead>
          <tbody>
            {reportRows.length === 0 && (
              <tr><td colSpan="6">Data laporan belum tersedia.</td></tr>
            )}
            {reportRows.map((row) => (
              <tr key={row.id}>
                <td>{row.transaction_date}</td>
                <td>{row.product?.name || "-"}</td>
                <td>{row.warehouse?.name || "-"}</td>
                <td>{displayStockType(row.type)}</td>
                <td>{row.quantity}</td>
                <td>{row.notes || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
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
        <p>Role ini hanya dapat melihat dan mengekspor laporan.</p>
      </section>}
    </DashboardLayout>
  );
}
