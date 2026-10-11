/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useLayoutEffect } from 'react';
import { NavigationTab, ChildProfile, UserAccount, MemorizationBlock } from './types';
import { StorageService } from './services/storageService';
import { Header } from './components/common/Header';
import { BottomNavigation } from './components/common/BottomNavigation';
import { BerandaHome } from './components/beranda/BerandaHome';
import { TahfizHome } from './components/tahfiz/TahfizHome';
import { DengarModule } from './components/tahfiz/DengarModule';
import { LatihanMenu } from './components/tahfiz/LatihanMenu';
import { ZiadahModule } from './components/tahfiz/ZiadahModule';
import { ZiadahPlayer } from './components/tahfiz/ZiadahPlayer';
import { MurojaahModule } from './components/tahfiz/MurojaahModule';
import { HafalanModule } from './components/tahfiz/HafalanModule';
import { AlQuranHub, AlQuranSubmodule } from './components/alQuran/AlQuranHub';
import { IqraModule } from './components/alQuran/IqraModule';
import { TajwidModule } from './components/alQuran/TajwidModule';
import { TilawahModule } from './components/alQuran/TilawahModule';
import { BahasaQuranModule } from './components/alQuran/BahasaQuranModule';
import { TafsirModule } from './components/alQuran/TafsirModule';
import { AsbabNuzulModule } from './components/alQuran/AsbabNuzulModule';
import { GameHub } from './components/game/GameHub';
import { AkunHome } from './components/akun/AkunHome';
import { ChildProfileModal } from './components/akun/ChildProfileModal';
import { QuickChildSwitcherModal } from './components/akun/QuickChildSwitcherModal';
import { AuthModal } from './components/auth/AuthModal';
import { ProVsFreeModal } from './components/subscription/ProVsFreeModal';
import { PaymentCheckoutModal } from './components/subscription/PaymentCheckoutModal';
import { AiTokenTopupModal } from './components/subscription/AiTokenTopupModal';
import { StarShopModal } from './components/subscription/StarShopModal';
import { CompanionService } from './services/companionService';
import { GlobalAudioManager } from './services/audioService';
import { getBlocksForSurah } from './data/blocksData';
import { FloatingSocialShareDock } from './components/common/FloatingSocialShareDock';
import { ShareModal, SharePayload } from './components/common/ShareModal';
import { PusatIbadahDoaModal } from './components/ibadah/PusatIbadahDoaModal';
import { NotificationService, ReminderSchedule } from './services/notificationService';
import { X } from 'lucide-react';

