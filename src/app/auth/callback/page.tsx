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
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: 'linear-gradient(135deg, #fbc2eb 0%, #a6c1ee 100%)' }}>
      <div style={{ padding: '40px', background: 'white', borderRadius: '24px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', textAlign: 'center' }}>
        <h2 style={{ color: '#0F172A', fontSize: '24px', marginBottom: '16px' }}>{status}</h2>
        <div style={{ width: '40px', height: '40px', border: '4px solid #F1F5F9', borderTopColor: '#0F172A', borderRadius: '50%', margin: '0 auto', animation: 'spin 1s linear infinite' }}></div>
        <style dangerouslySetInnerHTML={{__html: `
          @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        `}} />
      </div>
    </div>
  );
}
