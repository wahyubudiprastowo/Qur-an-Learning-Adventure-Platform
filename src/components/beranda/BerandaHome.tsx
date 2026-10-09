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
  Trophy,
} from 'lucide-react';
import { ChildProfile, ChildBlockProgress, ChildAyahProgress, UserAccount } from '../../types';
import { CompanionData } from '../../types/companion';
import { SURAHS_METADATA } from '../../data/surahsMetadata';
import { LivingCompanionCard } from '../companion/LivingCompanionCard';
import { DailyQuestsCard } from '../companion/DailyQuestsCard';
import { WeeklyProgressModal } from '../progress/WeeklyProgressModal';
import { WeeklyReportService } from '../../services/weeklyReportService';
import { StorageService } from '../../services/storageService';
import { AdabService } from '../../services/adabService';

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
  onOpenIbadahModal?: (tab?: 'jadwal' | 'adab' | 'doa' | 'tasbih' | 'notifikasi') => void;
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
  onOpenIbadahModal,
}) => {
  const [showWeeklyModal, setShowWeeklyModal] = useState<boolean>(false);
  const memorizedBlocksCount = blockProgressList.filter((b) => b.state === 'MEMORIZED').length;
  const learningBlocksCount = blockProgressList.filter((b) => b.state === 'LEARNING').length;
  const memorizedAyahsCount = ayahProgressList.filter((a) => a.memorized).length;
  const weakAyahsCount = ayahProgressList.filter((a) => a.needsReview).length;
  const weeklyReport = WeeklyReportService.getWeeklyReport(child.id, 0);

  const adabTasks = AdabService.getDailyTasks(child.id);
  const completedAdabCount = AdabService.getCompletedCount(adabTasks);

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

          {/* 3. Pusat Ibadah, Adab & Doa Santri (Fitur Utama Baru) */}
          <div className="bg-gradient-to-r from-sky-600 via-cyan-600 to-teal-700 text-white rounded-3xl p-5 shadow-md shadow-cyan-950/20 space-y-3.5 border border-cyan-400/40">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-white/20 text-white flex items-center justify-center text-2xl shadow-inner shrink-0">
                  🕌
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-base font-black font-heading tracking-tight">
                      Pusat Ibadah, Adab & Doa Santri
                    </h4>
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-cyan-300 text-cyan-950 shadow-2xs">
                      FITUR HARIAN
                    </span>
                  </div>
                  <p className="text-xs text-cyan-100 font-medium mt-0.5">
                    Sholat tepat waktu, waktu emas tahfiz, amalan adab, doa & notifikasi murojaah
                  </p>
                </div>
              </div>

              {onOpenIbadahModal && (
                <button
                  onClick={() => onOpenIbadahModal('jadwal')}
                  className="hidden sm:flex items-center gap-1 py-1.5 px-3 rounded-xl bg-white text-[#164C68] hover:bg-cyan-50 font-bold text-xs shadow-xs cursor-pointer transition-all active:scale-95 shrink-0"
                >
                  <span>Buka Semua</span>
                  <ChevronRight size={14} />
                </button>
              )}
            </div>

            {/* Quick status bar: Adab progress & Prayer Time */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              {/* Daily Task Adab Preview */}
              <div
                onClick={() => onOpenIbadahModal && onOpenIbadahModal('adab')}
                className="bg-black/15 hover:bg-black/25 p-3 rounded-2xl border border-white/20 cursor-pointer transition-all flex items-center justify-between gap-2"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-lg">🌟</span>
                  <div className="min-w-0">
                    <span className="text-xs font-bold block truncate">
                      Daily Task Adab Santri
                    </span>
                    <span className="text-[10px] text-cyan-200">
                      {completedAdabCount}/{adabTasks.length} Misi Selesai Hari Ini
                    </span>
                  </div>
                </div>
                <span className="text-[10px] font-black px-2 py-1 rounded-lg bg-amber-400 text-amber-950 shrink-0 font-mono">
                  +{completedAdabCount * 2} ⭐
                </span>
              </div>

              {/* Murojaah Reminder Quick Setup */}
              <div
                onClick={() => onOpenIbadahModal && onOpenIbadahModal('notifikasi')}
                className="bg-black/15 hover:bg-black/25 p-3 rounded-2xl border border-white/20 cursor-pointer transition-all flex items-center justify-between gap-2"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-lg">🔔</span>
                  <div className="min-w-0">
                    <span className="text-xs font-bold block truncate">
                      Pengingat Murojaah PWA
                    </span>
                    <span className="text-[10px] text-cyan-200">
                      Subuh (05:30) • Maghrib (18:30)
                    </span>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-1 rounded-lg bg-emerald-400 text-slate-950 shrink-0 font-mono">
                  Atur Jam →
                </span>
              </div>
            </div>

            {/* Quick Jump Pills */}
            <div className="flex items-center gap-2 pt-1 border-t border-white/10 overflow-x-auto">
              <button
                onClick={() => onOpenIbadahModal && onOpenIbadahModal('jadwal')}
                className="py-1 px-2.5 rounded-lg bg-white/15 hover:bg-white/25 text-white text-[11px] font-bold whitespace-nowrap cursor-pointer transition-all"
              >
                🕌 Jadwal Sholat 5 Waktu
              </button>
              <button
                onClick={() => onOpenIbadahModal && onOpenIbadahModal('adab')}
                className="py-1 px-2.5 rounded-lg bg-white/15 hover:bg-white/25 text-white text-[11px] font-bold whitespace-nowrap cursor-pointer transition-all"
              >
                🌟 Misi Adab Santri
              </button>
              <button
                onClick={() => onOpenIbadahModal && onOpenIbadahModal('doa')}
                className="py-1 px-2.5 rounded-lg bg-white/15 hover:bg-white/25 text-white text-[11px] font-bold whitespace-nowrap cursor-pointer transition-all"
              >
                📖 Doa Harian
              </button>
              <button
                onClick={() => onOpenIbadahModal && onOpenIbadahModal('tasbih')}
                className="py-1 px-2.5 rounded-lg bg-white/15 hover:bg-white/25 text-white text-[11px] font-bold whitespace-nowrap cursor-pointer transition-all"
              >
                📿 Tasbih Digital
              </button>
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

          {/* Live Recent User Activities & Leaderboard Preview Card */}
          <div className="bg-white border-2 border-[#C9E1ED] rounded-3xl p-4 sm:p-5 shadow-xs space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xl">🏆</span>
                <div>
                  <h4 className="text-sm font-black text-[#164C68] font-heading">
                    Aktivitas Santri & Papan Peringkat
                  </h4>
                  <p className="text-[11px] text-[#8C9BA7]">
                    Motivasi belajar & hafalan Qur'an nusantara
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                ● Live Feed
              </span>
            </div>

            {/* Top 3 Live Activity Ticker */}
            <div className="space-y-2">
              {StorageService.getRecentActivities().slice(0, 3).map((act) => (
                <div
                  key={act.id}
                  className="flex items-center justify-between p-2 rounded-2xl bg-slate-50/80 hover:bg-slate-100/80 transition-colors text-xs"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-lg shrink-0">{act.userAvatar}</span>
                    <div className="min-w-0">
                      <span className="font-extrabold text-[#164C68] truncate block">
                        {act.userName}
                      </span>
                      <span className="text-[10px] text-slate-500 truncate block">
                        {act.actionText}
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-[#08B9EF] shrink-0 font-mono bg-cyan-50 px-2 py-0.5 rounded-md border border-cyan-100">
                    {act.timeAgoText}
                  </span>
                </div>
              ))}
            </div>

            <button
              onClick={() => onNavigateToModule('leaderboard')}
              className="w-full py-2.5 px-4 rounded-2xl bg-[#164C68] hover:bg-[#08B9EF] text-white text-xs font-black flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            >
              <Trophy size={14} />
              <span>Buka Papan Peringkat Lengkap & Live Feed</span>
              <ChevronRight size={14} />
            </button>
          </div>

          {/* Akses Cepat Tahfiz (3-Langkah) */}
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
