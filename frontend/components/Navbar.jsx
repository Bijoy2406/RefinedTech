import { Link } from 'react-router-dom'
import { ThemeToggle, ThemeLogo } from './Theme.jsx'
import '../css/Navbar.css'

export default function Navbar({ 
  user, 
  avatarUrl, 
  onLogout, 
  onOpenProfile 
}) {
  return (
    <nav className="nav theme-nav">
      <Link className="brand" to={user ? "/buyer-dashboard" : "/"}>
        <ThemeLogo 
          lightSrc="/logo_light.png"
          darkSrc="/logo_dark.png"
          alt="RefinedTech"
          className="brand-logo"
        />
      </Link>
      <div className="links">
        <ThemeToggle />
        {user ? (
          <>
            {/* {user.role === 'admin' && <Link to="/dashboard" className="btn">Dashboard</Link>} */}
            {/* <button onClick={onOpenProfile} className="avatar-plain" title="Profile">
              {avatarUrl ? (
                <img src={avatarUrl} alt="avatar" className="nav-avatar" />
              ) : (
                <span className="nav-avatar placeholder">{(user.name||'?').charAt(0).toUpperCase()}</span>
              )}
            </button> */}
            <button onClick={onLogout} className="btn outline">Logout</button>
          </>
        ) : (
          <>
            <Link to="/login" className="btn">Login</Link>
            <Link to="/signup" className="btn outline">Sign Up</Link>
          </>
        )}
      </div>
    </nav>
  )
}
