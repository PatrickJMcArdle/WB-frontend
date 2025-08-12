import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import XPBar from "../components/XPBar";
import AvatarPreview from "../components/mybuddy/AvatarPreview";
import StatAllocation from "../components/mybuddy/StatAllocation";
import OutfitGallery from "../components/mybuddy/OutfitGallery";
import {
  awardXP,
  loadBuddy,
  saveBuddy,
  nextLevelXP,
  OUTFITS,
} from "../services/buddyService";

export default function MyBuddyPage() {
  // Lazy init so loadBuddy() runs once on mount (critical fix)
  const [buddy, setBuddy] = useState(() => loadBuddy());

  // persist to localStorage whenever the buddy changes
  useEffect(() => {
    saveBuddy(buddy);
  }, [buddy]);

  // Memoize equipped outfit (micro perf & cleaner render)
  const equipped = useMemo(
    () => OUTFITS.find((o) => o.id === buddy.equippedOutfitId) || null,
    [buddy.equippedOutfitId]
  );

  const onSpendPoint = (key) => {
    if (!["strength", "dexterity", "stamina", "core"].includes(key)) return;
    if (buddy.statPoints <= 0) return;
    setBuddy((prev) => {
      const nextStats = { ...prev.stats, [key]: prev.stats[key] + 1 };
      return {
        ...prev,
        statPoints: prev.statPoints - 1,
        stats: nextStats,
        appearance: mapStatsToAppearance(nextStats),
      };
    });
  };

  const onEquipOutfit = (id) => {
    if (!buddy.unlockedOutfitIds.includes(id)) return;
    setBuddy((prev) => ({ ...prev, equippedOutfitId: id }));
  };

  // simulate XP gain (dev helper)
  const addXP = (amt) =>
    setBuddy((prev) => {
      const before = prev.level;
      const next = awardXP(prev, amt);
      if (next.level > before) {
        console.log(`Level Up! Reached level ${next.level} (+5 stat points)`);
      }
      return next;
    });

  // dev helper to reset local progress
  const resetBuddy = () => {
    setBuddy({
      userId: 1,
      level: 1,
      xp: 0,
      statPoints: 0,
      stats: { strength: 0, dexterity: 0, stamina: 0, core: 0 },
      appearance: { arms: 0, chest: 0, legs: 0, torsoTone: 0 },
      equippedOutfitId: null,
      unlockedOutfitIds: [1],
    });
  };

  return (
    <div className="p-4 grid gap-4 lg:grid-cols-[360px,1fr]">
      <section className="border rounded p-4 bg-white">
        <h1 className="text-xl font-bold mb-2">My Buddy</h1>
        <div className="text-sm text-gray-600 mb-2">Level {buddy.level}</div>

        <XPBar current={buddy.xp} target={nextLevelXP(buddy.level)} />

        {/* Controls row: dev actions + Log workout */}
        <div className="space-x-3 mt-2">
          <button onClick={() => addXP(50)} className="text-xs underline">
            +50 XP (dev)
          </button>
          <button
            onClick={resetBuddy}
            className="text-xs text-red-600 underline"
          >
            Reset Buddy (dev)
          </button>

          {/* NEW: navigate to workout logger */}
          <Link to="/log">
            <button className="text-xs underline">Log workout</button>
          </Link>
        </div>

        <div className="mt-4">
          <AvatarPreview appearance={buddy.appearance} outfit={equipped} />
        </div>
      </section>

      <section className="grid gap-4">
        <div className="border rounded p-4 bg-white">
          <h2 className="font-semibold mb-2">Allocate Stats</h2>
          <div className="text-sm mb-2">Unspent Points: {buddy.statPoints}</div>
          <StatAllocation
            stats={buddy.stats}
            onSpend={onSpendPoint}
            disabled={buddy.statPoints <= 0}
          />
        </div>

        <div className="border rounded p-4 bg-white">
          <h2 className="font-semibold mb-2">Outfits</h2>
          <OutfitGallery
            outfits={OUTFITS}
            unlocked={buddy.unlockedOutfitIds}
            equippedId={buddy.equippedOutfitId}
            onEquip={onEquipOutfit}
          />
        </div>
      </section>
    </div>
  );
}

/** Map stats → body appearance (simple, tweak later) */
function mapStatsToAppearance(stats) {
  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
  return {
    arms: clamp(Math.floor(stats.strength / 2), 0, 5),
    chest: clamp(Math.floor((stats.strength + stats.core) / 3), 0, 5),
    legs: clamp(Math.floor(stats.stamina / 2), 0, 5),
    torsoTone: clamp(Math.floor((stats.dexterity + stats.core) / 3), 0, 5),
  };
}
