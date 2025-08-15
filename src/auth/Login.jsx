import { useState } from "react";
import { Link, useNavigate } from "react-router";

import { useAuth } from "./AuthContext";
import "../index.css";

/** A form that allows users to log into an existing account. */
export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [error, setError] = useState(null);

  const onLogin = async (formData) => {
    const username = formData.get("username");
    const password = formData.get("password");
    try {
      await login({ username, password });
      navigate("/home");
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <>
    <div className="front-page">
      <h1 className="auth-title">Log in to your account</h1>
      <form action={onLogin} className="auth-form">
        <label className="auth-label">
          Username
          <input type="username" name="username" required className="auth-input"/>
        </label>
        <label className="auth-label">
          Password
          <input type="password" name="password" required className="auth-input"/>
        </label>
        <button className="auth-button">Login</button>
        {error && <output className="auth-error">{error}</output>}
      </form>
      <Link to="/register" className="auth-link">Need an account? Register here.</Link>
      <Link to="/" className="go-back">Go back</Link>
    </div>
    </>
  );
}
