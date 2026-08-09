'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://sirmbstgjvcjnjfnvqjl.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_PW09GMsA89iHNaZRaOAa_Q_xwU3MPGb';
const supabase = createClient(supabaseUrl, supabaseKey);

export default function Register() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isGoogleUser, setIsGoogleUser] = useState(false);
  const [formData, setFormData] = useState({
    name: '', phone: '', email: '', password: '', dateOfBirth: '', gender: 'Male',
    heightCm: '', currentWeightKg: '', targetWeightKg: '', bloodGroup: '',
    country: '', state: '', city: '', lifestyle: 'Sedentary', occupation: '',
    wakeTime: '', sleepTime: '', dietaryPreference: '', medicalConditions: '',
    medications: '', allergies: ''
  });

  useEffect(() => {
    // Check if the user just signed in with Google
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session && session.user) {
        setIsGoogleUser(true);
        setFormData(prev => ({
          ...prev,
          email: session.user.email || '',
          name: session.user.user_metadata?.full_name || ''
        }));
        setStep(2); // Skip straight to step 2 if they logged in with Google
      }
    };
    
    // Also listen for auth state changes (when Google redirects back)
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        setIsGoogleUser(true);
        setFormData(prev => ({
          ...prev,
          email: session.user.email || '',
          name: session.user.user_metadata?.full_name || ''
        }));
        setStep(2);
      }
    });

    checkSession();
    return () => authListener.subscription.unsubscribe();
  }, []);

  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleGoogleSignUp = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin + '/register'
      }
    });
  };

  const handleStep1Submit = (e: any) => {
    e.preventDefault();
    setStep(2);
  };

  const handleFinalSubmit = async (e: any) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        heightCm: parseFloat(formData.heightCm),
        currentWeightKg: parseFloat(formData.currentWeightKg),
        targetWeightKg: parseFloat(formData.targetWeightKg)
      };

      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const data = await res.json();
        localStorage.setItem('token', data.token);
        localStorage.setItem('userName', data.name);
        localStorage.setItem('userEmail', data.email);
        router.push('/goals');
      } else {
        const err = await res.json();
        alert(err.error || 'Registration failed');
      }
    } catch (err) {
      console.error(err);
    }
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
        minHeight: '550px',
        background: 'rgba(255, 255, 255, 0.95)',
        borderRadius: '24px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
        overflow: 'hidden'
      }}>
        
        {/* Left Side: Register Form */}
        <div style={{ flex: 1, padding: '40px', display: 'flex', flexDirection: 'column', justifyContent: 'center', overflowY: 'auto' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '32px' }}>
            <div style={{ width: '32px', height: '32px', background: '#0F172A', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'white', fontWeight: 'bold' }}>
              W
            </div>
            <span style={{ fontSize: '20px', fontWeight: 700, letterSpacing: '-0.5px', color: '#0F172A' }}>
              WELLSYNC
            </span>
          </div>

          <h1 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '24px', color: '#0F172A' }}>
            {step === 1 ? 'Create an Account' : 'Complete Profile'}
          </h1>

          {step === 1 && (
            <div style={{ width: '100%' }}>
              <button 
                type="button" 
                onClick={handleGoogleSignUp}
                style={{ 
                  width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid #E2E8F0', backgroundColor: 'white',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', cursor: 'pointer',
                  fontSize: '14px', fontWeight: 600, color: '#0F172A', transition: 'background-color 0.2s', marginBottom: '16px'
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
                Sign up with Google
              </button>
              
              <div style={{ display: 'flex', alignItems: 'center', margin: '20px 0' }}>
                <div style={{ flex: 1, height: '1px', backgroundColor: '#E2E8F0' }}></div>
                <span style={{ padding: '0 12px', fontSize: '12px', color: '#64748B' }}>OR</span>
                <div style={{ flex: 1, height: '1px', backgroundColor: '#E2E8F0' }}></div>
              </div>

              <form onSubmit={handleStep1Submit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <input 
                  name="email" 
                  type="email" 
                  placeholder="Email"
                  style={{ width: '100%', padding: '14px', borderRadius: '12px', border: 'none', background: '#F1F5F9', outline: 'none', fontSize: '14px' }}
                  value={formData.email} onChange={handleChange} required 
                />
                <input 
                  name="password" 
                  type="password" 
                  placeholder="Password"
                  style={{ width: '100%', padding: '14px', borderRadius: '12px', border: 'none', background: '#F1F5F9', outline: 'none', fontSize: '14px' }}
                  value={formData.password} onChange={handleChange} required 
                />
                
                <button type="submit" style={{ 
                  width: '100%', padding: '14px', borderRadius: '12px', background: '#0F172A', color: 'white', 
                  fontSize: '15px', fontWeight: 600, border: 'none', cursor: 'pointer', marginTop: '12px',
                  transition: 'transform 0.1s'
                }}
                onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                  Continue with Email
                </button>
              </form>

              <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '13px', color: '#64748B' }}>
                Already have an account? <a href="/login" style={{ color: '#0F172A', textDecoration: 'underline', fontWeight: 600 }}>Log in</a>
              </div>
            </div>
          )}

          {step === 2 && (
            <form onSubmit={handleFinalSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <label style={{ fontSize: '11px', color: '#64748B', marginBottom: '4px', marginLeft: '4px' }}>Full Name</label>
                  <input name="name" placeholder="John Doe" style={{ fontFamily: 'inherit', padding: '12px', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none', fontSize: '14px' }} value={formData.name} onChange={handleChange} required />
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <label style={{ fontSize: '11px', color: '#64748B', marginBottom: '4px', marginLeft: '4px' }}>Phone Number</label>
                  <input name="phone" placeholder="+1 234 567 8900" style={{ fontFamily: 'inherit', padding: '12px', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none', fontSize: '14px' }} value={formData.phone} onChange={handleChange} required />
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <label style={{ fontSize: '11px', color: '#64748B', marginBottom: '4px', marginLeft: '4px' }}>Date of Birth</label>
                  <input name="dateOfBirth" type="date" style={{ fontFamily: 'inherit', padding: '12px', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none', fontSize: '14px' }} value={formData.dateOfBirth} onChange={handleChange} required />
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <label style={{ fontSize: '11px', color: '#64748B', marginBottom: '4px', marginLeft: '4px' }}>Gender</label>
                  <select name="gender" style={{ fontFamily: 'inherit', padding: '12px', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none', fontSize: '14px' }} value={formData.gender} onChange={handleChange}>
                    <option>Male</option><option>Female</option><option>Other</option>
                  </select>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <label style={{ fontSize: '11px', color: '#64748B', marginBottom: '4px', marginLeft: '4px' }}>Height (cm)</label>
                  <input name="heightCm" type="number" placeholder="175" style={{ fontFamily: 'inherit', padding: '12px', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none', fontSize: '14px' }} value={formData.heightCm} onChange={handleChange} required />
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <label style={{ fontSize: '11px', color: '#64748B', marginBottom: '4px', marginLeft: '4px' }}>Current Weight (kg)</label>
                  <input name="currentWeightKg" type="number" step="0.1" placeholder="70.5" style={{ fontFamily: 'inherit', padding: '12px', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none', fontSize: '14px' }} value={formData.currentWeightKg} onChange={handleChange} required />
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <label style={{ fontSize: '11px', color: '#64748B', marginBottom: '4px', marginLeft: '4px' }}>Target Weight (kg)</label>
                  <input name="targetWeightKg" type="number" step="0.1" placeholder="65.0" style={{ fontFamily: 'inherit', padding: '12px', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none', fontSize: '14px' }} value={formData.targetWeightKg} onChange={handleChange} required />
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <label style={{ fontSize: '11px', color: '#64748B', marginBottom: '4px', marginLeft: '4px' }}>Lifestyle</label>
                  <select name="lifestyle" style={{ fontFamily: 'inherit', padding: '12px', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none', fontSize: '14px' }} value={formData.lifestyle} onChange={handleChange}>
                    <option>Sedentary</option><option>Lightly Active</option>
                    <option>Moderately Active</option><option>Very Active</option>
                  </select>
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                {!isGoogleUser && (
                  <button type="button" onClick={() => setStep(1)} style={{ 
                    flex: 1, padding: '14px', borderRadius: '12px', border: '1px solid #E2E8F0', background: 'transparent', color: '#0F172A', 
                    fontSize: '14px', fontWeight: 600, cursor: 'pointer'
                  }}>
                    Back
                  </button>
                )}
                <button type="submit" style={{ 
                  flex: 2, padding: '14px', borderRadius: '12px', background: '#0F172A', color: 'white', 
                  fontSize: '14px', fontWeight: 600, border: 'none', cursor: 'pointer'
                }}>
                  Create Profile & Continue
                </button>
              </div>
            </form>
          )}

        </div>

        {/* Right Side: Image */}
        <div style={{ 
          flex: 1, 
          background: 'url("https://images.unsplash.com/photo-1490645935967-10de6ba17061?q=80&w=1000") center/cover',
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
