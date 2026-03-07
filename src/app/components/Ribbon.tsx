import React from 'react';

const Ribbon: React.FC = () => {
    return (
        <div className="relative w-full max-w-[200px] h-[6px] sm:h-[8px]">
            {/* Main colorful track */}
            <div className="absolute inset-0 bg-linear-to-r from-pink-400 via-purple-500 to-blue-500 rounded-full blur-[0.5px] opacity-80" />

            {/* Glint effect */}
            <div className="absolute inset-0 bg-linear-to-r from-white/0 via-white/40 to-white/0 rounded-full animate-pulse" />

            {/* Reflection glow */}
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-3/4 h-1 bg-purple-500/20 blur-md rounded-full pointer-events-none" />

            {/* Floating dot accents */}
            <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-pink-500/40 animate-bounce" />
            <div className="absolute -right-4 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-blue-500/40 animate-bounce [animation-delay:0.2s]" />
        </div>
    );
};

export default Ribbon;
