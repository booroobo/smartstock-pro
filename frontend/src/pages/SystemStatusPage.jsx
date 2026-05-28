import { useEffect, useState } from "react";
import DashboardLayout from "../components/DashboardLayout";
import SummaryCard from "../components/SummaryCard";
import DataTable from "../components/DataTable";
import Alert from "../components/Alert";
import { useAuth } from "../contexts/AuthContext";
import { getHealth } from "../api/systemApi";
import { getErrorLogs } from "../api/errorLogApi";
import { canViewAuditLogs } from "../utils/roles";

export default function SystemStatusPage() {
  const { user } = useAuth();
  const canSeeErrorLogs = canViewAuditLogs(user?.role);
  const [status, setStatus] = useState(null);
  const [errorLogs, setErrorLogs] = useState([]);
  const [severity, setSeverity] = useState("");
  const [error, setError] = useState("");

  const fetchStatus = async () => {
    try {
      const response = await getHealth();
      setStatus(response.data.data);
    } catch {
      setError("Status sistem gagal dimuat.");
    }
  };

  const fetchErrorLogs = async (selectedSeverity = severity) => {
    if (!canSeeErrorLogs) return;
    try {
      const response = await getErrorLogs({ severity: selectedSeverity, per_page: 10 });
      const payload = response.data.data;
      setErrorLogs(payload.data || payload);
    } catch {
      setError("Error log gagal dimuat.");
    }
  };

  const refreshAll = () => {
    fetchStatus();
    fetchErrorLogs();
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchStatus();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchErrorLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <DashboardLayout title="Status Sistem" subtitle="Health check" onRefresh={refreshAll}>
      {error && <Alert message={error} onClose={() => setError("")} />}
      {Number(status?.response_time_ms || 0) > 1000 && (
        <Alert type="error" message="Response time API melebihi 1000 ms. Perlu pemeriksaan performa." />
      )}
      <div className="ss-page-head">
        <div>
          <h1>Status Sistem</h1>
          <p>Health check API dan database.</p>
        </div>
        <button className="ss-primary" onClick={refreshAll}>
          <span className="material-symbols-outlined">terminal</span>
          Lihat Status Sistem
        </button>
      </div>

      <section className="ss-grid-4">
        <SummaryCard label="API" value={status?.api_status || "-"} icon="cloud_done" hint="Online" />
        <SummaryCard label="Database" value={status?.database_status || "-"} icon="database" hint="PostgreSQL" />
        <SummaryCard label="Response Time" value={status?.response_time_ms ? `${status.response_time_ms} ms` : "-"} icon="speed" hint={Number(status?.response_time_ms || 0) > 1000 ? "Warning" : "Normal"} />
        <SummaryCard label="Environment" value={status?.environment || "-"} icon="terminal" hint={status?.app_name || "SmartStock Pro"} />
      </section>

      {canSeeErrorLogs && <section className="ss-card">
        <div className="ss-page-head compact">
          <div>
            <h2>Error Logs</h2>
            <p>Log error nyata yang dicatat backend.</p>
          </div>
          <div className="ss-actions">
            <select value={severity} onChange={(e) => { setSeverity(e.target.value); fetchErrorLogs(e.target.value); }}>
              <option value="">Semua severity</option>
              <option value="info">Info</option>
              <option value="warning">Warning</option>
              <option value="critical">Critical</option>
            </select>
            <button className="ss-secondary" onClick={() => fetchErrorLogs()}>Muat Ulang</button>
          </div>
        </div>
        <DataTable
          columns={[
            { key: "created_at", label: "Waktu" },
            { key: "severity", label: "Severity", render: (row) => <span className={`ss-badge ${row.severity === "critical" ? "danger" : row.severity === "warning" ? "warning" : "success"}`}>{row.severity}</span> },
            { key: "source", label: "Source" },
            { key: "message", label: "Message" },
            { key: "user", label: "User", render: (row) => row.user?.name || "-" },
            { key: "ip_address", label: "IP Address", render: (row) => row.ip_address || "-" },
          ]}
          rows={errorLogs}
        />
      </section>}
    </DashboardLayout>
  );
}
