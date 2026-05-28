import { useEffect, useState } from "react";
import DashboardLayout from "../components/DashboardLayout";
import DataTable from "../components/DataTable";
import Alert from "../components/Alert";
import { getImportJobs } from "../api/importApi";
import { getReportJobs } from "../api/reportApi";
import { deniedMessage } from "../utils/roles";

export default function QueueJobsPage() {
  const [importJobs, setImportJobs] = useState([]);
  const [reportJobs, setReportJobs] = useState([]);
  const [error, setError] = useState("");

  const fetchJobs = async () => {
    try {
      const [importResponse, reportResponse] = await Promise.all([
        getImportJobs({ per_page: 10 }),
        getReportJobs({ per_page: 10 }),
      ]);
      const importPayload = importResponse.data.data;
      const reportPayload = reportResponse.data.data;
      setImportJobs(importPayload.data || importPayload);
      setReportJobs(reportPayload.data || reportPayload);
    } catch (err) {
      setError(err.response?.status === 403 ? deniedMessage : "Data antrian proses gagal dimuat.");
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchJobs();
  }, []);

  return (
    <DashboardLayout title="Antrian Proses" subtitle="Status queue import dan laporan" onRefresh={fetchJobs}>
      {error && <Alert message={error} onClose={() => setError("")} />}

      <div className="ss-page-head">
        <div>
          <h1>Antrian Proses</h1>
          <p>Status pekerjaan background yang diproses Laravel Queue database.</p>
        </div>
        <button className="ss-primary" onClick={fetchJobs}>
          <span className="material-symbols-outlined">refresh</span>
          Muat Ulang
        </button>
      </div>

      <section className="ss-card">
        <h2>Import Produk</h2>
        <DataTable
          columns={[
            { key: "created_at", label: "Waktu" },
            { key: "filename", label: "File" },
            { key: "status", label: "Status", render: (row) => <span className={`ss-badge ${row.status === "failed" ? "danger" : row.status === "completed" ? "success" : "warning"}`}>{row.status}</span> },
            { key: "success_rows", label: "Berhasil" },
            { key: "failed_rows", label: "Gagal" },
          ]}
          rows={importJobs}
        />
      </section>

      <section className="ss-card">
        <h2>Generate Laporan</h2>
        <DataTable
          columns={[
            { key: "created_at", label: "Waktu" },
            { key: "type", label: "Tipe" },
            { key: "status", label: "Status", render: (row) => <span className={`ss-badge ${row.status === "failed" ? "danger" : row.status === "completed" ? "success" : "warning"}`}>{row.status}</span> },
            { key: "file_path", label: "File", render: (row) => row.file_path || "-" },
          ]}
          rows={reportJobs}
        />
      </section>
    </DashboardLayout>
  );
}
