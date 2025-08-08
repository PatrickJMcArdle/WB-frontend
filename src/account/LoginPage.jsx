import { Link } from "react-router";


export default function FrontPage() {
  
  return (
    <div>
      <Link to="/register">Create an Account</Link>
      <br />
      <Link to="/login">Login</Link>
      <br />
      <Link to="/home">View as Guest</Link>
    </div>
  )
}