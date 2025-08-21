// src/pages/WorkoutPlannerPage.jsx
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
  FOCUS_OPTIONS,
  calcWorkoutXP,
  accumulateDeltas,
} from "../services/workoutService";

import { loadBuddy, saveBuddy, awardXP } from "../services/buddyService";

import { useAuth } from "../auth/AuthContext";
import {
  createUserWorkout,
  updateUserWorkout,
  deleteUserWorkout as apiDeleteWorkout,
} from "../services/workoutsApi";
import { completeWorkout as apiCompleteWorkout } from "../services/achievementsService";

const todayStr = () => new Date().toISOString().slice(0, 10);

export default function WorkoutPlannerPage() {
  const [plans, setPlans] = useState(() => loadPlans());
  const [range, setRange] = useState({ from: todayStr(), to: todayStr() });
  const [editing, setEditing] = useState(null);
  const [unlocked, setUnlocked] = useState([]); // newly unlocked achievements toast

  const { user, token } = useAuth() || {};
  const userId = user?.id;

  useEffect(() => savePlans(plans), [plans]);

  // String-based filter to avoid timezone issues
  const filtered = useMemo(() => {
    const from = (range.from || "").slice(0, 10);
    const to = (range.to || "").slice(0, 10);

    return (plans || [])
      .filter((p) => {
        const d = (p.date || "").slice(0, 10);
        if (from && d < from) return false;
        if (to && d > to) return false;
        return true;
      })
      .sort((a, b) =>
        a.date === b.date ? a.id - b.id : a.date.localeCompare(b.date)
      );
  }, [plans, range]);

  // ---- Create / Update ----
  async function handleSave(payload) {
    // normalize focuses to array
    const focuses = Array.isArray(payload.focuses) ? payload.focuses : [];

    const saved = upsertPlan({
      ...payload,
      focuses,
      is_completed: payload.is_completed ?? false,
      date: (payload.date || "").slice(0, 10),
    });

    // refresh list & show saved date
    setPlans(loadPlans());
    const d = (saved.date || "").slice(0, 10);
    if (d) setRange({ from: d, to: d });
    setEditing(null);

    // Optional backend sync (safe, best-effort)
    if (userId && token) {
      try {
        if (payload.serverId) {
          // If you store serverId on the local plan, update
          await updateUserWorkout(
            userId,
            payload.serverId,
            toServerShape(saved),
            token
          );
        } else {
          // Otherwise create a new row server-side
          await createUserWorkout(userId, toServerShape(saved), token);
        }
      } catch (e) {
        console.warn("Backend sync failed (local save is OK):", e);
      }
    }
  }

  // ---- Delete ----
  async function handleDelete(id) {
    const plan = plans.find((x) => x.id === id);
    removePlan(id);
    setPlans(loadPlans());

    if (userId && token && plan?.serverId) {
      try {
        await apiDeleteWorkout(userId, plan.serverId, token);
      } catch (e) {
        console.warn("Failed to delete on server (local delete OK):", e);
      }
    }
  }

  // ---- Complete a plan (apply XP, stats, achievements) ----
  async function complete(p) {
    // 1) Mark the plan complete locally
    const updated = setCompleted(p.id, {
      minutes: p.minutes,
      reps: p.reps,
      sets: p.sets,
    });
    if (!updated) return;

    // 2) Update Buddy (XP + stat deltas)
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

    // 3) Tell backend (workout complete => streaks/achievements)
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
    <div className="workout-page">
      <div className="workout-scroll">
        {/* Header */}
        <div className="workout-header">
          <div className="workout-header-top">
            <Link to="/buddy" className="workout-back-button">
              ← Back to Buddy
            </Link>
            <img
              src="/images/HomeIcon.png"
              alt="home"
              className="workout-home-button"
              onClick={() => (window.location.href = "/home")}
            />
          </div>
          <h1 className="workout-title">Workout Planner</h1>
        </div>

        {/* Toast for achievements */}
        {!!unlocked.length && (
          <div
            style={{
              width: 280,
              padding: 10,
              border: "2px solid #16a34a",
              borderRadius: 10,
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
        <div className="workout-range-filter">
          <label>
            From
            <br />
            <input
              type="date"
              value={range.from}
              onChange={(e) =>
                setRange((r) => ({ ...r, from: e.target.value }))
              }
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
          <button
            className="workout-btn"
            onClick={() => setRange({ from: todayStr(), to: todayStr() })}
          >
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

        {/* Form */}
        <div className="workout-card">
          <h2 className="workout-form-title">
            {editing ? "Edit Workout" : "Add Workout"}
          </h2>
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
        </div>

        {/* List */}
        <div style={{ width: 280 }}>
          {filtered.length === 0 ? (
            <p style={{ textAlign: "center", opacity: 0.7 }}>
              No workouts in this range yet.
            </p>
          ) : (
            filtered.map((p) => (
              <div key={p.id} className="workout-item">
                <div className="workout-card">
                  <div className="workout-item-header">
                    <strong>{p.title}</strong>
                    <small>{new Date(p.date).toLocaleDateString()}</small>
                  </div>

                  <div style={{ fontSize: 14, textTransform: "capitalize" }}>
                    Focus: {(p.focuses || []).join(", ") || "—"} • {p.minutes}{" "}
                    min • {p.sets} × {p.reps} reps
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

                  <div className="workout-actions">
                    {!p.is_completed && (
                      <button
                        className="workout-btn"
                        onClick={() => complete(p)}
                      >
                        Complete & Apply to Buddy
                      </button>
                    )}
                    <button
                      className="workout-btn"
                      onClick={() => setEditing(p)}
                    >
                      Edit
                    </button>
                    <button
                      className="workout-btn"
                      onClick={() => handleDelete(p.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

/** Map a local plan into the server payload shape */
function toServerShape(p) {
  return {
    workout_description: p.title || "",
    muscle: Array.isArray(p.focuses) ? p.focuses.join(",") : "",
    workout_date: (p.date || "").slice(0, 10),
    minutes_worked_out: Number(p.minutes) || 0,
    notes: p.notes || "",
  };
}
