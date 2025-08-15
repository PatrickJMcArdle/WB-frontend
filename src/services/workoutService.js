// Simple rules to translate a workout -> stat deltas + xp
// Tweak weights anytime.
export const WORKOUT_FOCUS = {
  upper: {
    strength: 2,
    core: 1,
    dexterity: 0,
    stamina: 0,
    parts: { arms: 1, chest: 1 },
  },
  lower: { strength: 1, core: 0, dexterity: 0, stamina: 2, parts: { legs: 1 } },
  core: {
    strength: 0,
    core: 2,
    dexterity: 1,
    stamina: 0,
    parts: { torsoTone: 1 },
  },
  cardio: { strength: 0, core: 0, dexterity: 1, stamina: 2, parts: {} },
  mobility: { strength: 0, core: 1, dexterity: 2, stamina: 0, parts: {} },
};

// XP curve: prefer reps × minutes; fallback to legacy intensity if reps is missing
export function calcWorkoutXP({ reps, minutes, intensity } = {}) {
  const mins = Math.max(5, Math.min(180, Number(minutes ?? 30) || 0));

  if (reps != null) {
    const r = Math.max(1, Math.min(100, Number(reps) || 1));
    return Math.round(mins * r * 0.25); // e.g. 30min * 10reps * 0.25 = 75 XP
  }

  // legacy path
  const i = Math.max(1, Math.min(5, Number(intensity ?? 2) || 1));
  return Math.round(i * mins * 1.2);
}

// Local store for logs (MVP)
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

// Convert checked focuses -> accumulated deltas
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

export const FOCUS_OPTIONS = Object.keys(WORKOUT_FOCUS);
