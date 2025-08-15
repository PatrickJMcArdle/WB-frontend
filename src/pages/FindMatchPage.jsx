import { useMemo, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import MatchFilters from "../components/MatchFilters";
import MatchResults from "../components/MatchResults";
import useQuery from "../api/useQuery";

const LEVEL_LABELS = { 1: "Beginner", 2: "Intermediate", 3: "Advanced" };
const GOAL_LABELS = {
  1: "Run a marathon",
  2: "Lose 10 pounds",
  3: "Build muscle",
};
const GENDER_LABELS = { 0: "Male", 1: "Female" };

const EMPTY = { level: "", goal: "", gender: "", name: "" };

export default function FindMatchPage() {
  const { user, token } = useAuth() || {};
  const currentUserId = user?.id ?? null;

  // Draft vs applied filters
  const [draftFilters, setDraftFilters] = useState(EMPTY);
  const [filters, setFilters] = useState(EMPTY);

  // trainees see trainers; trainers see trainees
  // const mode = user?.account_type === 1 ? "trainees" : "trainers";

  // ✅ Leading slash ensures absolute path with API base
  // const resource = currentUserId ? `/users/${mode}/${currentUserId}` : null;

  const testMode = "trainers";

  const resource = currentUserId
    ? `/users/${testMode}/${currentUserId}?goal=&preferred_trainer=`
    : null;

  console.log("[FindMatchPage] mode:", testMode);
  console.log("[FindMatchPage] resource:", resource);
  console.log("[FindMatchPage] token present:", !!token);

  // fetch matches; returns refetch we can call on Search
  const {
    data: matches,
    loading,
    error,
    refetch,
  } = useQuery(resource, { enabled: !!token && !!resource, tag: "matches" });

  // Click Search = apply filters + refetch (backend filters can come later)
  const handleSearch = () => {
    setFilters(draftFilters);
    refetch();
    console.log("Applied filters:", draftFilters);
  };

  const handleClear = () => {
    setDraftFilters(EMPTY);
    setFilters(EMPTY);
    refetch();
  };

  // Client-side filtering until backend supports ?level=&goal=&gender=&name=
  const filtered = useMemo(() => {
    if (!Array.isArray(matches)) return [];
    return matches.filter((t) => {
      if (filters.level && String(t.fitness_level) !== String(filters.level))
        return false;
      if (filters.goal && String(t.fitness_goal) !== String(filters.goal))
        return false;
      if (filters.gender && String(t.gender) !== String(filters.gender))
        return false;
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

  // return (
  //   <div className="p-4">
  //     <h1 className="text-2xl font-bold mb-4">
  //       Find a {mode === "trainers" ? "Trainer" : "Trainee"}
  //     </h1>

  //     <MatchFilters
  //       draftFilters={draftFilters}
  //       onDraftChange={setDraftFilters}
  //       onSearch={handleSearch}
  //       onClear={handleClear}
  //       levelLabels={LEVEL_LABELS}
  //       goalLabels={GOAL_LABELS}
  //       genderLabels={GENDER_LABELS}
  //     />

  //     {loading && <p>Loading {mode}…</p>}
  //     {error && <p className="text-red-600">Failed to load {mode}.</p>}

  //     {!loading && !error && (
  //       <>
  //         <p className="text-sm text-gray-600 mb-2">
  //           Showing {filtered.length} result{filtered.length === 1 ? "" : "s"}
  //         </p>
  //         <MatchResults
  //           users={filtered}
  //           levelLabels={LEVEL_LABELS}
  //           goalLabels={GOAL_LABELS}
  //           genderLabels={GENDER_LABELS}
  //         />
  //       </>
  //     )}
  //   </div>
  // );

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">
        Find a {testMode === "trainers" ? "Trainer" : "Trainee"}
      </h1>

      <MatchFilters
        draftFilters={draftFilters}
        onDraftChange={setDraftFilters}
        onSearch={handleSearch}
        onClear={handleClear}
        levelLabels={LEVEL_LABELS}
        goalLabels={GOAL_LABELS}
        genderLabels={GENDER_LABELS}
      />

      {loading && <p>Loading {testMode}…</p>}
      {error && <p className="text-red-600">Failed to load {testMode}.</p>}

      {!loading && !error && (
        <>
          <p className="text-sm text-gray-600 mb-2">
            Showing {filtered.length} result{filtered.length === 1 ? "" : "s"}
          </p>
          <MatchResults
            users={filtered}
            levelLabels={LEVEL_LABELS}
            goalLabels={GOAL_LABELS}
            genderLabels={GENDER_LABELS}
          />
        </>
      )}
    </div>
  );
}
