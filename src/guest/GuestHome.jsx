import '../index.css';

export default function GuestPage() {

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
  <div className="guest-home-page">
      <div className="top-buttons">
          <button>buddy</button>
          <button>Chat</button>
      </div>

    <h2>{today}</h2>

    <h3>Daily Goals</h3>
    <p>Here's where you'd see your goals for the day! These goals are chosen based on what you set for your Fitness Goal on your account.</p>

    <button>Saved Workouts</button>
    <button>Find Gym Near Me</button>
    <nav>
      <button>Map</button>
      <button>Profile</button>
      <button>Home</button>
      <button>Trophies</button>
      <button>Logout</button>
    </nav>
  </div>
  );
}