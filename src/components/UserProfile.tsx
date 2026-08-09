'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function UserProfile() {
  const router = useRouter();
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    const name = localStorage.getItem('userName') || 'User';
    const email = localStorage.getItem('userEmail') || '';
    setUserName(name);
    setUserEmail(email);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');
    router.push('/register');
  };

  if (!userName) return null;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', borderLeft: '1px solid #E2E8F0', paddingLeft: '16px' }}>
      <div style={{ textAlign: 'right' }}>
        <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>{userName}</div>
        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{userEmail}</div>
      </div>
      <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#E2E8F0', display: 'flex', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' }}>
        <span style={{ fontSize: '20px' }}>👩🏽</span>
      </div>
      <button 
        onClick={handleLogout}
        style={{ 
          marginLeft: '8px', 
          padding: '6px 12px', 
          backgroundColor: '#EF4444', 
          color: 'white', 
          border: 'none', 
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '12px',
          fontWeight: 600
        }}
      >
        Logout
      </button>
    </div>
  );
}
