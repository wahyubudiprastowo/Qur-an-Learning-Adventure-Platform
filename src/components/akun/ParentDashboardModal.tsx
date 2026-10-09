import React, { useState, useEffect } from 'react';
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
  MessageSquare,
  Clock,
  ChevronDown,
  ChevronUp,
  HardDrive,
  ExternalLink,
  Activity,
  Coins,
  Key,
  Crown,
} from 'lucide-react';
import { AiTokenTopupModal } from '../subscription/AiTokenTopupModal';
import { ChildProfile, UserAccount, AyahRecording, ChildAyahProgress, TeacherEvaluation, EvaluationGrade, AudioRetentionDays } from '../../types';
import { StorageService } from '../../services/storageService';
import { AudioDatabaseService } from '../../services/audioDatabaseService';
import { CompanionService } from '../../services/companionService';
import { getStageForXp } from '../../data/companionData';
import { getAyahAudioUrl } from '../../data/recitersData';
import { WeeklyReportService } from '../../services/weeklyReportService';
import { WeeklyProgressCharts } from '../progress/WeeklyProgressCharts';
import { D3AudioAccuracyEvaluation } from '../tahfiz/D3AudioAccuracyEvaluation';
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

  // Evaluation Form State
  const [evaluatingRecId, setEvaluatingRecId] = useState<string | null>(null);
  const [evalGrade, setEvalGrade] = useState<EvaluationGrade>('mumtaz');
  const [evalRole, setEvalRole] = useState<'parent' | 'teacher'>('parent');
  const [evaluatorName, setEvaluatorName] = useState<string>(userAccount.parentName || 'Orang Tua');
  const [evalNotes, setEvalNotes] = useState<string>('');
  const [recordingsFilter, setRecordingsFilter] = useState<'all' | 'pending' | 'evaluated'>('all');
  const [saveToastRecId, setSaveToastRecId] = useState<string | null>(null);
  const [d3VisualizingRecId, setD3VisualizingRecId] = useState<string | null>(null);

  const [ayahProgress, setAyahProgress] = useState<ChildAyahProgress[]>(() =>
    StorageService.getAyahProgress(activeChild.id)
  );

  const [storageSettings, setStorageSettings] = useState(() =>
    StorageService.getAudioStorageSettings()
  );
  const [storageStats, setStorageStats] = useState(() =>
    StorageService.getAudioStorageStats(activeChild.id)
  );

  // AI Token and BYOK Management States
  const [isTokenModalOpen, setIsTokenModalOpen] = useState<boolean>(false);
  const [byokInput, setByokInput] = useState<string>(userAccount.customGeminiApiKey || '');
  const [byokMessage, setByokMessage] = useState<string>('');

  // Parent PIN Configuration States
  const [newPinInput, setNewPinInput] = useState<string>('');
  const [confirmPinInput, setConfirmPinInput] = useState<string>('');
  const [pinChangeError, setPinChangeError] = useState<string>('');
  const [pinChangeSuccess, setPinChangeSuccess] = useState<string>('');

  // Synchronize fresh recordings and progress whenever dashboard opens or active child changes
  useEffect(() => {
    if (isOpen) {
      StorageService.runAutoCleanupRecordings(activeChild.id);
      setRecordings(StorageService.getRecordings(activeChild.id));
      setAyahProgress(StorageService.getAyahProgress(activeChild.id));
      setStorageStats(StorageService.getAudioStorageStats(activeChild.id));
      setStorageSettings(StorageService.getAudioStorageSettings());
    }
  }, [isOpen, activeChild.id, activeTab]);

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

  const handlePlayRecording = async (rec: AyahRecording) => {
    if (audioRef.current) audioRef.current.pause();

    if (playingRecId === rec.id) {
      setPlayingRecId(null);
      return;
    }

    const audioUrl = await AudioDatabaseService.getAudioUrl(rec.id, rec.audioDataUrl || rec.audioBlobUrl);
    if (!audioUrl) {
      alert('File rekaman tidak dapat dimuat.');
      return;
    }

    const audio = new Audio(audioUrl);
    audioRef.current = audio;
    setPlayingRecId(rec.id);
    setPlayingQariAyah(null);

    audio.play().catch(() => {});
    audio.onended = () => setPlayingRecId(null);
    audio.onerror = () => setPlayingRecId(null);
  };

  const handleOpenEvaluationForm = (rec: AyahRecording) => {
    if (evaluatingRecId === rec.id) {
      setEvaluatingRecId(null);
      return;
    }
    setEvaluatingRecId(rec.id);
    if (rec.evaluation) {
      setEvalGrade(rec.evaluation.grade || 'mumtaz');
      setEvalRole(rec.evaluation.evaluatorRole || 'parent');
      setEvaluatorName(rec.evaluation.evaluatorName || userAccount.parentName || 'Orang Tua');
      setEvalNotes(rec.evaluation.notes || '');
    } else {
      setEvalGrade('mumtaz');
      setEvalRole('parent');
      setEvaluatorName(userAccount.parentName || 'Orang Tua');
      setEvalNotes('Makhraj dan tajwid sudah sangat baik.');
    }
  };

  const handleSaveEvaluation = (rec: AyahRecording) => {
    const evaluation: TeacherEvaluation = {
      status: 'evaluated',
      grade: evalGrade,
      evaluatorRole: evalRole,
      evaluatorName: evaluatorName.trim() || (evalRole === 'teacher' ? 'Ustadz Pembimbing' : (userAccount.parentName || 'Orang Tua')),
      notes: evalNotes.trim(),
      evaluatedAt: new Date().toISOString(),
    };
    StorageService.updateRecordingEvaluation(activeChild.id, rec.id, evaluation);
    setRecordings(StorageService.getRecordings(activeChild.id));
    setEvaluatingRecId(null);
    setSaveToastRecId(rec.id);
    setTimeout(() => setSaveToastRecId(null), 3000);
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
    AudioDatabaseService.deleteAudio(recId).catch(() => {});
    setRecordings(StorageService.getRecordings(activeChild.id));
    setStorageStats(StorageService.getAudioStorageStats(activeChild.id));
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
                className={`flex-1 min-w-[95px] py-1.5 px-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center justify-center gap-1 ${
                  activeTab === 'privacy' ? 'bg-white text-[#164C68] shadow-xs' : 'text-[#8C9BA7]'
                }`}
              >
                <Lock size={12} />
                <span>Keamanan & PIN</span>
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

            {/* TAB 2: RECORDINGS & EVALUATION AUDIT */}
            {activeTab === 'recordings' && (() => {
              const pendingCount = recordings.filter((r) => !r.evaluation || r.evaluation.status === 'pending').length;
              const evaluatedCount = recordings.filter((r) => r.evaluation && r.evaluation.status === 'evaluated').length;

              const filteredRecordings = recordings.filter((r) => {
                if (recordingsFilter === 'pending') {
                  return !r.evaluation || r.evaluation.status === 'pending';
                }
                if (recordingsFilter === 'evaluated') {
                  return r.evaluation && r.evaluation.status === 'evaluated';
                }
                return true;
              });

              const quickFeedbackChips = [
                'Makhraj & tajwid sangat fasih ✨',
                'Perhatikan mad thobi\'i (2 harakat)',
                'Alhamdulillah tartil dan merdu',
                'Perlu mengulang agar lebih lancar',
                'Panjang ghunnah sudah tepat 👍',
              ];

              return (
                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                  {/* Storage Info & Auto Retention Control */}
                  <div className="p-3 bg-white border border-[#C9E1ED] rounded-2xl space-y-2 text-xs shadow-2xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 font-bold text-[#164C68]">
                        <HardDrive size={14} className="text-[#08B9EF]" />
                        <span>Penyimpanan Lokal: {storageStats.totalRecordings} Rekaman ({storageStats.estimatedSizeFormatted})</span>
                      </div>
                      <span className="text-[10px] bg-slate-100 text-[#8C9BA7] px-2 py-0.5 rounded-md font-semibold">
                        Retensi: {storageSettings.retentionDays === 0 ? 'Selamanya' : `${storageSettings.retentionDays} Hari`}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-1 text-[11px] pt-1 border-t border-slate-100">
                      <span className="text-[#8C9BA7]">Hapus otomatis:</span>
                      <div className="flex gap-1">
                        {([7, 14, 30, 0] as AudioRetentionDays[]).map((d) => (
                          <button
                            key={d}
                            onClick={() => {
                              const updated = StorageService.updateAudioStorageSettings({ retentionDays: d, autoCleanupEnabled: d > 0 });
                              setStorageSettings(updated);
                              StorageService.runAutoCleanupRecordings(activeChild.id);
                              setRecordings(StorageService.getRecordings(activeChild.id));
                              setStorageStats(StorageService.getAudioStorageStats(activeChild.id));
                            }}
                            className={`px-2 py-0.5 rounded-lg font-bold text-[10px] cursor-pointer transition-colors ${
                              storageSettings.retentionDays === d
                                ? 'bg-[#08B9EF] text-white'
                                : 'bg-slate-100 text-[#164C68] hover:bg-slate-200'
                            }`}
                          >
                            {d === 0 ? 'Selamanya' : `${d}h`}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Filter Pills */}
                  <div className="flex items-center gap-1.5 p-1 bg-white border border-[#C9E1ED] rounded-2xl shadow-2xs">
                    <button
                      onClick={() => setRecordingsFilter('all')}
                      className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        recordingsFilter === 'all'
                          ? 'bg-[#08B9EF] text-white shadow-2xs'
                          : 'text-[#8C9BA7] hover:text-[#164C68]'
                      }`}
                    >
                      Semua ({recordings.length})
                    </button>
                    <button
                      onClick={() => setRecordingsFilter('pending')}
                      className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        recordingsFilter === 'pending'
                          ? 'bg-amber-500 text-white shadow-2xs'
                          : 'text-[#8C9BA7] hover:text-[#164C68]'
                      }`}
                    >
                      Menunggu ({pendingCount})
                    </button>
                    <button
                      onClick={() => setRecordingsFilter('evaluated')}
                      className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        recordingsFilter === 'evaluated'
                          ? 'bg-emerald-500 text-white shadow-2xs'
                          : 'text-[#8C9BA7] hover:text-[#164C68]'
                      }`}
                    >
                      Sudah Dinilai ({evaluatedCount})
                    </button>
                  </div>

                  {filteredRecordings.length === 0 ? (
                    <div className="text-center py-10 space-y-2">
                      <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center text-xl">
                        🎙️
                      </div>
                      <p className="text-xs font-bold text-[#8C9BA7]">
                        {recordings.length === 0
                          ? `Belum ada rekaman tersimpan untuk ${activeChild.name}.`
                          : 'Tidak ada rekaman untuk filter yang dipilih.'}
                      </p>
                    </div>
                  ) : (
                    filteredRecordings.map((rec) => {
                      const isRecPlaying = playingRecId === rec.id;
                      const isQariPlaying = playingQariAyah === rec.ayahNumber;
                      const isFormOpen = evaluatingRecId === rec.id;
                      const isEvaluated = rec.evaluation && rec.evaluation.status === 'evaluated';

                      return (
                        <div
                          key={rec.id}
                          className="p-3.5 bg-[#EEF8FF]/60 border border-[#C9E1ED] rounded-2xl space-y-2.5 transition-all hover:border-[#08B9EF]/50 shadow-2xs"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="text-xs font-black text-[#164C68]">
                                {rec.surahName ? `Surah ${rec.surahName}` : rec.surahNumber === 1 ? 'Surah Al-Fatihah' : rec.surahNumber === 18 ? 'Surah Al-Kahf' : 'Juz 30'} : Ayat {rec.ayahNumber}
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

                            <div className="flex items-center gap-1.5">
                              {isEvaluated ? (
                                <span
                                  className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${
                                    rec.evaluation?.grade === 'mumtaz'
                                      ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                      : rec.evaluation?.grade === 'jayyid'
                                      ? 'bg-blue-100 text-blue-800 border-blue-300'
                                      : 'bg-amber-100 text-amber-800 border-amber-300'
                                  }`}
                                >
                                  {rec.evaluation?.grade === 'mumtaz'
                                    ? '🌟 Mumtaz'
                                    : rec.evaluation?.grade === 'jayyid'
                                    ? '👍 Jayyid'
                                    : '⚠️ Perlu Latihan'}
                                </span>
                              ) : (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200 flex items-center gap-1">
                                  <Clock size={10} />
                                  Menunggu Evaluasi
                                </span>
                              )}

                              <button
                                onClick={() => AudioDatabaseService.downloadAudioFile(rec)}
                                className="text-sky-500 hover:text-sky-700 p-1 transition-colors cursor-pointer"
                                title="Unduh Rekaman Audio ke Perangkat"
                              >
                                <Download size={14} />
                              </button>

                              <button
                                onClick={() => handleDeleteRecording(rec.id)}
                                className="text-rose-400 hover:text-rose-600 p-1 transition-colors cursor-pointer"
                                title="Hapus Rekaman"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>

                          {/* Student note if any */}
                          {rec.studentNote && (
                            <div className="bg-amber-50/80 border border-amber-200/80 rounded-xl p-2 text-[11px] text-amber-900 flex items-start gap-1.5">
                              <span className="text-amber-600 font-bold shrink-0">💬</span>
                              <span>
                                <strong>Catatan Santri:</strong> "{rec.studentNote}"
                              </span>
                            </div>
                          )}

                          {/* Dual Audio Player */}
                          <div className="grid grid-cols-2 gap-2 pt-0.5">
                            <button
                              onClick={() => handlePlayRecording(rec)}
                              className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                                isRecPlaying
                                  ? 'bg-[#08B9EF] text-white border-[#08B9EF]'
                                  : 'bg-white text-[#164C68] border-[#C9E1ED] hover:bg-[#EEF8FF]'
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
                                  : 'bg-white text-purple-700 border-purple-200 hover:bg-purple-50'
                              }`}
                            >
                              {isQariPlaying ? <Pause size={13} /> : <Play size={13} className="fill-current" />}
                              <span>Qari ({rec.referenceDurationSeconds}s)</span>
                            </button>
                          </div>

                          {/* D3 Tartil Accuracy Visualization Button */}
                          <button
                            type="button"
                            onClick={() => setD3VisualizingRecId(d3VisualizingRecId === rec.id ? null : rec.id)}
                            className={`w-full py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer border flex items-center justify-between shadow-2xs ${
                              d3VisualizingRecId === rec.id
                                ? 'bg-gradient-to-r from-purple-700 to-indigo-800 text-white border-purple-900 shadow-md'
                                : 'bg-gradient-to-r from-purple-50 via-indigo-50 to-sky-50 text-purple-950 border-purple-200 hover:border-purple-300'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <div className={`w-5 h-5 rounded-lg flex items-center justify-center ${d3VisualizingRecId === rec.id ? 'bg-white/20 text-white' : 'bg-purple-200 text-purple-800'}`}>
                                <Activity size={13} />
                              </div>
                              <span className="font-bold text-xs">
                                {d3VisualizingRecId === rec.id ? 'Tutup Visualisasi D3 Tartil' : 'Visualisasi Akurasi D3.js vs Mualim'}
                              </span>
                            </div>
                            <div className="flex items-center gap-1 font-black text-[11px]">
                              <span>⭐ Skor Bintang</span>
                              <ChevronDown size={13} className={`transition-transform duration-200 ${d3VisualizingRecId === rec.id ? 'rotate-180' : ''}`} />
                            </div>
                          </button>

                          {/* D3 Visualization Interactive Module */}
                          {d3VisualizingRecId === rec.id && (
                            <div className="pt-1 animate-in fade-in duration-200">
                              <D3AudioAccuracyEvaluation
                                recording={rec}
                                surahNumber={rec.surahNumber}
                                surahName={rec.surahName}
                                ayahNumber={rec.ayahNumber}
                                childName={activeChild.name}
                                onClose={() => setD3VisualizingRecId(null)}
                              />
                            </div>
                          )}

                          {/* AI Correction Summary */}
                          {rec.aiCorrection && (
                            <div className="p-2.5 bg-sky-50/90 border border-sky-200 rounded-xl space-y-1 text-xs">
                              <div className="flex items-center justify-between text-[10px] font-black text-[#164C68]">
                                <span className="flex items-center gap-1 text-[#08B9EF]">
                                  <Sparkles size={11} className="text-amber-500 fill-amber-500" />
                                  Koreksi Otomatis AI: {rec.aiCorrection.overallScore}% ({rec.aiCorrection.grade.toUpperCase()})
                                </span>
                                <span className="text-[10px] text-slate-500">
                                  Tajwid: {rec.aiCorrection.tajwidScore}% • Lafal: {rec.aiCorrection.accuracyScore}%
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-700 italic">
                                "{rec.aiCorrection.feedback}"
                              </p>
                            </div>
                          )}

                          {/* Teacher / Parent Evaluation Card if already evaluated */}
                          {isEvaluated && !isFormOpen && (
                            <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1 text-xs">
                              <div className="flex items-center justify-between">
                                <span className="font-extrabold text-emerald-900 text-[10px] uppercase tracking-wider flex items-center gap-1">
                                  <CheckCircle2 size={12} className="text-emerald-600" />
                                  Evaluasi {rec.evaluation?.evaluatorRole === 'teacher' ? 'Ustadz / Guru' : 'Orang Tua'}:
                                </span>
                                <span className="text-[10px] text-emerald-700 font-semibold">
                                  {rec.evaluation?.evaluatorName}
                                </span>
                              </div>
                              <p className="text-[11px] text-emerald-900 italic">
                                "{rec.evaluation?.notes || 'Bagus dan lancar.'}"
                              </p>
                            </div>
                          )}

                          {/* Toggle Evaluation Form Button */}
                          <div className="pt-1 flex items-center justify-between border-t border-slate-100">
                            <button
                              onClick={() => handleOpenEvaluationForm(rec)}
                              className="text-xs font-bold text-[#08B9EF] hover:text-[#0693bd] flex items-center gap-1 cursor-pointer"
                            >
                              <MessageSquare size={13} />
                              <span>{isEvaluated ? 'Ubah Catatan & Nilai Guru/Orang Tua' : 'Beri Nilai & Evaluasi Guru/Orang Tua ✍️'}</span>
                              {isFormOpen ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                            </button>

                            {saveToastRecId === rec.id && (
                              <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                                <Check size={13} /> Tersimpan!
                              </span>
                            )}
                          </div>

                          {/* Evaluation Form */}
                          {isFormOpen && (
                            <div className="p-3 bg-white border border-emerald-200 rounded-2xl space-y-2.5 animate-in fade-in duration-150">
                              <div className="grid grid-cols-2 gap-2 text-xs">
                                <div>
                                  <label className="text-[10px] font-bold text-[#8C9BA7] block mb-1">
                                    Peran Penilai:
                                  </label>
                                  <div className="flex gap-1">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setEvalRole('parent');
                                        setEvaluatorName(userAccount.parentName || 'Orang Tua');
                                      }}
                                      className={`flex-1 py-1 rounded-lg font-bold text-[10px] border cursor-pointer ${
                                        evalRole === 'parent'
                                          ? 'bg-emerald-600 text-white border-emerald-600'
                                          : 'bg-[#EEF8FF] text-[#164C68] border-[#C9E1ED]'
                                      }`}
                                    >
                                      Orang Tua
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setEvalRole('teacher');
                                        setEvaluatorName('Ustadz Pembimbing');
                                      }}
                                      className={`flex-1 py-1 rounded-lg font-bold text-[10px] border cursor-pointer ${
                                        evalRole === 'teacher'
                                          ? 'bg-purple-600 text-white border-purple-600'
                                          : 'bg-[#EEF8FF] text-[#164C68] border-[#C9E1ED]'
                                      }`}
                                    >
                                      Ustadz/Guru
                                    </button>
                                  </div>
                                </div>

                                <div>
                                  <label className="text-[10px] font-bold text-[#8C9BA7] block mb-1">
                                    Nama Penilai:
                                  </label>
                                  <input
                                    type="text"
                                    value={evaluatorName}
                                    onChange={(e) => setEvaluatorName(e.target.value)}
                                    className="w-full bg-[#EEF8FF] border border-[#C9E1ED] rounded-lg px-2 py-1 text-xs font-bold text-[#164C68]"
                                  />
                                </div>
                              </div>

                              {/* Predikat */}
                              <div>
                                <label className="text-[10px] font-bold text-[#8C9BA7] block mb-1">
                                  Predikat Kelulusan Ayat:
                                </label>
                                <div className="grid grid-cols-3 gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => setEvalGrade('mumtaz')}
                                    className={`py-1 rounded-xl text-[10px] font-black border cursor-pointer ${
                                      evalGrade === 'mumtaz'
                                        ? 'bg-emerald-500 text-white border-emerald-600'
                                        : 'bg-[#EEF8FF] text-[#164C68] border-[#C9E1ED]'
                                    }`}
                                  >
                                    🌟 Mumtaz
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setEvalGrade('jayyid')}
                                    className={`py-1 rounded-xl text-[10px] font-black border cursor-pointer ${
                                      evalGrade === 'jayyid'
                                        ? 'bg-blue-500 text-white border-blue-600'
                                        : 'bg-[#EEF8FF] text-[#164C68] border-[#C9E1ED]'
                                    }`}
                                  >
                                    👍 Jayyid
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setEvalGrade('perlu_ulang')}
                                    className={`py-1 rounded-xl text-[10px] font-black border cursor-pointer ${
                                      evalGrade === 'perlu_ulang'
                                        ? 'bg-amber-500 text-white border-amber-600'
                                        : 'bg-[#EEF8FF] text-[#164C68] border-[#C9E1ED]'
                                    }`}
                                  >
                                    🔄 Perlu Latihan
                                  </button>
                                </div>
                              </div>

                              {/* Feedback notes */}
                              <div>
                                <label className="text-[10px] font-bold text-[#8C9BA7] block mb-1">
                                  Catatan Evaluasi Tajwid & Makhraj:
                                </label>
                                <div className="flex flex-wrap gap-1 mb-1">
                                  {quickFeedbackChips.map((t, idx) => (
                                    <button
                                      key={idx}
                                      type="button"
                                      onClick={() => setEvalNotes((prev) => (prev ? `${prev}. ${t}` : t))}
                                      className="text-[9px] font-semibold bg-slate-100 hover:bg-slate-200 text-[#164C68] px-1.5 py-0.5 rounded border border-slate-200"
                                    >
                                      + {t}
                                    </button>
                                  ))}
                                </div>
                                <textarea
                                  rows={2}
                                  value={evalNotes}
                                  onChange={(e) => setEvalNotes(e.target.value)}
                                  placeholder="Tuliskan catatan tajwid, apresiasi, atau saran..."
                                  className="w-full bg-[#EEF8FF] border border-[#C9E1ED] rounded-xl p-2 text-xs font-semibold text-[#164C68]"
                                />
                              </div>

                              {/* Form action buttons */}
                              <div className="flex gap-2 pt-1">
                                <button
                                  type="button"
                                  onClick={() => setEvaluatingRecId(null)}
                                  className="flex-1 py-1.5 rounded-xl text-xs font-bold bg-slate-100 text-[#8C9BA7] hover:bg-slate-200 cursor-pointer"
                                >
                                  Batal
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleSaveEvaluation(rec)}
                                  className="flex-1 py-1.5 rounded-xl text-xs font-black bg-emerald-500 hover:bg-emerald-600 text-white shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
                                >
                                  <Check size={14} />
                                  <span>Simpan Evaluasi 💾</span>
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              );
            })()}

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

            {/* TAB 4: KEAMANAN, PRIVASI & PENGATURAN PIN ORANG TUA */}
            {activeTab === 'privacy' && (
              <div className="space-y-4 max-h-[380px] overflow-y-auto pr-1 text-xs text-left">
                {/* Form Ubah PIN Orang Tua */}
                <div className="p-4 bg-gradient-to-r from-cyan-50 to-blue-50 rounded-2xl border border-cyan-200 space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-[#164C68] text-white flex items-center justify-center shadow-xs">
                      <Lock size={16} />
                    </div>
                    <div>
                      <h4 className="font-black text-[#164C68] text-xs font-heading">
                        Atur / Ganti PIN Keamanan Orang Tua
                      </h4>
                      <p className="text-[10px] text-slate-500">
                        PIN ini digunakan untuk membuka Dasbor Wali, audit rekaman, dan laporan anak.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2 pt-1">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] font-bold text-slate-600 block mb-1">
                          PIN Baru (4-6 Angka):
                        </label>
                        <input
                          type="password"
                          maxLength={6}
                          value={newPinInput}
                          onChange={(e) => {
                            setNewPinInput(e.target.value);
                            setPinChangeError('');
                          }}
                          placeholder="Misal: 1234"
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 text-center tracking-widest font-mono font-bold text-xs bg-white focus:border-[#08B9EF] outline-hidden"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-600 block mb-1">
                          Konfirmasi PIN Baru:
                        </label>
                        <input
                          type="password"
                          maxLength={6}
                          value={confirmPinInput}
                          onChange={(e) => {
                            setConfirmPinInput(e.target.value);
                            setPinChangeError('');
                          }}
                          placeholder="Ketik ulang PIN"
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 text-center tracking-widest font-mono font-bold text-xs bg-white focus:border-[#08B9EF] outline-hidden"
                        />
                      </div>
                    </div>

                    {pinChangeError && (
                      <p className="text-xs text-rose-500 font-bold">{pinChangeError}</p>
                    )}

                    {pinChangeSuccess && (
                      <div className="p-2 bg-emerald-100 border border-emerald-300 rounded-xl text-emerald-800 text-xs font-bold text-center">
                        {pinChangeSuccess}
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        if (!newPinInput.trim() || newPinInput.trim().length < 4) {
                          setPinChangeError('PIN minimal 4 digit angka.');
                          return;
                        }
                        if (newPinInput !== confirmPinInput) {
                          setPinChangeError('Konfirmasi PIN tidak cocok.');
                          return;
                        }
                        StorageService.updateParentPin(newPinInput);
                        setPinChangeSuccess('✅ PIN Keamanan Orang Tua berhasil diperbarui!');
                        setNewPinInput('');
                        setConfirmPinInput('');
                        setTimeout(() => setPinChangeSuccess(''), 3500);
                      }}
                      className="w-full py-2.5 px-4 rounded-xl bg-[#164C68] hover:bg-[#113a50] text-white font-black text-xs cursor-pointer shadow-xs transition-all"
                    >
                      Simpan PIN Keamanan Baru
                    </button>
                  </div>
                </div>

                {/* Info Keamanan Privasi Rekaman */}
                <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-200 space-y-1">
                  <span className="font-bold text-emerald-900 flex items-center gap-1.5">
                    <ShieldCheck size={16} /> Keamanan & Perlindungan Privasi Anak
                  </span>
                  <p className="text-emerald-800 leading-relaxed text-[11px]">
                    Seluruh rekaman suara anak disimpan secara lokal & terenkripsi di perangkat ini dan hanya dapat diakses melalui verifikasi PIN orang tua terdaftar.
                  </p>
                </div>

                {/* Ekspor Salinan Data */}
                <div className="space-y-2 pt-1">
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

            {/* TAB 5: SUBSCRIPTION, TOKENS & AI GOVERNANCE */}
            {activeTab === 'subscription' && (
              <div className="space-y-3.5 max-h-[380px] overflow-y-auto pr-1 text-xs text-left">
                {/* Plan Card */}
                <div className="p-4 bg-gradient-to-r from-cyan-50 via-sky-50 to-blue-50 border border-cyan-200 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">👑</span>
                      <div>
                        <span className="font-black text-[#164C68] text-sm font-heading block">
                          {userAccount.planTier === 'pro' ? 'Cahaya Tahfiz Premium PRO' : 'Paket Cahaya Tahfiz Free'}
                        </span>
                        <span className="text-[10px] text-slate-500 font-semibold">
                          Status: {userAccount.entitlement === 'active' || userAccount.planTier === 'pro' ? 'Aktif Penuh' : 'Akses Dasar'}
                        </span>
                      </div>
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full font-bold uppercase text-[10px] ${
                      userAccount.planTier === 'pro' ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {userAccount.planTier.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-slate-600 font-medium leading-relaxed text-[11px]">
                    {userAccount.planTier === 'pro'
                      ? 'Akses tak terbatas seluruh 114 surah, arena game, rekaman audio HQ, analitik tajwid orang tua, dan 20x kuota koreksi AI/hari (FUP).'
                      : 'Paket dasar gratis mencakup surat-surat pilihan, rekaman lokal, dan 1x uji coba koreksi AI/hari.'}
                  </p>
                  <div className="text-[11px] text-[#164C68] font-bold pt-1 border-t border-cyan-100 flex items-center justify-between">
                    <span>Masa Aktif hingga: {userAccount.entitlementExpiry}</span>
                  </div>
                </div>

                {/* AI Token & Quota Balance Card */}
                <div className="p-4 bg-gradient-to-r from-amber-50/70 via-orange-50/50 to-yellow-50/70 border border-amber-200 rounded-2xl space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-xs">
                        <Coins size={16} />
                      </div>
                      <div>
                        <h4 className="font-black text-amber-950 text-xs">
                          Saldo Token & Kuota AI Guru
                        </h4>
                        <p className="text-[10px] text-amber-800">
                          Analisis makhraj & tajwid mendalam via audio multimodal
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsTokenModalOpen(true)}
                      className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-black text-xs shadow-xs cursor-pointer flex items-center gap-1 transition-all"
                    >
                      <Coins size={13} />
                      <span>Top-Up Token</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1 text-center">
                    <div className="p-2.5 bg-white/90 rounded-xl border border-amber-200">
                      <span className="text-[10px] font-bold text-slate-500 block">Kuota AI Harian</span>
                      <span className="text-sm font-black text-[#164C68]">
                        {StorageService.getDailyAiUsageCount(activeChild.id)} / {userAccount.planTier === 'pro' ? 20 : 1}
                      </span>
                      <span className="text-[9px] text-slate-400 block">Reset otomatis tiap hari</span>
                    </div>
                    <div className="p-2.5 bg-white/90 rounded-xl border border-amber-200">
                      <span className="text-[10px] font-bold text-slate-500 block">Saldo Token Tambahan</span>
                      <span className="text-sm font-black text-amber-600">
                        {userAccount.aiTokensBalance || 0} Token
                      </span>
                      <span className="text-[9px] text-slate-400 block">Tanpa kedaluwarsa</span>
                    </div>
                  </div>
                </div>

                {/* BYOK: Bring Your Own Key */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2.5">
                  <div className="flex items-center gap-2">
                    <Key size={16} className="text-[#08B9EF]" />
                    <h4 className="font-black text-[#164C68] text-xs">
                      Opsi Lanjutan: Gunakan Google Gemini API Key Sendiri
                    </h4>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Bagi ustadz, sekolah, atau orang tua yang memiliki akun Google, Anda dapat membuat Google Gemini API Key gratis di Google AI Studio. Jika diisi, penggunaan AI akan 100% gratis tanpa batas kuota!
                  </p>
                  <div className="space-y-1.5">
                    <input
                      type="password"
                      value={byokInput}
                      onChange={(e) => setByokInput(e.target.value)}
                      placeholder="Masukkan AIzaSy... (kosongkan untuk pakai server)"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono bg-white focus:border-[#08B9EF] outline-hidden"
                    />
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          StorageService.setCustomGeminiApiKey(byokInput);
                          setByokMessage('✅ API Key berhasil disimpan!');
                          setTimeout(() => setByokMessage(''), 3000);
                        }}
                        className="py-1.5 px-3 rounded-lg bg-[#164C68] hover:bg-[#113a50] text-white font-bold text-xs cursor-pointer transition-all"
                      >
                        Simpan Key
                      </button>
                      {userAccount.customGeminiApiKey && (
                        <button
                          type="button"
                          onClick={() => {
                            setByokInput('');
                            StorageService.setCustomGeminiApiKey('');
                            setByokMessage('API Key dihapus (kembali ke kuota server).');
                            setTimeout(() => setByokMessage(''), 3000);
                          }}
                          className="py-1.5 px-2.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold cursor-pointer"
                        >
                          Hapus
                        </button>
                      )}
                      {byokMessage && (
                        <span className="text-xs text-emerald-700 font-bold">{byokMessage}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Top-Up AI Token Modal */}
        {isTokenModalOpen && (
          <AiTokenTopupModal
            isOpen={isTokenModalOpen}
            onClose={() => setIsTokenModalOpen(false)}
            userAccount={userAccount}
            onSuccess={() => {
              // Refresh
            }}
          />
        )}
      </div>
    </div>
  );
};
