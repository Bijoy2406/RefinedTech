import { useState } from 'react'
import axios from 'axios'
import LottieLoading from './LottieLoading'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://127.0.0.1:8000'

export default function AdminSignupForm({ onBack }) {
  const [adminAccessCode, setAdminAccessCode] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [country, setCountry] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [adminUsername, setAdminUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [idProofReference, setIdProofReference] = useState('')
  const [status, setStatus] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Password confirmation validation
    if (password !== confirmPassword) {
      setStatus('Passwords do not match')
      return
    }
    
    setIsLoading(true)
    setStatus(null)
    try {
      const { data } = await axios.post(`${API_BASE}/api/signup`, { 
        name: `${firstName} ${lastName}`,
        first_name: firstName,
        last_name: lastName,
        country,
        email, 
        password,
        password_confirmation: confirmPassword,
        phone_number: phoneNumber,
        admin_access_code: adminAccessCode,
        admin_username: adminUsername,
        id_proof_reference: idProofReference,
        role: 'Admin'
      })
      setStatus(data.message || 'Admin account request submitted for approval.')
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
      {isLoading && <LottieLoading message="Submitting admin request..." />}
      <div className="auth-card signup-with-image">
        <div className="signup-image">
          <img
            src="/placeholders/admin.svg"
            alt="Admin placeholder"
          />
        </div>
        <div className="signup-form">
          <div className="form-header">
            <button 
              className="back-button"
              onClick={() => {
                setAdminAccessCode('')
                setFirstName('')
                setLastName('')
                setCountry('')
                setPhoneNumber('')
                setAdminUsername('')
                setEmail('')
                setPassword('')
                setConfirmPassword('')
                setIdProofReference('')
                setStatus(null)
                onBack()
              }}
              type="button"
            >
              ← Back
            </button>
            <h2>Admin Registration</h2>
          </div>
          <form onSubmit={handleSubmit}>
            <label>Admin Access Code</label>
            <input 
              value={adminAccessCode} 
              onChange={e=>setAdminAccessCode(e.target.value)} 
              required 
              disabled={isLoading}
              placeholder="Enter the admin access code (e.g., ADM-XXXXXXXX)"
            />
            <p style={{fontSize: '12px', color: '#666', marginTop: '5px'}}>
              You must have a valid admin access code from an existing administrator to register as an admin.
            </p>
            
            <label>First Name</label>
            <input 
              value={firstName} 
              onChange={e=>setFirstName(e.target.value)} 
              required 
              disabled={isLoading}
              placeholder="Enter your first name"
            />
            
            <label>Last Name</label>
            <input 
              value={lastName} 
              onChange={e=>setLastName(e.target.value)} 
              required 
              disabled={isLoading}
              placeholder="Enter your last name"
            />
            
            <label>Country</label>
            <input 
              value={country} 
              onChange={e=>setCountry(e.target.value)} 
              required 
              disabled={isLoading}
              placeholder="Enter your country"
            />
            
            <label>Your Phone Number</label>
            <input 
              type="tel"
              value={phoneNumber} 
              onChange={e=>setPhoneNumber(e.target.value)} 
              required 
              disabled={isLoading}
              placeholder="Enter your phone number"
            />
            
            <label>Admin Username</label>
            <input 
              value={adminUsername} 
              onChange={e=>setAdminUsername(e.target.value)} 
              required 
              disabled={isLoading}
              placeholder="Enter your admin username"
            />
            
            <label>Email Address</label>
            <input 
              type="email" 
              value={email} 
              onChange={e=>setEmail(e.target.value)} 
              required 
              disabled={isLoading}
              placeholder="Use your official email address"
            />
            
            <label>Password</label>
            <input 
              type="password" 
              value={password} 
              onChange={e=>setPassword(e.target.value)} 
              required 
              disabled={isLoading}
              placeholder="Create a secure password"
            />
            
            <label>Confirm Password</label>
            <input 
              type="password" 
              value={confirmPassword} 
              onChange={e=>setConfirmPassword(e.target.value)} 
              required 
              disabled={isLoading}
              placeholder="Confirm your password"
            />
            
            <label>ID Proof / Reference</label>
            <textarea 
              value={idProofReference} 
              onChange={e=>setIdProofReference(e.target.value)} 
              required 
              disabled={isLoading}
              placeholder="Provide ID proof details or reference information"
              rows="3"
            />
            <p className="form-description">
              Admin access requires verification. Your request will be reviewed by senior administrators.
            </p>
            <button 
              className="btn primary" 
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? 'Submitting Request...' : 'Request Admin Access'}
            </button>
          </form>
          {status && <p className="status">{status}</p>}
        </div>
      </div>
    </>
  )
}
