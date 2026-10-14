import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  Crown,
  Coins,
  Lock,
  User,
  Users,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  LogOut,
  Mail,
  Sparkles,
  ExternalLink,
  Smartphone,
  Phone,
  Gift,
} from 'lucide-react';
import { UserAccount, AccountTier, ChildProfile } from '../../types';
import { StorageService } from '../../services/storageService';

interface ParentMenuModalProps {
  isOpen: boolean;
  onClose: () => void;
  userAccount: UserAccount;
  activeChild: ChildProfile;
  childrenList: ChildProfile[];
  onOpenAuth: (mode: 'login' | 'register' | 'switch') => void;
  onOpenPlanModal: () => void;
  onOpenParentDashboard: () => void;
  onOpenAiTokens?: () => void;
  onOpenChildManager?: () => void;
  onOpenAffiliateModal?: () => void;
  onNavigateToAkunTab: () => void;
  onAccountUpdated: (account: UserAccount) => void;
}

export const ParentMenuModal: React.FC<ParentMenuModalProps> = ({
  isOpen,
  onClose,
  userAccount,
  activeChild,
  childrenList,
  onOpenAuth,
  onOpenPlanModal,
  onOpenParentDashboard,
  onOpenAiTokens,
  onOpenChildManager,
  onOpenAffiliateModal,
  onNavigateToAkunTab,
  onAccountUpdated,
}) => {
  if (!isOpen) return null;

  const currentTier: AccountTier = StorageService.getAccountTier(userAccount);

  const handleSwitchTier = (tier: AccountTier) => {
    const updated = StorageService.setAccountTier(tier);
    onAccountUpdated(updated);
  };

  const handleQuickRegisterGoogle = () => {
    onClose();
    onOpenAuth('register');
  };

  const handleLogoutToGuest = () => {
    const guest = StorageService.logoutUser();
    onAccountUpdated(guest);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-end p-3 sm:p-5 bg-slate-950/45 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm sm:max-w-md bg-white rounded-3xl border-2 border-[#164C68]/20 shadow-2xl overflow-hidden mt-12 sm:mt-14 max-h-[90vh] flex flex-col text-left font-sans text-slate-800 animate-in slide-in-from-top-3 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Parent Header: Elegant Navy/Cyan with Shield */}
        <div className="p-4 bg-gradient-to-r from-[#164C68] via-[#11405a] to-[#0f3447] text-white flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center text-cyan-300 text-lg shrink-0">
              🛡️
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm font-black font-heading tracking-tight">
                  Menu Orang Tua / Wali
                </h3>
                <span className="text-[9px] font-black px-1.5 py-0.2 rounded-md bg-cyan-400 text-slate-950 uppercase">
                  WALI
                </span>
              </div>
              <p className="text-[10px] text-cyan-200 font-medium">
                Kontrol akun, jenjang akses, & pengawasan santri
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-slate-200 transition-colors cursor-pointer"
            aria-label="Tutup"
          >
            <X size={16} />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-4 space-y-3.5 overflow-y-auto">
          {/* ======================================================== */}
          {/* 1. SISTEM 3 JENJANG AKUN: GUEST, FREE LOGIN, PRO LOGIN   */}
          {/* ======================================================== */}
          <div className="bg-slate-50 border-2 border-slate-200 rounded-3xl p-3.5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">
                JENJANG AKUN SAAT INI
              </span>
              <span
                className={`text-[10px] font-black px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                  currentTier === 'pro'
                    ? 'bg-amber-400 text-amber-950'
                    : currentTier === 'free'
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : 'bg-amber-100 text-amber-800 border border-amber-300'
                }`}
              >
                {currentTier === 'pro'
                  ? '👑 PRO LOGIN'
                  : currentTier === 'free'
                  ? '🟢 FREE LOGIN'
                  : '⚪ GUEST (TAMU)'}
              </span>
            </div>

            {/* Quick Interactive 3-Tier Switcher */}
            <div className="grid grid-cols-3 gap-1 bg-white p-1 rounded-2xl border border-slate-200 shadow-2xs">
              <button
                type="button"
                onClick={() => handleSwitchTier('guest')}
                className={`py-1.5 px-2 text-[11px] font-bold rounded-xl transition-all cursor-pointer text-center ${
                  currentTier === 'guest'
                    ? 'bg-amber-100 text-amber-900 font-black shadow-2xs border border-amber-300'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Tamu (Guest)
              </button>
              <button
                type="button"
                onClick={() => handleSwitchTier('free')}
                className={`py-1.5 px-2 text-[11px] font-bold rounded-xl transition-all cursor-pointer text-center ${
                  currentTier === 'free'
                    ? 'bg-emerald-100 text-emerald-900 font-black shadow-2xs border border-emerald-300'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Free Login
              </button>
              <button
                type="button"
                onClick={() => handleSwitchTier('pro')}
                className={`py-1.5 px-2 text-[11px] font-bold rounded-xl transition-all cursor-pointer text-center ${
                  currentTier === 'pro'
                    ? 'bg-amber-400 text-amber-950 font-black shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Pro Login 👑
              </button>
            </div>

            {/* Contextual Tier Explanations & Action Directives */}
            {currentTier === 'guest' && (
              <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-3 space-y-2.5">
                <div className="flex items-start gap-2">
                  <span className="text-base shrink-0">⚠️</span>
                  <div className="text-xs text-amber-950 leading-relaxed">
                    <p className="font-bold">Mode Tamu (Fitur Coba Terbatas)</p>
                    <p className="text-[11px] text-amber-800 mt-0.5">
                      Bisa mencoba Iqra 1 (Hal 1-5), 3 surah pendek (An-Nas, Al-Falaq, Al-Ikhlas), 1 game sampel, dan baca Al-Qur'an. Progres belum tersimpan di cloud.
                    </p>
                  </div>
                </div>

                <div className="pt-1 space-y-1.5">
                  <span className="text-[10px] font-black uppercase text-amber-900 tracking-wider block">
                    Daftar Gratis untuk Buka 32 Hal Iqra 1 & 22 Surah Juz 30:
                  </span>
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      onClick={handleQuickRegisterGoogle}
                      className="py-2 px-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 text-xs font-bold flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer transition-all active:scale-95"
                    >
                      <span className="font-bold text-red-500">G</span>
                      <span className="truncate">Via Gmail / Google</span>
                    </button>
                    <button
                      onClick={() => {
                        onClose();
                        onOpenAuth('register');
                      }}
                      className="py-2 px-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer transition-all active:scale-95"
                    >
                      <span>💬</span>
                      <span className="truncate">WhatsApp OTP</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {currentTier === 'free' && (
              <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                    <div>
                      <span className="text-xs font-black text-emerald-950 block">
                        Akun Terdaftar: {userAccount.email || 'Cloud Aktif'}
                      </span>
                      <span className="text-[10px] text-emerald-800 font-medium">
                        Iqra 1 Full • 60% Juz 30 (22 Surah) • Al-Qur'an 30 Juz • 3 Game
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    onClose();
                    onOpenPlanModal();
                  }}
                  className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white text-xs font-black flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer transition-all active:scale-95"
                >
                  <Crown size={14} className="text-amber-200" />
                  <span>Upgrade ke PRO (Buka Iqra 2-6, 30 Juz & Semua Game)</span>
                </button>
              </div>
            )}

            {currentTier === 'pro' && (
              <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-2xl p-3 space-y-1.5 shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">👑</span>
                    <div>
                      <span className="text-xs font-black text-amber-300 block">
                        Keluarga Santri PRO Aktif
                      </span>
                      <span className="text-[10px] text-slate-300 font-medium">
                        30 Juz Penuh • Koreksi AI Tartil • Rapor PDF Resmi
                      </span>
                    </div>
                  </div>
                  <span className="text-[9px] font-black bg-amber-400 text-amber-950 px-2 py-0.5 rounded-full uppercase">
                    AKTIF
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* ======================================================== */}
          {/* 2. FITUR UTAMA ORANG TUA (DASBOR, TOKEN, KELOLA ANAK)      */}
          {/* ======================================================== */}
          <div className="space-y-2">
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block px-1">
              KONTROL & PENGAWASAN WALI
            </span>

            {/* Dasbor Wali Card */}
            <button
              onClick={() => {
                onClose();
                onOpenParentDashboard();
              }}
              className="w-full p-3 rounded-2xl bg-white hover:bg-cyan-50/50 border-2 border-[#C9E1ED] hover:border-[#164C68] flex items-center justify-between text-left transition-all cursor-pointer shadow-2xs group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-2xl bg-cyan-50 text-[#164C68] group-hover:bg-[#164C68] group-hover:text-white flex items-center justify-center shrink-0 transition-colors shadow-2xs">
                  <ShieldCheck size={20} />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-black text-[#164C68]">
                      Dasbor Wali Santri
                    </span>
                    <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-md bg-slate-100 text-slate-600 border border-slate-200 flex items-center gap-0.5">
                      <Lock size={9} />
                      <span>PIN</span>
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 font-medium truncate mt-0.5">
                    Grafik mingguan, rekaman suara anak, tajwid, & PIN
                  </p>
                </div>
              </div>
              <ChevronRight size={16} className="text-slate-400 group-hover:text-[#164C68] shrink-0" />
            </button>

            {/* Saldo Token AI Guru & Topup */}
            {onOpenAiTokens && (
              <button
                onClick={() => {
                  onClose();
                  onOpenAiTokens();
                }}
                className="w-full p-3 rounded-2xl bg-white hover:bg-cyan-50/50 border-2 border-[#C9E1ED] hover:border-[#08B9EF] flex items-center justify-between text-left transition-all cursor-pointer shadow-2xs group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-2xl bg-cyan-50 text-[#08B9EF] group-hover:bg-[#08B9EF] group-hover:text-white flex items-center justify-center shrink-0 transition-colors shadow-2xs">
                    <Coins size={20} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-black text-[#164C68]">
                        Token Koreksi AI Guru
                      </span>
                      <span className="text-[9px] font-black px-1.5 py-0.2 rounded-md bg-cyan-100 text-cyan-800">
                        {userAccount.aiTokensBalance || 0} Token
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 font-medium truncate mt-0.5">
                      Kuota evaluasi tajwid santri & beli token tambahan
                    </p>
                  </div>
                </div>
                <ChevronRight size={16} className="text-slate-400 group-hover:text-[#08B9EF] shrink-0" />
              </button>
            )}

            {/* Kelola Seluruh Profil Anak */}
            <button
              onClick={() => {
                onClose();
                if (onOpenChildManager) onOpenChildManager();
              }}
              className="w-full p-3 rounded-2xl bg-white hover:bg-slate-50 border-2 border-[#C9E1ED] flex items-center justify-between text-left transition-all cursor-pointer shadow-2xs group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center shrink-0 shadow-2xs">
                  <Users size={20} />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-black text-[#164C68]">
                      Kelola Profil Santri
                    </span>
                    <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-md bg-purple-100 text-purple-800">
                      {childrenList.length} Anak
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 font-medium truncate mt-0.5">
                    Santri aktif: {activeChild.name} • Tambah atau edit profil
                  </p>
                </div>
              </div>
              <ChevronRight size={16} className="text-slate-400 group-hover:text-purple-700 shrink-0" />
            </button>

            {/* Program Sahabat Syiar Afiliasi */}
            {onOpenAffiliateModal && (
              <button
                onClick={() => {
                  onClose();
                  onOpenAffiliateModal();
                }}
                className="w-full p-3 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 flex items-center justify-between text-left transition-all cursor-pointer shadow-2xs group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-2xs text-lg">
                    🤝
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-black text-emerald-950">
                        Sahabat Syiar & Afiliasi
                      </span>
                      <span className="text-[9px] font-black px-1.5 py-0.2 rounded-md bg-amber-400 text-amber-950">
                        10% Komisi
                      </span>
                    </div>
                    <p className="text-[10px] text-emerald-800 font-medium truncate mt-0.5">
                      Kode: {userAccount.affiliateCode || 'SARAH828'} • Ajak teman & santri lain
                    </p>
                  </div>
                </div>
                <ChevronRight size={16} className="text-emerald-600 shrink-0" />
              </button>
            )}
          </div>

          {/* ======================================================== */}
          {/* 3. FOOTER ACTIONS: FULL PAGE & LOGOUT                     */}
          {/* ======================================================== */}
          <div className="pt-2 border-t border-slate-100 space-y-2">
            <button
              onClick={() => {
                onClose();
                onNavigateToAkunTab();
              }}
              className="w-full py-2.5 px-4 rounded-2xl bg-[#164C68] hover:bg-[#0f3447] text-white text-xs font-black flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
            >
              <User size={14} />
              <span>Buka Halaman Pengaturan Lengkap</span>
              <ChevronRight size={14} />
            </button>

            {userAccount.isRegistered ? (
              <button
                onClick={handleLogoutToGuest}
                className="w-full py-2 px-3 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <LogOut size={13} />
                <span>Keluar & Beralih ke Mode Tamu (Guest)</span>
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};
