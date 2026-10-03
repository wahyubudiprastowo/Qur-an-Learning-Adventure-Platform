/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
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

export default function App() {
  // Navigation Tabs
  const [activeTab, setActiveTab] = useState<NavigationTab>('beranda');

  // Tahfiz Sub-State: 'home' | 'dengar' | 'latihan_menu' | 'ziadah_config' | 'ziadah_player' | 'murojaah' | 'hafalan'
  const [tahfizSubView, setTahfizSubView] = useState<string>('home');

  // Al-Quran Submodule
  const [alQuranSubView, setAlQuranSubView] = useState<AlQuranSubmodule>(null);

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

  // Quick Child Selector Modal state
  const [showChildModal, setShowChildModal] = useState<boolean>(false);

  // Sync state whenever active child changes
  const refreshChildData = (childId: string) => {
    const updatedChild = StorageService.getActiveChild();
    setActiveChild(updatedChild);
    setBlockProgressList(StorageService.getBlockProgress(childId));
    setAyahProgressList(StorageService.getAyahProgress(childId));
    setLastSession(StorageService.getLastSession(childId));
  };

  const handleSwitchChild = (childId: string) => {
    StorageService.setActiveChildId(childId);
    setChildrenList(StorageService.getChildren());
    refreshChildData(childId);
  };

  // Resume last learning session directly
  const handleResumeLastSession = () => {
    setActiveTab('tahfiz');
    if (lastSession.mode === 'dengar') {
      setTahfizSubView('dengar');
    } else if (lastSession.mode === 'hafalan') {
      setTahfizSubView('hafalan');
    } else {
      setTahfizSubView('ziadah_config');
    }
  };

  const handleStartPractice = (config: {
    surahNumber: number;
    selectedBlocks: MemorizationBlock[];
    ayahRepeats: number;
    blockRepeats: number;
  }) => {
    setActivePracticeConfig(config);
    setTahfizSubView('ziadah_player');
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
      onBackHandler = () => setTahfizSubView('home');
    } else if (tahfizSubView === 'latihan_menu') {
      headerTitle = 'Pilih Mode Latihan';
      headerSubtitle = 'Langkah 2: Latihan Bertahap';
      onBackHandler = () => setTahfizSubView('home');
    } else if (tahfizSubView === 'ziadah_config') {
      headerTitle = 'Ziadah — Hafalan Baru';
      headerSubtitle = 'Atur Blok & Pengulangan';
      onBackHandler = () => setTahfizSubView('latihan_menu');
    } else if (tahfizSubView === 'ziadah_player') {
      headerTitle = 'Latihan Hafalan';
      headerSubtitle = 'Fokus Melafalkan';
      onBackHandler = () => setTahfizSubView('ziadah_config');
    } else if (tahfizSubView === 'murojaah') {
      headerTitle = 'Murojaah';
      headerSubtitle = 'Teks Dibuka Bertahap';
      onBackHandler = () => setTahfizSubView('latihan_menu');
    } else if (tahfizSubView === 'hafalan') {
      headerTitle = 'Uji Hafalan / Setoran';
      headerSubtitle = 'Langkah 3: Uji Mandiri Tanpa Teks';
      onBackHandler = () => setTahfizSubView('home');
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
    onBackHandler = () => setAlQuranSubView(null);
  }

  const weakAyahsCount = ayahProgressList.filter((a) => a.needsReview).length;

  return (
    <div className="min-h-screen bg-[#D8EDF8] flex justify-center text-[#292742]">
      {/* Mobile Application Container Shell (Responsive centered frame) */}
      <div className="w-full max-w-md min-h-screen bg-[#EEF8FF] shadow-2xl relative border-x border-[#C9E1ED]/50 flex flex-col">
        {/* Top Header */}
        <Header
          title={headerTitle}
          subtitle={headerSubtitle}
          onBack={onBackHandler}
          activeChild={activeChild}
          onSelectChild={() => setShowChildModal(true)}
        />

        {/* Scrollable Content Container */}
        <main className="flex-1 px-4 pt-3 overflow-y-auto">
          {/* TAB 1: BERANDA */}
          {activeTab === 'beranda' && (
            <BerandaHome
              child={activeChild}
              lastSession={lastSession}
              blockProgressList={blockProgressList}
              ayahProgressList={ayahProgressList}
              onNavigateToTahfizStep={(step) => {
                setActiveTab('tahfiz');
                setTahfizSubView(step === 'latihan' ? 'latihan_menu' : step);
              }}
              onResumeLastSession={handleResumeLastSession}
              onOpenMurojaahDue={() => {
                setActiveTab('tahfiz');
                setTahfizSubView('murojaah');
              }}
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
                    setTahfizSubView(step === 'latihan' ? 'latihan_menu' : step);
                  }}
                  onResumeLastSession={handleResumeLastSession}
                />
              )}

              {tahfizSubView === 'dengar' && (
                <DengarModule
                  initialSurahNumber={lastSession.surahNumber}
                  initialBlockNumber={lastSession.blockNumber}
                  onProceedToLatihan={(surahNum, blockNum) => {
                    setTahfizSubView('ziadah_config');
                  }}
                  onBack={() => setTahfizSubView('home')}
                />
              )}

              {tahfizSubView === 'latihan_menu' && (
                <LatihanMenu
                  onSelectZiadah={() => setTahfizSubView('ziadah_config')}
                  onSelectMurojaah={() => setTahfizSubView('murojaah')}
                  lastSession={lastSession}
                  learningBlocksCount={blockProgressList.filter((b) => b.state === 'LEARNING').length}
                  memorizedBlocksCount={blockProgressList.filter((b) => b.state === 'MEMORIZED').length}
                  onResumeLastPractice={() => setTahfizSubView('ziadah_config')}
                />
              )}

              {tahfizSubView === 'ziadah_config' && (
                <ZiadahModule
                  childId={activeChild.id}
                  blockProgressList={blockProgressList}
                  onStartPractice={handleStartPractice}
                  onMarkBlocksMemorized={handleMarkBlocksMemorized}
                  onBack={() => setTahfizSubView('latihan_menu')}
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
                    setTahfizSubView('home');
                  }}
                  onBack={() => setTahfizSubView('ziadah_config')}
                />
              )}

              {tahfizSubView === 'murojaah' && (
                <MurojaahModule
                  childId={activeChild.id}
                  initialSurahNumber={lastSession.surahNumber}
                  initialBlockNumber={lastSession.blockNumber}
                  onFinishMurojaah={() => {
                    refreshChildData(activeChild.id);
                    setTahfizSubView('home');
                  }}
                  onBack={() => setTahfizSubView('latihan_menu')}
                />
              )}

              {tahfizSubView === 'hafalan' && (
                <HafalanModule
                  childId={activeChild.id}
                  initialSurahNumber={lastSession.surahNumber}
                  onFinishHafalan={() => {
                    refreshChildData(activeChild.id);
                    setTahfizSubView('home');
                  }}
                  onBack={() => setTahfizSubView('home')}
                />
              )}
            </>
          )}

          {/* TAB 3: AL-QUR'AN LEARNING HUB */}
          {activeTab === 'alquran' && (
            <>
              {alQuranSubView === null && (
                <AlQuranHub
                  onSelectSubmodule={(mod) => setAlQuranSubView(mod)}
                  iqraProgressCount={StorageService.getCompletedIqra(activeChild.id).length}
                  tajwidProgressCount={StorageService.getCompletedTajwid(activeChild.id).length}
                  vocabCount={StorageService.getMasteredVocab(activeChild.id).length}
                  storiesCount={StorageService.getCompletedStories(activeChild.id).length}
                />
              )}
              {alQuranSubView === 'iqra' && (
                <IqraModule childId={activeChild.id} onBack={() => setAlQuranSubView(null)} />
              )}
              {alQuranSubView === 'tajwid' && (
                <TajwidModule childId={activeChild.id} onBack={() => setAlQuranSubView(null)} />
              )}
              {alQuranSubView === 'tilawah' && (
                <TilawahModule childId={activeChild.id} onBack={() => setAlQuranSubView(null)} />
              )}
              {alQuranSubView === 'bahasa' && (
                <BahasaQuranModule childId={activeChild.id} onBack={() => setAlQuranSubView(null)} />
              )}
              {alQuranSubView === 'tafsir' && (
                <TafsirModule childId={activeChild.id} onBack={() => setAlQuranSubView(null)} />
              )}
              {alQuranSubView === 'asbab' && (
                <AsbabNuzulModule childId={activeChild.id} onBack={() => setAlQuranSubView(null)} />
              )}
            </>
          )}

          {/* TAB 4: GAMES */}
          {activeTab === 'game' && <GameHub childId={activeChild.id} />}

          {/* TAB 5: AKUN */}
          {activeTab === 'akun' && (
            <AkunHome
              userAccount={userAccount}
              activeChild={activeChild}
              childrenList={childrenList}
              onSwitchChild={handleSwitchChild}
              onRefreshData={() => refreshChildData(activeChild.id)}
            />
          )}
        </main>

        {/* Fixed Mobile Bottom Navigation */}
        <BottomNavigation
          activeTab={activeTab}
          onTabChange={(tab) => {
            setActiveTab(tab);
            if (tab === 'tahfiz' && tahfizSubView === 'ziadah_player') {
              // Preserve session
            } else if (tab === 'tahfiz') {
              setTahfizSubView('home');
            } else if (tab === 'alquran') {
              setAlQuranSubView(null);
            }
          }}
          murojaahDueCount={weakAyahsCount}
        />

        {/* Quick Child Switch Modal */}
        <ChildProfileModal
          isOpen={showChildModal}
          onClose={() => setShowChildModal(false)}
          onChildCreated={(newChild) => {
            handleSwitchChild(newChild.id);
          }}
        />
      </div>
    </div>
  );
}
