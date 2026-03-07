'use client';

import React from 'react';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import Cart from '../components/Cart';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex flex-col min-h-screen">
            <NavBar />
            <Cart />
            <main className="flex-grow bg-white">
                {children}
            </main>
            <Footer />
        </div>
    );
}
