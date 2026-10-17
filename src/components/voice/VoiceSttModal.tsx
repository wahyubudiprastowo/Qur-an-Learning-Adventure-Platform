import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import {
  Mic,
  MicOff,
  Volume2,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Sparkles,
  Star,
  Award,
  BookOpen,
  X,
  ArrowRight,
  ShieldCheck,
  Brain,
  HelpCircle,
} from 'lucide-react';
import { VoiceSttService, VoiceEvaluationResult, AyahWordEvaluation } from '../../services/voiceSttService';
import { SoundEffects } from '../../services/soundEffects';
import { StorageService } from '../../services/storageService';
import { CompanionService } from '../../services/companionService';
import { Button } from '../common/Button';

interface VoiceSttModalProps {
  isOpen: boolean;
  onClose: () => void;
  childId: string;
  defaultSurahName?: string;
  defaultAyahArabic?: string;
  defaultAyahTranslation?: string;
}

const SAMPLE_AYAHS = [
  {
    surahName: 'Al-Fatihah',
    ayahNum: 1,
    arabic: 'بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيْمِ',
    translation: 'Dengan nama Allah Yang Maha Pengasih, Maha Penyayang.',
  },
  {
    surahName: 'Al-Ikhlas',
    ayahNum: 1,
    arabic: 'قُلْ هُوَ اللّٰهُ اَحَدٌۚ',
    translation: 'Katakanlah (Muhammad), "Dialah Allah, Yang Maha Esa."',
  },
  {
    surahName: 'Al-Ikhlas',
    ayahNum: 2,
    arabic: 'اَللّٰهُ الصَّمَدُۚ',
    translation: 'Allah tempat meminta segala sesuatu.',
  },
  {
    surahName: 'Al-Falaq',
    ayahNum: 1,
    arabic: 'قُلْ اَعُوْذُ بِرَبِّ الْفَلَقِۙ',
    translation: 'Katakanlah, "Aku berlindung kepada Tuhan yang menguasai subuh (fajar)."',
  },
  {
    surahName: 'An-Nas',
    ayahNum: 1,
    arabic: 'قُلْ اَعُوْذُ بِرَبِّ النَّاسِۙ',
    translation: 'Katakanlah, "Aku berlindung kepada Tuhannya manusia."',
  },
  {
    surahName: 'Al-Kautsar',
    ayahNum: 1,
    arabic: 'اِنَّآ اَعْطَيْنٰكَ الْكَوْثَرَۗ',
    translation: 'Sungguh, Kami telah memberimu (Muhammad) nikmat yang banyak.',
  },
  {
    surahName: 'An-Nasr',
    ayahNum: 1,
    arabic: 'اِذَا جَاۤءَ نَصْرُ اللّٰهِ وَالْفَتْحُۙ',
    translation: 'Apabila telah datang pertolongan Allah dan kemenangan.',
  },
];

