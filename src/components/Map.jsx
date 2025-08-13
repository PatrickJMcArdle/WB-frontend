import { useEffect, useState } from "react";

export default function Map() {
  const [gyms, setGyms] = useState([]);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;
      const radius = 2000; 

      const res = await fetch(`/map/gyms/${lat}/${lng}/${radius}`);
      const data = await res.json();

      console.log(data); 
      console.log(data.results);

      setGyms(data.results);
    });
  }, []);
}