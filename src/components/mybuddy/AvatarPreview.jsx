export default function AvatarPreview({ appearance, outfit, cosmetics }) {
  const { arms = 0, chest = 0, legs = 0, torsoTone = 0 } = appearance || {};
  const armScale = 1 + arms * 0.06;
  const chestScale = 1 + chest * 0.06;
  const legScale = 1 + legs * 0.06;
  const tone = Math.min(1, 0.6 + torsoTone * 0.07);

  // very simple color map
  const hairColorMap = {
    brown: "#6b4423",
    black: "#2b2b2b",
    blonde: "#d9b76e",
    red: "#a33b1f",
    blue: "#3b82f6",
  };
  const hairColor =
    hairColorMap[cosmetics?.hairColorId ?? "brown"] || "#6b4423";

  const topColorMap = {
    tee: "#3b82f6",
    hoodie: "#334155",
    tank: "#ef4444",
    comp: "#22c55e",
  };
  const bottomColorMap = {
    shorts: "#222",
    joggers: "#475569",
    tights: "#6366f1",
  };

  // pick by topId/bottomId (fallback by spriteKey name)
  const topKey =
    cosmetics?.topSpriteKey || spriteKeyFromTopId(cosmetics?.topId);
  const bottomKey =
    cosmetics?.bottomSpriteKey || spriteKeyFromBottomId(cosmetics?.bottomId);

  return (
    <div className="w-full aspect-[1/1] grid place-items-center bg-gray-50 rounded">
      <svg width="220" height="220" viewBox="0 0 220 220">
        {/* bottom (pants/shorts) */}
        <g
          transform={`translate(110,150) scale(${legScale})`}
          style={{ transition: "transform 160ms ease" }}
        >
          {/* legs (skin under) */}
          <rect x="-35" y="0" width="20" height="50" rx="8" fill="#b09070" />
          <rect x="15" y="0" width="20" height="50" rx="8" fill="#b09070" />
          {/* clothing overlay */}
          {bottomKey && (
            <>
              <rect
                x="-40"
                y="-6"
                width="80"
                height="22"
                rx="8"
                fill={bottomColorMap[bottomKey] || "#222"}
              />
              <rect
                x="-35"
                y="12"
                width="20"
                height="38"
                rx="6"
                fill={bottomColorMap[bottomKey] || "#222"}
              />
              <rect
                x="15"
                y="12"
                width="20"
                height="38"
                rx="6"
                fill={bottomColorMap[bottomKey] || "#222"}
              />
            </>
          )}
        </g>

        {/* torso */}
        <g
          transform={`translate(110,110) scale(${chestScale})`}
          style={{ transition: "transform 160ms ease" }}
        >
          {/* skin */}
          <rect
            x="-30"
            y="-35"
            width="60"
            height="70"
            rx="18"
            fill="#b09070"
            fillOpacity={tone}
          />
          {/* top clothing */}
          {topKey === "hoodie" && (
            <path
              d="M-40 -20 h80 v65 h-80 z"
              fill={topColorMap[topKey]}
              opacity="0.95"
            />
          )}
          {topKey === "tank" && (
            <path
              d="M-35 -10 h70 v40 h-70 z"
              fill={topColorMap[topKey]}
              opacity="0.95"
            />
          )}
          {topKey === "tee" && (
            <path
              d="M-35 -5  h70 v35 h-70 z"
              fill={topColorMap[topKey]}
              opacity="0.9"
            />
          )}
          {topKey === "comp" && (
            <path
              d="M-35 -12 h70 v42 h-70 z"
              fill={topColorMap[topKey]}
              opacity="0.95"
            />
          )}
        </g>

        {/* arms */}
        <g
          transform={`translate(110,100) scale(${armScale})`}
          style={{ transition: "transform 160ms ease" }}
        >
          <rect x="-70" y="-10" width="30" height="20" rx="10" fill="#b09070" />
          <rect x="40" y="-10" width="30" height="20" rx="10" fill="#b09070" />
        </g>

        {/* head + hair */}
        <g>
          <circle cx="110" cy="60" r="24" fill="#b09070" />
          {/* hair styles */}
          {renderHair(cosmetics?.hairStyleId, hairColor)}
        </g>

        {/* legacy outfit overlay kept for backward compatibility */}
        {outfit?.spriteKey === "hoodie" && (
          <path d="M70 75 h80 v65 h-80 z" fill="#334155" opacity="0.9" />
        )}
        {outfit?.spriteKey === "tank" && (
          <path d="M75 80 h70 v40 h-70 z" fill="#ef4444" opacity="0.9" />
        )}
        {outfit?.spriteKey === "tee" && (
          <path d="M75 85 h70 v35 h-70 z" fill="#3b82f6" opacity="0.85" />
        )}
      </svg>
    </div>
  );
}

function renderHair(hairStyleId = 1, color = "#6b4423") {
  // simple silhouettes
  if (hairStyleId === 3) {
    // Long
    return (
      <>
        <path d="M86,50 q24,-18 48,0 v26 q-24,12 -48,0 z" fill={color} />
        <circle cx="110" cy="60" r="24" fill="transparent" />
      </>
    );
  }
  if (hairStyleId === 2) {
    // Medium
    return <path d="M88,50 q22,-16 44,0 v16 q-22,10 -44,0 z" fill={color} />;
  }
  // Short default
  return <path d="M90,48 q20,-14 40,0 v10 q-20,8 -40,0 z" fill={color} />;
}

function spriteKeyFromTopId(id) {
  switch (id) {
    case 2:
      return "hoodie";
    case 3:
      return "tank";
    case 4:
      return "comp";
    default:
      return "tee";
  }
}
function spriteKeyFromBottomId(id) {
  switch (id) {
    case 2:
      return "joggers";
    case 3:
      return "tights";
    default:
      return "shorts";
  }
}
