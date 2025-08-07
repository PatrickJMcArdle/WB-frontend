const sampleUsers = [
  {
    name: "Jordan",
    level: "Intermediate",
    goal: "Weight Loss",
    city: "Chicago",
  },
  { name: "Taylor", level: "Beginner", goal: "Muscle Gain", city: "Austin" },
];

export default function MatchResults() {
  return (
    <div className="grid gap-4">
      {sampleUsers.map((user, idx) => (
        <div key={idx} className="p-4 border rounded shadow bg-white">
          <h2 className="font-bold text-lg">{user.name}</h2>
          <p>
            {user.level} | Goal: {user.goal}
          </p>
          <p>{user.city}</p>
          <button className="mt-2 text-blue-600">View Profile</button>
        </div>
      ))}
    </div>
  );
}
