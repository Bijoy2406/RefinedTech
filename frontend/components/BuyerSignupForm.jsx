import { useState } from 'react'
import axios from 'axios'
import LottieLoading from './LottieLoading'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://127.0.0.1:8000'

export default function BuyerSignupForm({ onBack }) {
  const [name, setName] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')
  const [country, setCountry] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [status, setStatus] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setStatus(null)
    try {
      const { data } = await axios.post(`${API_BASE}/api/signup`, { 
        name,
        first_name: firstName,
        last_name: lastName,
        email, 
        password,
        password_confirmation: passwordConfirmation,
        country,
        phone_number: phoneNumber,
        role: 'Buyer' 
      })
      setStatus(data.message || 'Buyer account created successfully!')
    } catch (err) {
      if (err.response?.data?.errors) {
        const errorMessages = Object.values(err.response.data.errors).flat();
        setStatus(errorMessages.join(' '));
      } else {
        setStatus(err.response?.data?.message || 'Signup failed');
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      {isLoading && <LottieLoading message="Creating buyer account..." />}
      <div className="auth-card signup-with-image">
        <div className="signup-image">
          <img
            src="/placeholders/buyer.svg"
            alt="Buyer placeholder"
          />
        </div>
        <div className="signup-form">
          <div className="form-header">
            <button 
              className="back-button"
              onClick={() => {
                setName('')
                setFirstName('')
                setLastName('')
                setEmail('')
                setPassword('')
                setPasswordConfirmation('')
                setCountry('')
                setPhoneNumber('')
                setStatus(null)
                onBack()
              }}
              type="button"
            >
              ← Back
            </button>
            <h2>Create Buyer Account</h2>
          </div>
          <form onSubmit={handleSubmit}>
            <label>Full Name</label>
            <input 
              value={name} 
              onChange={e=>setName(e.target.value)} 
              required 
              disabled={isLoading}
              placeholder="Enter your full name"
            />
            
            <div style={{display: 'flex', gap: '10px'}}>
              <div style={{flex: 1}}>
                <label>First Name</label>
                <input 
                  value={firstName} 
                  onChange={e=>setFirstName(e.target.value)} 
                  required 
                  disabled={isLoading}
                  placeholder="First name"
                />
              </div>
              <div style={{flex: 1}}>
                <label>Last Name</label>
                <input 
                  value={lastName} 
                  onChange={e=>setLastName(e.target.value)} 
                  required 
                  disabled={isLoading}
                  placeholder="Last name"
                />
              </div>
            </div>
            
            <label>Email Address</label>
            <input 
              type="email" 
              value={email} 
              onChange={e=>setEmail(e.target.value)} 
              required 
              disabled={isLoading}
              placeholder="Enter your email address"
            />
            
            <label>Password</label>
            <input 
              type="password" 
              value={password} 
              onChange={e=>setPassword(e.target.value)} 
              required 
              disabled={isLoading}
              placeholder="Create a strong password (min 6 characters)"
              minLength={6}
            />
            
            <label>Confirm Password</label>
            <input 
              type="password" 
              value={passwordConfirmation} 
              onChange={e=>setPasswordConfirmation(e.target.value)} 
              required 
              disabled={isLoading}
              placeholder="Confirm your password"
            />
            
            <label>Country</label>
            <input 
              value={country} 
              onChange={e=>setCountry(e.target.value)} 
              required 
              disabled={isLoading}
              placeholder="Your country"
            />
            
            <label>Phone Number</label>
            <input 
              value={phoneNumber} 
              onChange={e=>setPhoneNumber(e.target.value)} 
              required 
              disabled={isLoading}
              placeholder="Your phone number"
            />
            <p className="form-description">
              As a buyer, you'll be able to browse products, make purchases, and manage your orders.
            </p>
            <button 
              className="btn primary" 
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? 'Creating Account...' : 'Create Buyer Account'}
            </button>
          </form>
          {status && <p className="status">{status}</p>}
        </div>
      </div>
    </>
  )
}
