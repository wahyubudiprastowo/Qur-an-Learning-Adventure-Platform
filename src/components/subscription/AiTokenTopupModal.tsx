import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Sparkles,
  Bot,
  Zap,
  ShieldCheck,
  CheckCircle2,
  Key,
  HelpCircle,
  Coins,
  Crown,
  CreditCard,
  QrCode,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { UserAccount, AiTokenPackage } from '../../types';
import { StorageService } from '../../services/storageService';

export const AI_TOKEN_PACKAGES: AiTokenPackage[] = [
  {
    id: 'token_starter_15',
    name: 'Paket Starter 15 Token',
    tokenCount: 15,
    bonusTokens: 0,
    priceIdr: 15000,
    priceUsd: 1.0,
    description: 'Cocok untuk latihan beberapa surat pendek Juz Amma.',
  },
  {
    id: 'token_rajin_60',
    name: 'Paket Rajin Tahfiz (60 Token)',
    tokenCount: 50,
    bonusTokens: 10,
    priceIdr: 39000,
    priceUsd: 2.6,
    badge: 'PALING POPULER • BONUS +10',
    description: 'Paling hemat! Cukup untuk setoran rutin 1-2 pekan.',
    isPopular: true,
  },
  {
    id: 'token_khatam_150',
    name: 'Paket Khatam Santri (150 Token)',
    tokenCount: 120,
    bonusTokens: 30,
    priceIdr: 79000,
    priceUsd: 5.2,
    badge: 'SUPER HEMAT • BONUS +30',
    description: 'Kapasitas maksimal untuk santri aktif dan hafalan intensif.',
  },
];

interface AiTokenTopupModalProps {
  isOpen: boolean;
  onClose: () => void;
  userAccount: UserAccount;
  onSuccess: (updatedAccount: UserAccount) => void;
  onOpenProModal?: () => void;
}

