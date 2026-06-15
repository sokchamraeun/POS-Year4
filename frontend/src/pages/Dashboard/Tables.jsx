import { useState, useEffect } from "react";
import Sidebar from "../../components/staff/Sidebar.jsx";
import Topbar from "../../components/staff/Topbar.jsx";
import Loader from "../../components/shared/Loader.jsx";

const API_URL = import.meta.env.VITE_API_URL;
const FRONTEND_URL = "https://pos-year4.vercel.app";
const token = localStorage.getItem("token");
const authHeaders = { Authorization: `Bearer ${token}` };

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
    return `https://chart.googleapis.com/chart?chs=200x200&cht=qr&chl=${encodeURIComponent(FRONTEND_URL + "/?table=" + table.id)}`;
  }

  const statusColors = {
    available: "bg-green-100 text-green-800",
    occupied: "bg-red-100 text-red-800",
    reserved: "bg-yellow-100 text-yellow-800",
  };

  if (loading) return <Loader text="Loading..." />

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Tables</h1>
            <button
              onClick={openCreate}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              Add Table
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {tables.map((t) => (
              <div
                key={t.id}
                className="bg-white rounded-xl shadow-sm p-4 flex flex-col items-center text-center"
              >
                <img
                  src={getQrUrl(t)}
                  alt={`QR for ${t.name}`}
                  className="w-32 h-32 mb-3"
                />
                <h3 className="text-lg font-semibold text-gray-800">
                  {t.name}
                </h3>
                <p className="text-sm text-gray-500">Capacity: {t.capacity}</p>
                <span
                  className={`mt-2 inline-block text-xs px-3 py-1 rounded-full ${statusColors[t.status] || "bg-gray-100 text-gray-800"}`}
                >
                  {t.status.charAt(0).toUpperCase() + t.status.slice(1)}
                </span>
                <p className="text-xs text-gray-400 mt-1">
                  {t.orders_count || 0} orders
                </p>
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => openEdit(t)}
                    className="text-yellow-600 hover:underline text-xs font-medium"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(t.id)}
                    className="text-red-600 hover:underline text-xs font-medium"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
            {tables.length === 0 && (
              <div className="col-span-full text-center text-gray-500 py-8">
                No tables found.
              </div>
            )}
          </div>
        </main>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6">
            <h2 className="text-lg font-semibold mb-4">
              {editing ? "Edit Table" : "Add Table"}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Capacity
                </label>
                <input
                  type="number"
                  value={form.capacity}
                  onChange={(e) =>
                    setForm({ ...form, capacity: Number(e.target.value) })
                  }
                  min="1"
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="available">Available</option>
                  <option value="occupied">Occupied</option>
                  <option value="reserved">Reserved</option>
                </select>
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
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
