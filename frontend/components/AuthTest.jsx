import { useState } from 'react';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://127.0.0.1:8000';

export default function AuthTest() {
    const [result, setResult] = useState('');
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('admin@admin.com');
    const [password, setPassword] = useState('password');

    const testLogin = async () => {
        setLoading(true);
        setResult('');

        try {
            const response = await axios.post(`${API_BASE}/api/login`, { 
                email, 
                password 
            });

            const { token, user } = response.data;
            
            localStorage.setItem('rt_token', token);
            localStorage.setItem('rt_user', JSON.stringify(user));
            
            setResult(`LOGIN SUCCESS: Token stored. User: ${user.name} (${user.role})`);
        } catch (error) {
            console.error('Login Error:', error);
            setResult(`LOGIN ERROR: ${error.response?.status} - ${error.response?.data?.error || error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const testAuth = async () => {
        setLoading(true);
        setResult('');

        try {
            const token = localStorage.getItem('rt_token');
            const storedUser = localStorage.getItem('rt_user');
            
            console.log('AuthTest Debug:', {
                hasToken: !!token,
                tokenLength: token ? token.length : 0,
                tokenPreview: token ? token.substring(0, 50) + '...' : 'none',
                hasStoredUser: !!storedUser
            });

            if (!token) {
                setResult('ERROR: No token found in localStorage');
                return;
            }

            const response = await axios.get(`${API_BASE}/api/user`, {
                headers: { 
                    Authorization: `Bearer ${token}`,
                    Accept: 'application/json',
                    'Content-Type': 'application/json'
                }
            });

            setResult(`AUTH SUCCESS: ${JSON.stringify(response.data, null, 2)}`);
        } catch (error) {
            console.error('AuthTest Error:', error);
            setResult(`AUTH ERROR: ${error.response?.status} - ${error.response?.data?.message || error.message}\n\nFull Error: ${JSON.stringify(error.response?.data, null, 2)}`);
        } finally {
            setLoading(false);
        }
    };

    const clearAuth = () => {
        localStorage.removeItem('rt_token');
        localStorage.removeItem('rt_user');
        setResult('Cleared authentication data');
    };

    return (
        <div style={{ padding: '20px', background: '#f5f5f5', margin: '20px', borderRadius: '8px' }}>
            <h3>Authentication Test</h3>
            
            <div style={{ marginBottom: '15px' }}>
                <input 
                    type="email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email"
                    style={{ marginRight: '10px', padding: '5px' }}
                />
                <input 
                    type="password" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    style={{ marginRight: '10px', padding: '5px' }}
                />
            </div>
            
            <button onClick={testLogin} disabled={loading} style={{ marginRight: '10px' }}>
                {loading ? 'Logging in...' : 'Test Login'}
            </button>
            <button onClick={testAuth} disabled={loading} style={{ marginRight: '10px' }}>
                {loading ? 'Testing...' : 'Test /api/user'}
            </button>
            <button onClick={clearAuth}>
                Clear Auth
            </button>
            
            <pre style={{ 
                background: '#fff', 
                padding: '10px', 
                marginTop: '10px', 
                borderRadius: '4px',
                whiteSpace: 'pre-wrap',
                fontSize: '12px',
                maxHeight: '300px',
                overflow: 'auto'
            }}>
                {result || 'Use the buttons above to test authentication'}
            </pre>
        </div>
    );
}
