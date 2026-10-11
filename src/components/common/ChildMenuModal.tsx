import React from 'react';
import {
  X,
  Star,
  Flame,
  Sparkles,
  ShoppingBag,
  Home,
  Award,
  PlusCircle,
  Check,
  ChevronRight,
} from 'lucide-react';
import { ChildProfile, UserAccount } from '../../types';
import { getLevelForXp } from '../../data/levelsAndAchievements';

interface ChildMenuModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeChild: ChildProfile;
  childrenList: ChildProfile[];
  userAccount: UserAccount;
  onSwitchChild: (childId: string) => void;
  onOpenAddChild: () => void;
  onOpenStarShop?: () => void;
  onOpenCompanionRoom?: () => void;
  onOpenAchievements?: () => void;
}

export const ChildMenuModal: React.FC<ChildMenuModalProps> = ({
  isOpen,
  onClose,
  activeChild,
  childrenList,
  userAccount,
  onSwitchChild,
  onOpenAddChild,
  onOpenStarShop,
  onOpenCompanionRoom,
  onOpenAchievements,
}) => {
  if (!isOpen) return null;

  const levelInfo = getLevelForXp(activeChild.totalXp);
  const isPro = userAccount.planTier === 'pro';

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-end p-3 sm:p-5 bg-slate-950/40 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm sm:max-w-md bg-white rounded-3xl border-2 border-[#C9E1ED] shadow-2xl overflow-hidden mt-12 sm:mt-14 max-h-[90vh] flex flex-col text-left font-sans text-slate-800 animate-in slide-in-from-top-3 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Child Header: Colorful, kid-friendly */}
        <div className="p-4 bg-gradient-to-r from-[#08B9EF] via-cyan-500 to-teal-500 text-white flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">🎒</span>
            <div>
              <h3 className="text-sm font-black font-heading tracking-tight">
                Ruang Profil Santri
              </h3>
              <p className="text-[10px] text-cyan-100 font-medium">
                Pusat capaian, bintang, dan ganti profil belajar anak
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors cursor-pointer"
            aria-label="Tutup"
          >
            <X size={16} />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-4 space-y-3.5 overflow-y-auto">
          {/* 1. Main Active Child Card */}
          <div className="bg-gradient-to-br from-cyan-50 via-sky-50 to-emerald-50 border-2 border-cyan-200 rounded-3xl p-4 shadow-xs space-y-3">
            <div className="flex items-center gap-3.5">
              <div className="w-16 h-16 rounded-3xl bg-white border-2 border-cyan-300 flex items-center justify-center text-4xl shadow-xs shrink-0">
                {activeChild.avatar}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="text-base font-black text-[#164C68] truncate">
                    {activeChild.name}
                  </h4>
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-cyan-100 text-[#164C68] uppercase border border-cyan-300">
                    {activeChild.learningLevel}
                  </span>
                </div>
                <p className="text-xs text-slate-600 font-bold mt-0.5">
                  {levelInfo.badge} Level {levelInfo.level} ({levelInfo.title})
                </p>
              </div>
            </div>

            {/* Gamification Stats: Stars, XP, Streak */}
            <div className="grid grid-cols-3 gap-2 pt-1 text-center">
              <div className="bg-white/90 border border-amber-200 p-2 rounded-2xl shadow-2xs">
                <div className="flex items-center justify-center gap-1 text-amber-600 font-black text-sm">
                  <Star size={14} className="fill-amber-400 text-amber-500" />
                  <span>{activeChild.totalStars}</span>
                </div>
                <span className="text-[9px] font-bold text-slate-500 block mt-0.5">
                  Bintang
                </span>
              </div>

              <div className="bg-white/90 border border-purple-200 p-2 rounded-2xl shadow-2xs">
                <div className="flex items-center justify-center gap-1 text-purple-600 font-black text-sm">
                  <Sparkles size={14} />
                  <span>{activeChild.totalXp}</span>
                </div>
                <span className="text-[9px] font-bold text-slate-500 block mt-0.5">
                  Total XP
                </span>
              </div>

              <div className="bg-white/90 border border-orange-200 p-2 rounded-2xl shadow-2xs">
                <div className="flex items-center justify-center gap-1 text-orange-600 font-black text-sm">
                  <Flame size={14} className="fill-orange-500 text-orange-500" />
                  <span>{activeChild.streakDays}</span>
                </div>
                <span className="text-[9px] font-bold text-slate-500 block mt-0.5">
                  Hari Rajin
                </span>
              </div>
            </div>
          </div>

          {/* 2. Switch Child Profile List */}
          <div className="bg-white border-2 border-[#C9E1ED] rounded-2xl p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase text-[#8C9BA7] tracking-wider">
                GANTI SANTRI ({childrenList.length} ANAK)
              </span>
              <button
                onClick={() => {
                  onClose();
                  onOpenAddChild();
                }}
                className="text-[11px] font-bold text-[#08B9EF] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <PlusCircle size={13} />
                <span>Tambah Anak {isPro ? '👑' : ''}</span>
              </button>
            </div>

            <div className="space-y-1.5 max-h-40 overflow-y-auto pr-0.5">
              {childrenList.map((c) => {
                const isSelected = c.id === activeChild.id;
                return (
                  <button
                    key={c.id}
                    onClick={() => {
                      if (!isSelected) {
                        onSwitchChild(c.id);
                      }
                      onClose();
                    }}
                    className={`w-full p-2 rounded-xl flex items-center justify-between text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-cyan-500 text-white font-bold shadow-xs'
                        : 'bg-slate-50 hover:bg-slate-100 border border-slate-200 text-[#164C68]'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-xl shrink-0">{c.avatar}</span>
                      <div className="min-w-0">
                        <span className="text-xs font-bold truncate block">
                          {c.name}
                        </span>
                        <span className={`text-[10px] block ${isSelected ? 'text-cyan-100' : 'text-slate-500'}`}>
                          ⭐ {c.totalStars} Bintang • {c.learningLevel}
                        </span>
                      </div>
                    </div>

                    {isSelected ? (
                      <span className="text-[10px] bg-white text-cyan-700 px-2 py-0.5 rounded-full font-black">
                        Aktif
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-400 font-bold">
                        Pilih
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Kid Fun Shortcuts (Star Shop, Room, Badges) */}
          <div className="space-y-2">
            <span className="text-[10px] font-black uppercase text-[#8C9BA7] tracking-wider block px-1">
              AKTIVITAS & PRESTASI SANTRI
            </span>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  onClose();
                  if (onOpenStarShop) onOpenStarShop();
                }}
                className="p-3 rounded-2xl bg-amber-50 hover:bg-amber-100/80 border border-amber-200 text-left transition-all cursor-pointer shadow-2xs group flex items-start gap-2.5"
              >
                <div className="w-8 h-8 rounded-xl bg-amber-400 text-amber-950 flex items-center justify-center shrink-0 shadow-2xs font-bold text-sm">
                  🛍️
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-black text-amber-950 block truncate">
                    Toko Bintang
                  </span>
                  <span className="text-[10px] text-amber-700 font-medium block truncate">
                    Camilan & Kostum Pet
                  </span>
                </div>
              </button>

              <button
                onClick={() => {
                  onClose();
                  if (onOpenCompanionRoom) onOpenCompanionRoom();
                }}
                className="p-3 rounded-2xl bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200 text-left transition-all cursor-pointer shadow-2xs group flex items-start gap-2.5"
              >
                <div className="w-8 h-8 rounded-xl bg-emerald-400 text-emerald-950 flex items-center justify-center shrink-0 shadow-2xs font-bold text-sm">
                  🏡
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-black text-emerald-950 block truncate">
                    Sahabat Belajar
                  </span>
                  <span className="text-[10px] text-emerald-700 font-medium block truncate">
                    Kamar Maskot Pet
                  </span>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Modal Footer Note */}
        <div className="p-3 bg-slate-50 border-t border-slate-100 text-center">
          <p className="text-[11px] text-slate-500 font-medium">
            💡 Untuk kontrol orang tua & langganan, gunakan tombol <strong>"Orang Tua"</strong> di samping.
          </p>
        </div>
      </div>
    </div>
  );
};
