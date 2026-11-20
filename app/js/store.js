// Progress store for Leonida Legend: what is earned, the running counters, and the spoiler setting.
// Everything lives in the browser's localStorage under one key; export and import move it as a JSON file.

const STORAGE_KEY = 'leonida-legend-progress-v1';

export function emptyProgress() {
  return { earned: {}, counts: {}, spoilers: true };
}

function isPlainObject(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

// Keeps only well-formed entries: earned maps trophy id -> true, counts maps trophy id -> a number >= 0.
export function sanitizeProgress(raw) {
  const clean = emptyProgress();
  if (!isPlainObject(raw)) return clean;
  if (isPlainObject(raw.earned)) {
    for (const [id, value] of Object.entries(raw.earned)) {
      if (value === true && Number.isInteger(Number(id))) clean.earned[id] = true;
    }
  }
  if (isPlainObject(raw.counts)) {
    for (const [id, value] of Object.entries(raw.counts)) {
      const n = Number(value);
      if (Number.isInteger(Number(id)) && Number.isFinite(n) && n >= 0) clean.counts[id] = n;
    }
  }
  if (typeof raw.spoilers === 'boolean') clean.spoilers = raw.spoilers;
  return clean;
}

export function loadProgress() {
  try {
    const text = localStorage.getItem(STORAGE_KEY);
    if (!text) return emptyProgress();
    return sanitizeProgress(JSON.parse(text));
  } catch {
    return emptyProgress();
  }
}

export function saveProgress(progress) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch {
    // Storage full or blocked: the guide still works, progress simply lasts for this visit only.
  }
}

export function exportProgress(progress) {
  return JSON.stringify(
    { app: 'leonida-legend', version: 1, exportedAt: new Date().toISOString(), progress },
    null,
    2,
  );
}

// Accepts either an exported file ({ progress: {...} }) or a bare progress object.
export function parseImportedProgress(text) {
  const data = JSON.parse(text);
  const inner = isPlainObject(data) && isPlainObject(data.progress) ? data.progress : data;
  return sanitizeProgress(inner);
}
