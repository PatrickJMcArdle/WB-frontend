const BASE = "/achievements";

function authHeaders(token) {
  const h = { "Content-Type": "application/json" };
  if (token) h.Authorization = `Bearer ${token}`;
  return h;
}

export async function fetchCatalog(token) {
  const res = await fetch(`${BASE}/`, { headers: authHeaders(token) });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function fetchUserAchievements(userId, token) {
  const res = await fetch(`${BASE}/user/${userId}`, {
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

/**
 * Server increments workout_sessions, computes total/streak,
 * checks unlocks, writes user_achievements if any, and returns:
 * { totalWorkouts, currentStreak, newAchievements: [ {id,name,...} ] }
 */
export async function completeWorkout(userId, token) {
  const res = await fetch(`${BASE}/user/${userId}/complete-workout`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify({}), // body not required by your router; keep empty object
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
