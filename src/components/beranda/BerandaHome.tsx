import React, { useState } from 'react';
import {
  Sparkles,
  Flame,
  Star,
  Play,
  CheckCircle2,
  Clock,
  RotateCcw,
  BookOpen,
  Headphones,
  Award,
  ChevronRight,
  TrendingUp,
  BarChart3,
} from 'lucide-react';
import { ChildProfile, ChildBlockProgress, ChildAyahProgress, UserAccount } from '../../types';
import { CompanionData } from '../../types/companion';
import { SURAHS_METADATA } from '../../data/surahsMetadata';
import { LivingCompanionCard } from '../companion/LivingCompanionCard';
import { DailyQuestsCard } from '../companion/DailyQuestsCard';
import { WeeklyProgressModal } from '../progress/WeeklyProgressModal';
import { WeeklyReportService } from '../../services/weeklyReportService';

interface BerandaHomeProps {
  child: ChildProfile;
  companion: CompanionData;
  lastSession: {
    surahNumber: number;
    surahName: string;
    blockNumber: number;
    startAyah: number;
    endAyah: number;
    mode: string;
  };
  blockProgressList: ChildBlockProgress[];
  ayahProgressList: ChildAyahProgress[];
  onNavigateToTahfizStep: (step: 'dengar' | 'latihan' | 'hafalan') => void;
  onResumeLastSession: () => void;
  onOpenMurojaahDue: () => void;
  onOpenRoom: () => void;
  onOpenWorldMap: () => void;
  onRefreshCompanion: () => void;
  onNavigateToModule: (actionType: string) => void;
  userAccount?: UserAccount;
  onOpenAuth?: (mode: 'login' | 'register') => void;
  onOpenPlanModal?: () => void;
}

