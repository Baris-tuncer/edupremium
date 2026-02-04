import React from 'react';

// Bu bileşen, içeriği sağdan soldan sıkıştırmaz, tam genişlikte arka plan verir.
// Ama okunabilirlik için yazıyı ortalar.
export const ContentSection = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`w-full bg-[#FDFBF7] text-[#0F172A] py-20 px-0 m-0 ${className}`}>
    <div className="max-w-4xl mx-auto px-6 md:px-12">
      {children}
    </div>
  </div>
);
