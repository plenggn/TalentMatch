// app/layout.tsx
"use client"; // เพิ่มบรรทัดนี้ด้านบนสุด

import './globals.css'
import { Nunito } from 'next/font/google';
import Navbar from '@components/Navbar';
import { SessionProvider } from "next-auth/react"; // ✅ import SessionProvider

const nunito = Nunito({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-nunito',
});

export default function RootLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={nunito.variable}>
      <body style={{ fontFamily: 'var(--font-nunito), sans-serif' }}>
        <SessionProvider>
          <Navbar />  {/* ครอบด้วย SessionProvider */}
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
