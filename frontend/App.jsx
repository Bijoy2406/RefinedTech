import { Routes, Route, Link, Navigate, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import axios from 'axios'
import Home from './components/Home.jsx'
import Login from './components/Login.jsx'
import Signup from './components/Signup.jsx'
import Dashboard from './components/Dashboard.jsx'
import Profile from './components/Profile.jsx'
import './css/App.css'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://127.0.0.1:8000';

export default function App() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [theme, setTheme] = useState('light');
  const [showProfile, setShowProfile] = useState(false);
  const [userProfilePicture, setUserProfilePicture] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('rt_user')
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      setUser(userData);
      // Fetch profile picture separately if user is logged in
      fetchProfilePicture();
    }

    const storedTheme = localStorage.getItem('rt_theme') || 'light';
    setTheme(storedTheme);
    document.body.className = storedTheme === 'dark' ? 'dark-mode' : '';

    // Listen for profile updates
    const handleStorageChange = (e) => {
      if (e.key === 'rt_user' && e.newValue) {
        const userData = JSON.parse(e.newValue);
        setUser(userData);
        // Refresh profile picture when user data changes
        fetchProfilePicture();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [])

  const fetchProfilePicture = async () => {
    try {
      const token = localStorage.getItem('rt_token');
      if (token) {
        const response = await axios.get(`${API_BASE}/api/profile/picture`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUserProfilePicture(response.data.profile_picture);
      }
    } catch (error) {
      console.error('Error fetching profile picture:', error);
      setUserProfilePicture(null);
    }
  };

  const handleLogin = (loggedInUser) => {
    setUser(loggedInUser);
    // Fetch profile picture after login
    setTimeout(() => {
      fetchProfilePicture();
    }, 100);
  }

  const handleProfileUpdate = (updatedUser) => {
    setUser(updatedUser);
    // Update profile picture if it's in the updated user data
    if (updatedUser.profile_picture !== undefined) {
      setUserProfilePicture(updatedUser.profile_picture);
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('rt_user')
    localStorage.removeItem('rt_token')
    setUser(null)
    setUserProfilePicture(null)
    navigate('/login')
  }

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('rt_theme', newTheme);
    document.body.className = newTheme === 'dark' ? 'dark-mode' : '';
  }

  return (
    <div className="app-shell">
      <nav className="nav">
        <Link className="brand" to="/">RefinedTech</Link>
        <div className="links">
          <button onClick={toggleTheme} className="btn theme-toggle">
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
          {user ? (
            <>
              {user.role === 'admin' && <Link to="/dashboard" className="btn">Dashboard</Link>}
              <button onClick={() => setShowProfile(true)} className="btn profile-btn">
                {userProfilePicture ? (
                  <img src={userProfilePicture} alt="Profile" className="nav-profile-pic" />
                ) : (
                  <span>👤</span>
                )}
              </button>
              <button onClick={handleLogout} className="btn outline">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn">Login</Link>
              <Link to="/signup" className="btn outline">Sign Up</Link>
            </>
          )}
        </div>
      </nav>
      <main className="content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login onLogin={handleLogin} />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/dashboard" element={user?.role === 'admin' ? <Dashboard /> : <Navigate to="/" />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
        {showProfile && <Profile onClose={() => setShowProfile(false)} onProfileUpdate={handleProfileUpdate} />}
      </main>
      <footer className="footer">© {new Date().getFullYear()} RefinedTech</footer>
    </div>
  )
}