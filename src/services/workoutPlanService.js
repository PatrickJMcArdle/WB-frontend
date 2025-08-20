const KEY = "userWorkoutPlans_v1";

function normalizePlan(p) {
  // Ensure consistent shape for older saved items
  const focuses = Array.isArray(p.focuses)
    ? p.focuses
    : typeof p.focus === "string"
    ? [p.focus]
    : [];
  return {
    id: p.id ?? null,
    title: (p.title ?? "").toString(),
    date: (p.date ?? new Date().toISOString().slice(0, 10)).slice(0, 10),
    // minutes 5–180
    minutes: Math.max(5, Math.min(180, Number(p.minutes) || 30)),
    // reps 1–100
    reps: Math.max(1, Math.min(100, Number(p.reps) || 10)),
    // sets 1–10
    sets: Math.max(1, Math.min(10, Number(p.sets) || 3)),
    notes: p.notes ?? "",
    focuses, // always an array
    is_completed: !!p.is_completed,
    completed_at: p.completed_at ?? null,
  };
}

export function loadPlans() {
  try {
    const raw = localStorage.getItem(KEY);
    const arr = raw ? JSON.parse(raw) : [];
    const list = Array.isArray(arr) ? arr : [];
    return list.map(normalizePlan);
  } catch {
    return [];
  }
}

export function savePlans(plans) {
  try {
    localStorage.setItem(KEY, JSON.stringify(plans.map(normalizePlan)));
  } catch {}
}

export function upsertPlan(plan) {
  const plans = loadPlans();
  const normalized = normalizePlan(plan);

  if (normalized.id == null) {
    normalized.id = Date.now(); // simple client id
    plans.push(normalized);
  } else {
    const idx = plans.findIndex((p) => p.id === normalized.id);
    if (idx >= 0) plans[idx] = normalized;
    else plans.push(normalized);
  }
  savePlans(plans);
  return normalized;
}

export function deletePlan(id) {
  const plans = loadPlans().filter((p) => p.id !== id);
  savePlans(plans);
}

export function setCompleted(id, { minutes, reps, sets }) {
  const plans = loadPlans();
  const idx = plans.findIndex((p) => p.id === id);
  if (idx >= 0) {
    const next = {
      ...plans[idx],
      is_completed: true,
      completed_at: new Date().toISOString(),
      minutes: minutes ?? plans[idx].minutes,
      reps: reps ?? plans[idx].reps,
      sets: sets ?? plans[idx].sets,
    };
    plans[idx] = normalizePlan(next);
    savePlans(plans);
    return plans[idx];
  }
  return null;
}
