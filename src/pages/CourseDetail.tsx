// src/pages/CourseDetail.tsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

type Course = {
  id: number;
  title?: string;
  course_type?: string | null;
  provider_type?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  status?: string | null;
  venue_name?: string | null;
  trainer_name?: string | null;
  capacity?: number | null;
};

type Participant = {
  id: number;
  course_id: number;
  first_name: string;
  surname: string;
  contact_number?: string | null;
  email?: string | null;
  payment_status?: string | null;
  notes?: string | null;
  joining_sent: boolean;
};

export default function CourseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [course, setCourse] = useState<Course | null>(null);
  const [courseLoading, setCourseLoading] = useState(true);
  const [courseError, setCourseError] = useState<string | null>(null);

  const [participants, setParticipants] = useState<Participant[]>([]);
  const [pLoading, setPLoading] = useState(true);
  const [pError, setPError] = useState<string | null>(null);

  const [showAddModal, setShowAddModal] = useState(false);
  const [savingParticipant, setSavingParticipant] = useState(false);

  const [newFirstName, setNewFirstName] = useState("");
  const [newSurname, setNewSurname] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newContact, setNewContact] = useState("");
  const [newPaymentStatus, setNewPaymentStatus] = useState("Unpaid");
  const [newNotes, setNewNotes] = useState("");

  const courseId = Number(id);

  useEffect(() => {
    if (!courseId) return;

    async function loadCourse() {
      try {
        const res = await fetch(`http://127.0.0.1:8000/api/courses/${courseId}`);
        if (!res.ok) throw new Error("Failed to load course");
        const data = await res.json();
        setCourse(data);
      } catch (err: any) {
        console.error(err);
        setCourseError(err.message ?? "Failed to load course");
      } finally {
        setCourseLoading(false);
      }
    }

    async function loadParticipants() {
      try {
        const res = await fetch(
          `http://127.0.0.1:8000/api/participants/by-course/${courseId}`
        );
        if (!res.ok) throw new Error("Failed to load participants");
        const data = await res.json();
        setParticipants(data);
      } catch (err: any) {
        console.error(err);
        setPError(err.message ?? "Failed to load participants");
      } finally {
        setPLoading(false);
      }
    }

    loadCourse();
    loadParticipants();
  }, [courseId]);

  async function handleAddParticipant(e: React.FormEvent) {
    e.preventDefault();
    if (!courseId) return;

    setSavingParticipant(true);
    setPError(null);

    try {
      const res = await fetch(
        `http://127.0.0.1:8000/api/participants/by-course/${courseId}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            first_name: newFirstName,
            surname: newSurname,
            email: newEmail || null,
            contact_number: newContact || null,
            payment_status: newPaymentStatus || null,
            notes: newNotes || null,
            joining_sent: false,
          }),
        }
      );

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || "Failed to add participant");
      }

      const created: Participant = await res.json();
      setParticipants((prev) => [...prev, created]);

      setShowAddModal(false);
      setNewFirstName("");
      setNewSurname("");
      setNewEmail("");
      setNewContact("");
      setNewPaymentStatus("Unpaid");
      setNewNotes("");
    } catch (err: any) {
      console.error(err);
      setPError(err.message ?? "Failed to add participant");
    } finally {
      setSavingParticipant(false);
    }
  }

  async function toggleJoiningSent(p: Participant) {
    try {
      const res = await fetch(
        `http://127.0.0.1:8000/api/participants/${p.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            joining_sent: !p.joining_sent,
          }),
        }
      );

      if (!res.ok) throw new Error("Failed to update participant");

      const updated: Participant = await res.json();
      setParticipants((prev) =>
        prev.map((row) => (row.id === updated.id ? updated : row))
      );
    } catch (err) {
      console.error(err);
      // silent for now – we can surface an error banner later
    }
  }

  async function deleteParticipant(p: Participant) {
    const confirmed = window.confirm(
      `Remove ${p.first_name} ${p.surname} from this course?`
    );
    if (!confirmed) return;

    try {
      const res = await fetch(
        `http://127.0.0.1:8000/api/participants/${p.id}`,
        { method: "DELETE" }
      );
      if (!res.ok) throw new Error("Failed to delete participant");

      setParticipants((prev) => prev.filter((row) => row.id !== p.id));
    } catch (err) {
      console.error(err);
    }
  }

  function renderStatusPill(status?: string | null) {
    if (!status) {
      return (
        <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
          Unknown
        </span>
      );
    }

    const normalized = status.toLowerCase();
    if (normalized.includes("cancel")) {
      return (
        <span className="inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-[11px] font-medium text-red-800">
          {status}
        </span>
      );
    }
    if (normalized.includes("full")) {
      return (
        <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-medium text-amber-800">
          {status}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-medium text-emerald-800">
        {status}
      </span>
    );
  }

  function renderPaymentStatus(p: Participant) {
    const status = (p.payment_status || "Unpaid").toLowerCase();

    if (status.includes("paid")) {
      return (
        <span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-medium text-emerald-800">
          Paid
        </span>
      );
    }

    if (status.includes("invoice")) {
      return (
        <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-[11px] font-medium text-blue-800">
          Invoiced
        </span>
      );
    }

    return (
      <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-medium text-amber-800">
        Unpaid
      </span>
    );
  }

  if (!courseId) {
    return (
      <div className="text-sm text-slate-500">
        Invalid course ID.{" "}
        <button
          onClick={() => navigate("/courses")}
          className="text-slate-900 underline"
        >
          Back to courses
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header row */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <button
            onClick={() => navigate("/courses")}
            className="text-xs text-slate-500 hover:text-slate-800"
          >
            ← Back to courses
          </button>
          <h1 className="mt-1 text-xl font-semibold text-slate-900">
            {courseLoading
              ? "Loading course…"
              : course?.title || "Course detail"}
          </h1>
          {course && (
            <p className="text-xs text-slate-500">
              {course.course_type && (
                <>
                  {course.course_type} •{" "}
                </>
              )}
              {course.provider_type || "Provider not set"}
            </p>
          )}
        </div>

        <div className="flex flex-col items-end gap-1 text-xs text-slate-500">
          {course && (
            <>
              <div className="flex items-center gap-2">
                {renderStatusPill(course.status)}
              </div>
              <div>
                {course.start_date || "Start date not set"}{" "}
                {course.end_date && `→ ${course.end_date}`}
              </div>
            </>
          )}
        </div>
      </div>

      {courseError && (
        <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {courseError}
        </div>
      )}

      {/* Top info cards */}
      {course && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="text-xs font-medium text-slate-500 uppercase mb-1">
              Venue
            </div>
            <div className="text-sm text-slate-900">
              {course.venue_name || "Not set"}
            </div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="text-xs font-medium text-slate-500 uppercase mb-1">
              Trainer
            </div>
            <div className="text-sm text-slate-900">
              {course.trainer_name || "Not assigned"}
            </div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="text-xs font-medium text-slate-500 uppercase mb-1">
              Capacity
            </div>
            <div className="text-sm text-slate-900">
              {course.capacity ?? "-"} learners
            </div>
          </div>
        </div>
      )}

      {/* Participants section */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-3">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">
              Participants
            </h2>
            <p className="text-xs text-slate-500">
              Manage learners registered on this course.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-slate-800"
          >
            + Add participant
          </button>
        </div>

        {pError && (
          <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {pError}
          </div>
        )}

        {pLoading ? (
          <div className="text-sm text-slate-500">Loading participants…</div>
        ) : participants.length === 0 ? (
          <div className="text-sm text-slate-500">
            No participants yet. Use “Add participant” to get started.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs font-medium text-slate-500 uppercase tracking-wide">
                <tr>
                  <th className="px-3 py-2">Name</th>
                  <th className="px-3 py-2">Contact</th>
                  <th className="px-3 py-2">Payment</th>
                  <th className="px-3 py-2">Joining instructions</th>
                  <th className="px-3 py-2">Notes</th>
                  <th className="px-3 py-2"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {participants.map((p) => (
                  <tr key={p.id}>
                    <td className="px-3 py-2">
                      <div className="font-medium">
                        {p.first_name} {p.surname}
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <div className="space-y-0.5">
                        {p.email && (
                          <div className="text-slate-700">{p.email}</div>
                        )}
                        {p.contact_number && (
                          <div className="text-slate-500">
                            {p.contact_number}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-2">{renderPaymentStatus(p)}</td>
                    <td className="px-3 py-2">
                      <button
                        type="button"
                        onClick={() => toggleJoiningSent(p)}
                        className={[
                          "inline-flex items-center rounded-full px-3 py-0.5 text-[11px] font-medium",
                          p.joining_sent
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-slate-100 text-slate-600",
                        ].join(" ")}
                      >
                        {p.joining_sent ? "Sent" : "Not sent"}
                      </button>
                    </td>
                    <td className="px-3 py-2 max-w-xs">
                      {p.notes ? (
                        <span>{p.notes}</span>
                      ) : (
                        <span className="text-slate-400 italic">-</span>
                      )}
                    </td>
                    <td className="px-3 py-2 text-right">
                      <button
                        type="button"
                        onClick={() => deleteParticipant(p)}
                        className="text-[11px] text-slate-400 hover:text-red-500"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add participant modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-20 flex items-center justify-center bg-slate-950/40">
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl">
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-slate-900">
                Add participant
              </h3>
              <p className="text-xs text-slate-500">
                Add a learner to this course. You can send joining instructions
                later.
              </p>
            </div>

            <form onSubmit={handleAddParticipant} className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    First name
                  </label>
                  <input
                    className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                    value={newFirstName}
                    onChange={(e) => setNewFirstName(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Surname
                  </label>
                  <input
                    className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                    value={newSurname}
                    onChange={(e) => setNewSurname(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Email (optional)
                  </label>
                  <input
                    type="email"
                    className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Contact number (optional)
                  </label>
                  <input
                    className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                    value={newContact}
                    onChange={(e) => setNewContact(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Payment status
                </label>
                <select
                  className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                  value={newPaymentStatus}
                  onChange={(e) => setNewPaymentStatus(e.target.value)}
                >
                  <option value="Unpaid">Unpaid</option>
                  <option value="Paid">Paid</option>
                  <option value="Invoiced">Invoiced</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Notes (optional)
                </label>
                <textarea
                  rows={3}
                  className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingParticipant}
                  className="px-4 py-1.5 rounded-lg text-xs font-medium bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-60"
                >
                  {savingParticipant ? "Adding…" : "Add participant"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
