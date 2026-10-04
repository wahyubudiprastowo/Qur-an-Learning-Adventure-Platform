import React, { useState } from 'react';
import {
  ShieldCheck,
  Lock,
  Play,
  Pause,
  Trash2,
  Download,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  X,
  CreditCard,
  UserCheck,
  CheckCircle2,
  BarChart3,
  TrendingUp,
  Share2,
  ChevronLeft,
  ChevronRight,
  Check,
  Award,
} from 'lucide-react';
import { ChildProfile, UserAccount, AyahRecording, ChildAyahProgress } from '../../types';
import { StorageService } from '../../services/storageService';
import { CompanionService } from '../../services/companionService';
import { getStageForXp } from '../../data/companionData';
import { getAyahAudioUrl } from '../../data/recitersData';
import { WeeklyReportService } from '../../services/weeklyReportService';
import { WeeklyProgressCharts } from '../progress/WeeklyProgressCharts';
import { Button } from '../common/Button';

interface ParentDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  userAccount: UserAccount;
  activeChild: ChildProfile;
  childrenList: ChildProfile[];
  onSwitchChild: (childId: string) => void;
}

export const ParentDashboardModal: React.FC<ParentDashboardModalProps> = ({
  isOpen,
  onClose,
  userAccount,
  activeChild,
  childrenList,
  onSwitchChild,
}) => {
  // Security Gate State (Parental Lock Challenge)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [parentPinInput, setParentPinInput] = useState<string>('');
  const [pinError, setPinError] = useState<string>('');

  // Active Tab inside Parent Dashboard: 'summary' | 'weekly_report' | 'recordings' | 'weak_ayahs' | 'privacy' | 'subscription'
  const [activeTab, setActiveTab] = useState<'summary' | 'weekly_report' | 'recordings' | 'weak_ayahs' | 'privacy' | 'subscription'>('summary');
  const [reportWeekOffset, setReportWeekOffset] = useState<number>(0);
  const [copiedReport, setCopiedReport] = useState<boolean>(false);

  // Audio Playback in Parent Audit
  const [playingRecId, setPlayingRecId] = useState<string | null>(null);
  const [playingQariAyah, setPlayingQariAyah] = useState<number | null>(null);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);

  const [recordings, setRecordings] = useState<AyahRecording[]>(() =>
    StorageService.getRecordings(activeChild.id)
  );

  const [ayahProgress, setAyahProgress] = useState<ChildAyahProgress[]>(() =>
    StorageService.getAyahProgress(activeChild.id)
  );

  if (!isOpen) return null;

  // Handle Parent PIN Verification
  const handleVerifyPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (parentPinInput === userAccount.pin || parentPinInput === '2026') {
      setIsAuthenticated(true);
      setPinError('');
    } else {
      setPinError('PIN verifikasi salah. (PIN default: 2026)');
    }
  };

  const handlePlayRecording = (rec: AyahRecording) => {
    if (audioRef.current) audioRef.current.pause();

    if (playingRecId === rec.id) {
      setPlayingRecId(null);
      return;
    }

    const audio = new Audio(rec.audioBlobUrl);
    audioRef.current = audio;
    setPlayingRecId(rec.id);
    setPlayingQariAyah(null);

    audio.play().catch(() => {});
    audio.onended = () => setPlayingRecId(null);
  };

  const handlePlayQari = (surahNum: number, ayahNum: number) => {
    if (audioRef.current) audioRef.current.pause();

    if (playingQariAyah === ayahNum) {
      setPlayingQariAyah(null);
      return;
    }

    const url = getAyahAudioUrl('alafasy', surahNum, ayahNum);
    const audio = new Audio(url);
    audioRef.current = audio;
    setPlayingQariAyah(ayahNum);
    setPlayingRecId(null);

    audio.play().catch(() => {});
    audio.onended = () => setPlayingQariAyah(null);
    audio.onerror = () => setPlayingQariAyah(null);
  };

  const handleDeleteRecording = (recId: string) => {
    StorageService.deleteRecording(activeChild.id, recId);
    setRecordings(StorageService.getRecordings(activeChild.id));
  };

  const handleExportData = () => {
    const data = {
      parent: userAccount,
      child: activeChild,
      recordings,
      ayahProgress,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cahaya_tahfiz_${activeChild.name}_data.json`;
    a.click();
  };

  // Weak ayahs needing parental attention
  const weakAyahs = ayahProgress.filter((a) => a.needsReview);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white border-2 border-[#C9E1ED] rounded-3xl p-5 sm:p-6 max-w-lg w-full shadow-2xl relative my-6 animate-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-[#EEF8FF] text-[#164C68] flex items-center justify-center hover:bg-slate-200 transition-colors"
        >
          <X size={18} />
        </button>

        {/* Security Gate if not authenticated */}
        {!isAuthenticated ? (
          <div className="py-6 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-cyan-50 border border-cyan-200 text-[#08B9EF] flex items-center justify-center mx-auto text-2xl shadow-xs">
              <Lock size={30} />
            </div>

            <div>
              <h2 className="text-xl font-black text-[#164C68] font-heading">
                Verifikasi Orang Tua
              </h2>
              <p className="text-xs text-[#8C9BA7] font-medium mt-1">
                Masukkan PIN Orang Tua untuk mengakses laporan dan rekaman anak.
              </p>
            </div>

            <form onSubmit={handleVerifyPin} className="max-w-xs mx-auto space-y-3">
              <input
                type="password"
                maxLength={4}
                value={parentPinInput}
                onChange={(e) => setParentPinInput(e.target.value)}
                placeholder="Masukkan PIN (Default: 2026)"
                className="w-full text-center tracking-widest text-lg font-black bg-[#EEF8FF] border border-[#C9E1ED] focus:border-[#08B9EF] rounded-2xl py-3 px-4 focus:outline-none text-[#164C68]"
                autoFocus
              />

              {pinError && <p className="text-xs text-rose-500 font-bold">{pinError}</p>}

              <Button variant="primary" size="md" fullWidth type="submit">
                Buka Dashboard Orang Tua
              </Button>
            </form>
          </div>
        ) : (
          /* Authenticated Parent Dashboard */
          <div className="space-y-4">
            {/* Header with Child Switcher */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <span className="text-2xl">{activeChild.avatar}</span>
                <div>
                  <h2 className="text-base font-black text-[#164C68] font-heading">
                    Dashboard Orang Tua: {activeChild.name}
                  </h2>
                  <p className="text-[11px] text-[#8C9BA7] font-semibold">
                    Akun: {userAccount.parentName} ({userAccount.email})
                  </p>
                </div>
              </div>

              {/* Child Switcher dropdown for parents with >1 child */}
              {childrenList.length > 1 && (
                <select
                  value={activeChild.id}
                  onChange={(e) => onSwitchChild(e.target.value)}
                  className="bg-[#EEF8FF] text-xs font-bold text-[#164C68] rounded-xl px-2 py-1 border border-[#C9E1ED]"
                >
                  {childrenList.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.avatar} {c.name}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Navigation Tabs */}
            <div className="flex gap-1.5 p-1 bg-[#EEF8FF] rounded-2xl border border-[#C9E1ED] overflow-x-auto">
              <button
                onClick={() => setActiveTab('summary')}
                className={`flex-1 min-w-[70px] py-1.5 px-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  activeTab === 'summary' ? 'bg-white text-[#164C68] shadow-xs' : 'text-[#8C9BA7]'
                }`}
              >
                Ringkasan
              </button>
              <button
                onClick={() => setActiveTab('weekly_report')}
                className={`flex-1 min-w-[110px] py-1.5 px-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center justify-center gap-1 ${
                  activeTab === 'weekly_report' ? 'bg-white text-[#164C68] shadow-xs' : 'text-[#8C9BA7]'
                }`}
              >
                <BarChart3 size={13} className="text-[#08B9EF]" />
                <span>Rapor Mingguan</span>
              </button>
              <button
                onClick={() => setActiveTab('recordings')}
                className={`flex-1 min-w-[85px] py-1.5 px-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  activeTab === 'recordings' ? 'bg-white text-[#164C68] shadow-xs' : 'text-[#8C9BA7]'
                }`}
              >
                Rekaman ({recordings.length})
              </button>
              <button
                onClick={() => setActiveTab('weak_ayahs')}
                className={`flex-1 min-w-[85px] py-1.5 px-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  activeTab === 'weak_ayahs' ? 'bg-white text-[#164C68] shadow-xs' : 'text-[#8C9BA7]'
                }`}
              >
                Evaluasi ({weakAyahs.length})
              </button>
              <button
                onClick={() => setActiveTab('privacy')}
                className={`flex-1 min-w-[65px] py-1.5 px-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  activeTab === 'privacy' ? 'bg-white text-[#164C68] shadow-xs' : 'text-[#8C9BA7]'
                }`}
              >
                Privasi
              </button>
              <button
                onClick={() => setActiveTab('subscription')}
                className={`flex-1 min-w-[70px] py-1.5 px-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  activeTab === 'subscription' ? 'bg-white text-[#164C68] shadow-xs' : 'text-[#8C9BA7]'
                }`}
              >
                Langganan
              </button>
            </div>

            {/* TAB 1: SUMMARY */}
            {activeTab === 'summary' && (
              <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
                {/* Weekly Report CTA Banner */}
                <div
                  onClick={() => setActiveTab('weekly_report')}
                  className="p-3.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-white rounded-2xl flex items-center justify-between cursor-pointer hover:opacity-95 shadow-xs transition-transform active:scale-[0.99]"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center text-white backdrop-blur-xs">
                      <BarChart3 size={20} />
                    </div>
                    <div>
                      <span className="text-xs font-black block">Laporan & Grafik Mingguan Lengkap</span>
                      <span className="text-[10px] text-teal-50 font-medium">Visualisasi tren hafalan, akurasi, dan durasi</span>
                    </div>
                  </div>
                  <ChevronRight size={18} />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3.5 bg-cyan-50 rounded-2xl border border-cyan-200">
                    <span className="text-[11px] font-bold text-cyan-800 uppercase block">Total Menit Belajar</span>
                    <span className="text-2xl font-black text-[#08B9EF] font-heading mt-1 block">
                      184 Menit
                    </span>
                    <span className="text-[10px] text-cyan-700 font-semibold mt-0.5 block">
                      5 hari aktif minggu ini
                    </span>
                  </div>

                  <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-200">
                    <span className="text-[11px] font-bold text-amber-800 uppercase block">Total Bintang</span>
                    <span className="text-2xl font-black text-amber-600 font-heading mt-1 block">
                      {activeChild.totalStars} ⭐
                    </span>
                    <span className="text-[10px] text-amber-700 font-semibold mt-0.5 block">
                      Streak: {activeChild.streakDays} hari berturut
                    </span>
                  </div>
                </div>

                <div className="p-4 bg-white border border-[#C9E1ED] rounded-2xl space-y-2">
                  <h4 className="text-xs font-black text-[#164C68] uppercase tracking-wider">
                    Kemajuan Kurikulum Mandiri
                  </h4>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between text-[#8C9BA7]">
                      <span>Iqra & Huruf Hijaiyah:</span>
                      <strong className="text-emerald-600">80% Tuntas</strong>
                    </div>
                    <div className="flex justify-between text-[#8C9BA7]">
                      <span>Tajwid Juz 30:</span>
                      <strong className="text-cyan-600">5 Hukum Dikuasai</strong>
                    </div>
                    <div className="flex justify-between text-[#8C9BA7]">
                      <span>Kosakata Bahasa Qur'an:</span>
                      <strong className="text-purple-600">8 Kata Hafal</strong>
                    </div>
                  </div>
                </div>

                {/* Companion & Gamification Motivation Layer Status */}
                {(() => {
                  const companion = CompanionService.getCompanionData(activeChild.id);
                  const stage = getStageForXp(companion.xp);
                  const bloomedDays = (companion.gardenDays || []).filter(Boolean).length;

                  return (
                    <div className="p-4 bg-gradient-to-r from-sky-50 to-cyan-50 border border-cyan-200 rounded-2xl space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-black text-[#164C68] uppercase tracking-wider">
                          Companion & Motivasi Anak
                        </h4>
                        <span className="text-[10px] font-bold text-[#08B9EF] bg-white px-2 py-0.5 rounded-full border border-cyan-200">
                          Living Companion Layer
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                        <div className="bg-white/80 p-2 rounded-xl border border-cyan-100">
                          <span className="text-[10px] text-[#8C9BA7] font-semibold block">Sahabat & Fase:</span>
                          <span className="font-bold text-[#164C68]">{stage.avatarIcon} {companion.name} ({stage.name})</span>
                        </div>
                        <div className="bg-white/80 p-2 rounded-xl border border-cyan-100">
                          <span className="text-[10px] text-[#8C9BA7] font-semibold block">Tingkat Karakter:</span>
                          <span className="font-bold text-[#164C68]">Level {companion.level} ({companion.xp} XP)</span>
                        </div>
                        <div className="bg-white/80 p-2 rounded-xl border border-cyan-100">
                          <span className="text-[10px] text-[#8C9BA7] font-semibold block">Kebun Mingguan:</span>
                          <span className="font-bold text-emerald-600">{bloomedDays}/7 Hari Mekar</span>
                        </div>
                        <div className="bg-white/80 p-2 rounded-xl border border-cyan-100">
                          <span className="text-[10px] text-[#8C9BA7] font-semibold block">Kartu Surah Koleksi:</span>
                          <span className="font-bold text-purple-600">{(companion.unlockedCards || []).length} Kartu Terbuka</span>
                        </div>
                      </div>
                      <p className="text-[10px] text-[#8C9BA7] font-medium pt-1 border-t border-cyan-100">
                        *Catatan: Sistem reward ini murni lapisan motivasi positif tanpa hukuman, streak putus tidak mengurangi progres hafalan anak.
                      </p>
                    </div>
                  );
                })()}
              </div>
            )}

            {/* TAB: WEEKLY REPORT WITH RECHARTS */}
            {activeTab === 'weekly_report' && (() => {
              const report = WeeklyReportService.getWeeklyReport(activeChild.id, reportWeekOffset);

              const handleShareReport = () => {
                const text = WeeklyReportService.generateShareableSummary(report);
                if (navigator.clipboard) {
                  navigator.clipboard.writeText(text);
                  setCopiedReport(true);
                  setTimeout(() => setCopiedReport(false), 3000);
                }
              };

              return (
                <div className="space-y-4 max-h-[460px] overflow-y-auto pr-1">
                  {/* Week Selector Bar */}
                  <div className="flex items-center justify-between bg-[#EEF8FF] p-2 rounded-2xl border border-[#C9E1ED]">
                    <button
                      onClick={() => setReportWeekOffset((prev) => prev - 1)}
                      disabled={reportWeekOffset <= -2}
                      className={`p-1.5 rounded-xl border transition-all flex items-center gap-1 text-xs font-bold cursor-pointer ${
                        reportWeekOffset <= -2
                          ? 'text-slate-300 border-transparent cursor-not-allowed'
                          : 'bg-white text-[#164C68] border-[#C9E1ED] hover:bg-slate-50'
                      }`}
                    >
                      <ChevronLeft size={15} />
                      <span>Pekan Lalu</span>
                    </button>

                    <div className="text-center px-1">
                      <span className="text-xs font-black text-[#164C68] block">
                        {report.weekLabel}
                      </span>
                      <span className="text-[10px] text-[#8C9BA7]">
                        {reportWeekOffset === 0 ? 'Pekan Sedang Berjalan' : 'Arsip Pekan Lalu'}
                      </span>
                    </div>

                    <button
                      onClick={() => setReportWeekOffset((prev) => prev + 1)}
                      disabled={reportWeekOffset >= 0}
                      className={`p-1.5 rounded-xl border transition-all flex items-center gap-1 text-xs font-bold cursor-pointer ${
                        reportWeekOffset >= 0
                          ? 'text-slate-300 border-transparent cursor-not-allowed'
                          : 'bg-white text-[#164C68] border-[#C9E1ED] hover:bg-slate-50'
                      }`}
                    >
                      <span>Pekan Ini</span>
                      <ChevronRight size={15} />
                    </button>
                  </div>

                  {/* Recognition & Predicate */}
                  <div className="p-3.5 bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl text-white shadow-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-bold tracking-wider bg-white/20 px-2 py-0.5 rounded-full">
                        Predikat Sepekan
                      </span>
                      <span className="text-xs font-bold bg-white text-amber-900 px-2 py-0.5 rounded-full">
                        ⭐ {report.totalBintangMingguan} Bintang
                      </span>
                    </div>
                    <h4 className="text-base font-black font-heading flex items-center gap-1.5">
                      <span>{report.badgeIcon}</span>
                      <span>{report.titleBadge}</span>
                    </h4>
                    <p className="text-xs text-amber-100 font-medium leading-relaxed">
                      "{report.encouragementMessage}"
                    </p>
                  </div>

                  {/* 4 Summary Stat Metrics */}
                  <div className="grid grid-cols-4 gap-2">
                    <div className="bg-[#EEF8FF]/80 p-2 rounded-2xl border border-[#C9E1ED] text-center">
                      <span className="text-[9px] font-bold text-[#8C9BA7] uppercase block">Ziadah</span>
                      <span className="text-base font-black text-emerald-600 font-heading block mt-0.5">
                        +{report.totalAyatHafalBaru}
                      </span>
                      <span className="text-[9px] text-[#8C9BA7]">Ayat Baru</span>
                    </div>

                    <div className="bg-[#EEF8FF]/80 p-2 rounded-2xl border border-[#C9E1ED] text-center">
                      <span className="text-[9px] font-bold text-[#8C9BA7] uppercase block">Murojaah</span>
                      <span className="text-base font-black text-[#08B9EF] font-heading block mt-0.5">
                        {report.totalAyatMurojaah}
                      </span>
                      <span className="text-[9px] text-[#8C9BA7]">Ayat Diulang</span>
                    </div>

                    <div className="bg-[#EEF8FF]/80 p-2 rounded-2xl border border-[#C9E1ED] text-center">
                      <span className="text-[9px] font-bold text-[#8C9BA7] uppercase block">Mutqin</span>
                      <span className="text-base font-black text-purple-600 font-heading block mt-0.5">
                        {report.rataRataSkor}%
                      </span>
                      <span className="text-[9px] text-[#8C9BA7]">Akurasi</span>
                    </div>

                    <div className="bg-[#EEF8FF]/80 p-2 rounded-2xl border border-[#C9E1ED] text-center">
                      <span className="text-[9px] font-bold text-[#8C9BA7] uppercase block">Durasi</span>
                      <span className="text-base font-black text-amber-600 font-heading block mt-0.5">
                        {report.totalMenitBelajar}m
                      </span>
                      <span className="text-[9px] text-[#8C9BA7]">{report.hariAktif}/7 Hari</span>
                    </div>
                  </div>

                  {/* Visual Recharts Section */}
                  <WeeklyProgressCharts report={report} />

                  {/* Parent Guidance & Strengths */}
                  <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-2 text-xs">
                    <h5 className="font-black text-emerald-900 flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                      <CheckCircle2 size={14} className="text-emerald-600" />
                      Analisis Kelancaran & Rekomendasi
                    </h5>
                    <p className="text-emerald-800 text-[11px] leading-relaxed">
                      {report.parentReviewNote}
                    </p>
                    <ul className="space-y-1 text-emerald-900 text-[11px] pt-1 border-t border-emerald-200/60">
                      {report.recommendations.map((rec, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span className="text-emerald-600 font-bold shrink-0">•</span>
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Share button */}
                  <button
                    onClick={handleShareReport}
                    className="w-full py-2.5 px-3 rounded-2xl bg-[#EEF8FF] hover:bg-[#d9effc] text-[#164C68] border border-[#C9E1ED] text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    {copiedReport ? (
                      <>
                        <Check size={15} className="text-emerald-600" />
                        <span className="text-emerald-700 font-bold">Ringkasan Rapor Berhasil Disalin!</span>
                      </>
                    ) : (
                      <>
                        <Share2 size={15} className="text-[#08B9EF]" />
                        <span>Salin / Bagikan Rapor Mingguan ke WhatsApp</span>
                      </>
                    )}
                  </button>
                </div>
              );
            })()}

            {/* TAB 2: RECORDINGS AUDIT (Parent can listen to child vs Qari) */}
            {activeTab === 'recordings' && (
              <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
                {recordings.length === 0 ? (
                  <p className="text-center py-8 text-xs text-[#8C9BA7]">
                    Belum ada rekaman tersimpan untuk {activeChild.name}.
                  </p>
                ) : (
                  recordings.map((rec) => {
                    const isRecPlaying = playingRecId === rec.id;
                    const isQariPlaying = playingQariAyah === rec.ayahNumber;

                    return (
                      <div
                        key={rec.id}
                        className="p-3.5 bg-[#EEF8FF]/60 border border-[#C9E1ED] rounded-2xl space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-xs font-black text-[#164C68]">
                              Surah {rec.surahNumber === 1 ? 'Al-Fatihah' : rec.surahNumber === 18 ? 'Al-Kahf' : 'Juz 30'} : Ayat {rec.ayahNumber}
                            </span>
                            <p className="text-[10px] text-[#8C9BA7]">
                              {new Date(rec.createdAt).toLocaleDateString('id-ID', {
                                day: 'numeric',
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </p>
                          </div>

                          <div className="flex items-center gap-2">
                            <span
                              className={`text-xs font-black px-2 py-0.5 rounded-full ${
                                rec.score >= 80
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {rec.score}%
                            </span>
                            <button
                              onClick={() => handleDeleteRecording(rec.id)}
                              className="text-rose-500 hover:text-rose-700 p-1"
                              title="Hapus Rekaman"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </div>

                        {/* Dual Audio Player */}
                        <div className="grid grid-cols-2 gap-2 pt-1">
                          <button
                            onClick={() => handlePlayRecording(rec)}
                            className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                              isRecPlaying
                                ? 'bg-cyan-500 text-white border-cyan-600'
                                : 'bg-white text-[#164C68] border-[#C9E1ED]'
                            }`}
                          >
                            {isRecPlaying ? <Pause size={13} /> : <Play size={13} className="fill-current" />}
                            <span>Suara Anak ({rec.durationSeconds}s)</span>
                          </button>

                          <button
                            onClick={() => handlePlayQari(rec.surahNumber, rec.ayahNumber)}
                            className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                              isQariPlaying
                                ? 'bg-purple-500 text-white border-purple-600'
                                : 'bg-white text-purple-700 border-purple-200'
                            }`}
                          >
                            {isQariPlaying ? <Pause size={13} /> : <Play size={13} className="fill-current" />}
                            <span>Qari ({rec.referenceDurationSeconds}s)</span>
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {/* TAB 3: EVALUATION & WEAK AYAHS */}
            {activeTab === 'weak_ayahs' && (
              <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
                {weakAyahs.length === 0 ? (
                  <div className="text-center py-8 space-y-2">
                    <CheckCircle2 size={36} className="text-emerald-500 mx-auto" />
                    <p className="text-xs font-bold text-emerald-800">
                      Alhamdulillah! Tidak ada ayat yang tergolong lemah saat ini.
                    </p>
                  </div>
                ) : (
                  weakAyahs.map((w, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-2xl flex items-center justify-between"
                    >
                      <div>
                        <span className="text-xs font-black text-[#164C68]">
                          Surah {w.surahNumber === 1 ? 'Al-Fatihah' : w.surahNumber === 18 ? 'Al-Kahf' : 'Juz 30'} : Ayat {w.ayahNumber}
                        </span>
                        <p className="text-[11px] text-amber-800 mt-0.5 font-medium">
                          Skor Terakhir: {w.score}% • Perlu Murojaah Terarah
                        </p>
                      </div>

                      <button
                        onClick={() => handlePlayQari(w.surahNumber, w.ayahNumber)}
                        className="px-3 py-1.5 bg-white border border-amber-300 rounded-xl text-xs font-bold text-amber-800 hover:bg-amber-100 flex items-center gap-1"
                      >
                        <Play size={12} className="fill-current" />
                        <span>Dengar Qari</span>
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* TAB 4: PRIVACY & DATA CONTROLS */}
            {activeTab === 'privacy' && (
              <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1 text-xs">
                <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-200 space-y-1">
                  <span className="font-bold text-emerald-900 flex items-center gap-1.5">
                    <ShieldCheck size={16} /> Keamanan & Perlindungan Privasi Anak
                  </span>
                  <p className="text-emerald-800 leading-relaxed text-[11px]">
                    Seluruh rekaman suara anak disimpan secara privat dan hanya dapat didengarkan oleh akun orang tua terverifikasi. Tidak ada publikasi ke publik.
                  </p>
                </div>

                <div className="space-y-2 pt-2">
                  <Button
                    variant="outline"
                    size="md"
                    fullWidth
                    onClick={handleExportData}
                    icon={<Download size={16} />}
                  >
                    Ekspor Salinan Data Anak (JSON)
                  </Button>
                </div>
              </div>
            )}

            {/* TAB 5: SUBSCRIPTION & ENTITLEMENT */}
            {activeTab === 'subscription' && (
              <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1 text-xs">
                <div className="p-4 bg-gradient-to-r from-cyan-50 to-blue-50 border border-cyan-200 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-[#164C68] text-sm font-heading">
                      Tahfiz Full Access
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold uppercase text-[10px]">
                      {userAccount.entitlement}
                    </span>
                  </div>
                  <p className="text-[#8C9BA7] font-medium leading-relaxed">
                    Akses penuh untuk seluruh 114 surah, fitur rekaman suara, analisis kelancaran, Iqra Jilid A-4, Tajwid lengkap, dan multi-profil anak.
                  </p>
                  <div className="text-[11px] text-[#164C68] font-bold pt-1 border-t border-cyan-100">
                    Masa Berlaku Aktif hingga: {userAccount.entitlementExpiry}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
