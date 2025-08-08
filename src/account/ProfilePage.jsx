import { useParams } from "react-router";
import useQuery from "../api/useQuery";
import { useAuth } from "../auth/AuthContext";

export default function ProfilePage() {
  const { id } = useParams()
  const { token } = useAuth();
  const {
    data: user,
    loading,
    error,
  } = useQuery(`/users/${id}`, ["users"])

  if (loading || !user) return <p>Loading...</p>
  if (error) return <p>Sorry! {error}</p>

  return (
    <>
      <div>
        <div>
          <h3>Account Info</h3>
          <button>Edit</button>
          <ul>
            <li>Account: {user.account_type}</li>
            <li>Username: {user.username}</li>
            <li>Name: {user.first_name}</li>
            <li>{user.gender} | {user.birthday}</li>
          </ul>
        </div>
        <div>
          <h3>Fitness Info</h3>
          <button>Edit</button>
          <ul>
            <li>Level: {user.fitness_level}</li>
            <li>Goal: {user.fitness_goal}</li>
          </ul>
        </div>
        <button>Settings</button>
      </div>
    </>
  )
  // The settings button sends you to the settings page
  // The edit buttons will bring up a form where you can submit changes to username, name, gender, birthday for account info and fitness goal for fitness info
  // API route is correct as far as I can tell but double check that it actually loads the requested info once back end is done
  // Make sure the user ID is properly sent into the function. Not sure that's currently handled correctly
}