import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import WorkoutForm from "../components/WorkoutForm";
import {
  loadPlans,
  savePlans,
  upsertPlan,
  deletePlan as removePlan,
  setCompleted,
} from "../services/workoutPlanService";
import {
  WORKOUT_FOCUS,
  calcWorkoutXP,
  accumulateDeltas,
} from "../services/workoutService";
import { loadBuddy, saveBuddy, awardXP } from "../services/buddyService";

const FOCUS_OPTIONS = Object.keys(WORKOUT_FOCUS);
const todayStr = () => new Date().toISOString().slice(0, 10);

export default function WorkoutPlannerPage() {
  const [plans, setPlans] = useState(() => loadPlans());
  const [range, setRange] = useState({ from: todayStr(), to: todayStr() });
  const [editing, setEditing] = useState(null);

  useEffect(() => savePlans(plans), [plans]);

  const filtered = useMemo(() => {
    const from = range.from ? new Date(range.from) : null;
    const to = range.to ? new Date(range.to) : null;
    return plans
      .filter((p) => {
        const d = new Date(p.date);
        if (from && d < from) return false;
        if (to && d > to) return false;
        return true;
      })
      .sort((a, b) =>
        a.date < b.date ? -1 : a.date > b.date ? 1 : a.id - b.id
      );
  }, [plans, range]);

  function handleSave(payload) {
    // ensure reps present
    const withDefaults = {
      ...payload,
      reps: payload.reps ?? 10,
      is_completed: payload.is_completed ?? false,
    };
    upsertPlan(withDefaults);
    setPlans(loadPlans());
    setEditing(null);
  }

  function complete(p) {
    const updated = setCompleted(p.id, {
      minutes: p.minutes,
      reps: p.reps,
    });
    if (!updated) return;

    // Buddy updates
    const buddy = loadBuddy();
    const xp = calcWorkoutXP({
      minutes: updated.minutes,
      reps: updated.reps,
    });
    const deltas = accumulateDeltas([updated.focus]);

    let next = awardXP(buddy, xp);
    next = {
      ...next,
      stats: {
        strength: next.stats.strength + deltas.strength,
        dexterity: next.stats.dexterity + deltas.dexterity,
        stamina: next.stats.stamina + deltas.stamina,
        core: next.stats.core + deltas.core,
      },
    };
    saveBuddy(next);

    setPlans(loadPlans());
  }

  return (
    <div style={{ padding: 16, maxWidth: 900, margin: "0 auto" }}>
      <div
        style={{
          display: "flex",
          gap: 12,
          alignItems: "center",
          marginBottom: 12,
        }}
      >
        <Link to="/buddy">← Back to Buddy</Link>
        <h1 style={{ margin: 0 }}>Workout Planner</h1>
      </div>

      {/* Range filter */}
      <div
        style={{ display: "flex", gap: 8, alignItems: "end", marginBottom: 12 }}
      >
        <label>
          From
          <br />
          <input
            type="date"
            value={range.from}
            onChange={(e) => setRange((r) => ({ ...r, from: e.target.value }))}
          />
        </label>
        <label>
          To
          <br />
          <input
            type="date"
            value={range.to}
            onChange={(e) => setRange((r) => ({ ...r, to: e.target.value }))}
          />
        </label>
        <button onClick={() => setRange({ from: todayStr(), to: todayStr() })}>
          Today
        </button>
        <button
          onClick={() => {
            const d = new Date();
            const weekFrom = new Date(d);
            weekFrom.setDate(d.getDate() - d.getDay());
            const weekTo = new Date(weekFrom);
            weekTo.setDate(weekFrom.getDate() + 6);
            setRange({
              from: weekFrom.toISOString().slice(0, 10),
              to: weekTo.toISOString().slice(0, 10),
            });
          }}
        >
          This Week
        </button>
      </div>

      {/* Create / Edit form */}
      <WorkoutForm
        initial={
          editing ?? {
            id: null,
            title: "",
            focus: "upper",
            date: todayStr(),
            minutes: 30,
            reps: 10, // ✅ default reps
            notes: "",
          }
        }
        focusOptions={FOCUS_OPTIONS}
        onSave={handleSave}
        onCancel={() => setEditing(null)}
      />

      {/* Plans list */}
      <ul
        style={{
          listStyle: "none",
          padding: 0,
          margin: 0,
          display: "grid",
          gap: 8,
        }}
      >
        {filtered.map((p) => (
          <li
            key={p.id}
            style={{ border: "1px solid #eee", borderRadius: 8, padding: 12 }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "baseline",
              }}
            >
              <strong>{p.title}</strong>
              <small>{new Date(p.date).toLocaleDateString()}</small>
            </div>
            <div style={{ fontSize: 14, marginTop: 4 }}>
              Focus: {p.focus} • {p.minutes} min • {p.reps} reps
              {p.is_completed && (
                <span style={{ marginLeft: 8, color: "green" }}>
                  ✓ Completed
                </span>
              )}
            </div>
            {p.notes ? (
              <div style={{ fontSize: 13, marginTop: 6, opacity: 0.8 }}>
                {p.notes}
              </div>
            ) : null}
            <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
              {!p.is_completed && (
                <button onClick={() => complete(p)}>
                  Complete & Apply to Buddy
                </button>
              )}
              <button onClick={() => setEditing(p)}>Edit</button>
              <button
                onClick={() => {
                  removePlan(p.id);
                  setPlans(loadPlans());
                }}
              >
                Delete
              </button>
            </div>
          </li>
        ))}
        {!filtered.length && <p>No workouts in this range yet.</p>}
      </ul>
    </div>
  );
}
