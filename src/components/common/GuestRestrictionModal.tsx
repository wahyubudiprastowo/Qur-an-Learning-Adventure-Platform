import React from 'react';
import {
  X,
  Sparkles,
  Lock,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

import { PLAN_LIMITS } from '../../data/planFeatures';

interface GuestRestrictionModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  featureName?: string;
  onOpenAuth: (mode: 'login' | 'register') => void;
}

export const GuestRestrictionModal: React.FC<GuestRestrictionModalProps> = ({
  isOpen,
  onClose,
  title = 'Buka Seluruh Fitur dengan Akun Gratis',
  description = `Saat ini kamu berada di Mode Tamu. Yuk daftar gratis dalam 5 detik untuk membuka ${PLAN_LIMITS.FREE_SURAHS} Surah Juz 30 (Ad-Duha s/d An-Nas) & ${PLAN_LIMITS.IQRA_FREE_PAGES} halaman Iqra 1 serta menyimpan hafalanmu selamanya di cloud!`,
  featureName = 'Fitur Ini Memerlukan Akun Terdaftar',
  onOpenAuth,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-white rounded-3xl border-2 border-emerald-200 shadow-2xl overflow-hidden p-6 text-center space-y-4 animate-in zoom-in-95 duration-200 relative font-sans"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
        >
          <X size={16} />
        </button>

        {/* Friendly Mosque Icon */}
        <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-white flex items-center justify-center text-3xl mx-auto shadow-md">
          🕌
        </div>

        <div className="space-y-1.5">
          <span className="inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300">
            {featureName}
          </span>
          <h3 className="text-lg font-black text-[#164C68] font-heading">
            {title}
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed font-medium">
            {description}
          </p>
        </div>

        {/* Benefits Checklist */}
        <div className="bg-[#EEF8FF] border border-[#C9E1ED] rounded-2xl p-3 text-left space-y-2 text-xs text-[#164C68] font-bold">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
            <span>Gratis 100% — Tanpa biaya tersembunyi</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
            <span>
              Buka {PLAN_LIMITS.IQRA_FREE_PAGES} halaman penuh Iqra 1 & {PLAN_LIMITS.FREE_SURAHS} Surah Juz 30 (Gratis Penuh)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
            <span>Riwayat hafalan & bintang santri tersimpan aman di cloud</span>
          </div>
        </div>

        {/* Registration Options Buttons */}
        <div className="space-y-2 pt-1">
          <button
            onClick={() => {
              onClose();
              onOpenAuth('register');
            }}
            className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-xs flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer active:scale-98"
          >
            <span>Daftar Gratis via Google (Gmail) / WhatsApp</span>
            <ArrowRight size={15} />
          </button>

          <button
            onClick={onClose}
            className="w-full py-2 px-3 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
          >
            Lanjut Coba Fitur Tamu Saja
          </button>
        </div>
      </div>
    </div>
  );
};
