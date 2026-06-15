import { useEffect, useRef, useState } from "react";
import {
  Plus,
  Edit2,
  Trash2,
  Eye,
  X,
  User,
  Shield,
  CheckCircle,
  XCircle,
  Loader2,
  Camera,
} from "lucide-react";
import Cropper from "react-easy-crop";

import Sidebar from "../../components/staff/Sidebar.jsx";
import Loader from "../../components/shared/Loader.jsx";
import Topbar from "../../components/staff/Topbar.jsx";
import getCroppedImg from "../../utils/cropImage.js";
import { getImageUrl } from "../../utils/image.js";

const API_BASE = import.meta.env.VITE_API_URL;

const fmt = (date) =>
  date
    ? new Date(date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";

const emptyForm = {
  name: "",
  email: "",
  password: "",
  role_id: "",
  phone: "",
  status: true,
  avatar: null,
};

export default function Users() {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [detailUser, setDetailUser] = useState(null);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState(emptyForm);

  const fileInputRef = useRef(null);
  const [cropOpen, setCropOpen] = useState(false);
  const [cropImage, setCropImage] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [outputWidth, setOutputWidth] = useState("");
  const [outputHeight, setOutputHeight] = useState("");

  const token = localStorage.getItem("token");

  const authHeaders = {
    Authorization: `Bearer ${token}`,
    Accept: "application/json",
  };

  useEffect(() => {
    if (!token) {
      setError("No auth token found. Please log in again.");
      setLoading(false);
      return;
    }

    fetchData();
  }, []);

  async function fetchData() {
    try {
      setLoading(true);
      setError("");

      const [usersRes, rolesRes] = await Promise.all([
        fetch(`${API_BASE}/users`, { headers: authHeaders }),
        fetch(`${API_BASE}/roles`, { headers: authHeaders }),
      ]);

      if (usersRes.status === 401) {
        throw new Error("Unauthorized. Please log out and log in again.");
      }

      if (!usersRes.ok) throw new Error(`Users error HTTP ${usersRes.status}`);
      if (!rolesRes.ok) throw new Error(`Roles error HTTP ${rolesRes.status}`);

      const usersJson = await usersRes.json();
      const rolesJson = await rolesRes.json();

      setUsers(usersJson.data ?? usersJson);
      setRoles(rolesJson.data ?? rolesJson);
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  function openAddModal() {
    setEditing(null);
    setFormData(emptyForm);
    setShowModal(true);
  }

  function openEditModal(user) {
    setEditing(user);
    setFormData({
      name: user.name ?? "",
      email: user.email ?? "",
      password: "",
      role_id: user.role_id || user.role?.id || "",
      phone: user.phone ?? "",
      status: user.status ?? true,
      avatar: user.avatar ?? null,
    });
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setEditing(null);
    setFormData(emptyForm);
  }

  async function handleSave() {
    if (!formData.name.trim() || !formData.email.trim()) {
      setError("Name and email are required.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const hasAvatarFile = formData.avatar instanceof File;
      const url = editing
        ? `${API_BASE}/users/${editing.id}`
        : `${API_BASE}/users`;

      let body, method;

      if (hasAvatarFile) {
        const fd = new FormData();
        fd.append("name", formData.name);
        fd.append("email", formData.email);
        fd.append("phone", formData.phone || "");
        fd.append("role_id", formData.role_id || "");
        fd.append("status", formData.status ? "1" : "0");
        fd.append("avatar", formData.avatar);
        fd.append("password", formData.password || "");
        if (editing) fd.append("_method", "PUT");
        body = fd;
        method = "POST";
      } else {
        const payload = { ...formData };
        delete payload.avatar;
        if (editing && !payload.password) delete payload.password;
        if (!payload.role_id) payload.role_id = null;
        body = JSON.stringify(payload);
        method = editing ? "PUT" : "POST";
      }

      const res = await fetch(url, {
        method,
        headers: hasAvatarFile
          ? authHeaders
          : { ...authHeaders, "Content-Type": "application/json" },
        body,
      });

      const result = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(result?.message || `HTTP ${res.status}`);
      }

      const savedUser = result?.user ?? result;
      try {
        const cur = JSON.parse(localStorage.getItem('user') || '{}');
        if (cur.id && editing && cur.id === editing.id) {
          localStorage.setItem('user', JSON.stringify({ ...cur, ...savedUser }));
        }
      } catch { /* ignore */ }

      closeModal();
      fetchData();
    } catch (err) {
      setError(err.message || "Save failed.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this user?")) return;

    try {
      setError("");

      const res = await fetch(`${API_BASE}/users/${id}`, {
        method: "DELETE",
        headers: authHeaders,
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      fetchData();
    } catch (err) {
      setError(err.message || "Delete failed.");
    }
  }

  function onCropComplete(croppedArea, croppedAreaPixels) {
    setCroppedAreaPixels(croppedAreaPixels);
    if (!outputWidth && !outputHeight) {
      setOutputWidth(String(Math.round(croppedAreaPixels.width)));
      setOutputHeight(String(Math.round(croppedAreaPixels.height)));
    }
  }

  async function handleCropSave() {
    if (croppedAreaPixels) {
      try {
        const w = parseInt(outputWidth) || croppedAreaPixels.width;
        const h = parseInt(outputHeight) || croppedAreaPixels.height;
        const blob = await getCroppedImg(cropImage, croppedAreaPixels, {
          zoom,
          outputWidth: w,
          outputHeight: h,
        });
        const file = new File([blob], "avatar.jpg", { type: "image/jpeg" });
        setFormData((prev) => ({ ...prev, avatar: file }));
      } catch (err) {
        console.error("Crop error:", err);
      }
      setCropOpen(false);
      setCropImage(null);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setOutputWidth("");
      setOutputHeight("");
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  function handleCropCancel() {
    setCropOpen(false);
    setCropImage(null);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setOutputWidth("");
    setOutputHeight("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function handleFileSelect(e) {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        setCropImage(reader.result);
        setCropOpen(true);
      };
    }
  }

  const activeUsers = users.filter((u) => u.status).length;
  const inactiveUsers = users.filter((u) => !u.status).length;

  if (loading) return <Loader text="Loading users..." />

  return (
    <PageLayout>
      <div className="space-y-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Users</h1>
            <p className="mt-1 text-sm text-slate-500">
              Manage staff accounts, roles, and login status.
            </p>
          </div>

          <button
            onClick={openAddModal}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-amber-700"
          >
            <Plus className="h-4 w-4" />
            Add User
          </button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Users"
            value={users.length}
            icon={<User className="h-5 w-5" />}
            color="amber"
          />
          <StatCard
            title="Active Users"
            value={activeUsers}
            icon={<CheckCircle className="h-5 w-5" />}
            color="green"
          />
          <StatCard
            title="Roles"
            value={roles.length}
            icon={<Shield className="h-5 w-5" />}
            color="purple"
          />
          <StatCard
            title="Inactive"
            value={inactiveUsers}
            icon={<XCircle className="h-5 w-5" />}
            color="orange"
          />
        </div>

        {error && (
          <div className="flex items-center justify-between rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <span>{error}</span>
            <button
              onClick={() => setError("")}
              className="font-bold text-red-400 hover:text-red-600"
            >
              ×
            </button>
          </div>
        )}

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-orange-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-4">#</th>
                  <th className="px-5 py-4">Avatar</th>
                  <th className="px-5 py-4">User</th>
                  <th className="px-5 py-4">Phone</th>
                  <th className="px-5 py-4">Role</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4">Last Login</th>
                  <th className="px-5 py-4 text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {users.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="px-5 py-14 text-center">
                      <User className="mx-auto mb-3 h-12 w-12 text-slate-300" />
                      <p className="font-semibold text-slate-600">
                        No users found
                      </p>
                      <p className="text-sm text-slate-400">
                        Click Add User to create one.
                      </p>
                    </td>
                  </tr>
                ) : (
                  users.map((user, index) => (
                    <tr
                      key={user.id}
                      className="transition hover:bg-orange-50"
                    >
                      <td className="px-5 py-4">
                        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-xs font-bold text-amber-700">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        {user.avatar ? (
                          <img
                            src={getImageUrl(user.avatar)}
                            alt={user.name}
                            className="h-10 w-10 rounded object-cover"
                          />
                        ) : <span className="text-slate-300">—</span>}
                      </td>

                      <td className="px-5 py-4">
                        <p className="font-semibold text-slate-800">
                          {user.name}
                        </p>
                        <p className="text-xs text-slate-500">
                          {user.email}
                        </p>
                      </td>

                      <td className="px-5 py-4 text-slate-600">
                        {user.phone || "—"}
                      </td>

                      <td className="px-5 py-4">
                        <span className="rounded-full bg-purple-50 px-3 py-1 text-xs font-semibold text-purple-700">
                          {user.role?.name ?? "No Role"}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <StatusBadge active={user.status} />
                      </td>

                      <td className="px-5 py-4 text-xs text-slate-500">
                        {fmt(user.last_login_at)}
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <IconButton
                            title="View"
                            color="amber"
                            onClick={() => {
                              setDetailUser(user);
                              setShowDetail(true);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </IconButton>

                          <IconButton
                            title="Edit"
                            color="amber"
                            onClick={() => openEditModal(user)}
                          >
                            <Edit2 className="h-4 w-4" />
                          </IconButton>

                          <IconButton
                            title="Delete"
                            color="red"
                            onClick={() => handleDelete(user.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </IconButton>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showDetail && detailUser && (
        <UserDetailModal
          user={detailUser}
          onClose={() => setShowDetail(false)}
          onEdit={() => {
            setShowDetail(false);
            openEditModal(detailUser);
          }}
        />
      )}

      {showModal && (
        <UserFormModal
          editing={editing}
          formData={formData}
          setFormData={setFormData}
          roles={roles}
          saving={saving}
          onClose={closeModal}
          onSave={handleSave}
          fileInputRef={fileInputRef}
          onFileSelect={handleFileSelect}
        />
      )}

      {cropOpen && cropImage && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/75">
          <div className="mx-4 w-full max-w-2xl rounded-2xl bg-white shadow-2xl">
            <div className="border-b px-6 py-4">
              <h3 className="text-lg font-semibold text-slate-900">
                Crop Avatar
              </h3>
            </div>
            <div className="relative h-80">
              <Cropper
                image={cropImage}
                crop={crop}
                zoom={zoom}
                aspect={1}
                cropShape="round"
                showGrid={false}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
            </div>
            <div className="space-y-4 p-6">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Zoom
                </label>
                <input
                  type="range"
                  min={1}
                  max={3}
                  step={0.01}
                  value={zoom}
                  onChange={(e) => setZoom(parseFloat(e.target.value))}
                  className="w-full"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleCropCancel}
                  className="flex-1 rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-orange-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCropSave}
                  className="flex-1 rounded-xl bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-700"
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </PageLayout>
  );
}

function PageLayout({ children }) {
  return (
    <div className="flex h-screen bg-white">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, color }) {
  const colors = {
    amber: "bg-amber-50 text-amber-600",
    green: "bg-green-50 text-green-600",
    purple: "bg-purple-50 text-purple-600",
    orange: "bg-orange-50 text-orange-600",
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            {title}
          </p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{value}</p>
        </div>
        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl ${colors[color]}`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ active }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
        active
          ? "bg-green-50 text-green-700"
          : "bg-slate-100 text-slate-500"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          active ? "bg-green-500" : "bg-slate-400"
        }`}
      />
      {active ? "Active" : "Inactive"}
    </span>
  );
}

function IconButton({ children, title, color, onClick }) {
  const colors = {
    amber: "text-amber-600 hover:bg-teal-50",
    amber: "text-amber-600 hover:bg-teal-50",
    red: "text-red-600 hover:bg-red-50",
  };

  return (
    <button
      title={title}
      onClick={onClick}
      className={`rounded-lg p-2 transition ${colors[color]}`}
    >
      {children}
    </button>
  );
}

function UserDetailModal({ user, onClose, onEdit }) {
  const histories = [...(user.login_histories ?? [])].reverse();

  return (
    <Modal title="User Details" icon={<User className="h-5 w-5" />} onClose={onClose}>
      <div className="space-y-6">
        <div className="flex flex-col items-center gap-4 sm:flex-row">
          {user.avatar ? (
            <img
              src={getImageUrl(user.avatar)}
              alt={user.name}
              className="h-20 w-20 rounded-full object-cover shadow-sm"
            />
          ) : (
            <span className="flex h-20 w-20 items-center justify-center rounded-full bg-amber-50 text-2xl font-bold text-amber-700">
              {user.name?.charAt(0)?.toUpperCase() || "?"}
            </span>
          )}
          <div>
            <h3 className="text-xl font-bold text-slate-900">{user.name}</h3>
            <p className="text-sm text-slate-500">{user.email}</p>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <DetailBox label="Phone" value={user.phone || "—"} />
          <DetailBox label="Role" value={user.role?.name ?? "No Role"} />
          <DetailBox
            label="Status"
            value={user.status ? "Active" : "Inactive"}
          />
          <DetailBox label="Last Login" value={fmt(user.last_login_at)} />
        </div>

        <div>
          <h3 className="mb-3 text-sm font-semibold text-slate-700">
            Login History
          </h3>

          <div className="max-h-56 overflow-y-auto rounded-xl border border-slate-200">
            <table className="w-full text-xs">
              <thead className="sticky top-0 bg-orange-50 text-left text-slate-500">
                <tr>
                  <th className="px-3 py-2">#</th>
                  <th className="px-3 py-2">Login</th>
                  <th className="px-3 py-2">Logout</th>
                  <th className="px-3 py-2">IP</th>
                  <th className="px-3 py-2">Status</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {histories.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-3 py-5 text-center text-slate-400">
                      No login history.
                    </td>
                  </tr>
                ) : (
                  histories.map((h, index) => (
                    <tr key={h.id}>
                      <td className="px-3 py-2 text-slate-400">
                        {index + 1}
                      </td>
                      <td className="px-3 py-2">{fmt(h.login_at)}</td>
                      <td className="px-3 py-2">{fmt(h.logout_at)}</td>
                      <td className="px-3 py-2 font-mono">
                        {h.ip_address || "—"}
                      </td>
                      <td className="px-3 py-2">
                        {h.status || "—"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t pt-4">
          <button
            onClick={onEdit}
            className="rounded-xl bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-700 hover:bg-amber-100"
          >
            Edit User
          </button>
          <button
            onClick={onClose}
            className="rounded-xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
}

function DetailBox({ label, value }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-orange-50 p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-1 font-medium text-slate-800">{value}</p>
    </div>
  );
}

function UserFormModal({
  editing,
  formData,
  setFormData,
  roles,
  saving,
  onClose,
  onSave,
  fileInputRef,
  onFileSelect,
}) {
  const avatarPreview =
    formData.avatar instanceof File
      ? URL.createObjectURL(formData.avatar)
      : formData.avatar
        ? getImageUrl(formData.avatar)
        : null;

  return (
    <Modal
      title={editing ? "Edit User" : "Add New User"}
      icon={editing ? <Edit2 className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
      onClose={onClose}
    >
      <div className="space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-slate-700">
            Avatar
          </label>
          <div className="flex items-center gap-4">
            {avatarPreview ? (
              <img
                src={avatarPreview}
                alt="Avatar preview"
                className="h-16 w-16 rounded-full object-cover"
              />
            ) : (
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                <Camera className="h-6 w-6" />
              </span>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={onFileSelect}
              className="w-full rounded-xl border border-slate-300 px-4 py-2 text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-amber-50 file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-amber-700 hover:file:bg-amber-100"
            />
          </div>
        </div>

        <Input
          label="Full Name"
          value={formData.name}
          placeholder="Enter full name"
          onChange={(value) => setFormData({ ...formData, name: value })}
        />

        <Input
          label="Email Address"
          type="email"
          value={formData.email}
          placeholder="user@example.com"
          onChange={(value) => setFormData({ ...formData, email: value })}
        />

        <div>
          <label className="mb-1.5 block text-sm font-semibold text-slate-700">
            Role
          </label>
          <select
            value={formData.role_id}
            onChange={(e) =>
              setFormData({ ...formData, role_id: e.target.value })
            }
            className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
          >
            <option value="">Select role</option>
            {roles.map((role) => (
              <option key={role.id} value={role.id}>
                {role.name}
              </option>
            ))}
          </select>
        </div>

        <Input
          label="Phone Number"
          value={formData.phone}
          placeholder="Optional"
          onChange={(value) => setFormData({ ...formData, phone: value })}
        />

        <Input
          label={`Password ${editing ? "(leave blank to keep current)" : ""}`}
          type="password"
          value={formData.password}
          placeholder={editing ? "New password" : "Min 8 characters"}
          onChange={(value) => setFormData({ ...formData, password: value })}
        />

        <div>
          <label className="mb-1.5 block text-sm font-semibold text-slate-700">
            Status
          </label>
          <select
            value={String(formData.status)}
            onChange={(e) =>
              setFormData({
                ...formData,
                status: e.target.value === "true",
              })
            }
            className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
          >
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
        </div>

        <div className="flex justify-end gap-3 border-t pt-4">
          <button
            onClick={onClose}
            disabled={saving}
            className="rounded-xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200 disabled:opacity-60"
          >
            Cancel
          </button>

          <button
            onClick={onSave}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-700 disabled:opacity-60"
          >
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            {editing ? "Save Changes" : "Create User"}
          </button>
        </div>
      </div>
    </Modal>
  );
}

function Input({ label, value, onChange, placeholder, type = "text" }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-semibold text-slate-700">
        {label}
      </label>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
      />
    </div>
  );
}

function Modal({ title, icon, children, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900">
            {icon}
            {title}
          </h2>

          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="max-h-[75vh] overflow-y-auto p-6">{children}</div>
      </div>
    </div>
  );
}