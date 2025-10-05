import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../css/PaymentResult.css';

export default function PaymentCancel() {
  const navigate = useNavigate();
  const location = useLocation();

  // Extract parameters from URL
  const searchParams = new URLSearchParams(location.search);
  const transactionId = searchParams.get('transaction_id');
  const status = searchParams.get('status');

  useEffect(() => {
    // Log the cancelled payment
    console.log('Payment cancelled:', { transactionId, status });
  }, [transactionId, status]);

  return (
    <div className="payment-result-page">
      <div className="payment-result-container cancelled">
        <div className="result-icon">⚠️</div>
        <h1>Payment Cancelled</h1>
        <p>You have cancelled the payment process. Your order has not been placed.</p>
        
        {transactionId && (
          <div className="transaction-info">
            <p><strong>Transaction ID:</strong> {transactionId}</p>
          </div>
        )}

        <div className="cancellation-info">
          <h3>What happened?</h3>
          <ul>
            <li>You chose to cancel the payment during the checkout process</li>
            <li>No money has been charged to your account</li>
            <li>Your order has not been placed or confirmed</li>
            <li>All items remain in your cart (if applicable)</li>
          </ul>
        </div>

        <div className="result-actions">
          <button 
            className="btn btn-primary"
            onClick={() => navigate(-1)}
          >
            Return to Checkout
          </button>
          <button 
            className="btn btn-secondary"
            onClick={() => navigate('/cart')}
          >
            View Cart
          </button>
          <button 
            className="btn btn-outline"
            onClick={() => navigate('/')}
          >
            Continue Shopping
          </button>
        </div>

        <div className="alternative-options">
          <h4>Still want to complete your purchase?</h4>
          <div className="options-grid">
            <div className="option-card">
              <h5>💳 Try Different Payment Method</h5>
              <p>Use a different card or payment option</p>
              <button 
                className="btn btn-sm"
                onClick={() => navigate(-1)}
              >
                Go Back
              </button>
            </div>
            
            <div className="option-card">
              <h5>🛒 Save for Later</h5>
              <p>Keep items in your cart and pay later</p>
              <button 
                className="btn btn-sm"
                onClick={() => navigate('/cart')}
              >
                View Cart
              </button>
            </div>
            
            <div className="option-card">
              <h5>❤️ Add to Wishlist</h5>
              <p>Save items to your wishlist</p>
              <button 
                className="btn btn-sm"
                onClick={() => navigate('/wishlist')}
              >
                Wishlist
              </button>
            </div>
          </div>
        </div>

        <div className="help-section">
          <h4>Need Assistance?</h4>
          <p>If you experienced any issues during checkout, we're here to help:</p>
          <div className="help-contacts">
            <div className="help-item">
              <span>📧</span>
              <div>
                <strong>Email Support</strong>
                <p>support@refinedtech.com</p>
              </div>
            </div>
            <div className="help-item">
              <span>💬</span>
              <div>
                <strong>Live Chat</strong>
                <p>Available 24/7 for instant help</p>
              </div>
            </div>
            <div className="help-item">
              <span>📞</span>
              <div>
                <strong>Phone Support</strong>
                <p>+880-XXX-XXXXXX</p>
              </div>
            </div>
          </div>
        </div>

        <div className="security-assurance">
          <p><small>
            🔒 Your payment information is secure. No charges were made to your account.
          </small></p>
        </div>
      </div>
    </div>
  );
}