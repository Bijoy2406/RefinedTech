import { useState, useEffect } from 'react';
import axios from 'axios';
import '../css/Dashboard.css';
import { useState, useEffect } from 'react'
import axios from 'axios'
import '../css/Dashboard.css'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://127.0.0.1:8000';

export default function Dashboard() {
    const [users, setUsers] = useState([]);
    const [pendingUsers, setPendingUsers] = useState([]);
    const [activeTab, setActiveTab] = useState('users');
    const [removingUserId, setRemovingUserId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedUser, setSelectedUser] = useState(null);
    const [userDetails, setUserDetails] = useState(null);
    const [loadingUserDetails, setLoadingUserDetails] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('rt_token');

        if (!token) {
            console.error('No auth token found');
            setError('No authentication token found');
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        if (activeTab === 'users') {
            axios.get(`${API_BASE}/api/admin/users`, { headers: { Authorization: `Bearer ${token}` } })
                .then(response => {
                    // Ensure response.data is an array before setting it
                    if (Array.isArray(response.data)) {
                        setUsers(response.data);
                    } else if (response.data && Array.isArray(response.data.users)) {
                        setUsers(response.data.users);
                    } else {
                        console.error('Users API did not return an array:', response.data);
                        setUsers([]);
                    }
                })
                .catch(error => {
                    console.error('Error fetching users:', error);
                    setError('Failed to fetch users: ' + (error.response?.data?.error || error.message));
                    setUsers([]);
                })
                .finally(() => setLoading(false));
        } else {
            axios.get(`${API_BASE}/api/admin/pending-users`, { headers: { Authorization: `Bearer ${token}` } })
                .then(response => {
                    // Ensure response.data is an array before setting it
                    if (Array.isArray(response.data)) {
                        setPendingUsers(response.data);
                    } else if (response.data && Array.isArray(response.data.pending_users)) {
                        setPendingUsers(response.data.pending_users);
                    } else {
                        console.error('Pending users API did not return an array:', response.data);
                        setPendingUsers([]);
                    }
                })
                .catch(error => {
                    console.error('Error fetching pending users:', error);
                    setError('Failed to fetch pending users: ' + (error.response?.data?.error || error.message));
                    setPendingUsers([]);
                })
                .finally(() => setLoading(false));
        }
    }, [activeTab]);

    const fetchUserDetails = async (user) => {
        const token = localStorage.getItem('rt_token');
        setLoadingUserDetails(true);
        setSelectedUser(user);
        
        try {
            const role = user.role.toLowerCase();
            const response = await axios.get(`${API_BASE}/api/admin/users/${role}/${user.id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUserDetails(response.data.user);
        } catch (error) {
            console.error('Error fetching user details:', error);
            setError('Failed to fetch user details: ' + (error.response?.data?.error || error.message));
            setUserDetails(null);
        } finally {
            setLoadingUserDetails(false);
        }
    };

    const closeUserDetails = () => {
        setSelectedUser(null);
        setUserDetails(null);
    };

    const handleApprove = (user) => {
        const token = localStorage.getItem('rt_token');
        setRemovingUserId(user.id);
        // Use the correct API endpoint format: /users/{role}/{id}/approve
        const role = user.role.toLowerCase();
        axios.put(`${API_BASE}/api/admin/users/${role}/${user.id}/approve`, {}, { headers: { Authorization: `Bearer ${token}` } })
            .then(() => {
                setTimeout(() => {
                    setPendingUsers(pendingUsers.filter(u => u.id !== user.id));
                    setRemovingUserId(null);
                }, 500); // Corresponds to animation duration
            })
            .catch(error => {
                console.error('Error approving user:', error);
                setError('Failed to approve user: ' + (error.response?.data?.error || error.message));
                setRemovingUserId(null);
            });
    };

    const handleReject = (user) => {
        const token = localStorage.getItem('rt_token');
        setRemovingUserId(user.id);
        // Use the correct API endpoint format: /users/{role}/{id}/reject
        const role = user.role.toLowerCase();
        axios.put(`${API_BASE}/api/admin/users/${role}/${user.id}/reject`, {}, { headers: { Authorization: `Bearer ${token}` } })
            .then(() => {
                setTimeout(() => {
                    setPendingUsers(pendingUsers.filter(u => u.id !== user.id));
                    setRemovingUserId(null);
                }, 500); // Corresponds to animation duration
            })
            .catch(error => {
                console.error('Error rejecting user:', error);
                setError('Failed to reject user: ' + (error.response?.data?.error || error.message));
                setRemovingUserId(null);
            });
    };

    return (
        <div className="dashboard-container dashboard-fade-in">
            <h1>🎛️ Admin Dashboard</h1>
            
            {error && (
                <div className="error-message">
                    {error}
                </div>
            )}
            
            <div className="tabs">
                <button 
                    onClick={() => setActiveTab('users')} 
                    className={activeTab === 'users' ? 'active' : ''}
                >
                    👥 Users ({users.length})
                </button>
                <button 
                    onClick={() => setActiveTab('pending')} 
                    className={activeTab === 'pending' ? 'active' : ''}
                >
                    ⏳ Pending Approvals ({pendingUsers.length})
                </button>
            </div>
            
            {loading ? (
                <div className="loading">
                    Loading dashboard data...
                </div>
            ) : activeTab === 'users' ? (
                <div className="dashboard-slide-up">
                    <ul className="user-list">
                        {users.length > 0 ? users.map(user => (
                            <li key={user.id} className="dashboard-fade-in">
                                <div className="user-info">
                                    <span className="name">{user.name}</span>
                                    <span className="email">{user.email}</span>
                                    <span className="role">{user.role}</span>
                                </div>
                            </li>
                        )) : (
                            <li style={{textAlign: 'center', padding: '20px', color: '#666'}}>
                                No users found
                            </li>
                        )}
                    </ul>
                </div>
            ) : (
                <div className="dashboard-slide-up">
                    {selectedUser ? (
                        <div className="user-details-modal" style={{
                            position: 'fixed',
                            top: '0',
                            left: '0',
                            width: '100%',
                            height: '100%',
                            background: 'var(--modal-overlay)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            zIndex: 'var(--z-modal)',
                            backdropFilter: 'var(--modal-backdrop)',
                            WebkitBackdropFilter: 'var(--modal-backdrop)'
                        }}>
                            <div className="user-details-content" style={{
                                background: 'var(--modal-bg)',
                                padding: '30px',
                                borderRadius: 'var(--radius-lg)',
                                maxWidth: '600px',
                                maxHeight: '80vh',
                                overflowY: 'auto',
                                width: '90%',
                                position: 'relative',
                                boxShadow: 'var(--modal-shadow)',
                                border: '1px solid var(--card-border)',
                                backdropFilter: 'var(--modal-backdrop)',
                                WebkitBackdropFilter: 'var(--modal-backdrop)'
                            }}>
                                <button 
                                    onClick={closeUserDetails}
                                    style={{
                                        position: 'absolute',
                                        top: '15px',
                                        right: '20px',
                                        background: 'var(--color-error-bg)',
                                        border: '1px solid var(--color-error-border)',
                                        borderRadius: '50%',
                                        width: '32px',
                                        height: '32px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '18px',
                                        cursor: 'pointer',
                                        color: 'var(--color-error)',
                                        transition: 'all var(--transition-normal)'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.target.style.background = 'var(--color-error)'
                                        e.target.style.color = 'white'
                                        e.target.style.transform = 'scale(1.1)'
                                    }}
                                    onMouseLeave={(e) => {
                                        e.target.style.background = 'var(--color-error-bg)'
                                        e.target.style.color = 'var(--color-error)'
                                        e.target.style.transform = 'scale(1)'
                                    }}
                                >
                                    ✕
                                </button>
                                
                                <h2 style={{
                                    marginBottom: '20px', 
                                    color: 'var(--text-primary)',
                                    background: 'linear-gradient(135deg, var(--color-primary), var(--color-primary-light))',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    backgroundClip: 'text',
                                    fontSize: 'var(--font-size-xl)',
                                    fontWeight: '600'
                                }}>
                                    👤 User Details
                                </h2>
                                
                                {loadingUserDetails ? (
                                    <div className="loading">
                                        Loading user details...
                                    </div>
                                ) : userDetails ? (
                                    <div className="user-detail-info" style={{
                                        lineHeight: '1.6',
                                        color: 'var(--text-primary)'
                                    }}>
                                        <div style={{
                                            marginBottom: '15px',
                                            padding: 'var(--spacing-sm)',
                                            background: 'var(--card-bg)',
                                            borderRadius: 'var(--radius-md)',
                                            border: '1px solid var(--card-border)'
                                        }}>
                                            <strong style={{color: 'var(--text-primary)'}}>👤 Name:</strong> {userDetails.name || 'N/A'}
                                        </div>
                                        <div style={{
                                            marginBottom: '15px',
                                            padding: 'var(--spacing-sm)',
                                            background: 'var(--card-bg)',
                                            borderRadius: 'var(--radius-md)',
                                            border: '1px solid var(--card-border)'
                                        }}>
                                            <strong style={{color: 'var(--text-primary)'}}>👨 First Name:</strong> {userDetails.first_name || 'N/A'}
                                        </div>
                                        <div style={{
                                            marginBottom: '15px',
                                            padding: 'var(--spacing-sm)',
                                            background: 'var(--card-bg)',
                                            borderRadius: 'var(--radius-md)',
                                            border: '1px solid var(--card-border)'
                                        }}>
                                            <strong style={{color: 'var(--text-primary)'}}>👩 Last Name:</strong> {userDetails.last_name || 'N/A'}
                                        </div>
                                        <div style={{
                                            marginBottom: '15px',
                                            padding: 'var(--spacing-sm)',
                                            background: 'var(--card-bg)',
                                            borderRadius: 'var(--radius-md)',
                                            border: '1px solid var(--card-border)'
                                        }}>
                                            <strong style={{color: 'var(--text-primary)'}}>📧 Email:</strong> {userDetails.email || 'N/A'}
                                        </div>
                                        <div style={{
                                            marginBottom: '15px',
                                            padding: 'var(--spacing-sm)',
                                            background: 'var(--card-bg)',
                                            borderRadius: 'var(--radius-md)',
                                            border: '1px solid var(--card-border)'
                                        }}>
                                            <strong style={{color: 'var(--text-primary)'}}>🎭 Role:</strong> {userDetails.role || 'N/A'}
                                        </div>
                                        <div style={{
                                            marginBottom: '15px',
                                            padding: 'var(--spacing-sm)',
                                            background: 'var(--card-bg)',
                                            borderRadius: 'var(--radius-md)',
                                            border: '1px solid var(--card-border)'
                                        }}>
                                            <strong style={{color: 'var(--text-primary)'}}>📊 Status:</strong> 
                                            <span style={{
                                                color: userDetails.status === 'approved' ? 'var(--color-success)' : 
                                                       userDetails.status === 'rejected' ? 'var(--color-error)' : 
                                                       'var(--color-warning)',
                                                fontWeight: 'bold',
                                                marginLeft: 'var(--spacing-xs)',
                                                padding: 'var(--spacing-xs) var(--spacing-sm)',
                                                borderRadius: 'var(--radius-sm)',
                                                background: userDetails.status === 'approved' ? 'var(--color-success-bg)' : 
                                                           userDetails.status === 'rejected' ? 'var(--color-error-bg)' : 
                                                           'var(--color-warning-bg)'
                                            }}>
                                                {userDetails.status === 'approved' ? '✅' : 
                                                 userDetails.status === 'rejected' ? '❌' : '⏳'} {userDetails.status || 'N/A'}
                                            </span>
                                        </div>
                                        <div style={{marginBottom: '15px'}}>
                                            <strong>Phone Number:</strong> {userDetails.phone_number || 'N/A'}
                                        </div>
                                        <div style={{marginBottom: '15px'}}>
                                            <strong>Country:</strong> {userDetails.country || 'N/A'}
                                        </div>
                                        <div style={{marginBottom: '15px'}}>
                                            <strong>Created At:</strong> {userDetails.created_at ? new Date(userDetails.created_at).toLocaleDateString() : 'N/A'}
                                        </div>
                                        
                                        {/* Role-specific information */}
                                        {userDetails.role === 'Seller' && (
                                            <div style={{marginTop: '20px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '5px'}}>
                                                <h4 style={{marginBottom: '15px', color: '#333'}}>Seller Information</h4>
                                                <div style={{marginBottom: '15px'}}>
                                                    <strong>Shop Username:</strong> {userDetails.shop_username || 'N/A'}
                                                </div>
                                                <div style={{marginBottom: '15px'}}>
                                                    <strong>Date of Birth:</strong> {userDetails.date_of_birth || 'N/A'}
                                                </div>
                                                <div style={{marginBottom: '15px'}}>
                                                    <strong>Business Address:</strong> {userDetails.business_address || 'N/A'}
                                                </div>
                                                
                                                {/* Document previews with images */}
                                                <div style={{marginBottom: '20px'}}>
                                                    <h5 style={{marginBottom: '10px', color: '#555'}}>Verification Documents:</h5>
                                                    
                                                    {userDetails.national_id_path ? (
                                                        <div style={{marginBottom: '15px', padding: '10px', border: '1px solid #ddd', borderRadius: '5px'}}>
                                                            <strong>National ID Document:</strong>
                                                            <div style={{marginTop: '10px'}}>
                                                                <img 
                                                                    src={`${API_BASE}/storage/${userDetails.national_id_path}`} 
                                                                    alt="National ID" 
                                                                    style={{
                                                                        maxWidth: '200px', 
                                                                        maxHeight: '150px', 
                                                                        objectFit: 'contain',
                                                                        border: '1px solid #ccc',
                                                                        borderRadius: '4px',
                                                                        display: 'block',
                                                                        marginBottom: '10px'
                                                                    }}
                                                                    onError={(e) => {
                                                                        e.target.style.display = 'none';
                                                                        e.target.nextSibling.style.display = 'inline';
                                                                    }}
                                                                />
                                                                <a 
                                                                    href={`${API_BASE}/storage/${userDetails.national_id_path}`} 
                                                                    target="_blank" 
                                                                    rel="noopener noreferrer" 
                                                                    style={{color: '#007bff', textDecoration: 'none', fontSize: '14px'}}
                                                                >
                                                                    📄 Open Full Size Document
                                                                </a>
                                                                <span style={{display: 'none', color: '#666'}}>
                                                                    📄 <a 
                                                                        href={`${API_BASE}/storage/${userDetails.national_id_path}`} 
                                                                        target="_blank" 
                                                                        rel="noopener noreferrer" 
                                                                        style={{color: '#007bff'}}
                                                                    >
                                                                        View National ID Document
                                                                    </a>
                                                                </span>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div style={{marginBottom: '15px', color: '#666'}}>
                                                            <strong>National ID:</strong> No document uploaded
                                                        </div>
                                                    )}
                                                    
                                                    {userDetails.proof_of_ownership_path ? (
                                                        <div style={{marginBottom: '15px', padding: '10px', border: '1px solid #ddd', borderRadius: '5px'}}>
                                                            <strong>Proof of Ownership Document:</strong>
                                                            <div style={{marginTop: '10px'}}>
                                                                <img 
                                                                    src={`${API_BASE}/storage/${userDetails.proof_of_ownership_path}`} 
                                                                    alt="Proof of Ownership" 
                                                                    style={{
                                                                        maxWidth: '200px', 
                                                                        maxHeight: '150px', 
                                                                        objectFit: 'contain',
                                                                        border: '1px solid #ccc',
                                                                        borderRadius: '4px',
                                                                        display: 'block',
                                                                        marginBottom: '10px'
                                                                    }}
                                                                    onError={(e) => {
                                                                        e.target.style.display = 'none';
                                                                        e.target.nextSibling.style.display = 'inline';
                                                                    }}
                                                                />
                                                                <a 
                                                                    href={`${API_BASE}/storage/${userDetails.proof_of_ownership_path}`} 
                                                                    target="_blank" 
                                                                    rel="noopener noreferrer" 
                                                                    style={{color: '#007bff', textDecoration: 'none', fontSize: '14px'}}
                                                                >
                                                                    📄 Open Full Size Document
                                                                </a>
                                                                <span style={{display: 'none', color: '#666'}}>
                                                                    📄 <a 
                                                                        href={`${API_BASE}/storage/${userDetails.proof_of_ownership_path}`} 
                                                                        target="_blank" 
                                                                        rel="noopener noreferrer" 
                                                                        style={{color: '#007bff'}}
                                                                    >
                                                                        View Proof of Ownership Document
                                                                    </a>
                                                                </span>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div style={{marginBottom: '15px', color: '#666'}}>
                                                            <strong>Proof of Ownership:</strong> No document uploaded
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                        
                                        {userDetails.role === 'Admin' && (
                                            <div style={{marginTop: '20px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '5px'}}>
                                                <h4 style={{marginBottom: '15px', color: '#333'}}>Admin Information</h4>
                                                <div style={{marginBottom: '15px'}}>
                                                    <strong>Admin Username:</strong> {userDetails.admin_username || 'N/A'}
                                                </div>
                                                <div style={{marginBottom: '15px'}}>
                                                    <strong>ID Proof Reference:</strong> {userDetails.id_proof_reference || 'N/A'}
                                                </div>
                                                <div style={{marginBottom: '15px'}}>
                                                    <strong>Admin Access Code:</strong> {userDetails.admin_access_code || 'N/A'}
                                                </div>
                                            </div>
                                        )}
                                        
                                        {userDetails.status === 'pending' && (
                                            <div className="action-buttons" style={{marginTop: '25px', display: 'flex', gap: '10px', justifyContent: 'center'}}>
                                                <button 
                                                    onClick={() => {
                                                        handleApprove(userDetails);
                                                        closeUserDetails();
                                                    }} 
                                                    className="approve-btn"
                                                    style={{
                                                        backgroundColor: '#28a745',
                                                        color: 'white',
                                                        border: 'none',
                                                        padding: '12px 24px',
                                                        borderRadius: '4px',
                                                        cursor: 'pointer',
                                                        fontSize: '14px',
                                                        fontWeight: 'bold'
                                                    }}
                                                >
                                                    ✓ Approve User
                                                </button>
                                                <button 
                                                    onClick={() => {
                                                        handleReject(userDetails);
                                                        closeUserDetails();
                                                    }} 
                                                    className="reject-btn"
                                                    style={{
                                                        backgroundColor: '#dc3545',
                                                        color: 'white',
                                                        border: 'none',
                                                        padding: '12px 24px',
                                                        borderRadius: '4px',
                                                        cursor: 'pointer',
                                                        fontSize: '14px',
                                                        fontWeight: 'bold'
                                                    }}
                                                >
                                                    ✗ Reject User
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="loading">
                                        Failed to load user details
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : null}
                    
                    <p style={{
                        marginBottom: '15px', 
                        color: 'var(--text-secondary)', 
                        fontSize: 'var(--font-size-sm)', 
                        textAlign: 'center',
                        background: 'var(--color-info-bg)',
                        padding: 'var(--spacing-md)',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--color-info-border)'
                    }}>
                        💡 Click on any user to view detailed information before approving or rejecting
                    </p>
                    
                    <ul className="pending-list">
                        {pendingUsers.length > 0 ? pendingUsers.map((user, index) => (
                            <li 
                                key={user.id} 
                                className={`${removingUserId === user.id ? 'fade-out' : ''} dashboard-fade-in`}
                                style={{
                                    cursor: 'pointer',
                                    transition: 'all var(--transition-normal)',
                                    borderRadius: 'var(--radius-lg)',
                                    padding: 'var(--spacing-lg)',
                                    margin: '5px 0',
                                    animationDelay: `${index * 0.1}s`
                                }} 
                                onClick={() => fetchUserDetails(user)}
                            >
                                <div className="user-info">
                                    <span className="name">{user.name}</span>
                                    <span className="email">{user.email}</span>
                                    <span className="role">{user.role}</span>
                                </div>
                                <div className="action-buttons" onClick={(e) => e.stopPropagation()}>
                                    <button onClick={() => handleApprove(user)} className="approve-btn">
                                        ✅ Approve
                                    </button>
                                    <button onClick={() => handleReject(user)} className="reject-btn">
                                        ❌ Reject
                                    </button>
                                </div>
                            </li>
                        )) : (
                            <li style={{textAlign: 'center', padding: '20px', color: 'var(--text-tertiary)'}}>
                                🎉 No pending users found - All caught up!
                            </li>
                        )}
                    </ul>
                </div>
            )}
        </div>
    )
}

/*hi*/