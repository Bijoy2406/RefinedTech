import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
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
        // Enhanced Role Selection Screen
        <div className="signup-container">
          {/* Background Elements */}
          <div className="signup-background">
            <div className="bg-shape shape-1"></div>
            <div className="bg-shape shape-2"></div>
            <div className="bg-shape shape-3"></div>
            <div className="bg-shape shape-4"></div>
          </div>

          <div className="signup-card role-selection-card">
            {/* Header Section */}
            <div className="signup-header">
              <div className="logo-section">
                <div className="logo-icon">📱</div>
                <h1 className="brand-name">RefinedTech</h1>
              </div>
              <h2 className="signup-title">Join RefinedTech</h2>
              <p className="signup-subtitle">Choose your account type to get started with the best tech marketplace</p>
            </div>

            {/* Role Options */}
            <div className="role-options-container">
              <div className="role-options">
                <div 
                  className="role-option buyer-option"
                  onClick={() => handleRoleSelect('Buyer')}
                >
                  <div className="role-icon-wrapper">
                    <div className="role-icon">�</div>
                  </div>
                  <div className="role-content">
                    <h3>Buyer</h3>
                    <p>Browse and purchase products from verified sellers</p>
                    <div className="role-features">
                      <span className="feature">• Secure payments</span>
                      <span className="feature">• Quality guarantee</span>
                      <span className="feature">• 24/7 support</span>
                    </div>
                  </div>
                  <div className="role-arrow">→</div>
                </div>

                <div 
                  className="role-option seller-option"
                  onClick={() => handleRoleSelect('Seller')}
                >
                  <div className="role-icon-wrapper">
                    <div className="role-icon">🏪</div>
                  </div>
                  <div className="role-content">
                    <h3>Seller</h3>
                    <p>Start selling your products and grow your business</p>
                    <div className="role-features">
                      <span className="feature">• Easy listing</span>
                      <span className="feature">• Analytics dashboard</span>
                      <span className="feature">• Commission-free</span>
                    </div>
                  </div>
                  <div className="role-arrow">→</div>
                </div>

                <div 
                  className="role-option admin-option"
                  onClick={() => handleRoleSelect('Admin')}
                >
                  <div className="role-icon-wrapper">
                    <div className="role-icon">⚙️</div>
                  </div>
                  <div className="role-content">
                    <h3>Admin</h3>
                    <p>Manage platform operations and oversee activities</p>
                    <div className="role-features">
                      <span className="feature">• User management</span>
                      <span className="feature">• Content moderation</span>
                      <span className="feature">• Analytics access</span>
                    </div>
                  </div>
                  <div className="role-arrow">→</div>
                </div>
              </div>
            </div>

            {/* Bottom Section */}
            <div className="signup-bottom">
              <div className="divider">
                <span className="divider-text">Already have an account?</span>
              </div>
              <Link to="/login" className="login-link">
                <span>Sign In Instead</span>
                <span className="link-arrow">←</span>
              </Link>
            </div>

            {/* Trust Indicators */}
            <div className="trust-indicators">
              <div className="trust-item">
                <span className="trust-icon">🔒</span>
                <span className="trust-text">Secure & Safe</span>
              </div>
              <div className="trust-item">
                <span className="trust-icon">⚡</span>
                <span className="trust-text">Quick Setup</span>
              </div>
              <div className="trust-item">
                <span className="trust-icon">🆓</span>
                <span className="trust-text">Free to Join</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        // Enhanced Form Container
        <div className="signup-form-container">
          <div className="signup-background">
            <div className="bg-shape shape-1"></div>
            <div className="bg-shape shape-2"></div>
          </div>
          
          {/* Render the appropriate form component based on role */}
          {role === 'Buyer' && <BuyerSignupForm onBack={handleBackToRoleSelection} />}
          {role === 'Seller' && <SellerSignupForm onBack={handleBackToRoleSelection} />}
          {role === 'Admin' && <AdminSignupForm onBack={handleBackToRoleSelection} />}
        </div>
      )}
    </>
  )
}
