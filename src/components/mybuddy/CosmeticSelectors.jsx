import {
  HAIR_STYLES,
  HAIR_COLORS,
  TOPS,
  BOTTOMS,
} from "../../services/buddyService";

export default function CosmeticSelectors({
  cosmetics,
  unlocked,
  onChange, // (nextCosmetics) => void
}) {
  // Guard against undefined
  const current = cosmetics || {};
  const canUse = unlocked || {
    hairStyleIds: [],
    hairColorIds: [],
    topIds: [],
    bottomIds: [],
  };

  // Filter catalogs by what's unlocked
  const hairStyles = HAIR_STYLES.filter((h) =>
    canUse.hairStyleIds.includes(h.id)
  );
  const hairColors = HAIR_COLORS.filter((c) =>
    canUse.hairColorIds.includes(c.id)
  );
  const tops = TOPS.filter((t) => canUse.topIds.includes(t.id));
  const bottoms = BOTTOMS.filter((b) => canUse.bottomIds.includes(b.id));

  // Helpers to push changes back up
  const set = (key, val) => {
    const next = { ...current, [key]: val };
    onChange?.(next);
  };

  // Hair color swatch (small visual cue)
  const colorSwatch = (id) => {
    const map = {
      brown: "#6b4423",
      black: "#1f1f1f",
      blonde: "#e6c36a",
      red: "#b22222",
      blue: "#3b82f6",
    };
    return (
      <span
        title={id}
        style={{
          display: "inline-block",
          width: 12,
          height: 12,
          borderRadius: 2,
          background: map[id] || "#999",
          marginLeft: 6,
          verticalAlign: "middle",
        }}
      />
    );
  };

  const label = (text) => (
    <span style={{ fontSize: 12, opacity: 0.8, display: "block" }}>{text}</span>
  );

  return (
    <div className="border rounded p-4 bg-white">
      <h2 className="font-semibold mb-2">Customize Buddy</h2>

      <div style={{ display: "grid", gap: 10 }}>
        {/* Hair Style */}
        <label>
          {label("Hair Style")}
          <select
            value={current.hairStyleId ?? ""}
            onChange={(e) => set("hairStyleId", Number(e.target.value))}
          >
            {hairStyles.map((o) => (
              <option key={o.id} value={o.id}>
                {o.name}
              </option>
            ))}
          </select>
        </label>

        {/* Hair Color */}
        <label>
          {label("Hair Color")}
          <select
            value={current.hairColorId ?? ""}
            onChange={(e) => set("hairColorId", e.target.value)}
          >
            {hairColors.map((o) => (
              <option key={o.id} value={o.id}>
                {o.name}
              </option>
            ))}
          </select>
          {colorSwatch(current.hairColorId)}
        </label>

        {/* Top */}
        <label>
          {label("Top")}
          <select
            value={current.topId ?? ""}
            onChange={(e) => set("topId", Number(e.target.value))}
          >
            {tops.map((o) => (
              <option key={o.id} value={o.id}>
                {o.name}
              </option>
            ))}
          </select>
        </label>

        {/* Bottoms */}
        <label>
          {label("Bottoms")}
          <select
            value={current.bottomId ?? ""}
            onChange={(e) => set("bottomId", Number(e.target.value))}
          >
            {bottoms.map((o) => (
              <option key={o.id} value={o.id}>
                {o.name}
              </option>
            ))}
          </select>
        </label>
      </div>
    </div>
  );
}
