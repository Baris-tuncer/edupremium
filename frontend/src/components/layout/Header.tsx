'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const Logo = () => (
  <Link href="/" className="flex items-center gap-3 group">
    <img
      src="/logo-192.png"
      alt="EduPremium Logo"
      className="w-10 h-10 rounded-xl shadow-elegant group-hover:shadow-elevated transition-shadow duration-300"
    />
    <div className="hidden sm:block">
      <span className="font-display text-xl font-semibold text-navy-900">EduPremium</span>
      <span className="block text-2xs text-slate-500 uppercase tracking-widest">Özel Ders Platformu</span>
    </div>
  </Link>
);

const NavLink = ({ href, children }: { href: string; children: React.ReactNode }) => {
  const pathname = usePathname();
  const isActive = pathname === href;
  
  return (
    <Link 
      href={href}
      className={`relative px-4 py-2 text-sm font-medium transition-colors duration-200
        ${isActive ? 'text-navy-900' : 'text-slate-600 hover:text-navy-900'}
      `}
    >
      {children}
      {isActive && (
        <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-gold-500 rounded-full" />
      )}
    </Link>
  );
};

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300
        ${isScrolled ? 'bg-white/95 backdrop-blur-md shadow-elegant py-3' : 'bg-transparent py-5'}
      `}
    >
      <div className="container-wide">
        <nav className="flex items-center justify-between">
          <Logo />

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            <NavLink href="/teachers">Öğretmenler</NavLink>
            <NavLink href="/courses">Dersler</NavLink>
            <NavLink href="/about">Hakkımızda</NavLink>
            <NavLink href="/contact">İletişim</NavLink>
          </div>

          {/* Auth Buttons */}
          <div className="hidden lg:flex items-center gap-3">
            <Link href="/login" className="btn-ghost">
              Giriş Yap
            </Link>
            <Link href="/register" className="btn-primary">
              Kayıt Ol
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 text-slate-600 hover:text-navy-900 transition-colors"
            aria-label="Menü"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {isMobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </nav>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden mt-4 pb-4 border-t border-slate-100 animate-fade-in">
            <div className="flex flex-col gap-2 pt-4">
              <Link href="/teachers" className="px-4 py-3 text-slate-600 hover:text-navy-900 hover:bg-slate-50 rounded-lg transition-colors">
                Öğretmenler
              </Link>
              <Link href="/courses" className="px-4 py-3 text-slate-600 hover:text-navy-900 hover:bg-slate-50 rounded-lg transition-colors">
                Dersler
              </Link>
              <Link href="/about" className="px-4 py-3 text-slate-600 hover:text-navy-900 hover:bg-slate-50 rounded-lg transition-colors">
                Hakkımızda
              </Link>
              <Link href="/contact" className="px-4 py-3 text-slate-600 hover:text-navy-900 hover:bg-slate-50 rounded-lg transition-colors">
                İletişim
              </Link>
              <div className="divider my-2" />
              <Link href="/login" className="btn-secondary w-full">
                Giriş Yap
              </Link>
              <Link href="/register" className="btn-primary w-full">
                Kayıt Ol
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
