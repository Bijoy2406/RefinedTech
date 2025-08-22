import { useState } from 'react'
import axios from 'axios'
import LottieLoading from './LottieLoading'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://127.0.0.1:8000'

export default function SellerSignupForm({ onBack }) {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [shopUsername, setShopUsername] = useState('')
  const [dateOfBirth, setDateOfBirth] = useState('')
  const [nationalIdFile, setNationalIdFile] = useState(null)
  const [businessAddress, setBusinessAddress] = useState('')
  const [proofOfOwnershipFile, setProofOfOwnershipFile] = useState(null)
  const [status, setStatus] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  // File validation function
  const validateFile = (file) => {
    if (!file) return { valid: false, message: 'Please select a file' }
    
    const maxSize = 2 * 1024 * 1024 // 2MB in bytes
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif']
    
    if (file.size > maxSize) {
      return { valid: false, message: 'File size must be less than 2MB' }
    }
    
    if (!allowedTypes.includes(file.type)) {
      return { valid: false, message: 'Only JPEG, PNG, and GIF images are allowed' }
    }
    
    return { valid: true, message: '' }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Password confirmation validation
    if (password !== confirmPassword) {
      setStatus('Passwords do not match')
      return
    }

    // File validation
    const nationalIdValidation = validateFile(nationalIdFile)
    if (!nationalIdValidation.valid) {
      setStatus(`National ID: ${nationalIdValidation.message}`)
      return
    }

    const proofValidation = validateFile(proofOfOwnershipFile)
    if (!proofValidation.valid) {
      setStatus(`Proof of Ownership: ${proofValidation.message}`)
      return
    }
    
    setIsLoading(true)
    setStatus(null)
    try {
      const formData = new FormData()
      formData.append('name', `${firstName} ${lastName}`)
      formData.append('first_name', firstName)
      formData.append('last_name', lastName)
      formData.append('email', email)
      formData.append('password', password)
      formData.append('phone_number', phoneNumber)
      formData.append('shop_username', shopUsername)
      formData.append('date_of_birth', dateOfBirth)
      formData.append('business_address', businessAddress)
      formData.append('national_id', nationalIdFile)
      formData.append('proof_of_ownership', proofOfOwnershipFile)
      formData.append('role', 'Seller')

      const { data } = await axios.post(`${API_BASE}/api/signup`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      setStatus(data.message || 'Seller account created successfully! Please wait for verification.')
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
      {isLoading && <LottieLoading message="Creating seller account..." />}
      <div className="auth-card signup-with-image">
        <div className="signup-image">
          <img
            src="/placeholders/seller.svg"
            alt="Seller placeholder"
          />
        </div>
        <div className="signup-form">
          <div className="form-header">
            <button 
              className="back-button"
              onClick={() => {
                setFirstName('')
                setLastName('')
                setEmail('')
                setPassword('')
                setConfirmPassword('')
                setPhoneNumber('')
                setShopUsername('')
                setDateOfBirth('')
                setNationalIdFile(null)
                setBusinessAddress('')
                setProofOfOwnershipFile(null)
                setStatus(null)
                onBack()
              }}
              type="button"
            >
              ← Back
            </button>
            <h2>Become a Verified Seller</h2>
          </div>
          <form onSubmit={handleSubmit}>
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
            
            <label>Email Address</label>
            <input 
              type="email" 
              value={email} 
              onChange={e=>setEmail(e.target.value)} 
              required 
              disabled={isLoading}
              placeholder="Enter your business email"
            />
            
            <label>Password</label>
            <input 
              type="password" 
              value={password} 
              onChange={e=>setPassword(e.target.value)} 
              required 
              disabled={isLoading}
              placeholder="Create a strong password"
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
            
            <label>Your Phone Number</label>
            <input 
              type="tel"
              value={phoneNumber} 
              onChange={e=>setPhoneNumber(e.target.value)} 
              required 
              disabled={isLoading}
              placeholder="Enter your phone number"
            />
            
            <label>Shop Username / Seller Name</label>
            <input 
              value={shopUsername} 
              onChange={e=>setShopUsername(e.target.value)} 
              required 
              disabled={isLoading}
              placeholder="Enter your shop username or seller name"
            />
            
            <label>Date of Birth</label>
            <input 
              type="date"
              value={dateOfBirth} 
              onChange={e=>setDateOfBirth(e.target.value)} 
              required 
              disabled={isLoading}
              max={new Date().toISOString().split('T')[0]} // Prevent future dates
            />
            
            <label>National ID / Government ID Number (Upload Image)</label>
            <input 
              type="file"
              onChange={e=>setNationalIdFile(e.target.files[0])} 
              required 
              disabled={isLoading}
              accept="image/jpeg,image/jpg,image/png,image/gif"
            />
            {nationalIdFile && (
              <p style={{fontSize: '12px', color: '#666', marginTop: '5px'}}>
                Selected: {nationalIdFile.name} ({(nationalIdFile.size / 1024 / 1024).toFixed(2)} MB)
              </p>
            )}
            
            <label>Store/Business Address</label>
            <textarea 
              value={businessAddress} 
              onChange={e=>setBusinessAddress(e.target.value)} 
              required 
              disabled={isLoading}
              placeholder="Enter your complete business address"
              rows="3"
            />
            
            <label>Proof of Ownership (Upload Image)</label>
            <input 
              type="file"
              onChange={e=>setProofOfOwnershipFile(e.target.files[0])} 
              required 
              disabled={isLoading}
              accept="image/jpeg,image/jpg,image/png,image/gif"
            />
            {proofOfOwnershipFile && (
              <p style={{fontSize: '12px', color: '#666', marginTop: '5px'}}>
                Selected: {proofOfOwnershipFile.name} ({(proofOfOwnershipFile.size / 1024 / 1024).toFixed(2)} MB)
              </p>
            )}
            <p style={{fontSize: '12px', color: '#888', marginTop: '5px'}}>
              Upload business license, registration certificate, or other ownership documents (Max 2MB)
            </p>
            
            <p className="form-description">
              Start your journey as a seller on RefinedTech. Your account will be reviewed for verification within 24-48 hours.
            </p>
            <button 
              className="btn primary" 
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? 'Creating Account...' : 'Apply as Seller'}
            </button>
          </form>
          {status && <p className="status">{status}</p>}
        </div>
      </div>
    </>
  )
}
