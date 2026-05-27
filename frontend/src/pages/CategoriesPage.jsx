import { useEffect, useState } from "react";
import DashboardLayout from "../components/DashboardLayout";
import DataTable from "../components/DataTable";
import Modal from "../components/Modal";
import Alert from "../components/Alert";
import { useAuth } from "../contexts/AuthContext";
import { canManageMasterData, deniedMessage } from "../utils/roles";
import {
  createCategory,
  deleteCategory,
  getCategories,
  updateCategory,
} from "../api/categoryApi";

const emptyForm = { name: "", description: "" };

export default function CategoriesPage() {
  const { user } = useAuth();
  const canManage = canManageMasterData(user?.role);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const fetchCategories = async () => {
    try {
      const response = await getCategories();
      setCategories(response.data.data);
    } catch (err) {
      if (err.response?.status === 403) setError(deniedMessage);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchCategories();
  }, []);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      editingId ? await updateCategory(editingId, form) : await createCategory(form);
      setModalOpen(false);
      setForm(emptyForm);
      setEditingId(null);
      await fetchCategories();
      setNotice("Kategori berhasil disimpan.");
    } catch (err) {
      setError(err.response?.status === 403 ? deniedMessage : "Kategori produk gagal disimpan.");
    }
  };

  const handleEdit = (category) => {
    setEditingId(category.id);
    setForm({ name: category.name, description: category.description || "" });
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("Hapus kategori produk ini?")) return;
    try {
      await deleteCategory(id);
      fetchCategories();
    } catch (err) {
      setError(err.response?.status === 403 ? deniedMessage : "Kategori produk gagal dihapus.");
    }
  };

  return (
    <DashboardLayout title="Kategori Produk" subtitle="Struktur katalog" onRefresh={fetchCategories}>
      {error && <Alert message={error} onClose={() => setError("")} />}
      {notice && <Alert type="info" message={notice} onClose={() => setNotice("")} />}

      <div className="ss-page-head">
        <div>
          <h1>Kategori Produk</h1>
          <p>Kelola kategori produk inventaris.</p>
        </div>
        {canManage && <button className="ss-primary" onClick={openCreate}>
          <span className="material-symbols-outlined">add</span>
          Tambah Kategori
        </button>}
      </div>

      <section className="ss-card">
        <DataTable
          columns={[
            { key: "name", label: "Nama" },
            { key: "description", label: "Deskripsi", render: (row) => row.description || "-" },
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
          rows={categories}
        />
      </section>

      {modalOpen && (
        <Modal title={editingId ? "Ubah Kategori" : "Tambah Kategori"} onClose={() => setModalOpen(false)}>
          <form className="ss-form-grid" onSubmit={handleSubmit}>
            <label>
              Nama Kategori
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </label>
            <label>
              Deskripsi
              <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </label>
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
