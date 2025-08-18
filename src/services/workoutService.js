// Broadened catalog (maps to the same 4 stats + body parts)
export const WORKOUT_FOCUS = {
  // legacy aliases (for compatibility)
  upper: {
    strength: 2,
    core: 1,
    dexterity: 0,
    stamina: 0,
    parts: { arms: 1, chest: 1 },
  },
  lower: { strength: 1, core: 0, dexterity: 0, stamina: 2, parts: { legs: 1 } },

  // new explicit targets
  arms: { strength: 2, core: 0, dexterity: 1, stamina: 0, parts: { arms: 1 } },
  chest: {
    strength: 2,
    core: 1,
    dexterity: 0,
    stamina: 0,
    parts: { chest: 1 },
  },
  shoulders: {
    strength: 2,
    core: 0,
    dexterity: 1,
    stamina: 0,
    parts: { chest: 1 },
  },
  back: { strength: 2, core: 1, dexterity: 0, stamina: 0, parts: {} },
  legs: { strength: 1, core: 0, dexterity: 0, stamina: 2, parts: { legs: 1 } },
  core: {
    strength: 0,
    core: 2,
    dexterity: 1,
    stamina: 0,
    parts: { torsoTone: 1 },
  },
  mobility: {
    strength: 0,
    core: 1,
    dexterity: 2,
    stamina: 0,
    parts: { torsoTone: 1 },
  },
  cardio: { strength: 0, core: 0, dexterity: 1, stamina: 2, parts: {} },
};

export const FOCUS_OPTIONS = [
  "arms",
  "chest",
  "shoulders",
  "back",
  "legs",
  "core",
  "mobility",
  "cardio",
];

// XP from minutes + volume (reps × sets). Tunable.
export function calcWorkoutXP({ minutes = 30, reps = 10, sets = 3 }) {
  const mins = Math.max(5, Math.min(180, Number(minutes) || 0));
  const r = Math.max(1, Math.min(50, Number(reps) || 1));
  const s = Math.max(1, Math.min(10, Number(sets) || 1));
  const baseFromTime = mins * 1.2;
  const baseFromVolume = r * s * 0.6;
  return Math.round(baseFromTime + baseFromVolume);
}

// Convert multiple focuses -> accumulated deltas
export function accumulateDeltas(focuses = []) {
  const out = {
    strength: 0,
    dexterity: 0,
    stamina: 0,
    core: 0,
    parts: { arms: 0, chest: 0, legs: 0, torsoTone: 0 },
  };
  focuses.forEach((f) => {
    const r = WORKOUT_FOCUS[f];
    if (!r) return;
    out.strength += r.strength || 0;
    out.dexterity += r.dexterity || 0;
    out.stamina += r.stamina || 0;
    out.core += r.core || 0;
    Object.entries(r.parts || {}).forEach(([k, v]) => {
      out.parts[k] += v;
    });
  });
  return out;
}

// (Optional) legacy local log helpers
const LOGS_KEY = "workoutLogs";
export function loadLogs() {
  try {
    const raw = localStorage.getItem(LOGS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}
export function saveLogs(logs) {
  try {
    localStorage.setItem(LOGS_KEY, JSON.stringify(logs));
  } catch {}
}
