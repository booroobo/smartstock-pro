export default function ProductForm({ form, setForm, categories, suppliers = [], onSubmit, onCancel, editingId, imagePreview }) {
  return (
    <form className="ss-form-grid" onSubmit={onSubmit}>
      <label>
        Kategori
        <select value={form.product_category_id} onChange={(e) => setForm({ ...form, product_category_id: e.target.value })} required>
          <option value="">Pilih kategori</option>
          {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
        </select>
      </label>
      <label>
        Supplier
        <select value={form.supplier_id} onChange={(e) => setForm({ ...form, supplier_id: e.target.value })}>
          <option value="">Tanpa supplier</option>
          {suppliers.map((supplier) => <option key={supplier.id} value={supplier.id}>{supplier.name}</option>)}
        </select>
      </label>
      <label>
        SKU
        <input value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} placeholder="SKU-001" />
      </label>
      <label>
        Nama Produk
        <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
      </label>
      <label>
        Unit
        <input value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} required />
      </label>
      <label>
        Stok Minimum
        <input type="number" min="0" value={form.minimum_stock} onChange={(e) => setForm({ ...form, minimum_stock: e.target.value })} required />
      </label>
      <label>
        Harga Satuan
        <input type="number" min="0" step="0.01" value={form.unit_price} onChange={(e) => setForm({ ...form, unit_price: e.target.value })} placeholder="0" />
      </label>
      <label>
        Gambar Produk
        <input type="file" accept="image/png,image/jpeg" onChange={(e) => setForm({ ...form, image: e.target.files[0] || null })} />
      </label>
      {imagePreview && <img className="ss-image-preview" src={imagePreview} alt="Upload preview" />}
      <label className="span-2">
        Deskripsi
        <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
      </label>
      <div className="ss-form-actions span-2">
        <button className="ss-secondary" type="button" onClick={onCancel}>Batal</button>
        <button className="ss-primary" type="submit">{editingId ? "Simpan Produk" : "Tambah Produk"}</button>
      </div>
    </form>
  );
}
