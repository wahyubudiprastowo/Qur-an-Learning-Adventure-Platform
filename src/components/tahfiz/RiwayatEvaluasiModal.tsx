import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Play,
  Pause,
  Trash2,
  CheckCircle2,
  Clock,
  Sparkles,
  Award,
  MessageSquare,
  Volume2,
  Check,
  ChevronDown,
  ChevronUp,
  Download,
  HardDrive,
  ExternalLink,
  ShieldAlert,
  RotateCcw,
  Layers,
  Settings2,
  Info,
} from 'lucide-react';
import { AyahRecording, TeacherEvaluation, EvaluationGrade, AudioRetentionDays } from '../../types';
import { StorageService } from '../../services/storageService';
import { AudioDatabaseService } from '../../services/audioDatabaseService';
import { getAyahAudioUrl } from '../../data/recitersData';

interface RiwayatEvaluasiModalProps {
  isOpen: boolean;
  onClose: () => void;
  childId: string;
  childName?: string;
  surahNumber: number;
  surahName: string;
  onRefreshParent?: () => void;
}

export const RiwayatEvaluasiModal: React.FC<RiwayatEvaluasiModalProps> = ({
  isOpen,
  onClose,
  childId,
  childName = 'Santri',
  surahNumber,
  surahName,
  onRefreshParent,
}) => {
  // Filter & scope state
  const [scopeFilter, setScopeFilter] = useState<'surah' | 'all'>('surah');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'evaluated'>('all');
  const [recordings, setRecordings] = useState<AyahRecording[]>([]);

  // Storage and settings state
  const [storageSettings, setStorageSettings] = useState(() =>
    StorageService.getAudioStorageSettings()
  );
  const [storageStats, setStorageStats] = useState(() =>
    StorageService.getAudioStorageStats(childId)
  );
  const [showSettingsDrawer, setShowSettingsDrawer] = useState(false);
  const [showDriveGuideModal, setShowDriveGuideModal] = useState<AyahRecording | null>(null);
  const [cleanupNotice, setCleanupNotice] = useState<string | null>(null);

  // Audio Playback State
  const [playingRecId, setPlayingRecId] = useState<string | null>(null);
  const [playingQariAyah, setPlayingQariAyah] = useState<{ surah: number; ayah: number } | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Evaluation Form State
  const [activeEvalRecId, setActiveEvalRecId] = useState<string | null>(null);
  const [evalGrade, setEvalGrade] = useState<EvaluationGrade>('mumtaz');
  const [evalRole, setEvalRole] = useState<'parent' | 'teacher'>('teacher');
  const [evaluatorName, setEvaluatorName] = useState<string>('Ustadz Pembimbing');
  const [evalNotes, setEvalNotes] = useState<string>('');
  const [saveSuccessId, setSaveSuccessId] = useState<string | null>(null);

  // Re-load recordings whenever modal opens or props change
  const loadRecordings = () => {
    // 1. Run auto cleanup if scheduled
    const cleanupRes = StorageService.runAutoCleanupRecordings(childId);
    if (cleanupRes.deletedCount > 0) {
      setCleanupNotice(`${cleanupRes.deletedCount} rekaman kadaluarsa otomatis dibersihkan sesuai durasi retensi.`);
    }

    // 2. Fetch fresh recordings
    const all = StorageService.getRecordings(childId);
    setRecordings(all);
    setStorageStats(StorageService.getAudioStorageStats(childId));
    setStorageSettings(StorageService.getAudioStorageSettings());
  };

  useEffect(() => {
    if (isOpen) {
      loadRecordings();
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      setPlayingRecId(null);
      setPlayingQariAyah(null);
    }
  }, [isOpen, childId, surahNumber]);

  if (!isOpen) return null;

  // Filtered list according to Scope & Status
  const filteredRecordings = recordings.filter((r) => {
    if (scopeFilter === 'surah' && r.surahNumber !== surahNumber) {
      return false;
    }
    if (statusFilter === 'pending' && r.evaluation?.status === 'evaluated') {
      return false;
    }
    if (statusFilter === 'evaluated' && r.evaluation?.status !== 'evaluated') {
      return false;
    }
    return true;
  });

  const countForThisSurah = recordings.filter((r) => r.surahNumber === surahNumber).length;
  const countAllSurahs = recordings.length;
  const countPending = recordings.filter((r) => r.evaluation?.status !== 'evaluated').length;

  const handlePlayRecording = async (rec: AyahRecording) => {
    if (audioRef.current) {
      audioRef.current.pause();
    }

    if (playingRecId === rec.id) {
      setPlayingRecId(null);
      return;
    }

    const audioUrl = await AudioDatabaseService.getAudioUrl(rec.id, rec.audioDataUrl || rec.audioBlobUrl);
    if (!audioUrl) {
      alert('File rekaman tidak ditemukan atau telah kedaluwarsa.');
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

  const handlePlayQari = (recSurahNum: number, ayahNum: number) => {
    if (audioRef.current) {
      audioRef.current.pause();
    }

    if (playingQariAyah?.surah === recSurahNum && playingQariAyah?.ayah === ayahNum) {
      setPlayingQariAyah(null);
      return;
    }

    const url = getAyahAudioUrl('alafasy', recSurahNum, ayahNum);
    const audio = new Audio(url);
    audioRef.current = audio;
    setPlayingQariAyah({ surah: recSurahNum, ayah: ayahNum });
    setPlayingRecId(null);

    audio.play().catch(() => {});
    audio.onended = () => setPlayingQariAyah(null);
    audio.onerror = () => setPlayingQariAyah(null);
  };

  const handleDownloadToDevice = async (rec: AyahRecording) => {
    const success = await AudioDatabaseService.downloadAudioFile({
      id: rec.id,
      surahName: rec.surahName || `Surah_${rec.surahNumber}`,
      ayahNumber: rec.ayahNumber,
      audioBlobUrl: rec.audioBlobUrl,
      audioDataUrl: rec.audioDataUrl,
      createdAt: rec.createdAt,
    });
    if (success) {
      setCleanupNotice(`File rekaman Ayat ${rec.ayahNumber} berhasil diunduh ke perangkat Anda!`);
      setTimeout(() => setCleanupNotice(null), 4000);
    }
  };

  const handleDeleteSingle = (rec: AyahRecording) => {
    if (window.confirm(`Hapus rekaman suara Surah ${rec.surahName || rec.surahNumber} Ayat ${rec.ayahNumber} dari memori perangkat?`)) {
      if (audioRef.current) audioRef.current.pause();
      StorageService.deleteRecording(childId, rec.id);
      loadRecordings();
      onRefreshParent?.();
    }
  };

  const handleDeleteAllInSurah = () => {
    if (window.confirm(`Hapus semua ${countForThisSurah} rekaman suara untuk Surah ${surahName} di perangkat ini?`)) {
      if (audioRef.current) audioRef.current.pause();
      StorageService.deleteAllRecordings(childId, surahNumber);
      loadRecordings();
      onRefreshParent?.();
    }
  };

  const handleDeleteAllRecordings = () => {
    if (window.confirm(`PERINGATAN: Hapus SEMUA (${countAllSurahs}) rekaman suara ananda ${childName} di perangkat ini? Tindakan ini tidak dapat dibatalkan.`)) {
      if (audioRef.current) audioRef.current.pause();
      StorageService.deleteAllRecordings(childId);
      loadRecordings();
      onRefreshParent?.();
    }
  };

  const handleUpdateRetention = (days: AudioRetentionDays) => {
    const updated = StorageService.updateAudioStorageSettings({ retentionDays: days, autoCleanupEnabled: days > 0 });
    setStorageSettings(updated);
    loadRecordings();
    setCleanupNotice(`Durasi simpan diubah menjadi: ${days === 0 ? 'Disimpan Selamanya' : `${days} Hari`}`);
    setTimeout(() => setCleanupNotice(null), 3000);
  };

  const handleOpenEvalForm = (rec: AyahRecording) => {
    setActiveEvalRecId(rec.id === activeEvalRecId ? null : rec.id);
    if (rec.evaluation) {
      setEvalGrade(rec.evaluation.grade || 'mumtaz');
      setEvalRole(rec.evaluation.evaluatorRole || 'teacher');
      setEvaluatorName(rec.evaluation.evaluatorName || 'Ustadz Pembimbing');
      setEvalNotes(rec.evaluation.notes || '');
    } else {
      setEvalGrade(rec.aiCorrection?.grade || 'mumtaz');
      setEvalRole('teacher');
      setEvaluatorName('Ustadz Pembimbing');
      setEvalNotes(rec.aiCorrection?.feedback || 'Makhraj dan tajwid sudah sangat baik, alhamdulillah.');
    }
  };

  const handleSaveEvaluation = (rec: AyahRecording) => {
    const evaluation: TeacherEvaluation = {
      status: 'evaluated',
      grade: evalGrade,
      evaluatorRole: evalRole,
      evaluatorName: evaluatorName.trim() || (evalRole === 'teacher' ? 'Ustadz Pembimbing' : 'Orang Tua'),
      notes: evalNotes.trim(),
      evaluatedAt: new Date().toISOString(),
    };

    StorageService.updateRecordingEvaluation(childId, rec.id, evaluation);
    loadRecordings();
    onRefreshParent?.();
    setSaveSuccessId(rec.id);
    setTimeout(() => setSaveSuccessId(null), 3000);
    setActiveEvalRecId(null);
  };

  const quickNotesTemplates = [
    'Makhraj & tajwid sangat fasih ✨',
    'Perhatikan panjang mad thobi\'i (2 harakat)',
    'Alhamdulillah tartil dan merdu, masya Allah!',
    'Perlu sedikit mengulang agar lebih lancar',
    'Lafal ghunnah sudah mantap, pertahankan!',
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden border border-[#C9E1ED]">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-emerald-50 via-teal-50 to-sky-50 border-b border-[#C9E1ED] flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-xs">
              <Award size={22} />
            </div>
            <div>
              <h3 className="font-heading font-black text-sm text-[#164C68] flex items-center gap-1.5">
                <span>Rekaman & Evaluasi Guru</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                  {filteredRecordings.length} Rekaman
                </span>
              </h3>
              <p className="text-xs text-[#8C9BA7] font-semibold">
                {childName} • {scopeFilter === 'surah' ? `Surah ${surahName}` : 'Semua Surat'} • {storageStats.estimatedSizeFormatted} di memori lokal
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setShowSettingsDrawer((prev) => !prev)}
              className={`p-2 rounded-2xl border transition-colors cursor-pointer text-xs font-bold flex items-center gap-1 ${
                showSettingsDrawer
                  ? 'bg-[#164C68] text-white border-[#164C68]'
                  : 'bg-white border-[#C9E1ED] text-[#164C68] hover:bg-slate-100'
              }`}
              title="Pengaturan Penyimpanan & Auto-Delete"
            >
              <Settings2 size={16} />
              <span className="hidden sm:inline">Penyimpanan</span>
            </button>

            <button
              onClick={() => {
                if (audioRef.current) audioRef.current.pause();
                onClose();
              }}
              className="w-9 h-9 rounded-2xl bg-white border border-[#C9E1ED] hover:bg-slate-100 flex items-center justify-center text-[#8C9BA7] hover:text-[#164C68] transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Notice alert if any */}
        {cleanupNotice && (
          <div className="bg-emerald-50 border-b border-emerald-200 px-4 py-2 text-xs font-bold text-emerald-800 flex items-center justify-between">
            <span>{cleanupNotice}</span>
            <button onClick={() => setCleanupNotice(null)} className="text-emerald-600 hover:text-emerald-900">
              <X size={14} />
            </button>
          </div>
        )}

        {/* SETTINGS DRAWER: RETENTION POLICY & MULTI-USER STORAGE */}
        {showSettingsDrawer && (
          <div className="bg-slate-50 border-b border-[#C9E1ED] p-4 text-xs space-y-3 animate-in slide-in-from-top-2 duration-150">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h4 className="font-bold text-[#164C68] flex items-center gap-1.5">
                  <HardDrive size={15} className="text-[#08B9EF]" />
                  <span>Manajemen Penyimpanan & Auto-Hapus Rekaman</span>
                </h4>
                <p className="text-[11px] text-[#8C9BA7] mt-0.5">
                  Rekaman suara disimpan di IndexedDB perangkat ini agar tidak membebani server database terpusat pada multi-user login.
                </p>
              </div>

              <div className="text-right shrink-0">
                <span className="font-mono font-black text-xs text-[#164C68] bg-white px-2 py-1 rounded-lg border border-[#C9E1ED]">
                  {storageStats.totalRecordings} file • {storageStats.estimatedSizeFormatted}
                </span>
              </div>
            </div>

            {/* Retention Selector */}
            <div className="bg-white p-3 rounded-2xl border border-[#C9E1ED] space-y-2">
              <label className="font-bold text-[#164C68] block text-[11px]">
                Durasi Hapus Otomatis (Mencegah Database/Memori Penuh):
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
                {[
                  { days: 7, label: '7 Hari (1 Minggu)' },
                  { days: 14, label: '14 Hari' },
                  { days: 30, label: '30 Hari (Default)' },
                  { days: 60, label: '60 Hari' },
                  { days: 0, label: 'Simpan Selamanya' },
                ].map((opt) => (
                  <button
                    key={opt.days}
                    type="button"
                    onClick={() => handleUpdateRetention(opt.days as AudioRetentionDays)}
                    className={`py-1.5 px-2 rounded-xl text-[11px] font-bold border transition-all cursor-pointer text-center ${
                      storageSettings.retentionDays === opt.days
                        ? 'bg-[#08B9EF] text-white border-[#08B9EF] shadow-2xs'
                        : 'bg-[#F8FCFE] hover:bg-slate-100 text-[#164C68] border-[#C9E1ED]'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-[#8C9BA7] italic">
                * Rekaman yang lebih lama dari batas waktu di atas akan otomatis dibersihkan saat aplikasi dibuka.
              </p>
            </div>

            {/* Storage Action Buttons */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  const res = StorageService.runAutoCleanupRecordings(childId);
                  loadRecordings();
                  setCleanupNotice(
                    res.deletedCount > 0
                      ? `Berhasil membersihkan ${res.deletedCount} rekaman kadaluarsa.`
                      : 'Semua rekaman masih dalam batas durasi aktif.'
                  );
                }}
                className="py-1.5 px-3 rounded-xl bg-white hover:bg-slate-100 border border-[#C9E1ED] text-[#164C68] font-bold text-[11px] flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <RotateCcw size={13} />
                <span>Bersihkan Kadaluarsa Sekarang</span>
              </button>

              {countForThisSurah > 0 && (
                <button
                  type="button"
                  onClick={handleDeleteAllInSurah}
                  className="py-1.5 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 font-bold text-[11px] flex items-center gap-1.5 cursor-pointer"
                >
                  <Trash2 size={13} />
                  <span>Hapus Semua di {surahName} ({countForThisSurah})</span>
                </button>
              )}

              {countAllSurahs > 0 && (
                <button
                  type="button"
                  onClick={handleDeleteAllRecordings}
                  className="py-1.5 px-3 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-[11px] flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <ShieldAlert size={13} />
                  <span>Hapus Semua Rekaman ({countAllSurahs})</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* FILTER BAR: SCOPE (SURAH vs ALL) & STATUS (ALL vs PENDING vs EVALUATED) */}
        <div className="p-3 bg-white border-b border-[#C9E1ED] flex flex-wrap items-center justify-between gap-2 text-xs">
          {/* Scope tabs */}
          <div className="flex items-center gap-1 bg-[#EEF8FF] p-1 rounded-xl border border-[#C9E1ED]">
            <button
              type="button"
              onClick={() => setScopeFilter('surah')}
              className={`py-1 px-2.5 rounded-lg font-bold transition-all cursor-pointer ${
                scopeFilter === 'surah'
                  ? 'bg-white text-[#164C68] shadow-2xs'
                  : 'text-[#8C9BA7] hover:text-[#164C68]'
              }`}
            >
              Surat Ini ({countForThisSurah})
            </button>
            <button
              type="button"
              onClick={() => setScopeFilter('all')}
              className={`py-1 px-2.5 rounded-lg font-bold transition-all cursor-pointer ${
                scopeFilter === 'all'
                  ? 'bg-white text-[#164C68] shadow-2xs'
                  : 'text-[#8C9BA7] hover:text-[#164C68]'
              }`}
            >
              Semua Surat ({countAllSurahs})
            </button>
          </div>

          {/* Status filters */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setStatusFilter('all')}
              className={`py-1 px-2 rounded-lg font-bold cursor-pointer ${
                statusFilter === 'all'
                  ? 'bg-[#164C68] text-white'
                  : 'bg-slate-100 text-[#8C9BA7] hover:text-[#164C68]'
              }`}
            >
              Semua
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('pending')}
              className={`py-1 px-2 rounded-lg font-bold cursor-pointer flex items-center gap-1 ${
                statusFilter === 'pending'
                  ? 'bg-amber-500 text-white'
                  : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
              }`}
            >
              <span>Belum Dinilai</span>
              {countPending > 0 && <span className="text-[10px] bg-white/20 px-1 rounded-full">{countPending}</span>}
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('evaluated')}
              className={`py-1 px-2 rounded-lg font-bold cursor-pointer ${
                statusFilter === 'evaluated'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
              }`}
            >
              Selesai
            </button>
          </div>
        </div>

        {/* Content list */}
        <div className="p-4 overflow-y-auto flex-1 space-y-3">
          {filteredRecordings.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center text-3xl shadow-inner">
                🎙️
              </div>
              <div className="space-y-1">
                <p className="text-xs font-bold text-[#164C68]">
                  {scopeFilter === 'surah'
                    ? `Belum ada rekaman suara tersimpan untuk Surah ${surahName}.`
                    : 'Belum ada rekaman suara tersimpan untuk Ananda.'}
                </p>
                <p className="text-[11px] text-[#8C9BA7] max-w-sm mx-auto leading-relaxed">
                  Lafalkan hafalan lalu klik tombol <strong>"Mulai Rekam Suara"</strong> di modul Hafalan. Setiap rekaman tersimpan aman di database perangkat untuk dinilai oleh Guru atau Orang Tua.
                </p>
              </div>

              {scopeFilter === 'surah' && countAllSurahs > 0 && (
                <button
                  type="button"
                  onClick={() => setScopeFilter('all')}
                  className="px-3 py-1.5 rounded-xl bg-[#EEF8FF] border border-[#C9E1ED] text-[#164C68] text-xs font-bold hover:bg-[#d8eefc] cursor-pointer"
                >
                  Lihat {countAllSurahs} rekaman di surat lainnya
                </button>
              )}
            </div>
          ) : (
            filteredRecordings.map((rec) => {
              const isRecPlaying = playingRecId === rec.id;
              const isQariPlaying =
                playingQariAyah?.surah === rec.surahNumber && playingQariAyah?.ayah === rec.ayahNumber;
              const isFormOpen = activeEvalRecId === rec.id;
              const isEvaluated = rec.evaluation && rec.evaluation.status === 'evaluated';

              return (
                <div
                  key={rec.id}
                  className="bg-[#F8FCFE] border border-[#C9E1ED] rounded-2xl p-4 space-y-3 transition-all hover:border-[#08B9EF]/50 shadow-2xs"
                >
                  {/* Top Bar: Ayat, Date, Evaluation Status, Action Buttons */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="w-7 h-7 rounded-xl bg-[#08B9EF] text-white text-xs font-black flex items-center justify-center font-heading">
                          {rec.ayahNumber}
                        </span>
                        <h4 className="font-heading font-black text-xs text-[#164C68]">
                          {rec.surahName || `Surah ${rec.surahNumber}`} • Ayat {rec.ayahNumber} ({rec.durationSeconds} Detik)
                        </h4>
                      </div>
                      <p className="text-[10px] text-[#8C9BA7] mt-0.5 ml-9">
                        Direkam: {new Date(rec.createdAt).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {isEvaluated ? (
                        <span
                          className={`text-[11px] font-black px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                            rec.evaluation?.grade === 'mumtaz'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : rec.evaluation?.grade === 'jayyid'
                              ? 'bg-blue-100 text-blue-800 border border-blue-200'
                              : 'bg-amber-100 text-amber-800 border border-amber-200'
                          }`}
                        >
                          {rec.evaluation?.grade === 'mumtaz'
                            ? '🌟 Mumtaz'
                            : rec.evaluation?.grade === 'jayyid'
                            ? '👍 Jayyid'
                            : '⚠️ Perlu Latihan'}
                        </span>
                      ) : (
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1">
                          <Clock size={11} />
                          Menunggu Evaluasi
                        </span>
                      )}

                      {/* Download to Device button */}
                      <button
                        onClick={() => handleDownloadToDevice(rec)}
                        className="p-1.5 rounded-xl bg-white border border-[#C9E1ED] hover:bg-slate-100 text-[#164C68] transition-colors cursor-pointer"
                        title="Simpan / Download audio ke perangkat lokal (HP / Laptop)"
                      >
                        <Download size={14} />
                      </button>

                      {/* Backup to Google Drive modal trigger */}
                      <button
                        onClick={() => setShowDriveGuideModal(rec)}
                        className="p-1.5 rounded-xl bg-white border border-[#C9E1ED] hover:bg-slate-100 text-sky-600 transition-colors cursor-pointer"
                        title="Simpan atau upload rekaman ke Google Drive"
                      >
                        <ExternalLink size={14} />
                      </button>

                      {/* Delete button */}
                      <button
                        onClick={() => handleDeleteSingle(rec)}
                        className="p-1.5 rounded-xl bg-white border border-rose-200 hover:bg-rose-50 text-rose-500 hover:text-rose-700 transition-colors cursor-pointer"
                        title="Hapus rekaman ini dari database perangkat"
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
                      className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer border shadow-2xs ${
                        isRecPlaying
                          ? 'bg-[#08B9EF] text-white border-[#08B9EF]'
                          : 'bg-white text-[#164C68] border-[#C9E1ED] hover:bg-[#EEF8FF]'
                      }`}
                    >
                      {isRecPlaying ? <Pause size={14} /> : <Play size={14} className="fill-current text-[#08B9EF]" />}
                      <span>{isRecPlaying ? 'Jeda Suara' : `Putar Suara Santri (${rec.durationSeconds}s)`}</span>
                    </button>

                    <button
                      onClick={() => handlePlayQari(rec.surahNumber, rec.ayahNumber)}
                      className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer border shadow-2xs ${
                        isQariPlaying
                          ? 'bg-purple-600 text-white border-purple-600'
                          : 'bg-white text-purple-700 border-purple-200 hover:bg-purple-50'
                      }`}
                    >
                      {isQariPlaying ? <Pause size={14} /> : <Volume2 size={14} className="text-purple-600" />}
                      <span>{isQariPlaying ? 'Jeda Qari' : 'Bandingkan Qari'}</span>
                    </button>
                  </div>

                  {/* AI Correction Result Display if available */}
                  {rec.aiCorrection && (
                    <div className="p-3 bg-gradient-to-r from-sky-50 to-blue-50 border border-sky-200 rounded-2xl space-y-1.5 text-xs text-left">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 font-black text-[#164C68] text-[11px]">
                          <Sparkles size={13} className="text-amber-500 fill-amber-500" />
                          <span>Analisis Koreksi Otomatis AI</span>
                        </div>
                        <span className="font-mono font-black text-xs text-[#08B9EF]">
                          Skor: {rec.aiCorrection.overallScore}%
                        </span>
                      </div>

                      <p className="text-[11px] text-[#164C68] leading-relaxed">
                        {rec.aiCorrection.feedback}
                      </p>

                      {rec.aiCorrection.tajwidNotes && rec.aiCorrection.tajwidNotes.length > 0 && (
                        <div className="pt-1 flex flex-wrap gap-1">
                          {rec.aiCorrection.tajwidNotes.map((note, i) => (
                            <span
                              key={i}
                              className="text-[10px] font-semibold bg-white/90 text-sky-800 border border-sky-200 px-2 py-0.5 rounded-md"
                            >
                              💡 {note}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Evaluated Summary Card if already submitted */}
                  {isEvaluated && !isFormOpen && rec.evaluation && (
                    <div className="bg-white border border-emerald-200 rounded-xl p-3 space-y-1 text-xs">
                      <div className="flex items-center justify-between text-emerald-800 font-bold">
                        <span>
                          Evaluasi oleh {rec.evaluation.evaluatorRole === 'teacher' ? 'Ustadz / Guru' : 'Orang Tua'}:
                        </span>
                        <span className="text-[10px] text-emerald-600">
                          {rec.evaluation.evaluatorName}
                        </span>
                      </div>
                      <p className="text-emerald-950 italic">
                        "{rec.evaluation.notes}"
                      </p>
                    </div>
                  )}

                  {/* Toggle Evaluation Form Button */}
                  <div className="flex items-center justify-between pt-1">
                    <button
                      type="button"
                      onClick={() => handleOpenEvalForm(rec)}
                      className="text-xs font-bold text-[#08B9EF] hover:text-[#0693be] flex items-center gap-1 cursor-pointer"
                    >
                      <span>{isEvaluated ? 'Ubah Evaluasi / Catatan Guru' : 'Beri Nilai & Evaluasi Guru/Orang Tua ✍️'}</span>
                      {isFormOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>

                    {saveSuccessId === rec.id && (
                      <span className="text-xs font-bold text-emerald-600 flex items-center gap-1 animate-in fade-in">
                        <Check size={13} /> Evaluasi tersimpan!
                      </span>
                    )}
                  </div>

                  {/* Evaluation Form Accordion */}
                  {isFormOpen && (
                    <div className="bg-white border border-[#C9E1ED] rounded-2xl p-3 space-y-3 pt-3 animate-in fade-in duration-150 text-left">
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <label className="text-[10px] font-bold text-[#8C9BA7] block mb-1">
                            Peran Penilai:
                          </label>
                          <select
                            value={evalRole}
                            onChange={(e) => setEvalRole(e.target.value as 'parent' | 'teacher')}
                            className="w-full bg-[#EEF8FF] border border-[#C9E1ED] rounded-xl px-2.5 py-1.5 text-xs font-semibold text-[#164C68] focus:outline-none focus:border-[#08B9EF]"
                          >
                            <option value="teacher">Ustadz / Guru Tahfiz</option>
                            <option value="parent">Orang Tua / Wali</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-[10px] font-bold text-[#8C9BA7] block mb-1">
                            Nama Penilai:
                          </label>
                          <input
                            type="text"
                            value={evaluatorName}
                            onChange={(e) => setEvaluatorName(e.target.value)}
                            placeholder="Ustadz / Bunda"
                            className="w-full bg-[#EEF8FF] border border-[#C9E1ED] rounded-xl px-2.5 py-1.5 text-xs font-semibold text-[#164C68] focus:outline-none focus:border-[#08B9EF]"
                          />
                        </div>
                      </div>

                      {/* Grade Selector */}
                      <div>
                        <label className="text-[10px] font-bold text-[#8C9BA7] block mb-1">
                          Nilai Predikat Hafalan:
                        </label>
                        <div className="grid grid-cols-3 gap-1.5">
                          <button
                            type="button"
                            onClick={() => setEvalGrade('mumtaz')}
                            className={`py-1.5 px-2 rounded-xl text-[11px] font-black border transition-all cursor-pointer ${
                              evalGrade === 'mumtaz'
                                ? 'bg-emerald-500 text-white border-emerald-600 shadow-2xs'
                                : 'bg-[#EEF8FF] text-[#164C68] border-[#C9E1ED]'
                            }`}
                          >
                            🌟 Mumtaz (Sangat Baik)
                          </button>
                          <button
                            type="button"
                            onClick={() => setEvalGrade('jayyid')}
                            className={`py-1.5 px-2 rounded-xl text-[11px] font-black border transition-all cursor-pointer ${
                              evalGrade === 'jayyid'
                                ? 'bg-blue-500 text-white border-blue-600 shadow-2xs'
                                : 'bg-[#EEF8FF] text-[#164C68] border-[#C9E1ED]'
                            }`}
                          >
                            👍 Jayyid (Baik)
                          </button>
                          <button
                            type="button"
                            onClick={() => setEvalGrade('perlu_ulang')}
                            className={`py-1.5 px-2 rounded-xl text-[11px] font-black border transition-all cursor-pointer ${
                              evalGrade === 'perlu_ulang'
                                ? 'bg-amber-500 text-white border-amber-600 shadow-2xs'
                                : 'bg-[#EEF8FF] text-[#164C68] border-[#C9E1ED]'
                            }`}
                          >
                            🔄 Perlu Latihan
                          </button>
                        </div>
                      </div>

                      {/* Notes & Quick Chips */}
                      <div>
                        <label className="text-[10px] font-bold text-[#8C9BA7] block mb-1">
                          Catatan Masukan / Evaluasi Tajwid:
                        </label>
                        <div className="flex flex-wrap gap-1 mb-1.5">
                          {quickNotesTemplates.map((t, i) => (
                            <button
                              key={i}
                              type="button"
                              onClick={() => setEvalNotes((prev) => (prev ? `${prev}. ${t}` : t))}
                              className="text-[10px] font-semibold bg-slate-100 hover:bg-slate-200 text-[#164C68] px-2 py-0.5 rounded-md border border-slate-200 transition-colors cursor-pointer"
                            >
                              + {t}
                            </button>
                          ))}
                        </div>
                        <textarea
                          rows={2}
                          value={evalNotes}
                          onChange={(e) => setEvalNotes(e.target.value)}
                          placeholder="Tuliskan catatan tajwid, makharijul huruf, atau motivasi..."
                          className="w-full bg-[#EEF8FF] border border-[#C9E1ED] rounded-xl p-2 text-xs font-semibold text-[#164C68] focus:outline-none focus:border-[#08B9EF]"
                        />
                      </div>

                      {/* Submit buttons */}
                      <div className="flex gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => setActiveEvalRecId(null)}
                          className="flex-1 py-2 rounded-xl text-xs font-bold bg-slate-100 text-[#8C9BA7] hover:bg-slate-200 cursor-pointer"
                        >
                          Batal
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSaveEvaluation(rec)}
                          className="flex-1 py-2 rounded-xl text-xs font-black bg-emerald-500 hover:bg-emerald-600 text-white shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
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

        {/* GOOGLE DRIVE & LOCAL SAVE GUIDE MODAL */}
        {showDriveGuideModal && (
          <div className="fixed inset-0 z-60 bg-black/50 flex items-center justify-center p-3 animate-in fade-in">
            <div className="bg-white rounded-3xl max-w-md w-full p-5 space-y-4 shadow-2xl border border-[#C9E1ED]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-sky-500 text-white flex items-center justify-center">
                    <ExternalLink size={18} />
                  </div>
                  <h4 className="font-heading font-black text-sm text-[#164C68]">
                    Simpan ke Google Drive / Device
                  </h4>
                </div>
                <button
                  onClick={() => setShowDriveGuideModal(null)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-2.5 text-xs text-[#164C68] leading-relaxed">
                <p>
                  Agar rekaman hafalan ananda tersimpan abadi dan tidak membebani memori lokal perangkat, Anda dapat menyimpannya ke <strong>Google Drive</strong>:
                </p>

                <div className="bg-sky-50 border border-sky-200 rounded-2xl p-3 space-y-2 text-[11px]">
                  <div className="flex items-start gap-2">
                    <span className="font-bold text-sky-600 bg-sky-100 w-5 h-5 rounded-full flex items-center justify-center shrink-0">1</span>
                    <span>Klik <strong>"Unduh File Audio"</strong> di bawah untuk mengunduh rekaman Ayat {showDriveGuideModal.ayahNumber} ke HP/Komputer Anda.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="font-bold text-sky-600 bg-sky-100 w-5 h-5 rounded-full flex items-center justify-center shrink-0">2</span>
                    <span>Buka <strong>Google Drive</strong> lalu upload berkas tersebut ke folder arsip tahfiz ananda.</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2 pt-2">
                <button
                  type="button"
                  onClick={async () => {
                    await handleDownloadToDevice(showDriveGuideModal);
                  }}
                  className="w-full py-2.5 rounded-xl bg-[#08B9EF] hover:bg-[#07a6d7] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-2xs cursor-pointer"
                >
                  <Download size={15} />
                  <span>Unduh File Audio Rekaman (.webm / .mp3)</span>
                </button>

                <a
                  href="https://drive.google.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 rounded-xl bg-white border border-[#C9E1ED] hover:bg-slate-50 text-[#164C68] font-bold text-xs flex items-center justify-center gap-2 cursor-pointer text-center"
                >
                  <ExternalLink size={15} />
                  <span>Buka Google Drive di Tab Baru</span>
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="p-3.5 bg-slate-50 border-t border-[#C9E1ED] flex items-center justify-between gap-2 text-[11px] text-[#8C9BA7]">
          <div className="flex items-center gap-1.5">
            <Info size={14} className="text-[#08B9EF] shrink-0" />
            <span>Penyimpanan offline-first aman di browser (IndexedDB) • Tidak membebani server</span>
          </div>

          <span className="font-mono font-bold text-[#164C68]">
            Retensi: {storageSettings.retentionDays === 0 ? 'Selamanya' : `${storageSettings.retentionDays} Hari`}
          </span>
        </div>
      </div>
    </div>
  );
};
