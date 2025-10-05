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
  const [error, setError] = useState('');

  const [shippingForm, setShippingForm] = useState({
    shipping_address_line1: '',
    shipping_address_line2: '',
    shipping_city: '',
    shipping_state: '',
    shipping_postal_code: '',
    shipping_country: 'Bangladesh',
    shipping_phone: '',
  });

  const [orderItems, setOrderItems] = useState([]);
  const [orderSummary, setOrderSummary] = useState({
    subtotal: 0,
    shipping: 150,
    tax: 0,
    total: 0,
  });

  const searchParams = new URLSearchParams(location.search);
  const productId = searchParams.get('product');
  const quantity = parseInt(searchParams.get('quantity')) || 1;
  const fromCart = searchParams.get('cart') === 'true';

  useEffect(() => {
    if (productId && !fromCart) {
      fetchProductForPurchase();
    } else if (fromCart) {
      fetchCartItems();
    } else {
      navigate('/');
    }
  }, [productId, fromCart, navigate]);

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
    const shipping = 150;
    const tax = subtotal * 0.05;
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
        payment_method: 'sslcommerz',
      };

      if (productId && !fromCart) {
        orderData.product_id = parseInt(productId);
        orderData.quantity = quantity;
      } else {
        orderData.use_cart = true;
      }

      const createOrderResponse = await axios.post(`${API_BASE}/api/orders/create`, orderData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (createOrderResponse.data.success) {
        const createdOrder = createOrderResponse.data.order;
        
        const paymentResponse = await axios.post(`${API_BASE}/api/payment/initiate`, {
          order_id: createdOrder.id
        }, {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (paymentResponse.data.success) {
          window.location.href = paymentResponse.data.payment_url;
        } else {
          throw new Error(paymentResponse.data.message || 'Failed to initiate payment');
        }
      } else {
        throw new Error(createOrderResponse.data.message || 'Failed to create order');
      }

    } catch (error) {
      console.error('Error processing order:', error);
      if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else {
        setError('Failed to process order. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };
  return (
    <>
      {loading && <LottieLoading message="Creating your order..." />}
      <div className="buy-page">
        <div className="buy-container">
          <h1>🛒 Checkout</h1>
          <p>Complete your purchase securely with SSLCommerz</p>
          
          {error && (
            <div className="error-message">
              ⚠️ {error}
            </div>
          )}

          <div className="checkout-layout">
            <div className="checkout-form">
              <form onSubmit={handlePlaceOrder}>
                <h2>🚚 Shipping Information</h2>
                
                <input
                  type="text"
                  name="shipping_address_line1"
                  value={shippingForm.shipping_address_line1}
                  onChange={handleShippingChange}
                  placeholder="Street Address *"
                  required
                />

                <input
                  type="text"
                  name="shipping_address_line2"
                  value={shippingForm.shipping_address_line2}
                  onChange={handleShippingChange}
                  placeholder="Apartment, Suite, etc."
                />

                <div className="form-row">
                  <input
                    type="text"
                    name="shipping_city"
                    value={shippingForm.shipping_city}
                    onChange={handleShippingChange}
                    placeholder="City *"
                    required
                  />
                  <input
                    type="text"
                    name="shipping_state"
                    value={shippingForm.shipping_state}
                    onChange={handleShippingChange}
                    placeholder="State/Division *"
                    required
                  />
                </div>

                <div className="form-row">
                  <input
                    type="text"
                    name="shipping_postal_code"
                    value={shippingForm.shipping_postal_code}
                    onChange={handleShippingChange}
                    placeholder="Postal Code *"
                    required
                  />
                  <select
                    name="shipping_country"
                    value={shippingForm.shipping_country}
                    onChange={handleShippingChange}
                    required
                  >
                    <option value="Bangladesh">🇧🇩 Bangladesh</option>
                    <option value="India">🇮🇳 India</option>
                    <option value="Pakistan">🇵🇰 Pakistan</option>
                    <option value="Other">🌍 Other</option>
                  </select>
                </div>

                <input
                  type="tel"
                  name="shipping_phone"
                  value={shippingForm.shipping_phone}
                  onChange={handleShippingChange}
                  placeholder="Phone Number *"
                  required
                />

                <div className="payment-section">
                  <h2>💳 Payment Information</h2>
                  <div className="payment-gateway">
                    <img 
                      src="https://securepay.sslcommerz.com/public/image/SSLCommerz-Pay-With-logo-All-Size-02.png" 
                      alt="SSLCommerz Payment Gateway"
                    />
                    <h3>🔒 Secure Payment with SSLCommerz</h3>
                    <p>You will be redirected to SSLCommerz secure payment gateway</p>
                    
                    <div className="payment-methods">
                      <div>💳 Credit/Debit Cards</div>
                      <div>🏦 Internet Banking</div>
                      <div>📱 bKash, Rocket, Nagad</div>
                      <div>🛒 EMI Facilities</div>
                    </div>

                    <div className="security-badges">
                      <span>🔒 SSL Encrypted</span>
                      <span>🛡️ PCI DSS Compliant</span>
                      <span>✅ 256-bit Security</span>
                    </div>

                    <div className="demo-note">
                      <strong>⚠️ Demo Mode:</strong> Test environment - Use demo card: 4111111111111111, CVV: 123
                    </div>
                  </div>
                </div>

                <div className="form-actions">
                  <button
                    type="button"
                    onClick={() => navigate(-1)}
                    disabled={loading}
                  >
                    ← Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                  >
                    {loading ? '🔄 Processing...' : `🚀 Pay ৳${orderSummary.total}`}
                  </button>
                </div>
              </form>
            </div>

            <div className="order-summary">
              <h2>📋 Order Summary</h2>
              
              <div className="order-items">
                {orderItems.map((item, index) => (
                  <div key={index} className="order-item">
                    {item.main_image && (
                      <img 
                        src={`${API_BASE}/storage/products/${item.main_image}`} 
                        alt={item.title}
                      />
                    )}
                    <div className="item-details">
                      <h4>{item.title}</h4>
                      <p>Condition: {item.condition_grade}</p>
                      <p>Qty: {item.quantity}</p>
                      <p>৳{item.total_price.toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="summary-totals">
                <div>Subtotal: ৳{orderSummary.subtotal}</div>
                <div>Shipping: ৳{orderSummary.shipping}</div>
                <div>VAT (5%): ৳{orderSummary.tax}</div>
                <div className="total">Total: ৳{orderSummary.total}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
