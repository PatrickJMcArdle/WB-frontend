import { useState } from "react";
import { Link, useNavigate } from "react-router";

import { useAuth } from "./AuthContext";
import "../index.css"

/** A form that allows users to register for a new account */
export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [error, setError] = useState(null);

  const onRegister = async (formData) => {
    const username = formData.get("username");
    const password = formData.get("password");
    const first_name = formData.get("first_name");
    try {
      await register({ username, first_name, password });
      navigate("/");
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <>
    <div className="front-page">
      <h1 className="auth-title">Register for an account</h1>
      <form action={onRegister} className="auth-form">
        <label className="auth-label">
          First Name
          <input type="text" name="first_name" required className="auth-input"/>
        </label>
        <label className="auth-label">
          Username
          <input type="text" name="username" required className="auth-input"/>
        </label>
        <label className="auth-label">
          Password
          <input type="password" name="password" required className="auth-input"/>
        </label>
        <button className="auth-button">Register</button>
        {error && <output>{error}</output>}
      </form>
      <Link to="/login" className="login-link">Already have an account? Log in here.</Link>
    </div>
    </>
  );
}
