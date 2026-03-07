'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const NavButton: React.FC = () => {
    const router = useRouter();

    return (
        <div className="flex items-center space-x-2">
            {/* Back Button */}
            <button
                onClick={() => router.back()}
                className="flex items-center justify-center w-9 h-9 rounded-lg bg-white border border-slate-200 text-slate-400 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50/30 transition-all active:scale-95 shadow-sm"
                aria-label="Go back"
            >
                <ChevronLeft className="w-5 h-5" />
            </button>

            {/* Forward Button */}
            <button
                onClick={() => router.forward()}
                className="flex items-center justify-center w-9 h-9 rounded-lg bg-white border border-slate-200 text-slate-400 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50/30 transition-all active:scale-95 shadow-sm"
                aria-label="Go forward"
            >
                <ChevronRight className="w-5 h-5" />
            </button>
        </div>
    );
};

export default NavButton;

