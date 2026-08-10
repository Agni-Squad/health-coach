'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  
  // Manage active tab state with useState
  const [activeTab, setActiveTab] = useState(pathname || '/');
  const [userName, setUserName] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

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
                color: isActive ? '#FFFFFF' : '#64748B',
                textDecoration: 'none',
                position: 'relative',
                zIndex: 0, // CRITICAL: Creates a stacking context so the -1 z-index background doesn't go behind the header!
                transition: 'color 0.2s ease',
              }}
              onMouseOver={(e) => {
                if (!isActive) e.currentTarget.style.color = '#0F172A';
              }}
              onMouseOut={(e) => {
                if (!isActive) e.currentTarget.style.color = '#64748B';
              }}
            >
              {isActive && (
                <motion.div
                  layoutId="activeTabIndicator"
                  style={{
                    position: 'absolute',
                    inset: 0,
                    backgroundColor: '#0F172A',
                    borderRadius: '8px',
                    zIndex: -1
                  }}
                  transition={{ type: 'spring', duration: 0.5, bounce: 0.15 }}
                />
              )}
              <span style={{ position: 'relative', zIndex: 1 }}>{item.name}</span>
            </Link>
          );
        })}
      </div>

      {/* User Display & Logout */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {userName && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', position: 'relative' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#1E293B' }}>{userName}</div>
            </div>
            
            {/* Clickable User Avatar */}
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: '#F1F5F9',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                overflow: 'hidden',
                border: 'none',
                cursor: 'pointer',
                color: '#475569',
                transition: 'background-color 0.2s',
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#E2E8F0'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#F1F5F9'}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
            </button>
            
            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div style={{
                position: 'absolute',
                top: '100%',
                right: '0',
                marginTop: '8px',
                backgroundColor: 'white',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                border: '1px solid #E2E8F0',
                padding: '8px',
                zIndex: 50,
                minWidth: '150px'
              }}>
                <button
                  onClick={handleLogout}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    padding: '8px 12px',
                    backgroundColor: 'transparent',
                    color: '#EF4444',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: 500,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#FEF2F2'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                  Logout
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
