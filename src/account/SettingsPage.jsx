import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router"
import useQuery from "../api/useQuery";
import "../index.css"
import useMutation from "../api/useMutation";
import { useTheme } from "../ThemeProvider";

export default function SettingsPage(){
  // const {toggleThemeCSS, theme} = DarkMode()
  const {id} = useParams();
  const navigate = useNavigate();
  const [vis, setVis] = useState(true)
  const [loc, setLoc] = useState(true)
  const [notif, setNotif] = useState(true)
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "D";

  // fetch the users settings data
  const {
    data: userSettings,
    loading: loadingSettings,
    error: settingsError,
  } = useQuery(`/settings/${id}`)
  
  // set all the vairables to the specific users settings
  useEffect(() => {
    if (userSettings?.public_profile !== undefined) {
      setVis(userSettings.public_profile)
    }
  }, [userSettings])

  useEffect(() => {
    if (userSettings?.location_sharing !== undefined) {
      setLoc(userSettings.location_sharing)
    }
  }, [userSettings])

  useEffect(() => {
    if(userSettings?.notifications !== undefined) {
      setNotif(userSettings.notifications)
    }
  }, [userSettings])

  useEffect(() => {
    if (userSettings?.theme !== undefined) {
      toggleTheme(userSettings.theme)
    }
  }, [userSettings])

  // change account visibility 
  const {
    mutate: visibility,
    loading: updatingVis,
    error: visError,
  } = useMutation("PUT", `/settings/${id}/public_profile`, ["settings"])

  const toggleVis = (event) => {
    const isChecked = event.target.checked  
    setVis(isChecked);
    visibility({ public_profile: isChecked });
  }
  const visStatus = vis ? "Public" : "Private";

  // change location sharing 
  const {
    mutate: locSharing,
    loading: updatingLoc,
    error: locError,
  } = useMutation("PUT", `/settings/${id}/location_sharing`, ["settings"])

  const toggleLoc = (event) => {
    const isChecked = event.target.checked
    setLoc(isChecked);
    locSharing({ location_sharing: isChecked})
  }
  const locStatus = loc ? "Yes" : "Do not share";

  // change notifications 
  const {
    mutate: notifications,
    loading: updatingNotif,
    error: notifError,
  } = useMutation("PUT", `/settings/${id}/notifications`, ["settings"])

  const toggleNotif = (event) => {
    const isChecked = event.target.checked
    setNotif(isChecked);
    notifications({ notifications: isChecked })
  }
  const notifStatus = notif ? "On" : "Off";

  // change theme
  const {
    mutate: themeMode,
    loading: updatingTheme,
    error: themeError,
  } = useMutation("PUT", `/settings/${id}/theme`, ["settings"])
  
  const changeTheme = (event) => {
    const isChecked = event.target.checked
    const newTheme = isChecked ? "D" : "L"

    toggleTheme(newTheme);
    themeMode({ theme: newTheme })
  }
  const themeStatus = theme==="L" ? "Light Mode" : "Dark Mode"

  // loading and error handlers for all the mutation/query hooks
  const loading = loadingSettings || updatingVis || updatingLoc || updatingNotif || updatingTheme;
  const error = settingsError || visError || locError || notifError || themeError;

  if (loading || !id) return <p>Loading...</p>
  if (error) return <p>Sorry! {error}</p>

  return(
    <div className="settings-page">
      <div className="settings-section">
        <h3>Account Visibility</h3>
        <p>{visStatus}</p>
        <label className="section-edit switch">
          <input
            type="checkbox"
            checked={vis}
            onChange={(event) => {toggleVis(event)}}
          />
          <span className="slider round"></span>
        </label>
      </div>
      <div className="settings-section">
        <h3>Can we use your location?</h3>
        <p>{locStatus}</p>
        <label className="section-edit switch">
          <input
            type="checkbox"
            checked={loc}
            onChange={(event) => {toggleLoc(event)}}
          />
          <span className="slider round"></span>
        </label>
      </div>
      <div className="settings-section">
        <h3>Notifications</h3>
        <p>{notifStatus}</p>
        <label className="section-edit switch">
          <input
            type="checkbox"
            checked={notif}
            onChange={(event) => {toggleNotif(event)}}
          />
          <span className="slider round"></span>
        </label>
      </div>
      <div className="settings-section">
        <h3>Theme</h3>
        <p>{themeStatus}</p>
        <label className="section-edit switch">
        <input
            id="toggle"
            type="checkbox"
            checked={isDark}
            onChange={(event) => {changeTheme(event)}}
        />
          <span className="slider round"></span>
        </label>
      </div>
      <div className="settings-bottom-buttons">
        <div className="home-button" onClick={() => navigate("/home")}>
            <img src="/images/HomeIcon.png" alt="Home" />
          </div>
      </div>
    </div>
  )
}

export function useDarkMode() {
  const [isDark, setIsDark] = useState(false)
  const theme = isDark ? "dark" : "light";
  const toggleThemeCSS = (event) => {
    const isChecked = event.target.checked
    setIsDark(isChecked)
  }
  console.log(theme);
  

  return { isDark, theme, toggleThemeCSS }
}
// NEED MORE SETTINGS PROBABLY