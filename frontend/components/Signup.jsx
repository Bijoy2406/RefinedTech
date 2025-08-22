import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import BuyerSignupForm from './BuyerSignupForm'
import SellerSignupForm from './SellerSignupForm'
import AdminSignupForm from './AdminSignupForm'
import '../css/Signup.css'

export default function Signup() {
  const { role: urlRole } = useParams()
  const navigate = useNavigate()
  const [role, setRole] = useState('')

  useEffect(() => {
    // Set role from URL parameter if present
    if (urlRole) {
      const validRoles = ['buyer', 'seller', 'admin']
      const normalizedRole = urlRole.toLowerCase()
      if (validRoles.includes(normalizedRole)) {
        setRole(normalizedRole.charAt(0).toUpperCase() + normalizedRole.slice(1))
      } else {
        // Invalid role in URL, redirect to base signup
        navigate('/signup', { replace: true })
      }
    }
  }, [urlRole, navigate])

  const handleRoleSelect = (selectedRole) => {
    setRole(selectedRole)
    navigate(`/signup/${selectedRole.toLowerCase()}`)
  }

  const handleBackToRoleSelection = () => {
    setRole('')
    navigate('/signup')
  }

  return (
    <>
      {!role ? (
        // Role Selection Screen
        <div className="auth-card role-selection">
          <h2>Join RefinedTech</h2>
          <p>Choose your account type to get started</p>
          <div className="role-options">
            <div 
              className="role-option"
              onClick={() => handleRoleSelect('Buyer')}
            >
              <div className="role-icon">👤</div>
              <h3>Buyer</h3>
              <p>Browse and purchase products from verified sellers</p>
            </div>
            <div 
              className="role-option"
              onClick={() => handleRoleSelect('Seller')}
            >
              <div className="role-icon">🏪</div>
              <h3>Seller</h3>
              <p>Start selling your products and grow your business</p>
            </div>
            <div 
              className="role-option"
              onClick={() => handleRoleSelect('Admin')}
            >
              <div className="role-icon">⚙️</div>
              <h3>Admin</h3>
              <p>Manage platform operations and oversee activities</p>
            </div>
          </div>
        </div>
      ) : (
        // Render the appropriate form component based on role
        <>
          {role === 'Buyer' && <BuyerSignupForm onBack={handleBackToRoleSelection} />}
          {role === 'Seller' && <SellerSignupForm onBack={handleBackToRoleSelection} />}
          {role === 'Admin' && <AdminSignupForm onBack={handleBackToRoleSelection} />}
        </>
      )}
    </>
  )
}
