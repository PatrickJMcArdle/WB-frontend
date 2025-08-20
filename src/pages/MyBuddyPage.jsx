import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import XPBar from "../components/XPBar";
import AvatarPreview from "../components/mybuddy/AvatarPreview";
import StatAllocation from "../components/mybuddy/StatAllocation";
import OutfitGallery from "../components/mybuddy/OutfitGallery";
import CosmeticSelectors from "../components/mybuddy/CosmeticSelectors";
import AchievementsWidget from "../components/AchievementsWidget"; // ⬅️ NEW
import {
  loadBuddy,
  saveBuddy,
  nextLevelXP,
  OUTFITS,
} from "../services/buddyService";

export default function MyBuddyPage() {
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

    <div className="mybuddy-page">
    <div className="mybuddy-scroll">
      <div className="workout-header-top">
          <Link to="/home" className="workout-home-button">
            <img src="/images/HomeIcon.png" alt="Home" />
          </Link>
        </div>
      <div className="grid gap-4 lg:grid-cols-[360px,1fr]">
        <section className="buddy-section">
          <h3 className="buddy-title">My Buddy</h3>
          <div className="text-sm text-gray-600 mb-2">Level {buddy.level}</div>

        <div className="xpbar-container">
          <XPBar current={buddy.xp} target={nextLevelXP(buddy.level)} />
        </div>

        {/* Only show dev tools if explicitly enabled via .env */}
        {SHOW_DEV && (
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
            </div>
          )}

        {/* Source of XP for normal users */}
        <div className="buddy-center">
          <Link to="/workouts" className="workout-link">
            Open Workout Planner
          </Link>
        </div>

        <div className="mt-4 buddy-avatar-wrapper">
            <AvatarPreview
              appearance={buddy.appearance}
              outfit={equipped}
              cosmetics={buddy.cosmetics}
            />
          </div>
        </section>

      <section className="buddy-section">
          <h3>Allocate Stats</h3>

          <div className="text-sm mb-2">Unspent Points: {buddy.statPoints}</div>
          <StatAllocation
            stats={buddy.stats}
            onSpend={onSpendPoint}
            disabled={buddy.statPoints <= 0}
          />
        </section>

        <section className="buddy-section">
          <h3>Customize</h3>
          <CosmeticPicker
            buddy={buddy}
            onChangeCosmetic={onChangeCosmetic}
            catalogs={{
              hairStyles: HAIR_STYLES,
              hairColors: HAIR_COLORS,
              tops: TOPS,
              bottoms: BOTTOMS,
            }}
          />
        </section>

        {/* Optional: keep the old outfit gallery if you want */}
        <section className="buddy-section">
          <h3>Legacy Outfits</h3>

          <OutfitGallery
            outfits={OUTFITS}
            unlocked={buddy.unlockedOutfitIds}
            equippedId={buddy.equippedOutfitId}
            onEquip={onEquipOutfit}
          />
        </section>
      </div>
    </div>
  </div>
)
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
