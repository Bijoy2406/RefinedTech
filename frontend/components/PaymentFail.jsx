import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../css/PaymentResult.css';

export default function PaymentFail() {
  const navigate = useNavigate();
  const location = useLocation();

  // Extract parameters from URL
  const searchParams = new URLSearchParams(location.search);
  const transactionId = searchParams.get('transaction_id');
  const status = searchParams.get('status');

  useEffect(() => {
    // Log the failed payment attempt
    console.log('Payment failed:', { transactionId, status });
  }, [transactionId, status]);

  const getErrorMessage = () => {
    switch (status) {
      case 'failed':
        return 'Your payment could not be processed. This might be due to insufficient funds, card issues, or network problems.';
      case 'validation_failed':
        return 'Payment validation failed. The transaction could not be verified.';
      case 'error':
        return 'An unexpected error occurred during payment processing.';
      default:
        return 'Payment was not completed successfully.';
    }
  };

  const getRecommendations = () => {
    return [
      'Check your card details and try again',
      'Ensure you have sufficient funds in your account',
      'Try using a different payment method',
      'Contact your bank if the issue persists',
      'Use a different card or payment option'
    ];
  };

  return (
    <div className="payment-result-page">
      <div className="payment-result-container failed">
        <div className="result-icon">❌</div>
        <h1>Payment Failed</h1>
        <p className="error-message">{getErrorMessage()}</p>
        
        {transactionId && (
          <div className="transaction-info">
            <p><strong>Transaction ID:</strong> {transactionId}</p>
            <p><small>Please quote this ID if you need to contact support</small></p>
          </div>
        )}

        <div className="recommendations">
          <h3>What can you do?</h3>
          <ul>
            {getRecommendations().map((recommendation, index) => (
              <li key={index}>{recommendation}</li>
            ))}
          </ul>
        </div>

        <div className="result-actions">
          <button 
            className="btn btn-primary"
            onClick={() => navigate(-1)}
          >
            Try Again
          </button>
          <button 
            className="btn btn-secondary"
            onClick={() => navigate('/cart')}
          >
            Back to Cart
          </button>
          <button 
            className="btn btn-outline"
            onClick={() => navigate('/')}
          >
            Continue Shopping
          </button>
        </div>

        <div className="support-info">
          <h4>Need Help?</h4>
          <p>If you continue to experience issues, please contact our support team:</p>
          <div className="support-contacts">
            <p>📧 Email: support@refinedtech.com</p>
            <p>📞 Phone: +880-XXX-XXXXXX</p>
            <p>💬 Live Chat: Available 24/7</p>
          </div>
        </div>

        <div className="security-note">
          <p><small>
            🔒 No money has been deducted from your account. 
            If you see any unauthorized charges, please contact your bank immediately.
          </small></p>
        </div>
      </div>
    </div>
  );
}