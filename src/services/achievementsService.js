const API_BASE =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_URL) || "";

// Parse JSON if present, otherwise return text. Never throw here.
async function parseBody(res) {
  const ct = res.headers.get("content-type") || "";
  if (res.status === 204) return null;
  if (ct.includes("application/json")) {
    try {
      return await res.json();
    } catch {
      return null;
    }
  }
  try {
    return await res.text();
  } catch {
    return null;
  }
}

function withAuthHeaders(token) {
  const h = { Accept: "application/json" };
  if (token) h.Authorization = `Bearer ${token}`;
  return h;
}

// GET /achievements/user/:user_id
export async function fetchUserAchievements(userId, token) {
  const res = await fetch(`${API_BASE}/achievements/user/${userId}`, {
    method: "GET",
    headers: withAuthHeaders(token),
    // IMPORTANT: don't include cookies; keeps CORS simple
    // credentials: "include",  <-- REMOVE THIS
  });

  const data = await parseBody(res);
  if (!res.ok) {
    const msg =
      (data && typeof data === "object" && (data.error || data.message)) ||
      (typeof data === "string" && data) ||
      `HTTP ${res.status}`;
    throw new Error(msg);
  }
  // Always return an array to the caller
  return Array.isArray(data) ? data : [];
}

// POST /achievements/user/:user_id/complete-workout
export async function completeWorkout(userId, token) {
  const res = await fetch(
    `${API_BASE}/achievements/user/${userId}/complete-workout`,
    {
      method: "POST",
      headers: withAuthHeaders(token),
      // No body needed; server infers from auth'd user
      // credentials: "include",  <-- REMOVE THIS
    }
  );

  const data = await parseBody(res);
  if (!res.ok) {
    const msg =
      (data && typeof data === "object" && (data.error || data.message)) ||
      (typeof data === "string" && data) ||
      `HTTP ${res.status}`;
    throw new Error(msg);
  }
  // Expected { totalWorkouts, currentStreak, newAchievements }
  return data || { totalWorkouts: 0, currentStreak: 0, newAchievements: [] };
}
