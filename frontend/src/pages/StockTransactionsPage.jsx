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
const emptyFilters = { start_date: "", end_date: "", type: "", product_id: "", warehouse_id: "" };
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
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const fetchData = async (params = filters) => {
    try {
      const [productResponse, warehouseResponse, transactionResponse] = await Promise.all([
        getProducts(),
        getWarehouses(),
        getTransactions(params),
      ]);
      setProducts(productResponse.data.data);
      setWarehouses(warehouseResponse.data.data);
      setTransactions(transactionResponse.data.data);
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
    fetchData(filters);
  };

  const resetFilters = () => {
    setFilters(emptyFilters);
    fetchData(emptyFilters);
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
