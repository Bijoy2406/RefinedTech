import { useState } from 'react'
import axios from 'axios'
import '../css/Signup.css'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://127.0.0.1:8000'

export default function Signup() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('Buyer')
  const [status, setStatus] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setStatus('Loading...')
    try {
      const { data } = await axios.post(`${API_BASE}/api/signup`, { name, email, password, role })
      setStatus(data.message || 'Account created')
    } catch (err) {
      if (err.response?.data?.errors) {
        const errorMessages = Object.values(err.response.data.errors).flat();
        setStatus(errorMessages.join(' '));
      } else {
        setStatus(err.response?.data?.message || 'Signup failed');
      }
    }
  }

  return (
    <div className="auth-card">
      <h2>Create your account</h2>
      <form onSubmit={handleSubmit}>
        <label>Name</label>
        <input value={name} onChange={e=>setName(e.target.value)} required />
        <label>Email</label>
        <input type="email" value={email} onChange={e=>setEmail(e.target.value)} required />
        <label>Password</label>
        <input type="password" value={password} onChange={e=>setPassword(e.target.value)} required />
        <label>Role</label>
        <select value={role} onChange={e=>setRole(e.target.value)}>
          <option value="Buyer">Buyer</option>
          <option value="Seller">Seller</option>
          <option value="Admin">Admin</option>
        </select>
        <button className="btn primary" type="submit">Sign Up</button>
      </form>
      {status && <p className="status">{status}</p>}
    </div>
  )
}
