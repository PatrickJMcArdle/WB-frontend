// services/workoutsApi.js
const API_BASE =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_URL) || "";

/** Attach token when present */
function authHeaders(token, extra = {}) {
  return {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    "Content-Type": "application/json",
    Accept: "application/json",
    ...extra,
  };
}

async function parse(res) {
  const ct = res.headers.get("content-type") || "";
  const data = ct.includes("application/json")
    ? await res.json()
    : await res.text();
  if (!res.ok) {
    const msg =
      typeof data === "string" ? data : data?.message || "Request failed";
    const err = new Error(msg);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

export async function createUserWorkout(userId, payload, token) {
  const res = await fetch(`${API_BASE}/workouts/user/${userId}`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(payload),
    credentials: "include",
  });
  return parse(res);
}

export async function updateUserWorkout(userId, workoutId, payload, token) {
  const res = await fetch(`${API_BASE}/workouts/user/${userId}/${workoutId}`, {
    method: "PUT",
    headers: authHeaders(token),
    body: JSON.stringify(payload),
    credentials: "include",
  });
  return parse(res);
}

export async function deleteUserWorkout(userId, workoutId, token) {
  const res = await fetch(`${API_BASE}/workouts/user/${userId}/${workoutId}`, {
    method: "DELETE",
    headers: authHeaders(token),
    credentials: "include",
  });
  return parse(res);
}
