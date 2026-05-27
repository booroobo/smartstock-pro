import { useEffect, useState } from "react";
import AppNav from "../components/AppNav";
import { getCategories } from "../api/categoryApi";
import { createProduct, deleteProduct, getProducts, updateProduct } from "../api/productApi";

const emptyForm = {
  product_category_id: "",
  sku: "",
  name: "",
  description: "",
  minimum_stock: 0,
  unit: "pcs",
  image: null,
};

export default function ProductsPage() {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");

  const fetchData = async () => {
    const [categoryResponse, productResponse] = await Promise.all([getCategories(), getProducts()]);
    setCategories(categoryResponse.data.data);
    setProducts(productResponse.data.data);
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchData();
  }, []);

  const buildFormData = () => {
    const data = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      if (value !== null) data.append(key, value);
    });
    if (editingId) data.append("_method", "PUT");
    return data;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      editingId ? await updateProduct(editingId, buildFormData()) : await createProduct(buildFormData());
      setForm(emptyForm);
      setEditingId(null);
      fetchData();
    } catch {
      setError("Produk gagal disimpan. Pastikan kategori dan gambar valid.");
    }
  };

  const handleEdit = (product) => {
    setEditingId(product.id);
    setForm({
      product_category_id: product.product_category_id,
      sku: product.sku || "",
      name: product.name,
      description: product.description || "",
      minimum_stock: product.minimum_stock,
      unit: product.unit || "pcs",
      image: null,
    });
  };

  const handleDelete = async (id) => {
    if (!confirm("Hapus produk ini?")) return;
    await deleteProduct(id);
    fetchData();
  };

  return (
    <div className="app-shell">
      <AppNav />
      <main className="content">
        <div className="page-header"><div><h1>Products</h1><p>Tambah produk, stok minimum, dan gambar produk.</p></div></div>
        {error && <div className="alert-error">{error}</div>}
        <section className="panel">
          <form className="form-grid" onSubmit={handleSubmit}>
            <select value={form.product_category_id} onChange={(e) => setForm({ ...form, product_category_id: e.target.value })} required>
              <option value="">Pilih kategori</option>
              {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
            </select>
            <input placeholder="SKU" value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} />
            <input placeholder="Nama produk" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            <input placeholder="Unit" value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} required />
            <input type="number" min="0" placeholder="Minimum stock" value={form.minimum_stock} onChange={(e) => setForm({ ...form, minimum_stock: e.target.value })} required />
            <input type="file" accept="image/png,image/jpeg" onChange={(e) => setForm({ ...form, image: e.target.files[0] || null })} />
            <input className="wide" placeholder="Deskripsi" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            <button type="submit">{editingId ? "Update Product" : "Add Product"}</button>
            {editingId && <button className="secondary" type="button" onClick={() => { setEditingId(null); setForm(emptyForm); }}>Cancel</button>}
          </form>
        </section>
        <section className="panel">
          <table>
            <thead><tr><th>Image</th><th>SKU</th><th>Name</th><th>Category</th><th>Stock</th><th>Minimum</th><th>Action</th></tr></thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className={product.current_stock <= product.minimum_stock ? "critical-row" : ""}>
                  <td>{product.image_url && <img className="thumb" src={product.image_url} alt={product.name} />}</td>
                  <td>{product.sku}</td><td>{product.name}</td><td>{product.category?.name}</td>
                  <td>{product.current_stock} {product.unit}</td><td>{product.minimum_stock}</td>
                  <td className="actions"><button onClick={() => handleEdit(product)}>Edit</button><button className="danger" onClick={() => handleDelete(product.id)}>Delete</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </main>
    </div>
  );
}
