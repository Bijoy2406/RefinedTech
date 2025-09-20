import { Routes, Route, Link, Navigate, useNavigate } from 'react-router-dom'
import { useState, useEffect, createContext, useContext } from 'react'
import axios from 'axios'
import { ThemeProvider, useTheme } from './components/Theme.jsx'
import Home from './components/Home.jsx'
import Login from './components/Login.jsx'
import Signup from './components/Signup.jsx'
import AdminHomepage from './components/AdminHomepage.jsx'
import SellerHomepage from './components/SellerHomepage.jsx'
import BuyerHomepage from './components/BuyerHomepage.jsx'
import Cart from './components/Cart.jsx'
import Buy from './components/Buy.jsx'
import Profile from './components/Profile.jsx'
import ProductDetails from './components/ProductDetails.jsx'
import Wishlist from './components/Wishlist.jsx'
import Orders from './components/Orders.jsx'
import Conversations from './components/Conversations.jsx'
import Chatbot from './components/Chatbot.jsx'
import './css/App.css'

// API Base URL Configuration
const getApiBase = () => {
  // Production environment variable from Netlify
  if (import.meta.env.VITE_API_BASE) {
    return import.meta.env.VITE_API_BASE;
  }
  
  // Auto-detect based on hostname
  if (window.location.hostname === 'refinedtech.netlify.app') {
    return 'https://your-project-name.up.railway.app'; // Replace with your Railway URL
  }
  
  // Default to local development
  return 'http://127.0.0.1:8000';
};

const API_BASE = getApiBase();

// Create User Context
export const UserContext = createContext();

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
      <UserContext.Provider value={{ user, setUser, avatarUrl, setAvatarUrl }}>
        <div className="app-shell">
        <nav className="nav">
          <Link className="brand" to="/">
            <img
                src={theme === 'dark' ? '/logo_dark.png' : '/logo_light.png'}
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
                {user.role === 'Seller' && (
                  <>
                    <Link to="/seller" className="btn">Seller Dashboard</Link>
                    <Link to="/conversations" className="btn">💬 Messages</Link>
                  </>
                )}
                {user.role === 'Buyer' && (
                  <>
                    <Link to="/cart" className="btn">🛒 Cart</Link>
                    <Link to="/wishlist" className="btn">❤️ Wishlist</Link>
                    <Link to="/orders" className="btn">📦 Orders</Link>
                    <Link to="/conversations" className="btn">💬 Messages</Link>
                  </>
                )}
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
            <Route path="/" element={user?.role === 'Admin' ? <AdminHomepage /> : <Home user={user} />} />
            <Route path="/login" element={<Login onLogin={handleLogin} />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/signup/:role" element={<Signup />} />
            <Route path="/admin" element={user?.role === 'Admin' ? <AdminHomepage /> : <Navigate to="/" />} />
            <Route path="/seller" element={user?.role === 'Seller' ? <SellerHomepage /> : <Navigate to="/" />} />
            <Route path="/buyer" element={<BuyerHomepage />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/wishlist" element={<Wishlist />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/conversations" element={<Conversations />} />
            <Route path="/buy" element={<Buy />} />
            <Route path="/profile" element={user ? <Profile /> : <Navigate to="/login" />} />
            <Route path="/product/:id" element={<ProductDetails />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
        <footer className="footer">© {new Date().getFullYear()} RefinedTech</footer>
        
        {/* Chatbot - Available on all pages */}
        <Chatbot />
      </div>
      </UserContext.Provider>
    </ThemeProvider>
  )
}
