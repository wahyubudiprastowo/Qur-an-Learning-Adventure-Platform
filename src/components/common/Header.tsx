import React, { useState } from 'react';
import {
  ArrowLeft,
  Flame,
  Star,
  Home,
  Sparkles,
  BookOpen,
  Compass,
  User,
  Crown,
  Moon,
  ChevronDown,
} from 'lucide-react';
import { ChildProfile, NavigationTab, UserAccount } from '../../types';
import { StorageService } from '../../services/storageService';
import { ChildMenuModal } from './ChildMenuModal';
import { ParentMenuModal } from './ParentMenuModal';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  onBack?: () => void;
  activeChild?: ChildProfile;
  childrenList?: ChildProfile[];
  onSwitchChild?: (childId: string) => void;
  onOpenAddChild?: () => void;
  rightAction?: React.ReactNode;
  userAccount?: UserAccount;
  onOpenAuth?: (mode: 'login' | 'register' | 'switch') => void;
  onOpenPlanModal?: () => void;
  onOpenParentDashboard?: () => void;
  onOpenAiTokens?: () => void;
  activeTab?: NavigationTab;
  onTabChange?: (tab: NavigationTab) => void;
  murojaahDueCount?: number;
  onOpenIbadahModal?: (tab?: 'jadwal' | 'adab' | 'doa' | 'tasbih' | 'notifikasi') => void;
  onOpenStarShop?: () => void;
  onOpenChildSwitcher?: () => void;
  onAccountUpdated?: (account: UserAccount) => void;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  onBack,
  activeChild,
  childrenList = [],
  onSwitchChild,
  onOpenAddChild,
  rightAction,
  userAccount,
  onOpenAuth,
  onOpenPlanModal,
  onOpenParentDashboard,
  onOpenAiTokens,
  activeTab,
  onTabChange,
  murojaahDueCount = 0,
  onOpenStarShop,
  onOpenChildSwitcher,
  onAccountUpdated,
}) => {
  const [showChildMenu, setShowChildMenu] = useState<boolean>(false);
  const [showParentMenu, setShowParentMenu] = useState<boolean>(false);

  // 5 Clean Core Learning Navigation Tabs on Desktop (Anti-clutter)
  const desktopTabs = [
    { id: 'beranda' as NavigationTab, label: 'Beranda', icon: Home },
    {
      id: 'tahfiz' as NavigationTab,
      label: 'Tahfiz',
      icon: Sparkles,
      badge: murojaahDueCount > 0 ? murojaahDueCount : undefined,
    },
    { id: 'alquran' as NavigationTab, label: "Al-Qur'an", icon: BookOpen },
    { id: 'ibadah' as NavigationTab, label: 'Ibadah & Adab', icon: Moon },
    { id: 'game' as NavigationTab, label: 'Dunia Game', icon: Compass },
  ];

  return (
    <>
      <header className="sticky top-0 z-30 bg-[#EEF8FF]/95 backdrop-blur-md px-3 sm:px-5 py-2.5 border-b border-[#C9E1ED]/60 flex items-center justify-between min-h-[58px]">
        {/* Zone 1: Left Brand or Back Button */}
        <div className="flex items-center gap-2.5 shrink-0">
          {onBack ? (
            <button
              onClick={onBack}
              aria-label="Kembali"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-[#C9E1ED] text-[#164C68] hover:bg-[#EEF8FF] active:scale-95 transition-all shadow-xs cursor-pointer text-xs font-bold"
            >
              <ArrowLeft size={16} strokeWidth={2.5} />
              <span className="hidden sm:inline">Kembali</span>
            </button>
          ) : (
            <div
              onClick={() => onTabChange && onTabChange('beranda')}
              className="flex items-center gap-2 cursor-pointer group"
              title="Cahaya Tahfiz - Beranda"
            >
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#08B9EF] to-teal-400 text-white flex items-center justify-center font-black text-sm shadow-xs group-hover:scale-105 transition-transform shrink-0">
                ✨
              </div>
              <div className="hidden sm:block">
                <span className="text-sm font-black text-[#164C68] font-heading tracking-tight block leading-none">
                  Cahaya Tahfiz
                </span>
                <span className="text-[10px] text-[#8C9BA7] font-bold block leading-none mt-0.5">
                  Santri AI & Qur'an
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Zone 2: Center Primary Navigation (Desktop) or Title (Mobile) */}
        <div className="flex-1 px-2 flex justify-center min-w-0">
          {activeTab && onTabChange ? (
            <div className="hidden md:flex items-center gap-1 bg-white/90 border border-[#C9E1ED] p-1 rounded-2xl shadow-xs">
              {desktopTabs.map((t) => {
                const Icon = t.icon;
                const isActive = activeTab === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => onTabChange(t.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer relative ${
                      isActive
                        ? 'bg-[#08B9EF] text-white shadow-xs'
                        : 'text-[#8C9BA7] hover:text-[#164C68] hover:bg-slate-100/70'
                    }`}
                  >
                    <Icon size={14} strokeWidth={isActive ? 2.5 : 2} />
                    <span>{t.label}</span>
                    {t.badge ? (
                      <span className="bg-[#FF946F] text-white text-[9px] font-black px-1.5 py-0.2 rounded-full border border-white">
                        {t.badge}
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>
          ) : null}

          {/* Mobile Center Title */}
          <div className={`${activeTab && onTabChange ? 'md:hidden' : ''} text-center overflow-hidden px-1`}>
            <h1 className="text-xs sm:text-sm font-bold text-[#164C68] truncate font-heading tracking-tight">
              {title || 'Cahaya Tahfiz'}
            </h1>
            {subtitle && (
              <p className="text-[9px] sm:text-[10px] text-[#8C9BA7] font-medium truncate -mt-0.5">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Zone 3: Right Unified Stats & Clearly Separated Child vs Parent Triggers */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {rightAction ? (
            rightAction
          ) : activeChild ? (
            <div className="flex items-center gap-1 sm:gap-1.5">
              {/* Gamification Counters: Streak & Stars */}
              <div className="hidden lg:flex items-center gap-1 px-2 py-1 rounded-full bg-orange-50 border border-orange-200/80 text-orange-600 text-xs font-bold shadow-2xs">
                <Flame size={13} className="fill-orange-500 text-orange-500 shrink-0" />
                <span className="font-mono">{activeChild.streakDays}</span>
              </div>

              <button
                type="button"
                onClick={onOpenStarShop}
                className="hidden xs:flex items-center gap-1 px-2 py-1 rounded-full bg-yellow-50 hover:bg-yellow-100 border border-yellow-200/80 text-amber-700 text-xs font-bold shadow-2xs cursor-pointer active:scale-95 transition-all"
                title="Beli Bintang & Camilan Pet"
              >
                <Star size={13} className="fill-yellow-400 text-yellow-500 shrink-0" />
                <span className="font-mono">{activeChild.totalStars}</span>
                <span className="text-[10px] font-black text-amber-600 ml-0.5">+</span>
              </button>

              {/* 1. TOMBOL SANTRI (Menu Khusus Anak & Ganti Santri) */}
              <button
                type="button"
                onClick={() => setShowChildMenu(true)}
                aria-label={`Profil Santri: ${activeChild.name}`}
                className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1 rounded-2xl bg-white border border-[#C9E1ED] hover:border-[#08B9EF] active:scale-95 transition-all shadow-xs cursor-pointer group"
                title={`Profil Santri: ${activeChild.name} (Klik untuk Capaian, Bintang & Ganti Santri)`}
              >
                <span className="text-base sm:text-lg leading-none shrink-0" role="img" aria-label="Avatar Santri">
                  {activeChild.avatar}
                </span>

                <span className="text-xs font-black text-[#164C68] max-w-[60px] sm:max-w-[85px] truncate">
                  {activeChild.name}
                </span>

                <ChevronDown size={12} className="text-[#8C9BA7] group-hover:text-[#164C68] transition-colors shrink-0" />
              </button>

              {/* 2. TOMBOL MENU ORANG TUA (Parent Dashboard, Jenjang Akses & Akun) */}
              <button
                type="button"
                onClick={() => setShowParentMenu(true)}
                aria-label="Menu Orang Tua & Dasbor Wali"
                className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1 rounded-2xl bg-gradient-to-r from-slate-50 to-cyan-50/80 border border-[#C9E1ED] hover:border-[#164C68] active:scale-95 transition-all shadow-xs cursor-pointer group"
                title={`Menu Orang Tua (${StorageService.getAccountTier(userAccount).toUpperCase()}) - Dasbor Wali, Jenjang & Pengaturan`}
              >
                <span className="text-sm sm:text-base leading-none shrink-0" role="img" aria-label="Orang Tua">
                  👨‍👧
                </span>

                <span className="hidden sm:inline text-xs font-black text-[#164C68]">
                  Orang Tua
                </span>

                {(() => {
                  const tier = StorageService.getAccountTier(userAccount);
                  return (
                    <span
                      className={`text-[9px] font-black px-1.5 py-0.2 rounded-md uppercase shrink-0 ${
                        tier === 'pro'
                          ? 'bg-amber-400 text-amber-950 font-bold shadow-2xs'
                          : tier === 'free'
                          ? 'bg-emerald-100 text-emerald-800 font-bold border border-emerald-300'
                          : 'bg-amber-100 text-amber-900 font-bold border border-amber-300'
                      }`}
                    >
                      {tier === 'pro' ? 'PRO 👑' : tier === 'free' ? 'FREE' : 'TAMU'}
                    </span>
                  );
                })()}
              </button>
            </div>
          ) : (
            <div className="w-8" />
          )}
        </div>
      </header>

      {/* 1. Modal Menu Santri (Khusus Anak: Bintang, Ganti Santri, Pet) */}
      {activeChild && userAccount && (
        <ChildMenuModal
          isOpen={showChildMenu}
          onClose={() => setShowChildMenu(false)}
          activeChild={activeChild}
          childrenList={childrenList.length > 0 ? childrenList : [activeChild]}
          userAccount={userAccount}
          onSwitchChild={(childId) => {
            if (onSwitchChild) onSwitchChild(childId);
          }}
          onOpenAddChild={() => {
            if (onOpenAddChild) onOpenAddChild();
          }}
          onOpenStarShop={onOpenStarShop}
          onOpenCompanionRoom={() => {
            if (onTabChange) onTabChange('game');
          }}
        />
      )}

      {/* 2. Modal Menu Orang Tua (Khusus Wali: Jenjang Akun Guest/Free/Pro, Dasbor Wali, Token AI, PIN) */}
      {activeChild && userAccount && (
        <ParentMenuModal
          isOpen={showParentMenu}
          onClose={() => setShowParentMenu(false)}
          userAccount={userAccount}
          activeChild={activeChild}
          childrenList={childrenList.length > 0 ? childrenList : [activeChild]}
          onOpenAuth={(mode) => {
            if (onOpenAuth) onOpenAuth(mode);
          }}
          onOpenPlanModal={() => {
            if (onOpenPlanModal) onOpenPlanModal();
          }}
          onOpenParentDashboard={() => {
            if (onOpenParentDashboard) {
              onOpenParentDashboard();
            } else if (onTabChange) {
              onTabChange('akun');
            }
          }}
          onOpenAiTokens={onOpenAiTokens}
          onOpenChildManager={() => {
            if (onOpenChildSwitcher) {
              onOpenChildSwitcher();
            } else {
              setShowChildMenu(true);
            }
          }}
          onNavigateToAkunTab={() => {
            if (onTabChange) onTabChange('akun');
          }}
          onAccountUpdated={(updatedAcc) => {
            if (onAccountUpdated) onAccountUpdated(updatedAcc);
          }}
        />
      )}
    </>
  );
};
