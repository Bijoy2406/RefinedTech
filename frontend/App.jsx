import { Routes, Route, Link, Navigate, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Home from './components/Home.jsx'
import Login from './components/Login.jsx'
import Signup from './components/Signup.jsx'
import Dashboard from './components/Dashboard.jsx'
import './css/App.css'

export default function App() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    const storedUser = localStorage.getItem('rt_user')
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }

    const storedTheme = localStorage.getItem('rt_theme') || 'light';
    setTheme(storedTheme);
    document.body.className = storedTheme === 'dark' ? 'dark-mode' : '';
  }, [])

  const handleLogin = (loggedInUser) => {
    setUser(loggedInUser)
  }

  const handleLogout = () => {
    localStorage.removeItem('rt_user')
    localStorage.removeItem('rt_token')
    setUser(null)
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
      </main>
      <footer className="footer">© {new Date().getFullYear()} RefinedTech</footer>
    </div>
  )
}