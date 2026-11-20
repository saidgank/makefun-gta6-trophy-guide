// Filtering for the checklist: kind chips, the grade select, search, hide-earned, and the spoiler rule.

export const filterState = {
  kind: 'all', // all | story | missable | collectibles | activities | platinum
  grade: 'all', // all | platinum | gold | silver | bronze
  query: '',
  hideEarned: false,
};

// Spoiler mode: a story trophy the player has not earned yet stays masked — name, description and guide.
export function isSpoiled(trophy, progress) {
  return progress.spoilers === true && trophy.kind === 'story' && progress.earned[trophy.id] !== true;
}

export function trophyMatches(trophy, progress) {
  if (filterState.kind === 'missable') {
    if (trophy.missable !== true) return false;
  } else if (filterState.kind !== 'all') {
    if (trophy.kind !== filterState.kind) return false;
  }
  if (filterState.grade !== 'all' && trophy.grade !== filterState.grade) return false;
  if (filterState.hideEarned && progress.earned[trophy.id] === true) return false;
  const q = filterState.query.trim().toLowerCase();
  if (q) {
    if (isSpoiled(trophy, progress)) return false; // a masked trophy cannot be found by its hidden name
    const haystack = `${trophy.name} ${trophy.description}`.toLowerCase();
    if (!haystack.includes(q)) return false;
  }
  return true;
}

// The next trophies to chase: unearned, in roadmap order (stage, then list order). Trophies masked by
// spoiler mode sort last — naming a trophy the player can act on beats naming a hidden one three times.
export function nextUp(trophies, progress, count = 3) {
  const unearned = trophies.filter((t) => progress.earned[t.id] !== true && t.kind !== 'platinum');
  const byRoadmap = (a, b) => (a.stage - b.stage) || (a.id - b.id);
  const visible = unearned.filter((t) => !isSpoiled(t, progress)).sort(byRoadmap);
  const masked = unearned.filter((t) => isSpoiled(t, progress)).sort(byRoadmap);
  return [...visible, ...masked].slice(0, count);
}
