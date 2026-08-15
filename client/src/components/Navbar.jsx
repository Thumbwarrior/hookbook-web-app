import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const links = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/ideas", label: "Ideas" },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();

  return (
    <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
        <Link to="/dashboard" className="font-display text-xl font-bold text-brand-500">Hookbook</Link>
        <nav className="flex items-center gap-1">
          {links.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className={`rounded-lg px-3 py-2 text-sm font-medium ${
                location.pathname.startsWith(to)
                  ? "bg-brand-600/20 text-brand-500"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <span className="hidden text-sm text-slate-400 sm:inline">{user?.email}</span>
          <button onClick={logout} className="rounded-lg border border-slate-700 px-3 py-1.5 text-sm text-slate-300 hover:text-white">
            Log out
          </button>
        </div>
      </div>
    </header>
  );
}
