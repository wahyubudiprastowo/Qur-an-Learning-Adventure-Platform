import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Share2,
  Copy,
  CheckCircle2,
  Coins,
  Users,
  TrendingUp,
  Sparkles,
  ShieldCheck,
  ExternalLink,
  MessageCircle,
  Send,
  Facebook,
  Twitter,
  CreditCard,
  Building,
  Check,
  RefreshCw,
  Gift,
  HelpCircle,
  ToggleLeft,
  ToggleRight,
  Edit3,
  Link2,
  Globe,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { UserAccount, AffiliateReferralRecord } from '../../types';
import { StorageService } from '../../services/storageService';

interface AffiliateDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  userAccount: UserAccount;
  onAccountUpdated: (updated: UserAccount) => void;
}

export const AffiliateDashboardModal: React.FC<AffiliateDashboardModalProps> = ({
  isOpen,
  onClose,
  userAccount,
  onAccountUpdated,
}) => {
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [copiedText, setCopiedText] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'referrals' | 'payout'>('overview');
  const [isWithdrawing, setIsWithdrawing] = useState<boolean>(false);
  const [withdrawSuccess, setWithdrawSuccess] = useState<boolean>(false);

  // Bank Form State
  const [bankName, setBankName] = useState<string>('Bank Syariah Indonesia (BSI)');
  const [accountNumber, setAccountNumber] = useState<string>('7182938491');
  const [accountHolder, setAccountHolder] = useState<string>(userAccount.parentName || 'Nama Pemilik Rekening');

  // Custom Link State
  const [isEditingLink, setIsEditingLink] = useState<boolean>(false);
  const [customSlug, setCustomSlug] = useState<string>(() => userAccount.affiliateCode || StorageService.generateAffiliateCode(userAccount));
  const [customPrefix, setCustomPrefix] = useState<'reff' | 'aff' | 'ref'>(() => userAccount.affiliateLinkPrefix || 'reff');
  const [customError, setCustomError] = useState<string | null>(null);
  const [customSuccess, setCustomSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  const isEnabled = Boolean(userAccount.affiliateEnabled);
  const affiliateCode = userAccount.affiliateCode || StorageService.generateAffiliateCode(userAccount);
  const shareUrl = StorageService.getAffiliateShareUrl(userAccount);
  const shareMessage = `Assalamu'alaikum! Yuk temani buah hati belajar & menghafal Al-Qur'an dengan aplikasi cerdas Cahaya Tahfiz. Belajar jadi seru dengan Guru AI, arena game edukatif, dan Iqra interaktif! Dapatkan akses khusus dengan link rujukan saya: ${shareUrl}`;

  const referrals = StorageService.getAffiliateReferrals(userAccount.id);
  const totalEarnings = userAccount.affiliateTotalEarnings || 0;
  const pendingBalance = userAccount.affiliatePendingBalance || 0;

  const handleToggleAffiliate = () => {
    const updated = StorageService.toggleAffiliateProgram(!isEnabled);
    onAccountUpdated(updated);
  };

  const handleSaveCustomLink = (e: React.FormEvent) => {
    e.preventDefault();
    const res = StorageService.updateCustomAffiliateCode(userAccount.id, customSlug, customPrefix);
    if (res.success && res.user) {
      setCustomSuccess(res.message);
      setCustomError(null);
      onAccountUpdated(res.user);
      setTimeout(() => {
        setIsEditingLink(false);
        setCustomSuccess(null);
      }, 1500);
    } else {
      setCustomError(res.message);
      setCustomSuccess(null);
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(affiliateCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleCopyText = () => {
    navigator.clipboard.writeText(shareMessage);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2500);
  };

  // Social Share Handlers
  const handleShareWhatsApp = () => {
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(shareMessage)}`, '_blank');
  };

  const handleShareTelegram = () => {
    window.open(`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareMessage)}`, '_blank');
  };

  const handleShareFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank');
  };

  const handleShareTwitter = () => {
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareMessage)}`, '_blank');
  };

  const handleShareLine = () => {
    window.open(`https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(shareUrl)}`, '_blank');
  };

  const handleRequestPayout = () => {
    if (pendingBalance <= 0) return;
    setIsWithdrawing(true);

    setTimeout(() => {
      setIsWithdrawing(false);
      setWithdrawSuccess(true);
      const updated = StorageService.updateUserAccount({
        affiliatePendingBalance: 0,
        affiliateBankDetails: { bankName, accountNumber, accountHolder },
      });
      onAccountUpdated(updated);

      confetti({
        particleCount: 70,
        spread: 80,
        origin: { y: 0.6 },
      });

      setTimeout(() => setWithdrawSuccess(false), 4500);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 15 }}
        className="bg-white rounded-3xl border border-[#C9E1ED] shadow-2xl max-w-2xl w-full overflow-hidden my-4 relative font-sans text-left"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer"
        >
          <X size={16} />
        </button>

        {/* TOP HEADER */}
        <div className="pt-7 pb-5 px-6 bg-gradient-to-b from-emerald-50/80 via-teal-50/30 to-white border-b border-slate-100 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-white flex items-center justify-center text-2xl shadow-md ring-4 ring-emerald-100 shrink-0">
              <Gift size={28} />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl sm:text-2xl font-black font-heading text-[#164C68] tracking-tight">
                  Program Sahabat Syiar & Afiliasi
                </h2>
                <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border ${
                  isEnabled ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-slate-100 text-slate-600 border-slate-300'
                }`}>
                  {isEnabled ? '🟢 AKTIF' : '⚪ NONAKTIF'}
                </span>
              </div>
              <p className="text-xs text-slate-600 font-medium">
                Ajak keluarga & santri baru. Dapatkan <strong>komisi 10%</strong> dari setiap pendaftaran PRO dan <strong>setiap renewal perpanjangan</strong>!
              </p>
            </div>
          </div>

          {/* Toggle Activation Control */}
          <div className="p-3 bg-white rounded-2xl border border-emerald-200/80 shadow-2xs flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-sm">
                🤝
              </div>
              <div>
                <span className="text-xs font-black text-[#164C68] block">
                  Status Partisipasi Program Afiliasi
                </span>
                <span className="text-[11px] text-slate-500">
                  {isEnabled
                    ? 'Program aktif — kode referral Anda siap dibagikan ke media sosial'
                    : 'Aktifkan untuk mulai mendapatkan link referral & komisi 10%'}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleToggleAffiliate}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                isEnabled
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                  : 'bg-slate-800 hover:bg-slate-900 text-white'
              }`}
            >
              {isEnabled ? (
                <>
                  <Check size={14} />
                  <span>Afiliasi Aktif</span>
                </>
              ) : (
                <>
                  <Sparkles size={14} className="text-amber-300" />
                  <span>Aktifkan Afiliasi Manual</span>
                </>
              )}
            </button>
          </div>

          {/* TAB NAVIGATION */}
          <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setActiveTab('overview')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'overview'
                  ? 'bg-[#164C68] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              📊 Kode & Bagi Link
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('referrals')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                activeTab === 'referrals'
                  ? 'bg-[#164C68] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Users size={13} />
              <span>Santri Rujukan ({referrals.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('payout')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                activeTab === 'payout'
                  ? 'bg-[#164C68] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <CreditCard size={13} />
              <span>Pencairan Komisi</span>
            </button>
          </div>
        </div>

        {/* TAB CONTENTS */}
        <div className="p-5 sm:p-6 space-y-4 max-h-[500px] overflow-y-auto">
          {activeTab === 'overview' && (
            <div className="space-y-4">
              {/* Stats Highlights */}
              <div className="grid grid-cols-3 gap-2.5">
                <div className="p-3 bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl text-center">
                  <span className="text-[10px] font-bold text-slate-500 block">Total Komisi</span>
                  <span className="text-sm sm:text-base font-black text-emerald-700 font-heading">
                    Rp {totalEarnings.toLocaleString('id-ID')}
                  </span>
                  <span className="text-[9px] text-emerald-600 font-bold block">10% per transaksi</span>
                </div>
                <div className="p-3 bg-gradient-to-br from-cyan-50 to-sky-50 border border-cyan-200 rounded-2xl text-center">
                  <span className="text-[10px] font-bold text-slate-500 block">Siap Dicairkan</span>
                  <span className="text-sm sm:text-base font-black text-[#164C68] font-heading">
                    Rp {pendingBalance.toLocaleString('id-ID')}
                  </span>
                  <span className="text-[9px] text-cyan-700 font-bold block">Bisa ditransfer</span>
                </div>
                <div className="p-3 bg-gradient-to-br from-amber-50 to-yellow-50 border border-amber-200 rounded-2xl text-center">
                  <span className="text-[10px] font-bold text-slate-500 block">Santri Terdaftar</span>
                  <span className="text-sm sm:text-base font-black text-amber-700 font-heading">
                    {referrals.length} Santri
                  </span>
                  <span className="text-[9px] text-amber-600 font-bold block">+ Renewal aktif</span>
                </div>
              </div>

              {/* Unique Affiliate Code Card */}
              <div className="p-4 bg-gradient-to-r from-slate-900 to-[#164C68] text-white rounded-3xl space-y-3 shadow-md">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Kode Referral Unik Akun Anda
                  </span>
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                    Komisi 10% Terus Berulang
                  </span>
                </div>

                <div className="flex items-center justify-between bg-white/10 p-3 rounded-2xl border border-white/20">
                  <span className="text-xl sm:text-2xl font-black font-mono tracking-widest text-amber-300">
                    {affiliateCode}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyCode}
                    className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-[#164C68] font-black text-xs shadow-xs cursor-pointer flex items-center gap-1.5 transition-all"
                  >
                    {copiedCode ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                    <span>{copiedCode ? 'Tersalin!' : 'Salin Kode'}</span>
                  </button>
                </div>

                <div className="flex items-center justify-between gap-2 pt-1">
                  <p className="text-[11px] text-slate-300 truncate">
                    Link: <span className="text-sky-300 font-mono">{shareUrl}</span>
                  </p>
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="text-[11px] font-bold text-amber-300 hover:text-white underline cursor-pointer shrink-0"
                  >
                    {copiedLink ? 'Link Tersalin!' : 'Salin Link'}
                  </button>
                </div>

                {/* Custom Natural Link Accordion / Toggle */}
                <div className="pt-2 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setIsEditingLink(!isEditingLink)}
                    className="text-xs font-bold text-amber-300 hover:text-white flex items-center justify-between w-full cursor-pointer py-1"
                  >
                    <span className="flex items-center gap-1.5">
                      <Edit3 size={13} />
                      <span>Kustomisasi Tautan Afiliasi Natural (/reff/ atau /aff/)</span>
                    </span>
                    <span className="text-[10px] underline">{isEditingLink ? 'Tutup' : 'Ubah Tautan'}</span>
                  </button>

                  {isEditingLink && (
                    <form onSubmit={handleSaveCustomLink} className="mt-3 p-3 bg-white/10 rounded-2xl border border-white/20 space-y-3 text-xs">
                      <div className="space-y-1">
                        <span className="text-[10px] text-slate-300 font-bold block uppercase">
                          Pilih Format URL:
                        </span>
                        <div className="grid grid-cols-3 gap-1.5">
                          {(['reff', 'aff', 'ref'] as const).map((prefix) => (
                            <button
                              key={prefix}
                              type="button"
                              onClick={() => setCustomPrefix(prefix)}
                              className={`py-1.5 px-2 rounded-xl text-[11px] font-mono font-bold border transition-all cursor-pointer ${
                                customPrefix === prefix
                                  ? 'bg-amber-400 text-amber-950 border-amber-300'
                                  : 'bg-black/20 text-slate-300 border-white/10 hover:bg-black/30'
                              }`}
                            >
                              /{prefix}/
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-1">
                        <span className="text-[10px] text-slate-300 font-bold block uppercase">
                          Slug / Nama Tautan Kustom:
                        </span>
                        <input
                          type="text"
                          value={customSlug}
                          onChange={(e) => setCustomSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-_]/g, ''))}
                          placeholder="contoh: bunda-sarah"
                          className="w-full py-2 px-3 rounded-xl bg-black/30 border border-white/20 text-white font-mono text-xs focus:outline-none focus:border-amber-400"
                        />
                      </div>

                      <div className="p-2 rounded-xl bg-black/30 text-[10px] font-mono text-amber-200 break-all">
                        Preview: https://cahayatahfiz.id/{customPrefix === 'ref' ? `?ref=${customSlug}` : `${customPrefix}/${customSlug}`}
                      </div>

                      {customError && (
                        <p className="text-[11px] text-red-300 bg-red-900/40 p-2 rounded-xl border border-red-500/40 font-bold">
                          {customError}
                        </p>
                      )}

                      {customSuccess && (
                        <p className="text-[11px] text-emerald-300 bg-emerald-900/40 p-2 rounded-xl border border-emerald-500/40 font-bold flex items-center gap-1">
                          <Check size={12} />
                          <span>{customSuccess}</span>
                        </p>
                      )}

                      <div className="flex justify-end gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => setIsEditingLink(false)}
                          className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 font-bold text-[11px] cursor-pointer"
                        >
                          Batal
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-amber-950 font-black text-[11px] cursor-pointer shadow-xs"
                        >
                          Simpan Link
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </div>

              {/* SHARE KE MEDIA SOSIAL DIRECT BUTTONS */}
              <div className="space-y-2">
                <span className="text-xs font-black text-[#164C68] block">
                  Bagikan Langsung ke Media Sosial:
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={handleShareWhatsApp}
                    className="py-2.5 px-3 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-xs transition-all active:scale-98"
                  >
                    <MessageCircle size={16} />
                    <span>WhatsApp</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleShareTelegram}
                    className="py-2.5 px-3 rounded-2xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-xs transition-all active:scale-98"
                  >
                    <Send size={15} />
                    <span>Telegram</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleShareFacebook}
                    className="py-2.5 px-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-xs transition-all active:scale-98"
                  >
                    <Facebook size={16} />
                    <span>Facebook</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleShareTwitter}
                    className="py-2.5 px-3 rounded-2xl bg-slate-900 hover:bg-black text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-xs transition-all active:scale-98"
                  >
                    <Twitter size={15} />
                    <span>X (Twitter)</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleShareLine}
                    className="py-2.5 px-3 rounded-2xl bg-[#06C755] hover:bg-[#05b34c] text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-xs transition-all active:scale-98"
                  >
                    <Share2 size={15} />
                    <span>LINE</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleCopyText}
                    className="py-2.5 px-3 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-98"
                  >
                    <Copy size={15} />
                    <span>{copiedText ? 'Teks Tersalin!' : 'Salin Pesan'}</span>
                  </button>
                </div>
              </div>

              {/* Ketentuan Komisi & Syiar */}
              <div className="p-3.5 bg-amber-50/70 border border-amber-200/80 rounded-2xl space-y-1.5 text-xs text-amber-900 leading-relaxed">
                <div className="flex items-center gap-1.5 font-bold text-[#164C68]">
                  <Sparkles size={14} className="text-amber-500 fill-amber-500" />
                  <span>Keunggulan Program Afiliasi Cahaya Tahfiz:</span>
                </div>
                <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-700 pl-1">
                  <li><strong>Komisi 10% untuk Setiap Pembelian PRO</strong> baru yang menggunakan kode Anda.</li>
                  <li><strong>Komisi 10% Setiap Renewal:</strong> Saat santri memperpanjang langganan (bulanan/tahunan), komisi akan otomatis masuk kembali ke saldo Anda!</li>
                  <li><strong>Pencairan Mudah:</strong> Bisa dicairkan kapan saja langsung ke rekening bank atau dompet digital tanpa potongan tersembunyi.</li>
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'referrals' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-slate-600">
                <span>Daftar Santri & Transaksi Rujukan</span>
                <span>Total: {referrals.length} Santri</span>
              </div>

              {referrals.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <Users size={32} className="mx-auto text-slate-300" />
                  <p className="text-xs font-bold text-slate-600">
                    Belum ada santri yang mendaftar lewat kode Anda.
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Bagikan kode referral Anda ke grup pengajian, sekolah, atau keluarga untuk mulai mengumpulkan komisi!
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {referrals.map((item) => (
                    <div
                      key={item.id}
                      className="p-3.5 bg-white rounded-2xl border border-slate-200 hover:border-emerald-300 shadow-2xs flex items-center justify-between gap-3 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-base shrink-0">
                          {item.isRenewal ? '🔄' : '🎓'}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-xs font-black text-[#164C68]">
                              {item.referredUserName}
                            </h4>
                            {item.isRenewal && (
                              <span className="text-[9px] font-black px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-900 border border-amber-200">
                                Renewal
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500">
                            {item.planName} • Rp {item.transactionAmountIdr.toLocaleString('id-ID')}
                          </p>
                          <span className="text-[10px] text-slate-400">
                            {new Date(item.createdAt).toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </span>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-xs sm:text-sm font-black text-emerald-600 font-heading block">
                          +Rp {item.commissionEarnedIdr.toLocaleString('id-ID')}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                          10% Komisi
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'payout' && (
            <div className="space-y-4">
              <div className="p-4 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-600 block">Saldo Komisi Siap Cair</span>
                  <span className="text-xl sm:text-2xl font-black text-emerald-700 font-heading">
                    Rp {pendingBalance.toLocaleString('id-ID')}
                  </span>
                </div>
                <span className="text-xs font-black px-3 py-1 rounded-full bg-emerald-200/80 text-emerald-900 border border-emerald-300">
                  Minimum Penarikan: Rp 20.000
                </span>
              </div>

              {/* Form Rekening Bank */}
              <div className="space-y-3 p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                <span className="text-xs font-black text-[#164C68] block">
                  Data Rekening Penerima Komisi:
                </span>

                <div className="space-y-2">
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">
                      Nama Bank / E-Wallet:
                    </label>
                    <input
                      type="text"
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      placeholder="BSI, BCA, Mandiri, GoPay, OVO, ShopeePay..."
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white outline-hidden focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">
                      Nomor Rekening / Akun E-Wallet:
                    </label>
                    <input
                      type="text"
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value)}
                      placeholder="Nomor rekening bank..."
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono bg-white outline-hidden focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">
                      Nama Pemilik Rekening:
                    </label>
                    <input
                      type="text"
                      value={accountHolder}
                      onChange={(e) => setAccountHolder(e.target.value)}
                      placeholder="Nama sesuai buku tabungan..."
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white outline-hidden focus:border-emerald-500"
                    />
                  </div>
                </div>
              </div>

              {withdrawSuccess && (
                <div className="p-3 bg-emerald-100 border border-emerald-300 rounded-2xl text-emerald-900 text-xs font-bold text-center">
                  🎉 Permintaan penarikan komisi Rp {totalEarnings.toLocaleString('id-ID')} berhasil diproses! Saldo akan ditransfer dalam 1x24 jam.
                </div>
              )}

              <button
                type="button"
                onClick={handleRequestPayout}
                disabled={pendingBalance <= 0 || isWithdrawing}
                className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-xs shadow-md shadow-emerald-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 transition-all active:scale-98"
              >
                {isWithdrawing ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Memproses Pengajuan Pencairan...</span>
                  </span>
                ) : (
                  <>
                    <CreditCard size={15} />
                    <span>Ajukan Penarikan Komisi (Rp {pendingBalance.toLocaleString('id-ID')})</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
