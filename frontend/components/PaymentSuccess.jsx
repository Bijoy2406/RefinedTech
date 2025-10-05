import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import '../css/PaymentResult.css';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://127.0.0.1:8000';

export default function PaymentSuccess() {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [orderData, setOrderData] = useState(null);
  const [error, setError] = useState('');

  // Extract parameters from URL
  const searchParams = new URLSearchParams(location.search);
  const orderId = searchParams.get('order_id');
  const transactionId = searchParams.get('transaction_id');
  const status = searchParams.get('status');

  useEffect(() => {
    if (orderId && status === 'success') {
      fetchOrderDetails();
    } else {
      setError('Invalid payment confirmation');
      setLoading(false);
    }
  }, [orderId, status]);

  const fetchOrderDetails = async () => {
    try {
      const token = localStorage.getItem('rt_token');
      const response = await axios.get(`${API_BASE}/api/orders/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setOrderData(response.data.order);
      } else {
        throw new Error(response.data.message || 'Failed to fetch order details');
      }
    } catch (error) {
      console.error('Error fetching order:', error);
      setError('Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="payment-result-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="payment-result-page">
        <div className="payment-result-container error">
          <div className="result-icon">❌</div>
          <h1>Error</h1>
          <p>{error}</p>
          <div className="result-actions">
            <button 
              className="btn btn-primary"
              onClick={() => navigate('/')}
            >
              Go Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-result-page">
      <div className="payment-result-container success">
        <div className="result-icon">✅</div>
        <h1>Payment Successful!</h1>
        <p>Your order has been confirmed and payment has been processed successfully.</p>
        
        {orderData && (
          <div className="order-summary">
            <h3>Order Details</h3>
            <div className="order-info">
              <p><strong>Order Number:</strong> {orderData.order_number}</p>
              <p><strong>Total Amount:</strong> ৳{orderData.final_amount}</p>
              <p><strong>Payment Status:</strong> 
                <span className="status paid">{orderData.payment_status}</span>
              </p>
              <p><strong>Order Status:</strong> 
                <span className="status confirmed">{orderData.status}</span>
              </p>
              {transactionId && (
                <p><strong>Transaction ID:</strong> {transactionId}</p>
              )}
              {orderData.estimated_delivery_date && (
                <p><strong>Estimated Delivery:</strong> {new Date(orderData.estimated_delivery_date).toLocaleDateString()}</p>
              )}
            </div>
          </div>
        )}

        <div className="result-actions">
          <button 
            className="btn btn-primary"
            onClick={() => navigate('/buyer-homepage')}
          >
            View My Orders
          </button>
          <button 
            className="btn btn-secondary"
            onClick={() => navigate('/')}
          >
            Continue Shopping
          </button>
        </div>

        <div className="next-steps">
          <h4>What happens next?</h4>
          <ul>
            <li>You will receive an email confirmation shortly</li>
            <li>The seller will be notified to prepare your order</li>
            <li>You can track your order status in "My Orders"</li>
            <li>You'll receive updates via email and notifications</li>
          </ul>
        </div>
      </div>
    </div>
  );
}