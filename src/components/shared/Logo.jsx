import React from 'react';

export default function Logo({ size = 'md', white = false }) {
  const sizes = {
    sm: 'h-8',
    md: 'h-10',
    lg: 'h-14',
    xl: 'h-20'
  };

  return (
    <div className={`flex items-center gap-2 ${sizes[size]}`}>
      <div className="flex items-center gap-1">
        <div className={`font-black tracking-tight ${size === 'xl' ? 'text-4xl' : size === 'lg' ? 'text-2xl' : size === 'md' ? 'text-xl' : 'text-lg'}`}>
          <span className={white ? 'text-white' : 'text-[#D50000]'}>TACT</span>
          <span className={white ? 'text-white/80' : 'text-[#1A1A1A]'}> FREIGHT</span>
        </div>
      </div>
    </div>
  );
}