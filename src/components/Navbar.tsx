"use client";
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signIn, signOut } from 'next-auth/react'; 

export default function Navbar() {
  const [hoverIndex, setHoverIndex] = React.useState<number | null>(null);
  const pathname = usePathname();

  const { data: session, status } = useSession();

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

  const loginButtonStyle: React.CSSProperties = {
    background: 'linear-gradient(90deg, #14ADD6, #384295)',
    color: 'white',
    padding: '8px 16px',
    borderRadius: '8px',
    textDecoration: 'none',
    fontWeight: 600,
    fontSize: 14,
    transition: 'all 0.3s ease',
    cursor: 'pointer',
    border: 'none' 
  };

  const menuItems = [
    { name: 'Dashboard', path: '/' },
    { name: 'AI Matching', path: '/AiMatching' },
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
      // justifyContent: 'space-between', // <-- เราจะเอาอันนี้ออก
      padding: '0 16px',
      boxSizing: 'border-box',
      overflowX: 'auto',
      whiteSpace: 'nowrap'
    }}>
      
      {/* 1. คอลัมน์ซ้าย (โลโก้) */}
      <div style={{ 
        flex: 1, // <-- เพิ่ม
        display: 'flex', 
        alignItems: 'center', 
        gap: '12px' 
      }}>
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

      {/* 2. คอลัมน์กลาง (เมนู) */}
      <div style={{
        flex: 1, // <-- เพิ่ม
        display: 'flex',
        gap: '24px',
        alignItems: 'center', 
        justifyContent: 'center' // <-- เพิ่ม เพื่อให้เมนูอยู่กลางคอลัมน์
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
     
      {/* 3. คอลัมน์ขวา (ข้อมูลผู้ใช้) */}
      <div style={{ 
        flex: 1, // <-- เพิ่ม
        display: 'flex', 
        alignItems: 'center', 
        gap: '24px', 
        justifyContent: 'flex-end' // <-- เพิ่ม เพื่อดันทุกอย่างไปชิดขวา
      }}>
        
        {status === "loading" ? (
          <span style={{ fontSize: 14, color: '#999' }}>Loading...</span>

        ) : session ? (
          <>
            {session.user?.image && (
              <img 
                src={session.user.image} 
                alt="Profile" 
                style={{ width: 40, height: 40, borderRadius: '50%' }} 
              />
            )}
            
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'flex-start' // <-- เปลี่ยนจาก 'flex-end' เป็น 'flex-start'
            }}>
              <span style={{ fontSize: 14, color: '#121212' }}>
                {session.user?.name} 
              </span>
              <span style={{ fontSize: 12, color: '#515151' }}>
                {session.user?.email} 
              </span>
            </div>

            <button 
              onClick={() => signOut({ callbackUrl: '/login' })} 
              style={loginButtonStyle}
            >
              Sign Out
            </button>
          </>

        ) : (
          <Link href="/login" style={loginButtonStyle}>
            Login
          </Link>
        )}
        
      </div>
    </div>
  );
}