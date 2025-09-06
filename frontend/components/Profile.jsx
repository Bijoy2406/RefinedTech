import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../css/ProfilePage.css';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://127.0.0.1:8000';

export default function Profile() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [showPasswordForm, setShowPasswordForm] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [imageError, setImageError] = useState('');
    const [imagePreview, setImagePreview] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [passwordData, setPasswordData] = useState({
        current_password: '',
        new_password: '',
        confirm_password: ''
    });
    const [passwordError, setPasswordError] = useState('');
    const [passwordSuccess, setPasswordSuccess] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [adminData, setAdminData] = useState(null);
    const [showAccessCodes, setShowAccessCodes] = useState(false);
    const [copySuccess, setCopySuccess] = useState(false);
    const [codeNotice, setCodeNotice] = useState('');

    useEffect(() => {
        fetchUserInfo();
    }, []);

    // Poll for updated admin access codes while the list is open so used codes disappear automatically
    useEffect(() => {
        if (showAccessCodes && user?.role === 'Admin') {
            const token = localStorage.getItem('rt_token');
            const interval = setInterval(() => {
                if (token) fetchAdminData(token);
            }, 8000); // every 8s (lightweight)
            return () => clearInterval(interval);
        }
    }, [showAccessCodes, user]);

    const fetchUserInfo = async () => {
        try {
            const token = localStorage.getItem('rt_token');
            
            if (!token) {
                console.error('No token found');
                navigate('/login');
                return;
            }

            const response = await axios.get(`${API_BASE}/api/user`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const enriched = {
                ...response.data.user,
                profile_image_url: response.data.profile_image_url || null
            };
            setUser(enriched);
            if (enriched.profile_image_url) {
                // Add cache-busting param so latest uploaded image shows instead of cached first version
                setImagePreview(enriched.profile_image_url + '?t=' + Date.now());
            }

            // Fetch admin data if user is admin
            if (enriched.role === 'Admin') {
                await fetchAdminData(token);
            }
        } catch (error) {
            console.error('Error fetching user info:', error);
            
            // If unauthorized, clear token and redirect
            if (error.response?.status === 401) {
                console.log('Profile: 401 Unauthorized - clearing tokens');
                localStorage.removeItem('rt_token');
                localStorage.removeItem('rt_user');
                navigate('/login');
                
                // Trigger a custom event to notify App component about authentication failure
                window.dispatchEvent(new CustomEvent('auth-failed'));
            }
        }
    };

    const fetchAdminData = async (token) => {
        try {
            const response = await axios.get(`${API_BASE}/api/admin/access-code`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setAdminData(response.data);
        } catch (error) {
            console.error('Error fetching admin data:', error);
        }
    };

    const copyAccessCode = async (code) => {
        if (code) {
            try {
                await navigator.clipboard.writeText(code);
                setCopySuccess(code);
                setTimeout(() => setCopySuccess(false), 2000);
            } catch (err) {
                console.error('Failed to copy access code');
            }
        }
    };

    const generateNewCodes = async () => {
        try {
            // Defensive guard: prevent generation if any unused codes remain
            if (adminData) {
                const unused = (adminData.access_codes || []).filter(c => !c.is_used);
                if (unused.length > 0) {
                    setCodeNotice(`You still have ${unused.length} unused code${unused.length === 1 ? '' : 's'}. Use them before generating more.`);
                    // auto hide after 4s
                    setTimeout(() => setCodeNotice(''), 4000);
                    return;
                }
            }
            const token = localStorage.getItem('rt_token');
            await axios.post(`${API_BASE}/api/admin/generate-codes`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            // Refresh admin data
            await fetchAdminData(token);
            setCodeNotice('Generated 5 new referral codes.');
            setTimeout(() => setCodeNotice(''), 3500);
        } catch (error) {
            console.error('Error generating new codes:', error);
            setCodeNotice('Failed to generate codes.');
            setTimeout(() => setCodeNotice(''), 4000);
        }
    };

    const handleImageSelect = (e) => {
        const file = e.target.files?.[0];
        setImageError('');
        if (!file) return;
        if (!/image\//.test(file.type)) {
            setImageError('Only image files allowed');
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            setImageError('Max size 5MB');
            return;
        }
        const reader = new FileReader();
        reader.onload = ev => {
            // local preview already data URL; append dummy param to differentiate across selections
            const base = ev.target.result;
            setImagePreview(typeof base === 'string' ? base.split('#')[0] + '#sel=' + Date.now() : base);
        };
        reader.readAsDataURL(file);
    setSelectedFile(file); // wait for explicit upload action
    };

    const uploadImage = async (fileParam) => {
        try {
            setUploadingImage(true);
            setImageError('');
            const token = localStorage.getItem('rt_token');
            
            // Always use FormData for file uploads to avoid UTF-8 encoding issues
            if (fileParam instanceof File) {
                const formData = new FormData();
                formData.append('image', fileParam);
                
                const { data } = await axios.post(`${API_BASE}/api/profile/image`, formData, {
                    headers: { 
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data'
                    }
                });
                
                setUser(u => ({ ...u, profile_image_url: data.profile_image_url }));
                if (data.profile_image_url) {
                    const bustUrl = data.profile_image_url + '?t=' + Date.now();
                    setImagePreview(bustUrl);
                }
                setSelectedFile(null);
                
                // Notify app to refresh navbar avatar immediately
                window.dispatchEvent(new CustomEvent('profile-image-updated', { 
                    detail: { url: data.profile_image_url + '?t=' + Date.now() } 
                }));
            } else {
                throw new Error('Invalid file parameter');
            }
        } catch (err) {
            console.error('Upload error:', err);
            setImageError(err.response?.data?.errors?.image?.[0] || err.response?.data?.message || 'Upload failed');
        } finally {
            setUploadingImage(false);
        }
    };

    const handlePasswordChange = (e) => {
        setPasswordData({
            ...passwordData,
            [e.target.name]: e.target.value
        });
        setPasswordError('');
        setPasswordSuccess('');
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setPasswordError('');
        setPasswordSuccess('');

        if (passwordData.new_password !== passwordData.confirm_password) {
            setPasswordError('New passwords do not match');
            setIsLoading(false);
            return;
        }

        try {
            const token = localStorage.getItem('rt_token');
            await axios.put(`${API_BASE}/api/profile/password`, passwordData, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setPasswordSuccess('Password updated successfully!');
            setPasswordData({
                current_password: '',
                new_password: '',
                confirm_password: ''
            });
            
            // Hide password form after successful update
            setTimeout(() => {
                setShowPasswordForm(false);
                setPasswordSuccess('');
            }, 2000);

        } catch (error) {
            if (error.response?.data?.error) {
                setPasswordError(error.response.data.error);
            } else if (error.response?.data?.errors) {
                const errorMessages = Object.values(error.response.data.errors).flat();
                setPasswordError(errorMessages.join(', '));
            } else {
                setPasswordError('Failed to update password');
            }
        } finally {
            setIsLoading(false);
        }
    };

    if (!user) {
        return (
            <div className="profile-container">
                <div className="profile-header">
                    <h1>Profile</h1>
                </div>
                <div className="profile-loading">Loading...</div>
            </div>
        );
    }

    const joinedDate = new Date(user.created_at).toLocaleDateString();
    const memberLabel = user.status === 'Active' ? 'Active User' : (user.status || 'User');
    return (
        <div className="profile-container profile-page-root compact animated-entrance">
            <div className="floating-particles">
                <div className="particle"></div>
                <div className="particle"></div>
                <div className="particle"></div>
            </div>
            
            <header className="profile-page-header slide-down">
                <h1>Profile</h1>
                <p className="subtitle">View all your profile details here.</p>
            </header>

            <div className="profile-grid">
                {/* Left main card */}
                <section className="profile-card slide-left">
                    <div className="card-glow"></div>
                    <div className="avatar-ring pulse-ring">
                        {imagePreview ? (
                            <img src={imagePreview} alt={user.name} className="avatar-img" />
                        ) : (
                            <div className="avatar-fallback">{user.name?.[0] || '?'}</div>
                        )}
                        <div className="avatar-status-dot"></div>
                    </div>
                    <h2 className="user-name gradient-text">{user.name}</h2>
                    <div className="membership-label pulse-text">{memberLabel}</div>
                    <div className="meta-line fade-in">Role: <span className="pill neutral glow-pill">{user.role}</span></div>
                    <div className="meta-line fade-in">Status: <span className={`pill status-${(user.status||'active').toLowerCase()} glow-pill`}>{user.status || 'Active'}</span></div>

                    <div className="avatar-actions">
                        <label className="btn tiny outline file-btn hover-lift">
                            <input type="file" hidden accept="image/*" onChange={handleImageSelect} />
                            {uploadingImage ? 'Uploading…' : 'Change Image'}
                        </label>
                        {selectedFile && !uploadingImage && (
                            <button className="btn tiny primary hover-lift" onClick={() => uploadImage(selectedFile)}>Upload</button>
                        )}
                    </div>
                    {imageError && <div className="inline-error shake">{imageError}</div>}
                    <p className="hint small">JPG / PNG / WEBP up to 5MB</p>

                    <button
                        className="btn block ghost toggle-password hover-lift"
                        onClick={() => setShowPasswordForm(v => !v)}
                    >
                        {showPasswordForm ? 'Close Password Form' : 'Change Password'}
                    </button>
                    {showPasswordForm && (
                        <form className="password-form sleek slide-in" onSubmit={handlePasswordSubmit}>
                            <div className="field">
                                <label>Current Password</label>
                                <input type="password" name="current_password" value={passwordData.current_password} onChange={handlePasswordChange} required disabled={isLoading} />
                            </div>
                            <div className="field">
                                <label>New Password</label>
                                <input type="password" name="new_password" value={passwordData.new_password} onChange={handlePasswordChange} required minLength={6} disabled={isLoading} />
                            </div>
                            <div className="field">
                                <label>Confirm Password</label>
                                <input type="password" name="confirm_password" value={passwordData.confirm_password} onChange={handlePasswordChange} required minLength={6} disabled={isLoading} />
                            </div>
                            {passwordError && <div className="form-msg error shake">{passwordError}</div>}
                            {passwordSuccess && <div className="form-msg success bounce">{passwordSuccess}</div>}
                            <button type="submit" className="btn primary block hover-lift" disabled={isLoading}>{isLoading ? 'Updating…' : 'Update Password'}</button>
                        </form>
                    )}
                </section>

                {/* Right details card */}
                <section className="details-card slide-right">
                    <div className="card-glow"></div>
                    <div className="card-header">
                        <h3 className="gradient-text">Profile Details</h3>
                        <span className="online-indicator pulse" aria-label="online"></span>
                    </div>
                    <div className="details-grid">
                        <div className="detail-row hover-glow">
                            <span className="label">Full Name</span>
                            <span className="value">{user.name}</span>
                        </div>
                        <div className="detail-row hover-glow">
                            <span className="label">Email Address</span>
                            <span className="value selectable">{user.email}</span>
                        </div>
                        <div className="detail-row hover-glow">
                            <span className="label">Member Since</span>
                            <span className="value">{joinedDate}</span>
                        </div>
                        
                        {/* Admin-specific section */}
                        {user.role === 'Admin' && adminData && (
                            <>
                                <div className="detail-row hover-glow admin-special">
                                    <span className="label">Total Referrals</span>
                                    <span className="value highlight-number">{adminData.referred_count || 0}</span>
                                </div>
                                <div className="detail-row hover-glow admin-special">
                                    <span className="label">Access Codes</span>
                                    <div className="access-codes-container">
                                            <span className="value">{(adminData.access_codes || []).filter(c => !c.is_used).length} unused</span>
                                        <button
                                            className="btn tiny ghost hover-lift"
                                            onClick={() => setShowAccessCodes(!showAccessCodes)}
                                            title="View access codes"
                                        >
                                            {showAccessCodes ? '▼' : '▶'}
                                        </button>
                                    </div>
                                </div>
                                
                                {showAccessCodes && adminData.access_codes && (() => {
                                    const unusedList = (adminData.access_codes || []).filter(c => !c.is_used);
                                    const canGenerate = unusedList.length === 0;
                                    return (
                                        <div className="access-codes-list slide-in">
                                            <div className="list-header">
                                                <span className="label">Your Referral Codes</span>
                                                <button
                                                    className={`btn tiny primary hover-lift ${!canGenerate ? 'disabled' : ''}`}
                                                    onClick={generateNewCodes}
                                                    disabled={!canGenerate}
                                                    title={canGenerate ? 'Generate 5 new codes' : 'Use existing codes before generating more'}
                                                >
                                                    + Generate
                                                </button>
                                            </div>
                                            {codeNotice && <div className="code-msg info fade-in" role="status">{codeNotice}</div>}
                                            <div className="codes-grid">
                                                {unusedList.slice(0,5).map((codeData, index) => (
                                                    <div key={codeData.id} className="code-card" style={{animationDelay: `${index * 50}ms`}}>
                                                        <div className="code-info" style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                                                            <span className="code-value">{codeData.access_code}</span>
                                                            <button
                                                                className={`btn tiny outline hover-lift ${copySuccess === codeData.access_code ? 'success' : ''}`}
                                                                onClick={() => copyAccessCode(codeData.access_code)}
                                                            >
                                                                {copySuccess === codeData.access_code ? '✓' : '📋'}
                                                            </button>
                                                        </div>
                                                        <span className="code-status available">Available</span>
                                                    </div>
                                                ))}
                                                {unusedList.length === 0 && (
                                                    <div className="no-codes">No referral codes available.</div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })()}
                            </>
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
}

