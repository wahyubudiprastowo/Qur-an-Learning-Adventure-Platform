import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Check,
  Sparkles,
  Crown,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  Users,
  BookOpen,
} from 'lucide-react';
import { UserAccount, PlanTier } from '../../types';
import { StorageService } from '../../services/storageService';
import { CHECKOUT_PLANS } from './PaymentCheckoutModal';

interface ProVsFreeModalProps {
  isOpen: boolean;
  onClose: () => void;
  userAccount: UserAccount;
  onPlanChanged: (updatedAccount: UserAccount) => void;
  onOpenCheckout: (planId: string) => void;
}

export const ProVsFreeModal: React.FC<ProVsFreeModalProps> = ({
  isOpen,
  onClose,
  userAccount,
  onPlanChanged,
  onOpenCheckout,
}) => {
  const [selectedPlanId, setSelectedPlanId] = useState<string>('1_year');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  if (!isOpen) return null;

  const handleOpenPayment = () => {
    onClose();
    onOpenCheckout(selectedPlanId);
  };

  const handleDowngradeToFree = () => {
    const updated = StorageService.setPlanTier('free');
    onPlanChanged(updated);
    alert('Akun telah beralih ke Paket Free.');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 15 }}
        className="bg-white rounded-3xl border border-[#C9E1ED] shadow-2xl max-w-3xl w-full overflow-hidden my-4 relative font-sans"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer"
        >
          <X size={16} />
        </button>

        {/* TOP HEADER MATCHING SCREENSHOT 2 */}
        <div className="pt-8 pb-5 px-6 text-center space-y-2 bg-gradient-to-b from-amber-50/50 via-white to-white">
          <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-300 text-white flex items-center justify-center text-3xl mx-auto shadow-md ring-4 ring-amber-100">
            👑
          </div>

          <h2 className="text-2xl sm:text-3xl font-black font-heading text-amber-500 tracking-tight">
            Cahaya Tahfiz Premium
          </h2>

          {/* Social Proof Pill Badges */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold">
              <Users size={13} className="text-[#08B9EF]" />
              <span>500.000+ santri/pelajar</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold">
              <BookOpen size={13} className="text-emerald-500" />
              <span>50 juta+ hafalan selesai</span>
            </span>
          </div>

          <p className="text-sm font-bold text-slate-700 pt-1">
            Buka semuanya — belajar 10x lebih cepat
          </p>
        </div>

        {/* MAIN BODY: 2 Columns matching Screenshot 2 */}
        <div className="p-5 sm:p-6 grid grid-cols-1 md:grid-cols-12 gap-6 border-t border-slate-100">
          {/* LEFT COLUMN: 4 Plan Options Radio Cards */}
          <div className="md:col-span-6 space-y-2.5">
            {CHECKOUT_PLANS.map((plan) => {
              const isSelected = selectedPlanId === plan.id;
              return (
                <div
                  key={plan.id}
                  onClick={() => setSelectedPlanId(plan.id)}
                  className={`relative p-3.5 sm:p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? 'border-amber-400 bg-amber-50/30 ring-2 ring-amber-400/40 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  {/* Paling Hemat / Diskon Badge */}
                  {plan.discountPercent && (
                    <span className="absolute -top-2.5 left-4 bg-amber-500 text-white font-black text-[9px] px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 shadow-xs">
                      <span>✨</span>
                      <span>PALING HEMAT -{plan.discountPercent}%</span>
                    </span>
                  )}

                  <div className="flex items-center gap-3">
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                        isSelected
                          ? 'border-amber-500 bg-amber-500 text-white'
                          : 'border-slate-300 bg-white'
                      }`}
                    >
                      {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                    </div>

                    <div>
                      <h4 className="font-heading font-black text-[#164C68] text-sm sm:text-base leading-tight">
                        {plan.durationMonths === 999 ? 'Seumur hidup' : `${plan.durationMonths} bulan`}
                      </h4>
                      {plan.monthlyEquivalentIdr !== 'Sekali bayar' && (
                        <p className="text-[10px] text-slate-500 font-medium">
                          ~ Rp {plan.monthlyEquivalentIdr.replace('Rp ', '')}/bulan
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Price */}
                  <div className="text-right">
                    <span className="font-heading font-black text-slate-900 text-base sm:text-lg block">
                      Rp {plan.priceIdr.toLocaleString('id-ID')}
                    </span>
                    {plan.originalPriceIdr && (
                      <span className="text-[10px] text-slate-400 line-through">
                        Rp {plan.originalPriceIdr.toLocaleString('id-ID')}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Big Action Button */}
            <div className="pt-2">
              <button
                onClick={handleOpenPayment}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-black text-sm shadow-md shadow-indigo-500/25 cursor-pointer flex items-center justify-center gap-2 hover:scale-102 active:scale-98 transition-all"
              >
                <span>👑 Buka sekarang</span>
              </button>

              <div className="flex items-center justify-center gap-4 text-[10px] text-slate-500 font-bold mt-2">
                <span className="flex items-center gap-1 text-emerald-600">
                  <ShieldCheck size={12} />
                  <span>Pembayaran aman</span>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1 text-amber-600">
                  <Sparkles size={12} />
                  <span>Akses instan</span>
                </span>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Manfaat Premium & Testimonial */}
          <div className="md:col-span-6 space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <h3 className="text-sm font-black text-amber-800 flex items-center gap-1.5 font-heading">
                <span className="text-amber-500">✨</span>
                <span>Manfaat Premium</span>
              </h3>

              <div className="space-y-2.5 text-xs text-slate-700">
                {[
                  'Akses tak terbatas ke 8 arena game & seluruh fitur Al-Qur\'an',
                  'Pantau progres belajar & analitik tajwid anak',
                  'Buka semua level mini game & mode PVP cerdas',
                  'Buka fitur voice record setoran tanpa batas',
                  'Kapasitas lebih besar untuk buku hafalan dan catatan',
                  'Mahkota khusus & dekorasi eksklusif Sahabat Lumi',
                  'Dukungan prioritas dari tim pengembang',
                  'Bebas iklan komersial',
                ].map((item, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <div className="w-4 h-4 rounded-full bg-amber-400 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                      <Check size={11} strokeWidth={3} />
                    </div>
                    <span className="font-medium text-slate-700 leading-snug">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Testimonial Box matching Screenshot 2 */}
            <div className="p-3.5 bg-amber-50/60 border border-amber-200/80 rounded-2xl space-y-1.5 relative">
              <span className="text-2xl text-amber-400 font-serif leading-none block">“</span>
              <p className="text-xs text-slate-700 font-medium italic leading-relaxed">
                Aplikasi terbaik yang pernah saya pakai untuk belajar Al-Qur'an anak — kemajuannya nyata hanya dalam 2 bulan.
              </p>
              <div className="flex items-center justify-between text-[11px] pt-1">
                <div className="flex text-amber-400 text-xs">
                  ★★★★★
                </div>
                <span className="font-bold text-slate-600">— Ummu Aisyah, Jakarta</span>
              </div>
            </div>

            {/* Status switch back to Free (if user is currently PRO) */}
            {userAccount.planTier === 'pro' && (
              <div className="pt-1 text-center">
                <button
                  onClick={handleDowngradeToFree}
                  className="text-[11px] text-slate-400 hover:text-rose-500 font-bold underline cursor-pointer"
                >
                  Kembalikan akun ke paket Free dasar
                </button>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};
