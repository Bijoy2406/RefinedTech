import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import '../css/Login.css'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://127.0.0.1:8000'

export default function Login({ onLogin }) {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [status, setStatus] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setStatus('Loading...')
    try {
      const { data } = await axios.post(`${API_BASE}/api/login`, { email, password })
      setStatus(data.message || 'Logged in')
      localStorage.setItem('rt_user', JSON.stringify(data.user || {}))
      localStorage.setItem('rt_token', data.token || '')
      onLogin(data.user)
      navigate('/')
    } catch (err) {
      setStatus(err.response?.data?.error || 'Login failed')
    }
  }

  return (
    <div className="auth-card">
      <h2>Welcome back</h2>
      <form onSubmit={handleSubmit}>
        <label>Email</label>
        <input type="email" value={email} onChange={e=>setEmail(e.target.value)} required />
        <label>Password</label>
        <input type="password" value={password} onChange={e=>setPassword(e.target.value)} required />
        <button className="btn primary" type="submit">Login</button>
      </form>
      {status && <p className="status">{status}</p>}
    </div>
  )
}
