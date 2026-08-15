import { Router } from "express";
import db from "../db/index.js";
import { requireAuth } from "../middleware/auth.js";
import { detectRhymeScheme, syllableCountsPerLine } from "../utils/lyrics.js";

const router = Router();
router.use(requireAuth);

const VALID_STATUSES = ["idea", "in progress", "finished"];
const listIdeasStmt = db.prepare(`SELECT * FROM ideas WHERE user_id = ? ORDER BY updated_at DESC`);
const getIdeaStmt = db.prepare(`SELECT * FROM ideas WHERE id = ? AND user_id = ?`);
const insertIdeaStmt = db.prepare(`
  INSERT INTO ideas (user_id, title, lyrics_text, genre, mood, bpm_min, bpm_max, rhyme_scheme, status)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
`);
const updateIdeaStmt = db.prepare(`
  UPDATE ideas SET title = ?, lyrics_text = ?, genre = ?, mood = ?, bpm_min = ?, bpm_max = ?,
    rhyme_scheme = ?, status = ?, updated_at = datetime('now')
  WHERE id = ? AND user_id = ?
`);
const deleteIdeaStmt = db.prepare(`DELETE FROM ideas WHERE id = ? AND user_id = ?`);
const getTagsForIdea = db.prepare(`SELECT tag_name FROM tags WHERE idea_id = ? ORDER BY tag_name`);
const insertTag = db.prepare(`INSERT OR IGNORE INTO tags (idea_id, tag_name) VALUES (?, ?)`);
const deleteTagsForIdea = db.prepare(`DELETE FROM tags WHERE idea_id = ?`);

function enrichIdea(idea, { includeAnalysis = false } = {}) {
  const tags = getTagsForIdea.all(idea.id).map((t) => t.tag_name);
  const result = {
    id: idea.id, userId: idea.user_id, title: idea.title, lyricsText: idea.lyrics_text,
    genre: idea.genre, mood: idea.mood, bpmMin: idea.bpm_min, bpmMax: idea.bpm_max,
    rhymeScheme: idea.rhyme_scheme, status: idea.status, tags,
    createdAt: idea.created_at, updatedAt: idea.updated_at,
  };
  if (includeAnalysis) {
    result.syllableCounts = syllableCountsPerLine(idea.lyrics_text);
    result.detectedRhymeScheme = detectRhymeScheme(idea.lyrics_text);
  }
  return result;
}

function syncTags(ideaId, tags) {
  deleteTagsForIdea.run(ideaId);
  if (!Array.isArray(tags)) return;
  const seen = new Set();
  for (const raw of tags) {
    const name = String(raw).trim().toLowerCase();
    if (!name || seen.has(name)) continue;
    seen.add(name);
    insertTag.run(ideaId, name);
  }
}

function validateStatus(status) {
  return VALID_STATUSES.includes(status);
}

router.get("/", (req, res) => {
  res.json({ ideas: listIdeasStmt.all(req.user.id).map((i) => enrichIdea(i)) });
});

router.get("/search", (req, res) => {
  const { query = "", tag = "", genre = "", mood = "", status = "" } = req.query;
  let sql = `SELECT DISTINCT i.* FROM ideas i LEFT JOIN tags t ON t.idea_id = i.id WHERE i.user_id = ?`;
  const params = [req.user.id];
  if (query) { sql += ` AND (i.title LIKE ? OR i.lyrics_text LIKE ?)`; params.push(`%${query}%`, `%${query}%`); }
  if (tag) { sql += ` AND t.tag_name = ?`; params.push(String(tag).trim().toLowerCase()); }
  if (genre) { sql += ` AND LOWER(i.genre) = ?`; params.push(String(genre).trim().toLowerCase()); }
  if (mood) { sql += ` AND LOWER(i.mood) = ?`; params.push(String(mood).trim().toLowerCase()); }
  if (status && validateStatus(status)) { sql += ` AND i.status = ?`; params.push(status); }
  sql += ` ORDER BY i.updated_at DESC`;
  res.json({ ideas: db.prepare(sql).all(...params).map((i) => enrichIdea(i)) });
});

router.get("/random", (req, res) => {
  const idea = db.prepare(`SELECT * FROM ideas WHERE user_id = ? AND status != 'finished' ORDER BY RANDOM() LIMIT 1`).get(req.user.id);
  if (!idea) return res.status(404).json({ error: "No unfinished ideas found" });
  res.json({ idea: enrichIdea(idea, { includeAnalysis: true }) });
});

router.get("/dashboard", (req, res) => {
  const userId = req.user.id;
  const byStatus = db.prepare(`SELECT status, COUNT(*) AS count FROM ideas WHERE user_id = ? GROUP BY status`).all(userId);
  const byGenre = db.prepare(`SELECT COALESCE(genre, 'Unspecified') AS genre, COUNT(*) AS count FROM ideas WHERE user_id = ? GROUP BY genre ORDER BY count DESC`).all(userId);
  const total = db.prepare(`SELECT COUNT(*) AS count FROM ideas WHERE user_id = ?`).get(userId).count;
  res.json({
    total,
    byStatus: Object.fromEntries(byStatus.map((r) => [r.status, r.count])),
    byGenre: byGenre.map((r) => ({ genre: r.genre, count: r.count })),
  });
});

router.post("/", (req, res) => {
  const { title, lyricsText = "", genre = null, mood = null, bpmMin = null, bpmMax = null, rhymeScheme = null, status = "idea", tags = [] } = req.body;
  if (!title?.trim()) return res.status(400).json({ error: "Title is required" });
  if (!validateStatus(status)) return res.status(400).json({ error: "Invalid status value" });
  const result = insertIdeaStmt.run(req.user.id, title.trim(), lyricsText, genre?.trim() || null, mood?.trim() || null, bpmMin ?? null, bpmMax ?? null, rhymeScheme?.trim() || null, status);
  syncTags(result.lastInsertRowid, tags);
  res.status(201).json({ idea: enrichIdea(getIdeaStmt.get(result.lastInsertRowid, req.user.id), { includeAnalysis: true }) });
});

router.get("/:id", (req, res) => {
  const idea = getIdeaStmt.get(req.params.id, req.user.id);
  if (!idea) return res.status(404).json({ error: "Idea not found" });
  res.json({ idea: enrichIdea(idea, { includeAnalysis: true }) });
});

router.put("/:id", (req, res) => {
  const existing = getIdeaStmt.get(req.params.id, req.user.id);
  if (!existing) return res.status(404).json({ error: "Idea not found" });
  const { title = existing.title, lyricsText = existing.lyrics_text, genre = existing.genre, mood = existing.mood, bpmMin = existing.bpm_min, bpmMax = existing.bpm_max, rhymeScheme = existing.rhyme_scheme, status = existing.status, tags } = req.body;
  if (!title?.trim()) return res.status(400).json({ error: "Title is required" });
  if (!validateStatus(status)) return res.status(400).json({ error: "Invalid status value" });
  updateIdeaStmt.run(title.trim(), lyricsText, genre?.trim() || null, mood?.trim() || null, bpmMin ?? null, bpmMax ?? null, rhymeScheme?.trim() || null, status, req.params.id, req.user.id);
  if (tags !== undefined) syncTags(req.params.id, tags);
  res.json({ idea: enrichIdea(getIdeaStmt.get(req.params.id, req.user.id), { includeAnalysis: true }) });
});

router.delete("/:id", (req, res) => {
  const result = deleteIdeaStmt.run(req.params.id, req.user.id);
  if (result.changes === 0) return res.status(404).json({ error: "Idea not found" });
  res.json({ message: "Idea deleted" });
});

export default router;
