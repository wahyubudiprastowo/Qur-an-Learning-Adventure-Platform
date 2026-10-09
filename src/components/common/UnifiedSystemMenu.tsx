import React from 'react';
import {
  User,
  ShieldCheck,
  Star,
  Coins,
  Crown,
  ChevronRight,
  PlusCircle,
  X,
  Lock,
  LogOut,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { ChildProfile, UserAccount } from '../../types';

interface UnifiedSystemMenuProps {
  isOpen: boolean;
  onClose: () => void;
  activeChild: ChildProfile;
  childrenList: ChildProfile[];
  userAccount: UserAccount;
  onSwitchChild: (childId: string) => void;
  onAddChild: () => void;
  onOpenAuth: (mode: 'login' | 'register' | 'switch') => void;
  onOpenPlanModal: () => void;
  onOpenParentDashboard: () => void;
  onOpenAiTokens?: () => void;
  onNavigateToAkunTab: () => void;
}

export const UnifiedSystemMenu: React.FC<UnifiedSystemMenuProps> = ({
  isOpen,
  onClose,
  activeChild,
  childrenList,
  userAccount,
  onSwitchChild,
  onAddChild,
  onOpenAuth,
  onOpenPlanModal,
  onOpenParentDashboard,
  onOpenAiTokens,
  onNavigateToAkunTab,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-end p-3 sm:p-5 bg-slate-950/40 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm sm:max-w-md bg-white rounded-3xl border border-[#C9E1ED] shadow-2xl overflow-hidden mt-12 sm:mt-14 max-h-[90vh] flex flex-col text-left font-sans text-slate-800 animate-in slide-in-from-top-3 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="p-4 bg-gradient-to-r from-[#164C68] to-[#0f354a] text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">⚙️</span>
            <div>
              <h3 className="text-sm font-black font-heading tracking-tight">
                Pusat Profil & Sistem
              </h3>
              <p className="text-[10px] text-cyan-200 font-medium">
                Satu tombol terpadu untuk semua akses akun & anak
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-slate-200 transition-colors cursor-pointer"
            aria-label="Tutup Menu"
          >
            <X size={16} />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-4 space-y-3.5 overflow-y-auto">
          {/* 1. Active Child & Switcher */}
          <div className="bg-[#EEF8FF] border border-[#C9E1ED] rounded-2xl p-3.5 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase text-[#8C9BA7] tracking-wider">
                PROFIL SANTRI AKTIF
              </span>
              <button
                onClick={() => {
                  onClose();
                  onAddChild();
                }}
                className="text-[11px] font-bold text-[#08B9EF] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <PlusCircle size={12} />
                <span>Tambah Anak</span>
              </button>
            </div>

            <div className="flex items-center gap-3 bg-white p-2.5 rounded-xl border border-[#C9E1ED]/80 shadow-2xs">
              <div className="w-11 h-11 rounded-2xl bg-cyan-50 border border-cyan-200 flex items-center justify-center text-2xl shrink-0">
                {activeChild.avatar}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-black text-[#164C68] truncate">
                    {activeChild.name}
                  </h4>
                  <span className="text-[9px] font-black px-1.5 py-0.2 rounded-md bg-cyan-100 text-[#164C68] uppercase">
                    {activeChild.learningLevel}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-slate-500 font-semibold mt-0.5">
                  <span className="text-amber-600 flex items-center gap-0.5">
                    <Star size={11} className="fill-amber-400 text-amber-500" />
                    {activeChild.totalStars} Bintang
                  </span>
                  <span>·</span>
                  <span>{activeChild.totalXp} XP</span>
                </div>
              </div>
            </div>

            {/* Other Registered Children Selector */}
            {childrenList.length > 1 && (
              <div className="pt-1">
                <span className="text-[10px] font-bold text-slate-500 block mb-1">
                  Beralih ke profil anak lain:
                </span>
                <div className="flex gap-1.5 overflow-x-auto pb-1">
                  {childrenList.map((c) => {
                    const isSelected = c.id === activeChild.id;
                    return (
                      <button
                        key={c.id}
                        onClick={() => {
                          onSwitchChild(c.id);
                          onClose();
                        }}
                        className={`flex items-center gap-1.5 py-1 px-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                          isSelected
                            ? 'bg-[#164C68] text-white shadow-2xs'
                            : 'bg-white border border-[#C9E1ED] text-[#164C68] hover:bg-slate-100'
                        }`}
                      >
                        <span>{c.avatar}</span>
                        <span className="truncate max-w-[80px]">{c.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* 2. Parent Account Cloud Status */}
          <div className="bg-white border border-[#C9E1ED] rounded-2xl p-3 flex items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg shrink-0 ${
                userAccount.isRegistered
                  ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                  : 'bg-amber-50 text-amber-600 border border-amber-200'
              }`}>
                {userAccount.isRegistered ? '👤' : '📱'}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-black text-[#164C68] truncate">
                    {userAccount.isRegistered
                      ? `Wali: ${userAccount.parentName}`
                      : 'Akun Tamu (Lokal)'}
                  </span>
                  <span className={`text-[8px] font-black px-1.5 py-0.2 rounded-full uppercase ${
                    userAccount.isRegistered
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {userAccount.isRegistered ? 'Cloud Aktif' : 'Tamu'}
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 truncate mt-0.5">
                  {userAccount.isRegistered
                    ? (userAccount.email || 'Data tersinkron otomatis')
                    : 'Simpan progres santri ke cloud'}
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                onClose();
                onOpenAuth(userAccount.isRegistered ? 'switch' : 'register');
              }}
              className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#164C68] text-[11px] font-bold shrink-0 transition-colors cursor-pointer"
            >
              {userAccount.isRegistered ? 'Kelola' : 'Daftar / Masuk'}
            </button>
          </div>

          {/* 3. Subscription Status (PRO vs FREE) */}
          <div
            onClick={() => {
              onClose();
              onOpenPlanModal();
            }}
            className="bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-2xl p-3 flex items-center justify-between gap-3 cursor-pointer hover:ring-2 hover:ring-amber-400/50 transition-all shadow-xs"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-400/20 border border-amber-400/30 flex items-center justify-center text-amber-400 text-lg shrink-0">
                👑
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-black">
                    Paket: {userAccount.planTier === 'pro' ? 'PRO LIFETIME / TAHUNAN' : 'PAKET FREE'}
                  </span>
                  <span className={`text-[8px] font-black px-1.5 py-0.2 rounded-full ${
                    userAccount.planTier === 'pro'
                      ? 'bg-amber-400 text-amber-950'
                      : 'bg-slate-700 text-slate-200'
                  }`}>
                    {userAccount.planTier === 'pro' ? 'AKTIF' : 'GRATIS'}
                  </span>
                </div>
                <p className="text-[10px] text-slate-300 mt-0.5">
                  {userAccount.planTier === 'pro'
                    ? 'Akses penuh 30 Juz & Koreksi AI Tartil'
                    : 'Bandingkan fitur & upgrade ke PRO'}
                </p>
              </div>
            </div>

            <span className="text-[10px] font-bold text-amber-300 bg-white/10 px-2 py-1 rounded-lg shrink-0">
              Lihat Detail →
            </span>
          </div>

          {/* 4. Quick Actions: Parent Dashboard & AI Tokens */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                onClose();
                onOpenParentDashboard();
              }}
              className="p-2.5 rounded-2xl bg-white border border-[#C9E1ED] hover:border-[#164C68] flex items-center gap-2 text-left cursor-pointer transition-all shadow-2xs group"
            >
              <div className="w-8 h-8 rounded-xl bg-cyan-50 text-[#164C68] flex items-center justify-center shrink-0 group-hover:bg-[#164C68] group-hover:text-white transition-colors">
                <ShieldCheck size={16} />
              </div>
              <div className="min-w-0">
                <span className="text-xs font-bold text-[#164C68] block truncate">
                  Dasbor Wali
                </span>
                <span className="text-[9px] text-slate-500 block truncate">
                  Grafik & PIN
                </span>
              </div>
            </button>

            {onOpenAiTokens && (
              <button
                onClick={() => {
                  onClose();
                  onOpenAiTokens();
                }}
                className="p-2.5 rounded-2xl bg-white border border-[#C9E1ED] hover:border-[#08B9EF] flex items-center gap-2 text-left cursor-pointer transition-all shadow-2xs group"
              >
                <div className="w-8 h-8 rounded-xl bg-cyan-50 text-[#08B9EF] flex items-center justify-center shrink-0 group-hover:bg-[#08B9EF] group-hover:text-white transition-colors">
                  <Coins size={16} />
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-bold text-[#164C68] block truncate">
                    Token AI Guru
                  </span>
                  <span className="text-[9px] text-slate-500 block truncate">
                    {userAccount.aiTokensBalance || 0} Token
                  </span>
                </div>
              </button>
            )}
          </div>

          {/* 5. Destination Link: Full Account Page */}
          <button
            onClick={() => {
              onClose();
              onNavigateToAkunTab();
            }}
            className="w-full py-2.5 px-4 rounded-2xl bg-[#164C68] hover:bg-[#0f3447] text-white text-xs font-black flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
          >
            <User size={14} />
            <span>Buka Halaman Akun & Pengaturan Lengkap</span>
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};
