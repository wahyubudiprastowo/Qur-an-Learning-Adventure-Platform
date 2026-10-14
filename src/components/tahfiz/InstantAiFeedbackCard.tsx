import React, { useState } from 'react';
import {
  Sparkles,
  Volume2,
  Play,
  Pause,
  RotateCcw,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  BookOpen,
  HelpCircle,
  Activity,
  Award,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { AiCorrectionResult } from '../../types';

interface InstantAiFeedbackCardProps {
  correction: AiCorrectionResult;
  ayahNumber: number;
  surahName: string;
  targetArabicText: string;
  onPlayQari: () => void;
  onPlayChildAudio?: () => void;
  isPlayingChildAudio?: boolean;
  onRetryRecording: () => void;
  onNextAyah?: () => void;
  isLastAyah?: boolean;
  onToggleD3?: () => void;
  isD3Open?: boolean;
}

export const InstantAiFeedbackCard: React.FC<InstantAiFeedbackCardProps> = ({
  correction,
  ayahNumber,
  surahName,
  targetArabicText,
  onPlayQari,
  onPlayChildAudio,
  isPlayingChildAudio = false,
  onRetryRecording,
  onNextAyah,
  isLastAyah = false,
  onToggleD3,
  isD3Open = false,
}) => {
  const [showDetailedTips, setShowDetailedTips] = useState<boolean>(true);
  const [showRubricStandard, setShowRubricStandard] = useState<boolean>(false);

  const isPassed = !!correction.isPassed && correction.overallScore >= 70;
  const isMumtaz = correction.grade === 'mumtaz' || correction.overallScore >= 85;
  const isJayyid = !isMumtaz && (correction.grade === 'jayyid' || correction.overallScore >= 70);

  // Dynamic Encouragement Emoji
  const emoji = correction.encouragementEmoji || (isMumtaz ? '🌟' : isJayyid ? '👍' : '💪');

  // Title & cheer messages
  const titleText = isMumtaz
    ? 'Masya Allah, Mumtaz Sempurna! 🎉'
    : isJayyid
    ? 'Alhamdulillah, Lulus Baik (Jayyid)! 👏'
    : 'Tetap Semangat Ananda! 🤲';

  const subtitleText = isMumtaz
    ? `Hafalan Ayat ${ayahNumber} sangat fasih, tartil, dan memenuhi kaidah tajwid!`
    : isJayyid
    ? `Hafalan Ayat ${ayahNumber} sudah lancar dengan perbaikan minor pada tajwid.`
    : `Sedikit lagi mutqin! Yuk perhatikan tips makhraj & tajwid dari Ustadz AI berikut:`;

  // Star Rating (5 for Mumtaz, 4 for Jayyid, 2-3 for Perlu Ulang)
  const starCount = isMumtaz ? 5 : isJayyid ? 4 : correction.overallScore >= 40 ? 3 : 2;

  // Fallback makhraj tips if not provided by backend
  const makhrajTips = correction.makhrajTips && correction.makhrajTips.length > 0
    ? correction.makhrajTips
    : isPassed
    ? [
        'Pertahankan kejelasan makhraj huruf halq (tenggorokan) dan lisan (lidah).',
        'Jaga konsistensi ketukan mad thabi\'i (2 harakat) dan ghunnah saat menyambung ayat.',
      ]
    : [
        'Keluarkan suara lantang dari rongga mulut (Jauf) agar makharijul huruf terdengar tegas.',
        'Dengarkan contoh qari dan perhatikan ketukan mad serta tasydid sebelum menyetor ulang.',
      ];

  return (
    <div
      className={`rounded-3xl border-2 p-5 text-left shadow-md transition-all duration-300 animate-in fade-in slide-in-from-top-3 ${
        isMumtaz
          ? 'bg-gradient-to-br from-emerald-50 via-teal-50/90 to-cyan-50 border-emerald-300'
          : isJayyid
          ? 'bg-gradient-to-br from-sky-50 via-cyan-50/90 to-teal-50 border-sky-300'
          : 'bg-gradient-to-br from-amber-50 via-orange-50/70 to-yellow-50 border-amber-300'
      }`}
    >
      {/* 1. Header Instant Reaction with Big Animated Emoji */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          {/* Animated Emoji Badge */}
          <div
            className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-sm select-none shrink-0 transition-transform hover:scale-110 active:scale-95 ${
              isPassed
                ? 'bg-gradient-to-tr from-emerald-400 to-teal-300 text-white shadow-emerald-500/20 ring-4 ring-emerald-100'
                : 'bg-gradient-to-tr from-amber-400 to-orange-400 text-white shadow-amber-500/20 ring-4 ring-amber-100'
            }`}
          >
            <span className="inline-block transform animate-bounce duration-1000">
              {emoji}
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3
                className={`font-black text-sm md:text-base leading-snug ${
                  isMumtaz
                    ? 'text-emerald-950'
                    : isJayyid
                    ? 'text-sky-950'
                    : 'text-amber-950'
                }`}
              >
                {titleText}
              </h3>

              <span
                className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border shadow-2xs ${
                  isMumtaz
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                    : isJayyid
                    ? 'bg-sky-100 text-sky-800 border-sky-300'
                    : 'bg-amber-100 text-amber-900 border-amber-300'
                }`}
              >
                {isMumtaz ? '🌟 Mumtaz' : isJayyid ? '👍 Jayyid' : '⚠️ Perlu Latihan'}
              </span>
            </div>

            <p className="text-xs text-slate-700 mt-0.5 leading-relaxed">
              {subtitleText}
            </p>

            {/* Visual Star Rating */}
            <div className="flex items-center gap-1 mt-1.5">
              {[1, 2, 3, 4, 5].map((starIdx) => (
                <span
                  key={starIdx}
                  className={`text-sm transition-transform ${
                    starIdx <= starCount
                      ? 'text-amber-400 drop-shadow-xs scale-105'
                      : 'text-slate-300 opacity-60'
                  }`}
                >
                  ★
                </span>
              ))}
              <span className="text-[11px] font-bold text-slate-600 ml-1">
                ({isPassed ? `${correction.overallScore}% Lulus Mutqin` : `${correction.overallScore}% Belum Lulus`})
              </span>
            </div>
          </div>
        </div>

        {/* Overall Score Badge */}
        <div
          className={`shrink-0 px-3.5 py-2 rounded-2xl border text-center shadow-2xs ${
            isPassed
              ? 'bg-white/95 border-emerald-300 text-emerald-700'
              : 'bg-white/95 border-amber-300 text-amber-700'
          }`}
        >
          <span className="block text-[9px] font-black uppercase tracking-wider text-slate-500">
            Skor Total
          </span>
          <span className="text-xl md:text-2xl font-black font-mono leading-none">
            {correction.overallScore}%
          </span>
        </div>
      </div>

      {/* 2. Four Metric Score Pills: Akurasi, Tajwid, Makhraj, Kelancaran */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4">
        <div className="bg-white/90 p-2.5 rounded-2xl border border-slate-200/90 text-center shadow-2xs">
          <span className="text-[10px] font-bold text-slate-500 uppercase block">
            Akurasi Lafal
          </span>
          <span className="text-base font-black text-emerald-600">
            {correction.accuracyScore}%
          </span>
        </div>

        <div className="bg-white/90 p-2.5 rounded-2xl border border-slate-200/90 text-center shadow-2xs">
          <span className="text-[10px] font-bold text-slate-500 uppercase block">
            Nilai Tajwid
          </span>
          <span className="text-base font-black text-purple-600">
            {correction.tajwidScore}%
          </span>
        </div>

        <div className="bg-white/90 p-2.5 rounded-2xl border border-slate-200/90 text-center shadow-2xs">
          <span className="text-[10px] font-bold text-slate-500 uppercase block">
            Nilai Makhraj
          </span>
          <span className="text-base font-black text-amber-600">
            {correction.makhrajScore ?? Math.round(correction.tajwidScore * 0.98)}%
          </span>
        </div>

        <div className="bg-white/90 p-2.5 rounded-2xl border border-slate-200/90 text-center shadow-2xs">
          <span className="text-[10px] font-bold text-slate-500 uppercase block">
            Kelancaran
          </span>
          <span className="text-base font-black text-sky-600">
            {correction.fluencyScore}%
          </span>
        </div>
      </div>

      {/* Baseline Consistency Bar */}
      {correction.baselineComparison && (
        <div className="mt-2.5 p-3 bg-white/95 rounded-2xl border border-cyan-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-cyan-50 border border-cyan-200 flex items-center justify-center text-sm shrink-0">
              🎯
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase block">
                Konsistensi vs Baseline Santri
              </span>
              <span className="font-black text-[#164C68]">
                Tajwid: {correction.baselineComparison.tajwidConsistency}% · Makhraj: {correction.baselineComparison.makhrajConsistency}%
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap justify-end">
            <span
              className={`text-[10px] font-black px-2.5 py-1 rounded-full border ${
                correction.baselineComparison.trend === 'improving'
                  ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                  : correction.baselineComparison.trend === 'needs_practice'
                  ? 'bg-amber-100 text-amber-900 border-amber-300'
                  : 'bg-sky-100 text-sky-800 border-sky-300'
              }`}
            >
              {correction.baselineComparison.trend === 'improving'
                ? '📈 Tren Meningkat'
                : correction.baselineComparison.trend === 'needs_practice'
                ? '🎯 Butuh Pemantapan'
                : '⚖️ Konsisten Stabil'}
            </span>
            <span className="font-mono text-xs font-black text-cyan-800 bg-cyan-100/70 px-2 py-0.5 rounded-lg">
              {correction.consistencyScore ?? correction.baselineComparison.overallConsistency}% Konsisten
            </span>
          </div>
        </div>
      )}

      {/* 3. Feedback from Ustadz AI */}
      <div className="mt-3 bg-white/95 p-3 rounded-2xl border border-slate-200/90 text-xs text-slate-800 leading-relaxed shadow-2xs">
        <div className="flex items-center gap-1.5 font-bold text-[#164C68] mb-1">
          <Award size={14} className="text-[#08B9EF]" />
          <span>Koreksi Dewan Penguji Ustadz AI:</span>
        </div>
        <p className="italic text-slate-700">
          "{correction.feedback}"
        </p>

        {correction.correctedLafal && (
          <div className="mt-2 pt-2 border-t border-slate-100 flex items-center gap-2 flex-wrap text-xs">
            <span className="font-bold text-emerald-800">Lafal Target Seharusnya:</span>
            <span className="font-arabic text-sm text-emerald-900 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
              {correction.correctedLafal}
            </span>
          </div>
        )}
      </div>

      {/* 4. Tips Makhraj & Tajwid Guidance Section */}
      <div className="mt-3 space-y-2">
        <button
          type="button"
          onClick={() => setShowDetailedTips((prev) => !prev)}
          className="w-full flex items-center justify-between text-xs font-bold text-[#164C68] px-1 py-0.5 cursor-pointer hover:text-sky-700 transition-colors"
        >
          <span className="flex items-center gap-1.5">
            <BookOpen size={14} className="text-amber-500" />
            <span>Tips Makhraj & Panduan Tajwid Spesifik ({makhrajTips.length + (correction.tajwidNotes?.length || 0)} Catatan)</span>
          </span>
          {showDetailedTips ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>

        {showDetailedTips && (
          <div className="space-y-2 animate-in fade-in duration-200">
            {/* Makhraj Tips Box */}
            <div className="bg-amber-50/90 border border-amber-200/90 rounded-2xl p-3 space-y-1.5 shadow-2xs">
              <span className="text-[11px] font-black text-amber-900 flex items-center gap-1.5">
                <span>🗣️ Tips Makharijul Huruf (Tempat Keluarnya Huruf):</span>
              </span>
              <ul className="text-xs text-amber-950 space-y-1 list-disc list-inside">
                {makhrajTips.map((tip, idx) => (
                  <li key={idx} className="leading-relaxed">
                    {tip}
                  </li>
                ))}
              </ul>
            </div>

            {/* Tajwid Notes Box (if available) */}
            {correction.tajwidNotes && correction.tajwidNotes.length > 0 && (
              <div className="bg-purple-50/90 border border-purple-200/90 rounded-2xl p-3 space-y-1.5 shadow-2xs">
                <span className="text-[11px] font-black text-purple-900 flex items-center gap-1.5">
                  <span>〰️ Catatan Kaidah Tajwid:</span>
                </span>
                <ul className="text-xs text-purple-950 space-y-1 list-disc list-inside">
                  {correction.tajwidNotes.map((note, idx) => (
                    <li key={idx} className="leading-relaxed">
                      {note}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Standar Nilai Tartil & Rubrik Terbuka (Anti-Ngaco) */}
      <div className="mt-2.5">
        <button
          type="button"
          onClick={() => setShowRubricStandard((prev) => !prev)}
          className="w-full flex items-center justify-between text-[11px] font-bold text-slate-600 bg-white/70 hover:bg-white px-3 py-2 rounded-xl border border-slate-200/80 cursor-pointer transition-colors"
        >
          <span className="flex items-center gap-1.5 text-[#164C68] font-black">
            <span>📐</span>
            <span>Standar Nilai Tartil & Rubrik Terbuka (Anti-Ngaco)</span>
          </span>
          <span className="text-[10px] text-slate-500 font-semibold flex items-center gap-1">
            <span>{showRubricStandard ? 'Tutup Rubrik' : 'Lihat Bobot 40:35:25'}</span>
            {showRubricStandard ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </span>
        </button>

        {showRubricStandard && (
          <div className="mt-2 p-3.5 bg-white/95 rounded-2xl border border-emerald-200/90 shadow-2xs space-y-2 text-xs text-slate-700 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
              <span className="font-black text-[#164C68] text-[11px] uppercase tracking-wider flex items-center gap-1">
                <span>⚖️</span>
                <span>Panduan Terstandar Dewan Penguji:</span>
              </span>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                Ambang Lulus: ≥ 70% Mutqin
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-[11px]">
              <div className="p-2.5 rounded-xl bg-emerald-50/80 border border-emerald-200">
                <span className="font-black text-emerald-900 block text-[10px] uppercase">
                  Akurasi Lafal (40%)
                </span>
                <span className="text-slate-600 text-[10px] leading-tight block mt-0.5">
                  Memastikan seluruh huruf dan kata ayat target terbaca tuntas tanpa terlewat.
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-purple-50/80 border border-purple-200">
                <span className="font-black text-purple-900 block text-[10px] uppercase">
                  Tajwid & Makhraj (35%)
                </span>
                <span className="text-slate-600 text-[10px] leading-tight block mt-0.5">
                  Memvalidasi makhraj (Halq, Lisan, Syafatain), mad 2 harakat, dengung ghunnah, dan qolqolah.
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-sky-50/80 border border-sky-200">
                <span className="font-black text-sky-900 block text-[10px] uppercase">
                  Kelancaran & Ritme (25%)
                </span>
                <span className="text-slate-600 text-[10px] leading-tight block mt-0.5">
                  Ritme membaca tartil teratur disesuaikan dengan usia anak (4–7 thn tempo perlahan, 8–11 thn sedang).
                </span>
              </div>
            </div>

            <div className="p-2 rounded-xl bg-amber-50/90 border border-amber-200 text-amber-950 text-[10px] leading-relaxed">
              <strong>Anti-Ngaco & Suara Hening:</strong> Skor kelulusan mutqin minimal 70% (Jayyid 70–84%, Mumtaz 85–100%). Rekaman tanpa suara ayat target (hening, noise, atau obrolan santai) otomatis diberi skor rendah (15–35) dan tidak dapat lulus.
            </div>
          </div>
        )}
      </div>

      {/* 5. Quick Action Toolbar: Qari Audio, Own Audio, Retry, Next */}
      <div className="mt-4 pt-3 border-t border-slate-200/70 flex items-center gap-2 flex-wrap">
        {/* Play Qari Guidance */}
        <button
          type="button"
          onClick={onPlayQari}
          className="flex-1 min-w-[140px] py-2.5 px-3 rounded-2xl bg-white border border-[#C9E1ED] hover:bg-slate-50 text-[#164C68] text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs transition-all active:scale-98"
          title="Dengarkan contoh pelafalan tartil Qari Mualim"
        >
          <Volume2 size={15} className="text-amber-500" />
          <span>Dengar Contoh Qari</span>
        </button>

        {/* Play Own Voice */}
        {onPlayChildAudio && (
          <button
            type="button"
            onClick={onPlayChildAudio}
            className="flex-1 min-w-[140px] py-2.5 px-3 rounded-2xl bg-white border border-[#C9E1ED] hover:bg-slate-50 text-[#164C68] text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs transition-all active:scale-98"
            title="Dengarkan rekaman suara saya sendiri"
          >
            {isPlayingChildAudio ? (
              <Pause size={15} className="text-rose-500" />
            ) : (
              <Play size={15} className="text-[#08B9EF] fill-current" />
            )}
            <span>{isPlayingChildAudio ? 'Jeda Suara' : 'Dengar Rekamanku'}</span>
          </button>
        )}

        {/* Re-record Button */}
        <button
          type="button"
          onClick={onRetryRecording}
          className={`py-2.5 px-3.5 rounded-2xl font-black text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs transition-all active:scale-98 ${
            !isPassed
              ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/20'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
          }`}
          title="Rekam ulang ayat ini untuk memperbaiki hafalan"
        >
          <RotateCcw size={14} />
          <span>{isPassed ? 'Rekam Lagi' : 'Ulangi Rekaman 🔄'}</span>
        </button>

        {/* Next Ayah Button (If passed) */}
        {isPassed && onNextAyah && (
          <button
            type="button"
            onClick={onNextAyah}
            className="py-2.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-xs shadow-md shadow-emerald-500/20 flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-98 ml-auto"
            title="Lanjut ke ayat berikutnya"
          >
            <span>{isLastAyah ? 'Selesai Surah 🏁' : 'Lanjut Ayat Berikutnya'}</span>
            <ArrowRight size={14} />
          </button>
        )}
      </div>

      {/* 6. D3 Accuracy Visualizer Button */}
      {onToggleD3 && (
        <button
          type="button"
          onClick={onToggleD3}
          className={`w-full mt-3 py-2 px-3 rounded-2xl border text-[11px] font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs transition-all ${
            isD3Open
              ? 'bg-purple-900 text-white border-purple-950 shadow-sm'
              : 'bg-white/80 border-purple-200 hover:bg-purple-50 text-purple-900'
          }`}
        >
          <Activity size={13} className={isD3Open ? 'text-white' : 'text-purple-600'} />
          <span>{isD3Open ? 'Tutup Visualisasi D3 Tartil' : 'Lihat Analisis Gelombang & Akurasi D3.js vs Mualim ⭐'}</span>
        </button>
      )}
    </div>
  );
};
