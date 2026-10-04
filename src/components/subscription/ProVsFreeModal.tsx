import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Check,
  Sparkles,
  Crown,
  Zap,
  ShieldCheck,
  Award,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { UserAccount, PlanTier } from '../../types';
import { PLAN_FEATURES, PRICING_PLANS } from '../../data/planFeatures';
import { StorageService } from '../../services/storageService';

interface ProVsFreeModalProps {
  isOpen: boolean;
  onClose: () => void;
  userAccount: UserAccount;
  onPlanChanged: (updatedAccount: UserAccount) => void;
}

export const ProVsFreeModal: React.FC<ProVsFreeModalProps> = ({
  isOpen,
  onClose,
  userAccount,
  onPlanChanged,
}) => {
  const [selectedPlanTab, setSelectedPlanTab] = useState<'comparison' | 'pricing'>('comparison');
  const [activePlan, setActivePlan] = useState<PlanTier>(userAccount.planTier || 'free');
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleTogglePlan = (tier: PlanTier) => {
    const updated = StorageService.setPlanTier(tier);
    setActivePlan(tier);
    if (tier === 'pro') {
      try {
        confetti({
          particleCount: 50,
          spread: 80,
          origin: { y: 0.5 },
          colors: ['#F59E0B', '#10B981', '#38BDF8', '#8B5CF6'],
        });
      } catch {
        // Ignore
      }
      setFeedbackMessage('MasyaAllah! Akun Pro berhasil diaktifkan. Semua fitur 30 Juz & AI kini terbuka!');
    } else {
      setFeedbackMessage('Akun kembali ke Paket Free Dasar.');
    }
    onPlanChanged(updated);
    setTimeout(() => setFeedbackMessage(null), 3500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="bg-white border-2 border-[#C9E1ED] rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl relative overflow-hidden font-sans"
      >
        {/* Top Header Banner */}
        <div className="bg-gradient-to-r from-[#0F172A] via-[#1E293B] to-[#0F172A] text-white p-5 sm:p-6 shrink-0 relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-36 h-36 bg-[#22C55E]/20 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-36 h-36 bg-amber-400/15 rounded-full blur-2xl pointer-events-none" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 flex items-center justify-center cursor-pointer transition-colors"
          >
            <X size={16} />
          </button>

          <div className="flex items-center gap-2 mb-2">
            <span className="text-amber-400 text-xl">👑</span>
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 bg-amber-400/10 px-2.5 py-0.5 rounded-full border border-amber-400/20">
              Klasifikasi Fitur
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black font-heading tracking-tight text-white">
            Perbandingan Fitur <span className="text-[#22C55E]">FREE</span> vs <span className="text-amber-400">PRO</span>
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-lg leading-relaxed">
            Transparansi penuh: nikmati materi dasar Juz 30 gratis selamanya, atau buka akses tanpa batas 30 Juz & seluruh AI untuk keluarga.
          </p>

          {/* Active status & quick switch toggle */}
          <div className="mt-4 pt-3 border-t border-slate-700/60 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Status Akunmu:</span>
              <span
                className={`text-xs font-black px-2.5 py-0.5 rounded-full border ${
                  activePlan === 'pro'
                    ? 'bg-amber-400 text-amber-950 border-amber-300 shadow-xs'
                    : 'bg-[#22C55E]/20 text-[#22C55E] border-[#22C55E]/40'
                }`}
              >
                {activePlan === 'pro' ? '⭐ PRO MEMBER' : '🌱 FREE PLAN'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleTogglePlan(activePlan === 'pro' ? 'free' : 'pro')}
                className={`px-3 py-1.5 rounded-xl text-xs font-extrabold cursor-pointer transition-all shadow-xs flex items-center gap-1.5 ${
                  activePlan === 'pro'
                    ? 'bg-slate-800 text-slate-300 hover:text-white border border-slate-700'
                    : 'bg-gradient-to-r from-amber-400 to-yellow-400 text-amber-950 hover:brightness-105'
                }`}
              >
                <Zap size={13} className={activePlan === 'pro' ? 'text-slate-400' : 'text-amber-950 fill-current'} />
                <span>{activePlan === 'pro' ? 'Beralih ke Free' : 'Uji Coba Mode PRO'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Feedback Alert */}
        {feedbackMessage && (
          <div className="bg-emerald-50 border-b border-emerald-200 px-5 py-2 text-xs text-emerald-800 font-bold flex items-center gap-2">
            <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
            <span>{feedbackMessage}</span>
          </div>
        )}

        {/* Navigation Tabs (Perbandingan Tabel vs Pilihan Paket) */}
        <div className="border-b border-[#C9E1ED] px-5 pt-3 pb-0 flex items-center gap-4 bg-slate-50/70">
          <button
            onClick={() => setSelectedPlanTab('comparison')}
            className={`pb-2.5 text-xs font-black tracking-tight border-b-2 transition-all cursor-pointer ${
              selectedPlanTab === 'comparison'
                ? 'border-[#08B9EF] text-[#164C68]'
                : 'border-transparent text-[#8C9BA7] hover:text-[#164C68]'
            }`}
          >
            📋 Tabel Perbandingan Lengkap
          </button>
          <button
            onClick={() => setSelectedPlanTab('pricing')}
            className={`pb-2.5 text-xs font-black tracking-tight border-b-2 transition-all cursor-pointer ${
              selectedPlanTab === 'pricing'
                ? 'border-[#08B9EF] text-[#164C68]'
                : 'border-transparent text-[#8C9BA7] hover:text-[#164C68]'
            }`}
          >
            💎 Pilihan Paket & Investasi
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* --- TAB 1: COMPARISON TABLE --- */}
          {selectedPlanTab === 'comparison' && (
            <div className="space-y-3">
              <div className="border border-[#C9E1ED] rounded-2xl overflow-hidden shadow-xs">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#EEF8FF] border-b border-[#C9E1ED]">
                      <th className="p-3 font-black text-[#164C68] w-2/5">Fitur & Layanan</th>
                      <th className="p-3 font-black text-[#164C68] text-center w-[30%]">
                        <span className="text-[#22C55E]">🌱 Paket FREE</span>
                      </th>
                      <th className="p-3 font-black text-amber-800 bg-amber-50/60 text-center w-[30%]">
                        <span className="flex items-center justify-center gap-1">
                          <Crown size={13} className="text-amber-500" />
                          <span>Paket PRO</span>
                        </span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#C9E1ED]/60">
                    {PLAN_FEATURES.map((item) => (
                      <tr
                        key={item.id}
                        className={`hover:bg-cyan-50/40 transition-colors ${
                          item.isProHighlight ? 'bg-amber-50/20' : ''
                        }`}
                      >
                        <td className="p-3">
                          <div className="font-extrabold text-[#164C68]">{item.name}</div>
                          <div className="text-[10px] text-[#8C9BA7] leading-tight mt-0.5">
                            {item.description}
                          </div>
                        </td>
                        <td className="p-3 text-center font-bold text-[#164C68] bg-white">
                          <span className="text-[11px] block">{item.freeValue}</span>
                        </td>
                        <td className="p-3 text-center font-black text-amber-950 bg-amber-50/40">
                          <span className="text-[11px] block text-emerald-700 bg-emerald-100/70 py-0.5 px-1.5 rounded-lg border border-emerald-300">
                            {item.proValue}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* --- TAB 2: PRICING CARDS --- */}
          {selectedPlanTab === 'pricing' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {PRICING_PLANS.map((plan) => {
                const isSelected = (plan.id === 'free' && activePlan === 'free') || (plan.id !== 'free' && activePlan === 'pro');

                return (
                  <div
                    key={plan.id}
                    className={`rounded-2xl border-2 p-4 flex flex-col justify-between transition-all relative ${
                      plan.highlight
                        ? 'border-amber-400 bg-gradient-to-b from-amber-50/80 to-white shadow-md'
                        : isSelected
                        ? 'border-[#08B9EF] bg-cyan-50/40'
                        : 'border-[#C9E1ED] bg-white hover:border-slate-300'
                    }`}
                  >
                    {plan.badge && (
                      <span className="absolute -top-2.5 right-3 text-[9px] font-black uppercase tracking-wider bg-amber-400 text-amber-950 px-2 py-0.2 rounded-full shadow-xs">
                        {plan.badge}
                      </span>
                    )}

                    <div className="space-y-2">
                      <h4 className="text-sm font-black text-[#164C68] font-heading">{plan.name}</h4>
                      <div className="flex items-baseline gap-1">
                        <span className="text-xl font-black text-[#164C68]">{plan.priceText}</span>
                        <span className="text-[10px] text-[#8C9BA7] font-medium">{plan.periodText}</span>
                      </div>
                      <p className="text-[11px] text-[#8C9BA7] leading-relaxed">{plan.description}</p>
                    </div>

                    <button
                      onClick={() => handleTogglePlan(plan.id === 'free' ? 'free' : 'pro')}
                      className={`w-full mt-4 py-2 px-3 rounded-xl text-xs font-black transition-all cursor-pointer ${
                        plan.highlight
                          ? 'bg-gradient-to-r from-amber-400 to-yellow-400 text-amber-950 shadow-xs hover:brightness-105 active:scale-95'
                          : plan.id === 'free'
                          ? 'bg-slate-100 hover:bg-slate-200 text-[#164C68]'
                          : 'bg-[#08B9EF] hover:bg-[#07a6d7] text-white'
                      }`}
                    >
                      {isSelected ? '✓ Sedang Aktif' : plan.ctaText}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-[#C9E1ED] flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
            <ShieldCheck size={16} className="text-[#22C55E]" />
            <span>Garansi akses aman & tanpa perpanjangan otomatis tersembunyi</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white border border-[#C9E1ED] hover:bg-slate-100 text-[#164C68] font-bold cursor-pointer transition-all"
          >
            Tutup
          </button>
        </div>
      </motion.div>
    </div>
  );
};
