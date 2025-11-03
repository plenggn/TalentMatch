"use client";

import React from 'react';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import Image from 'next/image';

const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
    <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path>
    <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path>
    <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.222,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path>
    <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571l6.19,5.238C39.999,36.505,44,30.825,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path>
  </svg>
);

export default function LoginPage() {

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-cyan-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
      
      <div className="bg-white rounded-2xl shadow-2xl p-8 sm:p-10 w-full max-w-md flex flex-col gap-6 border border-gray-100 animate-fade-in">

        <div className="flex flex-col items-center gap-2">
          <Image 
            src="/images/LogoTalentMatch.png" 
            alt="TalentMatch Logo" 
            width={96}
            height={96}
            className="w-24 h-24 object-contain"
            priority 
          />
          <span className="text-3xl font-bold bg-gradient-to-r from-cyan-500 to-indigo-600 bg-clip-text text-transparent">
            TalentMatch
          </span>
          <p className="text-sm text-gray-500 text-center max-w-xs">
         AI-powered matching to build your perfect team.
          </p>
        </div>

        <div className="flex flex-col gap-1 text-center">
          <h2 className="text-3xl font-bold text-gray-900">
            Sign In
          </h2>
          <p className="text-base text-gray-500">
            Welcome to Talent Match
          </p>
        </div>
        
        <div className="flex items-center gap-4 py-2">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-sm font-medium text-gray-500">
            Sign in with
          </span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>
        
        <div className="flex flex-col gap-4">
          
          <button 
            type="button" 
            onClick={() => signIn('google', { callbackUrl: '/' })}
            className="flex w-full items-center justify-center gap-3 px-4 py-3 rounded-xl border border-gray-300 bg-white text-base font-semibold text-gray-700
                       transition-all duration-300 ease-in-out
                       hover:shadow-lg hover:border-gray-400 hover:-translate-y-0.5
                       focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <GoogleIcon />
            Sign in with Google
          </button>

        </div>
      </div>
    </div>
  );
}
