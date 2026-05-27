export default function StockTransactionForm({ form, setForm, products, warehouses, onSubmit, onCancel }) {
  return (
    <form className="ss-form-grid" onSubmit={onSubmit}>
      <label>
        Tipe
        <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
          <option value="stock_in">Stok Masuk</option>
          <option value="stock_out">Stok Keluar</option>
        </select>
      </label>
      <label>
        Produk
        <select value={form.product_id} onChange={(e) => setForm({ ...form, product_id: e.target.value })} required>
          <option value="">Pilih produk</option>
          {products.map((product) => <option key={product.id} value={product.id}>{product.name} ({product.current_stock})</option>)}
        </select>
      </label>
      <label>
        Gudang
        <select value={form.warehouse_id} onChange={(e) => setForm({ ...form, warehouse_id: e.target.value })} required>
          <option value="">Pilih gudang</option>
          {warehouses.map((warehouse) => <option key={warehouse.id} value={warehouse.id}>{warehouse.name}</option>)}
        </select>
      </label>
      <label>
        Jumlah
        <input type="number" min="1" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} required />
      </label>
      <label>
        Tanggal
        <input type="date" value={form.transaction_date} onChange={(e) => setForm({ ...form, transaction_date: e.target.value })} required />
      </label>
      <label className="span-2">
        Catatan
        <input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
      </label>
      <div className="ss-form-actions span-2">
        <button className="ss-secondary" type="button" onClick={onCancel}>Batal</button>
        <button className="ss-primary" type="submit">Simpan</button>
      </div>
    </form>
  );
}
