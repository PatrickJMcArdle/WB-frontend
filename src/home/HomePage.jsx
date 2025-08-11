import { useNavigate } from "react-router";
import { useState } from "react";
import '../index.css';
import useQuery from "../api/useQuery";

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

  const {
    data: user,
    loading,
    error,
  } = useQuery("/home/user", "user")
  
  if (loading || !user) return <p>Loading...</p>
  if (error) return <p>Sorry! {error}</p>

  return (
    <div className="home-page">
        <div className="top-buttons">
            <button>buddy</button>
            <button>Chat</button>
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

      <button>Saved Workouts</button>
      <button>Find Gym Near Me</button>
      <nav>
        <button>Map</button>
        <button onClick={() => navigate(`/profile/${user.id}`)}>Profile</button>
        <button onClick={() => navigate("/home")}>Home</button>
        <button>Trophies</button>
        <button>Logout</button>
      </nav>
    </div>
  );
}
