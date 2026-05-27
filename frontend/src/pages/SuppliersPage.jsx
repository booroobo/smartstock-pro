import { useEffect, useState } from "react";
import DashboardLayout from "../components/DashboardLayout";
import DataTable from "../components/DataTable";
import Modal from "../components/Modal";
import Alert from "../components/Alert";
import { useAuth } from "../contexts/AuthContext";
import { canManageMasterData, deniedMessage } from "../utils/roles";
import {
  createSupplier,
  deleteSupplier,
  getSuppliers,
  updateSupplier,
} from "../api/supplierApi";

const emptyForm = {
  name: "",
  contact_person: "",
  phone: "",
  email: "",
  address: "",
};

export default function SuppliersPage() {
  const { user } = useAuth();
  const canManage = canManageMasterData(user?.role);
  const [suppliers, setSuppliers] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const fetchSuppliers = async () => {
    try {
      const response = await getSuppliers();
      setSuppliers(response.data.data);
    } catch (err) {
      setError(err.response?.status === 403 ? deniedMessage : "Data supplier gagal dimuat.");
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchSuppliers();
  }, []);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const handleEdit = (supplier) => {
    setEditingId(supplier.id);
    setForm({
      name: supplier.name || "",
      contact_person: supplier.contact_person || "",
      phone: supplier.phone || "",
      email: supplier.email || "",
      address: supplier.address || "",
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      editingId ? await updateSupplier(editingId, form) : await createSupplier(form);
      setModalOpen(false);
      setForm(emptyForm);
      setEditingId(null);
      await fetchSuppliers();
      setNotice("Supplier berhasil disimpan.");
    } catch (err) {
      setError(err.response?.status === 403 ? deniedMessage : "Supplier gagal disimpan. Periksa nama dan email.");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Hapus supplier ini?")) return;
    try {
      await deleteSupplier(id);
      fetchSuppliers();
    } catch (err) {
      setError(err.response?.status === 403 ? deniedMessage : "Supplier gagal dihapus.");
    }
  };

  return (
    <DashboardLayout title="Supplier" subtitle="Data master pemasok" onRefresh={fetchSuppliers}>
      {error && <Alert message={error} onClose={() => setError("")} />}
      {notice && <Alert type="info" message={notice} onClose={() => setNotice("")} />}

      <div className="ss-page-head">
        <div>
          <h1>Supplier</h1>
          <p>Kelola data pemasok untuk kebutuhan pengadaan stok.</p>
        </div>
        {canManage && <button className="ss-primary" onClick={openCreate}>
          <span className="material-symbols-outlined">add</span>
          Tambah Supplier
        </button>}
      </div>

      <section className="ss-card">
        <DataTable
          columns={[
            { key: "name", label: "Nama" },
            { key: "contact_person", label: "Kontak", render: (row) => row.contact_person || "-" },
            { key: "phone", label: "Telepon", render: (row) => row.phone || "-" },
            { key: "email", label: "Email", render: (row) => row.email || "-" },
            { key: "address", label: "Alamat", render: (row) => row.address || "-" },
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
          rows={suppliers}
        />
      </section>

      {modalOpen && (
        <Modal title={editingId ? "Ubah Supplier" : "Tambah Supplier"} onClose={() => setModalOpen(false)}>
          <form className="ss-form-grid" onSubmit={handleSubmit}>
            <label>Nama<input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></label>
            <label>Kontak Person<input value={form.contact_person} onChange={(e) => setForm({ ...form, contact_person: e.target.value })} /></label>
            <label>Telepon<input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></label>
            <label>Email<input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></label>
            <label className="span-2">Alamat<input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></label>
            <div className="ss-form-actions span-2">
              <button className="ss-secondary" type="button" onClick={() => setModalOpen(false)}>Batal</button>
              <button className="ss-primary" type="submit">Simpan</button>
            </div>
          </form>
        </Modal>
      )}
    </DashboardLayout>
  );
}
