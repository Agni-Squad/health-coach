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
  
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      const res = await fetch(`http://localhost:5000/api/logs/meal/analyze-photo`, {
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
      const res = await fetch(`http://localhost:5000/api/logs/meal/analyze-voice`, {
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
      const res = await fetch(`http://localhost:5000/api/logs/meal`, {
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
      const res = await fetch(`http://localhost:5000/api/logs/${endpoint}`, {
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
    <div style={{ padding: '24px', paddingBottom: '100px' }}>
      <h1 className="text-h1" style={{ textAlign: 'center', marginBottom: '20px' }}>Log Activity</h1>
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', marginBottom: '24px', paddingBottom: '8px' }}>
        {['food', 'water', 'exercise', 'weight', 'sleep'].map(tab => (
          <button key={tab} 
                  style={{ 
                    padding: '8px 16px', borderRadius: '20px', border: 'none', 
                    background: activeTab === tab ? 'var(--accent-color)' : '#E5E7EB',
                    fontWeight: activeTab === tab ? 600 : 400
                  }} 
                  onClick={() => { setActiveTab(tab); setShowReview(false); }}>
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      <div className="card">
        {activeTab === 'water' && (
          <div>
            <h2 className="text-h2" style={{ marginBottom: '16px' }}>💧 Log Water</h2>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
              <button className="btn-primary" onClick={() => submitLog('water', { quantityMl: 250 })}>+ 250ml</button>
              <button className="btn-primary" onClick={() => submitLog('water', { quantityMl: 500 })}>+ 500ml</button>
            </div>
            <input type="number" className="input-field" placeholder="Custom (ml)" value={waterMl} onChange={e => setWaterMl(Number(e.target.value))} />
            <button className="btn-primary" style={{ marginTop: '16px' }} onClick={() => submitLog('water', { quantityMl: waterMl })} disabled={loading}>Save</button>
          </div>
        )}
        
        {/* Sleep, Weight, Exercise ... omitted to save space, but kept structure */}

        {activeTab === 'food' && (
          <div>
            <h2 className="text-h2" style={{ marginBottom: '16px' }}>🔥 Log Food</h2>
            {!showReview ? (
              <>
                <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                  <button className="btn-primary" style={{ opacity: logMethod === 'photo' ? 1 : 0.5 }} onClick={() => setLogMethod('photo')}>📸 Photo</button>
                  <button className="btn-primary" style={{ opacity: logMethod === 'voice' ? 1 : 0.5 }} onClick={() => setLogMethod('voice')}>🎙️ Voice</button>
                </div>

                {logMethod === 'photo' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <input type="file" accept="image/*" className="input-field" onChange={handlePhotoUpload} ref={fileInputRef} />
                    {photoBase64 && <img src={photoBase64} alt="Food Preview" style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '12px' }} />}
                    <button className="btn-primary" onClick={analyzePhoto} disabled={analyzing}>
                      {analyzing ? 'Analyzing Image...' : 'Analyze Photo'}
                    </button>
                  </div>
                )}

                {logMethod === 'voice' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <button className="btn-primary" onClick={toggleRecording} style={{ background: isRecording ? '#EF4444' : 'var(--accent-color)' }}>
                      {isRecording ? '⏹️ Stop Recording' : '🎙️ Tap to Speak'}
                    </button>
                    <textarea className="input-field" placeholder="Or type what you ate..." value={voiceTranscript} onChange={e => setVoiceTranscript(e.target.value)} rows={3}></textarea>
                    <button className="btn-primary" onClick={analyzeVoice} disabled={analyzing}>
                      {analyzing ? 'Analyzing Speech...' : 'Analyze Voice'}
                    </button>
                  </div>
                )}
              </>
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
                        {item.recommendation && <p className="text-small" style={{ fontStyle: 'italic', marginTop: '4px' }}>"{item.recommendation}"</p>}
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
