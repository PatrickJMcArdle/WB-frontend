// src/services/buddyService.js
import { accumulateDeltas, calcWorkoutXP } from "./workoutService";

const STORAGE_KEY = "myBuddy";

export const DEFAULT = {
  userId: 1,
  level: 1,
  xp: 0,
  statPoints: 0,
  stats: { strength: 0, dexterity: 0, stamina: 0, core: 0 },
  appearance: { arms: 0, chest: 0, legs: 0, torsoTone: 0 },
  equippedOutfitId: 1,
  unlockedOutfitIds: [1],
  lastWorkout: null,
};

export const OUTFITS = [
  { id: 1, name: "Starter Tee", minLevel: 1, spriteKey: "tee" },
  { id: 2, name: "Gym Hoodie", minLevel: 3, spriteKey: "hoodie" },
  { id: 3, name: "Pro Tank", minLevel: 5, spriteKey: "tank" },
];

// ---------- storage ----------
export function loadBuddy() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    return parsed ? { ...DEFAULT, ...parsed } : { ...DEFAULT };
  } catch {
    return { ...DEFAULT };
  }
}
export function saveBuddy(b) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(b));
  } catch {}
}

// ---------- leveling / xp ----------
export function nextLevelXP(level) {
  return Math.round(100 * Math.pow(level, 1.5));
}
export function awardXP(buddy, amount) {
  let b = { ...buddy, xp: buddy.xp + (Number(amount) || 0) };
  let next = nextLevelXP(b.level);

  while (b.xp >= next) {
    b.xp -= next;
    b.level += 1;
    b.statPoints += 5;

    // unlock outfits when reaching new level
    const unlocks = OUTFITS.filter((o) => o.minLevel <= b.level).map(
      (o) => o.id
    );
    b.unlockedOutfitIds = Array.from(
      new Set([...(b.unlockedOutfitIds || []), ...unlocks])
    );
    if (!b.equippedOutfitId) b.equippedOutfitId = 1;

    next = nextLevelXP(b.level);
  }
  return b;
}

// ---------- appearance mapping ----------
function toAppearance(stats) {
  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
  const s = stats || DEFAULT.stats;

  return {
    arms: clamp(Math.floor((s.strength || 0) / 2), 0, 5),
    chest: clamp(Math.floor(((s.strength || 0) + (s.core || 0)) / 3), 0, 5),
    legs: clamp(Math.floor((s.stamina || 0) / 2), 0, 5),
    torsoTone: clamp(
      Math.floor(((s.dexterity || 0) + (s.core || 0)) / 3),
      0,
      5
    ),
  };
}

// ---------- apply a workout (auto‑allocate points) ----------
/**
 * applyWorkout(buddy, { focuses[], intensity, minutes, notes })
 * - Calculates XP from intensity/minutes
 * - Awards XP (level ups + statPoints)
 * - Auto-spends *new* statPoints across stats based on selected focuses
 * - Recomputes appearance and nudges focused parts slightly
 */
export function applyWorkout(
  buddy,
  { focuses = [], intensity = 2, minutes = 30, notes = "" }
) {
  const xpGain = calcWorkoutXP({ intensity, minutes });
  const deltas = accumulateDeltas(focuses);

  // 1) Give XP (handles level-ups, adds statPoints)
  let updated = awardXP(buddy, xpGain);

  // 2) Auto-spend the statPoints proportionally to focus weights
  let toSpend = updated.statPoints;
  const weights = {
    strength: deltas.strength || 0,
    dexterity: deltas.dexterity || 0,
    stamina: deltas.stamina || 0,
    core: deltas.core || 0,
  };
  const total = Math.max(
    1,
    Object.values(weights).reduce((a, b) => a + b, 0)
  );

  const add = (obj, key, n) => (obj[key] = (obj[key] || 0) + n);
  const newStats = { ...(updated.stats || DEFAULT.stats) };

  // first pass: proportional allocation
  ["strength", "dexterity", "stamina", "core"].forEach((key) => {
    if (!toSpend) return;
    const share = Math.round((weights[key] / total) * toSpend);
    if (share > 0) add(newStats, key, share);
  });

  // recompute leftover due to rounding; dump into highest-weight stat
  const spent =
    newStats.strength +
    newStats.dexterity +
    newStats.stamina +
    newStats.core -
    (updated.stats.strength +
      updated.stats.dexterity +
      updated.stats.stamina +
      updated.stats.core);
  let leftover = Math.max(0, toSpend - spent);
  if (leftover > 0) {
    const best =
      Object.entries(weights).sort((a, b) => b[1] - a[1])[0]?.[0] || "strength";
    add(newStats, best, leftover);
    leftover = 0;
  }

  updated = { ...updated, stats: newStats, statPoints: 0 };

  // 3) Recompute appearance from stats + nudge parts from the workout focus
  const baseApp = toAppearance(updated.stats);
  const nudged = { ...baseApp };
  const partNudges = deltas.parts || {};
  // tiny additive bump capped at 5
  Object.entries(partNudges).forEach(([k, v]) => {
    nudged[k] = Math.min(5, (nudged[k] || 0) + v * 0.2);
  });

  updated = {
    ...updated,
    appearance: nudged,
    lastWorkout: {
      when: Date.now(),
      focuses,
      intensity,
      minutes,
      notes,
      xpGain,
    },
  };

  return updated;
}
