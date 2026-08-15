const STATUS_CLASS = {
  idea: "status-idea",
  "in progress": "status-in-progress",
  finished: "status-finished",
};

export default function IdeaCard({ idea, onEdit, onDelete }) {
  const preview = idea.lyricsText?.split("\n").find((l) => l.trim())?.trim() || "No lyrics yet";
  const bpmLabel =
    idea.bpmMin != null || idea.bpmMax != null
      ? `${idea.bpmMin ?? "?"}–${idea.bpmMax ?? "?"} BPM`
      : null;

  return (
    <article className="rounded-xl border border-slate-800 bg-slate-900 p-5 hover:border-slate-700">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-lg font-semibold text-white">{idea.title}</h3>
          <p className="mt-1 line-clamp-2 font-mono text-sm text-slate-400">{preview}</p>
        </div>
        <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${STATUS_CLASS[idea.status] || "status-idea"}`}>
          {idea.status}
        </span>
      </div>
      <div className="mt-3 flex flex-wrap gap-2 text-xs">
        {idea.genre && <span className="rounded-md bg-slate-800 px-2 py-1 text-slate-300">{idea.genre}</span>}
        {idea.mood && <span className="rounded-md bg-slate-800 px-2 py-1 text-slate-300">{idea.mood}</span>}
        {bpmLabel && <span className="rounded-md bg-slate-800 px-2 py-1 text-slate-300">{bpmLabel}</span>}
        {idea.rhymeScheme && <span className="rounded-md px-2 py-1 text-brand-500">{idea.rhymeScheme}</span>}
        {(idea.tags || []).map((tag) => (
          <span key={tag} className="rounded-md px-2 py-1 text-brand-400">#{tag}</span>
        ))}
      </div>
      <div className="mt-4 flex gap-2">
        <button onClick={() => onEdit(idea)} className="rounded-lg bg-slate-800 px-3 py-1.5 text-xs text-slate-200">Edit</button>
        <button onClick={() => onDelete(idea)} className="rounded-lg px-3 py-1.5 text-xs text-red-400">Delete</button>
      </div>
    </article>
  );
}
