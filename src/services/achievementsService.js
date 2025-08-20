const API_BASE =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_URL) || "";

// Accept empty (204) and gracefully coerce to []
async function parseJSON(res) {
  const ct = res.headers.get("content-type") || "";
  if (res.status === 204) return []; // no content -> empty list
  if (ct.includes("application/json")) return res.json();
  // Try text for better error messages
  const text = await res.text();
  throw new Error(text || `HTTP ${res.status}`);
}

function withAuthHeaders(token) {
  return {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    Accept: "application/json",
  };
}

export async function fetchUserAchievements(userId, token) {
  const res = await fetch(`${API_BASE}/achievements/user/${userId}`, {
    headers: withAuthHeaders(token),
    credentials: "include",
  });
  if (!res.ok) throw new Error(await parseJSON(res));
  return parseJSON(res);
}

export async function completeWorkout(userId, token) {
  const res = await fetch(
    `${API_BASE}/achievements/user/${userId}/complete-workout`,
    {
      method: "POST",
      headers: withAuthHeaders(token),
      credentials: "include",
    }
  );
  if (!res.ok) throw new Error(await parseJSON(res));
  return parseJSON(res); // { totalWorkouts, currentStreak, newAchievements }
}
