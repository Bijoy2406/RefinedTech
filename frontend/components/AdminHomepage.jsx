import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import LottieLoading from './LottieLoading';
import '../css/AdminHomepage.css';
import { UserContext } from '../App.jsx';
const API_BASE = import.meta.env.VITE_API_BASE || 'http://127.0.0.1:8000';

export default function AdminHomepage({ user }) {
    const { user: contextUser } = useContext(UserContext);
    const [currentUser, setCurrentUser] = useState(null);
    const [pendingSellers, setPendingSellers] = useState([]);
    const [pendingAdmins, setPendingAdmins] = useState([]);
    const [pendingBuyers, setPendingBuyers] = useState([]);
    const [activeTab, setActiveTab] = useState('overview');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedUser, setSelectedUser] = useState(null);
    const [userDetails, setUserDetails] = useState(null);
    const [actionLoading, setActionLoading] = useState(null);
    const [stats, setStats] = useState({
        totalUsers: 0,
        pendingCount: 0,
        approvedCount: 0,
        rejectedCount: 0
    });

    // Check if current user is Super Admin (first admin or has special permission)
    const isSuperAdmin = () => {
        return contextUser && (
            contextUser.id === 1 || // First admin is super admin
            contextUser.admin_username === 'superadmin' ||
            contextUser.email === 'admin@refinedtech.com'
        );
    };

    useEffect(() => {
        fetchCurrentUser();
        fetchPendingUsers();
        fetchStats();
    }, []);

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

    const fetchPendingUsers = async () => {
        try {
            const token = localStorage.getItem('rt_token');
            setLoading(true);
            
            const response = await axios.get(`${API_BASE}/api/admin/pending-users`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const pendingUsers = response.data.pending_users || [];
            
            // Separate users by role
            setPendingSellers(pendingUsers.filter(user => user.role === 'Seller'));
            setPendingBuyers(pendingUsers.filter(user => user.role === 'Buyer'));
            setPendingAdmins(pendingUsers.filter(user => user.role === 'Admin'));
            
        } catch (error) {
            console.error('Error fetching pending users:', error);
            setError('Failed to fetch pending users');
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const token = localStorage.getItem('rt_token');
            const [usersResponse, pendingResponse] = await Promise.all([
                axios.get(`${API_BASE}/api/admin/users`, {
                    headers: { Authorization: `Bearer ${token}` }
                }),
                axios.get(`${API_BASE}/api/admin/pending-users`, {
                    headers: { Authorization: `Bearer ${token}` }
                })
            ]);

            const users = usersResponse.data.users || [];
            const pending = pendingResponse.data.pending_users || [];

            setStats({
                totalUsers: users.length + pending.length,
                pendingCount: pending.length,
                approvedCount: users.length,
                rejectedCount: 0 // You might want to add this to your backend
            });
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    const fetchUserDetails = async (user) => {
        try {
            const token = localStorage.getItem('rt_token');
            setSelectedUser(user);
            
            const role = user.role.toLowerCase();
            const response = await axios.get(`${API_BASE}/api/admin/users/${role}/${user.id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUserDetails(response.data.user);
        } catch (error) {
            console.error('Error fetching user details:', error);
            setError('Failed to fetch user details');
        }
    };

    const handleApprove = async (user) => {
        try {
            const token = localStorage.getItem('rt_token');
            setActionLoading(`approve-${user.id}`);
            
            const role = user.role.toLowerCase();
            await axios.put(`${API_BASE}/api/admin/users/${role}/${user.id}/approve`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Remove from pending lists
            if (user.role === 'Seller') {
                setPendingSellers(prev => prev.filter(u => u.id !== user.id));
            } else if (user.role === 'Admin') {
                setPendingAdmins(prev => prev.filter(u => u.id !== user.id));
            } else if (user.role === 'Buyer') {
                setPendingBuyers(prev => prev.filter(u => u.id !== user.id));
            }

            // Refresh stats
            fetchStats();
            
        } catch (error) {
            console.error('Error approving user:', error);
            setError('Failed to approve user');
        } finally {
            setActionLoading(null);
        }
    };

    const handleReject = async (user) => {
        try {
            const token = localStorage.getItem('rt_token');
            setActionLoading(`reject-${user.id}`);
            
            const role = user.role.toLowerCase();
            await axios.put(`${API_BASE}/api/admin/users/${role}/${user.id}/reject`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Remove from pending lists
            if (user.role === 'Seller') {
                setPendingSellers(prev => prev.filter(u => u.id !== user.id));
            } else if (user.role === 'Admin') {
                setPendingAdmins(prev => prev.filter(u => u.id !== user.id));
            } else if (user.role === 'Buyer') {
                setPendingBuyers(prev => prev.filter(u => u.id !== user.id));
            }

            // Refresh stats
            fetchStats();
            
        } catch (error) {
            console.error('Error rejecting user:', error);
            setError('Failed to reject user');
        } finally {
            setActionLoading(null);
        }
    };

    const renderUserCard = (user) => (
        <div key={user.id} className="user-card">
            <div className="user-info">
                <div className="user-avatar">
                    {user.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <div className="user-details">
                    <h4>{user.name}</h4>
                    <p className="user-email">{user.email}</p>
                    <span className={`user-role role-${user.role.toLowerCase()}`}>
                        {user.role}
                    </span>
                    <p className="user-date">
                        Applied: {new Date(user.created_at).toLocaleDateString()}
                    </p>
                </div>
            </div>
            <div className="user-actions">
                <button 
                    className="btn btn-details"
                    onClick={() => fetchUserDetails(user)}
                >
                    View Details
                </button>
                <button 
                    className="btn btn-approve"
                    onClick={() => handleApprove(user)}
                    disabled={actionLoading === `approve-${user.id}`}
                >
                    {actionLoading === `approve-${user.id}` ? 'Approving...' : 'Approve'}
                </button>
                <button 
                    className="btn btn-reject"
                    onClick={() => handleReject(user)}
                    disabled={actionLoading === `reject-${user.id}`}
                >
                    {actionLoading === `reject-${user.id}` ? 'Rejecting...' : 'Reject'}
                </button>
            </div>
        </div>
    );

    const renderStatsCard = (title, value, icon, color) => (
        <div className={`stats-card ${color}`}>
            <div className="stats-icon">{icon}</div>
            <div className="stats-content">
                <h3>{value}</h3>
                <p>{title}</p>
            </div>
        </div>
    );

    if (loading) {
        return <LottieLoading message="Loading dashboard..." />
    }

    return (
        <div className="admin-homepage">
            <div className="admin-header">
                <div className="header-content">
                    <h1>Admin Dashboard</h1>
                    <div className="admin-info">
                        <span className="welcome-text">
                            Welcome back, {contextUser?.name}
                        </span>
                    </div>
                </div>
            </div>

            {error && (
                <div className="error-banner">
                    <span>⚠️ {error}</span>
                    <button onClick={() => setError(null)}>×</button>
                </div>
            )}

            <div className="dashboard-tabs">
                <button 
                    className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
                    onClick={() => setActiveTab('overview')}
                >
                    📊 Overview
                </button>
                <button 
                    className={`tab ${activeTab === 'sellers' ? 'active' : ''}`}
                    onClick={() => setActiveTab('sellers')}
                >
                    🏪 Pending Sellers ({pendingSellers.length})
                </button>
                <button 
                    className={`tab ${activeTab === 'admins' ? 'active' : ''}`}
                    onClick={() => setActiveTab('admins')}
                >
                    👤 Pending Admins ({pendingAdmins.length})
                </button>
            </div>

            <div className="dashboard-content">
                {activeTab === 'overview' && (
                    <div className="overview-section">
                        <div className="stats-grid">
                            {renderStatsCard('Total Users', stats.totalUsers, '👥', 'blue')}
                            {renderStatsCard('Pending Approval', stats.pendingCount, '⏳', 'orange')}
                            {renderStatsCard('Approved Users', stats.approvedCount, '✅', 'green')}
                            {renderStatsCard('Total Sellers', pendingSellers.length, '🏪', 'purple')}
                        </div>
                    </div>
                )}

                {activeTab === 'sellers' && (
                    <div className="users-section">
                        <div className="section-header">
                            <h2>Pending Seller Requests</h2>
                            <p>Review and approve seller applications</p>
                        </div>
                        {pendingSellers.length === 0 ? (
                            <div className="empty-state">
                                <div className="empty-icon">🏪</div>
                                <h3>No pending seller requests</h3>
                                <p>All seller applications have been processed</p>
                            </div>
                        ) : (
                            <div className="users-grid">
                                {pendingSellers.map(renderUserCard)}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'buyers' && isSuperAdmin() && (
                    <div className="users-section">
                        <div className="section-header">
                            <h2>Pending Buyer Requests</h2>
                            <p>Review and approve buyer applications</p>
                            <div className="super-admin-notice">
                                <span>🔐 Super Admin Access Required</span>
                            </div>
                        </div>
                        {pendingBuyers.length === 0 ? (
                            <div className="empty-state">
                                <div className="empty-icon">🛒</div>
                                <h3>No pending buyer requests</h3>
                                <p>All buyer applications have been processed</p>
                            </div>
                        ) : (
                            <div className="users-grid">
                                {pendingBuyers.map(renderUserCard)}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'admins' && (
                    <div className="users-section">
                        <div className="section-header">
                            <h2>Pending Admin Requests</h2>
                            <p>Review and approve admin applications</p>
                        </div>
                        {pendingAdmins.length === 0 ? (
                            <div className="empty-state">
                                <div className="empty-icon">👤</div>
                                <h3>No pending admin requests</h3>
                                <p>All admin applications have been processed</p>
                            </div>
                        ) : (
                            <div className="users-grid">
                                {pendingAdmins.map(renderUserCard)}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* User Details Modal */}
            {selectedUser && (
                <div className="modal-overlay" onClick={() => setSelectedUser(null)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>User Details</h3>
                            <button className="modal-close" onClick={() => setSelectedUser(null)}>×</button>
                        </div>
                        <div className="modal-body">
                            {userDetails ? (
                                <div className="user-details">
                                    <div className="detail-row">
                                        <label>Name:</label>
                                        <span>{userDetails.name}</span>
                                    </div>
                                    <div className="detail-row">
                                        <label>Email:</label>
                                        <span>{userDetails.email}</span>
                                    </div>
                                    <div className="detail-row">
                                        <label>Role:</label>
                                        <span className={`role-badge role-${userDetails.role?.toLowerCase()}`}>
                                            {userDetails.role}
                                        </span>
                                    </div>
                                    <div className="detail-row">
                                        <label>Country:</label>
                                        <span>{userDetails.country}</span>
                                    </div>
                                    <div className="detail-row">
                                        <label>Phone:</label>
                                        <span>{userDetails.phone_number}</span>
                                    </div>
                                    {userDetails.role === 'Seller' && (
                                        <>
                                            <div className="detail-row">
                                                <label>Shop Username:</label>
                                                <span>{userDetails.shop_username}</span>
                                            </div>
                                            <div className="detail-row">
                                                <label>Business Address:</label>
                                                <span>{userDetails.business_address}</span>
                                            </div>
                                            <div className="detail-row">
                                                <label>Date of Birth:</label>
                                                <span>{userDetails.date_of_birth}</span>
                                            </div>
                                        </>
                                    )}
                                    {userDetails.role === 'Admin' && (
                                        <>
                                            <div className="detail-row">
                                                <label>Admin Username:</label>
                                                <span>{userDetails.admin_username}</span>
                                            </div>
                                            <div className="detail-row">
                                                <label>ID Proof Reference:</label>
                                                <span>{userDetails.id_proof_reference}</span>
                                            </div>
                                        </>
                                    )}
                                    <div className="detail-row">
                                        <label>Applied Date:</label>
                                        <span>{new Date(userDetails.created_at).toLocaleString()}</span>
                                    </div>
                                </div>
                            ) : (
                                <div className="loading-details">Loading details...</div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}