export const AiTokenTopupModal: React.FC<AiTokenTopupModalProps> = ({
  isOpen,
  onClose,
  userAccount,
  onSuccess,
  onOpenProModal,
}) => {
  const [activeTab, setActiveTab] = useState<'packages' | 'byok'>('packages');
  const [selectedPkgId, setSelectedPkgId] = useState<string>('token_rajin_60');
  const [paymentMethod, setPaymentMethod] = useState<'qris' | 'ewallet' | 'va'>('qris');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [customKeyInput, setCustomKeyInput] = useState<string>(userAccount.customGeminiApiKey || '');
  const [keySaveMessage, setKeySaveMessage] = useState<string>('');

  if (!isOpen) return null;

  const selectedPkg = AI_TOKEN_PACKAGES.find((p) => p.id === selectedPkgId) || AI_TOKEN_PACKAGES[1];
  const totalTokens = selectedPkg.tokenCount + (selectedPkg.bonusTokens || 0);

  const handleBuyTokens = () => {
    setIsProcessing(true);

    setTimeout(() => {
      const updated = StorageService.addAiTokens(totalTokens, selectedPkg.name);

      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.6 },
      });

      setIsProcessing(false);
      onSuccess(updated);
      onClose();
    }, 900);
  };

  const handleSaveCustomKey = () => {
    const updated = StorageService.setCustomGeminiApiKey(customKeyInput);
    setKeySaveMessage('✅ API Key Google Gemini berhasil disimpan!');
    setTimeout(() => setKeySaveMessage(''), 3500);
    onSuccess(updated);
  };

  const handleRemoveCustomKey = () => {
    setCustomKeyInput('');
    const updated = StorageService.setCustomGeminiApiKey('');
    setKeySaveMessage('API Key pribadi telah dihapus.');
    setTimeout(() => setKeySaveMessage(''), 3500);
    onSuccess(updated);
  };

  const currentBalance = userAccount.aiTokensBalance || 0;
  const isPro = userAccount.planTier === 'pro' || userAccount.entitlement === 'active';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 15 }}
        className="bg-white rounded-3xl border border-[#C9E1ED] shadow-2xl max-w-xl w-full overflow-hidden my-4 relative font-sans"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer"
        >
          <X size={16} />
        </button>

        {/* TOP HEADER */}
        <div className="pt-7 pb-4 px-6 text-center space-y-2 bg-gradient-to-b from-sky-50/70 via-white to-white border-b border-slate-100">
          <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-[#08B9EF] to-sky-400 text-white flex items-center justify-center text-2xl mx-auto shadow-md ring-4 ring-sky-100">
            <Coins size={28} />
          </div>

          <h2 className="text-xl sm:text-2xl font-black font-heading text-[#164C68] tracking-tight">
            Top-Up Token Koreksi AI Guru
          </h2>

          <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
            Koreksi makhraj & tajwid multimodal cerdas. Fleksibel beli paket token sesuai kebutuhan tanpa harus langganan bulanan penuh.
          </p>

          {/* Current Balance Bar */}
          <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700">
            <span className="flex items-center gap-1.5 text-amber-600">
              <Coins size={14} />
              <span>Saldo Token Anda: <strong>{currentBalance} Token</strong></span>
            </span>
            <span className="text-slate-300">|</span>
            <span className="text-slate-500 text-[11px]">
              {isPro ? '👑 Paket Pro (20x/hari gratis)' : '⚡ Paket Free (1x/hari gratis)'}
            </span>
          </div>

          {/* TABS: PACKAGES vs BYOK */}
          <div className="flex items-center justify-center gap-2 pt-2">
            <button
              type="button"
              onClick={() => setActiveTab('packages')}
              className={`px-4 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                activeTab === 'packages'
                  ? 'bg-[#164C68] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              📦 Beli Paket Token
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('byok')}
              className={`px-4 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'byok'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
              }`}
            >
              <Key size={13} />
              <span>Pakai Google API Key Sendiri (Gratis)</span>
            </button>
          </div>
        </div>

        {/* TAB CONTENT */}
        <div className="p-5 sm:p-6 space-y-4">
          {activeTab === 'packages' ? (
            <>
              {/* Package Selection Cards */}
              <div className="space-y-2.5">
                {AI_TOKEN_PACKAGES.map((pkg) => {
                  const isSelected = selectedPkgId === pkg.id;
                  const total = pkg.tokenCount + (pkg.bonusTokens || 0);
                  const pricePerToken = Math.round(pkg.priceIdr / total);

                  return (
                    <div
                      key={pkg.id}
                      onClick={() => setSelectedPkgId(pkg.id)}
                      className={`relative p-3.5 sm:p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? 'border-[#08B9EF] bg-cyan-50/40 ring-2 ring-[#08B9EF]/30 shadow-xs'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      {pkg.badge && (
                        <span className="absolute -top-2.5 left-4 bg-amber-500 text-white font-black text-[9px] px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 shadow-xs">
                          <span>✨</span>
                          <span>{pkg.badge}</span>
                        </span>
                      )}

                      <div className="flex items-center gap-3">
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                            isSelected
                              ? 'border-[#08B9EF] bg-[#08B9EF] text-white'
                              : 'border-slate-300 bg-white'
                          }`}
                        >
                          {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-heading font-black text-[#164C68] text-sm sm:text-base leading-tight">
                              {total} Token Koreksi AI
                            </h4>
                            {pkg.bonusTokens ? (
                              <span className="text-[10px] font-black px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                                +{pkg.bonusTokens} Bonus
                              </span>
                            ) : null}
                          </div>
                          <p className="text-[11px] text-slate-500 font-medium pt-0.5">
                            {pkg.description}
                          </p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="text-sm sm:text-base font-black text-[#164C68] font-heading">
                          Rp {pkg.priceIdr.toLocaleString('id-ID')}
                        </div>
                        <div className="text-[10px] text-slate-400 font-bold">
                          ~Rp {pricePerToken}/koreksi
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Payment Methods */}
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-2">
                <span className="text-[11px] font-bold text-slate-600 block">
                  Metode Pembayaran Instan:
                </span>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('qris')}
                    className={`py-2 px-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                      paymentMethod === 'qris'
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-900 shadow-xs'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <QrCode size={14} className="text-emerald-600" />
                    <span>QRIS Instan</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('ewallet')}
                    className={`py-2 px-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                      paymentMethod === 'ewallet'
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-900 shadow-xs'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <Zap size={14} className="text-sky-600" />
                    <span>GoPay / OVO</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('va')}
                    className={`py-2 px-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                      paymentMethod === 'va'
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-900 shadow-xs'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <CreditCard size={14} className="text-purple-600" />
                    <span>Virtual Account</span>
                  </button>
                </div>
              </div>

              {/* Transparansi Biaya & Keamanan */}
              <div className="flex items-start gap-2 p-3 bg-amber-50/70 border border-amber-200/80 rounded-2xl text-[11px] text-amber-900 leading-relaxed">
                <ShieldCheck size={16} className="text-amber-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Transparansi Kuota:</strong> Token tidak memiliki masa kedaluwarsa dan akan dipakai otomatis saat kuota harian gratis Anda telah selesai. Rekaman audio tetap tersimpan aman di aplikasi.
                </span>
              </div>

              {/* ACTION BUTTON */}
              <button
                type="button"
                onClick={handleBuyTokens}
                disabled={isProcessing}
                className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-[#08B9EF] via-cyan-500 to-[#164C68] hover:from-sky-500 hover:to-[#0f3447] text-white font-black text-sm shadow-md shadow-sky-500/25 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-98 disabled:opacity-50"
              >
                {isProcessing ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Memproses Pembayaran...</span>
                  </span>
                ) : (
                  <>
                    <Coins size={16} />
                    <span>
                      Beli {totalTokens} Token (Rp {selectedPkg.priceIdr.toLocaleString('id-ID')})
                    </span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>

              {/* Alternative: Switch to Pro */}
              {onOpenProModal && !isPro && (
                <div className="text-center pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenProModal();
                    }}
                    className="text-xs font-bold text-amber-600 hover:text-amber-700 underline cursor-pointer"
                  >
                    Atau Langganan Cahaya Tahfiz PRO (Dapat 20x koreksi/hari + Semua Fitur) 👑
                  </button>
                </div>
              )}
            </>
          ) : (
            /* TAB BYOK: Bring Your Own Key */
            <div className="space-y-4">
              <div className="p-4 bg-gradient-to-r from-amber-50 via-yellow-50 to-orange-50 border border-amber-200 rounded-2xl space-y-2 text-left">
                <div className="flex items-center gap-2 text-amber-900 font-black text-sm">
                  <Key size={16} className="text-amber-600" />
                  <span>Gunakan Google Gemini API Key Sendiri (BYOK)</span>
                </div>
                <p className="text-xs text-amber-800 leading-relaxed">
                  Jika Anda memiliki akun Google pribadi, Anda bisa membuat <strong>Google Gemini API Key gratis</strong> di Google AI Studio. Dengan memasukkan key Anda, seluruh pemakaian Guru AI <strong>100% gratis tanpa batas</strong> dan tidak memotong kuota aplikasi sama sekali!
                </p>
                <div className="pt-1">
                  <a
                    href="https://aistudio.google.com/app/apikey"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-black text-[#08B9EF] hover:underline"
                  >
                    <span>Dapatkan API Key Gratis di Google AI Studio</span>
                    <ExternalLink size={12} />
                  </a>
                </div>
              </div>

              <div className="space-y-1.5 text-left">
                <label className="text-xs font-black text-slate-700">
                  Google Gemini API Key Pribadi Anda:
                </label>
                <input
                  type="password"
                  value={customKeyInput}
                  onChange={(e) => setCustomKeyInput(e.target.value)}
                  placeholder="AIzaSy..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-[#08B9EF] focus:ring-2 focus:ring-[#08B9EF]/20 text-xs font-mono outline-hidden"
                />
                <p className="text-[10px] text-slate-400">
                  API Key hanya tersimpan secara privat di peramban (browser) Anda dan hanya digunakan saat menyetorkan rekaman audio.
                </p>
              </div>

              {keySaveMessage && (
                <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold text-center">
                  {keySaveMessage}
                </div>
              )}

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleSaveCustomKey}
                  disabled={!customKeyInput.trim()}
                  className="flex-1 py-3 px-4 rounded-xl bg-[#164C68] hover:bg-[#113a50] text-white font-black text-xs shadow-sm flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40 transition-all"
                >
                  <CheckCircle2 size={15} />
                  <span>Simpan API Key Pribadi</span>
                </button>
                {userAccount.customGeminiApiKey && (
                  <button
                    type="button"
                    onClick={handleRemoveCustomKey}
                    className="py-3 px-3 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 font-bold text-xs cursor-pointer transition-all"
                  >
                    Hapus Key
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
