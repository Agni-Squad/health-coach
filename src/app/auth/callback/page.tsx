'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://sirmbstgjvcjnjfnvqjl.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_PW09GMsA89iHNaZRaOAa_Q_xwU3MPGb';
const supabase = createClient(supabaseUrl, supabaseKey);

export default function AuthCallback() {
  const router = useRouter();
  const [status, setStatus] = useState('Authenticating...');

  useEffect(() => {
    let isProcessing = false;

    const processAuth = async () => {
      if (isProcessing) return;
      isProcessing = true;

      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error || !session || !session.user) {
          isProcessing = false;
          return;
        }

        setStatus('Checking profile...');
        const email = session.user.email;

        // Check if user exists in our database
        const res = await fetch('/api/auth/google', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email })
        });

        if (res.ok) {
          const data = await res.json();
          localStorage.setItem('token', data.token);
          localStorage.setItem('userName', data.name || session.user.user_metadata?.full_name || 'User');
          localStorage.setItem('userEmail', data.email || email);
          
          setStatus('Success! Redirecting...');
          router.push('/');
        } else if (res.status === 404) {
          setStatus('Almost done! Redirecting to complete profile...');
          router.push('/register');
        } else {
          setStatus(`Backend Error: ${res.status}. Redirecting...`);
          setTimeout(() => router.push('/login'), 3000);
        }
      } catch (err: any) {
        console.error(err);
        setStatus(`Network error: ${err.message}. Redirecting...`);
        setTimeout(() => router.push('/login'), 3000);
      }
    };

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN') {
        processAuth();
      }
    });

    processAuth();

    const stuckTimeout = setTimeout(() => {
      let debugInfo = '';
      if (typeof window !== 'undefined') {
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const searchParams = new URLSearchParams(window.location.search);
        const err = hashParams.get('error') || searchParams.get('error');
        const errDesc = hashParams.get('error_description') || searchParams.get('error_description');
        if (err) debugInfo = `Error: ${err} - ${errDesc}`;
        else debugInfo = `URL Hash: ${window.location.hash} | Search: ${window.location.search}`;
      }
      
      setStatus(prev => prev === 'Authenticating...' ? 
        `Still authenticating... ${debugInfo ? `[Debug: ${debugInfo}]` : ''}` : prev
      );
    }, 5000);

    return () => {
      authListener.subscription.unsubscribe();
      clearTimeout(stuckTimeout);
    };
  }, [router]);

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #fbc2eb 0%, #a6c1ee 100%)',
      padding: '20px',
      position: 'relative'
    }}>
      
      {/* Background UI matching the Register Page */}
      <div style={{ 
        display: 'flex', 
        width: '100%', 
        maxWidth: '1000px', 
        minHeight: '550px',
        background: 'rgba(255, 255, 255, 0.95)',
        borderRadius: '24px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
        overflow: 'hidden',
        position: 'relative'
      }}>
        
        {/* Left Side: Register Form (Dummy visual) */}
        <div style={{ flex: 1, padding: '40px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '32px' }}>
            <div style={{ width: '32px', height: '32px', background: '#0F172A', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'white', fontWeight: 'bold' }}>
              W
            </div>
            <span style={{ fontSize: '20px', fontWeight: 700, letterSpacing: '-0.5px', color: '#0F172A' }}>
              WELLSYNC
            </span>
          </div>

          <h1 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '24px', color: '#0F172A' }}>
            Create an Account
          </h1>

          <div style={{ width: '100%' }}>
            <button 
              type="button" 
              style={{ 
                width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid #E2E8F0', backgroundColor: 'white',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px',
                fontSize: '14px', fontWeight: 600, color: '#0F172A', marginBottom: '16px'
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Sign up with Google
            </button>
            
            <div style={{ display: 'flex', alignItems: 'center', margin: '20px 0' }}>
              <div style={{ flex: 1, height: '1px', backgroundColor: '#E2E8F0' }}></div>
              <span style={{ padding: '0 12px', fontSize: '12px', color: '#64748B' }}>OR</span>
              <div style={{ flex: 1, height: '1px', backgroundColor: '#E2E8F0' }}></div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <input 
                placeholder="Email"
                style={{ width: '100%', padding: '14px', borderRadius: '12px', border: 'none', background: '#F1F5F9', outline: 'none', fontSize: '14px' }}
                disabled
              />
              <input 
                placeholder="Password"
                style={{ width: '100%', padding: '14px', borderRadius: '12px', border: 'none', background: '#F1F5F9', outline: 'none', fontSize: '14px' }}
                disabled
              />
              <button style={{ 
                width: '100%', padding: '14px', borderRadius: '12px', background: '#0F172A', color: 'white', 
                fontSize: '15px', fontWeight: 600, border: 'none', marginTop: '12px'
              }}>
                Continue with Email
              </button>
            </div>
          </div>
        </div>

        {/* Right Side: Image */}
        <div style={{ 
          flex: 1, 
          background: 'url("https://images.unsplash.com/photo-1490645935967-10de6ba17061?q=80&w=1000") center/cover',
          display: 'flex',
          alignItems: 'flex-end',
          padding: '40px'
        }}>
        </div>
      </div>

      {/* Blurred Overlay for Authentication Status */}
      <div style={{
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(255, 255, 255, 0.4)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 50
      }}>
        <div style={{ padding: '40px', background: 'rgba(255, 255, 255, 0.95)', borderRadius: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.15)', textAlign: 'center', maxWidth: '400px' }}>
          <h2 style={{ color: '#0F172A', fontSize: '20px', fontWeight: 600, marginBottom: '24px' }}>{status}</h2>
          <div style={{ width: '40px', height: '40px', border: '4px solid #E2E8F0', borderTopColor: '#0F172A', borderRadius: '50%', margin: '0 auto', animation: 'spin 1s linear infinite' }}></div>
          <style dangerouslySetInnerHTML={{__html: `
            @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
          `}} />
        </div>
      </div>
    </div>
  );
}
