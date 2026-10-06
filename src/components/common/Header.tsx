import React from 'react';
import { ArrowLeft, Flame, Star, Home, Sparkles, BookOpen, Compass, User, Crown } from 'lucide-react';
import { ChildProfile, NavigationTab, UserAccount } from '../../types';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  onBack?: () => void;
  activeChild?: ChildProfile;
  onSelectChild?: () => void;
  rightAction?: React.ReactNode;
  userAccount?: UserAccount;
  onOpenAuth?: (mode: 'login' | 'register' | 'switch') => void;
  onOpenPlanModal?: () => void;
  activeTab?: NavigationTab;
  onTabChange?: (tab: NavigationTab) => void;
  murojaahDueCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  onBack,
  activeChild,
  onSelectChild,
  rightAction,
  userAccount,
  onOpenAuth,
  onOpenPlanModal,
  activeTab,
  onTabChange,
  murojaahDueCount = 0,
}) => {
  const desktopTabs = [
    { id: 'beranda' as NavigationTab, label: 'Beranda', icon: Home },
    { id: 'tahfiz' as NavigationTab, label: 'Tahfiz', icon: Sparkles, badge: murojaahDueCount > 0 ? murojaahDueCount : undefined },
    { id: 'alquran' as NavigationTab, label: "Al-Qur'an", icon: BookOpen },
    { id: 'game' as NavigationTab, label: 'Dunia & Petualangan', icon: Compass },
    { id: 'akun' as NavigationTab, label: 'Akun & Profil', icon: User },
  ];

  return (
    <header className="sticky top-0 z-30 bg-[#EEF8FF]/95 backdrop-blur-md px-4 py-2.5 border-b border-[#C9E1ED]/60 flex items-center justify-between min-h-[58px]">
      {/* Zone 1: Left Action / Child Avatar & Brand */}
      <div className="flex items-center gap-3">
        {onBack ? (
          <button
            onClick={onBack}
            aria-label="Kembali"
            className="flex items-center justify-center w-10 h-10 rounded-full bg-white border border-[#C9E1ED] text-[#164C68] hover:bg-[#EEF8FF] active:scale-95 transition-all shadow-xs"
          >
            <ArrowLeft size={20} strokeWidth={2.5} />
          </button>
        ) : activeChild ? (
          <button
            onClick={onSelectChild}
            aria-label="Ganti Profil Anak"
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-[#C9E1ED] hover:border-[#08B9EF] active:scale-98 transition-all shadow-xs cursor-pointer"
          >
            <span className="text-xl" role="img" aria-label="Avatar">
              {activeChild.avatar}
            </span>
            <span className="text-xs font-black text-[#164C68] max-w-[90px] truncate">
              {activeChild.name}
            </span>
          </button>
        ) : (
          <div className="w-10" />
        )}

        <div className="hidden lg:flex items-center gap-1.5 pl-1 border-l border-[#C9E1ED]">
          <span className="text-base">✨</span>
          <span className="text-xs font-black text-[#164C68] tracking-tight">Cahaya Tahfiz</span>
        </div>
      </div>

      {/* Zone 2: Desktop Navigation Bar (Tablet / PC) or Title (Mobile) */}
      <div className="flex-1 px-2 flex justify-center">
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
                  <Icon size={15} strokeWidth={isActive ? 2.5 : 2} />
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

        <div className={`${activeTab && onTabChange ? 'md:hidden' : ''} text-center overflow-hidden`}>
          <h1 className="text-sm sm:text-base font-bold text-[#164C68] truncate font-heading tracking-tight">
            {title || 'Cahaya Tahfiz'}
          </h1>
          {subtitle && (
            <p className="text-[10px] sm:text-[11px] text-[#8C9BA7] font-medium truncate -mt-0.5">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {/* Zone 3: Right Stats & Badges */}
      <div className="flex items-center gap-1.5">
        {rightAction ? (
          rightAction
        ) : activeChild ? (
          <div className="flex items-center gap-1.5">
            {/* Streak */}
            <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-orange-50 border border-orange-200/80 text-orange-600 text-xs font-bold shadow-2xs">
              <Flame size={14} className="fill-orange-500 text-orange-500" />
              <span>{activeChild.streakDays}</span>
            </div>

            {/* Stars */}
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-yellow-50 border border-yellow-200/80 text-amber-700 text-xs font-bold shadow-2xs">
              <Star size={14} className="fill-yellow-400 text-yellow-500" />
              <span>{activeChild.totalStars}</span>
            </div>

            {/* Pro vs Free Plan Badge */}
            {onOpenPlanModal && (
              <button
                onClick={onOpenPlanModal}
                aria-label="Klasifikasi Fitur PRO vs FREE"
                title="Lihat Perbandingan Fitur FREE vs PRO"
                className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black shadow-2xs transition-all cursor-pointer ${
                  userAccount?.planTier === 'pro'
                    ? 'bg-gradient-to-r from-amber-400 to-yellow-400 text-amber-950 hover:brightness-105'
                    : 'bg-emerald-50 border border-emerald-300 text-emerald-800 hover:bg-emerald-100'
                }`}
              >
                <span>{userAccount?.planTier === 'pro' ? '👑' : '🌱'}</span>
                <span className="text-[10px] font-black uppercase">
                  {userAccount?.planTier === 'pro' ? 'PRO' : 'FREE'}
                </span>
              </button>
            )}

            {/* Hijalearn-style Auth Actions (Masuk & Mulai gratis) */}
            {onOpenAuth && (
              <div className="flex items-center gap-1.5 pl-1 border-l border-[#C9E1ED]/80">
                {!userAccount?.isRegistered ? (
                  <>
                    <button
                      onClick={() => onOpenAuth('login')}
                      className="hidden sm:inline-block text-xs font-bold text-[#164C68] hover:text-[#08B9EF] px-2 py-1 cursor-pointer transition-colors"
                    >
                      Masuk
                    </button>
                    <button
                      onClick={() => onOpenAuth('register')}
                      className="px-3 py-1.5 rounded-xl bg-[#22C55E] hover:bg-[#16A34A] text-slate-950 font-black text-xs shadow-xs hover:shadow-md cursor-pointer transition-all active:scale-95 whitespace-nowrap"
                    >
                      Mulai gratis
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => onOpenAuth('switch')}
                    className="flex items-center gap-1.5 text-[11px] font-extrabold text-[#164C68] hover:text-[#08B9EF] bg-white border border-[#C9E1ED] hover:border-[#08B9EF] px-2.5 py-1 rounded-xl shadow-xs cursor-pointer transition-colors"
                    title={`Akun: ${userAccount.parentName} (${userAccount.authProvider || 'Email'}) - Klik untuk Ganti Akun`}
                  >
                    <span>{userAccount.authProvider === 'google' ? '🌐' : userAccount.authProvider === 'whatsapp' ? '💬' : '👤'}</span>
                    <span className="max-w-[80px] truncate hidden sm:inline">{userAccount.parentName.split(' ')[0]}</span>
                    <span className="text-[9px] text-[#08B9EF] font-bold">⇄</span>
                  </button>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="w-10" />
        )}
      </div>
    </header>
  );
};
