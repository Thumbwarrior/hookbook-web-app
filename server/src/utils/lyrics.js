function countWordSyllables(word) {
  const w = word.toLowerCase().replace(/[^a-z']/g, "");
  if (!w) return 0;
  if (w.length <= 3) return 1;
  let cleaned = w.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, "").replace(/^y/, "");
  const matches = cleaned.match(/[aeiouy]{1,2}/g);
  return matches ? matches.length : 1;
}

export function syllableCountsPerLine(lyricsText) {
  if (!lyricsText) return [];
  return lyricsText
    .split("\n")
    .map((line, index) => {
      const trimmed = line.trim();
      if (!trimmed) return null;
      const syllables = trimmed.split(/\s+/).reduce((sum, word) => sum + countWordSyllables(word), 0);
      return { line: index + 1, text: trimmed, syllables };
    })
    .filter(Boolean);
}

function rhymeTail(line) {
  const words = line.trim().toLowerCase().split(/\s+/);
  const last = words[words.length - 1]?.replace(/[^a-z']/g, "") || "";
  if (!last) return "";
  const match = last.match(/[aeiouy][a-z]*$/);
  return match ? match[0] : last.slice(-3);
}

export function detectRhymeScheme(lyricsText) {
  const lines = lyricsText.split("\n").map((l) => l.trim()).filter(Boolean);
  if (lines.length < 2) return null;
  const tails = lines.map(rhymeTail);
  const letterMap = new Map();
  let nextLetter = 65;
  return tails
    .map((tail) => {
      if (!tail) return "X";
      if (!letterMap.has(tail)) letterMap.set(tail, String.fromCharCode(nextLetter++));
      return letterMap.get(tail);
    })
    .join("");
}
