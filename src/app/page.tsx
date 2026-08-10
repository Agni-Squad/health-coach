'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [metrics, setMetrics] = useState<any>({
    calories: 0, steps: 0, water: 0, sleep: 0, weight: 0
  });

  const [activeSubTab, setActiveSubTab] = useState('Overview');
  const [expandedCardId, setExpandedCardId] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    // Mock user for UI focus
    setUser({ name: 'Sophia Roswill' });
    setMetrics({ calories: 450, steps: 8200, water: 1500, sleep: 7.5, weight: 68 });
  }, [router]);

  if (!user) return <div style={{ padding: '20px', textAlign: 'center' }}>Loading...</div>;

  const toggleCard = (id: string) => {
    if (expandedCardId === id) setExpandedCardId(null);
    else setExpandedCardId(id);
  };

  return (
    <div className="dashboard-grid">
      
      {/* Left Sidebar */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Vital Stats Dark Card */}
        <div className="card dark-card" style={{ padding: '24px', borderRadius: 'var(--border-radius-xl)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"></path></svg>
              </div>
              <span style={{ fontSize: '16px', fontWeight: 500 }}>Vital Stats</span>
            </div>
          </div>
          <div style={{ marginBottom: '24px' }}>
            <span style={{ fontSize: '36px', fontWeight: 700 }}>150/200</span>
            <span style={{ fontSize: '14px', color: '#94A3B8', marginLeft: '4px' }}>mg/dL</span>
          </div>
          {/* Mock Bar Chart */}
          <div style={{ display: 'flex', gap: '4px', alignItems: 'flex-end', height: '60px', marginBottom: '8px' }}>
            {Array.from({length: 24}).map((_, i) => (
              <div key={i} style={{ 
                flex: 1, 
                backgroundColor: i > 16 ? 'rgba(255,255,255,0.2)' : 'white', 
                height: i % 3 === 0 ? '100%' : (i % 2 === 0 ? '70%' : '85%'),
                borderRadius: '4px'
              }} />
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#94A3B8', marginBottom: '24px' }}>
            <span>0</span><span>100</span><span>200</span>
          </div>
        </div>

        {/* Report Details */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 className="text-h2">Report Details</h3>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '24px' }}>
            <span style={{ fontSize: '42px', fontWeight: 700, color: 'var(--text-primary)' }}>75%</span>
            <span className="text-small">of the healthy limit</span>
          </div>
          <div className="text-body" style={{ marginBottom: '16px' }}>Reminder:</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748B', fontSize: '14px' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                Next check-up
              </div>
              <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--accent-blue)' }}>28 Feb 2026</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div>
        
        {/* Interactive Sub-Tab Header */}
        <div className="flex-col-mobile" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#E0E7FF', color: '#4F46E5', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>
            </div>
            <h2 className="text-h1" style={{ fontSize: '24px' }}>My {activeSubTab}</h2>
          </div>
          
          <div style={{ display: 'flex', gap: '20px', fontSize: '14px' }}>
            {['Overview', 'Nutrition', 'Activity', 'Hydration & Sleep', 'Goals'].map(tab => (
              <span 
                key={tab} 
                className={`tab-link ${activeSubTab === tab ? 'active' : ''}`}
                onClick={() => setActiveSubTab(tab)}
              >
                {tab}
              </span>
            ))}
          </div>
        </div>

        {/* Dynamic Content based on Active Tab */}
        {activeSubTab === 'Overview' && (
          <>
            {/* 3 Stat Cards Grid with Hover & Expand */}
            <div className="stat-grid">
              
              <div className="card card-interactive" onClick={() => toggleCard('steps')}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <span style={{ fontSize: '16px', fontWeight: 600 }}>Today&apos;s Steps</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#0EA5E9', fontSize: '12px', background: '#F0F9FF', padding: '4px 8px', borderRadius: '20px' }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg> 45 min
                  </div>
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '24px' }}>
                  Route: Home → Central Park
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                  <span style={{ fontSize: '32px', fontWeight: 700, color: 'var(--text-primary)' }}>{metrics.steps.toLocaleString()}</span>
                  <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>steps</span>
                </div>
                {/* Expanded Details */}
                <div className={`expandable-content ${expandedCardId === 'steps' ? 'expanded' : ''}`}>
                  <p className="text-small" style={{ marginBottom: '8px' }}>Breakdown:</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-secondary)' }}>
                    <span>Morning Walk</span><span>3,500</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-secondary)' }}>
                    <span>Afternoon Errands</span><span>4,700</span>
                  </div>
                </div>
              </div>

              <div className="card card-interactive" onClick={() => toggleCard('workout')}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <span style={{ fontSize: '16px', fontWeight: 600 }}>Workout</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#0EA5E9', fontSize: '12px', background: '#F0F9FF', padding: '4px 8px', borderRadius: '20px' }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg> 30 min
                  </div>
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '24px' }}>
                  Workout type: HIIT
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                  <span style={{ fontSize: '32px', fontWeight: 700, color: 'var(--text-primary)' }}>{metrics.calories}</span>
                  <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Kcal burned</span>
                </div>
                {/* Expanded Details */}
                <div className={`expandable-content ${expandedCardId === 'workout' ? 'expanded' : ''}`}>
                  <p className="text-small" style={{ marginBottom: '8px' }}>Heart Rate Zones:</p>
                  <div style={{ width: '100%', height: '8px', background: '#F1F5F9', borderRadius: '4px', overflow: 'hidden', display: 'flex' }}>
                    <div style={{ width: '20%', background: '#FCD34D' }} />
                    <div style={{ width: '60%', background: '#F97316' }} />
                    <div style={{ width: '20%', background: '#EF4444' }} />
                  </div>
                </div>
              </div>

              <div className="card card-interactive" onClick={() => toggleCard('sleep')}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <span style={{ fontSize: '16px', fontWeight: 600 }}>Sleep & Recovery</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#0EA5E9', fontSize: '12px', background: '#F0F9FF', padding: '4px 8px', borderRadius: '20px' }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg> 7h 45m
                  </div>
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '24px' }}>
                  Deep Sleep: 2h 10m
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                  <span style={{ fontSize: '32px', fontWeight: 700, color: 'var(--text-primary)' }}>85/100</span>
                  <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>sleep score</span>
                </div>
                {/* Expanded Details */}
                <div className={`expandable-content ${expandedCardId === 'sleep' ? 'expanded' : ''}`}>
                  <p className="text-small" style={{ marginBottom: '8px' }}>Sleep Stages:</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-secondary)' }}>
                    <span>REM Sleep</span><span>1h 45m</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-secondary)' }}>
                    <span>Light Sleep</span><span>3h 50m</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Mental Health & Body Comp Grid */}
            <div className="secondary-grid">
              <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#DCFCE7', color: '#16A34A', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><path d="M8 14s1.5 2 4 2 4-2 4-2"></path><line x1="9" y1="9" x2="9.01" y2="9"></line><line x1="15" y1="9" x2="15.01" y2="9"></line></svg>
                    </div>
                    <h3 className="text-h2">Mental Health Score</h3>
                  </div>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'center', position: 'relative', marginBottom: '24px' }}>
                  <svg width="200" height="100" viewBox="0 0 200 100">
                    <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="#BFDBFE" strokeWidth="30" strokeLinecap="round" />
                    <path d="M 20 100 A 80 80 0 0 1 150 40" fill="none" stroke="#2563EB" strokeWidth="30" strokeLinecap="round" />
                  </svg>
                  <div style={{ position: 'absolute', bottom: '0', textAlign: 'center' }}>
                    <div style={{ fontSize: '32px', fontWeight: 700, color: 'var(--text-primary)' }}>78<span style={{ fontSize: '14px', color: 'var(--text-muted)', fontWeight: 500 }}>/100</span></div>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Mental Health Score</div>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div className="card" style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#FFEDD5', color: '#EA580C', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                      </div>
                      <h3 className="text-h2">Body Composition</h3>
                    </div>
                  </div>
                  <div className="flex-col-mobile" style={{ display: 'flex', gap: '16px' }}>
                    <div style={{ flex: 1, padding: '16px', background: '#F8FAFC', borderRadius: '12px' }}>
                      <span style={{ fontSize: '20px', fontWeight: 600 }}>{metrics.weight} <span style={{ fontSize: '12px' }}>Kg</span></span>
                    </div>
                    <div style={{ flex: 1, padding: '16px', background: '#F8FAFC', borderRadius: '12px' }}>
                      <span style={{ fontSize: '20px', fontWeight: 600 }}>22%</span>
                    </div>
                  </div>
                </div>
                
                {/* Set Goals Banner */}
                <div className="card dark-card" style={{ padding: '24px', background: 'linear-gradient(90deg, #0F172A 0%, #1E3A8A 100%)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '8px', color: 'white' }}>Set and Achieve<br/>Your Health Goals!</h3>
                    <div style={{ fontSize: '14px', fontWeight: 500, color: 'white' }}>Lose 3kg in 1 month</div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Mocking other tabs for visualization */}
        {activeSubTab !== 'Overview' && (
          <div className="card" style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" style={{ marginBottom: '16px' }}><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="9" y1="3" x2="9" y2="21"></line></svg>
            <h3 className="text-h2" style={{ marginBottom: '8px' }}>{activeSubTab} Data</h3>
            <p className="text-body">Detailed charts and logs for {activeSubTab.toLowerCase()} will appear here.</p>
          </div>
        )}

      </div>
    </div>
  );
}
