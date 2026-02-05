'use client';

interface HeaderProps {
  user: any;
}

export default function AdminHeader({ user }: HeaderProps) {
  return (
    <header className="fixed top-0 left-64 right-0 h-16 bg-white/80 backdrop-blur-md border-b border-slate-100 z-30 px-8 flex items-center justify-between">
      <div>
        <h1 className="text-xl font-serif font-semibold text-slate-900">Admin Paneli</h1>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#D4AF37]/10 rounded-full flex items-center justify-center">
            <span className="text-sm font-semibold text-[#D4AF37]">A</span>
          </div>
          <span className="text-sm text-slate-600">Admin</span>
        </div>
      </div>
    </header>
  );
}
