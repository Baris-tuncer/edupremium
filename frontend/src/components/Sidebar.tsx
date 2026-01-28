'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { 
  Home, BookOpen, Clock, Users, FileText, 
  DollarSign, User, Settings, LogOut 
} from 'lucide-react'

// Tip Güvenliği (TypeScript Interface)
interface TeacherData {
  full_name: string | null
  title: string | null
  avatar_url: string | null
}

export default function Sidebar() {
  const pathname = usePathname()
  const supabase = createClientComponentClient()
  
  // Varsayılan State'ler
  const [loading, setLoading] = useState(true)
  const [teacher, setTeacher] = useState<TeacherData | null>(null)

  useEffect(() => {
    async function fetchSidebarData() {
      try {
        // 1. Kullanıcıyı al
        const { data: { user } } = await supabase.auth.getUser()
        
        if (!user) return

        // 2. Profili çek (Sadece gerekli alanlar)
        const { data, error } = await supabase
          .from('teacher_profiles')
          .select('full_name, title, avatar_url')
          .eq('id', user.id)
          .single()

        if (error) {
          console.error('Sidebar veri hatası:', error.message)
          // Hata olsa bile loading'i kapatacağız
        } else {
          setTeacher(data)
        }

      } catch (err) {
        console.error('Beklenmeyen hata:', err)
      } finally {
        // BAŞARILI DA OLSA HATALI DA OLSA YÜKLENİYORU BİTİR
        setLoading(false)
      }
    }

    fetchSidebarData()
  }, [])

  const menuItems = [
    { icon: Home, label: 'Ana Sayfa', href: '/dashboard' },
    { icon: BookOpen, label: 'Derslerim', href: '/teacher/lessons' },
    { icon: Clock, label: 'Müsaitlik', href: '/teacher/availability' },
    { icon: Users, label: 'Öğrencilerim', href: '/teacher/students' },
    { icon: FileText, label: 'Değerlendirmeler', href: '/teacher/reviews' },
    { icon: DollarSign, label: 'Kazançlarım', href: '/teacher/earnings' },
    { icon: User, label: 'Profilim', href: '/teacher/profile' },
    { icon: Settings, label: 'Ayarlar', href: '/teacher/settings' },
  ]

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  return (
    <aside className="w-64 bg-[#1a237e] text-white h-screen fixed left-0 top-0 flex flex-col z-50">
      {/* LOGO ALANI */}
      <div className="p-6 border-b border-blue-900 flex items-center gap-3">
        <BookOpen className="w-8 h-8 text-blue-300" />
        <div>
          <h1 className="font-bold text-xl tracking-tight">EduPremium</h1>
          <p className="text-[10px] text-blue-300 uppercase tracking-widest">Öğretmen Paneli</p>
        </div>
      </div>

      {/* KULLANICI KARTI (SOL ALTTAKİ SORUNLU YER) */}
      <div className="p-6 border-b border-blue-900 flex items-center gap-3 bg-blue-900/20">
        {loading ? (
          // Yükleniyor iskeleti (Skeleton)
          <div className="flex gap-3 animate-pulse w-full">
            <div className="w-10 h-10 rounded-full bg-blue-800"></div>
            <div className="flex-1 space-y-2 py-1">
              <div className="h-2 bg-blue-800 rounded w-3/4"></div>
              <div className="h-2 bg-blue-800 rounded w-1/2"></div>
            </div>
          </div>
        ) : (
          // Gerçek Veri
          <>
            <div className="relative">
              {teacher?.avatar_url ? (
                <img 
                  src={teacher.avatar_url} 
                  alt="Avatar" 
                  className="w-12 h-12 rounded-full object-cover border-2 border-blue-300 shadow-md"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-blue-800 flex items-center justify-center border-2 border-blue-700">
                  <User className="w-6 h-6 text-blue-300" />
                </div>
              )}
              {/* Online Noktası */}
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-[#1a237e] rounded-full"></div>
            </div>
            
            <div className="overflow-hidden">
              <p className="font-bold text-sm truncate text-white">
                {teacher?.full_name || 'İsimsiz Öğretmen'}
              </p>
              <p className="text-xs text-blue-300 truncate font-medium">
                {teacher?.title || 'Branş Girilmedi'}
              </p>
            </div>
          </>
        )}
      </div>

      {/* MENÜLER */}
      <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
        {menuItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link 
              key={item.href} 
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
                isActive 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50 translate-x-1' 
                  : 'text-blue-100 hover:bg-blue-800 hover:text-white'
              }`}
            >
              <item.icon className={`w-5 h-5 transition-transform group-hover:scale-110 ${isActive ? 'text-white' : 'text-blue-300'}`} />
              <span className="font-medium text-sm">{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* ÇIKIŞ BUTONU */}
      <div className="p-4 border-t border-blue-900">
        <button 
          onClick={handleSignOut}
          className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-red-300 hover:bg-red-900/20 hover:text-red-200 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium text-sm">Çıkış Yap</span>
        </button>
      </div>
    </aside>
  )
}
