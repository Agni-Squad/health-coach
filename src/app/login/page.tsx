'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Login() {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        const data = await res.json();
        localStorage.setItem('token', data.token);
        localStorage.setItem('userName', data.name || 'User');
        localStorage.setItem('userEmail', data.email || formData.email);
        
        router.push('/');
      } else {
        const err = await res.json();
        setError(err.error || 'Login failed');
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred during login');
    }
  };

  const handleGoogleLogin = () => {
    alert('Google Sign in will be fully integrated later!');
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '40px', minHeight: '100vh', alignItems: 'center' }}>
      <div className="card" style={{ width: '100%', maxWidth: '400px', padding: '32px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
            <div style={{ color: 'var(--accent-blue)', display: 'flex' }}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"></path></svg>
            </div>
          </div>
          <h1 className="text-h1">Welcome Back</h1>
          <p className="text-body" style={{ marginTop: '8px' }}>Log in to your Wellsync account</p>
        </div>

        {error && (
          <div style={{ padding: '12px', backgroundColor: '#FEE2E2', color: '#EF4444', borderRadius: '8px', marginBottom: '20px', fontSize: '14px', textAlign: 'center' }}>
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500 }}>Email</label>
            <input 
              name="email" 
              type="email" 
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #E2E8F0', outline: 'none' }}
              onChange={handleChange} 
              required 
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500 }}>Password</label>
            <input 
              name="password" 
              type="password" 
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #E2E8F0', outline: 'none' }}
              onChange={handleChange} 
              required 
              placeholder="••••••••"
            />
          </div>
          
          <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '8px' }}>
            Sign In
          </button>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', margin: '24px 0' }}>
          <div style={{ flex: 1, height: '1px', backgroundColor: '#E2E8F0' }}></div>
          <span style={{ padding: '0 12px', fontSize: '14px', color: 'var(--text-muted)' }}>OR</span>
          <div style={{ flex: 1, height: '1px', backgroundColor: '#E2E8F0' }}></div>
        </div>

        <button 
          onClick={handleGoogleLogin}
          style={{ 
            width: '100%', 
            padding: '12px', 
            borderRadius: '8px', 
            border: '1px solid #E2E8F0', 
            backgroundColor: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 500,
            color: 'var(--text-primary)',
            transition: 'background-color 0.2s'
          }}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#F8FAFC'}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'white'}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Sign in with Google
        </button>

        <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '14px', color: 'var(--text-secondary)' }}>
          Don't have an account? <Link href="/register" style={{ color: 'var(--accent-blue)', textDecoration: 'none', fontWeight: 500 }}>Sign up</Link>
        </div>
      </div>
    </div>
  );
}
