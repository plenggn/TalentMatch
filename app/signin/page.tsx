// app/signin/page.tsx
"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

// ไอคอน SVG สำหรับปุ่ม Social (ฝังมาในนี้เลย)
const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M43.611 20.083H42V20H24V28H35.303C34.047 32.66 30.083 36 24 36C17.373 36 12 30.627 12 24C12 17.373 17.373 12 24 12C27.059 12 29.842 13.15 31.961 15.039L37.618 9.382C34.047 6.182 29.268 4 24 4C12.954 4 4 12.954 4 24C4 35.046 12.954 44 24 44C35.046 44 44 35.046 44 24C44 22.659 43.862 21.35 43.611 20.083Z" fill="#FFC107"/>
    <path d="M6.306 14.691L12.01 19.08C13.044 15.822 16.21 13.333 20 13.333C21.72 13.333 23.31 13.88 24.64 14.83L29.16 10.31C26.6 8.24 23.42 7 20 7C14.73 7 10.09 9.8 7.38 13.88L6.306 14.691Z" fill="#FF3D00"/>
    <path d="M24 44C29.268 44 34.047 41.818 37.618 38.618L31.961 32.961C29.842 34.85 27.059 36 24 36C20.21 36 17.04 33.511 16 30.254L10.29 34.64C12.91 40.28 18.12 44 24 44Z" fill="#4CAF50"/>
    <path d="M43.611 20.083H42V20H24V28H35.303C34.047 32.66 30.083 36 24 36C20.21 36 17.04 33.511 16 30.254L10.29 34.64C12.91 40.28 18.12 44 24 44C35.046 44 44 35.046 44 24C44 22.659 43.862 21.35 43.611 20.083Z" fill="#1976D2"/>
  </svg>
);

const FacebookIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12Z"/>
  </svg>
);

export default function SignInPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const { data: session, status } = useSession();
  const router = useRouter();

  // 1. ตรวจสอบสถานะ: ถ้าล็อกอินแล้ว ให้เด้งไปหน้า Dashboard
  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/'); 
    }
  }, [status, router]);

  // 2. ฟังก์ชันล็อกอิน (Email/Pass)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // (เพิ่ม Logic การล็อกอินด้วย Email/Password ของคุณที่นี่)
    // เช่น:
    // const result = await signIn('credentials', {
    //   redirect: false,
    //   email: email,
    //   password: password,
    // });
    // if (result.ok) {
    //   router.push('/');
    // } else {
    //   // แสดง Error
    // }
    console.log('Email/Password login attempt:', { email, password });
  };
  
  // 3. ฟังก์ชันล็อกอิน (Social)
  const handleSocialSignIn = (provider: 'google' | 'facebook') => {
    signIn(provider, { callbackUrl: '/' });
  };

  // 4. แสดง Loading หากกำลังตรวจสอบสถานะ
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-gray-600">Loading session...</p>
      </div>
    );
  }

  // 5. แสดงหน้าล็อกอิน (เมื่อไม่ได้ล็อกอิน)
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4 font-sans">
      <div className="flex w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden bg-white">
        
        {/* ===== ฝั่งซ้าย (Branding) ===== */}
        <div className="hidden md:flex w-1/2 flex-col items-center justify-center p-12 text-center text-white bg-gradient-to-br from-[#14ADD6] to-[#384295]">
          <Image
            // (ใช้ Logo จาก public/images/LogoTalentMatch.png)
            src="/images/LogoTalentMatch.png" 
            alt="TalentMatch Logo"
            width={120}
            height={120}
            className="object-contain"
          />
          <h1 className="text-4xl font-bold mt-4">
            TalentMatch
          </h1>
          <p className="text-lg mt-2 text-indigo-100">
            Discover and connect with talented people to build the perfect team
          </p>
        </div>

        {/* ===== ฝั่งขวา (Form) ===== */}
        <div className="w-full md:w-1/2 p-8 md:p-12">
          <h2 className="text-3xl font-bold text-gray-900">Sign In</h2>
          <p className="text-gray-600 mt-2">Welcome back to Talent Match</p>

          {/* --- 1. Social Login Buttons --- */}
          <div className="flex flex-col md:flex-row gap-4 mt-6">
            <button 
              onClick={() => handleSocialSignIn('google')}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 transition-all"
            >
              <GoogleIcon />
              Sign in with Google
            </button>
            <button 
              onClick={() => handleSocialSignIn('facebook')}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-white font-semibold bg-[#1877F2] hover:bg-[#166ee2] transition-all"
            >
              <FacebookIcon />
              Sign in with Facebook
            </button>
          </div>

          {/* --- 2. Divider --- */}
          <div className="flex items-center gap-4 my-6">
            <hr className="flex-grow border-gray-300" />
            <span className="text-gray-500 text-sm">OR</span>
            <hr className="flex-grow border-gray-300" />
          </div>

          {/* --- 3. Email/Password Form --- */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label 
                htmlFor="email" 
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="yourmail@gmail.com"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Password */}
            <div>
              <label 
                htmlFor="password" 
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="************"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Remember me & Forgot */}
            <div className="flex justify-between items-center text-sm">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="remember"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="remember" className="text-gray-700">
                  Remember me
                </label>
              </div>
              <Link href="/forgot-password" className="text-blue-600 hover:underline">
                Forgot password?
              </Link>
            </div>

            {/* Submit Button */}
            <button 
              type="submit" 
              className="w-full py-3 rounded-lg text-white font-semibold bg-gradient-to-r from-[#14ADD6] to-[#384295] hover:opacity-90 transition-all shadow-lg"
            >
              Sign In
            </button>
          </form>

          {/* --- 4. Sign Up Link --- */}
          <p className="text-center text-sm text-gray-600 mt-6">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="text-blue-600 font-semibold hover:underline">
              Sign Up
            </Link>
          </p>

        </div>
      </div>
    </div>
  );
}
