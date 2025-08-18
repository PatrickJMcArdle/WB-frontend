export default function MatchFilters({
  draftFilters,
  onDraftChange,
  onSearch,
  onClear,
  levelLabels,
  goalLabels,
  genderLabels,
}) {
  function set(key, value) {
    onDraftChange({ ...draftFilters, [key]: value });
  }

  return (
    <form
      className="grid grid-cols-1 md:grid-cols-6 gap-3 mb-6"
      onSubmit={(e) => {
        e.preventDefault();
        onSearch();
      }}
    >
      {/* Who */}
      <select
        value={draftFilters.who}
        onChange={(e) => set("who", e.target.value)}
        className="border p-2 rounded"
      >
        <option value="any">Anyone</option>
        <option value="trainers">Trainers</option>
        <option value="trainees">Trainees</option>
      </select>

      {/* Name */}
      <input
        type="text"
        placeholder="Search by name"
        value={draftFilters.name}
        onChange={(e) => set("name", e.target.value)}
        className="border p-2 rounded"
      />

      {/* Level */}
      <select
        value={draftFilters.level}
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

      {/* Goal */}
      <select
        value={draftFilters.goal}
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

      {/* Gender */}
      <select
        value={draftFilters.gender}
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

      {/* Actions */}
      <div className="flex gap-2">
        <button
          type="submit"
          className="px-4 py-2 rounded bg-blue-600 text-white"
        >
          Search
        </button>
        <button
          type="button"
          onClick={onClear}
          className="px-4 py-2 rounded border"
        >
          Clear
        </button>
      </div>
    </form>
  );
}
