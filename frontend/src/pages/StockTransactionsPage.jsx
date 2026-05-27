import { useEffect, useState } from "react";
import AppNav from "../components/AppNav";
import { getProducts } from "../api/productApi";
import { getWarehouses } from "../api/warehouseApi";
import { createTransaction, getTransactions } from "../api/transactionApi";

const today = () => new Date().toISOString().slice(0, 10);

export default function StockTransactionsPage() {
  const [products, setProducts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({ start_date: "", end_date: "", type: "", product_id: "", warehouse_id: "" });
  const [form, setForm] = useState({ product_id: "", warehouse_id: "", type: "stock_in", quantity: "", notes: "", transaction_date: today() });

  const fetchData = async (params = filters) => {
    const [productResponse, warehouseResponse, transactionResponse] = await Promise.all([
      getProducts(),
      getWarehouses(),
      getTransactions(params),
    ]);
    setProducts(productResponse.data.data);
    setWarehouses(warehouseResponse.data.data);
    setTransactions(transactionResponse.data.data);
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await createTransaction({ ...form, quantity: Number(form.quantity) });
      setForm({ product_id: "", warehouse_id: "", type: "stock_in", quantity: "", notes: "", transaction_date: today() });
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || "Transaksi stok gagal disimpan. Cek stok produk.");
    }
  };

  const applyFilters = (e) => {
    e.preventDefault();
    fetchData(filters);
  };

  return (
    <div className="app-shell">
      <AppNav />
      <main className="content">
        <div className="page-header"><div><h1>Stock Transactions</h1><p>Catat stock in dan stock out untuk mengubah current stock produk.</p></div></div>
        {error && <div className="alert-error">{error}</div>}
        <section className="panel">
          <form className="form-grid" onSubmit={handleSubmit}>
            <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
              <option value="stock_in">Stock In</option><option value="stock_out">Stock Out</option>
            </select>
            <select value={form.product_id} onChange={(e) => setForm({ ...form, product_id: e.target.value })} required>
              <option value="">Pilih produk</option>
              {products.map((product) => <option key={product.id} value={product.id}>{product.name} ({product.current_stock})</option>)}
            </select>
            <select value={form.warehouse_id} onChange={(e) => setForm({ ...form, warehouse_id: e.target.value })} required>
              <option value="">Pilih gudang</option>
              {warehouses.map((warehouse) => <option key={warehouse.id} value={warehouse.id}>{warehouse.name}</option>)}
            </select>
            <input type="number" min="1" placeholder="Quantity" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} required />
            <input type="date" value={form.transaction_date} onChange={(e) => setForm({ ...form, transaction_date: e.target.value })} required />
            <input placeholder="Catatan" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            <button type="submit">Save Stock Transaction</button>
          </form>
        </section>
        <section className="panel">
          <form className="form-grid" onSubmit={applyFilters}>
            <input type="date" value={filters.start_date} onChange={(e) => setFilters({ ...filters, start_date: e.target.value })} />
            <input type="date" value={filters.end_date} onChange={(e) => setFilters({ ...filters, end_date: e.target.value })} />
            <select value={filters.type} onChange={(e) => setFilters({ ...filters, type: e.target.value })}>
              <option value="">Semua tipe</option><option value="stock_in">Stock In</option><option value="stock_out">Stock Out</option>
            </select>
            <select value={filters.product_id} onChange={(e) => setFilters({ ...filters, product_id: e.target.value })}>
              <option value="">Semua produk</option>
              {products.map((product) => <option key={product.id} value={product.id}>{product.name}</option>)}
            </select>
            <select value={filters.warehouse_id} onChange={(e) => setFilters({ ...filters, warehouse_id: e.target.value })}>
              <option value="">Semua gudang</option>
              {warehouses.map((warehouse) => <option key={warehouse.id} value={warehouse.id}>{warehouse.name}</option>)}
            </select>
            <button type="submit">Filter</button>
          </form>
        </section>
        <section className="panel">
          <table>
            <thead><tr><th>Date</th><th>Product</th><th>Warehouse</th><th>Type</th><th>Qty</th><th>Notes</th></tr></thead>
            <tbody>
              {transactions.map((transaction) => (
                <tr key={transaction.id}>
                  <td>{transaction.transaction_date}</td><td>{transaction.product?.name}</td><td>{transaction.warehouse?.name}</td>
                  <td><span className={`badge ${transaction.type}`}>{transaction.type}</span></td><td>{transaction.quantity}</td><td>{transaction.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </main>
    </div>
  );
}
