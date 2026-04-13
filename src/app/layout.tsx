import React from 'react';
import type { Metadata } from 'next';
import { Inter, Outfit } from 'next/font/google';
import './globals.css';
import { CartProvider } from '@/context/CartContext';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const outfit = Outfit({ subsets: ['latin'], variable: '--font-outfit' });

export const metadata: Metadata = {
  title: 'Sareng Medical Equipment | Professional Medical Solutions',
  description: 'Premium medical grade equipment and supplies for healthcare professionals.',
  icons: {
    icon: '/ShopLogo.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth antialiased">
      <body className={`${inter.variable} ${outfit.variable} font-sans min-h-screen bg-slate-50 text-slate-900 transition-colors duration-300`}>
        <CartProvider>
          {children}
        </CartProvider>
      </body>
    </html>
  );
}