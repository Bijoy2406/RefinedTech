import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
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

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setStatus(null)
    try {
      const { data } = await axios.post(`${API_BASE}/api/login`, { email, password })
      setStatus(data.message || 'Logged in')
      localStorage.setItem('rt_user', JSON.stringify(data.user || {}))
      localStorage.setItem('rt_token', data.token || '')
      onLogin(data.user)
      
      // Redirect based on user role
      if (data.user && data.user.role === 'Admin') {
        navigate('/admin')
      } else if (data.user && data.user.role === 'Seller') {
        navigate('/seller')
      } else {
        navigate('/')
      }
    } catch (err) {
      setStatus(err.response?.data?.error || 'Login failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      {isLoading && <LottieLoading message="Logging in..." />}
      <div className="auth-card">
        <h2>Welcome back</h2>
        <form onSubmit={handleSubmit}>
          <label>Email</label>
          <input 
            type="email" 
            value={email} 
            onChange={e=>setEmail(e.target.value)} 
            required 
            disabled={isLoading}
          />
          <label>Password</label>
          <input 
            type="password" 
            value={password} 
            onChange={e=>setPassword(e.target.value)} 
            required 
            disabled={isLoading}
          />
          <button 
            className="btn primary" 
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        {status && <p className="status">{status}</p>}
      </div>
    </>
  )
}
