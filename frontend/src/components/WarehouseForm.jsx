export default function WarehouseForm({ form, setForm, onSubmit, onCancel, editingId }) {
  return (
    <form className="ss-form-grid" onSubmit={onSubmit}>
      <label>
        Nama Gudang
        <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
      </label>
      <label>
        Lokasi
        <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
      </label>
      <label className="span-2">
        Deskripsi
        <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
      </label>
      <div className="ss-form-actions span-2">
        <button className="ss-secondary" type="button" onClick={onCancel}>Batal</button>
        <button className="ss-primary" type="submit">{editingId ? "Simpan Gudang" : "Tambah Gudang"}</button>
      </div>
    </form>
  );
}
