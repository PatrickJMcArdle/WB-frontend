import { useNavigate, useParams } from "react-router";
import useQuery from "../api/useQuery";
import { useAuth } from "../auth/AuthContext";
import "../index.css"

export default function ProfilePage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { token } = useAuth();
  const {
    data: user,
    loading,
    error,
  } = useQuery(`/users/${id}`, ["users"])

  if (loading || !user) return <p>Loading...</p>
  if (error) return <p>Sorry! {error}</p>

  //gender is stored as num value, this converts it
  let gender = "N/A"
  if (user.gender === 0) {
    gender = "Male"
  } else if (user.gender === 1) {
    gender = "Female"
  } else if (user.gender === 2) {
    gender = "Other"
  }

  //convert birthday into mm/dd/yyyy format
  const birthday = new Date(user.birthday)
  const newBirthday = birthday.toLocaleString().split(",")[0]

  return (
    <>
      <div className="profile-page">
        <div className="profile-section">
          <h3>Account Info</h3>
          <button className="section-edit">Edit</button>
          <ul>
            <li>Account: {user.account_type}</li>
            <li>Username: {user.username}</li>
            <li>Name: {user.first_name}</li>
            <li>Gender: {gender} | Birthday: {newBirthday}</li>
          </ul>
        </div>
        <div className="profile-section">
          <h3>Fitness Info</h3>
          <button className="section-edit">Edit</button>
          <ul>
            <li>Level: {user.fitness_level}</li>
            <li>Goal: {user.fitness_goal}</li>
          </ul>
        </div>
        <div className="profile-bottom-buttons">
          <div className="settings-button" onClick={()=> navigate(`/settings/${id}`)}>
            <img src="/images/SettingsIcon.png" alt="Settings" />
          </div>
          <div className="home-button" onClick={() => navigate("/home")}>
            <img src="/images/HomeIcon.png" alt="Home" />
          </div>
        </div>
      </div>
    </>
  )
  // The settings button sends you to the settings page
  // The edit buttons will bring up a form where you can submit changes to username, name, gender, birthday for account info and fitness goal for fitness info
  // https://www.w3schools.com/howto/howto_js_popup_form.asp
}