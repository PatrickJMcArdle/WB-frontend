const KEY = "userWorkoutPlans_v1";

function migrate(plans) {
  // If an old plan has "intensity" but no "reps", convert roughly: reps ≈ intensity * 10
  return plans.map((p) =>
    p && typeof p === "object"
      ? {
          ...p,
          reps:
            p.reps != null
              ? p.reps
              : p.intensity != null
              ? Math.max(1, Math.min(300, Math.round(Number(p.intensity) * 10)))
              : 10,
        }
      : p
  );
}

export function loadPlans() {
  try {
    const raw = localStorage.getItem(KEY);
    const arr = raw ? JSON.parse(raw) : [];
    const list = Array.isArray(arr) ? arr : [];
    return migrate(list);
  } catch {
    return [];
  }
}

export function savePlans(plans) {
  try {
    localStorage.setItem(KEY, JSON.stringify(plans));
  } catch {}
}

export function upsertPlan(plan) {
  const plans = loadPlans();
  if (plan.id == null) {
    plan.id = Date.now(); // simple client id
    plans.push(plan);
  } else {
    const idx = plans.findIndex((p) => p.id === plan.id);
    if (idx >= 0) plans[idx] = plan;
    else plans.push(plan);
  }
  savePlans(plans);
  return plan;
}

export function deletePlan(id) {
  const plans = loadPlans().filter((p) => p.id !== id);
  savePlans(plans);
}

export function setCompleted(id, { minutes, reps }) {
  const plans = loadPlans();
  const idx = plans.findIndex((p) => p.id === id);
  if (idx >= 0) {
    plans[idx] = {
      ...plans[idx],
      is_completed: true,
      completed_at: new Date().toISOString(),
      minutes: minutes ?? plans[idx].minutes,
      reps: reps ?? plans[idx].reps,
    };
    savePlans(plans);
    return plans[idx];
  }
  return null;
}
