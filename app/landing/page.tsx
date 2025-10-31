"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function LandingPage() {
  const [rememberMe, setRememberMe] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  const handleGoogleSignIn = () => {
  };

  const handleFacebookSignIn = () => {
  };

  return (
    <div className="min-h-screen bg-[#F8F9FD] pt-[23px] px-[100px] pb-[100px]" style={{ fontFamily: 'Nunito, -apple-system, Roboto, Helvetica, sans-serif' }}>
      <div className="flex flex-col items-center mb-[201px]">
        <div className="w-[283px] h-[283px] mb-5">
          <Image
            src="https://api.builder.io/api/v1/image/assets/TEMP/b1cde45ef9298eb26a0bff4e422bb36f8d7bec37?width=566"
            alt="TalentMatch Logo"
            width={283}
            height={283}
            className="w-full h-full object-contain"
          />
        </div>
        <h1 
          className="text-[64px] font-bold leading-[20px] text-center mb-[61px]"
          style={{
            background: 'linear-gradient(135deg, #14ADD6 0%, #384295 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          TalentMatch
        </h1>
        <p className="text-[14px] font-normal leading-[24px] text-[#262626] text-center max-w-[454px]">
          Discover and connect with talented people to build the perfect team
        </p>
      </div>

      <div className="max-w-[1239px] mx-auto">
        <h2 className="text-[64px] font-bold leading-[20px] text-black mb-[61px]">
          Sign In
        </h2>
        <p className="text-[24px] font-normal leading-[24px] text-[#898989] mb-[71px]">
          Welcome to Talent Match
        </p>

        <form onSubmit={handleSubmit} className="w-full">
          <div className="mb-[67px]">
            <label htmlFor="email" className="block text-[24px] font-normal leading-[24px] text-[#262626] mb-4">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="yourmail@gmail.com"
              className="w-full h-[68px] px-8 rounded-[18px] bg-[#EAEAEA] border-none text-[24px] font-normal leading-[24px] text-[#262626] placeholder:text-[#898989] placeholder:underline focus:outline-none"
              style={{ fontFamily: 'Nunito, -apple-system, Roboto, Helvetica, sans-serif' }}
            />
          </div>

          <div className="mb-[67px]">
            <label htmlFor="password" className="block text-[24px] font-normal leading-[24px] text-[#262626] mb-4">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="************"
              className="w-full h-[68px] px-8 rounded-[18px] bg-[#EAEAEA] border-none text-[24px] font-normal leading-[24px] text-[#262626] placeholder:text-[#898989] focus:outline-none"
              style={{ fontFamily: 'Nunito, -apple-system, Roboto, Helvetica, sans-serif' }}
            />
          </div>

          <div className="flex items-center mb-[85px]">
            <input
              type="checkbox"
              id="remember"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-[31px] h-[34px] rounded-[3px] border border-black bg-transparent cursor-pointer mr-[15px] flex-shrink-0"
            />
            <label htmlFor="remember" className="text-[24px] font-normal leading-[24px] text-[#262626] cursor-pointer">
              Remember me
            </label>
          </div>

          <button 
            type="submit" 
            className="w-full h-[68px] rounded-[18px] bg-[#3567FF] border-none text-[24px] font-normal leading-[24px] text-[#F8F9FD] text-center cursor-pointer mb-[85px] hover:opacity-95"
            style={{ 
              textShadow: '0 4px 4px rgba(0, 0, 0, 0.25)',
              fontFamily: 'Nunito, -apple-system, Roboto, Helvetica, sans-serif'
            }}
          >
            Sign In
          </button>
        </form>

        <p className="text-[24px] font-normal leading-[24px] text-[#898989] text-center mb-[57px]">
          Or sign in with
        </p>

        <div className="flex gap-[19px] mb-[68px]">
          <button 
            onClick={handleGoogleSignIn}
            className="flex-1 h-[68px] rounded-[18px] border border-black bg-transparent text-[24px] font-normal leading-[24px] text-black text-center cursor-pointer hover:bg-[rgba(234,234,234,0.2)]"
            style={{ fontFamily: 'Nunito, -apple-system, Roboto, Helvetica, sans-serif' }}
          >
            Google
          </button>
          <button 
            onClick={handleFacebookSignIn}
            className="flex-1 h-[68px] rounded-[18px] border border-black bg-transparent text-[24px] font-normal leading-[24px] text-black text-center cursor-pointer hover:bg-[rgba(234,234,234,0.2)]"
            style={{ fontFamily: 'Nunito, -apple-system, Roboto, Helvetica, sans-serif' }}
          >
            Facebook
          </button>
        </div>

        <p className="text-[24px] font-normal leading-[24px] text-center">
          <span className="text-[#898989]">Don t have an account? </span>
          <Link href="/signup" className="text-[#3567FF] no-underline hover:underline">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}
 