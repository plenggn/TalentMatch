"use client";
import React, { useState } from 'react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  
  // (เพิ่ม State)
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  // (Style object เดิมๆ จากหน้า Login)
  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '0.75rem',
    boxSizing: 'border-box',
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    backgroundColor: '#f9f9f9', 
    fontSize: '14px',
    color: '#333'
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    marginBottom: '0.5rem',
    fontSize: '14px',
    fontWeight: 500,
    color: '#333'
  };

  // (เพิ่ม Function)
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault(); // ป้องกันหน้ารีเฟรช
    setMessage('');
    
    if (!email) {
      setMessage('Please enter your email address.');
      return;
    }
    
    // (ในอนาคต: ตรงนี้คือจุดที่คุณจะเรียก API ส่ง Email)
    console.log("Password reset requested for:", email);
    
    // (ชั่วคราว) แสดงข้อความว่าสำเร็จ
    setMessage('If an account exists for this email, we have sent a reset link. Please check your inbox.');
  };

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh', 
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
        maxWidth: '700px' // ทำให้กรอบกว้าง
      }}
      onSubmit={handleSubmit} // (เพิ่ม)
      >
        
        {/* --- 1. ส่วน Header --- */}
        <div style={{ textAlign: 'center' }}>
          <h2 style={{
            fontSize: '2rem', 
            fontWeight: 700,
            color: '#121212',
            margin: 0
          }}>
            Forgot Password?
          </h2>
          <p style={{
            fontSize: '1rem', 
            color: '#515151',
            margin: '0.25rem 0 0 0'
          }}>
            Enter your email and we'll send you a link to reset it.
          </p>
        </div>
        
        {/* --- 2. Input Email --- */}
        <div>
          <label htmlFor="email" style={labelStyle}>
            Email<span style={{ color: 'red' }}> *</span>
          </label>
          <input 
            type="email" 
            id="email" 
            style={inputStyle}
            placeholder="yourmail@gmail.com"
            value={email} // (เพิ่ม)
            onChange={(e) => setEmail(e.target.value)} // (เพิ่ม)
          />
        </div>

        {/* --- (เพิ่ม) แสดงข้อความ Message --- */}
        {message && (
          <p style={{
            // ถ้ามีคำว่า 'Please enter' (error) ให้เป็นสีแดง, ถ้าไม่ (success) ให้เป็นสีเขียว
            color: message.includes('Please enter') ? 'red' : 'green', 
            fontSize: 14, 
            textAlign: 'center', 
            margin: 0 
          }}>
            {message}
          </p>
        )}
        
        {/* --- 3. Submit Button --- */}
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
          Send Reset Link
        </button>

        {/* --- 4. ส่วน Sign In --- */}
        <p style={{
          textAlign: 'center',
          fontSize: '14px',
          color: '#515151',
          margin: 0,
          marginTop: '0.5rem' 
        }}>
          Remember your password?{' '}
          <Link 
            href="/login" // ลิงก์กลับไปหน้า Login
            style={{
              fontWeight: 'bold', 
              color: '#3567FF',  
              textDecoration: 'none',
            }}
          >
            Back to Sign In
          </Link>
        </p>

      </form>
    </div>
  );
}