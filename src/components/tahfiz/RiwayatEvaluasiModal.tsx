import React, { useState, useRef } from 'react';
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
} from 'lucide-react';
import { AyahRecording, TeacherEvaluation, EvaluationGrade } from '../../types';
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
  const [recordings, setRecordings] = useState<AyahRecording[]>(() => {
    return StorageService.getRecordings(childId).filter((r) => r.surahNumber === surahNumber);
  });

  const [playingRecId, setPlayingRecId] = useState<string | null>(null);
  const [playingQariAyah, setPlayingQariAyah] = useState<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Evaluation Form State
  const [activeEvalRecId, setActiveEvalRecId] = useState<string | null>(null);
  const [evalGrade, setEvalGrade] = useState<EvaluationGrade>('mumtaz');
  const [evalRole, setEvalRole] = useState<'parent' | 'teacher'>('teacher');
  const [evaluatorName, setEvaluatorName] = useState<string>('Ustadz Pembimbing');
  const [evalNotes, setEvalNotes] = useState<string>('');
  const [saveSuccessId, setSaveSuccessId] = useState<string | null>(null);

  if (!isOpen) return null;

  const refreshList = () => {
    const list = StorageService.getRecordings(childId).filter((r) => r.surahNumber === surahNumber);
    setRecordings(list);
    onRefreshParent?.();
  };

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

  const handlePlayQari = (ayahNum: number) => {
    if (audioRef.current) {
      audioRef.current.pause();
    }

    if (playingQariAyah === ayahNum) {
      setPlayingQariAyah(null);
      return;
    }

    const url = getAyahAudioUrl('alafasy', surahNumber, ayahNum);
    const audio = new Audio(url);
    audioRef.current = audio;
    setPlayingQariAyah(ayahNum);
    setPlayingRecId(null);

    audio.play().catch(() => {});
    audio.onended = () => setPlayingQariAyah(null);
    audio.onerror = () => setPlayingQariAyah(null);
  };

  const handleOpenEvalForm = (rec: AyahRecording) => {
    setActiveEvalRecId(rec.id === activeEvalRecId ? null : rec.id);
    if (rec.evaluation) {
      setEvalGrade(rec.evaluation.grade || 'mumtaz');
      setEvalRole(rec.evaluation.evaluatorRole || 'teacher');
      setEvaluatorName(rec.evaluation.evaluatorName || 'Ustadz Pembimbing');
      setEvalNotes(rec.evaluation.notes || '');
    } else {
      setEvalGrade('mumtaz');
      setEvalRole('teacher');
      setEvaluatorName('Ustadz Pembimbing');
      setEvalNotes('Makhraj dan tajwid sudah sangat baik, alhamdulillah.');
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
    refreshList();
    setSaveSuccessId(rec.id);
    setTimeout(() => setSaveSuccessId(null), 3000);
    setActiveEvalRecId(null);
  };

  const handleDelete = (recId: string) => {
    if (confirm('Hapus rekaman suara ayat ini dari database?')) {
      if (audioRef.current) audioRef.current.pause();
      StorageService.deleteRecording(childId, recId);
      refreshList();
    }
  };

  const quickNotesTemplates = [
    'Makhraj & tajwid sangat fasih ✨',
    'Perhatikan panjang mad thobi\'i (2 harakat)',
    'Alhamdulillah tartil dan merdu, masya Allah!',
    'Perlu sedikit mengulang agar lebih percaya diri',
    'Lafal ghunnah sudah mantap, pertahankan!',
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-[#C9E1ED]">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-emerald-50 to-teal-50 border-b border-[#C9E1ED] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-xs">
              <Award size={22} />
            </div>
            <div>
              <h3 className="font-heading font-black text-sm text-[#164C68]">
                Rekaman Suara & Evaluasi Guru/Orang Tua
              </h3>
              <p className="text-xs text-[#8C9BA7] font-semibold">
                Surah {surahName} • {recordings.length} rekaman tersimpan di database
              </p>
            </div>
          </div>

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

        {/* Content list */}
        <div className="p-4 overflow-y-auto flex-1 space-y-3">
          {recordings.length === 0 ? (
            <div className="text-center py-12 space-y-2">
              <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center text-2xl">
                🎙️
              </div>
              <p className="text-xs font-bold text-[#164C68]">
                Belum ada rekaman suara tersimpan untuk Surah {surahName}.
              </p>
              <p className="text-[11px] text-[#8C9BA7] max-w-xs mx-auto">
                Lafalkan hafalan di tombol <strong>"Rekam Suara"</strong> dan simpan ke database agar bisa dievaluasi oleh Guru atau Orang Tua.
              </p>
            </div>
          ) : (
            recordings.map((rec) => {
              const isRecPlaying = playingRecId === rec.id;
              const isQariPlaying = playingQariAyah === rec.ayahNumber;
              const isFormOpen = activeEvalRecId === rec.id;
              const isEvaluated = rec.evaluation && rec.evaluation.status === 'evaluated';

              return (
                <div
                  key={rec.id}
                  className="bg-[#F8FCFE] border border-[#C9E1ED] rounded-2xl p-4 space-y-3 transition-all hover:border-[#08B9EF]/50 shadow-2xs"
                >
                  {/* Top Bar: Ayat, Date, AI Score, Badges */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="w-7 h-7 rounded-xl bg-[#08B9EF] text-white text-xs font-black flex items-center justify-center font-heading">
                          {rec.ayahNumber}
                        </span>
                        <h4 className="font-heading font-black text-xs text-[#164C68]">
                          Ayat {rec.ayahNumber} • {rec.durationSeconds} Detik
                        </h4>
                      </div>
                      <p className="text-[10px] text-[#8C9BA7] mt-0.5 ml-9">
                        Disimpan: {new Date(rec.createdAt).toLocaleDateString('id-ID', {
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
                          className={`text-[11px] font-black px-2 py-0.5 rounded-full flex items-center gap-1 ${
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

                      <button
                        onClick={() => handleDelete(rec.id)}
                        className="text-slate-400 hover:text-rose-600 p-1 transition-colors"
                        title="Hapus rekaman ini"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Student note if provided */}
                  {rec.studentNote && (
                    <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-2 text-[11px] text-amber-900 flex items-start gap-1.5">
                      <span className="text-amber-600 font-bold shrink-0">💬</span>
                      <span>
                        <strong>Catatan Santri:</strong> "{rec.studentNote}"
                      </span>
                    </div>
                  )}

                  {/* Audio Controls: Child vs Qari */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handlePlayRecording(rec)}
                      className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer border shadow-2xs ${
                        isRecPlaying
                          ? 'bg-[#08B9EF] text-white border-[#08B9EF]'
                          : 'bg-white text-[#164C68] border-[#C9E1ED] hover:bg-[#EEF8FF]'
                      }`}
                    >
                      {isRecPlaying ? <Pause size={14} /> : <Play size={14} className="fill-current" />}
                      <span>{isRecPlaying ? 'Jeda Suara Anak' : 'Putar Suara Anak'}</span>
                    </button>

                    <button
                      onClick={() => handlePlayQari(rec.ayahNumber)}
                      className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer border shadow-2xs ${
                        isQariPlaying
                          ? 'bg-purple-600 text-white border-purple-600'
                          : 'bg-white text-purple-700 border-purple-200 hover:bg-purple-50'
                      }`}
                    >
                      {isQariPlaying ? <Pause size={14} /> : <Volume2 size={14} />}
                      <span>{isQariPlaying ? 'Jeda Qari' : 'Bandingkan Qari'}</span>
                    </button>
                  </div>

                  {/* Evaluated Result Box (if already evaluated) */}
                  {isEvaluated && !isFormOpen && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-emerald-900 flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
                          <CheckCircle2 size={14} className="text-emerald-600" />
                          Evaluasi oleh {rec.evaluation?.evaluatorRole === 'teacher' ? 'Ustadz / Guru' : 'Orang Tua'}:
                        </span>
                        <span className="text-[10px] text-emerald-700 font-semibold">
                          {rec.evaluation?.evaluatorName}
                        </span>
                      </div>
                      <p className="text-[11px] text-emerald-800 italic leading-relaxed pt-0.5">
                        "{rec.evaluation?.notes || 'Bagus dan lancar.'}"
                      </p>
                    </div>
                  )}

                  {/* Toggle / Open Evaluation Form */}
                  <div className="pt-1 flex items-center justify-between border-t border-slate-100">
                    <button
                      onClick={() => handleOpenEvalForm(rec)}
                      className="text-xs font-bold text-[#08B9EF] hover:text-[#0693bd] flex items-center gap-1 cursor-pointer"
                    >
                      <MessageSquare size={13} />
                      <span>{isEvaluated ? 'Ubah Evaluasi / Catatan Guru' : 'Beri Evaluasi Guru / Orang Tua ✍️'}</span>
                      {isFormOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>

                    {saveSuccessId === rec.id && (
                      <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1 animate-in fade-in">
                        <Check size={13} /> Evaluasi tersimpan!
                      </span>
                    )}
                  </div>

                  {/* Interactive Evaluation Form */}
                  {isFormOpen && (
                    <div className="p-3.5 bg-white border-2 border-emerald-200 rounded-2xl space-y-3 animate-in fade-in duration-150">
                      <h5 className="font-black text-xs text-[#164C68] flex items-center gap-1.5 uppercase tracking-wider">
                        <span>Form Penilaian & Masukan Pembimbing</span>
                      </h5>

                      {/* Evaluator Role & Name */}
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <label className="text-[10px] font-bold text-[#8C9BA7] block mb-1">
                            Peran Penilai:
                          </label>
                          <div className="flex gap-1">
                            <button
                              type="button"
                              onClick={() => {
                                setEvalRole('teacher');
                                setEvaluatorName('Ustadz Pembimbing');
                              }}
                              className={`flex-1 py-1 rounded-lg font-bold text-[11px] border cursor-pointer ${
                                evalRole === 'teacher'
                                  ? 'bg-purple-600 text-white border-purple-600'
                                  : 'bg-[#EEF8FF] text-[#164C68] border-[#C9E1ED]'
                              }`}
                            >
                              Ustadz / Guru
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setEvalRole('parent');
                                setEvaluatorName('Orang Tua');
                              }}
                              className={`flex-1 py-1 rounded-lg font-bold text-[11px] border cursor-pointer ${
                                evalRole === 'parent'
                                  ? 'bg-emerald-600 text-white border-emerald-600'
                                  : 'bg-[#EEF8FF] text-[#164C68] border-[#C9E1ED]'
                              }`}
                            >
                              Orang Tua
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
                            placeholder="Nama Ustadz / Bunda"
                            className="w-full bg-[#EEF8FF] border border-[#C9E1ED] rounded-lg px-2 py-1 text-xs font-bold text-[#164C68] focus:outline-none focus:border-[#08B9EF]"
                          />
                        </div>
                      </div>

                      {/* Predikat / Grade */}
                      <div>
                        <label className="text-[10px] font-bold text-[#8C9BA7] block mb-1">
                          Predikat Kelulusan Ayat:
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
                            🌟 Mumtaz (Sempurna)
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
                            👍 Jayyid (Bagus)
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
                          placeholder="Tuliskan catatan tajwid, makharijul huruf, atau apresiasi..."
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

        {/* Footer */}
        <div className="p-3.5 bg-slate-50 border-t border-[#C9E1ED] text-center">
          <p className="text-[11px] text-[#8C9BA7] font-semibold">
            Semua rekaman tersimpan permanen di database perangkat (IndexedDB) dan siap dievaluasi kapan saja.
          </p>
        </div>
      </div>
    </div>
  );
};
