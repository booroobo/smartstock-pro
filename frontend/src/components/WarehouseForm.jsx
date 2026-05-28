import LocationPickerMap from "./LocationPickerMap";

export default function WarehouseForm({ form, setForm, onSubmit, onCancel, editingId }) {
  const setCoordinates = (latitude, longitude) => {
    setForm({
      ...form,
      latitude: latitude.toFixed(7),
      longitude: longitude.toFixed(7),
    });
  };

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
      <label>
        Latitude
        <input type="number" step="0.0000001" min="-90" max="90" value={form.latitude} onChange={(e) => setForm({ ...form, latitude: e.target.value })} placeholder="-6.2088000" />
      </label>
      <label>
        Longitude
        <input type="number" step="0.0000001" min="-180" max="180" value={form.longitude} onChange={(e) => setForm({ ...form, longitude: e.target.value })} placeholder="106.8456000" />
      </label>
      <div className="span-2">
        <LocationPickerMap
          latitude={form.latitude}
          longitude={form.longitude}
          onPick={setCoordinates}
        />
      </div>
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
