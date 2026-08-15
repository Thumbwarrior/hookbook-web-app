import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ideas as ideasApi } from "../lib/api";

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [randomIdea, setRandomIdea] = useState(null);
  const [loadingRandom, setLoadingRandom] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    ideasApi.dashboard().then(setStats).catch((e) => setError(e.message));
  }, []);

  async function handleRandom() {
    setLoadingRandom(true);
    setError("");
    try {
      const { idea } = await ideasApi.random();
      setRandomIdea(idea);
    } catch (err) {
      setError(err.message);
      setRandomIdea(null);
    } finally {
      setLoadingRandom(false);
    }
  }

  const statusEntries = stats
    ? [
        { key: "idea", label: "Ideas", color: "bg-slate-600" },
        { key: "in progress", label: "In Progress", color: "bg-amber-600" },
        { key: "finished", label: "Finished", color: "bg-emerald-600" },
      ].map(({ key, label, color }) => ({ label, color, count: stats.byStatus[key] || 0 }))
    : [];

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-white">Dashboard</h1>
          <p className="mt-1 text-slate-400">Overview of your hooks and creative pipeline</p>
        </div>
        <Link to="/ideas?new=1" className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700">
          + New Idea
        </Link>
      </div>
      {error && <div className="rounded-lg bg-red-900/40 px-4 py-3 text-sm text-red-300">{error}</div>}
      <section>
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-500">By Status</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {statusEntries.map(({ label, count, color }) => (
            <div key={label} className="rounded-xl border border-slate-800 bg-slate-900 p-6">
              <div className={`mb-3 h-1 w-12 rounded-full ${color}`} />
              <p className="text-3xl font-bold text-white">{count}</p>
              <p className="mt-1 text-sm text-slate-400">{label}</p>
            </div>
          ))}
          {!stats && <div className="col-span-3 text-center text-slate-500">Loading…</div>}
        </div>
      </section>
      {stats?.byGenre?.length > 0 && (
        <section>
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-500">By Genre</h2>
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 space-y-3">
            {stats.byGenre.map(({ genre, count }) => {
              const pct = stats.total ? Math.round((count / stats.total) * 100) : 0;
              return (
                <div key={genre}>
                  <div className="mb-1 flex justify-between text-sm">
                    <span className="text-slate-300">{genre}</span>
                    <span className="text-slate-500">{count} ({pct}%)</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-800">
                    <div className="h-full rounded-full bg-brand-600" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}
      <section>
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-500">Creative Unblocker</h2>
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
          <p className="text-sm text-slate-400">Stuck? Pull a random unfinished idea from your vault.</p>
          <button onClick={handleRandom} disabled={loadingRandom} className="mt-4 rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50">
            {loadingRandom ? "Drawing…" : "Random Idea"}
          </button>
          {randomIdea && (
            <div className="mt-6 rounded-lg border border-brand-800/50 p-5">
              <h3 className="text-lg font-semibold text-white">{randomIdea.title}</h3>
              <pre className="mt-3 whitespace-pre-wrap font-mono text-sm text-slate-300">{randomIdea.lyricsText || "No lyrics yet"}</pre>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
