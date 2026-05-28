import { useEffect, useState } from "react";
import DashboardLayout from "../components/DashboardLayout";
import DataTable from "../components/DataTable";
import Modal from "../components/Modal";
import StockTransactionForm from "../components/StockTransactionForm";
import Alert from "../components/Alert";
import { useAuth } from "../contexts/AuthContext";
import { getProducts } from "../api/productApi";
import { getWarehouses } from "../api/warehouseApi";
import {
  createTransaction,
  deleteTransaction,
  getTransactions,
  updateTransaction,
} from "../api/transactionApi";
import { canUseStockTransactions, deniedMessage, displayStockType } from "../utils/roles";

const today = () => new Date().toISOString().slice(0, 10);
const emptyFilters = {
  search: "",
  start_date: "",
  end_date: "",
  type: "",
  product_id: "",
  warehouse_id: "",
  sort_by: "created_at",
  sort_direction: "desc",
  page: 1,
  per_page: 10,
};
const emptyForm = { product_id: "", warehouse_id: "", type: "stock_in", quantity: "", notes: "", transaction_date: today() };

export default function StockTransactionsPage() {
  const { user } = useAuth();
  const canManageTransactions = canUseStockTransactions(user?.role);
  const [products, setProducts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [filters, setFilters] = useState(emptyFilters);
  const [pagination, setPagination] = useState({ current_page: 1, last_page: 1, total: 0 });
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const fetchData = async (params = filters) => {
    try {
      const [productResponse, warehouseResponse, transactionResponse] = await Promise.all([
        getProducts({ per_page: 100, sort_by: "name", sort_direction: "asc" }),
        getWarehouses(),
        getTransactions(params),
      ]);
      const productPayload = productResponse.data.data;
      setProducts(productPayload.data || productPayload);
      setWarehouses(warehouseResponse.data.data);
      const payload = transactionResponse.data.data;
      setTransactions(payload.data || payload);
      setPagination({
        current_page: payload.current_page || 1,
        last_page: payload.last_page || 1,
        total: payload.total || (payload.data || payload).length,
      });
    } catch (err) {
      setError(err.response?.status === 403 ? deniedMessage : "Data transaksi stok gagal dimuat.");
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = (type = "stock_in") => {
    setEditingId(null);
    setForm({ ...emptyForm, type, transaction_date: today() });
    setModalOpen(true);
  };

  const handleEdit = (transaction) => {
    setEditingId(transaction.id);
    setForm({
      product_id: transaction.product_id || "",
      warehouse_id: transaction.warehouse_id || "",
      type: transaction.type || "stock_in",
      quantity: transaction.quantity || "",
      notes: transaction.notes || "",
      transaction_date: transaction.transaction_date || today(),
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const payload = { ...form, quantity: Number(form.quantity) };
      editingId ? await updateTransaction(editingId, payload) : await createTransaction(payload);
      setForm(emptyForm);
      setEditingId(null);
      setModalOpen(false);
      await fetchData();
      setNotice("Transaksi stok berhasil disimpan.");
    } catch (err) {
      setError(err.response?.status === 403 ? deniedMessage : (err.response?.data?.message || "Transaksi stok gagal disimpan. Cek stok produk."));
    }
  };

  const applyFilters = (e) => {
    e.preventDefault();
    const next = { ...filters, page: 1 };
    setFilters(next);
    fetchData(next);
  };

  const resetFilters = () => {
    setFilters(emptyFilters);
    fetchData(emptyFilters);
  };

  const goToPage = (page) => {
    const next = { ...filters, page };
    setFilters(next);
    fetchData(next);
  };

  const handleDelete = async (id) => {
    if (!confirm("Hapus transaksi stok ini? Stok produk akan disesuaikan ulang.")) return;
    setError("");
    try {
      await deleteTransaction(id);
      await fetchData();
      setNotice("Transaksi stok berhasil dihapus.");
    } catch (err) {
      setError(err.response?.status === 403 ? deniedMessage : (err.response?.data?.message || "Transaksi stok gagal dihapus."));
    }
  };

  return (
    <DashboardLayout title="Transaksi Stok" subtitle="Pergerakan stok masuk dan keluar" onRefresh={() => fetchData()}>
      {error && <Alert message={error} onClose={() => setError("")} />}
      {notice && <Alert type="info" message={notice} onClose={() => setNotice("")} />}

      <div className="ss-page-head">
        <div>
          <h1>Transaksi Stok</h1>
          <p>Catat stock in dan stock out untuk mengubah current stock produk.</p>
        </div>
        {canManageTransactions && <div className="ss-actions">
          <button className="ss-secondary" onClick={() => openCreate("stock_in")}>Stok Masuk</button>
          <button className="ss-secondary" onClick={() => openCreate("stock_out")}>Stok Keluar</button>
          <button className="ss-primary" onClick={() => openCreate("stock_in")}>
            <span className="material-symbols-outlined">add</span>
            Tambah Transaksi Stok
          </button>
        </div>}
      </div>

      <section className="ss-card">
        <h2>Filter</h2>
        <form className="ss-form-grid" onSubmit={applyFilters}>
          <label>Cari<input value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })} placeholder="Produk, SKU, catatan, atau ID" /></label>
          <label>Tanggal Mulai<input type="date" value={filters.start_date} onChange={(e) => setFilters({ ...filters, start_date: e.target.value })} /></label>
          <label>Tanggal Selesai<input type="date" value={filters.end_date} onChange={(e) => setFilters({ ...filters, end_date: e.target.value })} /></label>
          <label>
            Tipe
            <select value={filters.type} onChange={(e) => setFilters({ ...filters, type: e.target.value })}>
              <option value="">Semua tipe</option><option value="stock_in">Stok Masuk</option><option value="stock_out">Stok Keluar</option>
            </select>
          </label>
          <label>
            Produk
            <select value={filters.product_id} onChange={(e) => setFilters({ ...filters, product_id: e.target.value })}>
              <option value="">Semua produk</option>
              {products.map((product) => <option key={product.id} value={product.id}>{product.name}</option>)}
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
            Urutkan
            <select value={filters.sort_by} onChange={(e) => setFilters({ ...filters, sort_by: e.target.value })}>
              <option value="created_at">Tanggal dibuat</option>
              <option value="transaction_date">Tanggal transaksi</option>
              <option value="quantity">Jumlah</option>
              <option value="type">Tipe</option>
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
          <div className="ss-form-actions">
            <button className="ss-secondary" type="button" onClick={resetFilters}>Reset Filter</button>
            <button className="ss-primary" type="submit">Terapkan Filter</button>
          </div>
        </form>
      </section>

      <section className="ss-card">
        <DataTable
          columns={[
            { key: "transaction_date", label: "Tanggal" },
            { key: "product", label: "Produk", render: (row) => row.product?.name || "-" },
            { key: "warehouse", label: "Gudang", render: (row) => row.warehouse?.name || "-" },
            { key: "type", label: "Tipe", render: (row) => <span className={`ss-badge ${row.type}`}>{displayStockType(row.type)}</span> },
            { key: "quantity", label: "Jumlah" },
            { key: "notes", label: "Catatan", render: (row) => row.notes || "-" },
            {
              key: "actions",
              label: "Aksi",
              render: (row) => canManageTransactions ? (
                <div className="ss-actions">
                  <button className="ss-secondary" onClick={() => handleEdit(row)}>Ubah</button>
                  <button className="ss-danger" onClick={() => handleDelete(row.id)}>Hapus</button>
                </div>
              ) : "-",
            },
          ]}
          rows={transactions}
        />
        <div className="ss-pagination">
          <button className="ss-secondary" disabled={pagination.current_page <= 1} onClick={() => goToPage(pagination.current_page - 1)}>Sebelumnya</button>
          <span>Halaman {pagination.current_page} dari {pagination.last_page} ({pagination.total} data)</span>
          <button className="ss-secondary" disabled={pagination.current_page >= pagination.last_page} onClick={() => goToPage(pagination.current_page + 1)}>Berikutnya</button>
        </div>
      </section>

      {modalOpen && (
        <Modal title={editingId ? "Ubah Transaksi Stok" : "Tambah Transaksi Stok"} onClose={() => setModalOpen(false)}>
          <StockTransactionForm
            form={form}
            setForm={setForm}
            products={products}
            warehouses={warehouses}
            onSubmit={handleSubmit}
            onCancel={() => {
              setEditingId(null);
              setModalOpen(false);
            }}
          />
        </Modal>
      )}
    </DashboardLayout>
  );
}
