function DashboardPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-slate-900">Dashboard</h1>
      <p className="text-sm text-slate-500">
        High-level overview of your training pipeline. We’ll add stats,
        charts and upcoming courses here later.
      </p>
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="text-xs font-medium text-slate-500">
            Courses this month
          </div>
          <div className="mt-2 text-3xl font-semibold text-slate-900">5</div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="text-xs font-medium text-slate-500">
            Learners booked
          </div>
          <div className="mt-2 text-3xl font-semibold text-slate-900">36</div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="text-xs font-medium text-slate-500">
            Trainers active
          </div>
          <div className="mt-2 text-3xl font-semibold text-slate-900">4</div>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
