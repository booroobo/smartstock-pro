import { useEffect, useState } from "react";
import AppNav from "../components/AppNav";
import { getHealth } from "../api/systemApi";

export default function SystemStatusPage() {
  const [status, setStatus] = useState(null);

  useEffect(() => {
    getHealth().then((response) => setStatus(response.data.data));
  }, []);

  return (
    <div className="app-shell">
      <AppNav />
      <main className="content">
        <div className="page-header"><div><h1>System Status</h1><p>Health check API dan database.</p></div></div>
        <section className="metric-grid">
          <div className="metric"><span>API</span><strong>{status?.api_status || "-"}</strong></div>
          <div className="metric"><span>Database</span><strong>{status?.database_status || "-"}</strong></div>
          <div className="metric"><span>Version</span><strong>{status?.app_version || "-"}</strong></div>
          <div className="metric"><span>Timestamp</span><strong>{status?.timestamp || "-"}</strong></div>
        </section>
      </main>
    </div>
  );
}
