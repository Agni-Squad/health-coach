'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function HealthOverview() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isSettingGoal, setIsSettingGoal] = useState(false);
  
  // Goal Form State
  const [currentWeight, setCurrentWeight] = useState('');
  const [targetWeight, setTargetWeight] = useState('');
  const [heightCm, setHeightCm] = useState('');
  const [targetDate, setTargetDate] = useState('');
  
  // Simulated Android Health Connect Data
  const [metrics, setMetrics] = useState<any>({
    overallScore: 82,
    steps: 8200,
    calories: 450,
    workout: { type: 'HIIT', duration: '30 min', intensity: 'High', calories: 320 },
    sleep: { total: '7h 45m', deep: '2h 10m', rem: '1h 45m', light: '3h 50m', score: 85 },
    vitals: { bpm: 72, spo2: 98, glucose: 95, bp: '120/80' },
    bodyComp: { weight: 68.0, fat: 22, bmi: 22.8, leanMass: 53.0 },
    hydration: { current: 1.8, goal: 2.5, percentage: 72 },
    wellness: { score: 78, sleep: 82, activity: 75, recovery: 80, mindfulness: 70 },
    goals: { 
      steps: { current: 8200, target: 10000, pct: 82 }, 
      water: { current: 1.8, target: 2.5, pct: 72 }, 
      exercise: { current: 30, target: 45, pct: 67 }, 
      sleep: { current: 7.75, target: 8, pct: 97 } 
    }
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    // Mock user for UI focus
    setUser({ name: 'User' });
  }, [router]);

  if (!user) return <div style={{ padding: '20px', textAlign: 'center' }}>Loading...</div>;

  if (isSettingGoal) {
    return (
      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '40px 24px', display: 'flex', flexDirection: 'column' }}>
        <button 
          onClick={() => setIsSettingGoal(false)} 
          style={{ background: 'none', border: 'none', color: '#3B82F6', fontWeight: 600, cursor: 'pointer', textAlign: 'left', marginBottom: '24px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
          Back to Overview
        </button>

        <div className="card" style={{ padding: '32px', borderRadius: '16px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '24px', color: '#1E293B', textAlign: 'center' }}>Set Your Health Goal</h2>
          
          <form onSubmit={(e) => { e.preventDefault(); setIsSettingGoal(false); alert('Goals saved successfully!'); }} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#475569', marginBottom: '8px' }}>Current Weight (kg)</label>
              <input type="number" step="0.1" value={currentWeight} onChange={(e) => setCurrentWeight(e.target.value)} required style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #E2E8F0', outline: 'none' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#475569', marginBottom: '8px' }}>Target Goal Weight (kg)</label>
              <input type="number" step="0.1" value={targetWeight} onChange={(e) => setTargetWeight(e.target.value)} required style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #E2E8F0', outline: 'none' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#475569', marginBottom: '8px' }}>Height (cm)</label>
              <input type="number" value={heightCm} onChange={(e) => setHeightCm(e.target.value)} required style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #E2E8F0', outline: 'none' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#475569', marginBottom: '8px' }}>Goal Achievement Period (Target Date)</label>
              <input 
                type="date" 
                value={targetDate} 
                onChange={(e) => setTargetDate(e.target.value)} 
                min={new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0]}
                required 
                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #E2E8F0', outline: 'none' }} 
              />
            </div>
            
            <button type="submit" style={{ width: '100%', padding: '14px', borderRadius: '8px', background: '#0F172A', color: 'white', fontWeight: 600, border: 'none', cursor: 'pointer', marginTop: '12px' }}>
              Save New Goals
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* 1. Overall Health */}
      <div className="card dark-card" style={{ padding: '32px', borderRadius: '16px', background: 'linear-gradient(135deg, #0F172A 0%, #1E3A8A 100%)', color: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
        
        {/* Toggle Goal Setting Link */}
        <button 
          onClick={() => setIsSettingGoal(true)}
          style={{ position: 'absolute', top: '24px', right: '24px', background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
        >
          Set New Goals 🎯
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <span style={{ fontSize: '24px' }}>❤️</span>
          <span style={{ fontSize: '18px', fontWeight: 600 }}>Overall Health</span>
        </div>
        <div style={{ fontSize: '48px', fontWeight: 800 }}>{metrics.overallScore} <span style={{ fontSize: '20px', fontWeight: 500, color: 'rgba(255,255,255,0.7)' }}>/ 100</span></div>
        <div style={{ marginTop: '8px', fontSize: '14px', color: '#10B981', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12l7-7 7 7M12 19V5"/></svg>
          Improving from yesterday
        </div>
      </div>

      {/* 2. Activity Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
        <div className="card" style={{ padding: '24px', borderRadius: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', color: '#64748B' }}>
            <span style={{ fontSize: '20px' }}>🚶</span> <span style={{ fontWeight: 600 }}>Today&apos;s Activity</span>
          </div>
          <div style={{ fontSize: '32px', fontWeight: 700, color: '#1E293B', marginBottom: '16px' }}>{metrics.steps.toLocaleString()} <span style={{ fontSize: '14px', color: '#94A3B8' }}>steps</span></div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#64748B' }}>Distance</span><span style={{ fontWeight: 600 }}>5.8 km</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#64748B' }}>Active calories</span><span style={{ fontWeight: 600 }}>{metrics.calories} kcal</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#64748B' }}>Exercise</span><span style={{ fontWeight: 600 }}>30 min</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#64748B' }}>Floors</span><span style={{ fontWeight: 600 }}>8</span></div>
          </div>
        </div>

        <div className="card" style={{ padding: '24px', borderRadius: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', color: '#64748B' }}>
            <span style={{ fontSize: '20px' }}>🏋️</span> <span style={{ fontWeight: 600 }}>Workout</span>
          </div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#1E293B', marginBottom: '8px' }}>{metrics.workout.type}</div>
          <div style={{ fontSize: '16px', color: '#475569', marginBottom: '16px' }}>{metrics.workout.duration} • {metrics.workout.calories} kcal</div>
          <div style={{ display: 'inline-flex', padding: '6px 12px', background: '#FEE2E2', color: '#DC2626', borderRadius: '20px', fontSize: '12px', fontWeight: 600 }}>
            Intensity: {metrics.workout.intensity}
          </div>
        </div>
      </div>

      {/* 3. Rest & Vitals Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '24px' }}>
        <div className="card" style={{ padding: '24px', borderRadius: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', color: '#64748B' }}>
            <span style={{ fontSize: '20px' }}>😴</span> <span style={{ fontWeight: 600 }}>Sleep & Recovery</span>
          </div>
          <div style={{ fontSize: '32px', fontWeight: 700, color: '#1E293B', marginBottom: '4px' }}>{metrics.sleep.total}</div>
          <div style={{ fontSize: '14px', color: '#94A3B8', marginBottom: '16px' }}>Sleep duration</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '14px', marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#64748B' }}>Deep sleep</span><span style={{ fontWeight: 600, color: '#3B82F6' }}>{metrics.sleep.deep}</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#64748B' }}>REM sleep</span><span style={{ fontWeight: 600, color: '#8B5CF6' }}>{metrics.sleep.rem}</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#64748B' }}>Light sleep</span><span style={{ fontWeight: 600, color: '#0EA5E9' }}>{metrics.sleep.light}</span></div>
          </div>
          <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 600, color: '#475569' }}>Sleep Score</span>
            <span style={{ fontSize: '18px', fontWeight: 700, color: '#1E293B' }}>{metrics.sleep.score} <span style={{ fontSize: '12px', color: '#94A3B8' }}>/ 100</span></span>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{ display: 'flex', gap: '24px' }}>
            <div className="card" style={{ flex: 1, padding: '24px', borderRadius: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', color: '#64748B' }}>
                <span style={{ fontSize: '20px' }}>❤️</span> <span style={{ fontWeight: 600 }}>Heart Rate</span>
              </div>
              <div style={{ fontSize: '24px', fontWeight: 700, color: '#1E293B' }}>{metrics.vitals.bpm} <span style={{ fontSize: '12px', color: '#94A3B8' }}>BPM</span></div>
              <div style={{ fontSize: '12px', color: '#64748B', marginTop: '4px' }}>Resting</div>
            </div>
            <div className="card" style={{ flex: 1, padding: '24px', borderRadius: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', color: '#64748B' }}>
                <span style={{ fontSize: '20px' }}>🫁</span> <span style={{ fontWeight: 600 }}>SpO₂</span>
              </div>
              <div style={{ fontSize: '24px', fontWeight: 700, color: '#1E293B' }}>{metrics.vitals.spo2}%</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '24px' }}>
            <div className="card" style={{ flex: 1, padding: '24px', borderRadius: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', color: '#64748B' }}>
                <span style={{ fontSize: '20px' }}>🩸</span> <span style={{ fontWeight: 600 }}>Glucose</span>
              </div>
              <div style={{ fontSize: '24px', fontWeight: 700, color: '#1E293B' }}>{metrics.vitals.glucose} <span style={{ fontSize: '12px', color: '#94A3B8' }}>mg/dL</span></div>
            </div>
            <div className="card" style={{ flex: 1, padding: '24px', borderRadius: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', color: '#64748B' }}>
                <span style={{ fontSize: '20px' }}>🩺</span> <span style={{ fontWeight: 600 }}>BP</span>
              </div>
              <div style={{ fontSize: '24px', fontWeight: 700, color: '#1E293B' }}>{metrics.vitals.bp}</div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Body & Hydration */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '24px' }}>
        <div className="card" style={{ padding: '24px', borderRadius: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', color: '#64748B' }}>
            <span style={{ fontSize: '20px' }}>⚖️</span> <span style={{ fontWeight: 600 }}>Body Composition</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#64748B' }}>Weight</span><span style={{ fontWeight: 600 }}>{metrics.bodyComp.weight.toFixed(1)} kg</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#64748B' }}>Body Fat</span><span style={{ fontWeight: 600 }}>{metrics.bodyComp.fat}%</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#64748B' }}>BMI</span><span style={{ fontWeight: 600 }}>{metrics.bodyComp.bmi}</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#64748B' }}>Lean Mass</span><span style={{ fontWeight: 600 }}>{metrics.bodyComp.leanMass.toFixed(1)} kg</span></div>
          </div>
          <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '14px', color: '#64748B' }}>Weight trend</span>
            <span style={{ fontSize: '14px', fontWeight: 600, color: '#10B981' }}>↓ 0.5 kg</span>
          </div>
        </div>

        <div className="card" style={{ padding: '24px', borderRadius: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', color: '#64748B' }}>
            <span style={{ fontSize: '20px' }}>💧</span> <span style={{ fontWeight: 600 }}>Hydration</span>
          </div>
          <div style={{ fontSize: '32px', fontWeight: 700, color: '#1E293B', marginBottom: '16px' }}>{metrics.hydration.current} <span style={{ fontSize: '16px', color: '#94A3B8' }}>/ {metrics.hydration.goal} L</span></div>
          <div style={{ width: '100%', height: '8px', background: '#E2E8F0', borderRadius: '4px', overflow: 'hidden', marginBottom: '12px' }}>
            <div style={{ width: `${metrics.hydration.percentage}%`, height: '100%', background: '#3B82F6' }}></div>
          </div>
          <div style={{ fontSize: '14px', color: '#64748B' }}>{metrics.hydration.percentage}% of today&apos;s goal</div>
        </div>
      </div>

      {/* 5. Wellness */}
      <div className="card" style={{ padding: '24px', borderRadius: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px', color: '#64748B' }}>
          <span style={{ fontSize: '20px' }}>🧠</span> <span style={{ fontWeight: 600 }}>Wellness & Recovery</span>
        </div>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ fontSize: '48px', fontWeight: 800, color: '#1E293B' }}>{metrics.wellness.score} <span style={{ fontSize: '20px', fontWeight: 500, color: '#94A3B8' }}>/ 100</span></div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
          {['sleep', 'activity', 'recovery', 'mindfulness'].map(metric => (
            <div key={metric}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '8px' }}>
                <span style={{ color: '#475569', textTransform: 'capitalize' }}>{metric}</span>
                <span style={{ fontWeight: 600 }}>{metrics.wellness[metric]}</span>
              </div>
              <div style={{ width: '100%', height: '6px', background: '#F1F5F9', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ width: `${metrics.wellness[metric]}%`, height: '100%', background: metric === 'mindfulness' ? '#8B5CF6' : (metric === 'recovery' ? '#10B981' : '#3B82F6') }}></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 6. Trends & 7. Goals */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
        <div className="card" style={{ padding: '24px', borderRadius: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748B' }}>
              <span style={{ fontSize: '20px' }}>📈</span> <span style={{ fontWeight: 600 }}>7-Day Health Trends</span>
            </div>
            <select style={{ padding: '4px 8px', borderRadius: '6px', border: '1px solid #E2E8F0', fontSize: '12px', background: 'transparent' }}>
              <option>7 Days</option>
              <option>30 Days</option>
            </select>
          </div>
          <div style={{ height: '200px', display: 'flex', alignItems: 'flex-end', gap: '8px', paddingBottom: '20px', borderBottom: '1px dashed #E2E8F0' }}>
            {/* Mock Chart */}
            {[40, 60, 45, 80, 55, 90, 75].map((val, i) => (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '100%', background: '#DBEAFE', borderRadius: '4px', height: `${val}%`, position: 'relative' }}>
                  <div style={{ position: 'absolute', top: '-20px', width: '100%', textAlign: 'center', fontSize: '10px', color: '#64748B' }}>{(val * 100).toFixed(0)}</div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#94A3B8', marginTop: '8px' }}>
            <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
          </div>
        </div>

        <div className="card" style={{ padding: '24px', borderRadius: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px', color: '#64748B' }}>
            <span style={{ fontSize: '20px' }}>🎯</span> <span style={{ fontWeight: 600 }}>Today&apos;s Goals</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '8px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>🚶 Steps</span>
                <span><span style={{ fontWeight: 600 }}>{metrics.goals.steps.current.toLocaleString()}</span> <span style={{ color: '#94A3B8' }}>/ {metrics.goals.steps.target.toLocaleString()}</span></span>
              </div>
              <div style={{ width: '100%', height: '8px', background: '#F1F5F9', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: `${metrics.goals.steps.pct}%`, height: '100%', background: '#0EA5E9' }}></div>
              </div>
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '8px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>💧 Water</span>
                <span><span style={{ fontWeight: 600 }}>{metrics.goals.water.current}</span> <span style={{ color: '#94A3B8' }}>/ {metrics.goals.water.target} L</span></span>
              </div>
              <div style={{ width: '100%', height: '8px', background: '#F1F5F9', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: `${metrics.goals.water.pct}%`, height: '100%', background: '#3B82F6' }}></div>
              </div>
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '8px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>🏋️ Exercise</span>
                <span><span style={{ fontWeight: 600 }}>{metrics.goals.exercise.current}</span> <span style={{ color: '#94A3B8' }}>/ {metrics.goals.exercise.target} min</span></span>
              </div>
              <div style={{ width: '100%', height: '8px', background: '#F1F5F9', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: `${metrics.goals.exercise.pct}%`, height: '100%', background: '#F59E0B' }}></div>
              </div>
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '8px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>😴 Sleep</span>
                <span><span style={{ fontWeight: 600 }}>7h 45m</span> <span style={{ color: '#94A3B8' }}>/ 8h</span></span>
              </div>
              <div style={{ width: '100%', height: '8px', background: '#F1F5F9', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: `${metrics.goals.sleep.pct}%`, height: '100%', background: '#8B5CF6' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
