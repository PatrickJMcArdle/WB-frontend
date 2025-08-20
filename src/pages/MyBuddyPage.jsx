// src/pages/MyBuddyPage.jsx
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import XPBar from "../components/XPBar";
import AvatarPreview from "../components/mybuddy/AvatarPreview";
import StatAllocation from "../components/mybuddy/StatAllocation";
import OutfitGallery from "../components/mybuddy/OutfitGallery";
import CosmeticSelectors from "../components/mybuddy/CosmeticSelectors";
import AchievementsWidget from "../components/AchievementsWidget";

import {
  loadBuddy,
  saveBuddy,
  nextLevelXP,
  OUTFITS,
  awardXP, // <-- for dev addXP
  DEFAULT, // <-- for dev resetBuddy
} from "../services/buddyService";

const SHOW_DEV = String(import.meta.env.VITE_SHOW_DEV || "0") === "1";

export default function MyBuddyPage() {
  const [buddy, setBuddy] = useState(() => loadBuddy());

  // persist whenever buddy changes
  useEffect(() => {
    saveBuddy(buddy);
  }, [buddy]);

  // Equipped outfit (legacy outfits gallery)
  const equipped = useMemo(
    () => OUTFITS.find((o) => o.id === buddy.equippedOutfitId) || null,
    [buddy.equippedOutfitId]
  );

  // DEV helpers (only used when SHOW_DEV === "1")
  const addXP = (amount) => {
    setBuddy((prev) => {
      const next = awardXP(prev, amount);
      saveBuddy(next);
      return next;
    });
  };
  const resetBuddy = () => {
    setBuddy({ ...DEFAULT });
  };

  // Stat spending
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

  // Legacy outfits
  const onEquipOutfit = (id) => {
    if (!buddy.unlockedOutfitIds.includes(id)) return;
    setBuddy((prev) => ({ ...prev, equippedOutfitId: id }));
  };

  // Cosmetics (hair/top/bottom, etc)
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
          {/* LEFT: Buddy + XP */}
          <section className="buddy-section">
            <h3 className="buddy-title">My Buddy</h3>

            <div className="text-sm text-gray-600 mb-2">
              Level {buddy.level}
            </div>

            <div className="xpbar-container">
              <XPBar current={buddy.xp} target={nextLevelXP(buddy.level)} />
            </div>

            {SHOW_DEV && (
              <div className="space-x-3 mt-2" style={{ padding: "0 1rem" }}>
                <button onClick={() => addXP(50)} className="text-xs underline">
                  +50 XP (dev)
                </button>
                <button
                  onClick={resetBuddy}
                  className="text-xs text-red-600 underline"
                  style={{ marginLeft: 8 }}
                >
                  Reset Buddy (dev)
                </button>
              </div>
            )}

            <div className="buddy-center" style={{ marginTop: 8 }}>
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

          {/* RIGHT: Customization, Achievements, Stats, Outfits */}
          <section className="buddy-section">
            <h3>Customize</h3>
            <div className="cosmetic-selectors">
              <CosmeticSelectors
                cosmetics={buddy.cosmetics}
                unlocked={buddy.unlocked}
                onChange={onCosmeticsChange}
              />
            </div>
          </section>

          <section className="buddy-section">
            <h3>Achievements</h3>
            <div style={{ padding: "0 1rem" }}>
              <AchievementsWidget />
            </div>
          </section>

          <section className="buddy-section">
            <h3>Allocate Stats</h3>
            <div className="text-sm mb-2" style={{ padding: "0 1rem" }}>
              Unspent Points: {buddy.statPoints}
            </div>
            <div style={{ padding: "0 1rem" }}>
              <StatAllocation
                stats={buddy.stats}
                onSpend={onSpendPoint}
                disabled={buddy.statPoints <= 0}
              />
            </div>
          </section>

          <section className="buddy-section">
            <h3>Legacy Outfits</h3>
            <div style={{ padding: "0 1rem" }}>
              <OutfitGallery
                outfits={OUTFITS}
                unlocked={buddy.unlockedOutfitIds}
                equippedId={buddy.equippedOutfitId}
                onEquip={onEquipOutfit}
              />
            </div>
          </section>
        </div>
      </div>
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
