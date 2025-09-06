import { Routes, Route, Link, Navigate, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import axios from 'axios'
import { ThemeProvider, useTheme } from './components/Theme.jsx'
import Home from './components/Home.jsx'
import Login from './components/Login.jsx'
import Signup from './components/Signup.jsx'
import Dashboard from './components/Dashboard.jsx'
import AdminHomepage from './components/AdminHomepage.jsx'
import SellerHomepage from './components/SellerHomepage.jsx'
import BuyerHomepage from './components/BuyerHomepage.jsx'
import Profile from './components/Profile.jsx'
import ProductDetails from './components/ProductDetails.jsx'
import './css/App.css'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://127.0.0.1:8000';

export default function App() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [avatarUrl, setAvatarUrl] = useState(null);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const storedUser = localStorage.getItem('rt_user')
    const storedToken = localStorage.getItem('rt_token')
    
    if (storedUser && storedToken) {
      const userData = JSON.parse(storedUser);
      setUser(userData);
  // Attempt to hydrate avatar asynchronously
  fetchUserAndAvatar(storedToken);
    }

    // Listen for profile updates
    const handleStorageChange = (e) => {
      if (e.key === 'rt_user' && e.newValue) {
        const userData = JSON.parse(e.newValue);
        setUser(userData);
      }
    };

    // Listen for authentication failures
    const handleAuthFailure = () => {
      setUser(null);
      navigate('/login');
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('auth-failed', handleAuthFailure);
    // Listen for direct profile image updates (from Profile modal)
    const handleProfileImageUpdated = (e) => {
      const newUrl = e.detail?.url;
      if (newUrl) setAvatarUrl(newUrl + '&localBust=' + Date.now());
    };
    window.addEventListener('profile-image-updated', handleProfileImageUpdated);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('auth-failed', handleAuthFailure);
  window.removeEventListener('profile-image-updated', handleProfileImageUpdated);
    };
  }, [])

  const handleLogin = (loggedInUser) => {
    setUser(loggedInUser);
  const token = localStorage.getItem('rt_token');
  if (token) fetchUserAndAvatar(token);
  }

  const handleLogout = async () => {
    try {      
      const token = localStorage.getItem('rt_token');
      if (token) {
        // Call backend logout to revoke token
        await axios.post(`${API_BASE}/api/logout`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
    } catch (error) {
      console.error('Logout API call failed:', error);
      // Continue with logout even if API call fails
    } finally {
      // Clear local storage and state
      localStorage.removeItem('rt_user')
      localStorage.removeItem('rt_token')
      setUser(null)
      setAvatarUrl(null)
      navigate('/login')
    }
  }

  const openProfile = () => {
    const token = localStorage.getItem('rt_token');
    const user = localStorage.getItem('rt_user');
    
    if (!token || !user) {
      console.log('No valid authentication found, redirecting to login');
      handleLogout();
      return;
    }
    
    navigate('/profile');
  }

  // Fetch user (authoritative) to refresh avatar URL
  const fetchUserAndAvatar = async (token) => {
    try {
      const { data } = await axios.get(`${API_BASE}/api/user`, { headers: { Authorization: `Bearer ${token}` } });
      if (data?.user) {
        setUser(prev => ({ ...prev, ...data.user }));
        if (data.profile_image_url) {
          const bust = `${data.profile_image_url}?t=${Date.now()}`;
          setAvatarUrl(bust);
        } else {
          setAvatarUrl(null);
        }
      }
    } catch (e) {
      console.warn('Failed to refresh avatar', e?.response?.status);
    }
  }

  return (
    <ThemeProvider>
      <div className="app-shell">
      <nav className="nav">
        <Link className="brand" to="/">
          <img 
            src={theme === 'dark' ? '/Assets/logo_dark.png' : '/Assets/logo_light.png'} 
            alt="RefinedTech" 
            className="brand-logo" 
          />
        </Link>
        <div className="links">
          <button onClick={toggleTheme} className="btn theme-toggle">
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
          {user ? (
            <>
              {user.role === 'Admin' && <Link to="/admin" className="btn">Admin Home</Link>}
              {user.role === 'Admin' && <Link to="/dashboard" className="btn">Admin Dashboard</Link>}
              {user.role === 'Seller' && <Link to="/seller" className="btn">Seller Dashboard</Link>}
              {user.role === 'Buyer' && <Link to="/buyer" className="btn">Browse Products</Link>}
              <button onClick={openProfile} className="avatar-plain" title="Profile">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="avatar" className="nav-avatar" />
                ) : (
                  <span className="nav-avatar placeholder">{(user.name||'?').charAt(0).toUpperCase()}</span>
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
          <Route path="/" element={<Home user={user} />} />
          <Route path="/login" element={<Login onLogin={handleLogin} />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/signup/:role" element={<Signup />} />
          <Route path="/admin" element={user?.role === 'Admin' ? <AdminHomepage /> : <Navigate to="/" />} />
          <Route path="/dashboard" element={user?.role === 'Admin' ? <Dashboard /> : <Navigate to="/" />} />
          <Route path="/seller" element={user?.role === 'Seller' ? <SellerHomepage /> : <Navigate to="/" />} />
          <Route path="/buyer" element={user?.role === 'Buyer' ? <BuyerHomepage /> : <Navigate to="/" />} />
          <Route path="/profile" element={user ? <Profile /> : <Navigate to="/login" />} />
          <Route path="/product/:id" element={<ProductDetails />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
      <footer className="footer">© {new Date().getFullYear()} RefinedTech</footer>
    </div>
    </ThemeProvider>
  )
}