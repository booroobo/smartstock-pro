import { useEffect, useState } from "react";
import AppNav from "../components/AppNav";
import {
  createWarehouse,
  deleteWarehouse,
  getWarehouses,
  updateWarehouse,
} from "../api/warehouseApi";

const emptyForm = { name: "", location: "", description: "" };

export default function WarehousesPage() {
  const [warehouses, setWarehouses] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);

  const fetchWarehouses = async () => {
    const response = await getWarehouses();
    setWarehouses(response.data.data);
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchWarehouses();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    editingId ? await updateWarehouse(editingId, form) : await createWarehouse(form);
    setForm(emptyForm);
    setEditingId(null);
    fetchWarehouses();
  };

  const handleEdit = (warehouse) => {
    setEditingId(warehouse.id);
    setForm({
      name: warehouse.name,
      location: warehouse.location || "",
      description: warehouse.description || "",
    });
  };

  const handleDelete = async (id) => {
    if (!confirm("Hapus gudang ini?")) return;
    await deleteWarehouse(id);
    fetchWarehouses();
  };

  return (
    <div className="app-shell">
      <AppNav />
      <main className="content">
        <div className="page-header"><div><h1>Warehouses</h1><p>Kelola gudang penyimpanan stok.</p></div></div>
        <section className="panel">
          <form className="form-grid" onSubmit={handleSubmit}>
            <input placeholder="Nama gudang" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            <input placeholder="Lokasi" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
            <input placeholder="Deskripsi" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            <button type="submit">{editingId ? "Update Warehouse" : "Add Warehouse"}</button>
            {editingId && <button className="secondary" type="button" onClick={() => { setEditingId(null); setForm(emptyForm); }}>Cancel</button>}
          </form>
        </section>
        <section className="panel">
          <table>
            <thead><tr><th>Name</th><th>Location</th><th>Description</th><th>Action</th></tr></thead>
            <tbody>
              {warehouses.map((warehouse) => (
                <tr key={warehouse.id}>
                  <td>{warehouse.name}</td><td>{warehouse.location}</td><td>{warehouse.description}</td>
                  <td className="actions"><button onClick={() => handleEdit(warehouse)}>Edit</button><button className="danger" onClick={() => handleDelete(warehouse.id)}>Delete</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </main>
    </div>
  );
}
