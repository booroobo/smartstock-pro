import { useEffect, useState } from "react";
import DashboardLayout from "../components/DashboardLayout";
import DataTable from "../components/DataTable";
import Modal from "../components/Modal";
import WarehouseForm from "../components/WarehouseForm";
import WarehouseMap from "../components/WarehouseMap";
import Alert from "../components/Alert";
import { useAuth } from "../contexts/AuthContext";
import { canManageMasterData, deniedMessage } from "../utils/roles";
import {
  createWarehouse,
  deleteWarehouse,
  getWarehouses,
  updateWarehouse,
} from "../api/warehouseApi";

const emptyForm = { name: "", location: "", latitude: "", longitude: "", description: "" };

export default function WarehousesPage() {
  const { user } = useAuth();
  const canManage = canManageMasterData(user?.role);
  const [warehouses, setWarehouses] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [error, setError] = useState("");

  const fetchWarehouses = async () => {
    try {
      const response = await getWarehouses();
      setWarehouses(response.data.data);
    } catch (err) {
      setError(err.response?.status === 403 ? deniedMessage : "Data gudang gagal dimuat.");
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchWarehouses();
  }, []);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      editingId ? await updateWarehouse(editingId, form) : await createWarehouse(form);
      setModalOpen(false);
      setForm(emptyForm);
      setEditingId(null);
      fetchWarehouses();
    } catch (err) {
      setError(err.response?.status === 403 ? deniedMessage : "Gudang gagal disimpan.");
    }
  };

  const handleEdit = (warehouse) => {
    setEditingId(warehouse.id);
    setForm({
      name: warehouse.name,
      location: warehouse.location || "",
      latitude: warehouse.latitude || "",
      longitude: warehouse.longitude || "",
      description: warehouse.description || "",
    });
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("Hapus gudang ini?")) return;
    try {
      await deleteWarehouse(id);
      fetchWarehouses();
    } catch (err) {
      setError(err.response?.status === 403 ? deniedMessage : "Gudang gagal dihapus.");
    }
  };

  return (
    <DashboardLayout title="Manajemen Gudang" subtitle="Distribusi regional" onRefresh={fetchWarehouses}>
      {error && <Alert message={error} onClose={() => setError("")} />}
      <div className="ss-page-head">
        <div>
          <h1>Gudang</h1>
          <p>Kelola gudang penyimpanan stok.</p>
        </div>
        {canManage && <button className="ss-primary" onClick={openCreate}>
          <span className="material-symbols-outlined">add</span>
          Tambah Gudang
        </button>}
      </div>

      <div className="ss-grid-2">
        <section className="ss-card">
          <h2>Peta Lokasi Gudang</h2>
          <WarehouseMap warehouses={warehouses} />
        </section>
        <section className="ss-card">
          <h2>Daftar Gudang</h2>
          <DataTable
            columns={[
              { key: "name", label: "Nama" },
              { key: "location", label: "Lokasi", render: (row) => row.location || "-" },
              { key: "coordinates", label: "Koordinat", render: (row) => row.latitude && row.longitude ? `${row.latitude}, ${row.longitude}` : "-" },
              {
                key: "actions",
                label: "Aksi",
                render: (row) => canManage ? (
                  <div className="ss-actions">
                    <button className="ss-secondary" onClick={() => handleEdit(row)}>Ubah</button>
                    <button className="ss-danger" onClick={() => handleDelete(row.id)}>Hapus</button>
                  </div>
                ) : "-",
              },
            ]}
            rows={warehouses}
          />
        </section>
      </div>

      {modalOpen && (
        <Modal title={editingId ? "Ubah Gudang" : "Tambah Gudang"} onClose={() => setModalOpen(false)}>
          <WarehouseForm
            form={form}
            setForm={setForm}
            editingId={editingId}
            onSubmit={handleSubmit}
            onCancel={() => setModalOpen(false)}
          />
        </Modal>
      )}
    </DashboardLayout>
  );
}
