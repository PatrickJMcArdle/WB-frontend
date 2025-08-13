import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { API } from "../api/ApiContext";

const AuthContext = createContext();

function parseJwt(token) {
  try {
    const base64 = token.split(".")[1];
    return JSON.parse(atob(base64));
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  console.log("[AuthContext] API base URL:", API); // ✅ log 1 — make sure it’s correct

  const [token, setToken] = useState(
    () => sessionStorage.getItem("token") || null
  );

  const [user, setUser] = useState(() => {
    const t = sessionStorage.getItem("token");
    if (!t) return null;
    const payload = parseJwt(t);
    console.log("[AuthContext] Initial parsed JWT:", payload); // ✅ log 2 — startup
    return payload
      ? { id: payload.id, account_type: payload.account_type ?? 0 }
      : null;
  });

  useEffect(() => {
    if (token) {
      sessionStorage.setItem("token", token);
      const payload = parseJwt(token);
      console.log("[AuthContext] Parsed JWT on token change:", payload); // ✅ log 3 — after login/register
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

  const register = async (credentials) => {
    const res = await fetch(API + "/users/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    });
    const text = await res.text();
    if (!res.ok) throw Error(text);
    setToken(text);
  };

  const login = async (credentials) => {
    const res = await fetch(API + "/users/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    });
    const text = await res.text();
    if (!res.ok) throw Error(text);
    setToken(text);
  };

  const logout = () => {
    setToken(null);
  };

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
