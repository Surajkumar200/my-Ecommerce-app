import React, { useEffect, useState, useContext } from "react";
import { Link } from "react-router-dom";
import api from "../api/axiosInstance";
import { AuthContext } from "../context/AuthContext";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    imageUrl: "",
  });
  const [editingId, setEditingId] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);

  const { user, logout } = useContext(AuthContext);

  const fetchProducts = async () => {
    try {
      const res = await api.get("/products");
      setProducts(res.data);
    } catch (err) {
      console.error("Failed to fetch products", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    // Send both `imageUrl` and `image` to ensure compatibility with backend schema variations
    const payload = {
      ...form,
      image: form.imageUrl,
    };

    try {
      if (editingId) {
        await api.put(`/products/${editingId}`, payload);
      } else {
        await api.post("/products", payload);
      }

      setForm({
        name: "",
        description: "",
        price: "",
        stock: "",
        imageUrl: "",
      });
      setEditingId(null);
      fetchProducts();
    } catch (err) {
      if (err.response?.data?.errors) {
        setErrors(err.response.data.errors);
      }
    }
  };

  const handleEdit = (prod) => {
    setEditingId(prod._id || prod.id);
    setForm({
      name: prod.name || prod.title || "",
      description: prod.description || "",
      price: prod.price || "",
      stock: prod.stock ?? "",
      imageUrl: prod.imageUrl || prod.image || "",
    });
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await api.delete(`/products/${id}`);
        fetchProducts();
      } catch (err) {
        console.error("Failed to delete product", err);
      }
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setForm({ name: "", description: "", price: "", stock: "", imageUrl: "" });
    setErrors({});
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 antialiased font-sans">
      {/* Navigation */}
      <nav className="sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 bg-indigo-600 text-white rounded-xl flex items-center justify-center font-black shadow-sm shadow-indigo-600/30">
                E
              </div>
              <span className="text-lg font-extrabold text-slate-900 tracking-tight">
                Store Console
              </span>
            </div>

            <div>
              {user ? (
                <div className="flex items-center space-x-4">
                  <div className="hidden sm:flex items-center space-x-2 bg-slate-100 px-3.5 py-1.5 rounded-full border border-slate-200">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="text-xs font-medium text-slate-600">
                      Logged in as{" "}
                      <strong className="text-slate-900">{user.name}</strong>
                    </span>
                  </div>
                  <button
                    onClick={logout}
                    className="text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 px-3.5 py-2 rounded-xl transition shadow-xs active:scale-95"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <Link
                    to="/login"
                    className="text-xs font-semibold text-slate-700 hover:text-indigo-600 px-3 py-2 transition"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-xl transition shadow-sm shadow-indigo-600/20 active:scale-95"
                  >
                    Get Started
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
        {/* Form Card */}
        {user && (
          <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200/80 transition-all">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  {editingId ? "Edit Product Item" : "Add New Inventory Item"}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Fill in the fields to manage inventory stock details
                </p>
              </div>
              {editingId && (
                <span className="bg-amber-50 border border-amber-200 text-amber-700 text-xs px-3 py-1 rounded-lg font-semibold">
                  Editing Mode
                </span>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Product Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    name="name"
                    placeholder="e.g. Mechanical Keyboard"
                    value={form.name}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm bg-slate-50/50 transition"
                  />
                  {errors.name && (
                    <p className="text-xs text-rose-500 mt-1 font-medium">
                      {errors.name}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Price ($) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    name="price"
                    type="number"
                    step="0.01"
                    placeholder="99.99"
                    value={form.price}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm bg-slate-50/50 transition"
                  />
                  {errors.price && (
                    <p className="text-xs text-rose-500 mt-1 font-medium">
                      {errors.price}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Stock Quantity <span className="text-rose-500">*</span>
                  </label>
                  <input
                    name="stock"
                    type="number"
                    placeholder="25"
                    value={form.stock}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm bg-slate-50/50 transition"
                  />
                  {errors.stock && (
                    <p className="text-xs text-rose-500 mt-1 font-medium">
                      {errors.stock}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Image URL
                  </label>
                  <input
                    type="url"
                    name="imageUrl"
                    placeholder="https://fakestoreapi.com/img/81fPKd-2AYL._AC_SL1500_t.png"
                    value={form.imageUrl}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm bg-slate-50/50 transition"
                  />
                  {errors.imageUrl && (
                    <p className="text-xs text-rose-500 mt-1 font-medium">
                      {errors.imageUrl}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Description
                </label>
                <input
                  name="description"
                  placeholder="Short summary of the item..."
                  value={form.description}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm bg-slate-50/50 transition"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
                {editingId && (
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold px-4 py-2.5 rounded-xl transition"
                  >
                    Cancel
                  </button>
                )}
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-5 py-2.5 rounded-xl transition shadow-sm shadow-indigo-600/20 active:scale-95"
                >
                  {editingId ? "Save Changes" : "Add to Inventory"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Catalog */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Product Catalog
            </h2>
            <span className="text-xs font-semibold text-slate-600 bg-slate-200/70 px-3 py-1 rounded-full">
              {products.length} {products.length === 1 ? "Item" : "Items"}
            </span>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((n) => (
                <div
                  key={n}
                  className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200/80 animate-pulse space-y-4"
                >
                  <div className="h-48 bg-slate-200 rounded-xl w-full"></div>
                  <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                  <div className="h-3 bg-slate-100 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-slate-200/80 shadow-sm">
              <h3 className="text-base font-semibold text-slate-800">
                No items available
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Products added to your database will appear here.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((p) => {
                // Resolves either `imageUrl` or `image` depending on database field name
                const imgSource = p.imageUrl || p.image;
                const prodId = p._id || p.id;

                return (
                  <div
                    key={prodId}
                    className="bg-white rounded-2xl p-5 shadow-xs hover:shadow-md border border-slate-200/80 transition duration-200 flex flex-col justify-between group"
                  >
                    <div>
                      {/* Product Image Area */}
                      <div className="w-full h-52 bg-slate-50 rounded-xl overflow-hidden mb-4 flex items-center justify-center border border-slate-100/80 relative">
                        {imgSource ? (
                          <img
                            src={imgSource}
                            alt={p.name || p.title || "Product"}
                            className="w-full h-full object-contain p-3 group-hover:scale-105 transition duration-300"
                            onError={(e) => {
                              // If image fails to load or link is invalid
                              e.currentTarget.style.display = "none";
                              if (e.currentTarget.nextSibling) {
                                e.currentTarget.nextSibling.style.display =
                                  "flex";
                              }
                            }}
                          />
                        ) : null}

                        {/* Fallback when no URL or link is broken */}
                        <div
                          className="flex flex-col items-center justify-center text-slate-400 p-4 text-center"
                          style={{ display: imgSource ? "none" : "flex" }}
                        >
                          <svg
                            className="w-8 h-8 mb-1 opacity-40"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="1.5"
                              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                          <span className="text-xs font-medium">
                            {imgSource ? "Invalid Image Link" : "No Image"}
                          </span>
                        </div>
                      </div>

                      <div className="flex justify-between items-start mb-2 gap-2">
                        <h3 className="text-sm font-bold text-slate-900 line-clamp-1 leading-snug">
                          {p.name || p.title}
                        </h3>
                        <span className="text-xs font-extrabold text-indigo-600 bg-indigo-50 border border-indigo-100 px-2.5 py-1 rounded-lg shrink-0">
                          ${p.price}
                        </span>
                      </div>

                      <p className="text-xs text-slate-500 line-clamp-2 min-h-[2.25rem] leading-relaxed">
                        {p.description || "No description provided."}
                      </p>

                      <div className="mt-4 flex items-center justify-between text-xs">
                        <span className="text-slate-400 font-medium">
                          Availability
                        </span>
                        <span
                          className={`font-semibold px-2 py-0.5 rounded-md ${
                            (p.stock ?? 1) > 0
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                              : "bg-rose-50 text-rose-600 border border-rose-100"
                          }`}
                        >
                          {(p.stock ?? 1) > 0
                            ? `${p.stock ?? "In"} available`
                            : "Out of Stock"}
                        </span>
                      </div>
                    </div>

                    {user && (
                      <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between gap-2.5">
                        <button
                          onClick={() => handleEdit(p)}
                          className="flex-1 sm:flex-initial text-xs font-semibold text-slate-700 hover:text-indigo-600 bg-slate-100 hover:bg-slate-200/80 border border-slate-200/60 px-3.5 py-2 rounded-xl transition active:scale-95"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(prodId)}
                          className="flex-1 sm:flex-initial text-xs font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-100 px-3.5 py-2 rounded-xl transition active:scale-95"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
