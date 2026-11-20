// Data for Leonida Legend: the roadmap stages and the loader for the trophy list.
// The trophies themselves live in app/data/trophies.json (the official PS5 list with this guide's own text).

export const STAGES = [
  {
    n: 1,
    title: 'Stage 1 — Story first',
    text: 'Play the campaign in order: Gone Fishing, Chapters 1–4, the named story missions and the final mission. Two missable moments pass during this stage — the unscheduled departure at VCIA (Catch Me If You Can, during VCIA Takedown) and the showroom smash (Capital Offense) — so catch them as they come.',
  },
  {
    n: 2,
    title: 'Stage 2 — Friends & strangers',
    text: 'Finish the character strands: Andy, Kenton, Billy, Randy and Tyrone, plus Bret’s hunt and Cal’s fishing challenge. Eight completed strands earn Strangers & Freaks, and every strand final has its own trophy.',
  },
  {
    n: 3,
    title: 'Stage 3 — See all of Leonida',
    text: 'The state-wide sweep: explore all 52 areas while collecting the card sets, meditating at all 18 spots, WAiNK-ing at 100 locations and discovering 100 vehicles. Layer the counts on top — 250 stunts, 42 Shooting Range golds, the drone races and the 20 race wins — region by region so no trip is wasted.',
  },
  {
    n: 4,
    title: 'Stage 4 — Money & mayhem',
    text: 'Free-roam scores and partner play: bank vaults, the armored truck, one illegal operation per gang, the partner wanted-level trophies, and the money totals — $250,000 laundered, $100,000 spent, all 8 garages bought, 10 vehicles registered. The two remaining missable-flagged trophies (Personal Best, Bad Luck I Guess) belong to moments, so keep an eye out throughout.',
  },
  {
    n: 5,
    title: 'Stage 5 — The last percent',
    text: 'Close it out: the choice count (500, tracked by PSN) tops up from side content, the in-game checklist points at whatever 100% still needs, and A Long Road unlocks — which completes the set and pops the platinum, Vice Got a Price!',
  },
];

export const GRADE_ORDER = ['platinum', 'gold', 'silver', 'bronze'];

export const GRADE_LABEL = {
  platinum: 'Platinum',
  gold: 'Gold',
  silver: 'Silver',
  bronze: 'Bronze',
};

export const KIND_LABEL = {
  story: 'Story',
  collectibles: 'Collectibles',
  activities: 'Activities',
  platinum: 'Platinum',
};

// Loads the trophy list from beside the app. A relative fetch: the app only ever talks to its own files.
export async function loadTrophies() {
  const response = await fetch('data/trophies.json');
  if (!response.ok) throw new Error(`trophies.json: HTTP ${response.status}`);
  const data = await response.json();
  const trophies = Array.isArray(data) ? data : data.trophies;
  if (!Array.isArray(trophies) || trophies.length === 0) throw new Error('trophies.json holds no trophies');
  return trophies;
}
