"use client";
import React from 'react';
import Link from 'next/link';
import { signIn } from 'next-auth/react';

export default function LoginPage() {

  // Style สำหรับปุ่ม Social (Google, Facebook)
  const socialButtonStyle: React.CSSProperties = {
    flex: 1, 
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem', 
    padding: '0.75rem',
    backgroundColor: 'white',
    border: '1px solid #e0e0e0', 
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 600,
    color: '#262626',
    transition: 'background-color 0.2s ease',
  };

  // Style สำหรับ Input Fields
  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '0.75rem',
    boxSizing: 'border-box',
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    backgroundColor: '#f9f9f9', 
    fontSize: '14px',
  };

  // Style สำหรับ Label
  const labelStyle: React.CSSProperties = {
    display: 'block',
    marginBottom: '0.5rem',
    fontSize: '14px',
    fontWeight: 500,
    color: '#333'
  };

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: 'calc(100vh - 80px)', 
      backgroundColor: '#f4f7f6',
      padding: '2rem 0' 
    }}>
      
      {/* กล่องฟอร์มหลัก */}
      <form style={{
        padding: '2.5rem', 
        borderRadius: '12px',
        backgroundColor: 'white',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
        display: 'flex',
        flexDirection: 'column', 
        gap: '1.25rem', 
        width: '100%',
        maxWidth: '700px' // กรอบกว้าง
      }}>
        
        {/* --- 1. (แก้ไข) ส่วน Logo (แก้เรื่องจัดกลาง) --- */}
        <div style={{ 
          textAlign: 'center', // <-- ตัวนี้จะจัดกลาง <p> (tagline)
          marginBottom: '1rem' 
        }}>
          
          {/* Logo Image (แก้ไข) */}
          <img 
            src="/images/LogoTalentMatch.png" 
            alt="TalentMatch Logo" 
            style={{ 
              width: '100px', 
              height: 'auto',
              display: 'block', // <-- ทำให้เป็น block
              margin: '0 auto 0.25rem auto' // <-- auto ซ้าย-ขวา เพื่อจัดกลาง
            }} 
          />
          
          {/* "TalentMatch" Text (แก้ไข) */}
          <span style={{
            fontSize: 24, 
            fontWeight: 700,
            background: 'linear-gradient(90deg, #14ADD6, #384295)', 
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            display: 'block', 
            margin: '0.25rem auto 0.5rem auto' // <-- auto ซ้าย-ขวา เพื่อจัดกลาง
          }}>
            TalentMatch
          </span>

          {/* Tagline (อันนี้จะกลางอยู่แล้วเพราะ textAlign: 'center' ของแม่) */}
          <p style={{
            fontSize: '14px',
            color: '#515151',
            margin: 0
          }}>
            Discover and connect with talented people to build the perfect team
          </p>
        </div>
        {/* --- สิ้นสุดการแก้ไข --- */}


        {/* --- 2. ส่วน Header --- */}
        <div>
          <h2 style={{
            fontSize: '2rem', 
            fontWeight: 700,
            color: '#121212',
            margin: 0
          }}>
            Sign In
          </h2>
          <p style={{
            fontSize: '1rem', 
            color: '#515151',
            margin: '0.25rem 0 0 0'
          }}>
            Welcome to Talent Match
          </p>
        </div>
        
        {/* --- 3. Input Email --- */}
        <div>
          <label htmlFor="email" style={labelStyle}>
            Email
          </label>
          <input 
            type="email" 
            id="email" 
            style={inputStyle}
            placeholder="yourmail@gmail.com"
          />
        </div>
        
        {/* --- 4. Input Password --- */}
        <div>
          <label htmlFor="password" style={labelStyle}>
            Password
          </label>
          <input 
            type="password" 
            id="password" 
            style={inputStyle}
            placeholder="************"
          />
        </div>

        {/* --- 5. Remember me & Forgot password --- */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '14px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input type="checkbox" id="remember" style={{ margin: 0 }} />
            <label htmlFor="remember" style={{ color: '#515151', fontWeight: 500 }}>
              Remember me
            </label>
          </div>
          <Link 
            href="/forgot-password" 
            style={{
              color: '#3567FF',
              textDecoration: 'none',
              fontWeight: 500
            }}
          >
            forgot password?
          </Link>
        </div>
        
        {/* --- 6. Submit Button --- */}
        <button 
          type="submit" 
          style={{
            backgroundColor: '#3567FF', 
            color: 'white',
            width: '100%',
            padding: '0.75rem',
            borderRadius: '8px',
            border: 'none',
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: '16px',
            marginTop: '0.5rem'
          }}
        >
          Sign In
        </button>

        {/* --- 7. แถบขั้น "Or sign in with" --- */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
        }}>
          <div style={{ flex: 1, height: '1px', backgroundColor: '#e0e0e0' }} />
          <span style={{ color: '#515151', fontSize: '14px', flexShrink: 0 }}>
            Or sign in with
          </span>
          <div style={{ flex: 1, height: '1px', backgroundColor: '#e0e0e0' }} />
        </div>
        
        {/* --- 8. ปุ่ม Social Login --- */}
        <div style={{
          display: 'flex',
          gap: '1rem', 
        }}>
          
        <button 
        type="button" 
        style={socialButtonStyle}
        onClick={() => signIn('google', { callbackUrl: '/' })} // <-- เพิ่มบรรทัดนี้
          >
        <img src="/images/google.svg" alt="Google" width={20} height={20} />
        <span>Google</span>
        </button>

        <button 
        type="button" 
        style={socialButtonStyle}
        onClick={() => signIn('facebook', { callbackUrl: '/' })} // <-- เพิ่มบรรทัดนี้
        >
        <img src="/images/facebook.svg" alt="Facebook" width={20} height={20} />
        <span>Facebook</span>
        </button>
        </div>

        {/* --- 9. ส่วน Sign up --- */}
        <p style={{
          textAlign: 'center',
          fontSize: '14px',
          color: '#515151',
          margin: 0,
          marginTop: '0.5rem' 
        }}>
          Don't have an account?{' '}
          <Link 
            href="/register" 
            style={{
              fontWeight: 'bold', 
              color: '#3567FF',  
              textDecoration: 'none',
            }}
          >
            Sign Up
          </Link>
        </p>

      </form>
    </div>
  );
}