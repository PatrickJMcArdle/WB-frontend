import { useEffect, useState } from "react";

export default function Map() {
  const [gyms, setGyms] = useState([]);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;
      const radius = 2000; // meters

      const res = await fetch(`/map/gyms/${lat}/${lng}/${radius}`);
      const data = await res.json();

      // The Google Places API sends an object with a `results` array
      setGyms(data.results);
    });
  }, []);
}