'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Goals() {
  const router = useRouter();
  const [goalType, setGoalType] = useState('Weight Loss');
  const [targetWeightKg, setTargetWeightKg] = useState('');
  const [targetDate, setTargetDate] = useState('');

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      if (!token) return router.push('/register');

      const payload = {
        goalType,
        targetWeightKg: parseFloat(targetWeightKg),
        targetDate
      };

      const res = await fetch('http://localhost:5000/api/goals', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        router.push('/');
      } else {
        alert('Failed to set goal');
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '40px', minHeight: '100vh', alignItems: 'center' }}>
      <form onSubmit={handleSubmit} className="glass-card" style={{ width: '100%', maxWidth: '500px' }}>
        <h1 style={{ textAlign: 'center', marginBottom: '32px' }}>Set Your Goal</h1>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label>Goal Type</label>
            <select className="input-field" value={goalType} onChange={(e) => setGoalType(e.target.value)}>
              <option>Weight Loss</option>
              <option>Weight Gain</option>
              <option>Weight Maintenance</option>
              <option>Muscle Gain</option>
            </select>
          </div>
          <div>
            <label>Target Weight (kg)</label>
            <input type="number" step="0.1" className="input-field" value={targetWeightKg} onChange={(e) => setTargetWeightKg(e.target.value)} required />
          </div>
          <div>
            <label>Target Date</label>
            <input type="date" className="input-field" value={targetDate} onChange={(e) => setTargetDate(e.target.value)} required />
          </div>
        </div>
        
        <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '32px' }}>
          Calculate Targets & Go to Dashboard
        </button>
      </form>
    </div>
  );
}
