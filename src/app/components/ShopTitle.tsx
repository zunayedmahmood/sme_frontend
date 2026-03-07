'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface ShopTitleProps {
    variant?: 'public' | 'private';
}

const ShopTitle: React.FC<ShopTitleProps> = ({ variant }) => {
    const pathname = usePathname();

    // Detect route group context
    const currentVariant = variant || (pathname?.startsWith('/dashboard') || pathname === '/login' ? 'private' : 'public');
    const href = currentVariant === 'private' ? '/dashboard' : '/';

    return (
        <div className="flex flex-col items-start">
            <Link
                href={href}
                className="group relative inline-block py-1"
            >
                <div className="flex items-center gap-2.5">
                    {/* Shop Logo */}
                    <img
                        src="/ShopLogo.png"
                        alt="SME logo"
                        className="h-9 w-auto object-contain"
                    />

                    <span className="flex items-baseline text-2xl font-bold tracking-tight select-none">
                        <span className="text-blue-600 transition-colors duration-300">
                            Sareng
                        </span>
                        <span className="text-slate-900 transition-all duration-300">
                            MedEquipment
                        </span>
                    </span>
                </div>

                {/* Subtle underline on hover */}
                <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full opacity-50" />
            </Link>

            {/* Subtitle / Tagline — indented to align under the text, past the logo */}
            <p className="text-[9px] uppercase tracking-[0.2em] font-medium text-slate-400 mt-0.5 ml-[46px]">
                Medical Equipments Distributor
            </p>
        </div>
    );
};

export default ShopTitle;