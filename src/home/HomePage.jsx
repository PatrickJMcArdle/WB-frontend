import { useNavigate } from "react-router";
import { useState } from "react";
import '../index.css';

export default function HomePage() {
  const navigate = useNavigate();

  const [goals, setGoals] = useState([
    { text: "RDL", completed: false },
    { text: "Bulgarian Split Squats", completed: false },
    { text: "Hip Thrust", completed: false },
  ]);

  const toggleGoal = (index) => {
    const newGoals = [...goals];
    newGoals[index].completed = !newGoals[index].completed;
    setGoals(newGoals);
  };

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="home-page">
        <div className="top-buttons">
            <button onClick={() => navigate("/3d-buds")}>3d bud</button>
            <button onClick={() => navigate("/messages")}>Chat</button>
        </div>

      <h2>{today}</h2>

      <h3>Daily Goals</h3>
      <ul>
        {goals.map((goal, index) => (
          <li key={index}>
            <label>
              <input
                type="checkbox"
                checked={goal.completed}
                onChange={() => toggleGoal(index)}
              />
              {goal.text} ___pts
            </label>
          </li>
        ))}
      </ul>

      <button onClick={() => navigate("/saved-workouts")}>Saved Workouts</button>
      <button onClick={() => navigate("/find-gym")}>Find Gym Near Me</button>
      <nav>
        <button onClick={() => navigate("/map")}>Map</button>
        <button onClick={() => navigate("/profile")}>Profile</button>
        <button onClick={() => navigate("/")}>Home</button>
        <button onClick={() => navigate("/trophies")}>Trophies</button>
        <button onClick={() => navigate("/logout")}>Logout</button>
      </nav>
    </div>
  );
}
