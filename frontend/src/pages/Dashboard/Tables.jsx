import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import Sidebar from "../../components/staff/Sidebar.jsx";
import Topbar from "../../components/staff/Topbar.jsx";
import Loader from "../../components/shared/Loader.jsx";

const API_URL = import.meta.env.VITE_API_URL;
const FRONTEND_URL = import.meta.env.VITE_FRONTEND_URL || window.location.origin;
const token = localStorage.getItem("token");
const authHeaders = { Authorization: `Bearer ${token}` };

const statusColors = {
  available: "bg-green-100 text-green-800 border border-green-200",
  occupied: "bg-red-100 text-red-800 border border-red-200",
  reserved: "bg-yellow-100 text-yellow-800 border border-yellow-200",
  cleaning: "bg-slate-100 text-slate-600 border border-slate-200",
};

const statusLabels = {
  available: "Available",
  occupied: "Occupied",
  reserved: "Reserved",
  cleaning: "Cleaning",
};

export default function Tables() {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    name: "",
    capacity: 4,
    status: "available",
  });

  async function fetchTables() {
    try {
      const res = await fetch(`${API_URL}/tables`, {
        headers: authHeaders,
      }).then((r) => r.json());
      setTables(res.data ?? res ?? []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const t = setTimeout(() => fetchTables(), 0);
    return () => clearTimeout(t);
  }, []);

  function openCreate() {
    setEditing(null);
    setForm({ name: "", capacity: 4, status: "available" });
    setShowModal(true);
  }

  function openEdit(t) {
    setEditing(t);
    setForm({ name: t.name, capacity: t.capacity, status: t.status });
    setShowModal(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const token = localStorage.getItem("token");
    const url = editing
      ? `${API_URL}/tables/${editing.id}`
      : `${API_URL}/tables`;
    const method = editing ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Failed to save");
      setShowModal(false);
      fetchTables();
    } catch (err) {
      alert(err.message);
    }
  }

  async function handleDelete(id) {
    if (!confirm("Delete this table?")) return;
    const token = localStorage.getItem("token");
    try {
      await fetch(`${API_URL}/tables/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchTables();
    } catch (err) {
      console.error(err);
    }
  }

  function getQrUrl(table) {
    const token = table.qr_token || table.id;
    return `https://chart.googleapis.com/chart?chs=200x200&cht=qr&chl=${encodeURIComponent(FRONTEND_URL + "/products?token=" + token)}`;
  }

  if (loading) return <Loader text="Loading..." />;

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-teal-900 to-teal-800 bg-clip-text text-transparent">
                Tables
              </h1>
              <p className="text-slate-500 text-sm mt-1">Manage restaurant tables and QR codes</p>
            </div>
            <button
              onClick={openCreate}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-teal-900 to-teal-800 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:from-teal-950 hover:to-teal-900 transition-all duration-200 shadow-lg shadow-teal-200 hover:shadow-xl"
            >
              <Plus className="w-4 h-4" />
              Add Table
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {tables.map((t) => (
              <div
                key={t.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-col items-center text-center hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
              >
                <img
                  src={getQrUrl(t)}
                  alt={`QR for ${t.name}`}
                  className="w-32 h-32 mb-3"
                />
                <h3 className="text-lg font-bold text-slate-800">{t.name}</h3>
                <p className="text-sm text-slate-500">Capacity: {t.capacity}</p>
                <span
                  className={`mt-2 inline-block text-xs font-semibold px-3 py-1 rounded-full ${statusColors[t.status] || "bg-slate-100 text-slate-600"}`}
                >
                  {statusLabels[t.status] || t.status}
                </span>
                <p className="text-xs text-slate-400 mt-1">
                  {t.orders_count || 0} orders
                </p>
                {t.qr_token && (
                  <p className="text-[10px] text-slate-300 mt-1 truncate max-w-full" title={t.qr_token}>
                    Token: {t.qr_token.slice(0, 8)}...
                  </p>
                )}
                <div className="flex gap-3 mt-3">
                  <button
                    onClick={() => openEdit(t)}
                    className="inline-flex items-center gap-1 text-teal-600 hover:text-teal-800 text-xs font-semibold transition-colors"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(t.id)}
                    className="inline-flex items-center gap-1 text-red-500 hover:text-red-700 text-xs font-semibold transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete
                  </button>
                </div>
              </div>
            ))}
            {tables.length === 0 && (
              <div className="col-span-full text-center text-slate-500 py-12">
                No tables found. Click "Add Table" to create one.
              </div>
            )}
          </div>
        </main>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6">
            <h2 className="text-lg font-bold text-slate-800 mb-4">
              {editing ? "Edit Table" : "Add Table"}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Capacity
                </label>
                <input
                  type="number"
                  value={form.capacity}
                  onChange={(e) => setForm({ ...form, capacity: Number(e.target.value) })}
                  min="1"
                  required
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Status
                </label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="available">Available</option>
                  <option value="occupied">Occupied</option>
                  <option value="reserved">Reserved</option>
                  <option value="cleaning">Cleaning</option>
                </select>
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="bg-slate-100 text-slate-700 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-gradient-to-r from-teal-900 to-teal-800 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:from-teal-950 hover:to-teal-900 transition-all shadow-lg"
                >
                  {editing ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
