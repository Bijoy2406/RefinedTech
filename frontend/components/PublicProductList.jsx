import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';
import '../css/PublicProductList.css';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://127.0.0.1:8000';

export default function PublicProductList() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');

  const categories = [
    'Smartphones', 'Laptops', 'Tablets', 'Desktop Computers',
    'Gaming', 'Smart Watches', 'Audio & Headphones', 'Cameras',
    'Accessories', 'Other Electronics'
  ];

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE}/api/products`);
      let allProducts = response.data.products || [];

      if (selectedCategory) {
        allProducts = allProducts.filter(product => product.category === selectedCategory);
      }

      setProducts(allProducts);
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    navigate(`/products?category=${encodeURIComponent(category)}`);
  };

  const handleProductClick = (product) => {
    navigate(`/product/${product.id}`);
  };

  const formatPrice = (price) => {
    return `৳${parseFloat(price).toFixed(2)}`;
  };

  return (
    <div className="public-product-list">
      <div className="container">
        <h1>Browse Products</h1>

        {/* Category Filter */}
        <div className="category-filter">
          <button
            className={selectedCategory === '' ? 'active' : ''}
            onClick={() => handleCategoryChange('')}
          >
            All Categories
          </button>
          {categories.map(category => (
            <button
              key={category}
              className={selectedCategory === category ? 'active' : ''}
              onClick={() => handleCategoryChange(category)}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="loading">Loading products...</div>
        ) : (
          <div className="products-grid">
            {products.length > 0 ? (
              products.map(product => (
                <div
                  key={product.id}
                  className="product-card"
                  onClick={() => handleProductClick(product)}
                >
                  <div className="product-image">
                    {product.images && product.images.length > 0 ? (
                      <img src={`${API_BASE}${product.images[0]}`} alt={product.title} />
                    ) : (
                      <div className="placeholder-image">
                        {product.category === 'Smartphones' && '📱'}
                        {product.category === 'Laptops' && '💻'}
                        {product.category === 'Tablets' && '📱'}
                        {product.category === 'Desktop Computers' && '🖥️'}
                        {product.category === 'Audio & Headphones' && '🎧'}
                        {product.category === 'Gaming' && '🎮'}
                        {product.category === 'Smart Watches' && '⌚'}
                        {product.category === 'Cameras' && '📷'}
                        {product.category === 'Accessories' && '🔌'}
                        {product.category === 'Other Electronics' && '📦'}
                      </div>
                    )}
                  </div>
                  <div className="product-info">
                    <h3>{product.title}</h3>
                    <p className="price">{formatPrice(product.price)}</p>
                    <p className="location">📍 {product.location_city}</p>
                    <p className="seller">👤 {product.seller?.shop_username || 'Seller'}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-products">
                <p>No products found in this category.</p>
              </div>
            )}
          </div>
        )}

        {/* Login Prompt */}
        <div className="login-prompt">
          <p>Want to buy these products?</p>
          <Link to="/login" className="btn primary">Login to Purchase</Link>
          <Link to="/signup/buyer" className="btn secondary">Create Account</Link>
        </div>
      </div>
    </div>
  );
}
