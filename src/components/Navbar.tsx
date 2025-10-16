"use client";
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const [hoverIndex, setHoverIndex] = React.useState<number | null>(null);
  const pathname = usePathname();

  const baseStyle: React.CSSProperties = {
    fontSize: 14,
    fontWeight: 400,
    color: '#262626',
    transition: 'all 0.4s ease',
    cursor: 'pointer',
    display: 'inline-block'
  };

  const gradientHoverStyle: React.CSSProperties = {
    fontSize: 14,
    fontWeight: 700,
    background: 'linear-gradient(90deg, #14ADD6, #384295)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    transition: 'all 0.4s ease',
    cursor: 'pointer',
    display: 'inline-block'
  };

  const menuItems = [
    { name: 'AI Matching', path: '/AiMatching' },
    { name: 'CV Summary', path: '/CVSummary' },
    { name: 'Dashboard', path: '/' },
    { name: 'Applicants', path: '/Applicants' },
    { name: 'Job Description', path: '/JobDescription' },
    { name: 'CV Library', path: '/Information' },
    
    
  ];

  return (
    <div style={{
      width: '100%',
      height: '80px',
      backgroundColor: 'white',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 16px',
      boxSizing: 'border-box',
      overflowX: 'auto',
      whiteSpace: 'nowrap'
    }}>
      {/* Branding */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <img src="/images/LogoTalentMatch.png" alt="TalentMatch Logo" width={47} height={47} />
        <span style={{
          fontSize: 24,
          fontWeight: 700,
          background: 'linear-gradient(90deg, #14ADD6, #384295)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          transition: 'all 0.4s ease'
        }}>
          TalentMatch
        </span>
      </div>

      {/* Menu */}
      <div style={{
        display: 'flex',
        gap: '24px',
        alignItems: 'center',
        flexShrink: 1
      }}>
        {menuItems.map((item, i) => (
          <Link key={i} href={item.path} style={{ textDecoration: 'none' }}>
            <span
              style={
                pathname === item.path 
                  ? gradientHoverStyle 
                  : (hoverIndex === i ? gradientHoverStyle : baseStyle)
              }
              onMouseEnter={() => setHoverIndex(i)}
              onMouseLeave={() => setHoverIndex(null)}
            >
              {item.name}
            </span>
          </Link>
        ))}
      </div>

      {/* User Info */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
        <span style={{ fontSize: 14, color: '#121212' }}>Weeraphol J.</span>
        <span style={{ fontSize: 12, color: '#515151' }}>HR TalentMatch</span>
      </div>
    </div>
  );
}