import { Route, Routes } from "react-router";
import Layout from "./layout/Layout";
import Login from "./auth/Login";
import Register from "./auth/Register";
import HomePage from "./home/HomePage";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/profile" element={<div>Profile Page</div>} />
        
        <Route path="/saved-workouts" element={<div>Saved Workouts</div>} />
        <Route path="/map" element={<div>Map</div>} />
        <Route path="/trophies" element={<div>Trophies</div>} />
        <Route path="/find-gym" element={<div>Find Gym Near Me</div>} />
        <Route path="/logout" element={<div>Logout</div>} />
        <Route path="/messages" element={<div>Messages</div>} />
        <Route path="/3d-buds" element={<div>3D Buds</div>} />
      </Route>
    </Routes>
  );
}
