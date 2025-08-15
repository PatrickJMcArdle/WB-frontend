import { useMemo, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import MatchFilters from "../components/MatchFilters";
import MatchResults from "../components/MatchResults";
import useQuery from "../api/useQuery";
import "../index.css";
import { Link } from "react-router-dom";

const LEVEL_LABELS = {
  1: "Beginner",
  2: "Intermediate",
  3: "Advanced",
  4: "Elite Athlete",
};

// Fallback if /goals hasn't loaded yet:
const GOAL_FALLBACK = {
  1: "Run a marathon",
  2: "Lose weight",
  3: "Build muscle",
  4: "Increase cardio endurance",
  5: "Improve stamina",
  6: "Tone body",
  7: "Tone muscle",
  8: "Improve flexibility/mobility",
  9: "Gain strength",
  10: "General fitness & health",
};

const GENDER_LABELS = { 0: "Male", 1: "Female" };
const EMPTY = { who: "any", level: "", goal: "", gender: "", name: "" };

export default function FindMatchPage() {
  const { user, token } = useAuth() || {};
  const currentUserId = user?.id ?? null;

  // Draft vs applied filters
  const [draftFilters, setDraftFilters] = useState(EMPTY);
  const [filters, setFilters] = useState(EMPTY);

  // Build dynamic goal labels from backend
  const { data: goals } = useQuery("/goals", { enabled: true, tag: "goals" });
  const GOAL_LABELS = useMemo(() => {
    if (!Array.isArray(goals) || goals.length === 0) return GOAL_FALLBACK;
    const map = {};
    goals.forEach((g) => (map[g.id] = g.description));
    return map;
  }, [goals]);

  // /users/trainers/:id?goal=&gender=
  const trainersResource = useMemo(() => {
    if (!currentUserId) return null;
    const params = new URLSearchParams();
    if (filters.goal) params.set("goal", String(filters.goal));
    if (filters.gender !== "") params.set("gender", String(filters.gender));
    return `/users/trainers/${currentUserId}?${params.toString()}`;
  }, [filters.goal, filters.gender, currentUserId]);

  // /users/trainees/:id?goal=&preferred_trainer=
  const traineesResource = useMemo(() => {
    if (!currentUserId) return null;
    const params = new URLSearchParams();
    if (filters.goal) params.set("goal", String(filters.goal));
    if (filters.gender !== "")
      params.set("preferred_trainer", String(filters.gender));
    return `/users/trainees/${currentUserId}?${params.toString()}`;
  }, [filters.goal, filters.gender, currentUserId]);

  const trainersQuery = useQuery(trainersResource, {
    enabled:
      !!token &&
      !!trainersResource &&
      (filters.who === "trainers" || filters.who === "any"),
    tag: "find.trainers",
  });

  const traineesQuery = useQuery(traineesResource, {
    enabled:
      !!token &&
      !!traineesResource &&
      (filters.who === "trainees" || filters.who === "any"),
    tag: "find.trainees",
  });

  const loading =
    filters.who === "any"
      ? trainersQuery.loading || traineesQuery.loading
      : filters.who === "trainers"
      ? trainersQuery.loading
      : traineesQuery.loading;

  const error = trainersQuery.error || traineesQuery.error;

  // Merge results when "any"
  const serverResults = useMemo(() => {
    const t = Array.isArray(trainersQuery.data) ? trainersQuery.data : [];
    const r = Array.isArray(traineesQuery.data) ? traineesQuery.data : [];
    if (filters.who === "trainers") return t;
    if (filters.who === "trainees") return r;
    const byId = new Map();
    [...t, ...r].forEach((u) => byId.set(u.id, u));
    return Array.from(byId.values());
  }, [filters.who, trainersQuery.data, traineesQuery.data]);

  // Client-side filtering for name + level
  const filtered = useMemo(() => {
    const list = Array.isArray(serverResults) ? serverResults : [];
    return list.filter((u) => {
      if (filters.level && String(u.fitness_level) !== String(filters.level))
        return false;
      if (filters.name) {
        const q = filters.name.toLowerCase();
        const hit =
          u.username?.toLowerCase().includes(q) ||
          u.first_name?.toLowerCase().includes(q);
        if (!hit) return false;
      }
      return true;
    });
  }, [serverResults, filters.level, filters.name]);

  const handleSearch = () => setFilters(draftFilters);
  const handleClear = () => {
    setDraftFilters(EMPTY);
    setFilters(EMPTY);
  };

  const title =
    filters.who === "trainers"
      ? "Find a Trainer"
      : filters.who === "trainees"
      ? "Find a Trainee"
      : "Find a Workout Partner";

  return (
    <div className="p-4 find-page">
      <div className="find-header-row">
        <Link to="/home" className="find-home-btn">
          <img src="/images/HomeIcon.png" alt="Home" />
        </Link>
      </div>

      <h1 className="text-2xl font-bold mb-4">{title}</h1>

      <MatchFilters
        draftFilters={draftFilters}
        onDraftChange={setDraftFilters}
        onSearch={handleSearch}
        onClear={handleClear}
        levelLabels={LEVEL_LABELS}
        goalLabels={GOAL_LABELS} // ← dynamic from backend
        genderLabels={GENDER_LABELS}
      />

      {loading && <p>Loading…</p>}
      {error && <p className="text-red-600">Failed to load results.</p>}

      {!loading && !error && (
        <>
          <p className="text-sm text-gray-600 mb-2">
            Showing {filtered.length} result{filtered.length === 1 ? "" : "s"}
          </p>
          <div className="results-list">
            <MatchResults
              users={filtered}
              levelLabels={LEVEL_LABELS}
              goalLabels={GOAL_LABELS}
              genderLabels={GENDER_LABELS}
            />
          </div>
        </>
      )}
    </div>
  );
}
