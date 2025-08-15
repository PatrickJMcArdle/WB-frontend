// src/components/mybuddy/CosmeticPicker.jsx
export default function CosmeticPicker({
  buddy,
  onChangeCosmetic, // (key, value) => void
  catalogs, // { hairStyles, hairColors, tops, bottoms }
}) {
  const { hairStyles, hairColors, tops, bottoms } = catalogs;

  // show only unlocked
  const unlockedHairStyles = hairStyles.filter((h) =>
    buddy.unlocked.hairStyleIds.includes(h.id)
  );
  const unlockedHairColors = hairColors.filter((c) =>
    buddy.unlocked.hairColorIds.includes(c.id)
  );
  const unlockedTops = tops.filter((t) => buddy.unlocked.topIds.includes(t.id));
  const unlockedBottoms = bottoms.filter((b) =>
    buddy.unlocked.bottomIds.includes(b.id)
  );

  const label = (text) => (
    <span style={{ fontSize: 12, opacity: 0.8, display: "block" }}>{text}</span>
  );

  return (
    <div style={{ display: "grid", gap: 10 }}>
      <label>
        {label("Hair Style")}
        <select
          value={buddy.cosmetics.hairStyleId}
          onChange={(e) =>
            onChangeCosmetic("hairStyleId", Number(e.target.value))
          }
        >
          {unlockedHairStyles.map((o) => (
            <option key={o.id} value={o.id}>
              {o.name}
            </option>
          ))}
        </select>
      </label>

      <label>
        {label("Hair Color")}
        <select
          value={buddy.cosmetics.hairColorId}
          onChange={(e) => onChangeCosmetic("hairColorId", e.target.value)}
        >
          {unlockedHairColors.map((o) => (
            <option key={o.id} value={o.id}>
              {o.name}
            </option>
          ))}
        </select>
      </label>

      <label>
        {label("Top")}
        <select
          value={buddy.cosmetics.topId}
          onChange={(e) => onChangeCosmetic("topId", Number(e.target.value))}
        >
          {unlockedTops.map((o) => (
            <option key={o.id} value={o.id}>
              {o.name}
            </option>
          ))}
        </select>
      </label>

      <label>
        {label("Bottoms")}
        <select
          value={buddy.cosmetics.bottomId}
          onChange={(e) => onChangeCosmetic("bottomId", Number(e.target.value))}
        >
          {unlockedBottoms.map((o) => (
            <option key={o.id} value={o.id}>
              {o.name}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
