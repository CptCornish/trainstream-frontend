// src/App.tsx
import {
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate,
  NavLink,
} from "react-router-dom";

import LoginPage from "./pages/login";
import DashboardPage from "./pages/Dashboard";
import CoursesPage from "./pages/Courses";
import CourseDetailPage from "./pages/CourseDetail";
import TrainersPage from "./pages/Trainers";
import VenuesPage from "./pages/Venues";
import SettingsPage from "./pages/Settings";

type NavItem = {
  to: string;
  label: string;
};

const NAV_ITEMS: NavItem[] = [
  { to: "/", label: "Dashboard" },
  { to: "/courses", label: "Courses" },
  { to: "/trainers", label: "Trainers" },
  { to: "/venues", label: "Venues" },
  { to: "/settings", label: "Settings" },
];

function isAuthenticated(): boolean {
  return !!localStorage.getItem("ts_token");
}

type AppShellProps = {
  onLogout: () => void;
};

function AppShell({ onLogout }: AppShellProps) {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex">
      {/* Sidebar */}
      <aside className="w-64 border-r border-slate-800 bg-slate-950/80 backdrop-blur flex flex-col">
        <div className="h-16 border-b border-slate-800 px-6 flex items-center gap-2">
          <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 shadow-lg shadow-blue-500/40" />
          <div>
            <div className="text-sm font-semibold tracking-tight">
              TrainStream
            </div>
            <div className="text-xs text-slate-500">
              Course & trainer management
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) =>
                [
                  "flex items-center px-3 py-2 rounded-xl text-sm font-medium transition",
                  isActive
                    ? "bg-slate-100 text-slate-900"
                    : "text-slate-200 hover:bg-slate-800 hover:text-white",
                ].join(" ")
              }
            >
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="px-6 py-4 border-t border-slate-800 text-xs text-slate-500">
          <div className="font-medium text-slate-300">
            {localStorage.getItem("ts_user") || "User"}
          </div>
          <div className="mb-2">TrainStream v3 • Local</div>
          <button
            onClick={onLogout}
            className="w-full rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-100 text-xs font-medium py-1.5"
          >
            Log out
          </button>
        </div>
      </aside>

      {/* Main area */}
      <main className="flex-1 flex flex-col bg-slate-50">
        {/* Top bar */}
        <header className="h-14 border-b border-slate-200 bg-white/70 backdrop-blur flex items-center justify-between px-6">
          <div className="text-sm text-slate-500">
            {location.pathname === "/"
              ? "Dashboard"
              : location.pathname
                  .slice(1)
                  .split("/")[0]
                  .replace(/^\w/, (c) => c.toUpperCase())}
          </div>
          <div className="text-xs text-slate-400">
            Signed in as{" "}
            <span className="font-medium text-slate-700">
              {localStorage.getItem("ts_user") || "User"}
            </span>
          </div>
        </header>

        {/* Page content */}
        <div className="flex-1 p-6">
          <div className="mx-auto max-w-6xl">
            <Routes>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/courses" element={<CoursesPage />} />
              <Route path="/courses/:id" element={<CourseDetailPage />} />
              <Route path="/trainers" element={<TrainersPage />} />
              <Route path="/venues" element={<VenuesPage />} />
              <Route path="/settings" element={<SettingsPage />} />

              {/* Catch-all */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function App() {
  const location = useLocation();
  const navigate = useNavigate();

  const authed = isAuthenticated();

  function handleLogout() {
    localStorage.removeItem("ts_token");
    localStorage.removeItem("ts_user");
    navigate("/login", { replace: true });
  }

  // If NOT logged in and not already on /login -> send to login
  if (!authed && location.pathname !== "/login") {
    return <Navigate to="/login" replace />;
  }

  // If logged in but sitting on /login -> send to dashboard
  if (authed && location.pathname === "/login") {
    return <Navigate to="/" replace />;
  }

  if (authed) {
    return <AppShell onLogout={handleLogout} />;
  }

  return <LoginPage />;
}
