'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Register() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '', phone: '', email: '', password: '', dateOfBirth: '', gender: 'Male',
    heightCm: '', currentWeightKg: '', targetWeightKg: '', bloodGroup: '',
    country: '', state: '', city: '', lifestyle: 'Sedentary', occupation: '',
    wakeTime: '', sleepTime: '', dietaryPreference: '', medicalConditions: '',
    medications: '', allergies: ''
  });

  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: any) => {
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
      <form onSubmit={handleSubmit} className="glass-card" style={{ width: '100%', maxWidth: '800px' }}>
        <h1 style={{ textAlign: 'center', marginBottom: '32px' }}>Create Your Health Profile</h1>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div>
            <label>Full Name</label>
            <input name="name" className="input-field" onChange={handleChange} required />
          </div>
          <div>
            <label>Email</label>
            <input name="email" type="email" className="input-field" onChange={handleChange} required />
          </div>
          <div>
            <label>Password</label>
            <input name="password" type="password" className="input-field" onChange={handleChange} required />
          </div>
          <div>
            <label>Phone Number</label>
            <input name="phone" className="input-field" onChange={handleChange} required />
          </div>
          <div>
            <label>Date of Birth</label>
            <input name="dateOfBirth" type="date" className="input-field" onChange={handleChange} required />
          </div>
          <div>
            <label>Gender</label>
            <select name="gender" className="input-field" onChange={handleChange}>
              <option>Male</option><option>Female</option><option>Other</option>
            </select>
          </div>
          <div>
            <label>Height (cm)</label>
            <input name="heightCm" type="number" className="input-field" onChange={handleChange} required />
          </div>
          <div>
            <label>Current Weight (kg)</label>
            <input name="currentWeightKg" type="number" step="0.1" className="input-field" onChange={handleChange} required />
          </div>
          <div>
            <label>Target Weight (kg)</label>
            <input name="targetWeightKg" type="number" step="0.1" className="input-field" onChange={handleChange} required />
          </div>
          <div>
            <label>Lifestyle</label>
            <select name="lifestyle" className="input-field" onChange={handleChange}>
              <option>Sedentary</option><option>Lightly Active</option>
              <option>Moderately Active</option><option>Very Active</option>
            </select>
          </div>
        </div>
        
        <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '32px' }}>
          Register & Continue to Goals
        </button>
      </form>
    </div>
  );
}
