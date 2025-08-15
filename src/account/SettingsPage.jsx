import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router"
import useQuery from "../api/useQuery";
import useMutation from "../api/useMutation";

export default function SettingsPage(){
  const {toggleThemeCSS, theme} = DarkMode()
  const {id} = useParams();
  const navigate = useNavigate();
  const [vis, setVis] = useState(null)
  const [loc, setLoc] = useState(null)
  const [notif, setNotif] = useState(null)
  const [darkLight, setDarkLight] = useState("")

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
      setDarkLight(userSettings.theme)
    }
  }, [userSettings])

  // change account visibility 
  const {
    mutate: visibility,
    loading: updatingVis,
    error: visError,
  } = useMutation("PUT", `/settings/${id}/public_profile`, ["settings"])

  const toggleVis = () => {
    const newVis = !vis
    setVis(newVis);
    visibility({ public_profile: newVis });
  }
  const visStatus = vis ? "public" : "private";

  // change location sharing 
  const {
    mutate: locSharing,
    loading: updatingLoc,
    error: locError,
  } = useMutation("PUT", `/settings/${id}/location_sharing`, ["settings"])

  const toggleLoc = () => {
    const newLoc = !loc
    setLoc(newLoc);
    locSharing({ location_sharing: newLoc})
  }
  const locStatus = loc ? "Yes" : "Do not share";

  // change notifications 
  const {
    mutate: notifications,
    loading: updatingNotif,
    error: notifError,
  } = useMutation("PUT", `/settings/${id}/notifications`, ["settings"])

  const toggleNotif = () => {
    const newNotif = !notif
    setNotif(newNotif);
    notifications({ notifications: newNotif })
  }
  const notifStatus = notif ? "On" : "Off";

  // change theme
  const {
    mutate: themeMode,
    loading: updatingTheme,
    error: themeError,
  } = useMutation("PUT", `/settings/${id}/theme`, ["settings"])
  
  const toggleThemeSQL = () => {
    const newDarkLight = darkLight==="L" ? "D" : "L"
    setDarkLight(newDarkLight);
    themeMode({ theme: newDarkLight })
  }
  const themeStatus = darkLight==="L" ? "Light Mode" : "Dark Mode"

  // loading and error handlers for all the mutation/query hooks
  const loading = loadingSettings || updatingVis || updatingLoc || updatingNotif || updatingTheme;
  const error = settingsError || visError || locError || notifError || themeError;

  if (loading || !id) return <p>Loading...</p>
  if (error) return <p>Sorry! {error}</p>

  return(
    <div className={theme}>
      <div>
        <h3>Account Visibility</h3>
        <p>{visStatus}</p>
        <button onClick={() => {toggleVis()}}>Button</button>
      </div>
      <div>
        <h3>Can we use your location?</h3>
        <p>{locStatus}</p>
        <button onClick={() => {toggleLoc()}}>Button</button>
      </div>
      <div>
        <h3>Notifications</h3>
        <p>{notifStatus}</p>
        <button onClick={() => {toggleNotif()}}>Button</button>
      </div>
      <div>
        <h3>Theme</h3>
        <p>{themeStatus}</p>
        <button
          id="toggle"
          className="dark_mode"
          aria-label="Toggle dark mode"
          onClick={()=> {toggleThemeCSS(); toggleThemeSQL();}}
        >
          {theme === "light" ? "moon" : "sun"}
        </button>
      </div>
      <div>
        <button onClick={() => {navigate("/home")}}>Home</button>
      </div>
    </div>
  )
}

export function DarkMode() {
  const [isDark, setIsDark] = useState(false)
  const theme = isDark ? "dark" : "light";
  const toggleThemeCSS = () => setIsDark(!isDark)

  const value = {isDark, theme, toggleThemeCSS}
  return value
}
// NEED MORE SETTINGS PROBABLY