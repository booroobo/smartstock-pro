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
import { getWarehouses } from "../api/warehouseApi";
import { getSuppliers } from "../api/supplierApi";
import { canManageMasterData, deniedMessage } from "../utils/roles";

const emptyForm = {
  product_category_id: "",
  supplier_id: "",
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
  const [warehouses, setWarehouses] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({ current_page: 1, last_page: 1, total: 0 });
  const [filters, setFilters] = useState({
    search: "",
    category_id: "",
    warehouse_id: "",
    supplier_id: "",
    status: "",
    sort_by: "created_at",
    sort_direction: "desc",
    page: 1,
    per_page: 10,
  });
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const imagePreview = useMemo(() => {
    if (!form.image) return "";
    return URL.createObjectURL(form.image);
  }, [form.image]);

  const fetchData = async (params = filters) => {
    try {
      const [categoryResponse, warehouseResponse, supplierResponse, productResponse] = await Promise.all([
        getCategories(),
        getWarehouses(),
        getSuppliers(),
        getProducts(params),
      ]);
      setCategories(categoryResponse.data.data);
      setWarehouses(warehouseResponse.data.data);
      setSuppliers(supplierResponse.data.data);
      const payload = productResponse.data.data;
      setProducts(payload.data || payload);
      setPagination({
        current_page: payload.current_page || 1,
        last_page: payload.last_page || 1,
        total: payload.total || (payload.data || payload).length,
      });
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
      supplier_id: product.supplier_id || "",
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

  const applyFilters = (e) => {
    e.preventDefault();
    const next = { ...filters, page: 1 };
    setFilters(next);
    fetchData(next);
  };

  const resetFilters = () => {
    const next = {
      search: "",
      category_id: "",
      warehouse_id: "",
      supplier_id: "",
      status: "",
      sort_by: "created_at",
      sort_direction: "desc",
      page: 1,
      per_page: 10,
    };
    setFilters(next);
    fetchData(next);
  };

  const goToPage = (page) => {
    const next = { ...filters, page };
    setFilters(next);
    fetchData(next);
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
        <h2>Filter Produk</h2>
        <form className="ss-form-grid" onSubmit={applyFilters}>
          <label>Cari Produk / SKU<input value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })} placeholder="Cari nama atau SKU" /></label>
          <label>
            Kategori
            <select value={filters.category_id} onChange={(e) => setFilters({ ...filters, category_id: e.target.value })}>
              <option value="">Semua kategori</option>
              {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
            </select>
          </label>
          <label>
            Gudang
            <select value={filters.warehouse_id} onChange={(e) => setFilters({ ...filters, warehouse_id: e.target.value })}>
              <option value="">Semua gudang</option>
              {warehouses.map((warehouse) => <option key={warehouse.id} value={warehouse.id}>{warehouse.name}</option>)}
            </select>
          </label>
          <label>
            Supplier
            <select value={filters.supplier_id} onChange={(e) => setFilters({ ...filters, supplier_id: e.target.value })}>
              <option value="">Semua supplier</option>
              {suppliers.map((supplier) => <option key={supplier.id} value={supplier.id}>{supplier.name}</option>)}
            </select>
          </label>
          <label>
            Status
            <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
              <option value="">Semua status</option>
              <option value="in_stock">Tersedia</option>
              <option value="low_stock">Stok Rendah</option>
              <option value="out_of_stock">Stok Habis</option>
            </select>
          </label>
          <label>
            Urutkan
            <select value={filters.sort_by} onChange={(e) => setFilters({ ...filters, sort_by: e.target.value })}>
              <option value="created_at">Tanggal dibuat</option>
              <option value="updated_at">Tanggal diubah</option>
              <option value="name">Nama</option>
              <option value="sku">SKU</option>
              <option value="current_stock">Stok saat ini</option>
              <option value="minimum_stock">Stok minimum</option>
            </select>
          </label>
          <label>
            Arah
            <select value={filters.sort_direction} onChange={(e) => setFilters({ ...filters, sort_direction: e.target.value })}>
              <option value="desc">Terbaru/Tertinggi</option>
              <option value="asc">Terlama/Terendah</option>
            </select>
          </label>
          <label>
            Per Halaman
            <select value={filters.per_page} onChange={(e) => setFilters({ ...filters, per_page: Number(e.target.value) })}>
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
            </select>
          </label>
          <div className="ss-form-actions span-2">
            <button className="ss-secondary" type="button" onClick={resetFilters}>Reset Filter</button>
            <button className="ss-primary" type="submit">Terapkan Filter</button>
          </div>
        </form>
      </section>

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
            { key: "supplier", label: "Supplier", render: (row) => row.supplier?.name || "-" },
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
        <div className="ss-pagination">
          <button className="ss-secondary" disabled={pagination.current_page <= 1} onClick={() => goToPage(pagination.current_page - 1)}>Sebelumnya</button>
          <span>Halaman {pagination.current_page} dari {pagination.last_page} ({pagination.total} data)</span>
          <button className="ss-secondary" disabled={pagination.current_page >= pagination.last_page} onClick={() => goToPage(pagination.current_page + 1)}>Berikutnya</button>
        </div>
      </section>

      {modalOpen && (
        <Modal title={editingId ? "Ubah Produk" : "Tambah Produk"} onClose={() => setModalOpen(false)}>
          <ProductForm
            form={form}
            setForm={setForm}
            categories={categories}
            suppliers={suppliers}
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
