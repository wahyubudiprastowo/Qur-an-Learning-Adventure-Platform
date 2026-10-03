import React from 'react';
import { Home, Sparkles, BookOpen, Gamepad2, User } from 'lucide-react';
import { NavigationTab } from '../../types';

interface BottomNavigationProps {
  activeTab: NavigationTab;
  onTabChange: (tab: NavigationTab) => void;
  murojaahDueCount?: number;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  activeTab,
  onTabChange,
  murojaahDueCount = 0,
}) => {
  const tabs = [
    { id: 'beranda' as NavigationTab, label: 'Beranda', icon: Home },
    { id: 'tahfiz' as NavigationTab, label: 'Tahfiz', icon: Sparkles, badge: murojaahDueCount > 0 ? murojaahDueCount : undefined },
    { id: 'alquran' as NavigationTab, label: "Al-Qur'an", icon: BookOpen },
    { id: 'game' as NavigationTab, label: 'Game', icon: Gamepad2 },
    { id: 'akun' as NavigationTab, label: 'Akun', icon: User },
  ];

  return (
    <nav
      aria-label="Navigasi Utama"
      className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#C9E1ED] shadow-[0_-4px_16px_rgba(22,76,104,0.06)]"
    >
      <div className="max-w-md mx-auto grid grid-cols-5 h-16 items-center px-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center justify-center min-h-[48px] min-w-[48px] py-1 transition-all duration-150 relative rounded-2xl ${
                isActive ? 'text-[#08B9EF]' : 'text-[#8C9BA7] hover:text-[#164C68]'
              }`}
            >
              <div className="relative">
                <Icon
                  size={24}
                  strokeWidth={isActive ? 2.5 : 2}
                  className={`transition-transform duration-150 ${isActive ? 'scale-110' : ''}`}
                />
                {tab.badge ? (
                  <span className="absolute -top-1.5 -right-2.5 bg-[#FF946F] text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full border-2 border-white shadow-xs">
                    {tab.badge}
                  </span>
                ) : null}
              </div>
              <span
                className={`text-[11px] font-semibold tracking-tight mt-0.5 whitespace-nowrap transition-colors ${
                  isActive ? 'text-[#08B9EF] font-bold' : 'text-[#8C9BA7]'
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
