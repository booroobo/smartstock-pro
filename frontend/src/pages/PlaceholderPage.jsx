import DashboardLayout from "../components/DashboardLayout";

const copy = {
  suppliers: ["Supplier", "Manajemen pemasok"],
  audit: ["Log Aktivitas", "Pratinjau aktivitas keamanan dan operasional"],
  import: ["Impor Data", "Pratinjau proses unggah data massal"],
  queue: ["Antrian Proses", "Pratinjau monitoring background job"],
  roles: ["Hak Akses", "Pratinjau kontrol role dan izin"],
};

export default function PlaceholderPage({ type }) {
  const [title, subtitle] = copy[type] || ["Simulasi MVP", "Disiapkan untuk pengembangan lanjutan."];

  return (
    <DashboardLayout title={title} subtitle="Simulasi MVP">
      <section className="ss-card ss-preview">
        <span className="material-symbols-outlined">construction</span>
        <h1>{title}</h1>
        <p>{subtitle}</p>
        <span className="ss-badge preview">Simulasi MVP</span>
      </section>
    </DashboardLayout>
  );
}
