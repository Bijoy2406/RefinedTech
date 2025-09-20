<<<<<<< HEAD
import { useState, useEffect, useContext } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { UserContext } from '../App.jsx';
import TiltedCard from './TiltedCard';
import LottieLoading from './LottieLoading';
=======
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
>>>>>>> dev
import '../css/BuyerHomepage.css';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://127.0.0.1:8000';

export default function BuyerHomepage() {
    const navigate = useNavigate();
<<<<<<< HEAD
    const [searchParams, setSearchParams] = useSearchParams();
    const { user } = useContext(UserContext);
=======
>>>>>>> dev
    const [currentUser, setCurrentUser] = useState(null);
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
<<<<<<< HEAD
    
    // Tab state
    const [activeTab, setActiveTab] = useState('products');

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const [productsPerPage] = useState(9); // 3 rows × 3 products per row
    const [paginatedProducts, setPaginatedProducts] = useState([]);
=======
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [showProductModal, setShowProductModal] = useState(false);
>>>>>>> dev

    // Filter states
    const [filters, setFilters] = useState({
        search: '',
        category: '',
        brand: '',
        condition: '',
        minPrice: '',
        maxPrice: '',
        sortBy: 'newest'
    });

    const categories = [
<<<<<<< HEAD
        'Smartphones', 'Laptops', 'Tablets', 'Desktop Computers',
        'Gaming', 'Smart Watches', 'Audio & Headphones', 'Cameras',
=======
        'Smartphones', 'Laptops', 'Tablets', 'Desktop Computers', 
        'Gaming', 'Smart Watches', 'Audio & Headphones', 'Cameras', 
>>>>>>> dev
        'Accessories', 'Other Electronics'
    ];

    const conditions = [
        { value: 'like-new', label: 'Like New ⭐' },
        { value: 'excellent', label: 'Excellent ✨' },
        { value: 'good', label: 'Good 👍' },
        { value: 'fair', label: 'Fair 👌' }
    ];

    const sortOptions = [
        { value: 'newest', label: 'Newest First' },
        { value: 'oldest', label: 'Oldest First' },
        { value: 'price-low', label: 'Price: Low to High' },
        { value: 'price-high', label: 'Price: High to Low' },
        { value: 'popular', label: 'Most Popular' }
    ];

    useEffect(() => {
        fetchCurrentUser();
        fetchProducts();
<<<<<<< HEAD

        // Handle URL parameters
        const categoryParam = searchParams.get('category');
        const productParam = searchParams.get('product');
        const tabParam = searchParams.get('tab');

        if (categoryParam) {
            setFilters(prev => ({
                ...prev,
                category: categoryParam
            }));
        }
        
        if (tabParam && ['products'].includes(tabParam)) {
            setActiveTab(tabParam);
        }

        if (productParam) {
            // Auto-open product modal when product ID is in URL
            setTimeout(() => {
                const product = products.find(p => p.id.toString() === productParam);
                if (product) {
                    handleProductClick(product);
                }
            }, 1000); // Wait for products to load
        }
=======
>>>>>>> dev
    }, []);

    useEffect(() => {
        applyFilters();
    }, [products, filters]);

<<<<<<< HEAD
    // Handle product parameter when products are loaded
    useEffect(() => {
        const productParam = searchParams.get('product');
        if (productParam && products.length > 0) {
            const product = products.find(p => p.id.toString() === productParam);
            if (product) {
                handleProductClick(product);
                // Remove the product parameter from URL after opening
                const newSearchParams = new URLSearchParams(searchParams);
                newSearchParams.delete('product');
                setSearchParams(newSearchParams, { replace: true });
            }
        }
    }, [products, searchParams]);

    useEffect(() => {
        applyPagination();
    }, [filteredProducts, currentPage]);

    // Reset to first page when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [filters]);

=======
>>>>>>> dev
    const fetchCurrentUser = async () => {
        try {
            const token = localStorage.getItem('rt_token');
            const response = await axios.get(`${API_BASE}/api/user`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCurrentUser(response.data);
        } catch (error) {
            console.error('Error fetching current user:', error);
        }
    };

    const fetchProducts = async () => {
        try {
            setLoading(true);
<<<<<<< HEAD
            // Fetch first page to discover pagination
            const first = await axios.get(`${API_BASE}/api/products`, { params: { per_page: 50, page: 1 } });
            const firstItems = first.data?.products || [];
            const pg = first.data?.pagination;

            let all = [...firstItems];
            if (pg && pg.last_page && pg.last_page > 1) {
                const requests = [];
                for (let p = 2; p <= pg.last_page; p++) {
                    requests.push(axios.get(`${API_BASE}/api/products`, { params: { per_page: pg.per_page, page: p } }));
                }
                const results = await Promise.all(requests);
                results.forEach(res => {
                    all = all.concat(res.data?.products || []);
                });
            }

            setProducts(all);
=======
            const response = await axios.get(`${API_BASE}/api/products`);
            setProducts(response.data.products || []);
>>>>>>> dev
        } catch (error) {
            console.error('Error fetching products:', error);
            setError('Failed to fetch products');
        } finally {
            setLoading(false);
        }
    };

<<<<<<< HEAD
    const handleTabChange = (tab) => {
        setActiveTab(tab);
        
        // Update URL
        const newSearchParams = new URLSearchParams(searchParams);
        newSearchParams.set('tab', tab);
        setSearchParams(newSearchParams, { replace: true });
    };

=======
>>>>>>> dev
    const applyFilters = () => {
        let filtered = [...products];

        // Search filter
        if (filters.search) {
            const searchLower = filters.search.toLowerCase();
            filtered = filtered.filter(product =>
                product.title.toLowerCase().includes(searchLower) ||
                product.description?.toLowerCase().includes(searchLower) ||
                product.brand.toLowerCase().includes(searchLower) ||
                product.model.toLowerCase().includes(searchLower)
            );
        }

        // Category filter
        if (filters.category) {
            filtered = filtered.filter(product => product.category === filters.category);
        }

        // Brand filter
        if (filters.brand) {
<<<<<<< HEAD
            filtered = filtered.filter(product =>
=======
            filtered = filtered.filter(product => 
>>>>>>> dev
                product.brand.toLowerCase().includes(filters.brand.toLowerCase())
            );
        }

        // Condition filter
        if (filters.condition) {
            filtered = filtered.filter(product => product.condition_grade === filters.condition);
        }

        // Price filters
        if (filters.minPrice) {
            filtered = filtered.filter(product => parseFloat(product.price) >= parseFloat(filters.minPrice));
        }
        if (filters.maxPrice) {
            filtered = filtered.filter(product => parseFloat(product.price) <= parseFloat(filters.maxPrice));
        }

        // Sorting
        switch (filters.sortBy) {
            case 'newest':
                filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
                break;
            case 'oldest':
                filtered.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
                break;
            case 'price-low':
                filtered.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
                break;
            case 'price-high':
                filtered.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
                break;
            case 'popular':
                filtered.sort((a, b) => (b.views_count || 0) - (a.views_count || 0));
                break;
            default:
                break;
        }

        setFilteredProducts(filtered);
    };

<<<<<<< HEAD
    const applyPagination = () => {
        const startIndex = (currentPage - 1) * productsPerPage;
        const endIndex = startIndex + productsPerPage;
        const paginated = filteredProducts.slice(startIndex, endIndex);
        setPaginatedProducts(paginated);
    };

    const getTotalPages = () => {
        return Math.ceil(filteredProducts.length / productsPerPage);
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
        // Scroll to top of products section
        document.querySelector('.products-section')?.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    };

=======
>>>>>>> dev
    const handleFilterChange = (filterName, value) => {
        setFilters(prev => ({
            ...prev,
            [filterName]: value
        }));
<<<<<<< HEAD

        // Update URL parameters for category filter
        if (filterName === 'category') {
            const newSearchParams = new URLSearchParams(searchParams);
            if (value) {
                newSearchParams.set('category', value);
            } else {
                newSearchParams.delete('category');
            }
            setSearchParams(newSearchParams, { replace: true });
        }
=======
>>>>>>> dev
    };

    const clearFilters = () => {
        setFilters({
            search: '',
            category: '',
            brand: '',
            condition: '',
            minPrice: '',
            maxPrice: '',
            sortBy: 'newest'
        });
<<<<<<< HEAD

        // Clear URL parameters
        setSearchParams({}, { replace: true });
=======
>>>>>>> dev
    };

    const handleProductClick = async (product) => {
        try {
            // Increment view count
            await axios.get(`${API_BASE}/api/products/${product.id}`);
<<<<<<< HEAD
            // Navigate to product details page
            navigate(`/product/${product.id}`);
        } catch (error) {
            console.error('Error viewing product:', error);
            // Still navigate even if view count fails
            navigate(`/product/${product.id}`);
=======
            
            setSelectedProduct(product);
            setShowProductModal(true);
        } catch (error) {
            console.error('Error viewing product:', error);
            setSelectedProduct(product);
            setShowProductModal(true);
>>>>>>> dev
        }
    };

    const getConditionBadgeClass = (condition) => {
        const classes = {
            'like-new': 'condition-like-new',
            'excellent': 'condition-excellent',
            'good': 'condition-good',
            'fair': 'condition-fair'
        };
        return classes[condition] || 'condition-fair';
    };

    const formatPrice = (price) => {
<<<<<<< HEAD
        return `৳${parseFloat(price).toLocaleString()}`;
=======
        return `$${parseFloat(price).toFixed(2)}`;
>>>>>>> dev
    };

    const calculateSavings = (price, originalPrice) => {
        if (!originalPrice || originalPrice <= price) return null;
        const savings = originalPrice - price;
        const percentage = ((savings / originalPrice) * 100).toFixed(0);
        return { amount: savings, percentage };
    };

    const renderProductCard = (product) => {
        const savings = calculateSavings(product.price, product.original_price);
<<<<<<< HEAD

        const overlayContent = (
            <div className="product-badges">
                {product.is_featured && (
                    <span className="featured-badge">⭐ Featured</span>
                )}
                {product.is_urgent_sale && (
                    <span className="urgent-badge">🔥 Urgent</span>
                )}
                {savings && (
                    <span className="discount-badge">-{savings.percentage}%</span>
                )}
            </div>
        );

        const cardContent = (
            <div className="buyer-product-card-inner">
                <div className="product-image">
                    {product.images && product.images.length > 0 ? (
                        <div className="product-image-container">
                            <img 
                                src={`${API_BASE}${product.images[0]}`} 
                                alt={product.title}
                                className="product-img"
                            />
                            <div className="product-badges">
                                {product.is_featured && (
                                    <span className="featured-badge">⭐ Featured</span>
                                )}
                                {product.is_urgent_sale && (
                                    <span className="urgent-badge">🔥 Urgent</span>
                                )}
                                {savings && (
                                    <span className="discount-badge">-{savings.percentage}%</span>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="no-image">📷</div>
                    )}
                </div>

                <div className="product-info">
                    <h3 className="product-title">{product.title}</h3>
                    <div className="product-details">
                        <span className="brand-model">{product.brand} {product.model}</span>
=======
        
        return (
            <div 
                key={product.id} 
                className="product-card"
                onClick={() => handleProductClick(product)}
            >
                <div className="product-image">
                    {product.images && product.images.length > 0 ? (
                        <img src={product.images[0]} alt={product.title} />
                    ) : (
                        <div className="no-image">📷</div>
                    )}
                    {product.is_featured && (
                        <div className="featured-badge">⭐ Featured</div>
                    )}
                    {product.is_urgent_sale && (
                        <div className="urgent-badge">🔥 Urgent</div>
                    )}
                    {savings && (
                        <div className="discount-badge">-{savings.percentage}%</div>
                    )}
                </div>
                
                <div className="product-info">
                    <h4 className="product-title">{product.title}</h4>
                    <p className="product-brand">{product.brand} {product.model}</p>
                    
                    <div className="condition-info">
>>>>>>> dev
                        <span className={`condition-badge ${getConditionBadgeClass(product.condition_grade)}`}>
                            {product.condition_grade?.replace('-', ' ')}
                        </span>
                    </div>
<<<<<<< HEAD
                    <div className="price-info">
                        <span className="current-price2">{formatPrice(product.price)}</span>
                        {product.original_price && product.original_price > product.price && (
                            <span className="original-price2">{formatPrice(product.original_price)}</span>
                        )}
                    </div>
                    <div className="product-location">
                        <span>📍 {product.location_city}, {product.location_state}</span>
=======

                    <div className="price-info">
                        <span className="current-price">{formatPrice(product.price)}</span>
                        {product.original_price && product.original_price > product.price && (
                            <span className="original-price">{formatPrice(product.original_price)}</span>
                        )}
                    </div>

                    <div className="product-meta">
                        <span className="location">📍 {product.location_city}, {product.location_state}</span>
                        <span className="views">👁️ {product.views_count || 0} views</span>
                    </div>

                    <div className="seller-info">
                        <span>Sold by: {product.seller?.shop_username || 'Seller'}</span>
>>>>>>> dev
                    </div>
                </div>
            </div>
        );
<<<<<<< HEAD

        return (
            <div
                key={product.id}
                className="buyer-product-card"
                onClick={() => handleProductClick(product)}
            >
                <TiltedCard
                    imageSrc="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMSIgaGVpZ2h0PSIxIiB2aWV3Qm94PSIwIDAgMSAxIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjwvc3ZnPg=="
                    altText={product.title}
                    containerHeight="100%"
                    containerWidth="100%"
                    imageHeight="100%"
                    imageWidth="100%"
                    scaleOnHover={1.03}
                    rotateAmplitude={8}
                    showMobileWarning={false}
                    showTooltip={false}
                    overlayContent={cardContent}
                    displayOverlayContent={true}
                />
            </div>
        );
    };

    if (loading) {
        return <LottieLoading message="Loading products..." />
=======
    };

    if (loading) {
        return (
            <div className="buyer-homepage loading-state">
                <div className="loading-spinner">
                    <div className="spinner"></div>
                    <p>Loading products...</p>
                </div>
            </div>
        );
>>>>>>> dev
    }

    return (
        <div className="buyer-homepage">
            {/* Header */}
            <div className="buyer-header">
                <div className="header-content">
<<<<<<< HEAD
                    <h1>Buyer Dashboard</h1>
                    <div className="tab-navigation">
                        <button 
                            className={`tab-btn ${activeTab === 'products' ? 'active' : ''}`}
                            onClick={() => handleTabChange('products')}
                        >
                            🛍️ Browse Products
                        </button>
                        <button 
                            className={`tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
                            onClick={() => navigate('/orders')}
                        >
                            📦 My Orders
                        </button>
                        <button 
                            className={`tab-btn ${activeTab === 'cart' ? 'active' : ''}`}
                            onClick={() => navigate('/cart')}
                        >
                            🛒 Shopping Cart
                        </button>
                        <button 
                            className={`tab-btn ${activeTab === 'wishlist' ? 'active' : ''}`}
                            onClick={() => navigate('/wishlist')}
                        >
                            ❤️ Wishlist
                        </button>
=======
                    <h1>Discover Refurbished Tech</h1>
                    <p>Welcome back, {currentUser?.name || 'Buyer'}! Find great deals on quality refurbished electronics.</p>
                </div>
                <div className="header-stats">
                    <div className="stat">
                        <span className="stat-number">{products.length}</span>
                        <span className="stat-label">Products Available</span>
                    </div>
                    <div className="stat">
                        <span className="stat-number">{filteredProducts.length}</span>
                        <span className="stat-label">Matching Your Search</span>
>>>>>>> dev
                    </div>
                </div>
            </div>

            {error && (
                <div className="alert alert-error">
                    <span>⚠️ {error}</span>
                    <button onClick={() => setError(null)}>×</button>
                </div>
            )}

<<<<<<< HEAD
            {/* Tab Content */}
            {activeTab === 'products' && (
                <>
                    {/* Filters Section */}
                    <div className="filters-section">
                        <div className="filters-header">
=======
            {/* Filters Section */}
            <div className="filters-section">
                <div className="filters-header">
>>>>>>> dev
                    <h3>🔍 Filter Products</h3>
                    <button className="clear-filters-btn" onClick={clearFilters}>
                        Clear All Filters
                    </button>
                </div>
<<<<<<< HEAD

=======
                
>>>>>>> dev
                <div className="filters-grid">
                    {/* Search */}
                    <div className="filter-group">
                        <label>Search</label>
                        <input
                            type="text"
                            placeholder="Search products, brands, models..."
                            value={filters.search}
                            onChange={(e) => handleFilterChange('search', e.target.value)}
                        />
                    </div>

                    {/* Category */}
                    <div className="filter-group">
                        <label>Category</label>
                        <select
                            value={filters.category}
                            onChange={(e) => handleFilterChange('category', e.target.value)}
                        >
                            <option value="">All Categories</option>
                            {categories.map(category => (
                                <option key={category} value={category}>{category}</option>
                            ))}
                        </select>
                    </div>

                    {/* Brand */}
                    <div className="filter-group">
                        <label>Brand</label>
                        <input
                            type="text"
                            placeholder="Filter by brand..."
                            value={filters.brand}
                            onChange={(e) => handleFilterChange('brand', e.target.value)}
                        />
                    </div>

                    {/* Condition */}
                    <div className="filter-group">
                        <label>Condition</label>
                        <select
                            value={filters.condition}
                            onChange={(e) => handleFilterChange('condition', e.target.value)}
                        >
                            <option value="">All Conditions</option>
                            {conditions.map(condition => (
                                <option key={condition.value} value={condition.value}>
                                    {condition.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Price Range */}
                    <div className="filter-group">
                        <label>Min Price</label>
                        <input
                            type="number"
<<<<<<< HEAD
                            placeholder="৳0"
=======
                            placeholder="$0"
>>>>>>> dev
                            value={filters.minPrice}
                            onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                        />
                    </div>

                    <div className="filter-group">
                        <label>Max Price</label>
                        <input
                            type="number"
<<<<<<< HEAD
                            placeholder="৳100000"
=======
                            placeholder="$10000"
>>>>>>> dev
                            value={filters.maxPrice}
                            onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                        />
                    </div>

                    {/* Sort By */}
                    <div className="filter-group">
                        <label>Sort By</label>
                        <select
                            value={filters.sortBy}
                            onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                        >
                            {sortOptions.map(option => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Products Grid */}
            <div className="products-section">
                <div className="section-header">
                    <h2>Available Products</h2>
<<<<<<< HEAD
                    <div className="pagination-info">
                        Showing {((currentPage - 1) * productsPerPage) + 1} to {Math.min(currentPage * productsPerPage, filteredProducts.length)} of {filteredProducts.length} products
                    </div>                </div>
=======
                    <p>Showing {filteredProducts.length} of {products.length} products</p>
                </div>
>>>>>>> dev

                {filteredProducts.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">🔍</div>
                        <h3>No products found</h3>
                        <p>Try adjusting your filters or search terms</p>
                        <button className="btn btn-primary" onClick={clearFilters}>
                            Clear Filters
                        </button>
                    </div>
                ) : (
<<<<<<< HEAD
                    <>
                        <div className="products-grid">
                            {paginatedProducts.map(renderProductCard)}
                        </div>

                        {/* Pagination */}
                        {getTotalPages() > 1 && (
                            <div className="pagination-container">
                                <div className="pagination">
                                    <button
                                        className="pagination-btn"
                                        onClick={() => handlePageChange(currentPage - 1)}
                                        disabled={currentPage === 1}
                                    >
                                        ⬅️ Previous
                                    </button>

                                    <div className="pagination-numbers">
                                        {Array.from({ length: getTotalPages() }, (_, i) => i + 1).map(page => (
                                            <button
                                                key={page}
                                                className={`pagination-number ${currentPage === page ? 'active' : ''}`}
                                                onClick={() => handlePageChange(page)}
                                            >
                                                {page}
                                            </button>
                                        ))}
                                    </div>

                                    <button
                                        className="pagination-btn"
                                        onClick={() => handlePageChange(currentPage + 1)}
                                        disabled={currentPage === getTotalPages()}
                                    >
                                        Next ➡️
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
                </div>
            </>
            )}

=======
                    <div className="products-grid">
                        {filteredProducts.map(renderProductCard)}
                    </div>
                )}
            </div>

            {/* Product Detail Modal */}
            {showProductModal && selectedProduct && (
                <div className="modal-overlay" onClick={() => setShowProductModal(false)}>
                    <div className="modal-content product-detail-modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>{selectedProduct.title}</h3>
                            <button className="modal-close" onClick={() => setShowProductModal(false)}>×</button>
                        </div>
                        <div className="modal-body">
                            <div className="product-detail-content">
                                <div className="product-images">
                                    {selectedProduct.images && selectedProduct.images.length > 0 ? (
                                        <img src={selectedProduct.images[0]} alt={selectedProduct.title} />
                                    ) : (
                                        <div className="no-image-large">📷</div>
                                    )}
                                </div>
                                
                                <div className="product-details">
                                    <div className="detail-section">
                                        <h4>Product Information</h4>
                                        <div className="detail-grid">
                                            <div><strong>Brand:</strong> {selectedProduct.brand}</div>
                                            <div><strong>Model:</strong> {selectedProduct.model}</div>
                                            <div><strong>Category:</strong> {selectedProduct.category}</div>
                                            <div><strong>Condition:</strong> 
                                                <span className={`condition-badge ${getConditionBadgeClass(selectedProduct.condition_grade)}`}>
                                                    {selectedProduct.condition_grade?.replace('-', ' ')}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {selectedProduct.description && (
                                        <div className="detail-section">
                                            <h4>Description</h4>
                                            <p>{selectedProduct.description}</p>
                                        </div>
                                    )}

                                    <div className="detail-section">
                                        <h4>Specifications</h4>
                                        <div className="detail-grid">
                                            {selectedProduct.storage_capacity && <div><strong>Storage:</strong> {selectedProduct.storage_capacity}</div>}
                                            {selectedProduct.ram_memory && <div><strong>RAM:</strong> {selectedProduct.ram_memory}</div>}
                                            {selectedProduct.processor && <div><strong>Processor:</strong> {selectedProduct.processor}</div>}
                                            {selectedProduct.operating_system && <div><strong>OS:</strong> {selectedProduct.operating_system}</div>}
                                            {selectedProduct.screen_size && <div><strong>Screen:</strong> {selectedProduct.screen_size}</div>}
                                            {selectedProduct.color && <div><strong>Color:</strong> {selectedProduct.color}</div>}
                                            {selectedProduct.battery_health && <div><strong>Battery:</strong> {selectedProduct.battery_health}</div>}
                                        </div>
                                    </div>

                                    <div className="detail-section">
                                        <h4>Pricing & Availability</h4>
                                        <div className="price-details">
                                            <div className="current-price-large">{formatPrice(selectedProduct.price)}</div>
                                            {selectedProduct.original_price && selectedProduct.original_price > selectedProduct.price && (
                                                <div className="original-price-large">{formatPrice(selectedProduct.original_price)}</div>
                                            )}
                                            {selectedProduct.negotiable && (
                                                <div className="negotiable-info">💬 Price is negotiable</div>
                                            )}
                                        </div>
                                        <div><strong>Quantity Available:</strong> {selectedProduct.quantity_available}</div>
                                        {selectedProduct.warranty_period && <div><strong>Warranty:</strong> {selectedProduct.warranty_period}</div>}
                                    </div>

                                    <div className="detail-section">
                                        <h4>Seller Information</h4>
                                        <div><strong>Seller:</strong> {selectedProduct.seller?.shop_username || 'Seller'}</div>
                                        <div><strong>Location:</strong> {selectedProduct.location_city}, {selectedProduct.location_state}</div>
                                    </div>

                                    {selectedProduct.included_accessories && (
                                        <div className="detail-section">
                                            <h4>Included Accessories</h4>
                                            <p>{selectedProduct.included_accessories}</p>
                                        </div>
                                    )}

                                    {selectedProduct.defects_issues && (
                                        <div className="detail-section">
                                            <h4>Known Issues</h4>
                                            <p>{selectedProduct.defects_issues}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={() => setShowProductModal(false)}>
                                Close
                            </button>
                            <button className="btn btn-primary">
                                💬 Contact Seller
                            </button>
                            <button className="btn btn-success">
                                🛒 Buy Now
                            </button>
                        </div>
                    </div>
                </div>
            )}
>>>>>>> dev
        </div>
    );
}
