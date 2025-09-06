import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import axios from 'axios'
import LottieLoading from './LottieLoading'
import '../css/Login.css'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://127.0.0.1:8000'

export default function Login({ onLogin }) {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [status, setStatus] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setStatus(null)
    try {
      const { data } = await axios.post(`${API_BASE}/api/login`, { email, password })
      setStatus({ type: 'success', message: data.message || 'Login successful!' })
      localStorage.setItem('rt_user', JSON.stringify(data.user || {}))
      localStorage.setItem('rt_token', data.token || '')
      onLogin(data.user)
      
      // Delay redirect for better UX
      setTimeout(() => {
        // Redirect based on user role
        if (data.user && data.user.role === 'Admin') {
          navigate('/admin')
        } else if (data.user && data.user.role === 'Seller') {
          navigate('/seller')
        } else {
          navigate('/')
        }
      }, 1000)
    } catch (err) {
      setStatus({ 
        type: 'error', 
        message: err.response?.data?.error || 'Login failed. Please check your credentials.' 
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      {isLoading && <LottieLoading message="Logging you in..." />}
      
      <div className="login-container">
        {/* Background Elements */}
        <div className="login-background">
          <div className="bg-shape shape-1"></div>
          <div className="bg-shape shape-2"></div>
          <div className="bg-shape shape-3"></div>
        </div>
        
        {/* Login Card */}
        <div className="login-card">
          {/* Header Section */}
          <div className="login-header">
            <div className="logo-section">
              <div className="logo-icon">📱</div>
              <h1 className="brand-name">RefinedTech</h1>
            </div>
            <h2 className="welcome-title">Welcome Back!</h2>
            <p className="welcome-subtitle">Sign in to access your account and continue your tech journey</p>
          </div>

          {/* Form Section */}
          <form onSubmit={handleSubmit} className="login-form">
            <div className="input-group">
              <label htmlFor="email" className="input-label">
                <span className="label-icon">📧</span>
                Email Address
              </label>
              <div className="input-wrapper">
                <input 
                  id="email"
                  type="email" 
                  value={email} 
                  onChange={e=>setEmail(e.target.value)} 
                  required 
                  disabled={isLoading}
                  className="styled-input"
                  placeholder="Enter your email address"
                />
              </div>
            </div>

            <div className="input-group">
              <label htmlFor="password" className="input-label">
                <span className="label-icon">🔒</span>
                Password
              </label>
              <div className="input-wrapper password-wrapper">
                <input 
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password} 
                  onChange={e=>setPassword(e.target.value)} 
                  required 
                  disabled={isLoading}
                  className="styled-input"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            {/* Remember & Forgot */}
            <div className="form-options">
              <label className="checkbox-wrapper">
                <input type="checkbox" className="checkbox-input" />
                <span className="checkbox-custom"></span>
                <span className="checkbox-label">Remember me</span>
              </label>
              <Link to="/forgot-password" className="forgot-link">
                Forgot password?
              </Link>
            </div>

            {/* Submit Button */}
            <button 
              className="login-btn" 
              type="submit"
              disabled={isLoading}
            >
              <span className="btn-text">
                {isLoading ? 'Signing in...' : 'Sign In'}
              </span>
              <span className="btn-icon">→</span>
            </button>
          </form>

          {/* Status Message */}
          {status && (
            <div className={`status-message ${status.type}`}>
              <span className="status-icon">
                {status.type === 'success' ? '✅' : '❌'}
              </span>
              <span className="status-text">{status.message}</span>
            </div>
          )}

          {/* Divider */}
          <div className="divider">
            <span className="divider-text">or</span>
          </div>

          {/* Social Login */}
          <div className="social-login">
            <button className="social-btn google-btn" type="button" disabled>
              <span className="social-icon">🌐</span>
              Continue with Google
            </button>
          </div>

          {/* Sign Up Link */}
          <div className="signup-section">
            <p className="signup-text">
              Don't have an account? 
              <Link to="/signup" className="signup-link">Create Account</Link>
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
