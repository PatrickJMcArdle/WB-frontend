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
    <div 
      className="workout-page">
    <div className="workout-scroll">
      <div className="workout-header">
        <div className="workout-header-top">
          <Link to="/buddy" className="workout-back-button">← Back to Buddy</Link>
          <Link to="/home" className="workout-home-button">
            <img src="/images/HomeIcon.png" alt="Home" />
          </Link>
        </div>
  <h1 className="workout-title">Workout Planner</h1>
      </div>


      {/* Range filter */}
      <div 
      style={{ display: "flex", gap: 8, alignItems: "end", marginBottom: 12 }}
      className="workout-range-filter">
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
        <button className="workout-btn" onClick={() => setRange({ from: todayStr(), to: todayStr() })}>
          Today
        </button>
        <button
          className="workout-btn"
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
      <div className="workout-card">
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
        className="workout-form"
      />
      </div>

      {/* Plans list */}
      <ul 
      style={{
          listStyle: "none",
          padding: 0,
          margin: 0,
          display: "grid",
          gap: 8,
        }}
      className="workout-list">
        {filtered.map((p) => (
          <li key={p.id} 
          style={{ border: "1px solid #eee", borderRadius: 8, padding: 12 }} 
          className="workout-item workout-card">
            <div 
            className="workout-item-header"
            style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "baseline",
              }}>
              <strong>{p.title}</strong>
              <small>{new Date(p.date).toLocaleDateString()}</small>
            </div>

            <div 
            className="workout-item-info"
            style={{ fontSize: 14, marginTop: 4 }}
            >
              Focus: {p.focus} • {p.minutes} min • {p.reps} reps

              {p.is_completed && (
                <span 
                style={{ marginLeft: 8, color: "green" }}
                className="workout-complete">
                  ✓ Completed
                </span>
              )}
            </div>
            {p.notes ? (
              <div 
              style={{ fontSize: 13, marginTop: 6, opacity: 0.8 }}
              className="workout-notes">
                {p.notes}
              </div>
            ) : null}
            <div 
            style={{ display: "flex", gap: 8, marginTop: 8 }}
            className="workout-actions">
              {!p.is_completed && (
                <button className="workout-btn" onClick={() => complete(p)}>
                  Complete & Apply to Buddy
                </button>
              )}
              <button className="workout-btn" onClick={() => setEditing(p)}>Edit</button>
              <button
                className="workout-btn"
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
    </div>
  );
}
