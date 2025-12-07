// src/pages/Settings.tsx
import React, { useEffect, useState } from "react";

const TABS = ["Users", "Course Templates"] as const;
type TabKey = (typeof TABS)[number];

export default function SettingsPage() {
  const [tab, setTab] = useState<TabKey>("Users");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Settings</h1>
        <p className="text-sm text-slate-500">
          Manage users and course templates for TrainStream.
        </p>
      </div>

      {/* Tab selector */}
      <div className="border-b border-slate-200">
        <nav className="-mb-px flex gap-4 text-sm">
          {TABS.map((t) => {
            const isActive = tab === t;
            return (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                className={[
                  "px-3 pb-2 border-b-2 text-sm font-medium transition",
                  isActive
                    ? "border-slate-900 text-slate-900"
                    : "border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300",
                ].join(" ")}
              >
                {t}
              </button>
            );
          })}
        </nav>
      </div>

      {tab === "Users" && <UsersTab />}
      {tab === "Course Templates" && <TemplatesTab />}
    </div>
  );
}

/* ───── USERS TAB ───── */

type User = {
  id: number;
  first_name: string;
  surname: string;
  full_name: string;
  role: string;
  email?: string | null;
  must_change_password: boolean;
};

function UsersTab() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showModal, setShowModal] = useState(false);
  const [creating, setCreating] = useState(false);

  const [firstName, setFirstName] = useState("");
  const [surname, setSurname] = useState("");
  const [role, setRole] = useState("Training Admin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("http://127.0.0.1:8000/api/users");
        if (!res.ok) throw new Error("Failed to load users");
        const data = await res.json();
        setUsers(data);
      } catch (err: any) {
        console.error(err);
        setError(err.message ?? "Failed to load users");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function handleCreateUser(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    setError(null);

    try {
      const res = await fetch("http://127.0.0.1:8000/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          first_name: firstName,
          surname,
          role,
          email: email || null,
          password,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || "Failed to create user");
      }

      const created: User = await res.json();
      setUsers((prev) => [...prev, created]);
      setShowModal(false);
      setFirstName("");
      setSurname("");
      setRole("Training Admin");
      setEmail("");
      setPassword("");
    } catch (err: any) {
      console.error(err);
      setError(err.message ?? "Failed to create user");
    } finally {
      setCreating(false);
    }
  }

  async function toggleMustChange(user: User) {
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/users/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          must_change_password: !user.must_change_password,
        }),
      });

      if (!res.ok) throw new Error("Failed to update user");

      const updated: User = await res.json();
      setUsers((prev) =>
        prev.map((u) => (u.id === updated.id ? updated : u))
      );
    } catch (err: any) {
      console.error(err);
      setError(err.message ?? "Failed to update user");
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">Users</h2>
          <p className="text-xs text-slate-500">
            Control who can log in and what they can do.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowModal(true)}
          className="inline-flex items-center rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-slate-800"
        >
          + Add user
        </button>
      </div>

      {error && (
        <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-sm text-slate-500">Loading users…</div>
      ) : users.length === 0 ? (
        <div className="text-sm text-slate-500">
          No users yet. Add your first admin or trainer.
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs font-medium text-slate-500 uppercase tracking-wide">
              <tr>
                <th className="px-4 py-2">Name</th>
                <th className="px-4 py-2">Role</th>
                <th className="px-4 py-2">Email</th>
                <th className="px-4 py-2">Password status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((u) => (
                <tr key={u.id} className="text-xs text-slate-700">
                  <td className="px-4 py-2">
                    <div className="font-medium">{u.full_name}</div>
                  </td>
                  <td className="px-4 py-2">{u.role}</td>
                  <td className="px-4 py-2">
                    {u.email || (
                      <span className="text-slate-400 italic">No email</span>
                    )}
                  </td>
                  <td className="px-4 py-2">
                    <button
                      type="button"
                      onClick={() => toggleMustChange(u)}
                      className={[
                        "inline-flex items-center rounded-full px-3 py-1 text-[11px] font-medium",
                        u.must_change_password
                          ? "bg-amber-100 text-amber-900"
                          : "bg-emerald-100 text-emerald-900",
                      ].join(" ")}
                    >
                      {u.must_change_password
                        ? "Must change at next login"
                        : "Password OK"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add user modal */}
      {showModal && (
        <div className="fixed inset-0 z-20 flex items-center justify-center bg-slate-950/40">
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl">
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-slate-900">
                Add new user
              </h3>
              <p className="text-xs text-slate-500">
                Create an account for an admin, training admin, or trainer.
              </p>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    First name
                  </label>
                  <input
                    className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Surname
                  </label>
                  <input
                    className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                    value={surname}
                    onChange={(e) => setSurname(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Role
                  </label>
                  <select
                    className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                  >
                    <option>Admin</option>
                    <option>Training Admin</option>
                    <option>Trainer</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Email (optional)
                  </label>
                  <input
                    type="email"
                    className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Initial password
                </label>
                <input
                  type="password"
                  className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <p className="mt-1 text-[11px] text-slate-500">
                  User will be asked to change this at first login.
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-4 py-1.5 rounded-lg text-xs font-medium bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-60"
                >
                  {creating ? "Creating…" : "Create user"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

/* ───── COURSE TEMPLATES TAB ───── */

type CourseTemplate = {
  id: number;
  name: string;
  course_type?: string | null;
  course_title?: string | null;
  provider_type?: string | null;
  default_capacity?: number | null;
  validity_months?: number | null;
  cpd_hours?: number | null;
};

function TemplatesTab() {
  const [templates, setTemplates] = useState<CourseTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState("");
  const [courseType, setCourseType] = useState("");
  const [courseTitle, setCourseTitle] = useState("");
  const [providerType, setProviderType] = useState("Qualsafe");
  const [defaultCapacity, setDefaultCapacity] = useState<string>("");
  const [validityMonths, setValidityMonths] = useState<string>("");
  const [cpdHours, setCpdHours] = useState<string>("");

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(
          "http://127.0.0.1:8000/api/course-templates"
        );
        if (!res.ok) throw new Error("Failed to load course templates");
        const data = await res.json();
        setTemplates(data);
      } catch (err: any) {
        console.error(err);
        setError(err.message ?? "Failed to load course templates");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function handleCreateTemplate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const res = await fetch("http://127.0.0.1:8000/api/course-templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          course_type: courseType || null,
          course_title: courseTitle || null,
          provider_type: providerType || null,
          default_capacity:
            defaultCapacity === "" ? null : Number(defaultCapacity),
          validity_months:
            validityMonths === "" ? null : Number(validityMonths),
          cpd_hours: cpdHours === "" ? null : Number(cpdHours),
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || "Failed to create template");
      }

      const created: CourseTemplate = await res.json();
      setTemplates((prev) => [...prev, created]);
      setShowModal(false);
      setName("");
      setCourseType("");
      setCourseTitle("");
      setProviderType("Qualsafe");
      setDefaultCapacity("");
      setValidityMonths("");
      setCpdHours("");
    } catch (err: any) {
      console.error(err);
      setError(err.message ?? "Failed to create template");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">
            Course templates
          </h2>
          <p className="text-xs text-slate-500">
            Pre-configure FREC, EFAW and other common courses.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowModal(true)}
          className="inline-flex items-center rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-slate-800"
        >
          + Add template
        </button>
      </div>

      {error && (
        <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-sm text-slate-500">Loading templates…</div>
      ) : templates.length === 0 ? (
        <div className="text-sm text-slate-500">
          No templates yet. Add your first FREC / EFAW template above.
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs font-medium text-slate-500 uppercase tracking-wide">
              <tr>
                <th className="px-4 py-2">Name</th>
                <th className="px-4 py-2">Course title</th>
                <th className="px-4 py-2">Provider</th>
                <th className="px-4 py-2">Capacity</th>
                <th className="px-4 py-2">Validity (months)</th>
                <th className="px-4 py-2">CPD hours</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {templates.map((t) => (
                <tr key={t.id}>
                  <td className="px-4 py-2 font-medium">{t.name}</td>
                  <td className="px-4 py-2">
                    {t.course_title || (
                      <span className="text-slate-400 italic">Not set</span>
                    )}
                  </td>
                  <td className="px-4 py-2">
                    {t.provider_type || (
                      <span className="text-slate-400 italic">-</span>
                    )}
                  </td>
                  <td className="px-4 py-2">
                    {t.default_capacity ?? (
                      <span className="text-slate-400 italic">-</span>
                    )}
                  </td>
                  <td className="px-4 py-2">
                    {t.validity_months ?? (
                      <span className="text-slate-400 italic">-</span>
                    )}
                  </td>
                  <td className="px-4 py-2">
                    {t.cpd_hours ?? (
                      <span className="text-slate-400 italic">-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add template modal */}
      {showModal && (
        <div className="fixed inset-0 z-20 flex items-center justify-center bg-slate-950/40">
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl">
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-slate-900">
                Add course template
              </h3>
              <p className="text-xs text-slate-500">
                Save a reusable template for common courses like FREC or EFAW.
              </p>
            </div>

            <form onSubmit={handleCreateTemplate} className="space-y-3 text-sm">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Template name
                </label>
                <input
                  className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="FREC 3 (5-day)"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Course type (internal)
                  </label>
                  <input
                    className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                    value={courseType}
                    onChange={(e) => setCourseType(e.target.value)}
                    placeholder="FREC3 / EFAW / MHFA…"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Course title (learner-facing)
                  </label>
                  <input
                    className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                    value={courseTitle}
                    onChange={(e) => setCourseTitle(e.target.value)}
                    placeholder="QA L3 Award in First Response Emergency Care"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Provider
                  </label>
                  <select
                    className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                    value={providerType}
                    onChange={(e) => setProviderType(e.target.value)}
                  >
                    <option value="Qualsafe">Qualsafe</option>
                    <option value="CPDSO">CPDSO</option>
                    <option value="In-house">In-house</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Default capacity
                  </label>
                  <input
                    type="number"
                    min={1}
                    className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                    value={defaultCapacity}
                    onChange={(e) => setDefaultCapacity(e.target.value)}
                    placeholder="6"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Validity (months)
                  </label>
                  <input
                    type="number"
                    min={0}
                    className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                    value={validityMonths}
                    onChange={(e) => setValidityMonths(e.target.value)}
                    placeholder="36"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    CPD hours
                  </label>
                  <input
                    type="number"
                    min={0}
                    step="0.5"
                    className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                    value={cpdHours}
                    onChange={(e) => setCpdHours(e.target.value)}
                    placeholder="35"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-1.5 rounded-lg text-xs font-medium bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-60"
                >
                  {saving ? "Saving…" : "Create template"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
