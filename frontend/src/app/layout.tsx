import type { Metadata } from "next";
import "./globals.css";
import Link from 'next/link';
import Header from '@/components/Header';
export const metadata: Metadata = {
  title: "Wellsync Health",
  description: "Your personal AI-powered health tracking dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <div className="app-wrapper">
          <Header />
          
          <main>
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
