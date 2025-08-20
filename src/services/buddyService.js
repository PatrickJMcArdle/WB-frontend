import { accumulateDeltas, calcWorkoutXP } from "./workoutService";

const STORAGE_KEY = "myBuddy";

// ===== Cosmetic catalogs =====
export const HAIR_STYLES = [
  { id: 1, name: "Short", minLevel: 1, spriteKey: "hair_short" },
  { id: 2, name: "Medium", minLevel: 2, spriteKey: "hair_medium" },
  { id: 3, name: "Long", minLevel: 4, spriteKey: "hair_long" },
];

export const HAIR_COLORS = [
  { id: "brown", name: "Brown", minLevel: 1 },
  { id: "black", name: "Black", minLevel: 1 },
  { id: "blonde", name: "Blonde", minLevel: 2 },
  { id: "red", name: "Red", minLevel: 3 },
  { id: "blue", name: "Blue", minLevel: 15 }, // shift fun colors to 15+
];

export const TOPS = [
  { id: 1, name: "Starter Tee", minLevel: 1, spriteKey: "tee" }, // legacy feel
  { id: 2, name: "Gym Hoodie", minLevel: 5, spriteKey: "hoodie" }, // before 10
  { id: 3, name: "Pro Tank", minLevel: 9, spriteKey: "tank" }, // before 10
  { id: 4, name: "Compression Top", minLevel: 15, spriteKey: "comp" }, // 15+
];

export const BOTTOMS = [
  { id: 1, name: "Shorts", minLevel: 1, spriteKey: "shorts" }, // legacy feel
  { id: 2, name: "Joggers", minLevel: 7, spriteKey: "joggers" }, // before 10
  { id: 3, name: "Pro Tights", minLevel: 15, spriteKey: "tights" }, // 15+
];

// ===== Legacy outfits (kept for existing gallery) =====
export const OUTFITS = [
  { id: 1, name: "Starter Tee", minLevel: 1, spriteKey: "tee" },
  { id: 2, name: "Gym Hoodie", minLevel: 3, spriteKey: "hoodie" },
  { id: 3, name: "Pro Tank", minLevel: 5, spriteKey: "tank" },
];

export const DEFAULT = {
  userId: 1,
  level: 1,
  xp: 0,
  statPoints: 0,
  stats: { strength: 0, dexterity: 0, stamina: 0, core: 0 },
  appearance: { arms: 0, chest: 0, legs: 0, torsoTone: 0 },

  equippedOutfitId: 1,
  unlockedOutfitIds: [1],

  cosmetics: {
    hairStyleId: 1,
    hairColorId: "brown",
    topId: 1,
    bottomId: 1,
  },
  unlocked: {
    hairStyleIds: [1],
    hairColorIds: ["brown", "black"],
    topIds: [1],
    bottomIds: [1],
  },

  lastWorkout: null,
};

// ---------- storage ----------
function mergeDefaults(saved) {
  const s = saved || {};
  return {
    ...DEFAULT,
    ...s,
    stats: { ...DEFAULT.stats, ...(s.stats || {}) },
    appearance: { ...DEFAULT.appearance, ...(s.appearance || {}) },
    cosmetics: { ...DEFAULT.cosmetics, ...(s.cosmetics || {}) },
    unlocked: {
      hairStyleIds: s.unlocked?.hairStyleIds || DEFAULT.unlocked.hairStyleIds,
      hairColorIds: s.unlocked?.hairColorIds || DEFAULT.unlocked.hairColorIds,
      topIds: s.unlocked?.topIds || DEFAULT.unlocked.topIds,
      bottomIds: s.unlocked?.bottomIds || DEFAULT.unlocked.bottomIds,
    },
    unlockedOutfitIds: s.unlockedOutfitIds || DEFAULT.unlockedOutfitIds,
    equippedOutfitId: s.equippedOutfitId ?? DEFAULT.equippedOutfitId,
  };
}

export function loadBuddy() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    return mergeDefaults(parsed);
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
// Keep L1 target at 100 XP (same formula you had).
export function nextLevelXP(level) {
  return Math.round(100 * Math.pow(level, 1.5));
}

function unlockedHair(level) {
  return HAIR_STYLES.filter((h) => h.minLevel <= level).map((h) => h.id);
}
function unlockedHairColors(level) {
  return HAIR_COLORS.filter((c) => c.minLevel <= level).map((c) => c.id);
}
function unlockedTops(level) {
  return TOPS.filter((t) => t.minLevel <= level).map((t) => t.id);
}
function unlockedBottoms(level) {
  return BOTTOMS.filter((b) => b.minLevel <= level).map((b) => b.id);
}

