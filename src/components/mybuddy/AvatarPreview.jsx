export default function AvatarPreview({ appearance, outfit }) {
  const { arms = 0, chest = 0, legs = 0, torsoTone = 0 } = appearance || {};
  // naive: size multipliers for parts
  const armScale = 1 + arms * 0.06;
  const chestScale = 1 + chest * 0.06;
  const legScale = 1 + legs * 0.06;
  const tone = Math.min(1, 0.6 + torsoTone * 0.07); // fill opacity as “tone”

  return (
    <div className="w-full aspect-[1/1] grid place-items-center bg-gray-50 rounded">
      <svg width="220" height="220" viewBox="0 0 220 220">
        {/* legs */}
        <g
          transform={`translate(110,150) scale(${legScale})`}
          style={{ transition: "transform 160ms ease" }} //  added smooth scale
        >
          <rect x="-35" y="0" width="20" height="50" rx="8" fill="#b09070" />
          <rect x="15" y="0" width="20" height="50" rx="8" fill="#b09070" />
        </g>

        {/* torso */}
        <g
          transform={`translate(110,110) scale(${chestScale})`}
          style={{ transition: "transform 160ms ease" }} //  added smooth scale
        >
          <rect
            x="-30"
            y="-35"
            width="60"
            height="70"
            rx="18"
            fill="#b09070"
            fillOpacity={tone}
          />
        </g>

        {/* arms */}
        <g
          transform={`translate(110,100) scale(${armScale})`}
          style={{ transition: "transform 160ms ease" }} //  added smooth scale
        >
          <rect x="-70" y="-10" width="30" height="20" rx="10" fill="#b09070" />
          <rect x="40" y="-10" width="30" height="20" rx="10" fill="#b09070" />
        </g>

        {/* head */}
        <circle cx="110" cy="60" r="24" fill="#b09070" />

        {/* outfit overlay (simple) */}
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
