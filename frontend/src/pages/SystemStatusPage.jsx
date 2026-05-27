import { useEffect, useState } from "react";
import DashboardLayout from "../components/DashboardLayout";
import SummaryCard from "../components/SummaryCard";
import { getHealth } from "../api/systemApi";

export default function SystemStatusPage() {
  const [status, setStatus] = useState(null);

  const fetchStatus = async () => {
    const response = await getHealth();
    setStatus(response.data.data);
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchStatus();
  }, []);

  return (
    <DashboardLayout title="Status Sistem" subtitle="Health check" onRefresh={fetchStatus}>
      <div className="ss-page-head">
        <div>
          <h1>Status Sistem</h1>
          <p>Health check API dan database.</p>
        </div>
        <button className="ss-primary" onClick={fetchStatus}>
          <span className="material-symbols-outlined">terminal</span>
          Lihat Status Sistem
        </button>
      </div>

      <section className="ss-grid-4">
        <SummaryCard label="API" value={status?.api_status || "-"} icon="cloud_done" hint="Online" />
        <SummaryCard label="Database" value={status?.database_status || "-"} icon="database" hint="PostgreSQL" />
        <SummaryCard label="Versi" value={status?.app_version || "-"} icon="new_releases" hint="MVP" />
        <SummaryCard label="Timestamp" value={status?.timestamp ? new Date(status.timestamp).toLocaleTimeString("id-ID") : "-"} icon="schedule" hint="Terbaru" />
      </section>

      <section className="ss-card">
        <h2>Utilisasi Resource</h2>
        {["Penggunaan CPU", "Memori", "Disk IOPS", "Jaringan"].map((metric, index) => (
          <div className="ss-progress" style={{ width: "100%", marginBottom: 22 }} key={metric}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <strong>{metric}</strong>
              <span>{(index + 1) * 20}%</span>
            </div>
            <div className="ss-progress-track">
              <div className="ss-progress-bar" style={{ width: `${(index + 1) * 20}%` }} />
            </div>
          </div>
        ))}
      </section>
    </DashboardLayout>
  );
}
