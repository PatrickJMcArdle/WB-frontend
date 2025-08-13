import { Link } from "react-router";
import "../index.css";


export default function FrontPage() {
  
  return (
    <div className="front-page">
      <h1>Workout Buddy</h1>
      <h3>Ultimate Fitness Friend</h3>
      <Link to="/register" className="front-link">Create an Account</Link>
      <br />
      <Link to="/login" className="front-link">Login</Link>
      <br />
      <Link to="/guest" className="front-link">View as Guest</Link>
    </div>
  )
}