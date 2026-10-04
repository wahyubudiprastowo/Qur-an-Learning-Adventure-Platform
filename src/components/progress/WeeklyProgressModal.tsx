import React, { useState } from 'react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Star,
  Award,
  Sparkles,
  Share2,
  CheckCircle2,
  Clock,
  BookOpen,
  Heart,
  TrendingUp,
  Download,
  Copy,
  Check,
} from 'lucide-react';
import { ChildProfile } from '../../types';
import { WeeklyReportService } from '../../services/weeklyReportService';
import { WeeklyProgressCharts } from './WeeklyProgressCharts';
import { Button } from '../common/Button';

interface WeeklyProgressModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeChild: ChildProfile;
}

export const WeeklyProgressModal: React.FC<WeeklyProgressModalProps> = ({
  isOpen,
  onClose,
  activeChild,
}) => {
  const [weekOffset, setWeekOffset] = useState<number>(0); // 0 = current week, -1 = last week
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  const report = WeeklyReportService.getWeeklyReport(activeChild.id, weekOffset);

  const handleShare = () => {
    const text = WeeklyReportService.generateShareableSummary(report);
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white border-2 border-[#C9E1ED] rounded-3xl p-4 sm:p-6 max-w-xl w-full shadow-2xl relative my-6 max-h-[92vh] flex flex-col animate-in zoom-in-95 duration-200">
        {/* Header Bar */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-11 h-11 rounded-2xl bg-cyan-50 border border-cyan-200 flex items-center justify-center text-2xl shadow-xs">
              {activeChild.avatar}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black text-[#164C68] font-heading">
                  Rapor Progres Mingguan
                </h2>
                <span className="text-[10px] font-bold text-cyan-800 bg-cyan-100 px-2 py-0.5 rounded-full">
                  {report.childName}
                </span>
              </div>
              <p className="text-[11px] text-[#8C9BA7] font-semibold">
                Grafik visual pencapaian hafalan Al-Qur'an anak
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-[#EEF8FF] text-[#164C68] flex items-center justify-center hover:bg-slate-200 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="overflow-y-auto py-3 space-y-4 pr-1">
          {/* Week Selector Bar */}
          <div className="flex items-center justify-between bg-[#EEF8FF] p-2 rounded-2xl border border-[#C9E1ED]">
            <button
              onClick={() => setWeekOffset((prev) => prev - 1)}
              disabled={weekOffset <= -2}
              className={`p-1.5 rounded-xl border transition-all flex items-center gap-1 text-xs font-bold cursor-pointer ${
                weekOffset <= -2
                  ? 'text-slate-300 border-transparent cursor-not-allowed'
                  : 'bg-white text-[#164C68] border-[#C9E1ED] hover:bg-slate-50'
              }`}
            >
              <ChevronLeft size={16} />
              <span className="hidden sm:inline">Pekan Lalu</span>
            </button>

            <div className="text-center px-2">
              <span className="text-xs font-black text-[#164C68] block">
                {report.weekLabel}
              </span>
              <span className="text-[10px] text-[#8C9BA7] font-medium">
                {weekOffset === 0 ? 'Pekan Sedang Berjalan' : 'Arsip Pekan Lalu'}
              </span>
            </div>

            <button
              onClick={() => setWeekOffset((prev) => prev + 1)}
              disabled={weekOffset >= 0}
              className={`p-1.5 rounded-xl border transition-all flex items-center gap-1 text-xs font-bold cursor-pointer ${
                weekOffset >= 0
                  ? 'text-slate-300 border-transparent cursor-not-allowed'
                  : 'bg-white text-[#164C68] border-[#C9E1ED] hover:bg-slate-50'
              }`}
            >
              <span className="hidden sm:inline">Pekan Ini</span>
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Honor & Recognition Banner */}
          <div className="p-4 bg-gradient-to-r from-amber-500 via-orange-400 to-amber-600 rounded-3xl text-white shadow-md shadow-amber-500/20 space-y-1.5 relative overflow-hidden">
            <div className="absolute right-2 -bottom-2 text-6xl opacity-15 select-none pointer-events-none">
              {report.badgeIcon}
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider bg-white/20 px-2.5 py-0.5 rounded-full inline-block backdrop-blur-xs">
                Apresiasi Pekan Ini
              </span>
              <span className="text-xs font-bold bg-white text-amber-800 px-2 py-0.5 rounded-full">
                ⭐ {report.totalBintangMingguan} Bintang
              </span>
            </div>

            <h3 className="text-lg font-black font-heading flex items-center gap-2">
              <span>{report.badgeIcon}</span>
              <span>{report.titleBadge}</span>
            </h3>

            <p className="text-xs text-amber-50 leading-relaxed font-medium">
              "{report.encouragementMessage}"
            </p>
          </div>

          {/* 4 Essential KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="bg-[#EEF8FF]/70 border border-[#C9E1ED] rounded-2xl p-3 text-center">
              <span className="text-[10px] font-bold text-[#8C9BA7] uppercase block">Ayat Ziadah</span>
              <span className="text-xl font-black text-emerald-600 font-heading mt-0.5 block">
                +{report.totalAyatHafalBaru}
              </span>
              <span className="text-[10px] text-emerald-700 font-medium">Ayat baru</span>
            </div>

            <div className="bg-[#EEF8FF]/70 border border-[#C9E1ED] rounded-2xl p-3 text-center">
              <span className="text-[10px] font-bold text-[#8C9BA7] uppercase block">Murojaah</span>
              <span className="text-xl font-black text-[#08B9EF] font-heading mt-0.5 block">
                {report.totalAyatMurojaah}
              </span>
              <span className="text-[10px] text-sky-700 font-medium">Ayat diulang</span>
            </div>

            <div className="bg-[#EEF8FF]/70 border border-[#C9E1ED] rounded-2xl p-3 text-center">
              <span className="text-[10px] font-bold text-[#8C9BA7] uppercase block">Skor Mutqin</span>
              <span className="text-xl font-black text-purple-600 font-heading mt-0.5 block">
                {report.rataRataSkor}%
              </span>
              <span className="text-[10px] text-purple-700 font-medium">Mumtaz</span>
            </div>

            <div className="bg-[#EEF8FF]/70 border border-[#C9E1ED] rounded-2xl p-3 text-center">
              <span className="text-[10px] font-bold text-[#8C9BA7] uppercase block">Durasi</span>
              <span className="text-xl font-black text-amber-600 font-heading mt-0.5 block">
                {report.totalMenitBelajar}m
              </span>
              <span className="text-[10px] text-amber-700 font-medium">
                {report.hariAktif}/7 hari aktif
              </span>
            </div>
          </div>

          {/* VISUAL CHARTS (RECHARTS) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-black text-[#8C9BA7] uppercase tracking-wider">
                GRAFIK PENCAPAIAN VISUAL (RECHARTS)
              </span>
              <span className="text-[11px] font-bold text-[#08B9EF]">
                Interaktif & Terinci
              </span>
            </div>

            <WeeklyProgressCharts report={report} />
          </div>

          {/* Surah Breakdown Progress */}
          <div className="bg-white border border-[#C9E1ED] rounded-3xl p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black text-[#164C68] uppercase tracking-wider">
                Progres Surah yang Sedang Dipelajari
              </h4>
              <span className="text-[10px] text-[#8C9BA7] font-semibold">
                Juz 1 & Juz 30
              </span>
            </div>

            <div className="space-y-2.5">
              {report.surahBreakdown.map((s) => (
                <div key={s.surahNumber} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-[#164C68]">
                        Surah {s.surahName}
                      </span>
                      <span className="font-quran text-slate-500 text-sm">
                        {s.nameArabic}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-[#8C9BA7]">
                        {s.ayatDihafal} / {s.totalAyat} Ayat
                      </span>
                      <span
                        className={`text-[10px] font-black px-2 py-0.2 rounded-full ${
                          s.persentase === 100
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-cyan-100 text-cyan-800'
                        }`}
                      >
                        {s.persentase}%
                      </span>
                    </div>
                  </div>

                  <div className="w-full bg-[#EEF8FF] rounded-full h-2 overflow-hidden border border-[#C9E1ED]/40">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        s.persentase === 100 ? 'bg-emerald-500' : 'bg-[#08B9EF]'
                      }`}
                      style={{ width: `${s.persentase}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Strengths & Guidance for Parents */}
          <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-3xl space-y-2 text-xs">
            <h4 className="font-black text-emerald-900 flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
              <CheckCircle2 size={15} className="text-emerald-600" />
              Poin Kemajuan & Rekomendasi Pekan Depan
            </h4>

            <ul className="space-y-1.5 text-emerald-800 text-[11px] leading-relaxed">
              {report.strengths.slice(0, 2).map((str, idx) => (
                <li key={idx} className="flex items-start gap-1.5">
                  <span className="text-emerald-500 font-bold shrink-0">✓</span>
                  <span>{str}</span>
                </li>
              ))}
              {report.recommendations.slice(0, 2).map((rec, idx) => (
                <li key={idx} className="flex items-start gap-1.5">
                  <span className="text-emerald-500 font-bold shrink-0">💡</span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-3 border-t border-slate-100 flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="md"
            className="flex-1"
            onClick={handleShare}
            icon={copied ? <Check size={16} className="text-emerald-600" /> : <Share2 size={16} />}
          >
            {copied ? 'Tersalin ke Clipboard!' : 'Bagikan Ringkasan Rapor'}
          </Button>

          <Button
            variant="primary"
            size="md"
            onClick={onClose}
          >
            Tutup
          </Button>
        </div>
      </div>
    </div>
  );
};
