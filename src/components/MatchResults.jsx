export default function MatchResults({
  users,
  levelLabels,
  goalLabels,
  genderLabels,
}) {
  if (!users?.length) {
    return <p>No trainers found. Try broadening your filters.</p>;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {users.map((u) => (
        <article key={u.id} className="p-4 border rounded bg-white shadow-sm">
          <header className="mb-2">
            <h2 className="text-lg font-semibold">
              {u.first_name}{" "}
              <span className="text-gray-500">@{u.username}</span>
            </h2>
          </header>

          <ul className="text-sm space-y-1 mb-3">
            <li>
              <strong>Level:</strong> {levelLabels[u.fitness_level] ?? "—"}
            </li>
            <li>
              <strong>Goal:</strong> {goalLabels[u.fitness_goal] ?? "—"}
            </li>
            <li>
              <strong>Gender:</strong> {genderLabels[u.gender] ?? "—"}
            </li>
            <li>
              <strong>Account Type:</strong>{" "}
              {u.account_type === 1 ? "Trainer" : "Trainee"}
            </li>
          </ul>

          <div className="flex gap-2">
            <button className="px-3 py-1 rounded bg-blue-600 text-white">
              View Profile
            </button>
            <button className="px-3 py-1 rounded border">Connect</button>
          </div>
        </article>
      ))}
    </div>
  );
}
