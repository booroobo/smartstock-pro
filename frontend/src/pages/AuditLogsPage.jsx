import { useEffect, useState } from "react";
import DashboardLayout from "../components/DashboardLayout";
import DataTable from "../components/DataTable";
import Alert from "../components/Alert";
import { getAuditLogs } from "../api/auditLogApi";
import { deniedMessage } from "../utils/roles";

export default function AuditLogsPage() {
  const [logs, setLogs] = useState([]);
  const [error, setError] = useState("");

  const fetchLogs = async () => {
    setError("");
    try {
      const response = await getAuditLogs();
      setLogs(response.data.data);
    } catch {
      setError(err.response?.status === 403 ? deniedMessage : "Log aktivitas gagal dimuat.");
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchLogs();
  }, []);

  return (
    <DashboardLayout title="Log Aktivitas" subtitle="Riwayat aktivitas hanya baca" onRefresh={fetchLogs}>
      {error && <Alert message={error} onClose={() => setError("")} />}
      <div className="ss-page-head">
        <div>
          <h1>Log Aktivitas</h1>
          <p>Log aktivitas create, update, dan delete untuk kebutuhan audit BNSP.</p>
        </div>
        <span className="ss-badge success">Hanya Baca</span>
      </div>
      <section className="ss-card">
        <DataTable
          columns={[
            { key: "timestamp", label: "Waktu", render: (row) => row.timestamp || row.created_at },
            { key: "user", label: "Pengguna", render: (row) => row.user?.name || "-" },
            { key: "action", label: "Aksi" },
            { key: "module", label: "Modul", render: (row) => row.module || row.table_name || "-" },
            { key: "description", label: "Deskripsi", render: (row) => row.description || "-" },
            { key: "ip_address", label: "Alamat IP", render: (row) => row.ip_address || "-" },
          ]}
          rows={logs}
        />
      </section>
    </DashboardLayout>
  );
}
