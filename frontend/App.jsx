import { Routes, Route, Link, Navigate, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import axios from 'axios'
import { ThemeProvider } from './components/Theme.jsx'
import Home from './components/Home.jsx'
import Login from './components/Login.jsx'
import Signup from './components/Signup.jsx'
import Navbar from './components/Navbar.jsx'
import DemoHomePage_AfterLoginAsBuyer from './components/DemoHomePage_AfterLoginAsBuyer.jsx'
import './css/App.css'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://127.0.0.1:8000';

export default function App() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [showProfile, setShowProfile] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(null);

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
      setShowProfile(false);
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
      // Close profile modal if open
      setShowProfile(false);
      
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
    
    setShowProfile(true);
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

  const closeProfile = () => {
    setShowProfile(false);
  }

  return (
    <ThemeProvider>
      <div className="app-shell">
        <Navbar 
          user={user}
          avatarUrl={avatarUrl}
          onLogout={handleLogout}
          onOpenProfile={openProfile}
        />
        <main className="content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login onLogin={handleLogin} />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/signup/:role" element={<Signup />} />
            <Route path="/buyer-dashboard" element={<DemoHomePage_AfterLoginAsBuyer />} />
            {/* <Route path="/dashboard" element={user?.role === 'admin' ? <Dashboard /> : <Navigate to="/" />} /> */}
            {/* <Route path="/profile" element={user ? <Profile onClose={() => navigate(-1)} /> : <Navigate to="/login" />} /> */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
        <footer className="footer">© {new Date().getFullYear()} RefinedTech</footer>
        
        {/* Profile Modal */}
        {/* {showProfile && <Profile onClose={closeProfile} />} */}
      </div>
    </ThemeProvider>
  )
}