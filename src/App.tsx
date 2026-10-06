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
import { CompanionService } from './services/companionService';
import { GlobalAudioManager } from './services/audioService';
import { getBlocksForSurah } from './data/blocksData';
import { FloatingSocialShareDock } from './components/common/FloatingSocialShareDock';
import { ShareModal, SharePayload } from './components/common/ShareModal';

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
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register' | 'switch'>('register');
  const [showPlanModal, setShowPlanModal] = useState<boolean>(false);
  const [showCheckoutModal, setShowCheckoutModal] = useState<boolean>(false);
  const [checkoutPlanId, setCheckoutPlanId] = useState<string>('1_year');
  const [sharePayload, setSharePayload] = useState<SharePayload | null>(null);
  const [showShareModal, setShowShareModal] = useState<boolean>(false);

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
  } else if (activeTab === 'game') {
    headerTitle = 'Peta Dunia & Petualangan';
    headerSubtitle = 'Sahabat, Dunia & Game';
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
          onSelectChild={() => setShowQuickChildSwitcher(true)}
          userAccount={userAccount}
          onOpenAuth={(mode) => {
            setAuthModalMode(mode);
            setShowAuthModal(true);
          }}
          onOpenPlanModal={() => setShowPlanModal(true)}
          activeTab={activeTab}
          onTabChange={navigateToTab}
          murojaahDueCount={weakAyahsCount}
        />

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
                  childId={activeChild.id}
                  initialSurahNumber={lastSession.surahNumber}
                  onFinishHafalan={() => {
                    refreshChildData(activeChild.id);
                    navigateTahfiz('home');
                  }}
                  onBack={() => navigateTahfiz('home')}
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
                <IqraModule childId={activeChild.id} onBack={() => navigateAlQuran(null)} />
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

          {/* TAB 4: GAMES & WORLD MAP */}
          {activeTab === 'game' && (
            <GameHub
              childId={activeChild.id}
              initialTab={gameSubTab}
              userAccount={userAccount}
              onOpenUpgradeModal={() => setShowPlanModal(true)}
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
          onSwitchChild={(id) => {
            handleSwitchChild(id);
            setShowQuickChildSwitcher(false);
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
          onChildCreated={(newChild) => {
            handleSwitchChild(newChild.id);
            setShowAddChildModal(false);
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

        {/* Floating Social Share Dock (Collapsible, Parroto-style) */}
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
