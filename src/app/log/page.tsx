'use client';
import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';

export default function LogActivity() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('food');
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);

  // Form states for Water, Sleep, Weight, Exercise omitted for brevity, focusing on Food.
  const [waterMl, setWaterMl] = useState(250);
  const [weightKg, setWeightKg] = useState('');
  const [sleepHours, setSleepHours] = useState('');
  const [exerciseType, setExerciseType] = useState('walking');
  const [exerciseDuration, setExerciseDuration] = useState('');
  
  // Food states
  const [logMethod, setLogMethod] = useState('photo');
  
  // AI Review States
  const [showReview, setShowReview] = useState(false);
  const [mealItems, setMealItems] = useState<any[]>([]);
  
  // Raw Data
  const [photoBase64, setPhotoBase64] = useState('');
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: any) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: any) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoBase64(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoBase64(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzePhoto = async () => {
    if (!photoBase64) return alert("Please select an image first");
    setAnalyzing(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/logs/meal/analyze-photo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ base64Image: photoBase64 })
      });
      const data = await res.json();
      if (res.ok && Array.isArray(data)) {
        setMealItems(data);
        setShowReview(true);
      } else {
        alert(data.error || 'Failed to analyze photo');
      }
    } catch (e) {
      console.error(e);
      alert('Network Error');
    } finally {
      setAnalyzing(false);
    }
  };

  const toggleRecording = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      return alert("Browser doesn't support Speech Recognition.");
    }

    if (isRecording) {
      setIsRecording(false);
    } else {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      
      recognition.onstart = () => setIsRecording(true);
      recognition.onresult = (event: any) => {
        setVoiceTranscript(event.results[0][0].transcript);
        setIsRecording(false);
      };
      recognition.onerror = () => setIsRecording(false);
      recognition.onend = () => setIsRecording(false);
      
      recognition.start();
    }
  };

  const analyzeVoice = async () => {
    if (!voiceTranscript) return alert("Please record or type something");
    setAnalyzing(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/logs/meal/analyze-voice`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ transcript: voiceTranscript })
      });
      const data = await res.json();
      if (res.ok && Array.isArray(data)) {
        setMealItems(data);
        setShowReview(true);
      } else {
        alert(data.error || 'Failed to analyze voice');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setAnalyzing(false);
    }
  };

  const updateItem = (index: number, field: string, value: any) => {
    const updated = [...mealItems];
    updated[index] = { ...updated[index], [field]: value };
    setMealItems(updated);
  };

  const removeItem = (index: number) => {
    const updated = mealItems.filter((_, i) => i !== index);
    setMealItems(updated);
    if (updated.length === 0) setShowReview(false);
  };

  const saveFoodLog = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const payload = {
        mealType: 'snack',
        logMethod,
        items: mealItems,
        photoUrl: photoBase64 ? 'base64-image' : undefined,
        voiceTranscript
      };
      const res = await fetch(`/api/logs/meal`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        alert('Food logged successfully!');
        router.push('/');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const submitLog = async (endpoint: string, payload: any) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/logs/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        alert('Successfully logged!');
        router.push('/');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const totalCalories = mealItems.reduce((acc, item) => acc + (Number(item.calories) || 0), 0);
  const totalProtein = mealItems.reduce((acc, item) => acc + (Number(item.protein) || 0), 0);

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '24px', paddingBottom: '100px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      <div className="card dark-card" style={{ padding: '32px', borderRadius: '16px', background: 'linear-gradient(135deg, #0F172A 0%, #1E3A8A 100%)', color: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <span style={{ fontSize: '24px' }}>✍️</span>
          <span style={{ fontSize: '20px', fontWeight: 600 }}>Health Logger</span>
        </div>
        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '14px', marginBottom: '24px' }}>Log your daily metrics to train your AI Coach</p>
        
        <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '8px', width: '100%', justifyContent: 'center' }}>
          {['food', 'water', 'exercise', 'weight', 'sleep'].map(tab => (
            <button key={tab} 
                    style={{ 
                      padding: '10px 20px', borderRadius: '30px', border: 'none', 
                      background: activeTab === tab ? 'white' : 'rgba(255,255,255,0.1)',
                      color: activeTab === tab ? '#0F172A' : 'white',
                      fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s ease',
                      boxShadow: activeTab === tab ? '0 4px 12px rgba(0,0,0,0.1)' : 'none'
                    }} 
                    onClick={() => { setActiveTab(tab); setShowReview(false); }}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="card">
        {activeTab === 'water' && (
          <div style={{ padding: '32px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '32px', color: '#1E293B', width: '100%' }}>
              <span style={{ fontSize: '24px' }}>💧</span> 
              <span style={{ fontSize: '20px', fontWeight: 700 }}>Hydration Tracker</span>
            </div>

            {/* Water Tank Animation */}
            <div style={{ position: 'relative', width: '160px', height: '240px', background: '#F0F9FF', borderRadius: '40px', overflow: 'hidden', border: '4px solid #E0F2FE', boxShadow: 'inset 0px 4px 12px rgba(0,0,0,0.05), 0px 8px 24px rgba(56, 189, 248, 0.2)' }}>
              
              {/* Background measurements */}
              <div style={{ position: 'absolute', top: '25%', left: '0', width: '20px', borderTop: '2px solid rgba(56,189,248,0.3)' }}></div>
              <div style={{ position: 'absolute', top: '50%', left: '0', width: '30px', borderTop: '2px solid rgba(56,189,248,0.5)' }}></div>
              <div style={{ position: 'absolute', top: '75%', left: '0', width: '20px', borderTop: '2px solid rgba(56,189,248,0.3)' }}><              <div style={{ 
                position: 'absolute', 
                bottom: '0', 
                left: '0', 
                width: '100%', 
                height: `${Math.min((waterMl / 7000) * 100, 100)}%`, 
                background: 'linear-gradient(180deg, #38BDF8 0%, #0284C7 100%)',
                transition: 'height 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: 'inset 0 4px 8px rgba(255,255,255,0.3)'
              }}>
                {/* Wave effect at the top of the water */}
                <div style={{ 
                  position: 'absolute', top: '-10px', left: '-50%', width: '200%', height: '20px', 
                  background: 'linear-gradient(180deg, rgba(255,255,255,0.4) 0%, rgba(56,189,248,0) 100%)',
                  borderRadius: '50%', animation: 'wave 2s infinite linear' 
                }}></div>
              </div>
              
              <style dangerouslySetInnerHTML={{__html: `
                @keyframes wave {
                  0% { transform: translateX(0) scaleY(1); }
                  50% { transform: translateX(-25%) scaleY(0.8); }
                  100% { transform: translateX(-50%) scaleY(1); }
                }
              `}} />
            </div>

            <div style={{ marginTop: '24px', textAlign: 'center' }}>
              <div style={{ fontSize: '32px', fontWeight: 800, color: '#0F172A' }}>
                {waterMl} <span style={{ fontSize: '16px', color: '#64748B', fontWeight: 600 }}>/ 7000 ml</span>
              </div>
              <div style={{ fontSize: '14px', color: '#10B981', fontWeight: 600, marginTop: '4px' }}>
                {waterMl >= 7000 ? 'Maximum reached! 🎉' : `${7000 - waterMl} ml to max`}
              </div>
            </div>

            <div style={{ width: '100%', marginTop: '32px', padding: '0 16px' }}>
              <input 
                type="range" 
                min="0" 
                max="7000" 
                step="50"
                value={waterMl}
                onChange={(e) => setWaterMl(Number(e.target.value))}
                style={{ 
                  width: '100%', 
                  cursor: 'pointer',
                  accentColor: '#0284C7' // Modern browsers support accentColor for native sliders
                }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#94A3B8', marginTop: '8px', fontWeight: 600 }}>
                <span>0 ml</span>
                <span>3500 ml</span>
                <span>7000 ml</span>
              </div>
            </div>

            <button 
              style={{ width: '100%', padding: '16px', borderRadius: '12px', background: 'linear-gradient(135deg, #0284C7 0%, #0369A1 100%)', color: 'white', fontWeight: 700, border: 'none', cursor: 'pointer', marginTop: '24px', fontSize: '16px', boxShadow: '0 10px 25px rgba(2, 132, 199, 0.25)' }}
              onClick={() => {
                submitLog('water', { quantityMl: waterMl });
                // Note: The submitLog currently pushes back to root which resets state.
              }}
              disabled={loading || waterMl === 0}
            >
              {loading ? 'Logging...' : 'Log Hydration 🚀'}
            </button>
          </div>
        )}

        {activeTab === 'exercise' && (
          <div style={{ padding: '32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px', color: '#1E293B' }}>
              <span style={{ fontSize: '24px' }}>🏃‍♂️</span> 
              <span style={{ fontSize: '20px', fontWeight: 700 }}>Activity & Fitness</span>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#475569', marginBottom: '8px' }}>Activity Type</label>
                <select 
                  style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none', background: '#F8FAFC', fontSize: '15px' }}
                  value={exerciseType} 
                  onChange={e => setExerciseType(e.target.value)}
                >
                  <option value="walking">Walking</option>
                  <option value="running">Running</option>
                  <option value="cycling">Cycling</option>
                  <option value="swimming">Swimming</option>
                  <option value="weightlifting">Weightlifting / Gym</option>
                  <option value="yoga">Yoga</option>
                  <option value="hiit">HIIT</option>
                  <option value="sports">Sports</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#475569', marginBottom: '8px' }}>Duration (minutes)</label>
                <div style={{ position: 'relative' }}>
                  <input 
                    type="number" 
                    placeholder="e.g. 45" 
                    value={exerciseDuration} 
                    onChange={e => setExerciseDuration(e.target.value)} 
                    style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none', background: '#F8FAFC', fontSize: '15px', paddingRight: '40px' }}
                  />
                  <span style={{ position: 'absolute', right: '16px', top: '14px', color: '#94A3B8', fontWeight: 600 }}>min</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                <button 
                  onClick={() => setExerciseDuration('15')}
                  style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #E2E8F0', background: 'white', color: '#475569', fontWeight: 600, cursor: 'pointer' }}
                >+15 min</button>
                <button 
                  onClick={() => setExerciseDuration('30')}
                  style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #E2E8F0', background: 'white', color: '#475569', fontWeight: 600, cursor: 'pointer' }}
                >+30 min</button>
                <button 
                  onClick={() => setExerciseDuration('60')}
                  style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #E2E8F0', background: 'white', color: '#475569', fontWeight: 600, cursor: 'pointer' }}
                >+60 min</button>
              </div>

              <button 
                style={{ width: '100%', padding: '16px', borderRadius: '12px', background: 'linear-gradient(135deg, #0F172A 0%, #3B82F6 100%)', color: 'white', fontWeight: 700, border: 'none', cursor: 'pointer', marginTop: '16px', fontSize: '16px', boxShadow: '0 10px 25px rgba(59, 130, 246, 0.25)' }}
                onClick={() => submitLog('exercise', { type: exerciseType, durationMinutes: Number(exerciseDuration) })}
                disabled={loading || !exerciseDuration}
              >
                {loading ? 'Saving...' : 'Log Workout 🔥'}
              </button>
            </div>
          </div>
        )}

        {activeTab === 'food' && (
          <div>
            <h2 className="text-h2" style={{ marginBottom: '16px' }}>🔥 Log Food</h2>
            {!showReview ? (
              <div 
                onDragEnter={handleDrag} 
                onDragLeave={handleDrag} 
                onDragOver={handleDrag} 
                onDrop={handleDrop}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', border: dragActive ? '2px dashed #3B82F6' : '1px solid #E2E8F0', borderRadius: '16px', padding: '24px', background: dragActive ? '#F0F9FF' : '#F8FAFC', transition: 'all 0.2s ease', minHeight: '160px', justifyContent: 'center' }}>
                  
                  {photoBase64 && (
                    <div style={{ position: 'relative', width: 'fit-content', margin: '0 auto' }}>
                      <img src={photoBase64} alt="Food" style={{ height: '200px', borderRadius: '12px', objectFit: 'cover', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                      <button onClick={() => setPhotoBase64('')} style={{ position: 'absolute', top: '-12px', right: '-12px', background: '#EF4444', color: 'white', border: 'none', borderRadius: '50%', width: '30px', height: '30px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
                    </div>
                  )}

                  {!photoBase64 && (
                    <div style={{ textAlign: 'center', color: '#94A3B8', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                      <span style={{ fontWeight: 500 }}>Drag & drop a photo of your meal here</span>
                      <span style={{ fontSize: '12px' }}>Or use the attachment button below</span>
                    </div>
                  )}
                </div>

                <div style={{ position: 'relative', marginTop: '24px', display: 'flex', alignItems: 'center', background: 'white', border: '1px solid #E2E8F0', borderRadius: '24px', padding: '8px 12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                  
                  <button onClick={() => fileInputRef.current?.click()} style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer', padding: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', transition: 'background 0.2s' }} onMouseOver={e => e.currentTarget.style.background = '#F1F5F9'} onMouseOut={e => e.currentTarget.style.background = 'none'}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path></svg>
                  </button>
                  <input type="file" accept="image/*" onChange={handlePhotoUpload} ref={fileInputRef} style={{ display: 'none' }} />

                  <input 
                    placeholder={isRecording ? "Listening..." : "Describe what you ate..."}
                    value={voiceTranscript}
                    onChange={(e) => setVoiceTranscript(e.target.value)}
                    style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', padding: '12px 12px', fontSize: '15px' }}
                  />

                  <button onClick={toggleRecording} style={{ background: isRecording ? '#EF4444' : 'none', border: 'none', color: isRecording ? 'white' : '#64748B', cursor: 'pointer', padding: '10px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }} onMouseOver={e => !isRecording && (e.currentTarget.style.background = '#F1F5F9')} onMouseOut={e => !isRecording && (e.currentTarget.style.background = 'none')}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg>
                  </button>
                  
                  <button onClick={() => {
                    if (photoBase64) analyzePhoto();
                    else if (voiceTranscript) analyzeVoice();
                  }} disabled={analyzing || (!photoBase64 && !voiceTranscript)} style={{ background: '#3B82F6', border: 'none', color: 'white', cursor: (analyzing || (!photoBase64 && !voiceTranscript)) ? 'default' : 'pointer', padding: '10px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginLeft: '4px', opacity: (analyzing || (!photoBase64 && !voiceTranscript)) ? 0.5 : 1, transition: 'all 0.2s' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ transform: 'translateX(1px)' }}><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                  </button>
                </div>

                {analyzing && (
                  <div style={{ textAlign: 'center', marginTop: '24px', color: '#64748B', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                    <div style={{ width: '16px', height: '16px', border: '2px solid #3B82F6', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                    AI is analyzing your meal...
                    <style dangerouslySetInnerHTML={{__html: `@keyframes spin { 100% { transform: rotate(360deg); } }`}} />
                  </div>
                )}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <h3 className="text-h2">Review Detected Items</h3>
                <p className="text-small">Please review and edit the items below before saving.</p>
                
                {mealItems.map((item, index) => (
                  <div key={index} style={{ padding: '12px', border: '1px solid #E5E7EB', borderRadius: '12px', background: '#F9FAFB' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <input className="input-field" style={{ width: '60%', padding: '6px' }} value={item.name} onChange={e => updateItem(index, 'name', e.target.value)} />
                      <button onClick={() => removeItem(index)} style={{ background: 'none', border: 'none', color: '#EF4444', fontWeight: 600 }}>Remove</button>
                    </div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                      <div>
                        <label className="text-small">Portion</label>
                        <input className="input-field" style={{ padding: '6px' }} value={item.portion} onChange={e => updateItem(index, 'portion', e.target.value)} />
                      </div>
                      <div>
                        <label className="text-small">Calories (kcal)</label>
                        <input type="number" className="input-field" style={{ padding: '6px' }} value={item.calories} onChange={e => updateItem(index, 'calories', e.target.value)} />
                      </div>
                      <div>
                        <label className="text-small">Protein (g)</label>
                        <input type="number" className="input-field" style={{ padding: '6px' }} value={item.protein} onChange={e => updateItem(index, 'protein', e.target.value)} />
                      </div>
                      <div>
                        <label className="text-small">Carbs (g)</label>
                        <input type="number" className="input-field" style={{ padding: '6px' }} value={item.carbs} onChange={e => updateItem(index, 'carbs', e.target.value)} />
                      </div>
                    </div>
                    
                    {item.healthScore && (
                      <div style={{ marginTop: '8px' }}>
                        <span className="text-small" style={{ color: item.healthScore > 7 ? 'green' : 'orange' }}>Health Score: {item.healthScore}/10</span>
                        {item.recommendation && <p className="text-small" style={{ fontStyle: 'italic', marginTop: '4px' }}>&quot;{item.recommendation}&quot;</p>}
                      </div>
                    )}
                  </div>
                ))}
                
                <div style={{ padding: '16px', background: 'var(--accent-light)', borderRadius: '12px', marginTop: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span className="text-h2">Total Calories:</span>
                    <span className="text-h2">{totalCalories} kcal</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span className="text-body">Total Protein:</span>
                    <span className="text-body">{totalProtein}g</span>
                  </div>
                </div>
                
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button className="btn-primary" onClick={() => setShowReview(false)} style={{ flex: 1, background: '#E5E7EB' }}>Cancel</button>
                  <button className="btn-primary" onClick={saveFoodLog} disabled={loading} style={{ flex: 2 }}>Confirm & Save</button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
