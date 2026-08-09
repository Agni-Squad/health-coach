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
    <div style={{ display: 'flex', justifyContent: 'center', padding: '40px', minHeight: '100vh', alignItems: 'center' }}>
      <div className="glass-card" style={{ width: '100%', maxWidth: '800px' }}>
        <h1 style={{ textAlign: 'center', marginBottom: '32px' }}>
          {step === 1 ? 'Create an Account' : 'Complete Your Profile'}
        </h1>

        {step === 1 && (
          <div style={{ maxWidth: '400px', margin: '0 auto' }}>
            <button 
              type="button" 
              onClick={handleGoogleSignUp}
              className="btn-secondary" 
              style={{ width: '100%', marginBottom: '24px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' }}
            >
              <img src="https://www.google.com/favicon.ico" alt="Google" width="20" height="20" />
              Sign up with Google
            </button>
            
            <div style={{ display: 'flex', alignItems: 'center', margin: '20px 0' }}>
              <hr style={{ flex: 1, borderColor: 'rgba(255,255,255,0.1)' }} />
              <span style={{ padding: '0 10px', color: 'rgba(255,255,255,0.5)' }}>OR</span>
              <hr style={{ flex: 1, borderColor: 'rgba(255,255,255,0.1)' }} />
            </div>

            <form onSubmit={handleStep1Submit}>
              <div style={{ marginBottom: '16px' }}>
                <label>Email</label>
                <input name="email" type="email" className="input-field" value={formData.email} onChange={handleChange} required />
              </div>
              <div style={{ marginBottom: '24px' }}>
                <label>Password</label>
                <input name="password" type="password" className="input-field" value={formData.password} onChange={handleChange} required />
              </div>
              <button type="submit" className="btn-primary" style={{ width: '100%' }}>
                Continue with Email
              </button>
            </form>
          </div>
        )}

        {step === 2 && (
          <form onSubmit={handleFinalSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <label>Full Name</label>
                <input name="name" className="input-field" value={formData.name} onChange={handleChange} required />
              </div>
              <div>
                <label>Phone Number</label>
                <input name="phone" className="input-field" value={formData.phone} onChange={handleChange} required />
              </div>
              <div>
                <label>Date of Birth</label>
                <input name="dateOfBirth" type="date" className="input-field" value={formData.dateOfBirth} onChange={handleChange} required />
              </div>
              <div>
                <label>Gender</label>
                <select name="gender" className="input-field" value={formData.gender} onChange={handleChange}>
                  <option>Male</option><option>Female</option><option>Other</option>
                </select>
              </div>
              <div>
                <label>Height (cm)</label>
                <input name="heightCm" type="number" className="input-field" value={formData.heightCm} onChange={handleChange} required />
              </div>
              <div>
                <label>Current Weight (kg)</label>
                <input name="currentWeightKg" type="number" step="0.1" className="input-field" value={formData.currentWeightKg} onChange={handleChange} required />
              </div>
              <div>
                <label>Target Weight (kg)</label>
                <input name="targetWeightKg" type="number" step="0.1" className="input-field" value={formData.targetWeightKg} onChange={handleChange} required />
              </div>
              <div>
                <label>Lifestyle</label>
                <select name="lifestyle" className="input-field" value={formData.lifestyle} onChange={handleChange}>
                  <option>Sedentary</option><option>Lightly Active</option>
                  <option>Moderately Active</option><option>Very Active</option>
                </select>
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '16px', marginTop: '32px' }}>
              {!isGoogleUser && (
                <button type="button" onClick={() => setStep(1)} className="btn-secondary" style={{ flex: 1 }}>
                  Back
                </button>
              )}
              <button type="submit" className="btn-primary" style={{ flex: 2 }}>
                Create Profile & Continue
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
