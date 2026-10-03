import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  Play,
  Pause,
  Star,
  Sparkles,
  AlertTriangle,
  RotateCcw,
  BookOpen,
  CheckCircle2,
  X,
  Volume2,
} from 'lucide-react';
import { ScoreAnalysisResult } from '../../services/scoringEngine';
import { getAyahAudioUrl } from '../../data/recitersData';
import { Button } from '../common/Button';

export interface RecordedAyahItem {
  ayahNumber: number;
  audioBlobUrl: string;
  durationSeconds: number;
  scoreResult: ScoreAnalysisResult;
}

interface SetoranResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  surahNumber: number;
  surahName: string;
  reciterId: string;
  results: RecordedAyahItem[];
  onRetry: () => void;
  onMurojaahWeakAyahs: (weakAyahNumbers: number[]) => void;
}

export const SetoranResultModal: React.FC<SetoranResultModalProps> = ({
  isOpen,
  onClose,
  surahNumber,
  surahName,
  reciterId,
  results,
  onRetry,
  onMurojaahWeakAyahs,
}) => {
  const [playingChildAyah, setPlayingChildAyah] = useState<number | null>(null);
  const [playingQariAyah, setPlayingQariAyah] = useState<number | null>(null);
  const audioPlayerRef = React.useRef<HTMLAudioElement | null>(null);

  // Calculate Overall Average Score
  const totalScore = results.reduce((acc, r) => acc + r.scoreResult.overallScore, 0);
  const overallPercentage = results.length > 0 ? Math.round(totalScore / results.length) : 0;
  const weakAyahs = results.filter((r) => r.scoreResult.needsReview);

  useEffect(() => {
    if (isOpen) {
      try {
        confetti({
          particleCount: 90,
          spread: 80,
          origin: { y: 0.5 },
          colors: ['#08B9EF', '#FFD83E', '#81E850', '#B797F6'],
        });
      } catch (e) {}
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const playAudio = (url: string, isChild: boolean, ayahNum: number) => {
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
    }
    const audio = new Audio(url);
    audioPlayerRef.current = audio;

    if (isChild) {
      setPlayingChildAyah(ayahNum);
      setPlayingQariAyah(null);
    } else {
      setPlayingQariAyah(ayahNum);
      setPlayingChildAyah(null);
    }

    audio.play().catch(() => {});
    audio.onended = () => {
      setPlayingChildAyah(null);
      setPlayingQariAyah(null);
    };
    audio.onerror = () => {
      setPlayingChildAyah(null);
      setPlayingQariAyah(null);
    };
  };

  const stopAllAudio = () => {
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
    }
    setPlayingChildAyah(null);
    setPlayingQariAyah(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white border-2 border-[#C9E1ED] rounded-3xl p-5 sm:p-6 max-w-md w-full shadow-2xl relative my-8 animate-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={() => {
            stopAllAudio();
            onClose();
          }}
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-[#EEF8FF] text-[#164C68] flex items-center justify-center hover:bg-slate-200 transition-colors"
        >
          <X size={18} />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-5">
          <span className="text-xs font-bold text-[#8C9BA7] uppercase tracking-wider">
            SETORAN SELESAI
          </span>
          <h2 className="text-2xl font-black text-[#164C68] font-heading mt-0.5">
            {surahName}
          </h2>
          <p className="text-xs text-[#8C9BA7] font-medium">
            Alhamdulillah! Rekaman hafalanmu telah dievaluasi.
          </p>
        </div>

        {/* Overall Score Circle Card */}
        <div className="bg-gradient-to-r from-cyan-50 to-blue-50 border-2 border-[#C9E1ED] rounded-3xl p-5 mb-5 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-[#8C9BA7] uppercase">Skor Kelancaran</span>
            <div className="text-4xl font-black text-[#08B9EF] font-heading mt-1">
              {overallPercentage}%
            </div>
            <p className="text-xs font-bold text-emerald-600 mt-1">
              {overallPercentage >= 80 ? 'Masya Allah, Sangat Baik!' : 'Bagus! Perlu Sedikit Murojaah'}
            </p>
          </div>

          <div className="bg-white rounded-2xl p-3 border border-[#C9E1ED] text-center shadow-xs">
            <span className="text-[11px] font-bold text-amber-600 block">Reward</span>
            <div className="flex items-center gap-1 text-lg font-black text-amber-700 font-heading">
              <Star size={18} className="fill-yellow-400 text-yellow-500" />
              <span>+10</span>
            </div>
            <span className="text-[10px] text-cyan-600 font-bold block">+30 XP</span>
          </div>
        </div>

        {/* Ayah Breakdown List */}
        <div className="space-y-3 mb-6 max-h-[300px] overflow-y-auto pr-1">
          <span className="text-xs font-bold text-[#8C9BA7] uppercase tracking-wider block">
            DETAIL PER AYAT & BANDINGKAN SUARA
          </span>

          {results.map((item) => {
            const isChildPlaying = playingChildAyah === item.ayahNumber;
            const isQariPlaying = playingQariAyah === item.ayahNumber;
            const qariAudioUrl = getAyahAudioUrl(reciterId, surahNumber, item.ayahNumber);
            const score = item.scoreResult.overallScore;

            return (
              <div
                key={item.ayahNumber}
                className={`p-3.5 rounded-2xl border transition-all ${
                  item.scoreResult.needsReview
                    ? 'bg-amber-50/50 border-amber-200'
                    : 'bg-[#EEF8FF]/50 border-[#C9E1ED]'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-[#164C68] text-white text-xs font-black flex items-center justify-center">
                      {item.ayahNumber}
                    </span>
                    <span className="text-xs font-bold text-[#164C68]">
                      Ayat {item.ayahNumber}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-black px-2 py-0.5 rounded-full ${
                        score >= 80
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {score}%
                    </span>
                  </div>
                </div>

                {/* Compare Audio Listeners: Child vs Qari */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    onClick={() => playAudio(item.audioBlobUrl, true, item.ayahNumber)}
                    className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                      isChildPlaying
                        ? 'bg-cyan-500 text-white border-cyan-600'
                        : 'bg-white text-[#164C68] border-[#C9E1ED] hover:bg-slate-50'
                    }`}
                  >
                    {isChildPlaying ? <Pause size={14} /> : <Play size={14} className="fill-current" />}
                    <span>Rekamanmu ({item.durationSeconds}s)</span>
                  </button>

                  <button
                    onClick={() => playAudio(qariAudioUrl, false, item.ayahNumber)}
                    className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                      isQariPlaying
                        ? 'bg-purple-500 text-white border-purple-600'
                        : 'bg-white text-purple-700 border-purple-200 hover:bg-purple-50'
                    }`}
                  >
                    {isQariPlaying ? <Pause size={14} /> : <Volume2 size={14} />}
                    <span>Qari ({item.scoreResult.referenceDurationSeconds}s)</span>
                  </button>
                </div>

                {item.scoreResult.needsReview && (
                  <p className="text-[11px] text-amber-700 font-semibold mt-2 flex items-center gap-1">
                    <AlertTriangle size={12} /> Disarankan untuk murojaah lagi ayat ini
                  </p>
                )}
              </div>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 pt-1 border-t border-slate-100">
          {weakAyahs.length > 0 && (
            <Button
              variant="purple"
              size="md"
              fullWidth
              onClick={() => {
                stopAllAudio();
                onMurojaahWeakAyahs(weakAyahs.map((w) => w.ayahNumber));
              }}
              icon={<RotateCcw size={18} />}
            >
              Murojaah {weakAyahs.length} Ayat Lemah
            </Button>
          )}

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="md"
              fullWidth
              onClick={() => {
                stopAllAudio();
                onRetry();
              }}
              icon={<RotateCcw size={16} />}
            >
              Ulangi Setoran
            </Button>

            <Button
              variant="green"
              size="md"
              fullWidth
              onClick={() => {
                stopAllAudio();
                onClose();
              }}
              icon={<CheckCircle2 size={18} />}
            >
              Selesai ✓
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
