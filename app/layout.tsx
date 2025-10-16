import './globals.css'
import { Nunito } from 'next/font/google';
import Navbar from '@components/Navbar';

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
        <Navbar />  {/* เพิ่มบรรทัดนี้ */}
        {children}
      </body>
    </html>
  );
}