import React, { useState } from 'react';
import {
  User,
  Shield,
  Star,
  Sparkles,
  Flame,
  Award,
  Settings,
  ChevronRight,
  PlusCircle,
  Clock,
  LogOut,
  BarChart3,
} from 'lucide-react';
import { ChildProfile, UserAccount, PointsLedgerEntry } from '../../types';
import { StorageService } from '../../services/storageService';
import { getLevelForXp, ACHIEVEMENTS_CATALOG } from '../../data/levelsAndAchievements';
import { Button } from '../common/Button';
import { ParentDashboardModal } from './ParentDashboardModal';
import { ChildProfileModal } from './ChildProfileModal';
import { WeeklyProgressModal } from '../progress/WeeklyProgressModal';
import { ProVsFreeModal } from '../subscription/ProVsFreeModal';
import { AuthModal } from '../auth/AuthModal';

interface AkunHomeProps {
  userAccount: UserAccount;
  activeChild: ChildProfile;
  childrenList: ChildProfile[];
  onSwitchChild: (childId: string) => void;
  onRefreshData: () => void;
}

export const AkunHome: React.FC<AkunHomeProps> = ({
  userAccount,
  activeChild,
  childrenList,
  onSwitchChild,
  onRefreshData,
}) => {
  const [showParentModal, setShowParentModal] = useState<boolean>(false);
  const [showAddChildModal, setShowAddChildModal] = useState<boolean>(false);
  const [showWeeklyReportModal, setShowWeeklyReportModal] = useState<boolean>(false);
  const [showPlanModal, setShowPlanModal] = useState<boolean>(false);
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [ledgerEntries] = useState<PointsLedgerEntry[]>(() =>
    StorageService.getLedger(activeChild.id)
  );

  const levelInfo = getLevelForXp(activeChild.totalXp);

  return (
    <div className="space-y-4 pb-24 animate-in fade-in duration-200">
      {/* Active Child Profile Card */}
      <div className="bg-white border-2 border-[#C9E1ED] rounded-3xl p-5 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-3.5">
          <div className="w-16 h-16 rounded-3xl bg-cyan-50 border border-cyan-200 flex items-center justify-center text-4xl shadow-xs shrink-0">
            {activeChild.avatar}
          </div>
          <div>
            <h2 className="text-xl font-black text-[#164C68] font-heading">
              {activeChild.name}
            </h2>
            <div className="flex items-center gap-2 text-xs font-bold text-[#8C9BA7] mt-0.5">
              <span>{levelInfo.badge} Level {levelInfo.level}</span>
              <span>•</span>
              <span className="text-amber-600 flex items-center gap-0.5">
                <Star size={12} className="fill-amber-400 text-amber-500" />
                {activeChild.totalStars} Bintang
              </span>
            </div>
            <span className="inline-block mt-1 text-[10px] font-bold text-cyan-800 bg-cyan-100 px-2 py-0.2 rounded-full uppercase">
              Tingkat: {activeChild.learningLevel}
            </span>
          </div>
        </div>
      </div>

      {/* Switch Child Profile Horizontal Bar */}
      <div className="bg-white border border-[#C9E1ED] rounded-3xl p-4 shadow-xs space-y-2.5">
        <div className="flex items-center justify-between text-xs font-bold text-[#8C9BA7]">
          <span className="uppercase tracking-wider">PROFIL ANAK TERDAFTAR</span>
          <button
            onClick={() => setShowAddChildModal(true)}
            className="text-[#08B9EF] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <PlusCircle size={14} />
            <span>Tambah Anak</span>
          </button>
        </div>

        <div className="flex gap-2.5 overflow-x-auto pb-1">
          {childrenList.map((c) => {
            const isSelected = c.id === activeChild.id;

            return (
              <button
                key={c.id}
                onClick={() => onSwitchChild(c.id)}
                className={`flex items-center gap-2 py-2 px-3.5 rounded-2xl border-2 transition-all cursor-pointer whitespace-nowrap ${
                  isSelected
                    ? 'border-[#08B9EF] bg-cyan-50/40 shadow-xs'
                    : 'border-[#C9E1ED] hover:border-slate-300'
                }`}
              >
                <span className="text-xl">{c.avatar}</span>
                <div className="text-left">
                  <div className="text-xs font-bold text-[#164C68]">{c.name}</div>
                  <div className="text-[10px] text-[#8C9BA7]">⭐ {c.totalStars}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Weekly Progress Report CTA Card (Visual Charts with Recharts) */}
      <div
        onClick={() => setShowWeeklyReportModal(true)}
        className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-white rounded-3xl p-5 shadow-md shadow-emerald-500/20 flex items-center justify-between cursor-pointer active:scale-[0.99] transition-all group"
      >
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center text-white backdrop-blur-xs">
            <BarChart3 size={26} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-black font-heading">
                Laporan Progres Mingguan Anak
              </h3>
              <span className="text-[10px] bg-white/25 px-2 py-0.2 rounded-full font-bold">
                Grafik Visual
              </span>
            </div>
            <p className="text-xs text-teal-50 font-medium mt-0.5">
              Grafik Recharts pencapaian Ziadah, Murojaah, dan Skor Mutqin
            </p>
          </div>
        </div>

        <ChevronRight size={22} className="text-white group-hover:translate-x-1 transition-transform" />
      </div>

      {/* Klasifikasi Fitur PRO vs FREE Card */}
      <div
        onClick={() => setShowPlanModal(true)}
        className="bg-gradient-to-r from-[#0F172A] via-[#1E293B] to-[#0F172A] text-white rounded-3xl p-5 shadow-lg shadow-slate-950/20 border border-slate-700/80 flex items-center justify-between cursor-pointer active:scale-[0.99] transition-all group"
      >
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-amber-400/20 border border-amber-400/30 flex items-center justify-center text-amber-400 text-2xl shrink-0">
            👑
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-black font-heading">
                Klasifikasi Fitur PRO & FREE
              </h3>
              <span
                className={`text-[10px] font-black px-2 py-0.2 rounded-full border ${
                  userAccount.planTier === 'pro'
                    ? 'bg-amber-400 text-amber-950 border-amber-300'
                    : 'bg-[#22C55E]/20 text-[#22C55E] border-[#22C55E]/40'
                }`}
              >
                {userAccount.planTier === 'pro' ? 'PRO AKTIF' : 'PAKET FREE'}
              </span>
            </div>
            <p className="text-xs text-slate-300 font-medium mt-0.5">
              Bandingkan hak akses 30 Juz, AI voice analysis, & 5 karakter Tamagotchi
            </p>
          </div>
        </div>

        <ChevronRight size={22} className="text-amber-400 group-hover:translate-x-1 transition-transform" />
      </div>

      {/* Account / Registration Status Card (Hijalearn-style Auth trigger) */}
      <div
        onClick={() => setShowAuthModal(true)}
        className="bg-white border-2 border-[#C9E1ED] rounded-3xl p-5 shadow-xs flex items-center justify-between cursor-pointer hover:border-[#22C55E] transition-all group"
      >
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-[#22C55E] text-2xl shrink-0">
            {userAccount.isRegistered ? '✅' : '📝'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-black text-[#164C68] font-heading">
                {userAccount.isRegistered ? `Akun Terdaftar: ${userAccount.parentName}` : 'Daftar / Masuk Akun Orang Tua'}
              </h3>
              <span className={`text-[9px] font-bold px-2 py-0.2 rounded-full ${
                userAccount.isRegistered ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
              }`}>
                {userAccount.isRegistered ? 'Online' : 'Tamu'}
              </span>
            </div>
            <p className="text-xs text-[#8C9BA7] font-medium mt-0.5">
              {userAccount.isRegistered
                ? userAccount.email
                : 'Simpan progres hafalan anak ke cloud & akses multi-perangkat'}
            </p>
          </div>
        </div>

        <span className="text-xs font-bold text-[#22C55E] group-hover:underline">
          {userAccount.isRegistered ? 'Kelola' : 'Daftar Sekarang →'}
        </span>
      </div>

      {/* Parent Mode CTA Card */}
      <div
        onClick={() => setShowParentModal(true)}
        className="bg-gradient-to-r from-[#164C68] to-[#103a50] text-white rounded-3xl p-5 shadow-md shadow-slate-900/20 flex items-center justify-between cursor-pointer active:scale-[0.99] transition-all group"
      >
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-cyan-300">
            <Shield size={26} />
          </div>
          <div>
            <h3 className="text-base font-black font-heading">
              Dashboard & Evaluasi Orang Tua
            </h3>
            <p className="text-xs text-cyan-100 font-medium mt-0.5">
              Pantau rekaman suara anak, ayat lemah, & privasi
            </p>
          </div>
        </div>

        <ChevronRight size={22} className="text-cyan-200 group-hover:translate-x-1 transition-transform" />
      </div>

      {/* Achievements / Lencana Badge Section */}
      <div className="space-y-2.5">
        <span className="text-xs font-black text-[#8C9BA7] uppercase tracking-wider block px-1">
          LENCANA PENGHARGAAN
        </span>

        <div className="grid grid-cols-2 gap-3">
          {ACHIEVEMENTS_CATALOG.slice(0, 4).map((ach) => (
            <div
              key={ach.id}
              className="bg-white border border-[#C9E1ED] rounded-3xl p-4 shadow-xs flex items-center gap-3"
            >
              <div className="w-11 h-11 rounded-2xl bg-[#EEF8FF] border border-[#C9E1ED] flex items-center justify-center text-2xl shrink-0">
                {ach.icon}
              </div>
              <div className="min-w-0">
                <h4 className="text-xs font-black text-[#164C68] truncate font-heading">
                  {ach.title}
                </h4>
                <p className="text-[10px] text-[#8C9BA7] font-medium truncate mt-0.5">
                  {ach.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Points & Stars Ledger History */}
      <div className="bg-white border border-[#C9E1ED] rounded-3xl p-4 shadow-xs space-y-3">
        <div className="flex items-center justify-between text-xs font-bold text-[#8C9BA7]">
          <span className="uppercase tracking-wider">RIWAYAT PEROLEHAN BINTANG</span>
          <span className="text-[#08B9EF]">{ledgerEntries.length} aktivitas</span>
        </div>

        <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
          {ledgerEntries.slice(0, 8).map((entry) => (
            <div
              key={entry.id}
              className="p-2.5 bg-[#EEF8FF]/60 rounded-xl flex items-center justify-between text-xs border border-[#C9E1ED]/40"
            >
              <div className="truncate mr-2">
                <span className="font-bold text-[#164C68] block truncate">
                  {entry.description}
                </span>
                <span className="text-[10px] text-[#8C9BA7]">
                  {new Date(entry.createdAt).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="font-black text-amber-600 flex items-center gap-0.5">
                  <Star size={12} className="fill-amber-400 text-amber-500" />
                  +{entry.stars}
                </span>
                <span className="font-bold text-[#08B9EF]">
                  +{entry.points} XP
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Parent Dashboard Modal */}
      <ParentDashboardModal
        isOpen={showParentModal}
        onClose={() => setShowParentModal(false)}
        userAccount={userAccount}
        activeChild={activeChild}
        childrenList={childrenList}
        onSwitchChild={(id) => {
          onSwitchChild(id);
          setShowParentModal(false);
        }}
      />

      {/* Add Child Modal */}
      <ChildProfileModal
        isOpen={showAddChildModal}
        onClose={() => setShowAddChildModal(false)}
        onChildCreated={(newChild) => {
          onSwitchChild(newChild.id);
          onRefreshData();
        }}
      />

      {/* Weekly Progress Report Modal (Recharts Charts) */}
      <WeeklyProgressModal
        isOpen={showWeeklyReportModal}
        onClose={() => setShowWeeklyReportModal(false)}
        activeChild={activeChild}
      />

      {/* Pro vs Free Feature Classification Modal */}
      <ProVsFreeModal
        isOpen={showPlanModal}
        onClose={() => setShowPlanModal(false)}
        userAccount={userAccount}
        onPlanChanged={() => onRefreshData()}
      />

      {/* Hijalearn-style Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        initialMode={userAccount.isRegistered ? 'login' : 'register'}
        onClose={() => setShowAuthModal(false)}
        onAuthSuccess={() => onRefreshData()}
      />
    </div>
  );
};
