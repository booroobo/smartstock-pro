import { useEffect, useState } from "react";
import DashboardLayout from "../components/DashboardLayout";
import DataTable from "../components/DataTable";
import Alert from "../components/Alert";
import { getImportJobs, uploadProductImport } from "../api/importApi";
import { deniedMessage } from "../utils/roles";

export default function ImportDataPage() {
  const [file, setFile] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  const fetchJobs = async () => {
    try {
      const response = await getImportJobs({ per_page: 20 });
      const payload = response.data.data;
      setJobs(payload.data || payload);
    } catch (err) {
      setError(err.response?.status === 403 ? deniedMessage : "Data import job gagal dimuat.");
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchJobs();
  }, []);

  const handleUpload = async (event) => {
    event.preventDefault();
    if (!file) {
      setError("Pilih file CSV terlebih dahulu.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      await uploadProductImport(formData);
      setFile(null);
      event.target.reset();
      setNotice("File CSV masuk ke antrian import. Jalankan queue worker untuk memproses.");
      await fetchJobs();
    } catch (err) {
      setError(err.response?.status === 403 ? deniedMessage : (err.response?.data?.message || "Upload CSV gagal."));
    }
  };

  return (
    <DashboardLayout title="Impor Data" subtitle="Import produk via CSV dan queue" onRefresh={fetchJobs}>
      {error && <Alert message={error} onClose={() => setError("")} />}
      {notice && <Alert type="info" message={notice} onClose={() => setNotice("")} />}

      <div className="ss-page-head">
        <div>
          <h1>Impor Data Produk</h1>
          <p>Upload CSV produk untuk diproses oleh Laravel Queue database.</p>
        </div>
        <button className="ss-primary" onClick={fetchJobs}>
          <span className="material-symbols-outlined">refresh</span>
          Muat Ulang
        </button>
      </div>

      <section className="ss-card">
        <h2>Upload CSV Produk</h2>
        <form className="ss-form-grid" onSubmit={handleUpload}>
          <label className="span-2">
            File CSV Maksimal 5MB
            <input type="file" accept=".csv,text/csv" onChange={(event) => setFile(event.target.files[0] || null)} />
          </label>
          <div className="ss-form-actions span-2">
            <button className="ss-primary" type="submit">
              <span className="material-symbols-outlined">upload_file</span>
              Upload dan Proses Queue
            </button>
          </div>
        </form>
      </section>

      <section className="ss-card">
        <h2>Format Template CSV</h2>
        <pre className="ss-code-block">sku,name,category,warehouse,supplier,current_stock,minimum_stock,unit_price
SKU-001,Kabel LAN,Elektronik,Gudang Jakarta,PT Sumber Jaya,50,10,25000</pre>
      </section>

      <section className="ss-card">
        <h2>Status Import Job</h2>
        <DataTable
          columns={[
            { key: "created_at", label: "Waktu" },
            { key: "filename", label: "File" },
            { key: "status", label: "Status", render: (row) => <span className={`ss-badge ${row.status === "failed" ? "danger" : row.status === "completed" ? "success" : "warning"}`}>{row.status}</span> },
            { key: "total_rows", label: "Total" },
            { key: "success_rows", label: "Berhasil" },
            { key: "failed_rows", label: "Gagal" },
            { key: "error_message", label: "Error", render: (row) => row.error_message || "-" },
          ]}
          rows={jobs}
        />
      </section>
    </DashboardLayout>
  );
}
