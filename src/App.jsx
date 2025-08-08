import { Routes, Route } from "react-router-dom";
import Layout from "./layout/Layout";
import ProtectedRoute from "./components/ProtectedRoute";

import Login from "./auth/Login";
import Register from "./auth/Register";
import HomePage from "./home/HomePage";
import SettingsPage from "./pages/SettingsPage";
import FindMatchPage from "./pages/FindMatchPage";
import MyBuddyPage from "./pages/MyBuddyPage";
import MapPage from "./pages/MapPage";
import AdminPage from "./pages/AdminPage";
import ProfilePage from "./account/ProfilePage";
import FrontPage from "./account/LoginPage";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<FrontPage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/find" element={<FindMatchPage />} />
          <Route path="/buddy" element={<MyBuddyPage />} />
          <Route path="/map" element={<MapPage />} />
          <Route path="/admin" element={<AdminPage />} />
        </Route>
      </Route>
    </Routes>
  );
}
