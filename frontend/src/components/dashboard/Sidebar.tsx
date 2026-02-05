'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Sidebar() {
  const pathname = usePathname();
  const menuItems = [
    { href: '/teacher/students', label: 'Öğrencilerim', icon: '👥' },
    { href: '/teacher/availability', label: 'Takvim & Müsaitlik', icon: '📅' },
    { href: '/teacher/profile', label: 'Profil Ayarları', icon: '👤' },
  ];

  return (
    <aside className="w-72 bg-[#0F172A] text-slate-300 min-h-screen flex flex-col fixed left-0 top-0 z-30 shadow-2xl">
      <div className="p-8 pb-4">
        <div className="flex items-center gap-3 mb-8">
           <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-500/20">E</div>
           <h1 className="font-bold text-2xl text-white tracking-tight">EduPremium</h1>
        </div>
        <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 px-2">YÖNETİM PANELİ</div>
      </div>

      <nav className="flex-1 px-4 space-y-2">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.href} href={item.href} className={`flex items-center gap-4 px-4 py-4 rounded-xl transition-all duration-200 group ${isActive ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25 translate-x-1' : 'hover:bg-white/5 hover:text-white'}`}>
              <span className={`text-xl transition-transform group-hover:scale-110 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'}`}>{item.icon}</span>
              <span className="font-medium">{item.label}</span>
              {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white/80 backdrop-blur-xl"></div>}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-slate-800/50">
        <div className="bg-slate-800/50 rounded-2xl p-4 flex items-center gap-3 hover:bg-slate-800 transition cursor-pointer group">
           <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white shadow-lg ring-2 ring-[#0F172A] group-hover:ring-indigo-500 transition-all">G</div>
           <div className="flex-1 min-w-0">
             <p className="text-sm font-bold text-white truncate">Gülşah Hoca</p>
             <p className="text-xs text-slate-400 truncate">Matematik Öğretmeni</p>
           </div>
           <button onClick={() => window.location.href='/login'} className="text-slate-400 hover:text-red-400 transition">
             <span className="text-xl">⏻</span>
           </button>
        </div>
      </div>
    </aside>
  );
}
