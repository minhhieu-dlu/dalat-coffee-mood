import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from 'react-hot-toast'
import BottomNav from "@/components/BottomNav";
import "./globals.css";
import 'leaflet/dist/leaflet.css'

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: 'Dalat Coffee Mood',
  description: 'Khám phá quán cà phê Đà Lạt theo mood của bạn',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-cream-bg text-slate-800">
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 3000,
            className: 'rounded-2xl',
            success: {
              style: {
                background: '#0f5132',
                color: '#fff',
              },
            },
            error: {
              style: {
                background: '#991b1b',
                color: '#fff',
              },
            },
          }}
        />
        <div className="flex min-h-screen flex-col">
          <main className="flex-1 pb-24 md:pb-0">{children}</main>
          <BottomNav />
        </div>
      </body>
    </html>
  );
}
