import { useEffect, useState } from "react";

export default function Map() {
  const [gyms, setGyms] = useState([]);
  const [status, setStatus] = useState("");      // show API status

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const radius = 5000;

        const base = import.meta.env.VITE_API_URL || "";
        const url = `${base}/map/gyms/${lat}/${lng}/${radius}?t=${Date.now()}`;

        const res = await fetch(url, { cache: "no-store" });
        const data = await res.json();

        setStatus(data.status || "UNKNOWN");
        setGyms(data?.results ?? []);
      },
      (err) => {
        setStatus(`GEO_ERROR: ${err.message}`);
      }
    );
  }, []);

  return (
    <div>
      <h3>Gyms Near You</h3>
      <div style={{ marginBottom: 8 }}>Status: <b>{status}</b> — Results: <b>{gyms.length}</b></div>
      {gyms.length > 0 ? (
        <ul style={{ color: "white" }}>
          {gyms.map((g) => (
            <li key={g.place_id}>{g.name} — {g.vicinity}</li>
          ))}
        </ul>
      ) : (
        <div style={{ opacity: 0.8 }}>
          {status === "OK"
            ? "No gyms found in this radius. Try increasing it."
            : "Fetching… or no results yet."}
        </div>
      )}
    </div>
  );
}