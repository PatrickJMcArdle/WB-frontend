import { useEffect, useState } from "react";
import { fetchUserAchievements } from "../services/achievementsService";
import { useAuth } from "../auth/AuthContext";

export default function AchievementsWidget() {
  const { user, token } = useAuth() || {};
  const userId = user?.id;
  const [items, setItems] = useState([]);
  const [err, setErr] = useState("");

  useEffect(() => {
    let on = true;
    async function run() {
      if (!userId) return;
      try {
        const list = await fetchUserAchievements(userId, token);
        if (on) setItems(Array.isArray(list) ? list : []);
      } catch (e) {
        if (on) setErr(String(e.message || e));
      }
    }
    run();
    return () => {
      on = false;
    };
  }, [userId, token]);

  if (!userId) return null;

  return (
    <div className="border rounded p-4 bg-white">
      <h2 className="font-semibold mb-2">Achievements</h2>
      {err && <div style={{ color: "crimson" }}>{err}</div>}
      {!items.length ? (
        <div className="text-sm opacity-70">No achievements yet.</div>
      ) : (
        <ul style={{ margin: 0, paddingLeft: 16 }}>
          {items.map((a, idx) => (
            <li key={idx}>
              <strong>{a.name}</strong>
              <div style={{ fontSize: 12, opacity: 0.8 }}>{a.description}</div>
              {"progress" in a && (
                <div style={{ fontSize: 12, opacity: 0.7 }}>
                  Progress: {a.progress}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