export const BerandaHome: React.FC<BerandaHomeProps> = ({
  child,
  companion,
  lastSession,
  blockProgressList,
  ayahProgressList,
  onNavigateToTahfizStep,
  onResumeLastSession,
  onOpenMurojaahDue,
  onOpenRoom,
  onOpenWorldMap,
  onRefreshCompanion,
  onNavigateToModule,
  userAccount,
  onOpenAuth,
  onOpenPlanModal,
}) => {
  const [showWeeklyModal, setShowWeeklyModal] = useState<boolean>(false);
  const memorizedBlocksCount = blockProgressList.filter((b) => b.state === 'MEMORIZED').length;
  const learningBlocksCount = blockProgressList.filter((b) => b.state === 'LEARNING').length;
  const memorizedAyahsCount = ayahProgressList.filter((a) => a.memorized).length;
  const weakAyahsCount = ayahProgressList.filter((a) => a.needsReview).length;
  const weeklyReport = WeeklyReportService.getWeeklyReport(child.id, 0);

  return (
    <div className="pb-24 animate-in fade-in duration-200">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4.5 items-start">
        {/* === COLUMN 1 (LEFT / MAIN STAGE: Living Tamagotchi Companion & Learning Report) === */}
        <div className="lg:col-span-7 space-y-4">
          {/* 1. Living Companion Card (Hero with Tamagotchi, Care Actions & Interactive Weekly Garden) */}
          <LivingCompanionCard
            child={child}
            companion={companion}
            ayahProgressList={ayahProgressList}
            blockProgressList={blockProgressList}
            onOpenRoom={onOpenRoom}
            onOpenWorldMap={onOpenWorldMap}
            onRefreshCompanion={onRefreshCompanion}
          />

          {/* 2. Current Memorization Multi-Metric Grid & Weekly Report Preview */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-black text-[#8C9BA7] uppercase tracking-wider block">
                PERKEMBANGAN HAFALAN ANAK
              </span>
              <button
                onClick={() => setShowWeeklyModal(true)}
                className="text-xs font-bold text-[#08B9EF] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <BarChart3 size={13} />
                <span>Rapor Mingguan</span>
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => onNavigateToModule('murojaah')}
                className="bg-white border border-[#C9E1ED] hover:border-emerald-300 rounded-3xl p-3.5 text-center shadow-xs cursor-pointer transition-all hover:shadow-md active:scale-95"
                title="Buka Murojaah Blok Hafal"
              >
                <span className="text-2xl font-black text-[#81E850] font-heading block">
                  {memorizedBlocksCount}
                </span>
                <span className="text-[11px] font-bold text-[#164C68] block mt-0.5">
                  Blok Hafal
                </span>
              </button>

              <button
                onClick={() => onNavigateToModule('ziadah')}
                className="bg-white border border-[#C9E1ED] hover:border-sky-300 rounded-3xl p-3.5 text-center shadow-xs cursor-pointer transition-all hover:shadow-md active:scale-95"
                title="Lanjut Latih Ziadah (Hafalan Baru)"
              >
                <span className="text-2xl font-black text-[#08B9EF] font-heading block">
                  {learningBlocksCount}
                </span>
                <span className="text-[11px] font-bold text-[#164C68] block mt-0.5">
                  Sedang Dilatih
                </span>
              </button>

              <button
                onClick={() => setShowWeeklyModal(true)}
                className="bg-white border border-[#C9E1ED] hover:border-purple-300 rounded-3xl p-3.5 text-center shadow-xs cursor-pointer transition-all hover:shadow-md active:scale-95"
                title="Lihat Rapor Ayat Tuntas"
              >
                <span className="text-2xl font-black text-purple-600 font-heading block">
                  {memorizedAyahsCount}
                </span>
                <span className="text-[11px] font-bold text-[#164C68] block mt-0.5">
                  Ayat Tuntas
                </span>
              </button>
            </div>

            {/* Weekly Report Interactive Teaser Card */}
            <div
              onClick={() => setShowWeeklyModal(true)}
              className="p-3.5 bg-gradient-to-r from-emerald-50 via-teal-50 to-cyan-50 border border-emerald-200/90 rounded-2xl flex items-center justify-between cursor-pointer hover:border-emerald-300 transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white text-emerald-600 border border-emerald-200 flex items-center justify-center text-lg shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                  📊
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h5 className="text-xs font-black text-[#164C68]">
                      Grafik Sepekan: +{weeklyReport.totalAyatDisentuh} Ayat ({weeklyReport.hariAktif}/7 Hari Aktif)
                    </h5>
                    <span className="text-[9px] font-black text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded-full">
                      Mutqin {weeklyReport.rataRataSkor}%
                    </span>
                  </div>
                  <p className="text-[10px] text-[#8C9BA7] font-semibold mt-0.5">
                    Buka grafik visual Recharts Ziadah, Murojaah, dan waktu belajar
                  </p>
                </div>
              </div>

              <ChevronRight size={18} className="text-emerald-700 group-hover:translate-x-1 transition-transform shrink-0" />
            </div>
          </div>
        </div>

        {/* === COLUMN 2 (RIGHT / ACTIONS & CURRICULUM SHORTCUTS) === */}
        <div className="lg:col-span-5 space-y-4">
          {/* 3. Continue Learning Last Session Card */}
          <div
            onClick={onResumeLastSession}
            className="bg-gradient-to-r from-[#FF7A50] to-[#FF946F] text-white rounded-3xl p-5 shadow-md shadow-orange-500/25 flex items-center justify-between cursor-pointer active:scale-[0.99] transition-transform hover:shadow-lg group"
          >
            <div className="space-y-1">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/25 text-[11px] font-bold">
                ↻ Lanjutkan Belajar
              </span>
              <div className="flex items-baseline gap-2">
                <h3 className="text-2xl font-black font-heading tracking-tight">
                  {lastSession.surahName}
                </h3>
                <span className="font-quran text-xl text-white/95">
                  {SURAHS_METADATA.find((s) => s.number === lastSession.surahNumber)?.nameArabic || 'الكهف'}
                </span>
              </div>
              <p className="text-xs text-orange-100 font-semibold">
                Blok {lastSession.blockNumber} (Ayat {lastSession.startAyah}–{lastSession.endAyah}) • Hari ini
              </p>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onResumeLastSession();
              }}
              className="w-14 h-14 rounded-full bg-white text-[#FF7A50] flex items-center justify-center shadow-lg active:scale-95 transition-transform hover:bg-orange-50 cursor-pointer shrink-0 group-hover:scale-105"
              title="Lanjutkan Sesi Belajar"
            >
              <Play size={26} className="fill-[#FF7A50] ml-1" />
            </button>
          </div>

          {/* 4. Murojaah Due Alert (if any weak ayahs exist) */}
          {weakAyahsCount > 0 && (
            <div
              onClick={onOpenMurojaahDue}
              className="bg-amber-50 border-2 border-amber-200 rounded-3xl p-4 shadow-xs flex items-center justify-between cursor-pointer hover:bg-amber-100/50 transition-all select-none"
            >
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center text-xl shrink-0">
                  ⏱️
                </div>
                <div>
                  <h4 className="text-sm font-black text-[#164C68] font-heading">
                    Murojaah Diperlukan
                  </h4>
                  <p className="text-xs text-[#8C9BA7] font-semibold mt-0.5">
                    Ada {weakAyahsCount} ayat yang perlu disegarkan hafalannya
                  </p>
                </div>
              </div>
              <ChevronRight size={20} className="text-amber-700" />
            </div>
          )}

          {/* 5. Daily Quests Adventure Card (Petualangan Hari Ini) */}
          <DailyQuestsCard
            childId={child.id}
            onNavigateToModule={onNavigateToModule as any}
            onQuestsUpdated={onRefreshCompanion}
          />

          {/* Banner 1: Klasifikasi Fitur PRO vs FREE */}
          {onOpenPlanModal && (
            <div
              onClick={onOpenPlanModal}
              className="bg-gradient-to-r from-[#0F172A] via-[#1E293B] to-[#0F172A] text-white rounded-3xl p-4 sm:p-5 shadow-lg shadow-slate-950/20 border border-slate-700/80 flex items-center justify-between cursor-pointer active:scale-[0.99] transition-all hover:border-amber-400/60 group select-none"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-amber-400/20 border border-amber-400/30 flex items-center justify-center text-amber-400 text-2xl shrink-0 group-hover:scale-105 transition-transform">
                  👑
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-black font-heading text-white">
                      Klasifikasi Fitur PRO & FREE
                    </h4>
                    <span
                      className={`text-[9px] font-black px-2 py-0.2 rounded-full border ${
                        userAccount?.planTier === 'pro'
                          ? 'bg-amber-400 text-amber-950 border-amber-300'
                          : 'bg-[#22C55E]/20 text-[#22C55E] border-[#22C55E]/40'
                      }`}
                    >
                      {userAccount?.planTier === 'pro' ? 'PRO AKTIF' : 'CEK PERBANDINGAN'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 font-medium mt-0.5">
                    Bandingkan hak akses Juz 30 vs 30 Juz, AI Tartil & 5 Karakter
                  </p>
                </div>
              </div>

              <span className="text-xs font-black text-amber-400 bg-amber-400/10 border border-amber-400/20 px-3 py-1.5 rounded-xl group-hover:bg-amber-400 group-hover:text-amber-950 transition-all shrink-0">
                Detail →
              </span>
            </div>
          )}

          {/* Banner 2: Hijalearn-style Family Register Banner (if not registered) */}
          {!userAccount?.isRegistered && onOpenAuth && (
            <div
              onClick={() => onOpenAuth('register')}
              className="bg-gradient-to-r from-emerald-950 via-teal-950 to-[#0F172A] border border-emerald-500/40 text-white rounded-3xl p-4 sm:p-5 shadow-lg flex items-center justify-between cursor-pointer active:scale-[0.99] transition-all hover:border-emerald-400 group select-none"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-[#22C55E]/20 border border-[#22C55E]/40 flex items-center justify-center text-emerald-400 text-2xl shrink-0 group-hover:scale-105 transition-transform">
                  ✨
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-black font-heading text-white">
                      Daftar Akun Keluarga
                    </h4>
                    <span className="text-[9px] font-black bg-[#22C55E] text-slate-950 px-2 py-0.2 rounded-full">
                      GRATIS
                    </span>
                  </div>
                  <p className="text-[11px] text-emerald-200/80 font-medium mt-0.5">
                    Simpan progres hafalan & rapor mutqin anak di cloud keluarga
                  </p>
                </div>
              </div>

              <span className="text-xs font-black text-slate-950 bg-[#22C55E] hover:bg-[#16A34A] px-3.5 py-1.5 rounded-xl shadow-xs group-hover:scale-105 transition-all shrink-0">
                Daftar →
              </span>
            </div>
          )}

          {/* 6. Quick Launch Cards to 3 Steps */}
          <div className="space-y-2 pt-1">
            <span className="text-xs font-black text-[#8C9BA7] uppercase tracking-wider block px-1">
              AKSES CEPAT TAHFIZ (3-LANGKAH)
            </span>

            <div className="grid grid-cols-3 gap-2.5">
              <button
                onClick={() => onNavigateToTahfizStep('dengar')}
                className="bg-white border border-[#C9E1ED] hover:border-amber-300 rounded-3xl p-3.5 text-center flex flex-col items-center justify-center gap-1.5 shadow-xs hover:shadow-md transition-all cursor-pointer group"
              >
                <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Headphones size={20} />
                </div>
                <span className="text-xs font-bold text-[#164C68]">Dengar</span>
              </button>

              <button
                onClick={() => onNavigateToTahfizStep('latihan')}
                className="bg-white border border-[#C9E1ED] hover:border-purple-300 rounded-3xl p-3.5 text-center flex flex-col items-center justify-center gap-1.5 shadow-xs hover:shadow-md transition-all cursor-pointer group"
              >
                <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <RotateCcw size={20} />
                </div>
                <span className="text-xs font-bold text-[#164C68]">Latihan</span>
              </button>

              <button
                onClick={() => onNavigateToTahfizStep('hafalan')}
                className="bg-white border border-[#C9E1ED] hover:border-cyan-300 rounded-3xl p-3.5 text-center flex flex-col items-center justify-center gap-1.5 shadow-xs hover:shadow-md transition-all cursor-pointer group"
              >
                <div className="w-10 h-10 rounded-2xl bg-cyan-50 text-[#08B9EF] flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Award size={20} />
                </div>
                <span className="text-xs font-bold text-[#164C68]">Setoran</span>
              </button>
            </div>
          </div>

          {/* 7. Al-Quran Learning Curriculum Modules */}
          <div className="space-y-2 pt-1">
            <span className="text-xs font-black text-[#8C9BA7] uppercase tracking-wider block px-1">
              MODUL BELAJAR AL-QUR'AN & DUNIA
            </span>

            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={() => onNavigateToModule('tilawah')}
                className="p-3 bg-white border border-[#C9E1ED] hover:border-[#08B9EF] rounded-2xl flex items-center gap-3 text-left transition-all cursor-pointer shadow-2xs hover:shadow-sm active:scale-98 group"
              >
                <div className="w-10 h-10 rounded-xl bg-cyan-50 text-[#08B9EF] flex items-center justify-center text-lg shrink-0 group-hover:scale-105 transition-transform">
                  📖
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-black text-[#164C68] block font-heading truncate">
                    Tilawah Mushaf
                  </span>
                  <span className="text-[10px] text-[#8C9BA7] block truncate">
                    114 Surah 30 Juz
                  </span>
                </div>
              </button>

              <button
                onClick={() => onNavigateToModule('iqra')}
                className="p-3 bg-white border border-[#C9E1ED] hover:border-emerald-300 rounded-2xl flex items-center gap-3 text-left transition-all cursor-pointer shadow-2xs hover:shadow-sm active:scale-98 group"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-lg shrink-0 group-hover:scale-105 transition-transform">
                  🔤
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-black text-[#164C68] block font-heading truncate">
                    Iqra' Anak
                  </span>
                  <span className="text-[10px] text-[#8C9BA7] block truncate">
                    Huruf Hijaiyah
                  </span>
                </div>
              </button>

              <button
                onClick={() => onNavigateToModule('tajwid')}
                className="p-3 bg-white border border-[#C9E1ED] hover:border-purple-300 rounded-2xl flex items-center gap-3 text-left transition-all cursor-pointer shadow-2xs hover:shadow-sm active:scale-98 group"
              >
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center text-lg shrink-0 group-hover:scale-105 transition-transform">
                  🎨
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-black text-[#164C68] block font-heading truncate">
                    Belajar Tajwid
                  </span>
                  <span className="text-[10px] text-[#8C9BA7] block truncate">
                    Hukum Bacaan Tartil
                  </span>
                </div>
              </button>

              <button
                onClick={onOpenWorldMap}
                className="p-3 bg-white border border-[#C9E1ED] hover:border-indigo-300 rounded-2xl flex items-center gap-3 text-left transition-all cursor-pointer shadow-2xs hover:shadow-sm active:scale-98 group"
              >
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-lg shrink-0 group-hover:scale-105 transition-transform">
                  🗺️
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-black text-[#164C68] block font-heading truncate">
                    Peta Petualangan
                  </span>
                  <span className="text-[10px] text-[#8C9BA7] block truncate">
                    10 Wilayah & Game
                  </span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Weekly Progress Report Modal (Visual Charts with Recharts) */}
      <WeeklyProgressModal
        isOpen={showWeeklyModal}
        onClose={() => setShowWeeklyModal(false)}
        activeChild={child}
      />
    </div>
  );
};
