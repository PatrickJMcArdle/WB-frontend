/**
 * ApiContext attaches the user's auth token and provides a simple fetch helper.
 * Also supports a tiny tag system to re-run queries after mutations.
 */
import { createContext, useContext, useMemo, useState } from "react";
import { useAuth } from "../auth/AuthContext";

export const API = import.meta.env.VITE_API_URL; // e.g. http://localhost:3000/api

const ApiContext = createContext(null);

function joinUrl(base, path) {
  const b = (base || "").replace(/\/+$/, "");
  const p = (path || "").replace(/^\/+/, "");
  return `${b}/${p}`;
}

export function ApiProvider({ children }) {
  const { token } = useAuth();

  // Build headers when token changes (don’t hardcode Content-Type)
  const defaultHeaders = useMemo(() => {
    const h = {};
    if (token) h.Authorization = `Bearer ${token}`;
    return h;
  }, [token]);

  const request = async (resource, options = {}) => {
    const { method = "GET", body, headers, signal } = options;

    const finalHeaders = { ...defaultHeaders, ...headers };
    let payload = body;

    // Only set Content-Type + stringify if body is a plain object
    if (body && typeof body === "object" && !(body instanceof FormData)) {
      finalHeaders["Content-Type"] =
        finalHeaders["Content-Type"] || "application/json";
      payload = JSON.stringify(body);
    }

    const res = await fetch(joinUrl(API, resource), {
      method,
      headers: finalHeaders,
      body: payload,
      signal,
    });

    if (res.status === 204) return null;

    const ct = res.headers.get("Content-Type") || "";
    const isJson = ct.includes("application/json");
    const data = isJson ? await res.json() : await res.text();

    if (!res.ok) {
      const err = new Error(
        isJson ? data?.message || "Request failed" : data || res.statusText
      );
      err.status = res.status;
      err.data = data;
      throw err;
    }
    return data;
  };

  // tag system (object, not array)
  const [tags, setTags] = useState({});
  const provideTag = (tag, refetchFn) => {
    if (!tag || typeof refetchFn !== "function") return;
    setTags((t) => ({ ...t, [tag]: refetchFn }));
  };
  const invalidateTags = (tagsToInvalidate = []) => {
    (tagsToInvalidate || []).forEach((tag) => tags[tag]?.());
  };

  return (
    <ApiContext.Provider value={{ request, provideTag, invalidateTags }}>
      {children}
    </ApiContext.Provider>
  );
}

export function useApi() {
  const ctx = useContext(ApiContext);
  if (!ctx) throw new Error("useApi must be used within a ApiProvider");
  return ctx;
}
