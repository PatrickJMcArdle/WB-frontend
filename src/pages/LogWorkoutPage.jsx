import { useEffect, useState } from "react";
import { loadBuddy, saveBuddy } from "../services/buddyService";
import { applyWorkout } from "../services/buddyService";
import { loadLogs, saveLogs, WORKOUT_FOCUS } from "../services/workoutService";

export default function LogWorkoutPage() {
  const [buddy, setBuddy] = useState(() => loadBuddy());
  const [logs, setLogs] = useState(() => loadLogs());

  const [form, setForm] = useState({
    focuses: [],
    intensity: 3,
    minutes: 30,
    notes: "",
  });

  useEffect(() => saveBuddy(buddy), [buddy]);
  useEffect(() => saveLogs(logs), [logs]);

  const onToggleFocus = (key) => {
    setForm((f) => {
      const has = f.focuses.includes(key);
      return {
        ...f,
        focuses: has ? f.focuses.filter((k) => k !== key) : [...f.focuses, key],
      };
    });
  };

  const onSubmit = (e) => {
    e.preventDefault();
    if (!form.focuses.length) {
      alert("Pick at least one focus area.");
      return;
    }
    const updated = applyWorkout(buddy, form);
    setBuddy(updated);
    const entry = {
      id: crypto.randomUUID(),
      ...form,
      when: Date.now(),
      xp: updated.lastWorkout?.xpGain || 0,
    };
    setLogs([entry, ...logs]);
    alert(`Logged! +${entry.xp} XP`);
  };

  return (
    <div style={{ padding: 16, maxWidth: 720 }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12 }}>
        Log Workout
      </h1>

      <form
        onSubmit={onSubmit}
        style={{ border: "1px solid #ddd", borderRadius: 8, padding: 12 }}
      >
        <fieldset style={{ border: "none", margin: 0, padding: 0 }}>
          <legend style={{ fontWeight: 600, marginBottom: 8 }}>
            Focus areas
          </legend>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            {Object.keys(WORKOUT_FOCUS).map((k) => (
              <label
                key={k}
                style={{ display: "inline-flex", gap: 6, alignItems: "center" }}
              >
                <input
                  type="checkbox"
                  checked={form.focuses.includes(k)}
                  onChange={() => onToggleFocus(k)}
                />
                {k}
              </label>
            ))}
          </div>
        </fieldset>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 12,
            marginTop: 12,
          }}
        >
          <label>
            <div>Intensity (1–5)</div>
            <input
              type="number"
              min={1}
              max={5}
              value={form.intensity}
              onChange={(e) =>
                setForm((f) => ({ ...f, intensity: Number(e.target.value) }))
              }
              style={{ width: "100%", padding: 6 }}
            />
          </label>

          <label>
            <div>Minutes</div>
            <input
              type="number"
              min={5}
              max={180}
              value={form.minutes}
              onChange={(e) =>
                setForm((f) => ({ ...f, minutes: Number(e.target.value) }))
              }
              style={{ width: "100%", padding: 6 }}
            />
          </label>
        </div>

        <label style={{ display: "block", marginTop: 12 }}>
          <div>Notes (optional)</div>
          <textarea
            value={form.notes}
            onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
            rows={3}
            style={{ width: "100%", padding: 6 }}
          />
        </label>

        <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
          <button type="submit">Save workout</button>
          <a href="/buddy" style={{ textDecoration: "underline" }}>
            Back to My Buddy
          </a>
        </div>
      </form>

      <h2 style={{ marginTop: 18, marginBottom: 8 }}>Recent workouts</h2>
      {!logs.length ? (
        <p>No workouts yet.</p>
      ) : (
        <ul style={{ paddingLeft: 18 }}>
          {logs.map((l) => (
            <li key={l.id}>
              {new Date(l.when).toLocaleString()} — {l.focuses.join(", ")} ·{" "}
              {l.minutes}m · intensity {l.intensity} · +{l.xp} XP
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
