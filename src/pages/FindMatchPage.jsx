import MatchFilters from "../components/MatchFilters";
import MatchResults from "../components/MatchResults";

export default function FindMatchPage() {
  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Find a Workout Partner</h1>
      <MatchFilters />
      <MatchResults />
    </div>
  );
}
