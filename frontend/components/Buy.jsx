import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import LottieLoading from './LottieLoading';
import '../css/Buy.css';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://127.0.0.1:8000';

export default function Buy() {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderData, setOrderData] = useState(null);
  const [error, setError] = useState('');

  // Form state
  const [shippingForm, setShippingForm] = useState({
    shipping_address_line1: '',
    shipping_address_line2: '',
    shipping_city: '',
    shipping_state: '',
    shipping_postal_code: '',
    shipping_country: 'United States',
    shipping_phone: '',
  });

  const [paymentForm, setPaymentForm] = useState({
    payment_method: 'credit_card',
  });

  const [orderItems, setOrderItems] = useState([]);
  const [orderSummary, setOrderSummary] = useState({
    subtotal: 0,
    shipping: 9.99,
    tax: 0,
    total: 0,
  });

  // Check for direct product purchase or cart checkout
  const searchParams = new URLSearchParams(location.search);
  const productId = searchParams.get('product');
  const quantity = parseInt(searchParams.get('quantity')) || 1;
  const fromCart = searchParams.get('cart') === 'true';

  useEffect(() => {
    if (productId && !fromCart) {
      // Direct product purchase
      fetchProductForPurchase();
    } else if (fromCart) {
      // Cart checkout
      fetchCartItems();
    } else {
      // No valid purchase context
      navigate('/');
    }
  }, [productId, fromCart]);

  const fetchProductForPurchase = async () => {
    try {
      const token = localStorage.getItem('rt_token');
      const response = await axios.get(`${API_BASE}/api/products/${productId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        const product = response.data.product;
        const items = [{
          id: product.id,
          title: product.title,
          price: parseFloat(product.price),
          quantity: quantity,
          total_price: parseFloat(product.price) * quantity,
          condition_grade: product.condition_grade,
          main_image: product.images?.[0] || null,
        }];
        
        setOrderItems(items);
        calculateOrderSummary(items);
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      setError('Failed to load product information');
    }
  };

  const fetchCartItems = async () => {
    try {
      const token = localStorage.getItem('rt_token');
      const response = await axios.get(`${API_BASE}/api/cart`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        const cartItems = response.data.cart.items;
        setOrderItems(cartItems);
        calculateOrderSummary(cartItems);
      }
    } catch (error) {
      console.error('Error fetching cart items:', error);
      setError('Failed to load cart items');
    }
  };

  const calculateOrderSummary = (items) => {
    const subtotal = items.reduce((sum, item) => sum + item.total_price, 0);
    const shipping = 9.99; // Fixed shipping cost
    const tax = subtotal * 0.08; // 8% tax
    const total = subtotal + shipping + tax;

    setOrderSummary({
      subtotal: subtotal.toFixed(2),
      shipping: shipping.toFixed(2),
      tax: tax.toFixed(2),
      total: total.toFixed(2),
    });
  };

  const handleShippingChange = (e) => {
    setShippingForm({
      ...shippingForm,
      [e.target.name]: e.target.value
    });
  };

  const handlePaymentChange = (e) => {
    setPaymentForm({
      ...paymentForm,
      [e.target.name]: e.target.value
    });
  };

  const validateForm = () => {
    const required = [
      'shipping_address_line1',
      'shipping_city',
      'shipping_state',
      'shipping_postal_code',
      'shipping_country',
      'shipping_phone'
    ];

    for (let field of required) {
      if (!shippingForm[field]?.trim()) {
        setError(`${field.replace('shipping_', '').replace('_', ' ')} is required`);
        return false;
      }
    }

    return true;
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('rt_token');
      
      const orderData = {
        ...shippingForm,
        ...paymentForm,
      };

      if (productId && !fromCart) {
        // Direct purchase
        orderData.product_id = parseInt(productId);
        orderData.quantity = quantity;
      } else {
        // Cart checkout
        orderData.use_cart = true;
      }

      const response = await axios.post(`${API_BASE}/api/orders/create`, orderData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        setOrderData(response.data.order);
        setOrderSuccess(true);
      }

    } catch (error) {
      console.error('Error placing order:', error);
      if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else {
        setError('Failed to place order. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (orderSuccess) {
    return (
      <div className="buy-page">
        <div className="buy-container">
          <div className="order-success">
            <div className="success-icon">✅</div>
            <h1>Order Placed Successfully!</h1>
            <div className="order-details">
              <p><strong>Order Number:</strong> {orderData.order_number}</p>
              <p><strong>Total Amount:</strong> ৳{orderData.final_amount}</p>
              <p><strong>Status:</strong> {orderData.status}</p>
              <p><strong>Estimated Delivery:</strong> {orderData.estimated_delivery_date}</p>
            </div>
            <div className="success-actions">
              <button 
                className="btn btn-primary"
                onClick={() => navigate('/buyer-homepage')}
              >
                View Order History
              </button>
              <button 
                className="btn btn-secondary"
                onClick={() => navigate('/')}
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return <LottieLoading message="Processing your order..." />
  }

  return (
    <div className="buy-page">
      <div className="buy-container">
        <h1>Checkout</h1>
        
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <div className="checkout-content">
          {/* Order Summary */}
          <div className="order-summary">
            <h2>Order Summary</h2>
            <div className="order-items">
              {orderItems.map((item, index) => (
                <div key={index} className="order-item">
                  {item.main_image && (
                    <img 
                      src={`${API_BASE}/storage/products/${item.main_image}`} 
                      alt={item.title}
                      className="item-image"
                    />
                  )}
                  <div className="item-details">
                    <h4>{item.title}</h4>
                    <p>Condition: {item.condition_grade}</p>
                    <p>Quantity: {item.quantity}</p>
                    <p className="item-price">৳{item.total_price.toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="price-breakdown">
              <div className="price-row">
                <span>Subtotal:</span>
                <span>৳{orderSummary.subtotal}</span>
              </div>
              <div className="price-row">
                <span>Shipping:</span>
                <span>৳{orderSummary.shipping}</span>
              </div>
              <div className="price-row">
                <span>Tax:</span>
                <span>৳{orderSummary.tax}</span>
              </div>
              <div className="price-row total">
                <span>Total:</span>
                <span>৳{orderSummary.total}</span>
              </div>
            </div>
          </div>

          {/* Checkout Form */}
          <div className="checkout-form">
            <form onSubmit={handlePlaceOrder}>
              {/* Shipping Information */}
              <section className="form-section">
                <h2>Shipping Information</h2>
                
                <div className="form-row">
                  <div className="form-group">
                    <label>Address Line 1 *</label>
                    <input
                      type="text"
                      name="shipping_address_line1"
                      value={shippingForm.shipping_address_line1}
                      onChange={handleShippingChange}
                      placeholder="Street address"
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Address Line 2</label>
                    <input
                      type="text"
                      name="shipping_address_line2"
                      value={shippingForm.shipping_address_line2}
                      onChange={handleShippingChange}
                      placeholder="Apartment, suite, etc. (optional)"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>City *</label>
                    <input
                      type="text"
                      name="shipping_city"
                      value={shippingForm.shipping_city}
                      onChange={handleShippingChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>State *</label>
                    <input
                      type="text"
                      name="shipping_state"
                      value={shippingForm.shipping_state}
                      onChange={handleShippingChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Postal Code *</label>
                    <input
                      type="text"
                      name="shipping_postal_code"
                      value={shippingForm.shipping_postal_code}
                      onChange={handleShippingChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Country *</label>
                    <select
                      name="shipping_country"
                      value={shippingForm.shipping_country}
                      onChange={handleShippingChange}
                      required
                    >
                      <option value="United States">United States</option>
                      <option value="Canada">Canada</option>
                      <option value="United Kingdom">United Kingdom</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Phone Number *</label>
                    <input
                      type="tel"
                      name="shipping_phone"
                      value={shippingForm.shipping_phone}
                      onChange={handleShippingChange}
                      placeholder="+1 (555) 123-4567"
                      required
                    />
                  </div>
                </div>
              </section>

              {/* Payment Information */}
              <section className="form-section">
                <h2>Payment Information</h2>
                
                <div className="form-row">
                  <div className="form-group">
                    <label>Payment Method *</label>
                    <select
                      name="payment_method"
                      value={paymentForm.payment_method}
                      onChange={handlePaymentChange}
                      required
                    >
                      <option value="credit_card">Credit Card</option>
                      <option value="debit_card">Debit Card</option>
                      <option value="paypal">PayPal</option>
                      <option value="bank_transfer">Bank Transfer</option>
                      <option value="cash_on_delivery">Cash on Delivery</option>
                    </select>
                  </div>
                </div>

                {(paymentForm.payment_method === 'credit_card' || paymentForm.payment_method === 'debit_card') && (
                  <div className="payment-info">
                    <p className="payment-note">
                      💳 Card payment will be processed securely after order confirmation.
                    </p>
                  </div>
                )}

                {paymentForm.payment_method === 'paypal' && (
                  <div className="payment-info">
                    <p className="payment-note">
                      💰 You will be redirected to PayPal to complete payment.
                    </p>
                  </div>
                )}

                {paymentForm.payment_method === 'cash_on_delivery' && (
                  <div className="payment-info">
                    <p className="payment-note">
                      💵 Pay in cash when your order is delivered.
                    </p>
                  </div>
                )}
              </section>

              {/* Place Order Button */}
              <div className="form-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => navigate(-1)}
                  disabled={loading}
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading}
                >
                  {loading ? 'Processing...' : `Place Order - ৳${orderSummary.total}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