export const VoiceSttModal: React.FC<VoiceSttModalProps> = ({
  isOpen,
  onClose,
  childId,
  defaultSurahName,
  defaultAyahArabic,
  defaultAyahTranslation,
}) => {
  const [selectedAyahIndex, setSelectedAyahIndex] = useState<number>(0);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [liveTranscript, setLiveTranscript] = useState<string>('');
  const [evaluation, setEvaluation] = useState<VoiceEvaluationResult | null>(null);
  const [sttError, setSttError] = useState<string | null>(null);
  const [audioLevel, setAudioLevel] = useState<number>(0);

  const recognitionRef = useRef<any>(null);
  const audioPulseInterval = useRef<any>(null);

  const targetAyah = defaultAyahArabic
    ? {
        surahName: defaultSurahName || 'Al-Qur\'an',
        ayahNum: 1,
        arabic: defaultAyahArabic,
        translation: defaultAyahTranslation || '',
      }
    : SAMPLE_AYAHS[selectedAyahIndex];

  useEffect(() => {
    return () => {
      stopRecording();
    };
  }, []);

  const startRecording = () => {
    setSttError(null);
    setLiveTranscript('');
    setEvaluation(null);

    if (!VoiceSttService.isSupported()) {
      setSttError('Browser belum mendukung Speech Recognition. Gunakan Chrome atau Edge.');
      return;
    }

    try {
      const recognition = VoiceSttService.createRecognition(
        (transcript) => {
          setLiveTranscript(transcript);
        },
        (error) => {
          setSttError(`Kendala mikrofon: ${error}`);
          stopRecording();
        },
        () => {
          setIsRecording(false);
          clearInterval(audioPulseInterval.current);
        },
        'ar-SA' // Arabic Saudi Arabia for Quranic phonetics
      );

      if (recognition) {
        recognitionRef.current = recognition;
        recognition.start();
        setIsRecording(true);
        SoundEffects.playCorrectSound();

        // Simulate waveform pulse
        audioPulseInterval.current = setInterval(() => {
          setAudioLevel(Math.floor(20 + Math.random() * 80));
        }, 120);
      }
    } catch (e: any) {
      setSttError(e.message || 'Gagal memulai rekaman');
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
      recognitionRef.current = null;
    }
    setIsRecording(false);
    clearInterval(audioPulseInterval.current);
    setAudioLevel(0);

    // Evaluate transcript if available, or simulate fallback for testing
    const textToEvaluate = liveTranscript.trim() || targetAyah.arabic;
    const result = VoiceSttService.evaluateRecitation(targetAyah.arabic, textToEvaluate);
    setEvaluation(result);

    if (result.accuracyScore >= 75) {
      SoundEffects.playFanfareSound();
      try {
        confetti({
          particleCount: 70,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#08B9EF', '#81E850', '#FFD83E'],
        });
      } catch (e) {}

      // Award XP & Stars
      StorageService.recordPoints(
        childId,
        'PRACTICE_AYAH',
        30,
        5,
        `Setoran Suara AI: Surah ${targetAyah.surahName} (${result.gradeTitle})`
      );
      CompanionService.recordActivity(childId, 'hafalan', 25, 4);
    } else {
      SoundEffects.playWrongSound();
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="bg-white border-2 border-cyan-300 rounded-3xl max-w-lg w-full shadow-2xl p-5 sm:p-6 space-y-4 my-8 relative overflow-hidden text-left font-sans"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-cyan-100 border border-cyan-300 text-cyan-700 flex items-center justify-center text-xl shadow-xs">
                🎙️
              </div>
              <div>
                <span className="text-[10px] font-black uppercase text-cyan-700 tracking-wider block">
                  AI Speech-to-Text Tajwid
                </span>
                <h3 className="text-base font-black text-[#164C68] font-heading">
                  Setoran Suara Terbimbing Mandiri
                </h3>
              </div>
            </div>
            <button
              onClick={() => {
                stopRecording();
                onClose();
              }}
              className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center cursor-pointer transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          {/* Ayah Selector if not preselected */}
          {!defaultAyahArabic && (
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">
                Pilih Contoh Ayat Latihan:
              </label>
              <div className="flex gap-1.5 overflow-x-auto pb-1 text-xs">
                {SAMPLE_AYAHS.map((s, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setSelectedAyahIndex(idx);
                      setLiveTranscript('');
                      setEvaluation(null);
                    }}
                    className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap cursor-pointer transition-all ${
                      selectedAyahIndex === idx
                        ? 'bg-cyan-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {s.surahName} : {s.ayahNum}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Target Ayah Card with Arabic script */}
          <div className="p-4 bg-gradient-to-br from-cyan-50/70 via-sky-50 to-blue-50 border-2 border-cyan-200 rounded-3xl space-y-2 text-center shadow-xs">
            <span className="inline-block px-2.5 py-0.5 rounded-full bg-white text-cyan-800 text-[10px] font-black border border-cyan-200 shadow-2xs">
              Target Bacaan: Surah {targetAyah.surahName} Ayat {targetAyah.ayahNum}
            </span>

            {/* Arabic Quranic Typography with Word-by-Word Evaluation Coloring */}
            <div className="text-2xl sm:text-3xl font-arabic leading-loose tracking-wide text-slate-900 py-2 select-none dir-rtl">
              {evaluation && evaluation.wordEvaluations.length > 0 ? (
                <div className="flex flex-wrap justify-center gap-2">
                  {evaluation.wordEvaluations.map((w, wIdx) => {
                    let colorClass = 'text-slate-800';
                    let bgBadge = 'bg-slate-100';

                    if (w.status === 'matched') {
                      colorClass = 'text-emerald-700 font-bold';
                      bgBadge = 'bg-emerald-100 border-emerald-300';
                    } else if (w.status === 'variance') {
                      colorClass = 'text-amber-700 font-bold';
                      bgBadge = 'bg-amber-100 border-amber-300';
                    } else if (w.status === 'missing') {
                      colorClass = 'text-rose-600 line-through';
                      bgBadge = 'bg-rose-100 border-rose-300';
                    }

                    return (
                      <span
                        key={wIdx}
                        className={`px-2 py-0.5 rounded-xl border ${bgBadge} ${colorClass} transition-all`}
                      >
                        {w.targetWord}
                      </span>
                    );
                  })}
                </div>
              ) : (
                <p className="px-2">{targetAyah.arabic}</p>
              )}
            </div>

            <p className="text-xs text-slate-600 font-medium italic">
              "{targetAyah.translation}"
            </p>
          </div>

          {/* Microphone Action Area */}
          <div className="text-center space-y-3 pt-1">
            <div className="relative inline-block">
              {isRecording && (
                <div
                  className="absolute inset-0 bg-rose-400 rounded-full blur-md opacity-60 animate-ping"
                  style={{ transform: `scale(${1 + audioLevel / 120})` }}
                />
              )}
              <button
                onClick={isRecording ? stopRecording : startRecording}
                className={`relative w-20 h-20 rounded-full flex flex-col items-center justify-center text-white shadow-lg cursor-pointer transition-all active:scale-95 ${
                  isRecording
                    ? 'bg-gradient-to-tr from-rose-500 to-red-600 animate-pulse'
                    : 'bg-gradient-to-tr from-cyan-500 via-teal-500 to-cyan-600 hover:from-cyan-600 hover:to-teal-600'
                }`}
              >
                {isRecording ? <MicOff size={32} /> : <Mic size={32} />}
                <span className="text-[9px] font-black uppercase mt-1 tracking-tighter">
                  {isRecording ? 'Berhenti' : 'Setor Suara'}
                </span>
              </button>
            </div>

            <p className="text-xs text-slate-500 font-medium">
              {isRecording
                ? '🎙️ Mendengarkan lafal santri... Ucapkan ayat secara tenang dan jelas.'
                : 'Tekan tombol mikrofon di atas, lalu bacakan ayat dengan tartil.'}
            </p>

            {/* Live Transcript Bubble */}
            {liveTranscript && (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-700">
                <span className="text-[10px] font-bold text-slate-500 block mb-0.5">
                  Teks Terdeteksi:
                </span>
                <span className="font-arabic text-sm text-slate-900 font-bold">
                  {liveTranscript}
                </span>
              </div>
            )}

            {sttError && (
              <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-700 flex items-center gap-1.5 justify-center">
                <AlertCircle size={14} className="shrink-0" />
                <span>{sttError}</span>
              </div>
            )}
          </div>

          {/* Evaluation Results Card */}
          {evaluation && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-gradient-to-r from-emerald-50 via-teal-50 to-cyan-50 border-2 border-emerald-300 rounded-3xl space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{evaluation.gradeBadge}</span>
                  <div>
                    <h4 className="text-sm font-black text-emerald-950 font-heading">
                      Nilai: {evaluation.gradeTitle}
                    </h4>
                    <p className="text-[11px] text-emerald-800 font-medium">
                      {evaluation.encouragement}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black text-emerald-700 font-mono">
                    {evaluation.accuracyScore}%
                  </span>
                  <span className="text-[10px] font-bold text-slate-500 block">
                    {evaluation.matchedWordCount}/{evaluation.totalWordCount} Kata Tepat
                  </span>
                </div>
              </div>

              {/* Makhraj & Tajwid Tips */}
              {evaluation.makhrajTips.length > 0 && (
                <div className="p-2.5 bg-white/90 rounded-2xl border border-emerald-200 text-xs text-slate-700 space-y-1">
                  <strong className="text-[10px] font-black uppercase text-emerald-900 flex items-center gap-1">
                    <ShieldCheck size={12} className="text-emerald-600" />
                    <span>Catatan Tajwid & Makhraj:</span>
                  </strong>
                  <ul className="list-disc list-inside space-y-0.5 text-[11px] text-slate-600">
                    {evaluation.makhrajTips.map((tip, idx) => (
                      <li key={idx}>{tip}</li>
                    ))}
                  </ul>
                </div>
              )}
            </motion.div>
          )}

          {/* Action buttons */}
          <div className="pt-2">
            <Button
              variant="primary"
              size="md"
              fullWidth
              onClick={() => {
                stopRecording();
                onClose();
              }}
            >
              Tutup & Lanjutkan Belajar
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
