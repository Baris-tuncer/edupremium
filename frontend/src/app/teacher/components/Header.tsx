'use client';

interface HeaderProps {
  user: any;
}

export default function TeacherHeader({ user }: HeaderProps) {
  return (
    <header className="fixed top-0 left-64 right-0 h-16 bg-white/80 backdrop-blur-md border-b border-slate-100 z-30 px-8 flex items-center justify-between">
      <div>
        <h1 className="text-xl font-display font-semibold text-navy-900">Öğretmen Paneli</h1>
      </div>
      
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <button className="relative p-2 text-slate-500 hover:text-navy-900 hover:bg-slate-50 rounded-lg transition-colors">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={1.5} 
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" 
            />
          </svg>
          <span className="absolute top-1 right-1 w-2 h-2 bg-gold-500 rounded-full" />
        </button>

        {/* User Info */}
        <div className="flex items-center gap-3 text-sm">
          <span className="text-slate-600">
            {user?.firstName} {user?.lastName}
          </span>
        </div>
      </div>
    </header>
  );
}
