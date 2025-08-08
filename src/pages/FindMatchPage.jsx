import { useMemo, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import MatchFilters from "../components/MatchFilters";
import MatchResults from "../components/MatchResults";
import useQuery from "../api/useQuery";

/** Map backend ints -> human labels (adjust if your app uses different labels) */
const LEVEL_LABELS = {
  1: "Beginner",
  2: "Intermediate",
  3: "Advanced",
};
const GOAL_LABELS = {
  1: "Run a marathon",
  2: "Lose 10 pounds",
  3: "Build muscle",
};
const GENDER_LABELS = {
  0: "Male",
  1: "Female",
};

export default function FindMatchPage() {
  const { user, token } = useAuth() || {};
  const currentUserId = user?.id ?? null;

  // Local filter state (client-side for now)
  const [filters, setFilters] = useState({
    level: "", // 1|2|3 or ""
    goal: "", // 1|2|3 or ""
    gender: "", // 0|1 or ""
    name: "", // partial username/first_name
  });

  // Choose trainers if logged in as trainee, or trainees if logged in as trainer
  const mode = user?.account_type === 1 ? "trainees" : "trainers";
  const resource = currentUserId ? `users/${mode}/${currentUserId}` : null;

  // Fetch matches
  const {
    data: matches,
    loading,
    error,
  } = useQuery(resource, { enabled: !!token && !!resource });

  // Client-side filtering until backend adds search params
  const filtered = useMemo(() => {
    if (!Array.isArray(matches)) return [];
    return matches.filter((t) => {
      if (filters.level && String(t.fitness_level) !== String(filters.level)) {
        return false;
      }
      if (filters.goal && String(t.fitness_goal) !== String(filters.goal)) {
        return false;
      }
      if (filters.gender && String(t.gender) !== String(filters.gender)) {
        return false;
      }
      if (filters.name) {
        const q = filters.name.toLowerCase();
        const hit =
          t.username?.toLowerCase().includes(q) ||
          t.first_name?.toLowerCase().includes(q);
        if (!hit) return false;
      }
      return true;
    });
  }, [matches, filters]);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">
        Find a {mode === "trainers" ? "Trainer" : "Trainee"}
      </h1>

      <MatchFilters
        filters={filters}
        onChange={setFilters}
        levelLabels={LEVEL_LABELS}
        goalLabels={GOAL_LABELS}
        genderLabels={GENDER_LABELS}
      />

      {loading && <p>Loading {mode}…</p>}
      {error && <p className="text-red-600">Failed to load {mode}.</p>}

      {!loading && !error && (
        <MatchResults
          users={filtered}
          levelLabels={LEVEL_LABELS}
          goalLabels={GOAL_LABELS}
          genderLabels={GENDER_LABELS}
        />
      )}
    </div>
  );
}
