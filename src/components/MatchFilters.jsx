export default function MatchFilters() {
  return (
    <form className="grid grid-cols-2 gap-4 mb-6">
      <select>
        <option>Fitness Level</option>
        <option>Beginner</option>
        <option>Intermediate</option>
        <option>Advanced</option>
      </select>
      <input type="text" placeholder="Search by name or city" />
      <button
        type="submit"
        className="col-span-2 bg-blue-500 text-white p-2 rounded"
      >
        Search
      </button>
    </form>
  );
}
