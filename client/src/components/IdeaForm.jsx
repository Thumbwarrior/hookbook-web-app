import { useState, useEffect } from "react";

const emptyForm = {
  title: "", lyricsText: "", genre: "", mood: "", bpmMin: "", bpmMax: "",
  rhymeScheme: "", status: "idea", tagsInput: "",
};

export default function IdeaForm({ initial, onSubmit, onCancel, submitLabel = "Save" }) {
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initial) {
      setForm({
        title: initial.title || "",
        lyricsText: initial.lyricsText || "",
        genre: initial.genre || "",
        mood: initial.mood || "",
        bpmMin: initial.bpmMin ?? "",
        bpmMax: initial.bpmMax ?? "",
        rhymeScheme: initial.rhymeScheme || "",
        status: initial.status || "idea",
        tagsInput: (initial.tags || []).join(", "),
      });
    } else {
      setForm(emptyForm);
    }
  }, [initial]);

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await onSubmit({
        title: form.title,
        lyricsText: form.lyricsText,
        genre: form.genre || null,
        mood: form.mood || null,
        bpmMin: form.bpmMin !== "" ? Number(form.bpmMin) : null,
        bpmMax: form.bpmMax !== "" ? Number(form.bpmMax) : null,
        rhymeScheme: form.rhymeScheme || null,
        status: form.status,
        tags: form.tagsInput.split(",").map((t) => t.trim()).filter(Boolean),
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const inputClass = "mt-1 w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white focus:border-brand-500 focus:outline-none";

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && <div className="rounded-lg bg-red-900/40 px-4 py-3 text-sm text-red-300">{error}</div>}
      <div>
        <label className="block text-sm font-medium text-slate-300">Title</label>
        <input required value={form.title} onChange={(e) => update("title", e.target.value)} className={inputClass} />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-300">Lyrics / Hook</label>
        <textarea rows={6} value={form.lyricsText} onChange={(e) => update("lyricsText", e.target.value)} className={`${inputClass} font-mono`} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-slate-300">Genre</label>
          <input value={form.genre} onChange={(e) => update("genre", e.target.value)} className={inputClass} placeholder="Trap, R&B..." />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300">Mood</label>
          <input value={form.mood} onChange={(e) => update("mood", e.target.value)} className={inputClass} placeholder="Dark, uplifting..." />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className="block text-sm font-medium text-slate-300">BPM Min</label>
          <input type="number" value={form.bpmMin} onChange={(e) => update("bpmMin", e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300">BPM Max</label>
          <input type="number" value={form.bpmMax} onChange={(e) => update("bpmMax", e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300">Rhyme Scheme</label>
          <input value={form.rhymeScheme} onChange={(e) => update("rhymeScheme", e.target.value)} className={inputClass} placeholder="AABB" />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-300">Tags (comma-separated)</label>
        <input value={form.tagsInput} onChange={(e) => update("tagsInput", e.target.value)} className={inputClass} />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-300">Status</label>
        <select value={form.status} onChange={(e) => update("status", e.target.value)} className={inputClass}>
          <option value="idea">Idea</option>
          <option value="in progress">In Progress</option>
          <option value="finished">Finished</option>
        </select>
      </div>
      <div className="flex gap-3">
        <button type="submit" disabled={loading} className="rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50">
          {loading ? "Saving…" : submitLabel}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} className="rounded-lg border border-slate-700 px-5 py-2.5 text-sm text-slate-300">Cancel</button>
        )}
      </div>
    </form>
  );
}
