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
    let redirectTimeout: NodeJS.Timeout;

    const processAuth = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error || !session || !session.user) {
        // Do not redirect immediately. The Supabase client might still be parsing the URL hash fragment.
        // We rely on the 5-second timeout fallback (below) or the onAuthStateChange listener.
        return;
      }

      // If we got here, we have a session! Clear the fallback timeout.
      clearTimeout(redirectTimeout);
      setStatus('Checking profile...');
      const email = session.user.email;

      try {
        // Check if user exists in our database
        const res = await fetch('/api/auth/google', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email })
        });

        if (res.ok) {
          // User exists! Save our custom JWT token and redirect to dashboard
          const data = await res.json();
          localStorage.setItem('token', data.token);
          localStorage.setItem('userName', data.name || session.user.user_metadata?.full_name || 'User');
          localStorage.setItem('userEmail', data.email || email);
          
          setStatus('Success! Redirecting...');
          router.push('/');
        } else if (res.status === 404) {
          // User is authenticated with Google but hasn't completed Step 2 of our registration
          setStatus('Almost done! Redirecting to complete profile...');
          router.push('/register');
        } else {
          setStatus('An error occurred. Please try again.');
          setTimeout(() => router.push('/login'), 2000);
        }
      } catch (err) {
        console.error(err);
        setStatus('Network error. Redirecting...');
        setTimeout(() => router.push('/login'), 2000);
      }
    };

    // Listen for auth state change which triggers when the hash is parsed
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN') {
        processAuth();
      }
    });

    // Run immediately just in case the session is already parsed
    processAuth();

    // Fallback: if 4 seconds pass and no session is found, redirect to login
    redirectTimeout = setTimeout(() => {
      setStatus('Authentication failed or timed out. Redirecting...');
      setTimeout(() => router.push('/login'), 1500);
    }, 4000);

    return () => {
      authListener.subscription.unsubscribe();
      clearTimeout(redirectTimeout);
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
