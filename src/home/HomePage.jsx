import { useNavigate } from "react-router";
import { useState } from "react";
import "../index.css";
import useQuery from "../api/useQuery";
import Map from "../components/map";

export default function HomePage() {
  const navigate = useNavigate();

  const [showMap, setShowMap] = useState(false);
  console.log("Show map:", showMap);

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

  const { data: user, loading, error } = useQuery("/home/user", "user");

  if (loading || !user) return <p>Loading...</p>;
  if (error) return <p>Sorry! {error}</p>;

  return (
    <div className="home-page">
      <div className="top-buttons">
        <div onClick={() => {navigate("/buddy")}}>buddy</div>
        <div className="icon-message">
          <img src="/images/MessagingIcon.png" alt="Messages" />
        </div>
      </div>

      <h2>{today}</h2>

      <h3>Daily Goals</h3>
      <ul>
        {goals.map((goal, index) => (
          <li key={index}>
            <label className="goal-item">
              <input
                type="checkbox"
                className="goal-checkbox"
                checked={goal.completed}
                onChange={() => toggleGoal(index)}
              />
              <div className="goal-content">
                <span className="goal-name">{goal.text}</span>
                <span className="goal-points">___pts</span>
              </div>
            </label>
          </li>
        ))}
      </ul>

      <button className="saved-btn">Saved Workouts</button>
      <button className="gym-btn" onClick={() => setShowMap(true)}>
        Find Gym Near Me
      </button>
      {showMap && <Map />}

      <nav className="nav-icon">
        <div className="nav-button" onClick={() => navigate("/map")}>
            <div className="nav-item">
                <img src="/images/MapIcon.png" alt="Map" />
                <span>Map</span>
            </div>
        </div>

        <div
          className="nav-button"
          onClick={() => navigate(`/profile/${user.id}`)}
        >
          <div className="nav-item">
            <img src="/images/ProfileIcon.png" alt="Profile" />
            <span>Profile</span>
          </div>
        </div>

        <div className="nav-button" onClick={() => navigate("/home")}>
          <div className="nav-item">
            <img src="/images/HomeIcon.png" alt="Home" />
            <span>Home</span>
          </div>
        </div>

        <div className="nav-button" onClick={() => navigate("/find")}>
          <div className="nav-item">
            <img src="/images/MagnifyingGlassIcon.png" alt="Find" />
            <span>Find</span>
          </div>
        </div>

        <div className="nav-button" onClick={() => navigate("/")}>
          <div className="nav-item">
            <img src="/images/LogoutIcon.png" alt="Logout" />
            <span>Logout</span>
          </div>
        </div>
      </nav>
    </div>
  );
}