export default function App() {
  // Navigation Tabs
  const [activeTab, setActiveTab] = useState<NavigationTab>('beranda');

  // Tahfiz Sub-State: 'home' | 'dengar' | 'latihan_menu' | 'ziadah_config' | 'ziadah_player' | 'murojaah' | 'hafalan'
  const [tahfizSubView, setTahfizSubView] = useState<string>('home');

  // Al-Quran Submodule
  const [alQuranSubView, setAlQuranSubView] = useState<AlQuranSubmodule>(null);

  // Sub-tab for Game / World Map ('map' | 'games' | 'room' | 'collection' | 'leaderboard')
  const [gameSubTab, setGameSubTab] = useState<'map' | 'games' | 'room' | 'collection' | 'leaderboard'>('map');

  // Active User & Child Profile State
  const [userAccount, setUserAccount] = useState<UserAccount>(() => StorageService.getUserAccount());
  const [childrenList, setChildrenList] = useState<ChildProfile[]>(() => StorageService.getChildren());
  const [activeChild, setActiveChild] = useState<ChildProfile>(() => StorageService.getActiveChild());

  // Child-specific Progress State
  const [blockProgressList, setBlockProgressList] = useState(() =>
    StorageService.getBlockProgress(activeChild.id)
  );
  const [ayahProgressList, setAyahProgressList] = useState(() =>
    StorageService.getAyahProgress(activeChild.id)
  );
  const [lastSession, setLastSession] = useState(() =>
    StorageService.getLastSession(activeChild.id)
  );

  // Ziadah Player Active Session Config
  const [activePracticeConfig, setActivePracticeConfig] = useState<{
    surahNumber: number;
    selectedBlocks: MemorizationBlock[];
    ayahRepeats: number;
    blockRepeats: number;
  } | null>(null);

  // Child Switcher & Creation Modals
  const [showQuickChildSwitcher, setShowQuickChildSwitcher] = useState<boolean>(false);
  const [showAddChildModal, setShowAddChildModal] = useState<boolean>(false);
  const [showStarShopModal, setShowStarShopModal] = useState<boolean>(false);
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register' | 'switch'>('register');
  const [showPlanModal, setShowPlanModal] = useState<boolean>(false);
  const [showCheckoutModal, setShowCheckoutModal] = useState<boolean>(false);
  const [showAiTokenModal, setShowAiTokenModal] = useState<boolean>(false);
  const [checkoutPlanId, setCheckoutPlanId] = useState<string>('1_year');
  const [sharePayload, setSharePayload] = useState<SharePayload | null>(null);
  const [showShareModal, setShowShareModal] = useState<boolean>(false);
  const [ibadahInitialTab, setIbadahInitialTab] = useState<'jadwal' | 'adab' | 'doa' | 'tasbih' | 'notifikasi'>('jadwal');
  const [activeInAppReminder, setActiveInAppReminder] = useState<ReminderSchedule | null>(null);

  const handleOpenIbadah = (tab?: 'jadwal' | 'adab' | 'doa' | 'tasbih' | 'notifikasi') => {
    GlobalAudioManager.stopAll();
    setIbadahInitialTab(tab || 'jadwal');
    setActiveTab('ibadah');
  };

  useEffect(() => {
    const unsubscribe = NotificationService.onInAppNotification((reminder) => {
      setActiveInAppReminder(reminder);
    });
    return () => unsubscribe();
  }, []);

  const [companion, setCompanion] = useState(() =>
    CompanionService.getCompanionData(activeChild.id)
  );

  // Stateful pet reaction: Daily login triggers morning greeting & vitals adjustment
  useEffect(() => {
    if (activeChild?.id) {
      const { companion: updatedComp } = CompanionService.onChildDailyLogin(activeChild.id);
      setCompanion(updatedComp);
    }
  }, [activeChild?.id]);

  // Emotive Expression: Thoughtful when exploring Al-Qur'an modules
  useEffect(() => {
    if (activeTab === 'alquran' && activeChild?.id) {
      const updated = CompanionService.onBrowsingQuran(
        activeChild.id,
        alQuranSubView || 'alquran'
      );
      setCompanion(updated);
    }
  }, [activeTab, alQuranSubView, activeChild?.id]);

  // Emotive Expression: Pet falls asleep peacefully when the app is idle for a long time
  useEffect(() => {
    if (!activeChild?.id) return;
    let timer: NodeJS.Timeout;

    const resetIdleTimer = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        const updated = CompanionService.onAppIdle(activeChild.id);
        setCompanion({ ...updated });
      }, 70000); // 70 seconds idle
    };

    const handleUserActivity = () => {
      resetIdleTimer();
    };

    window.addEventListener('mousemove', handleUserActivity, { passive: true });
    window.addEventListener('keydown', handleUserActivity, { passive: true });
    window.addEventListener('touchstart', handleUserActivity, { passive: true });
    window.addEventListener('click', handleUserActivity, { passive: true });

    resetIdleTimer();

    return () => {
      clearTimeout(timer);
      window.removeEventListener('mousemove', handleUserActivity);
      window.removeEventListener('keydown', handleUserActivity);
      window.removeEventListener('touchstart', handleUserActivity);
      window.removeEventListener('click', handleUserActivity);
    };
  }, [activeChild?.id]);

  // Global Audio Isolation: Stop all active audio streams across all modules whenever navigation changes.
  // useLayoutEffect runs synchronously before browser paint to prevent any overlapping audio or lingering UI states.
  useLayoutEffect(() => {
    GlobalAudioManager.stopAll();
    return () => {
      GlobalAudioManager.stopAll();
    };
  }, [activeTab, tahfizSubView, alQuranSubView]);

  // Unified Safe Navigation Controllers
  const navigateToTab = (tab: NavigationTab) => {
    GlobalAudioManager.stopAll();
    setActiveTab(tab);
    if (tab === 'tahfiz') {
      setTahfizSubView('home');
    } else if (tab === 'alquran') {
      setAlQuranSubView(null);
    }
  };

  const navigateTahfiz = (subView: string) => {
    GlobalAudioManager.stopAll();
    setTahfizSubView(subView);
  };

  const navigateAlQuran = (subView: AlQuranSubmodule) => {
    GlobalAudioManager.stopAll();
    setAlQuranSubView(subView);
  };

  const navigateGame = (subTab: 'map' | 'games' | 'room' | 'collection' | 'leaderboard' = 'map') => {
    GlobalAudioManager.stopAll();
    setActiveTab('game');
    setGameSubTab(subTab);
  };

  // Sync state whenever active child changes
  const refreshChildData = (childId: string) => {
    const updatedChild = StorageService.getActiveChild();
    setActiveChild(updatedChild);
    setBlockProgressList(StorageService.getBlockProgress(childId));
    setAyahProgressList(StorageService.getAyahProgress(childId));
    setLastSession(StorageService.getLastSession(childId));
    setCompanion(CompanionService.getCompanionData(childId));
  };

  const handleSwitchChild = (childId: string) => {
    GlobalAudioManager.stopAll();
    StorageService.setActiveChildId(childId);
    setChildrenList(StorageService.getChildren());
    refreshChildData(childId);
  };

  const handleDeleteChild = (childId: string) => {
    GlobalAudioManager.stopAll();
    StorageService.deleteChild(childId);
    const updated = StorageService.getChildren();
    setChildrenList(updated);
    const active = StorageService.getActiveChild();
    setActiveChild(active);
    refreshChildData(active.id);
  };

  const isPro = userAccount.planTier === 'pro' || userAccount.entitlement === 'active' || userAccount.entitlement === 'trial';

  const handleNavigateToModule = (actionType: string) => {
    GlobalAudioManager.stopAll();
    if (actionType === 'dengar') {
      setActiveTab('tahfiz');
      navigateTahfiz('dengar');
    } else if (actionType === 'ziadah') {
      setActiveTab('tahfiz');
      navigateTahfiz('ziadah_config');
    } else if (actionType === 'murojaah') {
      setActiveTab('tahfiz');
      navigateTahfiz('murojaah');
    } else if (actionType === 'hafalan') {
      setActiveTab('tahfiz');
      navigateTahfiz('hafalan');
    } else if (actionType === 'tilawah') {
      setActiveTab('alquran');
      navigateAlQuran('tilawah');
    } else if (actionType === 'iqra') {
      setActiveTab('alquran');
      navigateAlQuran('iqra');
    } else if (actionType === 'tajwid') {
      setActiveTab('alquran');
      navigateAlQuran('tajwid');
    } else if (actionType === 'vocab' || actionType === 'bahasa') {
      setActiveTab('alquran');
      navigateAlQuran('bahasa');
    } else if (actionType === 'tafsir') {
      setActiveTab('alquran');
      navigateAlQuran('tafsir');
    } else if (actionType === 'asbab') {
      setActiveTab('alquran');
      navigateAlQuran('asbab');
    } else if (actionType === 'game') {
      navigateGame('games');
    } else if (actionType === 'room') {
      navigateGame('room');
    } else if (actionType === 'map') {
      navigateGame('map');
    } else if (actionType === 'leaderboard') {
      navigateGame('leaderboard');
    }
  };

  // Resume last learning session directly
  const handleResumeLastSession = () => {
    GlobalAudioManager.stopAll();
    setActiveTab('tahfiz');
    if (lastSession.mode === 'dengar') {
      navigateTahfiz('dengar');
    } else if (lastSession.mode === 'hafalan') {
      navigateTahfiz('hafalan');
    } else {
      // Find matching block for instantaneous seamless practice
      const allBlocks = getBlocksForSurah(lastSession.surahNumber, 114);
      const targetBlock = allBlocks.find((b) => b.blockNumber === lastSession.blockNumber) || allBlocks[0];
      if (targetBlock) {
        setActivePracticeConfig({
          surahNumber: lastSession.surahNumber,
          selectedBlocks: [targetBlock],
          ayahRepeats: 3,
          blockRepeats: 3,
        });
        navigateTahfiz('ziadah_player');
      } else {
        navigateTahfiz('ziadah_config');
      }
    }
  };

  const handleStartPractice = (config: {
    surahNumber: number;
    selectedBlocks: MemorizationBlock[];
    ayahRepeats: number;
    blockRepeats: number;
  }) => {
    GlobalAudioManager.stopAll();
    setActivePracticeConfig(config);
    navigateTahfiz('ziadah_player');
  };

  const handleMarkBlocksMemorized = (surahNumber: number, blockNumbers: number[]) => {
    blockNumbers.forEach((num) => {
      StorageService.setBlockState(activeChild.id, surahNumber, num, 'MEMORIZED');
      StorageService.incrementBlockRepeat(activeChild.id, surahNumber, num);
    });
    refreshChildData(activeChild.id);
  };

  // Determine Back Button action & Header titles
  let headerTitle = 'Cahaya Tahfiz';
  let headerSubtitle = 'Belajar & Hafalan';
  let onBackHandler: (() => void) | undefined = undefined;

  if (activeTab === 'tahfiz') {
    if (tahfizSubView === 'dengar') {
      headerTitle = 'Dengar Murottal';
      headerSubtitle = 'Langkah 1: Kenali Nada';
      onBackHandler = () => navigateTahfiz('home');
    } else if (tahfizSubView === 'latihan_menu') {
      headerTitle = 'Pilih Mode Latihan';
      headerSubtitle = 'Langkah 2: Latihan Bertahap';
      onBackHandler = () => navigateTahfiz('home');
    } else if (tahfizSubView === 'ziadah_config') {
      headerTitle = 'Ziadah — Hafalan Baru';
      headerSubtitle = 'Atur Blok & Pengulangan';
      onBackHandler = () => navigateTahfiz('latihan_menu');
    } else if (tahfizSubView === 'ziadah_player') {
      headerTitle = 'Latihan Hafalan';
      headerSubtitle = 'Fokus Melafalkan';
      onBackHandler = () => navigateTahfiz('ziadah_config');
    } else if (tahfizSubView === 'murojaah') {
      headerTitle = 'Murojaah';
      headerSubtitle = 'Teks Dibuka Bertahap';
      onBackHandler = () => navigateTahfiz('latihan_menu');
    } else if (tahfizSubView === 'hafalan') {
      headerTitle = 'Uji Hafalan / Setoran';
      headerSubtitle = 'Langkah 3: Uji Mandiri Tanpa Teks';
      onBackHandler = () => navigateTahfiz('home');
    }
  } else if (activeTab === 'alquran' && alQuranSubView !== null) {
    if (alQuranSubView === 'iqra') {
      headerTitle = "Iqra' Anak";
      headerSubtitle = 'Mengenal Huruf & Harakat';
    } else if (alQuranSubView === 'tajwid') {
      headerTitle = 'Belajar Tajwid';
      headerSubtitle = 'Hukum Bacaan Tartil';
    } else if (alQuranSubView === 'tilawah') {
      headerTitle = 'Tilawah Mushaf';
      headerSubtitle = '114 Surah Lengkap';
    } else if (alQuranSubView === 'bahasa') {
      headerTitle = "Bahasa Al-Qur'an";
      headerSubtitle = 'Arti Kata demi Kata';
    } else if (alQuranSubView === 'tafsir') {
      headerTitle = 'Tafsir Kemenag';
      headerSubtitle = 'Pahami Makna Ayat';
    } else if (alQuranSubView === 'asbab') {
      headerTitle = 'Asbabun Nuzul';
      headerSubtitle = 'Kisah di Balik Surah';
    }
    onBackHandler = () => navigateAlQuran(null);
  } else if (activeTab === 'ibadah') {
    headerTitle = 'Pusat Ibadah, Adab & Doa';
    headerSubtitle = 'Jadwal Sholat, Daily Task Adab, Doa & Tasbih';
  } else if (activeTab === 'game') {
    headerTitle = 'Peta Dunia & Petualangan';
    headerSubtitle = 'Sahabat, Dunia & Game';
  } else if (activeTab === 'akun') {
    headerTitle = 'Pusat Akun & Sistem';
    headerSubtitle = 'Profil Santri, Orang Tua & Pengaturan';
  }

  const weakAyahsCount = ayahProgressList.filter((a) => a.needsReview).length;

  return (
    <div className="min-h-screen bg-[#D8EDF8] flex justify-center text-[#292742]">
      {/* Responsive Container Shell (Adaptive phone canvas on mobile, expansive rich web layout on tablet & desktop) */}
      <div className="w-full max-w-md md:max-w-4xl lg:max-w-6xl xl:max-w-7xl min-h-screen bg-[#EEF8FF] shadow-2xl relative border-x border-[#C9E1ED]/50 flex flex-col transition-all duration-300">
        {/* Top Header with Responsive Desktop Navbar */}
        <Header
          title={headerTitle}
          subtitle={headerSubtitle}
          onBack={onBackHandler}
          activeChild={activeChild}
          childrenList={childrenList}
          onSwitchChild={handleSwitchChild}
          onOpenAddChild={() => setShowAddChildModal(true)}
          userAccount={userAccount}
          onOpenAuth={(mode) => {
            setAuthModalMode(mode);
            setShowAuthModal(true);
          }}
          onOpenPlanModal={() => setShowPlanModal(true)}
          onOpenParentDashboard={() => navigateToTab('akun')}
          onOpenAiTokens={() => setShowAiTokenModal(true)}
          activeTab={activeTab}
          onTabChange={navigateToTab}
          murojaahDueCount={weakAyahsCount}
          onOpenIbadahModal={handleOpenIbadah}
          onOpenStarShop={() => setShowStarShopModal(true)}
          onAccountUpdated={(acc) => setUserAccount(acc)}
        />

        {/* Mode Tamu (Guest) Info Banner with 1-Tap Registration */}
        {StorageService.getAccountTier(userAccount) === 'guest' && (
          <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white px-3.5 sm:px-5 py-2 flex items-center justify-between text-xs font-bold shadow-xs border-b border-amber-600/30">
            <div className="flex items-center gap-2 truncate">
              <span className="text-sm shrink-0">✨</span>
              <span className="truncate">
                <strong className="underline decoration-amber-200">Mode Tamu:</strong> Coba langsung fitur dasar! Daftar gratis via Gmail / WhatsApp untuk simpan hafalan & buka seluruh 37 Surah Juz 30.
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0 ml-2">
              <button
                onClick={() => {
                  setAuthModalMode('register');
                  setShowAuthModal(true);
                }}
                className="px-3 py-1 rounded-xl bg-white text-orange-950 font-black text-[11px] hover:bg-orange-50 active:scale-95 shadow-2xs transition-all cursor-pointer whitespace-nowrap"
              >
                Daftar Gratis (1-Klik)
              </button>
            </div>
          </div>
        )}

        {/* In-App Browser Reminder Banner */}
        {activeInAppReminder && (
          <div className="mx-4 mt-2 mb-1 p-3.5 bg-gradient-to-r from-[#164C68] via-teal-800 to-emerald-800 text-white rounded-2xl shadow-xl border border-emerald-400/80 animate-in slide-in-from-top duration-300">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-white/20 text-xl flex items-center justify-center shrink-0">
                  🔔
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs sm:text-sm font-black font-heading text-amber-300">
                      {activeInAppReminder.title}
                    </h4>
                    <span className="text-[9px] font-black px-1.5 py-0.2 rounded-md bg-emerald-400 text-slate-950">
                      WAKTU MUROJAAH
                    </span>
                  </div>
                  <p className="text-xs text-slate-100 mt-0.5 line-clamp-2">
                    {activeInAppReminder.body}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setActiveInAppReminder(null)}
                className="p-1 rounded-full bg-white/10 hover:bg-white/20 text-slate-200 cursor-pointer"
                title="Tutup Notifikasi"
              >
                <X size={15} />
              </button>
            </div>

            <div className="flex items-center justify-end gap-2 mt-2 pt-2 border-t border-white/10">
              <button
                onClick={() => {
                  setActiveInAppReminder(null);
                  setActiveTab('tahfiz');
                  navigateTahfiz('murojaah');
                }}
                className="py-1 px-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs shadow-xs cursor-pointer"
              >
                Buka Murojaah Sekarang →
              </button>
            </div>
          </div>
        )}

        {/* Scrollable Content Container */}
        <main className="flex-1 px-4 sm:px-6 pt-3 md:pb-8 overflow-y-auto">
          {/* TAB 1: BERANDA */}
          {activeTab === 'beranda' && (
            <BerandaHome
              child={activeChild}
              companion={companion}
              lastSession={lastSession}
              blockProgressList={blockProgressList}
              ayahProgressList={ayahProgressList}
              onNavigateToTahfizStep={(step) => {
                setActiveTab('tahfiz');
                navigateTahfiz(step === 'latihan' ? 'latihan_menu' : step);
              }}
              onResumeLastSession={handleResumeLastSession}
              onOpenMurojaahDue={() => {
                setActiveTab('tahfiz');
                navigateTahfiz('murojaah');
              }}
              onOpenRoom={() => navigateGame('room')}
              onOpenWorldMap={() => navigateGame('map')}
              onRefreshCompanion={() => refreshChildData(activeChild.id)}
              onNavigateToModule={handleNavigateToModule}
              userAccount={userAccount}
              onOpenAuth={(mode) => {
                setAuthModalMode(mode);
                setShowAuthModal(true);
              }}
              onOpenPlanModal={() => setShowPlanModal(true)}
              onOpenIbadahModal={handleOpenIbadah}
              onOpenStarShop={() => setShowStarShopModal(true)}
            />
          )}

          {/* TAB 2: TAHFIZ (3-STEP MEMORIZATION WORKFLOW) */}
          {activeTab === 'tahfiz' && (
            <>
              {tahfizSubView === 'home' && (
                <TahfizHome
                  activeChild={activeChild}
                  lastSession={lastSession}
                  onSelectStep={(step) => {
                    navigateTahfiz(step === 'latihan' ? 'latihan_menu' : step);
                  }}
                  onResumeLastSession={handleResumeLastSession}
                />
              )}

              {tahfizSubView === 'dengar' && (
                <DengarModule
                  initialSurahNumber={lastSession.surahNumber}
                  initialBlockNumber={lastSession.blockNumber}
                  onProceedToLatihan={(surahNum, blockNum) => {
                    navigateTahfiz('ziadah_config');
                  }}
                  onBack={() => navigateTahfiz('home')}
                />
              )}

              {tahfizSubView === 'latihan_menu' && (
                <LatihanMenu
                  onSelectZiadah={() => navigateTahfiz('ziadah_config')}
                  onSelectMurojaah={() => navigateTahfiz('murojaah')}
                  lastSession={lastSession}
                  learningBlocksCount={blockProgressList.filter((b) => b.state === 'LEARNING').length}
                  memorizedBlocksCount={blockProgressList.filter((b) => b.state === 'MEMORIZED').length}
                  onResumeLastPractice={() => navigateTahfiz('ziadah_config')}
                />
              )}

              {tahfizSubView === 'ziadah_config' && (
                <ZiadahModule
                  childId={activeChild.id}
                  blockProgressList={blockProgressList}
                  onStartPractice={handleStartPractice}
                  onMarkBlocksMemorized={handleMarkBlocksMemorized}
                  onBack={() => navigateTahfiz('latihan_menu')}
                />
              )}

              {tahfizSubView === 'ziadah_player' && activePracticeConfig && (
                <ZiadahPlayer
                  childId={activeChild.id}
                  surahNumber={activePracticeConfig.surahNumber}
                  selectedBlocks={activePracticeConfig.selectedBlocks}
                  ayahRepeats={activePracticeConfig.ayahRepeats}
                  blockRepeats={activePracticeConfig.blockRepeats}
                  onFinishSession={() => {
                    refreshChildData(activeChild.id);
                    navigateTahfiz('home');
                  }}
                  onBack={() => navigateTahfiz('ziadah_config')}
                />
              )}

              {tahfizSubView === 'murojaah' && (
                <MurojaahModule
                  key={activeChild.id}
                  childId={activeChild.id}
                  initialSurahNumber={lastSession.surahNumber}
                  initialBlockNumber={lastSession.blockNumber}
                  onFinishMurojaah={() => {
                    refreshChildData(activeChild.id);
                    navigateTahfiz('home');
                  }}
                  onBack={() => navigateTahfiz('latihan_menu')}
                />
              )}

              {tahfizSubView === 'hafalan' && (
                <HafalanModule
                  key={activeChild.id}
                  childId={activeChild.id}
                  initialSurahNumber={lastSession.surahNumber}
                  onFinishHafalan={() => {
                    refreshChildData(activeChild.id);
                    navigateTahfiz('home');
                  }}
                  onBack={() => navigateTahfiz('home')}
                  onOpenPlanModal={() => setShowPlanModal(true)}
                />
              )}
            </>
          )}

          {/* TAB 3: AL-QUR'AN LEARNING HUB */}
          {activeTab === 'alquran' && (
            <>
              {alQuranSubView === null && (
                <AlQuranHub
                  onSelectSubmodule={(mod) => navigateAlQuran(mod)}
                  iqraProgressCount={StorageService.getCompletedIqra(activeChild.id).length}
                  tajwidProgressCount={StorageService.getCompletedTajwid(activeChild.id).length}
                  vocabCount={StorageService.getMasteredVocab(activeChild.id).length}
                  storiesCount={StorageService.getCompletedStories(activeChild.id).length}
                />
              )}
              {alQuranSubView === 'iqra' && (
                <IqraModule
                  childId={activeChild.id}
                  onBack={() => navigateAlQuran(null)}
                  userAccount={userAccount}
                  onOpenUpgradeModal={() => setShowPlanModal(true)}
                  onOpenRegisterModal={() => {
                    setAuthModalMode('register');
                    setShowAuthModal(true);
                  }}
                />
              )}
              {alQuranSubView === 'tajwid' && (
                <TajwidModule childId={activeChild.id} onBack={() => navigateAlQuran(null)} />
              )}
              {alQuranSubView === 'tilawah' && (
                <TilawahModule childId={activeChild.id} onBack={() => navigateAlQuran(null)} />
              )}
              {alQuranSubView === 'bahasa' && (
                <BahasaQuranModule childId={activeChild.id} onBack={() => navigateAlQuran(null)} />
              )}
              {alQuranSubView === 'tafsir' && (
                <TafsirModule childId={activeChild.id} onBack={() => navigateAlQuran(null)} />
              )}
              {alQuranSubView === 'asbab' && (
                <AsbabNuzulModule childId={activeChild.id} onBack={() => navigateAlQuran(null)} />
              )}
            </>
          )}

          {/* TAB 4: PUSAT IBADAH, ADAB & DOA SANTRI (FITUR UTAMA) */}
          {activeTab === 'ibadah' && (
            <PusatIbadahDoaModal
              isOpen={true}
              isFullPage={true}
              activeChild={activeChild}
              initialTab={ibadahInitialTab}
              onClose={() => navigateToTab('beranda')}
              onTasksUpdated={() => refreshChildData(activeChild.id)}
            />
          )}

          {/* TAB 5: GAMES & WORLD MAP */}
          {activeTab === 'game' && (
            <GameHub
              childId={activeChild.id}
              initialTab={gameSubTab}
              userAccount={userAccount}
              onOpenUpgradeModal={() => setShowPlanModal(true)}
              onOpenStarShop={() => setShowStarShopModal(true)}
              onNavigateToLand={(tab, subView) => {
                GlobalAudioManager.stopAll();
                setActiveTab(tab);
                if (tab === 'tahfiz' && subView) {
                  navigateTahfiz(subView);
                } else if (tab === 'alquran' && subView) {
                  navigateAlQuran(subView as any);
                }
              }}
            />
          )}

          {/* TAB 5: AKUN */}
          {activeTab === 'akun' && (
            <AkunHome
              userAccount={userAccount}
              activeChild={activeChild}
              childrenList={childrenList}
              onSwitchChild={handleSwitchChild}
              onRefreshData={() => {
                refreshChildData(activeChild.id);
                setUserAccount(StorageService.getUserAccount());
                setChildrenList(StorageService.getChildren());
              }}
            />
          )}
        </main>

        {/* Fixed Mobile Bottom Navigation */}
        <BottomNavigation
          activeTab={activeTab}
          onTabChange={(tab) => {
            if (tab === 'tahfiz' && tahfizSubView === 'ziadah_player') {
              // Preserve session but stop any ongoing sound
              GlobalAudioManager.stopAll();
              setActiveTab(tab);
            } else {
              navigateToTab(tab);
            }
          }}
          murojaahDueCount={weakAyahsCount}
        />

        {/* Quick Child Switcher Modal */}
        <QuickChildSwitcherModal
          isOpen={showQuickChildSwitcher}
          onClose={() => setShowQuickChildSwitcher(false)}
          childrenList={childrenList}
          activeChildId={activeChild.id}
          isPro={isPro}
          onSwitchChild={(id) => {
            handleSwitchChild(id);
            setShowQuickChildSwitcher(false);
          }}
          onDeleteChild={(id) => {
            handleDeleteChild(id);
          }}
          onOpenUpgradeModal={() => {
            setShowQuickChildSwitcher(false);
            setShowPlanModal(true);
          }}
          onOpenCreateChild={() => {
            setShowQuickChildSwitcher(false);
            setShowAddChildModal(true);
          }}
        />

        {/* Add Child Profile Modal */}
        <ChildProfileModal
          isOpen={showAddChildModal}
          onClose={() => setShowAddChildModal(false)}
          isPro={isPro}
          existingChildrenCount={childrenList.length}
          onOpenUpgradeModal={() => {
            setShowAddChildModal(false);
            setShowPlanModal(true);
          }}
          onChildCreated={(newChild) => {
            handleSwitchChild(newChild.id);
            setShowAddChildModal(false);
          }}
        />

        {/* Star Shop (Beli Bintang, Makan Pet & Dekorasi) Modal */}
        <StarShopModal
          isOpen={showStarShopModal}
          onClose={() => setShowStarShopModal(false)}
          child={activeChild}
          companion={companion}
          onStarsUpdated={() => {
            refreshChildData(activeChild.id);
            setChildrenList(StorageService.getChildren());
          }}
        />

        {/* Pro vs Free Classification Modal */}
        <ProVsFreeModal
          isOpen={showPlanModal}
          onClose={() => setShowPlanModal(false)}
          userAccount={userAccount}
          onPlanChanged={(updated) => {
            setUserAccount(updated);
          }}
          onOpenCheckout={(planId) => {
            setCheckoutPlanId(planId);
            setShowCheckoutModal(true);
          }}
          onOpenAiTokenTopup={() => {
            setShowPlanModal(false);
            setShowAiTokenModal(true);
          }}
        />

        {/* Payment Checkout Modal */}
        <PaymentCheckoutModal
          isOpen={showCheckoutModal}
          onClose={() => setShowCheckoutModal(false)}
          selectedPlanId={checkoutPlanId}
          userAccount={userAccount}
          onSuccess={(updated) => {
            setUserAccount(updated);
            setShowCheckoutModal(false);
          }}
        />

        {/* AI Token Top-Up Modal (Flexible Pay-as-you-go) */}
        <AiTokenTopupModal
          isOpen={showAiTokenModal}
          onClose={() => setShowAiTokenModal(false)}
          userAccount={userAccount}
          onSuccess={(updated) => {
            setUserAccount(updated);
          }}
          onOpenProModal={() => {
            setShowAiTokenModal(false);
            setShowPlanModal(true);
          }}
        />

        {/* Hijalearn-style Auth & Registration Modal */}
        <AuthModal
          isOpen={showAuthModal}
          initialMode={authModalMode}
          onClose={() => setShowAuthModal(false)}
          onAuthSuccess={(updated) => {
            setUserAccount(updated);
            setShowAuthModal(false);
            setChildrenList(StorageService.getChildren());
            setActiveChild(StorageService.getActiveChild());
          }}
        />

        {/* Floating Social Share Dock (Collapsible, Parroto-style) - hidden during focused Qur'an/Iqra study */}
        {activeTab !== 'alquran' && (
          <FloatingSocialShareDock
            onOpenShareModal={(payload) => {
              setSharePayload(
                payload || {
                  title: "Cahaya Tahfiz - Belajar & Hafalan Al-Qur'an Anak Berbasis AI",
                  text: `Dampingi anak belajar tartil, makhraj, dan menghafal Al-Qur'an bersama Sahabat 3D Lumi di Cahaya Tahfiz!`,
                  url: typeof window !== 'undefined' ? window.location.href : 'https://cahaya-tahfiz.app',
                  category: "Aplikasi Edukasi Tahfiz",
                }
              );
              setShowShareModal(true);
            }}
          />
        )}

        {/* Global Share Modal */}
        <ShareModal
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
          payload={sharePayload}
        />
      </div>
    </div>
  );
}
