import '../index.css';
import { useNavigate } from 'react-router';

export default function GuestPage() {
  const navigate = useNavigate();
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
  <div className="guest-home-page">
      <div className="top-buttons">
          <button>buddy</button>
          <div className="icon-message">
          <img src="/images/MessagingIcon.png" alt="Messages" />
        </div>
      </div>

    <h2>{today}</h2>

    <h3>Daily Goals</h3>
    <p>Here's where you'd see your goals for the day! These goals are chosen based on what you set for your Fitness Goal on your account.</p>

     <button className="saved-btn">Saved Workouts</button>
      <button className="gym-btn">Find Gym Near Me</button>
    
    <nav className="nav-icon">
        <div className="nav-button">
          <div className="nav-item">
            <img src="/images/MapIcon.png" alt="Map" />
            <span>Map</span>
          </div>
        </div>

        <div className="nav-button">
          <div className="nav-item">
            <img src="/images/ProfileIcon.png" alt="Profile" />
            <span>Profile</span>
          </div>
        </div>

        <div className="nav-button">
          <div className="nav-item">
            <img src="/images/HomeIcon.png" alt="Home" />
            <span>Home</span>
          </div>
        </div>

        <div className="nav-button">
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