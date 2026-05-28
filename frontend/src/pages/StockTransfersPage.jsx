import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "../components/DashboardLayout";
import DataTable from "../components/DataTable";
import Alert from "../components/Alert";
import { useAuth } from "../contexts/AuthContext";
import { getProducts } from "../api/productApi";
import { getWarehouses } from "../api/warehouseApi";
import { createStockTransfer, getStockTransfers } from "../api/stockTransferApi";
import { canUseStockTransactions, deniedMessage } from "../utils/roles";

const emptyForm = {
  product_id: "",
  from_warehouse_id: "",
  to_warehouse_id: "",
  quantity: "",
  notes: "",
};

export default function StockTransfersPage() {
  const { user } = useAuth();
  const canCreate = canUseStockTransactions(user?.role);
  const [products, setProducts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [transfers, setTransfers] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const selectedProduct = useMemo(
    () => products.find((product) => String(product.id) === String(form.product_id)),
    [products, form.product_id]
  );

  const fetchData = async () => {
    try {
      const [productResponse, warehouseResponse, transferResponse] = await Promise.all([
        getProducts({ per_page: 100, sort_by: "name", sort_direction: "asc" }),
        getWarehouses(),
        getStockTransfers({ per_page: 20 }),
      ]);
      const productPayload = productResponse.data.data;
      const transferPayload = transferResponse.data.data;
      setProducts(productPayload.data || productPayload);
      setWarehouses(warehouseResponse.data.data);
      setTransfers(transferPayload.data || transferPayload);
    } catch (err) {
      setError(err.response?.status === 403 ? deniedMessage : "Data transfer stok gagal dimuat.");
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchData();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    try {
      await createStockTransfer({ ...form, quantity: Number(form.quantity) });
      setForm(emptyForm);
      setNotice("Transfer stok berhasil diproses.");
      await fetchData();
    } catch (err) {
      setError(err.response?.status === 403 ? deniedMessage : (err.response?.data?.message || "Transfer stok gagal diproses."));
    }
  };

  return (
    <DashboardLayout title="Transfer Stok" subtitle="Transfer stok antar gudang" onRefresh={fetchData}>
      {error && <Alert message={error} onClose={() => setError("")} />}
      {notice && <Alert type="info" message={notice} onClose={() => setNotice("")} />}

      <div className="ss-page-head">
        <div>
          <h1>Transfer Stok Antar Gudang</h1>
          <p>Pindahkan stok dari gudang asal ke gudang tujuan secara atomik.</p>
        </div>
        <button className="ss-primary" onClick={fetchData}>
          <span className="material-symbols-outlined">refresh</span>
          Muat Ulang
        </button>
      </div>

      {canCreate && <section className="ss-card">
        <h2>Form Transfer</h2>
        <form className="ss-form-grid" onSubmit={handleSubmit}>
          <label>
            Produk
            <select value={form.product_id} onChange={(event) => setForm({ ...form, product_id: event.target.value })} required>
              <option value="">Pilih produk</option>
              {products.map((product) => <option key={product.id} value={product.id}>{product.name} ({product.sku || "-"})</option>)}
            </select>
          </label>
          <label>
            Gudang Asal
            <select value={form.from_warehouse_id} onChange={(event) => setForm({ ...form, from_warehouse_id: event.target.value })} required>
              <option value="">Pilih gudang asal</option>
              {warehouses.map((warehouse) => <option key={warehouse.id} value={warehouse.id}>{warehouse.name}</option>)}
            </select>
          </label>
          <label>
            Gudang Tujuan
            <select value={form.to_warehouse_id} onChange={(event) => setForm({ ...form, to_warehouse_id: event.target.value })} required>
              <option value="">Pilih gudang tujuan</option>
              {warehouses.map((warehouse) => <option key={warehouse.id} value={warehouse.id}>{warehouse.name}</option>)}
            </select>
          </label>
          <label>
            Quantity
            <input type="number" min="1" value={form.quantity} onChange={(event) => setForm({ ...form, quantity: event.target.value })} required />
          </label>
          <label className="span-2">
            Catatan
            <input value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} />
          </label>
          <div className="ss-form-actions span-2">
            <button className="ss-secondary" type="button" onClick={() => setForm(emptyForm)}>Reset</button>
            <button className="ss-primary" type="submit">Proses Transfer</button>
          </div>
        </form>
      </section>}

      {selectedProduct && <section className="ss-card">
        <h2>Stok Per Gudang: {selectedProduct.name}</h2>
        <DataTable
          columns={[
            { key: "warehouse", label: "Gudang", render: (row) => row.warehouse?.name || "-" },
            { key: "quantity", label: "Quantity" },
            { key: "minimum_stock", label: "Minimum", render: (row) => row.minimum_stock ?? "-" },
          ]}
          rows={selectedProduct.warehouse_stocks || []}
        />
      </section>}

      <section className="ss-card">
        <h2>Riwayat Transfer</h2>
        <DataTable
          columns={[
            { key: "created_at", label: "Waktu" },
            { key: "product", label: "Produk", render: (row) => row.product?.name || "-" },
            { key: "from", label: "Dari", render: (row) => row.from_warehouse?.name || "-" },
            { key: "to", label: "Ke", render: (row) => row.to_warehouse?.name || "-" },
            { key: "quantity", label: "Quantity" },
            { key: "status", label: "Status", render: (row) => <span className={`ss-badge ${row.status === "failed" ? "danger" : "success"}`}>{row.status}</span> },
            { key: "notes", label: "Catatan", render: (row) => row.notes || "-" },
          ]}
          rows={transfers}
        />
      </section>
    </DashboardLayout>
  );
}
