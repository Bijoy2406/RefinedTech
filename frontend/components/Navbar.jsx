import { Link } from 'react-router-dom'
import '../css/Navbar.css'

export default function Navbar({ 
  user, 
  avatarUrl, 
  onLogout, 
  onOpenProfile 
}) {
  return (
    <nav className="nav theme-nav">
      <div className="links">
        {user ? (
          <>
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
