import { useEffect, useMemo, useState } from "react";
import useQuery from "../api/useQuery";
import { useNavigate } from "react-router-dom";
import { loadBuddy, saveBuddy, awardXP } from "../services/buddyService";
import {
  WORKOUT_FOCUS,
  calcWorkoutXP,
  accumulateDeltas,
  loadLogs,
  saveLogs,
} from "../services/workoutService";

// Map backend workout_type -> our focus keys (tweak as you add more types)
function typeToFocusList(workout_type) {
  switch (Number(workout_type)) {
    case 1:
      return ["upper", "lower", "core"]; // Full body circuit
    case 2:
      return ["upper"]; // Upper body strength
    case 3:
      return ["mobility", "core"]; // Yoga session
    default:
      return []; // Unknown -> no deltas
  }
}

export default function LogWorkoutPage() {
  const navigate = useNavigate();

  // Pull workouts from backend
  const { data: workouts, loading, error } = useQuery("/workouts");

  // Local form state
  const [selected, setSelected] = useState([]); // list of workout IDs
  const [intensity, setIntensity] = useState(2); // 1..5
  const [minutes, setMinutes] = useState(30); // 5..180
  const [note, setNote] = useState("");

  // Load buddy once (localStorage)
  const [buddy, setBuddy] = useState(() => loadBuddy());
  useEffect(() => saveBuddy(buddy), [buddy]);

  const toggled = (id) =>
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  // Derive focus list from selected workouts
  const selectedFocuses = useMemo(() => {
    if (!Array.isArray(workouts)) return [];
    const focusSet = new Set();
    selected.forEach((id) => {
      const w = workouts.find((x) => x.id === id);
      if (!w) return;
      typeToFocusList(w.workout_type).forEach((f) => focusSet.add(f));
    });
    return Array.from(focusSet);
  }, [selected, workouts]);

  // Accumulate deltas based on focus list
  const deltas = useMemo(
    () => accumulateDeltas(selectedFocuses),
    [selectedFocuses]
  );

  const xp = useMemo(
    () => calcWorkoutXP({ intensity, minutes }),
    [intensity, minutes]
  );

  const submit = (e) => {
    e.preventDefault();
    // 1) award xp
    let updated = awardXP(buddy, xp);

    // 2) auto-apply stat deltas (convert “parts” into appearance bumps too)
    updated = {
      ...updated,
      stats: {
        ...updated.stats,
        strength: updated.stats.strength + deltas.strength,
        dexterity: updated.stats.dexterity + deltas.dexterity,
        stamina: updated.stats.stamina + deltas.stamina,
        core: updated.stats.core + deltas.core,
      },
      appearance: {
        ...updated.appearance,
        arms: (updated.appearance.arms || 0) + (deltas.parts.arms || 0),
        chest: (updated.appearance.chest || 0) + (deltas.parts.chest || 0),
        legs: (updated.appearance.legs || 0) + (deltas.parts.legs || 0),
        torsoTone:
          (updated.appearance.torsoTone || 0) + (deltas.parts.torsoTone || 0),
      },
    };

    setBuddy(updated);
    saveBuddy(updated);

    // 3) record a simple local log
    const logs = loadLogs();
    logs.unshift({
      id: crypto.randomUUID(),
      at: new Date().toISOString(),
      selected, // workout IDs
      focuses: selectedFocuses,
      intensity,
      minutes,
      xp,
      note: note.trim(),
    });
    saveLogs(logs);

    // 4) go back to Buddy (or toast, etc.)
    navigate("/buddy");
  };

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Log a workout</h1>

      {loading && <p>Loading workout list…</p>}
      {error && <p className="text-red-600">Failed to load workouts.</p>}
      {!loading && !error && Array.isArray(workouts) && (
        <form onSubmit={submit} className="space-y-6">
          <fieldset className="border rounded p-3">
            <legend className="font-semibold">Choose workouts</legend>
            <ul className="space-y-2">
              {workouts.map((w) => (
                <li key={w.id} className="flex items-center gap-2">
                  <input
                    id={`w-${w.id}`}
                    type="checkbox"
                    checked={selected.includes(w.id)}
                    onChange={() => toggled(w.id)}
                  />
                  <label htmlFor={`w-${w.id}`}>
                    {w.description}{" "}
                    <span className="text-sm text-gray-500">
                      (type {w.workout_type})
                    </span>
                  </label>
                </li>
              ))}
            </ul>
          </fieldset>

          <fieldset className="border rounded p-3">
            <legend className="font-semibold">Effort</legend>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="block">
                <span className="block text-sm mb-1">Intensity (1–5)</span>
                <input
                  type="number"
                  min={1}
                  max={5}
                  value={intensity}
                  onChange={(e) => setIntensity(Number(e.target.value) || 1)}
                  className="border p-2 rounded w-full"
                />
              </label>
              <label className="block">
                <span className="block text-sm mb-1">Minutes (5–180)</span>
                <input
                  type="number"
                  min={5}
                  max={180}
                  value={minutes}
                  onChange={(e) => setMinutes(Number(e.target.value) || 5)}
                  className="border p-2 rounded w-full"
                />
              </label>
            </div>
          </fieldset>

          <label className="block">
            <span className="block text-sm mb-1">Notes (optional)</span>
            <textarea
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="border p-2 rounded w-full"
              placeholder="How did it go?"
            />
          </label>

          <div className="text-sm">
            <div>
              Derived focuses: <code>{selectedFocuses.join(", ") || "—"}</code>
            </div>
            <div>
              Projected XP: <strong>{xp}</strong>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              className="px-4 py-2 rounded bg-blue-600 text-white"
            >
              Save workout
            </button>
            <button
              type="button"
              onClick={() => navigate("/buddy")}
              className="px-4 py-2 rounded border"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
