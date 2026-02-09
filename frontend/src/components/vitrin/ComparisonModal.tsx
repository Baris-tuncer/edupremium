'use client';

import { useComparison, VitrinTeacher } from '@/contexts/ComparisonContext';
import { X, Star, Clock, GraduationCap, BookOpen, MessageSquare, Banknote } from 'lucide-react';
import Link from 'next/link';

interface ComparisonModalProps {
  onClose: () => void;
}

// Fiyat hesaplama
function calculateDisplayPrice(netPrice: number, commissionRate: number): number {
  if (!netPrice || netPrice <= 0) return 0;
  const stopaj = netPrice * 0.20;
  const komisyon = netPrice * (commissionRate || 0.25);
  const araToplam = netPrice + stopaj + komisyon;
  const kdv = araToplam * 0.20;
  const total = araToplam + kdv;
  return Math.round(total / 50) * 50;
}

export default function ComparisonModal({ onClose }: ComparisonModalProps) {
  const { selectedTeachers, removeTeacher } = useComparison();

  const comparisonRows = [
    {
      label: 'Saatlik Ücret',
      icon: <Banknote className="w-5 h-5" />,
      getValue: (t: VitrinTeacher) => {
        const price = calculateDisplayPrice(t.hourly_rate_net || 0, t.commission_rate || 0.25);
        return price > 0 ? `${price.toLocaleString('tr-TR')} TL` : '-';
      },
    },
    {
      label: 'Deneyim',
      icon: <Clock className="w-5 h-5" />,
      getValue: (t: VitrinTeacher) => t.experience_years ? `${t.experience_years} yıl` : '-',
    },
    {
      label: 'Puan',
      icon: <Star className="w-5 h-5" />,
      getValue: (t: VitrinTeacher) => t.rating ? `${t.rating.toFixed(1)} / 5` : '-',
    },
    {
      label: 'Üniversite',
      icon: <GraduationCap className="w-5 h-5" />,
      getValue: (t: VitrinTeacher) => t.university || '-',
    },
    {
      label: 'Dersler',
      icon: <BookOpen className="w-5 h-5" />,
      getValue: (t: VitrinTeacher) => {
        const subjects = (t.subjects || []).slice(0, 3).map(s => {
          const parts = s.split(':');
          return parts.length > 1 ? parts[1] : s;
        });
        return subjects.length > 0 ? subjects.join(', ') : '-';
      },
    },
    {
      label: 'Öne Çıkan Mesaj',
      icon: <MessageSquare className="w-5 h-5" />,
      getValue: (t: VitrinTeacher) => t.featured_headline || '-',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-[#0F172A]/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#0F172A] to-[#1e293b] text-white px-8 py-6 flex items-center justify-between flex-shrink-0">
          <div>
            <h2 className="text-2xl font-bold">Öğretmen Karşılaştırma</h2>
            <p className="text-white/60 text-sm">{selectedTeachers.length} öğretmen seçildi</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8">
          {/* Öğretmen başlıkları */}
          <div
            className="grid gap-4 mb-8"
            style={{ gridTemplateColumns: `180px repeat(${selectedTeachers.length}, 1fr)` }}
          >
            {/* Boş hücre */}
            <div />

            {/* Öğretmen profil kartları */}
            {selectedTeachers.map(teacher => (
              <div key={teacher.id} className="text-center">
                <div className="relative inline-block mb-3">
                  {teacher.avatar_url ? (
                    <img
                      src={teacher.avatar_url}
                      alt={teacher.full_name}
                      className="w-20 h-20 rounded-full object-cover border-4 border-[#D4AF37]/30 mx-auto"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#0F172A] to-[#1E293B] flex items-center justify-center text-white font-bold text-2xl mx-auto">
                      {teacher.full_name?.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </div>
                  )}
                  <button
                    onClick={() => removeTeacher(teacher.id)}
                    className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
                <h3 className="font-bold text-[#0F172A] mb-1">{teacher.full_name}</h3>
                <Link
                  href={`/teachers/${teacher.id}`}
                  className="text-[#D4AF37] text-sm hover:underline"
                >
                  Profili Gör
                </Link>
              </div>
            ))}
          </div>

          {/* Karşılaştırma satırları */}
          <div className="space-y-1">
            {comparisonRows.map((row, idx) => (
              <div
                key={row.label}
                className={`grid gap-4 py-4 px-4 rounded-xl ${idx % 2 === 0 ? 'bg-slate-50' : ''}`}
                style={{ gridTemplateColumns: `180px repeat(${selectedTeachers.length}, 1fr)` }}
              >
                {/* Satır etiketi */}
                <div className="flex items-center gap-3 text-slate-600">
                  <span className="text-[#D4AF37]">{row.icon}</span>
                  <span className="font-medium text-sm">{row.label}</span>
                </div>

                {/* Öğretmen değerleri */}
                {selectedTeachers.map(teacher => (
                  <div key={teacher.id} className="text-center font-semibold text-[#0F172A] text-sm">
                    {row.getValue(teacher)}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 px-8 py-4 bg-slate-50 flex-shrink-0">
          <div
            className="grid gap-4"
            style={{ gridTemplateColumns: `180px repeat(${selectedTeachers.length}, 1fr)` }}
          >
            <div />
            {selectedTeachers.map(teacher => (
              <Link
                key={teacher.id}
                href={`/teachers/${teacher.id}`}
                className="block py-3 bg-[#0F172A] text-white text-center font-bold rounded-xl hover:bg-[#D4AF37] hover:text-[#0F172A] transition-colors text-sm"
              >
                Profili İncele
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
