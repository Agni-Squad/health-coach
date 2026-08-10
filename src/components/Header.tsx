'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  
  // Manage active tab state with useState
  const [activeTab, setActiveTab] = useState(pathname || '/');
  const [userName, setUserName] = useState('');

  // Sync state if pathname changes (e.g. back/forward navigation)
  useEffect(() => {
    setActiveTab(pathname);
  }, [pathname]);

  // Fetch logged in user details
  useEffect(() => {
    const name = localStorage.getItem('userName') || 'User';
    setUserName(name);
  }, []);

  if (pathname === '/login' || pathname === '/register') {
    return null;
  }

  const handleLogout = () => {
    // Clear stored session/authentication tokens
    localStorage.removeItem('token');
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');
    
    // Navigate user to Login page
    router.push('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/' },
    { name: 'Health Overview', path: '/goals' },
    { name: 'Activity & Fitness', path: '/log' },
    { name: 'Medical & Wellness', path: '/menu' },
  ];

  return (
    <nav className="top-nav" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', backgroundColor: 'white', borderBottom: '1px solid #E2E8F0' }}>
      
      {/* Brand / Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div style={{ color: '#2563EB', display: 'flex' }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"></path></svg>
        </div>
        <span style={{ fontSize: '20px', fontWeight: 700, color: '#1E293B' }}>Wellsync</span>
      </div>

      {/* Tabs Navigation */}
      <div style={{ display: 'flex', gap: '8px' }}>
        {navItems.map((item) => {
          const isActive = activeTab === item.path;
          return (
            <Link
              key={item.path}
              href={item.path}
              onClick={() => setActiveTab(item.path)}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                fontWeight: '600',
                backgroundColor: isActive ? '#0F172A' : 'transparent',
                color: isActive ? '#FFFFFF' : '#64748B',
                textDecoration: 'none',
                transition: 'all 0.2s ease',
              }}
              onMouseOver={(e) => {
                if (!isActive) e.currentTarget.style.backgroundColor = '#F8FAFC';
              }}
              onMouseOut={(e) => {
                if (!isActive) e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              {item.name}
            </Link>
          );
        })}
      </div>

      {/* User Display & Logout */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {userName && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#1E293B' }}>{userName}</div>
            </div>
            {/* Circular Avatar */}
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#E2E8F0', display: 'flex', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' }}>
              <span style={{ fontSize: '20px' }}>👩🏽</span>
            </div>
            
            {/* Logout Button */}
            <button
              onClick={handleLogout}
              style={{
                marginLeft: '8px',
                padding: '8px 16px',
                backgroundColor: '#EF4444',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 600,
                transition: 'background-color 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#DC2626'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#EF4444'}
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
