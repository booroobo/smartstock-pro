import { useEffect, useState } from "react";
import AppNav from "../components/AppNav";
import {
  createCategory,
  deleteCategory,
  getCategories,
  updateCategory,
} from "../api/categoryApi";

const emptyForm = { name: "", description: "" };

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");

  const fetchCategories = async () => {
    const response = await getCategories();
    setCategories(response.data.data);
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchCategories();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      editingId ? await updateCategory(editingId, form) : await createCategory(form);
      setForm(emptyForm);
      setEditingId(null);
      fetchCategories();
    } catch {
      setError("Kategori produk gagal disimpan.");
    }
  };

  const handleEdit = (category) => {
    setEditingId(category.id);
    setForm({ name: category.name, description: category.description || "" });
  };

  const handleDelete = async (id) => {
    if (!confirm("Hapus kategori produk ini?")) return;
    await deleteCategory(id);
    fetchCategories();
  };

  return (
    <div className="app-shell">
      <AppNav />
      <main className="content">
        <div className="page-header"><div><h1>Product Categories</h1><p>Kelola kategori produk inventaris.</p></div></div>
        {error && <div className="alert-error">{error}</div>}
        <section className="panel">
          <form className="form-grid" onSubmit={handleSubmit}>
            <input placeholder="Nama kategori" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            <input placeholder="Deskripsi" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            <button type="submit">{editingId ? "Update Category" : "Add Category"}</button>
            {editingId && <button className="secondary" type="button" onClick={() => { setEditingId(null); setForm(emptyForm); }}>Cancel</button>}
          </form>
        </section>
        <section className="panel">
          <table>
            <thead><tr><th>Name</th><th>Description</th><th>Action</th></tr></thead>
            <tbody>
              {categories.map((category) => (
                <tr key={category.id}>
                  <td>{category.name}</td>
                  <td>{category.description}</td>
                  <td className="actions"><button onClick={() => handleEdit(category)}>Edit</button><button className="danger" onClick={() => handleDelete(category.id)}>Delete</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </main>
    </div>
  );
}
