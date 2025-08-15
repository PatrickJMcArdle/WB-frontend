// src/components/mybuddy/AvatarPreview.jsx
import {
  HAIR_STYLES,
  HAIR_COLORS,
  TOPS,
  BOTTOMS,
} from "../../services/buddyService";

function byId(list, id, fallback) {
  return list.find((x) => x.id === id) || fallback;
}
function byColorId(list, id, fallback) {
  return list.find((x) => x.id === id) || fallback;
}

export default function AvatarPreview({
  appearance,
  outfit, // legacy (not required by SVG)
  cosmetics = { hairStyleId: 1, hairColorId: "brown", topId: 1, bottomId: 1 },
}) {
  const hair = byId(HAIR_STYLES, cosmetics.hairStyleId, HAIR_STYLES[0]);
  const hairColor = byColorId(
    HAIR_COLORS,
    cosmetics.hairColorId,
    HAIR_COLORS[0]
  );
  const top = byId(TOPS, cosmetics.topId, TOPS[0]);
  const bottom = byId(BOTTOMS, cosmetics.bottomId, BOTTOMS[0]);

  const colors = {
    skin: "#f4c7a1",
    hair:
      hairColor.id === "black"
        ? "#222"
        : hairColor.id === "blonde"
        ? "#f5d86b"
        : hairColor.id === "red"
        ? "#d35454"
        : hairColor.id === "blue"
        ? "#4a77ff"
        : "#7b5230",
    top:
      top.id === 1
        ? "#3b82f6"
        : top.id === 2
        ? "#475569"
        : top.id === 3
        ? "#8b5cf6"
        : top.id === 4
        ? "#22c55e"
        : "#3b82f6",
    bottoms:
      bottom.id === 1
        ? "#2db58a"
        : bottom.id === 2
        ? "#374151"
        : bottom.id === 3
        ? "#7e22ce"
        : "#2db58a",
  };

  // hair geometry tweak by style (subtle)
  const hairOffset = hair.id === 1 ? 0 : hair.id === 2 ? 4 : 8;

  return (
    <div
      className="w-full grid place-items-center bg-gray-50 rounded"
      style={{ aspectRatio: "1 / 1" }}
    >
      <svg width="220" height="220" viewBox="0 0 200 220">
        {/* head */}
        <circle cx="100" cy="60" r="30" fill={colors.skin} />
        {/* hair */}
        <path
          d={`M70 ${60 - hairOffset} Q100 ${20 - hairOffset} 130 ${
            60 - hairOffset
          } L130 48 Q100 ${10 - hairOffset} 70 48 Z`}
          fill={colors.hair}
        />

        {/* torso (top) */}
        <rect x="70" y="92" width="60" height="60" rx="10" fill={colors.top} />
        {/* arms (match top color) */}
        <rect x="54" y="96" width="16" height="14" rx="7" fill={colors.top} />
        <rect x="130" y="96" width="16" height="14" rx="7" fill={colors.top} />

        {/* legs (bottoms) */}
        <rect
          x="72"
          y="152"
          width="24"
          height="50"
          rx="8"
          fill={colors.bottoms}
        />
        <rect
          x="104"
          y="152"
          width="24"
          height="50"
          rx="8"
          fill={colors.bottoms}
        />

        {/* shoes */}
        <rect x="70" y="202" width="28" height="8" rx="3" fill="#444" />
        <rect x="102" y="202" width="28" height="8" rx="3" fill="#444" />
      </svg>
    </div>
  );
}
