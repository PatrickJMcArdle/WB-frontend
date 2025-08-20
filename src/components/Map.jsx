// import React, { useEffect, useRef, useState } from "react";

// const Map = () => {
//   const mapRef = useRef(null);
//   const [mapReady, setMapReady] = useState(false);

//   useEffect(() => {
//     const checkGoogle = setInterval(() => {
//       console.log("Checking for google...", window.google);
//       if (window.google && window.googleMapsReady) {
//         setMapReady(true);
//         clearInterval(checkGoogle);
//       }
//     }, 500);

//     return () => clearInterval(checkGoogle);
//   }, []);

//   useEffect(() => {
//     if (mapReady) {
//       const map = new window.google.maps.Map(mapRef.current, {
//         center: { lat: 41.8781, lng: -87.6298 }, // Chicago
//         zoom: 14,
//       });

//       const service = new window.google.maps.places.PlacesService(map);

//       service.nearbySearch(
//         {
//           location: { lat: 41.8781, lng: -87.6298 },
//           radius: 2000,
//           type: "gym",
//         },
//         (results, status) => {
//           if (status === window.google.maps.places.PlacesServiceStatus.OK) {
//             results.forEach((place) => {
//               new window.google.maps.Marker({
//                 position: place.geometry.location,
//                 map,
//                 title: place.name,
//               });
//             });
//           } else {
//             console.error("PlacesService failed:", status);
//           }
//         }
//       );
//     }
//   }, [mapReady]);

//   return <div ref={mapRef} style={{ width: "100%", height: "500px" }} />;
// };

// export default Map;