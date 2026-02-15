import React from 'react';

export default function SectionHeading({ label, title, description, light = false, center = true }) {
  return (
    <div className={`${center ? 'text-center' : ''} max-w-3xl ${center ? 'mx-auto' : ''}`}>
      {label && (
        <span className="inline-block text-[#D50000] font-semibold text-sm tracking-widest uppercase mb-3">
          {label}
        </span>
      )}
      <h2 className={`text-3xl md:text-4xl font-bold tracking-tight ${light ? 'text-white' : 'text-[#1A1A1A]'}`}>
        {title}
      </h2>
      {description && (
        <p className={`mt-4 text-lg ${light ? 'text-white/70' : 'text-gray-500'} leading-relaxed`}>
          {description}
        </p>
      )}
    </div>
  );
}