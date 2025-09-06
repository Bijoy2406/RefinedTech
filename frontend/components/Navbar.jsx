import { Link } from 'react-router-dom'
import { ThemeToggle, ThemeLogo, AdvancedThemeToggle } from './Theme.jsx'
import '../css/Navbar.css'

export default function Navbar({ 
  user, 
  avatarUrl, 
  onLogout, 
  onOpenProfile,
  variant = 'default' // 'default', 'advanced'
}) {
  return (
    <nav className="nav theme-nav navbar-fade-in">
      <Link className="brand" to={user ? "/buyer-dashboard" : "/"}>
        <ThemeLogo 
          lightSrc="/Assets/logo_light.png"
          darkSrc="/Assets/logo_dark.png"
          alt="RefinedTech"
          className="brand-logo"
        />
      </Link>
      
      <div className="links">
        {/* Theme Toggle - Choose variant */}
        {variant === 'advanced' ? (
          <AdvancedThemeToggle />
        ) : (
          <ThemeToggle />
        )}
        
        {user ? (
          <>
            {/* Admin Dashboard Link */}
            {user.role === 'admin' && (
              <Link to="/dashboard" className="btn">
                📊 Dashboard
              </Link>
            )}
            
            {/* Profile Button */}
            {onOpenProfile && (
              <button onClick={onOpenProfile} className="avatar-plain" title="Profile">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="avatar" className="nav-avatar" />
                ) : (
                  <span className="nav-avatar placeholder">
                    {(user.name || '?').charAt(0).toUpperCase()}
                  </span>
                )}
              </button>
            )}
            
            {/* Logout Button */}
            <button onClick={onLogout} className="btn outline">
              🚪 Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="btn">
              🔑 Login
            </Link>
            <Link to="/signup" className="btn outline">
              ✨ Sign Up
            </Link>
          </>
        )}
      </div>
    </nav>
  )
}
