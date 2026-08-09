'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://sirmbstgjvcjnjfnvqjl.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_PW09GMsA89iHNaZRaOAa_Q_xwU3MPGb';
const supabase = createClient(supabaseUrl, supabaseKey);

export default function Login() {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setError('');
    setLoading(true);
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
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin + '/'
      }
    });
  };

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #fbc2eb 0%, #a6c1ee 100%)',
      padding: '20px'
    }}>
      
      <div style={{ 
        display: 'flex', 
        width: '100%', 
        maxWidth: '1000px', 
        height: '650px',
        background: 'rgba(255, 255, 255, 0.95)',
        borderRadius: '24px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
        overflow: 'hidden'
      }}>
        
        {/* Left Side: Login Form */}
        <div style={{ flex: 1, padding: '48px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '48px' }}>
            <div style={{ width: '32px', height: '32px', background: '#0F172A', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'white', fontWeight: 'bold' }}>
              W
            </div>
            <span style={{ fontSize: '20px', fontWeight: 700, letterSpacing: '-0.5px', color: '#0F172A' }}>
              WELLSYNC
            </span>
          </div>

          <h1 style={{ fontSize: '32px', fontWeight: 700, marginBottom: '24px', color: '#0F172A' }}>Log in</h1>
          
          {error && (
            <div style={{ padding: '12px', backgroundColor: '#FEE2E2', color: '#EF4444', borderRadius: '8px', marginBottom: '20px', fontSize: '14px' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <input 
              name="email" 
              type="email" 
              placeholder="Email"
              style={{ width: '100%', padding: '16px', borderRadius: '12px', border: 'none', background: '#F1F5F9', outline: 'none', fontSize: '15px' }}
              onChange={handleChange} 
              required 
            />
            
            <input 
              name="password" 
              type="password" 
              placeholder="Password"
              style={{ width: '100%', padding: '16px', borderRadius: '12px', border: 'none', background: '#F1F5F9', outline: 'none', fontSize: '15px' }}
              onChange={handleChange} 
              required 
            />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px', color: '#64748B', marginTop: '4px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input type="checkbox" style={{ accentColor: '#0F172A' }} />
                Keep me logged in
              </label>
              <Link href="#" style={{ color: '#0F172A', textDecoration: 'none' }}>Forgot password?</Link>
            </div>

            <button type="submit" disabled={loading} style={{ 
              width: '100%', padding: '16px', borderRadius: '12px', background: '#0F172A', color: 'white', 
              fontSize: '16px', fontWeight: 600, border: 'none', cursor: 'pointer', marginTop: '16px',
              transition: 'transform 0.1s'
            }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
              {loading ? 'Logging in...' : 'Log in'}
            </button>
          </form>

          <div style={{ display: 'flex', alignItems: 'center', margin: '24px 0' }}>
            <div style={{ flex: 1, height: '1px', backgroundColor: '#E2E8F0' }}></div>
            <span style={{ padding: '0 12px', fontSize: '12px', color: '#64748B' }}>OR</span>
            <div style={{ flex: 1, height: '1px', backgroundColor: '#E2E8F0' }}></div>
          </div>

          <button 
            onClick={handleGoogleLogin}
            style={{ 
              width: '100%', padding: '16px', borderRadius: '12px', border: '1px solid #E2E8F0', backgroundColor: 'white',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', cursor: 'pointer',
              fontSize: '15px', fontWeight: 600, color: '#0F172A', transition: 'background-color 0.2s'
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

          <div style={{ textAlign: 'center', marginTop: '32px', fontSize: '14px', color: '#64748B' }}>
            Don't have an account? <Link href="/register" style={{ color: '#0F172A', textDecoration: 'underline', fontWeight: 600 }}>Register</Link>
          </div>
          
        </div>

        {/* Right Side: Image */}
        <div style={{ 
          flex: 1, 
          background: 'url("https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=1000") center/cover',
          display: 'flex',
          alignItems: 'flex-end',
          padding: '40px'
        }}>
          {/* Optional: Add a glassmorphism quote card over the image here if desired */}
        </div>

      </div>
    </div>
  );
}
