import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import XPBar from "../components/XPBar";
import AvatarPreview from "../components/mybuddy/AvatarPreview";
import StatAllocation from "../components/mybuddy/StatAllocation";
import OutfitGallery from "../components/mybuddy/OutfitGallery";
import CosmeticSelectors from "../components/mybuddy/CosmeticSelectors";
import {
  loadBuddy,
  saveBuddy,
  nextLevelXP,
  OUTFITS,
} from "../services/buddyService";

export default function MyBuddyPage() {
  const [buddy, setBuddy] = useState(() => loadBuddy());

  useEffect(() => {
    saveBuddy(buddy);
  }, [buddy]);

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
        appearance: mapStatsToAppearance(nextStats, prev.level),
      };
    });
  };

  const onEquipOutfit = (id) => {
    if (!buddy.unlockedOutfitIds.includes(id)) return;
    setBuddy((prev) => ({ ...prev, equippedOutfitId: id }));
  };

  const onCosmeticsChange = (nextCosmetics) => {
    setBuddy((prev) => ({ ...prev, cosmetics: nextCosmetics }));
  };

  return (
    <div className="p-4 grid gap-4 lg:grid-cols-[360px,1fr]">
      <section className="border rounded p-4 bg-white">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold mb-2">My Buddy</h1>
          <div className="flex items-center gap-4">
            <Link to="/home" className="text-sm underline">
              Home
            </Link>
            <Link to="/workouts" className="text-sm underline">
              Workout Planner
            </Link>
          </div>
        </div>

        <div className="text-sm text-gray-600 mb-2">Level {buddy.level}</div>
        <XPBar current={buddy.xp} target={nextLevelXP(buddy.level)} />

        <div className="mt-4">
          <AvatarPreview
            appearance={buddy.appearance}
            outfit={equipped}
            cosmetics={buddy.cosmetics}
          />
        </div>
      </section>

      <section className="grid gap-4">
        <CosmeticSelectors
          cosmetics={buddy.cosmetics}
          unlocked={buddy.unlocked}
          onChange={onCosmeticsChange}
        />

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
          <h2 className="font-semibold mb-2">Outfits (Legacy)</h2>
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

/** Map stats → body appearance (respect size cap after level 10) */
function mapStatsToAppearance(stats, level) {
  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
  let arms = Math.floor(stats.strength / 2);
  let chest = Math.floor((stats.strength + stats.core) / 3);
  let legs = Math.floor(stats.stamina / 2);
  let torsoTone = Math.floor((stats.dexterity + stats.core) / 3);

  const sizeCap = 5;
  if (level > 10) {
    arms = Math.min(arms, sizeCap);
    chest = Math.min(chest, sizeCap);
    legs = Math.min(legs, sizeCap);
    torsoTone = Math.min(torsoTone, sizeCap);
  }

  return {
    arms: clamp(arms, 0, sizeCap),
    chest: clamp(chest, 0, sizeCap),
    legs: clamp(legs, 0, sizeCap),
    torsoTone: clamp(torsoTone, 0, sizeCap),
  };
}
