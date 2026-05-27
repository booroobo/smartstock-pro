import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../components/DashboardLayout";
import DataTable from "../components/DataTable";
import Modal from "../components/Modal";
import ProductForm from "../components/ProductForm";
import Alert from "../components/Alert";
import { useAuth } from "../contexts/AuthContext";
import { getCategories } from "../api/categoryApi";
import { createProduct, deleteProduct, getProducts, updateProduct } from "../api/productApi";
import { canManageMasterData, deniedMessage } from "../utils/roles";

const emptyForm = {
  product_category_id: "",
  sku: "",
  name: "",
  description: "",
  minimum_stock: 0,
  unit: "pcs",
  image: null,
};

export default function ProductsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const canManage = canManageMasterData(user?.role);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const imagePreview = useMemo(() => {
    if (!form.image) return "";
    return URL.createObjectURL(form.image);
  }, [form.image]);

  const fetchData = async () => {
    try {
      const [categoryResponse, productResponse] = await Promise.all([getCategories(), getProducts()]);
      setCategories(categoryResponse.data.data);
      setProducts(productResponse.data.data);
    } catch (err) {
      setError(err.response?.status === 403 ? deniedMessage : "Data produk gagal dimuat.");
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchData();
  }, []);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const buildFormData = () => {
    const data = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      if (value !== null) data.append(key, value);
    });
    if (editingId) data.append("_method", "PUT");
    return data;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      editingId ? await updateProduct(editingId, buildFormData()) : await createProduct(buildFormData());
      setModalOpen(false);
      setForm(emptyForm);
      setEditingId(null);
      await fetchData();
      setNotice("Produk berhasil disimpan.");
    } catch (err) {
      setError(err.response?.status === 403 ? deniedMessage : "Produk gagal disimpan. Pastikan kategori dan gambar valid.");
    }
  };

  const handleEdit = (product) => {
    setEditingId(product.id);
    setForm({
      product_category_id: product.product_category_id,
      sku: product.sku || "",
      name: product.name,
      description: product.description || "",
      minimum_stock: product.minimum_stock,
      unit: product.unit || "pcs",
      image: null,
    });
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("Hapus produk ini?")) return;
    try {
      await deleteProduct(id);
      fetchData();
    } catch (err) {
      setError(err.response?.status === 403 ? deniedMessage : "Produk gagal dihapus.");
    }
  };

  const stockTone = (product) => {
    if (product.current_stock <= product.minimum_stock) return "danger";
    if (product.current_stock <= product.minimum_stock * 2) return "warning";
    return "";
  };

  return (
    <DashboardLayout title="Inventaris Produk" subtitle={`${products.length} produk aktif`} onRefresh={fetchData}>
      {error && <Alert message={error} onClose={() => setError("")} />}
      {notice && <Alert type="info" message={notice} onClose={() => setNotice("")} />}

      <div className="ss-page-head">
        <div>
          <h1>Inventaris Produk</h1>
          <p>Kelola stok aktif, SKU, gambar, dan batas minimum.</p>
        </div>
        <div className="ss-actions">
          <button className="ss-ghost" onClick={() => navigate("/reports")}>
            <span className="material-symbols-outlined">file_download</span>
            Ekspor CSV
          </button>
          {canManage && <button className="ss-primary" onClick={openCreate}>
            <span className="material-symbols-outlined">add</span>
            Tambah Produk
          </button>}
        </div>
      </div>

      <section className="ss-card">
        <DataTable
          columns={[
            {
              key: "name",
              label: "Produk",
              render: (row) => (
                <div className="ss-product-cell">
                  {row.image_url ? <img className="ss-thumb" src={row.image_url} alt={row.name} /> : <span className="ss-thumb" />}
                  <strong>{row.name}</strong>
                </div>
              ),
            },
            { key: "sku", label: "SKU", render: (row) => row.sku || "-" },
            { key: "category", label: "Kategori", render: (row) => row.category?.name || "-" },
            {
              key: "stock",
              label: "Level Stok",
              render: (row) => {
                const pct = Math.min(100, row.minimum_stock > 0 ? (row.current_stock / (row.minimum_stock * 3)) * 100 : 100);
                const tone = stockTone(row);
                return (
                  <div className="ss-progress">
                    <div className="ss-progress-track"><div className={`ss-progress-bar ${tone}`} style={{ width: `${pct}%` }} /></div>
                    <small>{row.current_stock} {row.unit}</small>
                  </div>
                );
              },
            },
            {
              key: "status",
              label: "Status",
              render: (row) => <span className={`ss-badge ${stockTone(row) || "success"}`}>{stockTone(row) === "danger" ? "Kritis" : "Tersedia"}</span>,
            },
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
          rows={products}
        />
      </section>

      {modalOpen && (
        <Modal title={editingId ? "Ubah Produk" : "Tambah Produk"} onClose={() => setModalOpen(false)}>
          <ProductForm
            form={form}
            setForm={setForm}
            categories={categories}
            editingId={editingId}
            imagePreview={imagePreview}
            onSubmit={handleSubmit}
            onCancel={() => setModalOpen(false)}
          />
        </Modal>
      )}
    </DashboardLayout>
  );
}
