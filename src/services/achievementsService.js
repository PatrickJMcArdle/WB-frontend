const API_BASE =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_URL) || "";

// Small helper to fail fast when the server didn’t return JSON
function assertJSON(res) {
  const ct = res.headers.get("content-type") || "";
  if (!ct.includes("application/json")) {
    throw new Error(`Expected JSON, got: ${ct}`);
  }
}

export async function fetchUserAchievements(userId, token) {
  const res = await fetch(`${API_BASE}/achievements/user/${userId}`, {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      Accept: "application/json",
    },
    credentials: "include",
  });
  assertJSON(res);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function completeWorkout(userId, token) {
  const res = await fetch(
    `${API_BASE}/achievements/user/${userId}/complete-workout`,
    {
      method: "POST",
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        Accept: "application/json",
      },
      credentials: "include",
    }
  );
  assertJSON(res);
  if (!res.ok) throw new Error(await res.text());
  return res.json(); // { totalWorkouts, currentStreak, newAchievements }
}
