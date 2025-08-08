// src/components/mybuddy/StatAllocation.jsx
const LABELS = {
  strength: "Strength",
  dexterity: "Dexterity",
  stamina: "Stamina",
  core: "Core",
};

export default function StatAllocation({ stats, onSpend, disabled }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {Object.entries(stats).map(([key, val]) => (
        <div
          key={key}
          className="border rounded p-3 flex items-center justify-between"
        >
          <div>
            <div className="font-medium">{LABELS[key]}</div>
            <div className="text-sm text-gray-600">Pts: {val}</div>
          </div>
          <button
            className="px-3 py-1 rounded bg-blue-600 text-white disabled:opacity-50"
            onClick={() => onSpend(key)}
            disabled={disabled}
          >
            +1
          </button>
        </div>
      ))}
    </div>
  );
}
