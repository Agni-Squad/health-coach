'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function MedicalPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  
  // Vitals State
  const [bpSystolic, setBpSystolic] = useState('120');
  const [bpDiastolic, setBpDiastolic] = useState('80');
  const [heartRate, setHeartRate] = useState('72');
  const [spo2, setSpo2] = useState('98');
  const [temp, setTemp] = useState('36.7');

  // Meds State
  const [medName, setMedName] = useState('');
  const [medDosage, setMedDosage] = useState('');
  const [medTime, setMedTime] = useState('Morning');

  const [loading, setLoading] = useState(false);

  const submitVitals = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      // For now, simulating API call
      await new Promise(r => setTimeout(r, 1000));
      alert('Vitals saved successfully!');
    } catch (e) {
      alert('Error saving vitals');
    } finally {
      setLoading(false);
    }
  };

  const submitMedication = async () => {
    if (!medName || !medDosage) return alert('Enter med name and dosage');
    setLoading(true);
    try {
      // For now, simulating API call
      await new Promise(r => setTimeout(r, 1000));
      alert('Medication added successfully!');
      setMedName('');
      setMedDosage('');
    } catch (e) {
      alert('Error adding medication');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto', fontFamily: 'Inter, sans-serif' }}>
      
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 800, color: '#0F172A', marginBottom: '8px' }}>Medical Vault</h1>
        <p style={{ color: '#64748B', fontSize: '16px' }}>Track your vitals, medications, and health records securely.</p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '16px', marginBottom: '16px', scrollbarWidth: 'none' }}>
        {['overview', 'vitals', 'medications', 'records'].map(tab => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{ 
              padding: '12px 24px', 
              borderRadius: '20px', 
              border: 'none', 
              background: activeTab === tab ? '#1E293B' : '#F1F5F9', 
              color: activeTab === tab ? 'white' : '#475569',
              fontWeight: 600,
              cursor: 'pointer',
              textTransform: 'capitalize',
              whiteSpace: 'nowrap',
              transition: 'all 0.2s ease'
            }}
          >
            {tab === 'overview' && '🏥 '}
            {tab === 'vitals' && '❤️ '}
            {tab === 'medications' && '💊 '}
            {tab === 'records' && '📋 '}
            {tab}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div style={{ background: 'white', borderRadius: '32px', padding: '32px', boxShadow: '0 10px 40px rgba(0,0,0,0.04)', border: '1px solid rgba(226, 232, 240, 0.8)' }}>
        
        {activeTab === 'overview' && (
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '24px', color: '#1E293B' }}>Health Summary</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              
              <div style={{ padding: '24px', borderRadius: '24px', background: 'linear-gradient(135deg, #FEF2F2 0%, #FEE2E2 100%)', border: '1px solid #FECACA' }}>
                <div style={{ fontSize: '24px', marginBottom: '8px' }}>❤️</div>
                <div style={{ color: '#991B1B', fontWeight: 700, fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>Blood Pressure</div>
                <div style={{ fontSize: '28px', fontWeight: 800, color: '#7F1D1D' }}>120/80</div>
                <div style={{ fontSize: '13px', color: '#991B1B', marginTop: '8px', fontWeight: 500 }}>Last reading: Today</div>
              </div>

              <div style={{ padding: '24px', borderRadius: '24px', background: 'linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%)', border: '1px solid #BBF7D0' }}>
                <div style={{ fontSize: '24px', marginBottom: '8px' }}>🫁</div>
                <div style={{ color: '#166534', fontWeight: 700, fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>Blood Oxygen</div>
                <div style={{ fontSize: '28px', fontWeight: 800, color: '#14532D' }}>98%</div>
                <div style={{ fontSize: '13px', color: '#166534', marginTop: '8px', fontWeight: 500 }}>Normal Range</div>
              </div>
              
              <div style={{ padding: '24px', borderRadius: '24px', background: 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)', border: '1px solid #BFDBFE' }}>
                <div style={{ fontSize: '24px', marginBottom: '8px' }}>💊</div>
                <div style={{ color: '#1E40AF', fontWeight: 700, fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>Medications</div>
                <div style={{ fontSize: '28px', fontWeight: 800, color: '#1E3A8A' }}>2 Active</div>
                <div style={{ fontSize: '13px', color: '#1E40AF', marginTop: '8px', fontWeight: 500 }}>Next dose: 08:00 PM</div>
              </div>

            </div>
          </div>
        )}

        {activeTab === 'vitals' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#1E293B', marginBottom: '8px' }}>Log Vitals</h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>BP Systolic</label>
                <input type="number" value={bpSystolic} onChange={e=>setBpSystolic(e.target.value)} style={{ width: '100%', padding: '16px', borderRadius: '16px', border: '2px solid #F1F5F9', background: '#F8FAFC', fontSize: '18px', fontWeight: 600, outline: 'none' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>BP Diastolic</label>
                <input type="number" value={bpDiastolic} onChange={e=>setBpDiastolic(e.target.value)} style={{ width: '100%', padding: '16px', borderRadius: '16px', border: '2px solid #F1F5F9', background: '#F8FAFC', fontSize: '18px', fontWeight: 600, outline: 'none' }} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Heart Rate (BPM)</label>
                <input type="number" value={heartRate} onChange={e=>setHeartRate(e.target.value)} style={{ width: '100%', padding: '16px', borderRadius: '16px', border: '2px solid #F1F5F9', background: '#F8FAFC', fontSize: '18px', fontWeight: 600, outline: 'none' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>SpO2 (%)</label>
                <input type="number" value={spo2} onChange={e=>setSpo2(e.target.value)} style={{ width: '100%', padding: '16px', borderRadius: '16px', border: '2px solid #F1F5F9', background: '#F8FAFC', fontSize: '18px', fontWeight: 600, outline: 'none' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Temp (°C)</label>
                <input type="number" step="0.1" value={temp} onChange={e=>setTemp(e.target.value)} style={{ width: '100%', padding: '16px', borderRadius: '16px', border: '2px solid #F1F5F9', background: '#F8FAFC', fontSize: '18px', fontWeight: 600, outline: 'none' }} />
              </div>
            </div>

            <button 
              onClick={submitVitals}
              disabled={loading}
              style={{ width: '100%', padding: '18px', borderRadius: '16px', background: 'linear-gradient(135deg, #EF4444 0%, #B91C1C 100%)', color: 'white', fontWeight: 700, border: 'none', cursor: 'pointer', marginTop: '16px', fontSize: '16px', boxShadow: '0 10px 25px rgba(239, 68, 68, 0.25)' }}
            >
              {loading ? 'Saving...' : 'Save Vitals Record'}
            </button>
          </div>
        )}

        {activeTab === 'medications' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#1E293B', marginBottom: '8px' }}>Add Medication</h2>
            
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Medicine Name</label>
              <input type="text" placeholder="e.g. Vitamin D3" value={medName} onChange={e=>setMedName(e.target.value)} style={{ width: '100%', padding: '16px', borderRadius: '16px', border: '2px solid #F1F5F9', background: '#F8FAFC', fontSize: '16px', outline: 'none' }} />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Dosage & Instructions</label>
              <input type="text" placeholder="e.g. 1 Tablet after meal" value={medDosage} onChange={e=>setMedDosage(e.target.value)} style={{ width: '100%', padding: '16px', borderRadius: '16px', border: '2px solid #F1F5F9', background: '#F8FAFC', fontSize: '16px', outline: 'none' }} />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>Time of Day</label>
              <div style={{ display: 'flex', gap: '12px' }}>
                {['Morning', 'Afternoon', 'Night'].map(t => (
                  <button 
                    key={t}
                    onClick={() => setMedTime(t)}
                    style={{ flex: 1, padding: '14px', borderRadius: '12px', border: medTime === t ? '2px solid #3B82F6' : '2px solid #E2E8F0', background: medTime === t ? '#EFF6FF' : 'white', color: medTime === t ? '#1D4ED8' : '#64748B', fontWeight: 600, cursor: 'pointer' }}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <button 
              onClick={submitMedication}
              disabled={loading}
              style={{ width: '100%', padding: '18px', borderRadius: '16px', background: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)', color: 'white', fontWeight: 700, border: 'none', cursor: 'pointer', marginTop: '16px', fontSize: '16px', boxShadow: '0 10px 25px rgba(59, 130, 246, 0.25)' }}
            >
              {loading ? 'Adding...' : '+ Add to Schedule'}
            </button>
          </div>
        )}

        {activeTab === 'records' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', alignItems: 'center', textAlign: 'center', padding: '40px 0' }}>
            <div style={{ fontSize: '48px', marginBottom: '8px' }}>📄</div>
            <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#1E293B' }}>Medical Documents Vault</h2>
            <p style={{ color: '#64748B', fontSize: '15px', maxWidth: '400px' }}>Securely upload and store your lab reports, prescriptions, and vaccination records.</p>
            
            <button style={{ padding: '16px 32px', borderRadius: '100px', background: '#F1F5F9', color: '#0F172A', fontWeight: 700, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', marginTop: '16px' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
              Upload Document (Coming Soon)
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
