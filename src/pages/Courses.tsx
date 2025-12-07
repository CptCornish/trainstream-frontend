// src/pages/Courses.tsx
import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";

type Course = {
  id: number;
  title: string;
  code: string;
  start_date: string;
  end_date: string | null;
  trainer_name: string;
  venue_name: string;
  status: string;
};

type CourseTemplate = {
  id: number;
  name: string;
  course_title?: string | null;
  default_capacity?: number | null;
  provider_type?: string | null;
};

type Venue = {
  id: number;
  name: string;
  city?: string | null;
  postcode?: string | null;
};

const STATUS_COLORS: Record<string, string> = {
  Planned: "bg-blue-100 text-blue-800",
  Running: "bg-amber-100 text-amber-800",
  Completed: "bg-emerald-100 text-emerald-800",
  Cancelled: "bg-red-100 text-red-800",
};

function CoursesPage() {
  const navigate = useNavigate();

  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  const [templates, setTemplates] = useState<CourseTemplate[]>([]);
  const [venues, setVenues] = useState<Venue[]>([]);

  const [showNewCourse, setShowNewCourse] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const [templateId, setTemplateId] = useState<number | "">("");
  const [date, setDate] = useState("");
  const [venueId, setVenueId] = useState<number | "">("");
  const [trainer, setTrainer] = useState("");
  const [capacity, setCapacity] = useState<number | "">(12);
  const [status, setStatus] = useState("Planned");

  // -------------------------
  // Data loading
  // -------------------------
  useEffect(() => {
    const loadAll = async () => {
      try {
        setLoading(true);

        const [coursesRes, templatesRes, venuesRes] = await Promise.all([
          fetch("http://127.0.0.1:8000/api/courses"),
          fetch("http://127.0.0.1:8000/api/course-templates"),
          fetch("http://127.0.0.1:8000/api/venues"),
        ]);

        const [coursesData, templatesData, venuesData] = await Promise.all([
          coursesRes.json(),
          templatesRes.json(),
          venuesRes.json(),
        ]);

        setCourses(coursesData);
        setTemplates(templatesData);
        setVenues(venuesData);

        // Default date = today
        const today = new Date().toISOString().slice(0, 10);
        setDate(today);
      } catch (err) {
        console.error("Failed to load data", err);
      } finally {
        setLoading(false);
      }
    };

    loadAll();
  }, []);

  // -------------------------
  // Handlers
  // -------------------------

  const handleRowClick = (courseId: number) => {
    navigate(`/courses/${courseId}`);
  };

  const resetForm = () => {
    setTemplateId("");
    const today = new Date().toISOString().slice(0, 10);
    setDate(today);
    setVenueId("");
    setTrainer("");
    setCapacity(12);
    setStatus("Planned");
    setCreateError(null);
  };

  const handleCreateCourse = async (e: FormEvent) => {
    e.preventDefault();
    setCreateError(null);

    if (!templateId || !date) {
      setCreateError("Template and date are required.");
      return;
    }

    try {
      setCreating(true);

      const payload = {
        template_id: templateId,
        course_date: date, // "YYYY-MM-DD"
        venue_id: venueId === "" ? null : Number(venueId),
        trainer: trainer,
        capacity:
          typeof capacity === "number"
            ? capacity
            : parseInt(String(capacity || "0"), 10) || 12,
        status,
      };

      const res = await fetch("http://127.0.0.1:8000/api/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const text = await res.text();
        console.error("Create course failed:", text);
        setCreateError("Failed to create course.");
        return;
      }

      const created: Course = await res.json();

      // Add the new course to the list (or you could reload)
      setCourses((prev) => [created, ...prev]);

      // Close and reset
      resetForm();
      setShowNewCourse(false);
    } catch (err) {
      console.error("Error creating course", err);
      setCreateError("Unexpected error creating course.");
    } finally {
      setCreating(false);
    }
  };

  // -------------------------
  // Render
  // -------------------------

  return (
    <div className="space-y-4">
      <header className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Courses</h1>
          <p className="text-sm text-slate-500">
            Overview of upcoming and recent training courses.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            if (!showNewCourse) resetForm();
            setShowNewCourse((prev) => !prev);
          }}
          className="px-5 py-2 rounded-full bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition"
        >
          + New Course
        </button>
      </header>

      {showNewCourse && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl px-6 py-5 text-sm text-slate-50 space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-sm font-semibold text-white">
                Create new course
              </h2>
              <p className="text-xs text-slate-300">
                Use an existing template to quickly build a new course.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowNewCourse(false)}
              className="w-8 h-8 inline-flex items-center justify-center rounded-full bg-slate-800 hover:bg-slate-700 text-slate-200 text-lg leading-none"
            >
              ×
            </button>
          </div>

          <form
            className="grid grid-cols-1 md:grid-cols-3 gap-4"
            onSubmit={handleCreateCourse}
          >
            {/* Template */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-slate-200">
                Template
              </label>
              <select
                className="rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-slate-50"
                value={templateId}
                onChange={(e) =>
                  setTemplateId(
                    e.target.value === "" ? "" : Number(e.target.value)
                  )
                }
              >
                <option value="">Select a template…</option>
                {templates.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                    {t.provider_type ? ` – ${t.provider_type}` : ""}
                  </option>
                ))}
              </select>
            </div>

            {/* Date */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-slate-200">
                Course date
              </label>
              <input
                type="date"
                className="rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-slate-50"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>

            {/* Venue */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-slate-200">
                Venue
              </label>
              <select
                className="rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-slate-50"
                value={venueId}
                onChange={(e) =>
                  setVenueId(
                    e.target.value === "" ? "" : Number(e.target.value)
                  )
                }
              >
                <option value="">No venue yet</option>
                {venues.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name}
                    {v.city ? ` – ${v.city}` : ""}
                    {v.postcode ? ` (${v.postcode})` : ""}
                  </option>
                ))}
              </select>
            </div>

            {/* Trainer */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-slate-200">
                Trainer
              </label>
              <input
                type="text"
                className="rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-slate-50"
                value={trainer}
                onChange={(e) => setTrainer(e.target.value)}
                placeholder="e.g. Ross Stevenson"
              />
            </div>

            {/* Capacity */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-slate-200">
                Capacity
              </label>
              <input
                type="number"
                min={1}
                className="rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-slate-50"
                value={capacity}
                onChange={(e) =>
                  setCapacity(
                    e.target.value === ""
                      ? ""
                      : Math.max(1, Number(e.target.value))
                  )
                }
              />
            </div>

            {/* Status */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-slate-200">
                Status
              </label>
              <select
                className="rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-slate-50"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="Planned">Planned</option>
                <option value="Running">Running</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>

            {/* Actions */}
            <div className="md:col-span-3 flex items-center justify-end gap-3 pt-2">
              {createError && (
                <div className="text-xs text-red-300 mr-auto">
                  {createError}
                </div>
              )}

              <button
                type="button"
                onClick={() => {
                  resetForm();
                  setShowNewCourse(false);
                }}
                className="px-4 py-2 rounded-full border border-slate-600 text-xs font-medium text-slate-200 hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={creating || !templateId || !date}
                className="px-5 py-2 rounded-full bg-blue-500 text-white text-xs font-semibold hover:bg-blue-600 disabled:opacity-60"
              >
                {creating ? "Creating…" : "Create course"}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
          <h2 className="text-sm font-semibold text-slate-700">
            Courses ({courses.length})
          </h2>

          <input
            type="text"
            placeholder="Search courses…"
            className="px-3 py-1.5 rounded-full border border-slate-300 text-sm"
          />
        </div>

        {loading ? (
          <div className="p-6 text-sm text-slate-500">Loading courses…</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-100">
                <tr>
                  <th className="px-4 py-2 text-left font-semibold text-slate-600">
                    Course
                  </th>
                  <th className="px-4 py-2 text-left font-semibold text-slate-600">
                    Dates
                  </th>
                  <th className="px-4 py-2 text-left font-semibold text-slate-600">
                    Trainer
                  </th>
                  <th className="px-4 py-2 text-left font-semibold text-slate-600">
                    Venue
                  </th>
                  <th className="px-4 py-2 text-left font-semibold text-slate-600">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {courses.map((course) => {
                  const statusClass =
                    STATUS_COLORS[course.status] ??
                    "bg-slate-100 text-slate-800";

                  const start = new Date(course.start_date);
                  const end = course.end_date
                    ? new Date(course.end_date)
                    : null;

                  const dateStr = end
                    ? `${start.toLocaleDateString()} – ${end.toLocaleDateString()}`
                    : start.toLocaleDateString();

                  return (
                    <tr
                      key={course.id}
                      className="hover:bg-slate-100 cursor-pointer"
                      onClick={() => handleRowClick(course.id)}
                    >
                      <td className="px-4 py-3">
                        <div className="font-medium text-slate-900">
                          {course.title}
                        </div>
                        <div className="text-xs text-slate-500">
                          {course.code}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-700">{dateStr}</td>
                      <td className="px-4 py-3 text-slate-700">
                        {course.trainer_name}
                      </td>
                      <td className="px-4 py-3 text-slate-700">
                        {course.venue_name}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${statusClass}`}
                        >
                          {course.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default CoursesPage;
