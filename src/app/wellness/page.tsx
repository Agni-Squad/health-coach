'use client';

import { useState } from 'react';

export default function WellnessPage() {
  const [activeTab, setActiveTab] = useState('mindfulness');
  
  const [mindfulMinutes, setMindfulMinutes] = useState('15');
  const [stressLevel, setStressLevel] = useState('5');
  const [recoveryScore, setRecoveryScore] = useState('85');
  
  const [loading, setLoading] = useState(false);

  const submitWellness = async () => {
    setLoading(true);
    try {
      await new Promise(r => setTimeout(r, 1000));
      alert('Wellness data logged successfully!');
    } catch (e) {
      alert('Error saving wellness data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto', fontFamily: 'Inter, sans-serif' }}>
      
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 800, color: '#0F172A', marginBottom: '8px' }}>Mental Wellness</h1>
        <p style={{ color: '#64748B', fontSize: '16px' }}>Track your mindfulness, stress, and overall recovery.</p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '16px', marginBottom: '16px', scrollbarWidth: 'none' }}>
        {['mindfulness', 'stress', 'recovery'].map(tab => (
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
            {tab === 'mindfulness' && '🧘 '}
            {tab === 'stress' && '🧠 '}
            {tab === 'recovery' && '🔋 '}
            {tab}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div style={{ background: 'white', borderRadius: '32px', padding: '32px', boxShadow: '0 10px 40px rgba(0,0,0,0.04)', border: '1px solid rgba(226, 232, 240, 0.8)' }}>
        
        {activeTab === 'mindfulness' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ textAlign: 'center', marginBottom: '16px' }}>
              <div style={{ fontSize: '64px', marginBottom: '16px' }}>🧘</div>
              <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#1E293B' }}>Mindfulness Session</h2>
              <p style={{ color: '#64748B' }}>How long did you meditate or relax?</p>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'baseline', marginBottom: '16px' }}>
              <span style={{ fontSize: '64px', fontWeight: 800, color: '#10B981' }}>{mindfulMinutes}</span>
              <span style={{ fontSize: '20px', fontWeight: 600, color: '#64748B', marginLeft: '8px' }}>min</span>
            </div>

            <input 
              type="range" 
              min="5" 
              max="120" 
              step="5"
              value={mindfulMinutes}
              onChange={(e) => setMindfulMinutes(e.target.value)}
              style={{ width: '100%', cursor: 'pointer', accentColor: '#10B981' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#94A3B8', marginTop: '8px', fontWeight: 600 }}>
              <span>5 min</span>
              <span>60 min</span>
              <span>120 min</span>
            </div>

            <button 
              onClick={submitWellness}
              disabled={loading}
              style={{ width: '100%', padding: '18px', borderRadius: '16px', background: 'linear-gradient(135deg, #059669 0%, #10B981 100%)', color: 'white', fontWeight: 700, border: 'none', cursor: 'pointer', marginTop: '24px', fontSize: '16px', boxShadow: '0 10px 25px rgba(16, 185, 129, 0.25)' }}
            >
              {loading ? 'Saving...' : 'Log Session 🌿'}
            </button>
          </div>
        )}

        {activeTab === 'stress' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ textAlign: 'center', marginBottom: '16px' }}>
              <div style={{ fontSize: '64px', marginBottom: '16px' }}>🧠</div>
              <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#1E293B' }}>Daily Stress Level</h2>
              <p style={{ color: '#64748B' }}>How stressed did you feel today?</p>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '16px', gap: '16px' }}>
              <span style={{ fontSize: '24px' }}>😌</span>
              <span style={{ fontSize: '64px', fontWeight: 800, color: Number(stressLevel) > 7 ? '#EF4444' : Number(stressLevel) > 4 ? '#F59E0B' : '#10B981' }}>{stressLevel}</span>
              <span style={{ fontSize: '24px' }}>😫</span>
            </div>

            <input 
              type="range" 
              min="1" 
              max="10" 
              step="1"
              value={stressLevel}
              onChange={(e) => setStressLevel(e.target.value)}
              style={{ width: '100%', cursor: 'pointer', accentColor: Number(stressLevel) > 7 ? '#EF4444' : Number(stressLevel) > 4 ? '#F59E0B' : '#10B981' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#94A3B8', marginTop: '8px', fontWeight: 600 }}>
              <span>Very Calm (1)</span>
              <span>Moderate (5)</span>
              <span>Highly Stressed (10)</span>
            </div>

            <button 
              onClick={submitWellness}
              disabled={loading}
              style={{ width: '100%', padding: '18px', borderRadius: '16px', background: 'linear-gradient(135deg, #0F172A 0%, #334155 100%)', color: 'white', fontWeight: 700, border: 'none', cursor: 'pointer', marginTop: '24px', fontSize: '16px', boxShadow: '0 10px 25px rgba(15, 23, 42, 0.25)' }}
            >
              {loading ? 'Saving...' : 'Log Stress Level'}
            </button>
          </div>
        )}

        {activeTab === 'recovery' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', alignItems: 'center' }}>
            <div style={{ textAlign: 'center', marginBottom: '16px' }}>
              <div style={{ fontSize: '64px', marginBottom: '16px' }}>🔋</div>
              <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#1E293B' }}>Recovery Score</h2>
              <p style={{ color: '#64748B' }}>Your estimated readiness for the day.</p>
            </div>
            
            {/* Circular Progress (simulated with CSS) */}
            <div style={{ 
              position: 'relative', 
              width: '200px', 
              height: '200px', 
              borderRadius: '50%', 
              background: `conic-gradient(#3B82F6 ${Number(recoveryScore)}%, #E2E8F0 ${Number(recoveryScore)}%)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 10px 30px rgba(59, 130, 246, 0.2)'
            }}>
              <div style={{ 
                width: '160px', 
                height: '160px', 
                borderRadius: '50%', 
                background: 'white',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <span style={{ fontSize: '48px', fontWeight: 800, color: '#1E293B' }}>{recoveryScore}</span>
                <span style={{ fontSize: '14px', color: '#64748B', fontWeight: 600 }}>/ 100</span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', width: '100%', marginTop: '24px' }}>
              <div style={{ padding: '16px', background: '#F8FAFC', borderRadius: '16px', textAlign: 'center' }}>
                <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>Sleep Quality</div>
                <div style={{ fontSize: '20px', fontWeight: 800, color: '#0F172A', marginTop: '4px' }}>Good</div>
              </div>
              <div style={{ padding: '16px', background: '#F8FAFC', borderRadius: '16px', textAlign: 'center' }}>
                <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>Resting HR</div>
                <div style={{ fontSize: '20px', fontWeight: 800, color: '#0F172A', marginTop: '4px' }}>62 bpm</div>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
