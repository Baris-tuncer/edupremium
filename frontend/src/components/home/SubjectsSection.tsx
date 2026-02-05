'use client';

import React from 'react';
import Link from 'next/link';

const SubjectsSection = () => {
  const subjects = [
    { name: 'Matematik', icon: '∑', href: '/teachers?level=lise&subject=Matematik' },
    { name: 'Fizik', icon: 'ƒ', href: '/teachers?level=lise&subject=Fizik' },
    { name: 'Kimya', icon: 'Ω', href: '/teachers?level=lise&subject=Kimya' },
    { name: 'Biyoloji', icon: 'β', href: '/teachers?level=lise&subject=Biyoloji' },
    { name: 'Türkçe', icon: 'A', href: '/teachers?level=ortaokul&subject=Türkçe' },
    { name: 'İngilizce', icon: 'EN', href: '/teachers?level=yabanci_dil&subject=İngilizce' },
    { name: 'LGS Hazırlık', icon: 'Δ', href: '/dersler' },
    { name: 'TYT-AYT', icon: 'π', href: '/dersler' },
  ];

  return (
    <section className="section bg-white/80 backdrop-blur-xl">
      <div className="container-wide">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between mb-12">
          <div>
            <span className="inline-block text-sm font-semibold text-gold-600 uppercase tracking-wider mb-4">
              Branşlar
            </span>
            <h2>Tüm Dersler İçin Uzman Öğretmenler</h2>
          </div>
          <Link href="/courses" className="btn-ghost mt-4 lg:mt-0">
            Tüm Branşları Gör
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {subjects.map((subject, index) => (
            <Link
              key={index}
              href={subject.href}
              className="group card-interactive p-6"
            >
              <div className="text-3xl mb-4 font-display text-navy-300 group-hover:text-navy-600 transition-colors">{subject.icon}</div>
              <h3 className="font-display text-lg font-semibold text-navy-900 mb-1 group-hover:text-navy-700">
                {subject.name}
              </h3>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SubjectsSection;
