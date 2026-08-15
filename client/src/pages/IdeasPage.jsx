import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ideas as ideasApi } from "../lib/api";
import IdeaCard from "../components/IdeaCard";
import IdeaForm from "../components/IdeaForm";

export default function IdeasPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [ideas, setIdeas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(searchParams.get("new") === "1");
  const [filters, setFilters] = useState({ query: "", tag: "", genre: "", mood: "", status: "" });

  const loadIdeas = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const hasFilters = Object.values(filters).some(Boolean);
      const data = hasFilters ? await ideasApi.search(filters) : await ideasApi.list();
      setIdeas(data.ideas);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { loadIdeas(); }, [loadIdeas]);
  useEffect(() => {
    if (searchParams.get("new") === "1") {
      setShowForm(true);
      setEditing(null);
    }
  }, [searchParams]);

  function openCreate() { setEditing(null); setShowForm(true); setSearchParams({}); }
  function openEdit(idea) { setEditing(idea); setShowForm(true); }
  function closeForm() { setShowForm(false); setEditing(null); setSearchParams({}); }

  async function handleCreate(payload) { await ideasApi.create(payload); closeForm(); loadIdeas(); }
  async function handleUpdate(payload) { await ideasApi.update(editing.id, payload); closeForm(); loadIdeas(); }
  async function handleDelete(idea) {
    if (!confirm(`Delete "${idea.title}"?`)) return;
    try { await ideasApi.remove(idea.id); loadIdeas(); } catch (err) { setError(err.message); }
  }

  const inputClass = "rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white focus:border-brand-500 focus:outline-none";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-white">Ideas</h1>
          <p className="mt-1 text-slate-400">Your hooks, verses, and rhyme schemes</p>
        </div>
        {!showForm && (
          <button onClick={openCreate} className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white">+ New Idea</button>
        )}
      </div>
      {error && <div className="rounded-lg bg-red-900/40 px-4 py-3 text-sm text-red-300">{error}</div>}
      {showForm ? (
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="mb-5 text-lg font-semibold text-white">{editing ? "Edit Idea" : "New Idea"}</h2>
          <IdeaForm initial={editing} onSubmit={editing ? handleUpdate : handleCreate} onCancel={closeForm} submitLabel={editing ? "Update" : "Create"} />
        </div>
      ) : (
        <>
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              <input value={filters.query} onChange={(e) => setFilters((p) => ({ ...p, query: e.target.value }))} placeholder="Search lyrics or title…" className={inputClass} />
              <input value={filters.tag} onChange={(e) => setFilters((p) => ({ ...p, tag: e.target.value }))} placeholder="Tag" className={inputClass} />
              <input value={filters.genre} onChange={(e) => setFilters((p) => ({ ...p, genre: e.target.value }))} placeholder="Genre" className={inputClass} />
              <input value={filters.mood} onChange={(e) => setFilters((p) => ({ ...p, mood: e.target.value }))} placeholder="Mood" className={inputClass} />
              <select value={filters.status} onChange={(e) => setFilters((p) => ({ ...p, status: e.target.value }))} className={inputClass}>
                <option value="">All statuses</option>
                <option value="idea">Idea</option>
                <option value="in progress">In Progress</option>
                <option value="finished">Finished</option>
              </select>
            </div>
          </div>
          {loading ? (
            <p className="text-center text-slate-500">Loading ideas…</p>
          ) : ideas.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-700 py-16 text-center">
              <p className="text-slate-400">No ideas yet.</p>
              <button onClick={openCreate} className="mt-3 text-sm font-medium text-brand-500">Write your first hook →</button>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {ideas.map((idea) => (
                <IdeaCard key={idea.id} idea={idea} onEdit={openEdit} onDelete={handleDelete} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
