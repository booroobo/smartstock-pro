import { useEffect, useState } from "react";
import AppNav from "../components/AppNav";
import { getAuditLogs } from "../api/auditLogApi";
import { exportStockReport } from "../api/reportApi";

export default function ReportsPage() {
  const [logs, setLogs] = useState([]);
  const [filters, setFilters] = useState({ start_date: "", end_date: "", type: "" });

  useEffect(() => {
    getAuditLogs().then((response) => setLogs(response.data.data));
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
  };

  return (
    <div className="app-shell">
      <AppNav />
      <main className="content">
        <div className="page-header"><div><h1>Reports</h1><p>Export transaksi stok dan lihat audit log terakhir.</p></div></div>
        <section className="panel">
          <div className="form-grid">
            <input type="date" value={filters.start_date} onChange={(e) => setFilters({ ...filters, start_date: e.target.value })} />
            <input type="date" value={filters.end_date} onChange={(e) => setFilters({ ...filters, end_date: e.target.value })} />
            <select value={filters.type} onChange={(e) => setFilters({ ...filters, type: e.target.value })}>
              <option value="">Semua tipe</option><option value="stock_in">Stock In</option><option value="stock_out">Stock Out</option>
            </select>
            <button onClick={downloadCsv}>Export CSV</button>
          </div>
        </section>
        <section className="panel">
          <h2>Audit Logs</h2>
          <table>
            <thead><tr><th>Time</th><th>Action</th><th>Table</th><th>Record</th></tr></thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id}><td>{log.created_at}</td><td>{log.action}</td><td>{log.table_name}</td><td>{log.record_id}</td></tr>
              ))}
            </tbody>
          </table>
        </section>
      </main>
    </div>
  );
}
