export default function MatchFilters({
  filters,
  onChange,
  levelLabels,
  goalLabels,
  genderLabels,
}) {
  function set(key, value) {
    onChange({ ...filters, [key]: value });
  }

  return (
    <form
      className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-6"
      onSubmit={(e) => e.preventDefault()}
    >
      <input
        type="text"
        placeholder="Search by name"
        value={filters.name}
        onChange={(e) => set("name", e.target.value)}
        className="border p-2 rounded"
      />

      <select
        value={filters.level}
        onChange={(e) => set("level", e.target.value)}
        className="border p-2 rounded"
      >
        <option value="">Any level</option>
        {Object.entries(levelLabels).map(([val, label]) => (
          <option key={val} value={val}>
            {label}
          </option>
        ))}
      </select>

      <select
        value={filters.goal}
        onChange={(e) => set("goal", e.target.value)}
        className="border p-2 rounded"
      >
        <option value="">Any goal</option>
        {Object.entries(goalLabels).map(([val, label]) => (
          <option key={val} value={val}>
            {label}
          </option>
        ))}
      </select>

      <select
        value={filters.gender}
        onChange={(e) => set("gender", e.target.value)}
        className="border p-2 rounded"
      >
        <option value="">Any gender</option>
        {Object.entries(genderLabels).map(([val, label]) => (
          <option key={val} value={val}>
            {label}
          </option>
        ))}
      </select>
    </form>
  );
}
