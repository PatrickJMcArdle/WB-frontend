// src/auth/AuthContext.jsx
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { API } from "../api/ApiContext";

const AuthContext = createContext();

// NEW: tiny helper to decode JWT payload and read { id, account_type }
function parseJwt(token) {
  try {
    const base64 = token.split(".")[1];
    return JSON.parse(atob(base64)); // ok for simple client payloads
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  // keep your sessionStorage persistence
  const [token, setToken] = useState(
    () => sessionStorage.getItem("token") || null
  );

  // NEW: derive a user object from the token (id + account_type)
  const [user, setUser] = useState(() => {
    const t = sessionStorage.getItem("token");
    if (!t) return null;
    const payload = parseJwt(t);
    return payload
      ? { id: payload.id, account_type: payload.account_type ?? 0 }
      : null;
  });

  // keep token in sessionStorage; also (NEW) keep user in state when token changes
  useEffect(() => {
    if (token) {
      sessionStorage.setItem("token", token);
      const payload = parseJwt(token);
      setUser(
        payload
          ? { id: payload.id, account_type: payload.account_type ?? 0 }
          : null
      );
    } else {
      sessionStorage.removeItem("token");
      setUser(null);
    }
  }, [token]);

  // unchanged: register returns a token (string)
  const register = async (credentials) => {
    const res = await fetch(API + "/users/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    });
    const text = await res.text();
    if (!res.ok) throw Error(text);
    setToken(text); // user will be derived in the effect above
  };

  // unchanged path, but now we also derive user from token
  const login = async (credentials) => {
    const res = await fetch(API + "/users/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    });
    const text = await res.text();
    if (!res.ok) throw Error(text);
    setToken(text); // user will be derived in the effect above
  };

  const logout = () => {
    setToken(null); // effect clears user + storage
  };

  // expose user + token
  const value = useMemo(
    () => ({ token, user, register, login, logout }),
    [token, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw Error("useAuth must be used within an AuthProvider");
  return context;
}