export function awardXP(buddy, amount) {
  let b = { ...buddy, xp: buddy.xp + (Number(amount) || 0) };
  let next = nextLevelXP(b.level);

  while (b.xp >= next) {
    b.xp -= next;
    b.level += 1;
    b.statPoints += 5;

    // Legacy outfits (before level 10)
    const outfitUnlocks = OUTFITS.filter((o) => o.minLevel <= b.level).map(
      (o) => o.id
    );
    b.unlockedOutfitIds = Array.from(
      new Set([...(b.unlockedOutfitIds || []), ...outfitUnlocks])
    );
    if (!b.equippedOutfitId) b.equippedOutfitId = 1;

    // Cosmetics:
    // - We still let some basic ones unlock early (ids above).
    // - Additional styles/colors/tops/bottoms have minLevel >= 15.
    b.unlocked = {
      hairStyleIds: Array.from(
        new Set([...(b.unlocked?.hairStyleIds || []), ...unlockedHair(b.level)])
      ),
      hairColorIds: Array.from(
        new Set([
          ...(b.unlocked?.hairColorIds || []),
          ...unlockedHairColors(b.level),
        ])
      ),
      topIds: Array.from(
        new Set([...(b.unlocked?.topIds || []), ...unlockedTops(b.level)])
      ),
      bottomIds: Array.from(
        new Set([...(b.unlocked?.bottomIds || []), ...unlockedBottoms(b.level)])
      ),
    };

    // ensure equipped cosmetics are valid (fallbacks)
    if (!b.unlocked.hairStyleIds.includes(b.cosmetics?.hairStyleId)) {
      b.cosmetics = { ...(b.cosmetics || {}), hairStyleId: 1 };
    }
    if (!b.unlocked.hairColorIds.includes(b.cosmetics?.hairColorId)) {
      b.cosmetics = { ...(b.cosmetics || {}), hairColorId: "brown" };
    }
    if (!b.unlocked.topIds.includes(b.cosmetics?.topId)) {
      b.cosmetics = { ...(b.cosmetics || {}), topId: 1 };
    }
    if (!b.unlocked.bottomIds.includes(b.cosmetics?.bottomId)) {
      b.cosmetics = { ...(b.cosmetics || {}), bottomId: 1 };
    }

    next = nextLevelXP(b.level);
  }
  return b;
}

// ---------- appearance mapping ----------
// Stop *size* growth after level 10 (arms/chest/legs).
// Allow torsoTone to keep improving slightly with training.
function toAppearance(stats, level) {
  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
  const s = stats || DEFAULT.stats;

  // Raw sizes from stats
  let arms = Math.floor((s.strength || 0) / 2);
  let chest = Math.floor(((s.strength || 0) + (s.core || 0)) / 3);
  let legs = Math.floor((s.stamina || 0) / 2);
  let torsoTone = Math.floor(((s.dexterity || 0) + (s.core || 0)) / 3);

  // Hard-cap visual size growth after level 10
  const sizeCap = 5; // maximum visual band
  if (level > 10) {
    arms = Math.min(arms, sizeCap);
    chest = Math.min(chest, sizeCap);
    legs = Math.min(legs, sizeCap);
    // tone can continue but still clamp to 5 to avoid extremes
    torsoTone = Math.min(torsoTone, sizeCap);
  }

  return {
    arms: clamp(arms, 0, sizeCap),
    chest: clamp(chest, 0, sizeCap),
    legs: clamp(legs, 0, sizeCap),
    torsoTone: clamp(torsoTone, 0, sizeCap),
  };
}

// ---------- apply a workout (reps/sets now) ----------
export function applyWorkout(
  buddy,
  { focuses = [], minutes = 30, reps = 10, sets = 3, notes = "" }
) {
  const xpGain = calcWorkoutXP({ minutes, reps, sets });
  const deltas = accumulateDeltas(focuses);

  // 1) Give XP (handles level-ups, adds statPoints)
  let updated = awardXP(buddy, xpGain);

  // 2) Auto-spend the NEW statPoints proportionally to focus weights
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

  ["strength", "dexterity", "stamina", "core"].forEach((key) => {
    if (!toSpend) return;
    const share = Math.round((weights[key] / total) * toSpend);
    if (share > 0) add(newStats, key, share);
  });

  // leftover rounding → highest-weight stat
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
  }

  updated = { ...updated, stats: newStats, statPoints: 0 };

  // 3) Recompute appearance + gentle part nudges from workout focus
  const baseApp = toAppearance(updated.stats, updated.level);
  const nudged = { ...baseApp };
  const partNudges = deltas.parts || {};
  Object.entries(partNudges).forEach(([k, v]) => {
    nudged[k] = Math.min(5, (nudged[k] || 0) + v * 0.2);
  });

  updated = {
    ...updated,
    appearance: nudged,
    lastWorkout: {
      when: Date.now(),
      focuses,
      minutes,
      reps,
      sets,
      notes,
      xpGain,
    },
  };

  return updated;
}
