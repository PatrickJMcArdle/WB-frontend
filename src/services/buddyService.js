const STORAGE_KEY = "myBuddy";

const DEFAULT = {
  userId: 1,
  level: 1,
  xp: 0,
  statPoints: 0,
  stats: { strength: 0, dexterity: 0, stamina: 0, core: 0 },
  appearance: { arms: 0, chest: 0, legs: 0, torsoTone: 0 },
  equippedOutfitId: null,
  unlockedOutfitIds: [1],
};

export const OUTFITS = [
  { id: 1, name: "Starter Tee", minLevel: 1, spriteKey: "tee" },
  { id: 2, name: "Gym Hoodie", minLevel: 3, spriteKey: "hoodie" },
  { id: 3, name: "Pro Tank", minLevel: 5, spriteKey: "tank" },
];

export function loadBuddy() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    // merge with defaults so new fields don’t break old saves
    return parsed ? { ...DEFAULT, ...parsed } : DEFAULT;
  } catch {
    return DEFAULT;
  }
}

export function saveBuddy(buddy) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(buddy));
  } catch {
    // ignore quota/private-mode errors
  }
}

/** Award XP; auto-level; return updated buddy */
export function awardXP(buddy, amount) {
  let b = { ...buddy, xp: buddy.xp + amount };
  let next = nextLevelXP(b.level);

  while (b.xp >= next) {
    b.xp -= next;
    b.level += 1;
    b.statPoints += 5;

    // unlock outfits meeting new level
    const unlocks = OUTFITS.filter((o) => o.minLevel <= b.level).map(
      (o) => o.id
    );
    b.unlockedOutfitIds = Array.from(
      new Set([...b.unlockedOutfitIds, ...unlocks])
    );

    next = nextLevelXP(b.level);
  }

  return b;
}

export function nextLevelXP(level) {
  return Math.round(100 * Math.pow(level, 1.5));
}
