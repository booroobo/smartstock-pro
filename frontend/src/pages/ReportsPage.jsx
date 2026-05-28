import { useEffect, useState } from "react";
import DashboardLayout from "../components/DashboardLayout";
import DataTable from "../components/DataTable";
import Alert from "../components/Alert";
import { useAuth } from "../contexts/AuthContext";
import { getAuditLogs } from "../api/auditLogApi";
import { downloadReportJob, exportStockReport, generateStockReport, getReportJobs } from "../api/reportApi";
import { getTransactions } from "../api/transactionApi";
import { getDashboard } from "../api/dashboardApi";
import { canViewAuditLogs, deniedMessage, displayStockType } from "../utils/roles";

const formatRupiah = (value) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

export default function ReportsPage() {
  const { user } = useAuth();
  const canSeeAudit = canViewAuditLogs(user?.role);
  const [logs, setLogs] = useState([]);
  const [reportJobs, setReportJobs] = useState([]);
  const [reportRows, setReportRows] = useState([]);
  const [inventoryValue, setInventoryValue] = useState(0);
  const [filters, setFilters] = useState({ start_date: "", end_date: "", type: "" });
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  const fetchLogs = async () => {
    if (!canSeeAudit) return;
    try {
      const [auditResponse, reportJobResponse] = await Promise.all([
        getAuditLogs(),
        getReportJobs({ per_page: 10 }),
      ]);
      setLogs(auditResponse.data.data);
      const payload = reportJobResponse.data.data;
      setReportJobs(payload.data || payload);
    } catch (err) {
      setError(err.response?.status === 403 ? deniedMessage : "Data laporan gagal dimuat.");
    }
  };

  const fetchReportRows = async (nextFilters = filters) => {
    const [transactionResponse, dashboardResponse] = await Promise.all([
      getTransactions({
        ...nextFilters,
        per_page: 100,
        sort_by: "transaction_date",
        sort_direction: "desc",
      }),
      getDashboard(),
    ]);
    const payload = transactionResponse.data.data;
    setReportRows(payload.data || payload);
    setInventoryValue(dashboardResponse.data.data?.total_inventory_value || 0);
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

  const generateBackgroundReport = async () => {
    try {
      await generateStockReport();
      setNotice("Generate laporan besar masuk ke antrian. Jalankan queue worker untuk memproses.");
      await fetchLogs();
    } catch (err) {
      setError(err.response?.status === 403 ? deniedMessage : "Generate laporan gagal dimulai.");
    }
  };

  const downloadGeneratedReport = async (job) => {
    try {
      const response = await downloadReportJob(job.id);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `smartstock-background-report-${job.id}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      setError("File laporan belum tersedia.");
    }
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

  const totalTransactionValue = reportRows
    .reduce((total, row) => total + (Number(row.quantity || 0) * Number(row.product?.unit_price || 0)), 0);

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

      {canSeeAudit && <section className="ss-card">
        <div className="ss-page-head compact">
          <div>
            <h2>Generate Laporan Besar</h2>
            <p>Laporan CSV dibuat di background menggunakan Laravel Queue database.</p>
          </div>
          <div className="ss-actions">
            <button className="ss-secondary" type="button" onClick={fetchLogs}>Muat Ulang</button>
            <button className="ss-primary" type="button" onClick={generateBackgroundReport}>
              <span className="material-symbols-outlined">playlist_add_check</span>
              Generate Laporan
            </button>
          </div>
        </div>
        <DataTable
          columns={[
            { key: "created_at", label: "Waktu" },
            { key: "type", label: "Tipe" },
            { key: "status", label: "Status", render: (row) => <span className={`ss-badge ${row.status === "failed" ? "danger" : row.status === "completed" ? "success" : "warning"}`}>{row.status}</span> },
            { key: "user", label: "User", render: (row) => row.user?.name || "-" },
            { key: "error_message", label: "Error", render: (row) => row.error_message || "-" },
            {
              key: "download",
              label: "Download",
              render: (row) => row.status === "completed" ? (
                <button className="ss-secondary" onClick={() => downloadGeneratedReport(row)}>Download</button>
              ) : "-",
            },
          ]}
          rows={reportJobs}
        />
      </section>}

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
          <strong>Nilai transaksi: {formatRupiah(totalTransactionValue)}</strong>
          <strong>Nilai inventaris: {formatRupiah(inventoryValue)}</strong>
        </div>
        <table className="print-table">
          <thead>
            <tr>
              <th>Tanggal</th>
              <th>Produk</th>
              <th>Gudang</th>
              <th>Tipe</th>
              <th>Jumlah</th>
              <th>Harga Satuan</th>
              <th>Nilai</th>
              <th>Catatan</th>
            </tr>
          </thead>
          <tbody>
            {reportRows.length === 0 && (
              <tr><td colSpan="8">Data laporan belum tersedia.</td></tr>
            )}
            {reportRows.map((row) => (
              <tr key={row.id}>
                <td>{row.transaction_date}</td>
                <td>{row.product?.name || "-"}</td>
                <td>{row.warehouse?.name || "-"}</td>
                <td>{displayStockType(row.type)}</td>
                <td>{row.quantity}</td>
                <td>{formatRupiah(row.product?.unit_price)}</td>
                <td>{formatRupiah(Number(row.quantity || 0) * Number(row.product?.unit_price || 0))}</td>
                <td>{row.notes || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <footer className="print-footer">
          <p>Dicetak dari SmartStock Pro. Laporan ini dibuat menggunakan fitur print browser.</p>
        </footer>
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
