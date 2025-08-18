import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import WorkoutForm from "../components/WorkoutForm";
import { useAuth } from "../auth/AuthContext";
import {
  loadPlans,
  savePlans,
  upsertPlan,
  deletePlan as removePlan,
  setCompleted,
} from "../services/workoutPlanService";
import {
  FOCUS_OPTIONS,
  calcWorkoutXP,
  accumulateDeltas,
} from "../services/workoutService";
import { loadBuddy, saveBuddy, awardXP } from "../services/buddyService";
import { completeWorkout as apiCompleteWorkout } from "../services/achievementsService";

const todayStr = () => new Date().toISOString().slice(0, 10);

export default function WorkoutPlannerPage() {
  const [plans, setPlans] = useState(() => loadPlans());
  const [range, setRange] = useState({ from: todayStr(), to: todayStr() });
  const [editing, setEditing] = useState(null);
  const [unlocked, setUnlocked] = useState([]);

  const { user, token } = useAuth() || {};
  const userId = user?.id;

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
    const focuses = Array.isArray(payload.focuses) ? payload.focuses : [];
    upsertPlan({
      ...payload,
      focuses,
      is_completed: payload.is_completed ?? false,
    });
    setPlans(loadPlans());
    setEditing(null);
  }

  async function complete(p) {
    // 1) mark complete locally
    const updated = setCompleted(p.id, {
      minutes: p.minutes,
      reps: p.reps,
      sets: p.sets,
    });
    if (!updated) return;

    // 2) update buddy
    const buddy = loadBuddy();
    const xp = calcWorkoutXP({
      minutes: updated.minutes,
      reps: updated.reps,
      sets: updated.sets,
    });
    const deltas = accumulateDeltas(updated.focuses || []);
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

    // 3) notify backend (achievements + streaks)
    if (userId && token) {
      try {
        const { newAchievements } = await apiCompleteWorkout(userId, token);
        if (Array.isArray(newAchievements) && newAchievements.length) {
          setUnlocked(newAchievements);
          setTimeout(() => setUnlocked([]), 5000);
        }
      } catch (err) {
        console.error("Failed to record workout for achievements:", err);
      }
    }

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
        <Link to="/home">← Home</Link>
        <Link to="/buddy">← Back to Buddy</Link>
        <h1 style={{ margin: 0 }}>Workout Planner</h1>
      </div>

      {!!unlocked.length && (
        <div
          style={{
            marginBottom: 12,
            padding: 10,
            border: "1px solid #16a34a",
            borderRadius: 8,
            background: "#f0fdf4",
            color: "#166534",
          }}
        >
          <strong>New achievements unlocked!</strong>
          <ul style={{ margin: "6px 0 0 16px" }}>
            {unlocked.map((a) => (
              <li key={a.id}>
                {a.name}{" "}
                <span style={{ opacity: 0.7 }}>({a.points_awarded} pts)</span>
              </li>
            ))}
          </ul>
        </div>
      )}

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
            focuses: [],
            date: todayStr(),
            minutes: 30,
            reps: 15,
            sets: 3,
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
            <div
              style={{
                fontSize: 14,
                marginTop: 4,
                textTransform: "capitalize",
              }}
            >
              Focus: {(p.focuses || []).join(", ") || "—"} • {p.minutes} min •{" "}
              {p.sets} × {p.reps} reps
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
