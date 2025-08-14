import { useState } from "react"
import { useNavigate, useParams } from "react-router"
import useQuery from "../api/useQuery";
import useMutation from "../api/useMutation";

export default function SettingsPage(){
  const {toggleTheme, theme} = DarkMode()
  const {id} = useParams();
  const navigate = useNavigate();

  const [vis, setVis] = useState(true)
  const toggleVis = () => {
    setVis(!vis);
    visibility({public_profile: vis});
  }
  if (vis) {
    visStatus = "public"
  } else {
    visStatus = "private"
  }

  const {
    data: userSettings,
    loading: loadingSettings,
    error: settingsError,
  } = useQuery(`/settings/${id}`)

  const {
    mutate: visibility,
    loading: updatingVis,
    error: visError,
  } = useMutation("PUT", `/settings/${id}/public_profile`, ["settings"])

  return(
    <div className={theme}>
      <div>
        <h3>Account Visibility: {visStatus}</h3>
        <p>Toggle On/Off</p>
        <button onClick={() => {toggleVis()}}>Button</button>
      </div>
      <div>
        <h3>Location Services</h3>
        <p>Toggle On/Off</p>
        <button>Button</button>
      </div>
      <div>
        <h3>Notifications</h3>
        <p>Toggle On/Off</p>
        <button>Button</button>
      </div>
      <div>
        <h3>Theme</h3>
        <p>Dark mode/Light mode</p>
        <button
          id="toggle"
          className="dark_mode"
          aria-label="Toggle dark mode"
          onClick={()=> toggleTheme()}
        >
          {theme === "light" ? "moon" : "sun"}
        </button>
      </div>
      <div>
        <button onClick={navigate("/home")}>Home</button>
      </div>
    </div>
  )
}

export function DarkMode() {
  const [isDark, setIsDark] = useState(false)
  const theme = isDark ? "dark" : "light";
  const toggleTheme = () => setIsDark(!isDark)

  const value = {isDark, theme, toggleTheme}
  return value
}
// NEED MORE SETTINGS PROBABLY