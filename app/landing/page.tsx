"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

// --- ไอคอน SVG (ฝังมาในนี้เลย) ---
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
// --- จบส่วนไอคอน ---


export default function LandingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // ถ้าล็อกอินแล้ว ให้เด้งไปหน้า Dashboard
  React.useEffect(() => {
    if (status === 'authenticated') {
      router.push('/'); 
    }
  }, [status, router]);

  // ฟังก์ชันสำหรับเรียก Social Sign-in
  const handleSocialSignIn = (provider: 'google' | 'facebook') => {
    // เมื่อล็อกอินสำเร็จ ให้เด้งไปหน้า Dashboard ('/')
    signIn(provider, { callbackUrl: '/' });
  };

  // แสดงหน้า Loading ขณะตรวจสอบสถานะ
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  // แสดงหน้า Login (เมื่อยังไม่ล็อกอิน)
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
      
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 md:p-10">
        
        {/* --- 1. ส่วน Branding (โลโก้) --- */}
        <div className="flex flex-col items-center mb-8">
          <Image
            // (ใช้ Logo จาก /public/images/LogoTalentMatch.png)
            src="/images/LogoTalentMatch.png" 
            alt="TalentMatch Logo"
            width={100}
            height={100}
            className="object-contain"
          />
          <h1 
            className="text-3xl font-bold mt-3 bg-gradient-to-r from-[#14ADD6] to-[#384295] bg-clip-text text-transparent"
          >
            TalentMatch
          </h1>
          <p className="text-gray-600 text-center mt-2">
            Discover and connect with talented people
          </p>
        </div>

        {/* --- 2. ส่วนปุ่ม Login --- */}
        <div className="flex flex-col gap-4">
          <h2 className="text-xl font-semibold text-center text-gray-800">
            Sign in to continue
          </h2>

          <button 
            onClick={() => handleSocialSignIn('google')}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <GoogleIcon />
            Sign in with Google
          </button>

          <button 
            onClick={() => handleSocialSignIn('facebook')}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-lg text-white font-semibold bg-[#1877F2] hover:bg-[#166ee2] transition-all focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <FacebookIcon />
            Sign in with Facebook
          </button>
        </div>

        {/* --- 3. ส่วน Link (ถ้ามี) --- */}
        <p className="text-center text-sm text-gray-600 mt-8">
          Need an account?{' '}
          <Link href="/signup" className="text-blue-600 font-semibold hover:underline">
            Sign Up
          </Link>
        </p>
        
      </div>
    </div>
  );
}
