import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Star,
  Sparkles,
  ShoppingBag,
  Apple,
  CheckCircle2,
  ShieldCheck,
  Zap,
  Heart,
  Crown,
  ChevronRight,
  Gift,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { ChildProfile } from '../../types';
import { CompanionData, RoomDecoration } from '../../types/companion';
import { ROOM_DECORATIONS } from '../../data/companionData';
import { CompanionService } from '../../services/companionService';
import { StorageService } from '../../services/storageService';
import { CompanionSprite } from '../companion/CompanionSprite';
import {
  PrayerRugVisual,
  BloomingTreeVisual,
  LanternVisual,
  TelescopeVisual,
  QuranBookVisual,
} from '../companion/ObjectVisuals';

const renderDecorationVisual = (id: string, fallbackIcon: string, size = 36) => {
  if (id === 'carpet-bintang') return <PrayerRugVisual size={size} />;
  if (id === 'tanaman-cahaya') return <BloomingTreeVisual size={size} />;
  if (id === 'lampu-kubah') return <LanternVisual size={size} />;
  if (id === 'teropong-bintang') return <TelescopeVisual size={size} />;
  if (id === 'kitab-mushaf') return <QuranBookVisual size={size} />;
  return <span className="text-2xl">{fallbackIcon}</span>;
};

export interface StarPackage {
  id: string;
  name: string;
  baseStars: number;
  bonusStars: number;
  priceIdr: number;
  badge?: string;
  popular?: boolean;
  description: string;
}

export const STAR_PACKAGES: StarPackage[] = [
  {
    id: 'pack_50',
    name: 'Paket Pemula',
    baseStars: 50,
    bonusStars: 0,
    priceIdr: 10000,
    description: 'Cukup untuk beli camilan pet & dekorasi permadani awal.',
  },
  {
    id: 'pack_175',
    name: 'Paket Populer Berkah',
    baseStars: 150,
    bonusStars: 25,
    priceIdr: 25000,
    popular: true,
    badge: 'Paling Laris 🔥',
    description: 'Bisa beli perabot kamar lengkap dan camilan kurma berkali-kali.',
  },
  {
    id: 'pack_600',
    name: 'Paket Juara Tahfiz',
    baseStars: 500,
    bonusStars: 100,
    priceIdr: 50000,
    badge: 'Super Hemat ✨',
    description: 'Bonus 100 ⭐ ekstra! Cukup untuk semua dekorasi kamar & jamuan pet.',
  },
  {
    id: 'pack_1500',
    name: 'Paket Sultan Santri',
    baseStars: 1200,
    bonusStars: 300,
    priceIdr: 100000,
    badge: 'Maksimal 👑',
    description: 'Bintang melimpah untuk mendekorasi kamar impian santri sepuasnya.',
  },
];

interface StarShopModalProps {
  isOpen: boolean;
  onClose: () => void;
  child: ChildProfile;
  companion: CompanionData;
  onStarsUpdated: () => void;
  initialTab?: 'buy_stars' | 'feed_pet' | 'decorations';
}

export const StarShopModal: React.FC<StarShopModalProps> = ({
  isOpen,
  onClose,
  child,
  companion,
  onStarsUpdated,
  initialTab = 'buy_stars',
}) => {
  const [activeTab, setActiveTab] = useState<'buy_stars' | 'feed_pet' | 'decorations'>(initialTab);
  const [selectedPack, setSelectedPack] = useState<StarPackage>(STAR_PACKAGES[1]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [paymentSuccess, setPaymentSuccess] = useState<string | null>(null);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  if (!isOpen) return null;

  const playSound = (freq = 523.25) => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } catch {
      // Ignore
    }
  };

  const handlePurchaseStars = () => {
    setIsProcessing(true);
    setTimeout(() => {
      const totalStarsPurchased = selectedPack.baseStars + selectedPack.bonusStars;
      CompanionService.topupStars(child.id, totalStarsPurchased, selectedPack.name);

      setIsProcessing(false);
      setPaymentSuccess(
        `Alhamdulillah! Berhasil membeli ${totalStarsPurchased} ⭐ Bintang untuk ${child.name}!`
      );
      playSound(659.25);

      try {
        confetti({
          particleCount: 50,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#FFD83E', '#08B9EF', '#81E850', '#FF946F'],
        });
      } catch {
        // Ignore
      }

      onStarsUpdated();
      setTimeout(() => {
        setPaymentSuccess(null);
      }, 3500);
    }, 600);
  };

  const handleBuyFoodTreats = (count: number, costStars: number) => {
    const res = CompanionService.buyFoodTreatsWithStars(child.id, count, costStars);
    setActionNotice(res.message);
    if (res.success) {
      playSound(587.33);
      try {
        confetti({
          particleCount: 30,
          spread: 50,
          origin: { y: 0.7 },
          colors: ['#FF946F', '#FFD83E', '#81E850'],
        });
      } catch {
        // Ignore
      }
      onStarsUpdated();
    }
    setTimeout(() => setActionNotice(null), 3000);
  };

  const handleFeedCompanionNow = () => {
    const res = CompanionService.feedCompanion(child.id, 'kurma');
    setActionNotice(res.message);
    if (res.success) {
      playSound(659.25);
      onStarsUpdated();
    }
    setTimeout(() => setActionNotice(null), 3500);
  };

  const handleToggleRoomItem = (itemId: string) => {
    const res = CompanionService.buyRoomDecoration(child.id, itemId);
    setActionNotice(res.message);
    if (res.success) {
      playSound(523.25);
      onStarsUpdated();
    }
    setTimeout(() => setActionNotice(null), 3000);
  };

  const treatsAvailable = companion.foodTreatsAvailable ?? 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="bg-white rounded-3xl border border-[#C9E1ED] shadow-2xl max-w-lg w-full overflow-hidden my-4 relative font-sans"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer"
        >
          <X size={16} />
        </button>

        {/* Header */}
        <div className="pt-6 pb-4 px-6 text-center space-y-1.5 bg-gradient-to-b from-amber-50 via-yellow-50/40 to-white border-b border-amber-100">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-400 to-yellow-300 text-white flex items-center justify-center text-2xl mx-auto shadow-md ring-4 ring-amber-100">
            ⭐
          </div>
          <h2 className="text-xl sm:text-2xl font-black font-heading text-[#164C68] tracking-tight">
            Toko Bintang & Camilan Sahabat
          </h2>
          <p className="text-xs text-slate-600 font-medium max-w-sm mx-auto">
            Beli bintang untuk memberi makan pet tamagotchi, menghias kamar, dan mengapresiasi santri!
          </p>

          {/* Child Active Star Balance */}
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-100/80 border border-amber-300 rounded-full text-xs font-black text-amber-950 shadow-2xs mt-1">
            <span className="text-base">{child.avatar}</span>
            <span>{child.name}:</span>
            <span className="text-amber-700 flex items-center gap-1">
              <Star size={13} className="fill-amber-500 text-amber-600" />
              {child.totalStars} ⭐
            </span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="grid grid-cols-3 gap-1 p-2 bg-slate-100/80 border-b border-slate-200 text-xs font-bold text-center">
          <button
            onClick={() => setActiveTab('buy_stars')}
            className={`py-2 px-2 rounded-2xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'buy_stars'
                ? 'bg-white text-amber-800 shadow-xs font-black'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Star size={14} className="text-amber-500 fill-amber-400" />
            <span>Beli Bintang</span>
          </button>

          <button
            onClick={() => setActiveTab('feed_pet')}
            className={`py-2 px-2 rounded-2xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'feed_pet'
                ? 'bg-white text-emerald-800 shadow-xs font-black'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Apple size={14} className="text-emerald-500" />
            <span>Makan Pet</span>
          </button>

          <button
            onClick={() => setActiveTab('decorations')}
            className={`py-2 px-2 rounded-2xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'decorations'
                ? 'bg-white text-blue-800 shadow-xs font-black'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Sparkles size={14} className="text-blue-500" />
            <span>Dekorasi</span>
          </button>
        </div>

        {/* Action / Success Banner */}
        <AnimatePresence>
          {paymentSuccess && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="m-3 p-3 bg-emerald-100 border border-emerald-300 text-emerald-900 rounded-2xl text-xs font-bold text-center flex items-center justify-center gap-2"
            >
              <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
              <span>{paymentSuccess}</span>
            </motion.div>
          )}

          {actionNotice && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="m-3 p-3 bg-cyan-50 border border-cyan-300 text-cyan-900 rounded-2xl text-xs font-bold text-center"
            >
              <span>{actionNotice}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Content Body */}
        <div className="p-4 sm:p-5 max-h-[62vh] overflow-y-auto space-y-4">
          {/* TAB 1: BUY STAR PACKAGES */}
          {activeTab === 'buy_stars' && (
            <div className="space-y-3">
              <div className="space-y-2">
                {STAR_PACKAGES.map((pack) => {
                  const isSelected = selectedPack.id === pack.id;
                  const totalStars = pack.baseStars + pack.bonusStars;

                  return (
                    <div
                      key={pack.id}
                      onClick={() => setSelectedPack(pack)}
                      className={`relative p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? 'border-amber-400 bg-amber-50/40 ring-2 ring-amber-400/30 shadow-xs'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      {pack.badge && (
                        <span className="absolute -top-2.5 left-4 bg-gradient-to-r from-amber-500 to-yellow-500 text-white font-black text-[9px] px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-2xs">
                          {pack.badge}
                        </span>
                      )}

                      <div className="flex items-center gap-3">
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                            isSelected
                              ? 'border-amber-500 bg-amber-500 text-white'
                              : 'border-slate-300 bg-white'
                          }`}
                        >
                          {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-heading font-black text-[#164C68] text-sm">
                              {pack.name}
                            </h4>
                            <span className="text-xs font-black text-amber-600 bg-amber-100/60 px-2 py-0.5 rounded-md">
                              +{totalStars} ⭐
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-500 font-medium mt-0.5">
                            {pack.description}
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="font-heading font-black text-slate-900 text-sm sm:text-base block">
                          Rp {pack.priceIdr.toLocaleString('id-ID')}
                        </span>
                        <span className="text-[9px] text-slate-400 block font-semibold">
                          Sekali Bayar
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Purchase Action Button */}
              <div className="pt-2">
                <button
                  onClick={handlePurchaseStars}
                  disabled={isProcessing}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-600 hover:to-yellow-600 text-amber-950 font-black text-sm shadow-md shadow-amber-500/25 cursor-pointer flex items-center justify-center gap-2 active:scale-98 transition-all disabled:opacity-60"
                >
                  <Star size={16} className="fill-amber-900 text-amber-950" />
                  <span>
                    {isProcessing
                      ? 'Memproses Pembelian...'
                      : `Beli Sekarang (Rp ${selectedPack.priceIdr.toLocaleString('id-ID')})`}
                  </span>
                </button>

                <div className="flex items-center justify-center gap-3 text-[10px] text-slate-500 font-bold mt-2">
                  <span className="flex items-center gap-1 text-emerald-600">
                    <ShieldCheck size={12} />
                    <span>Aman & Ramah Anak</span>
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1 text-amber-600">
                    <Zap size={12} />
                    <span>Masuk Instan</span>
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: FEED COMPANION */}
          {activeTab === 'feed_pet' && (
            <div className="space-y-4">
              {/* Pet Status Card */}
              <div className="p-4 bg-gradient-to-b from-emerald-50 to-teal-50/40 border border-emerald-200 rounded-3xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-white border border-emerald-200 flex items-center justify-center shadow-xs overflow-hidden">
                    <CompanionSprite
                      species={companion.species || 'lumi'}
                      stage="hatchling"
                      size={44}
                    />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-emerald-950 font-heading">
                      {companion.name} ({companion.species || 'Lumi'})
                    </h4>
                    <p className="text-[11px] text-emerald-700 font-semibold">
                      Hidangan Tersedia:{' '}
                      <strong className="text-emerald-900 font-black">
                        {treatsAvailable}x Kurma & Madu
                      </strong>
                    </p>
                  </div>
                </div>

                {treatsAvailable > 0 && (
                  <button
                    onClick={handleFeedCompanionNow}
                    className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-xs cursor-pointer flex items-center gap-1.5 active:scale-95 transition-all"
                  >
                    <Apple size={14} />
                    <span>Suapkan!</span>
                  </button>
                )}
              </div>

              {/* Food Treat Packages to Buy with Stars */}
              <div className="space-y-2">
                <h4 className="text-xs font-black text-[#164C68] font-heading uppercase tracking-wider">
                  Beli Camilan & Hidangan Pet Pakai Bintang ⭐
                </h4>

                <div className="p-3 bg-white border-2 border-slate-200 hover:border-emerald-300 rounded-2xl flex items-center justify-between transition-all">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-50 text-2xl flex items-center justify-center">
                      🍯
                    </div>
                    <div>
                      <h5 className="text-xs font-black text-slate-800">
                        5x Kurma Madu Berkah
                      </h5>
                      <p className="text-[10px] text-slate-500">
                        Cukup untuk 5x memberi makan & mendongkrak kebahagiaan
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleBuyFoodTreats(5, 15)}
                    className="px-3 py-1.5 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-950 font-black text-xs cursor-pointer transition-all"
                  >
                    15 ⭐ Beli
                  </button>
                </div>

                <div className="p-3 bg-white border-2 border-slate-200 hover:border-emerald-300 rounded-2xl flex items-center justify-between transition-all">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-rose-50 text-2xl flex items-center justify-center">
                      🍎
                    </div>
                    <div>
                      <h5 className="text-xs font-black text-slate-800">
                        15x Jamuan Tamagotchi Lengkap
                      </h5>
                      <p className="text-[10px] text-slate-500">
                        Paket hemat pesta hidangan untuk sahabat
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleBuyFoodTreats(15, 35)}
                    className="px-3 py-1.5 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-950 font-black text-xs cursor-pointer transition-all"
                  >
                    35 ⭐ Beli
                  </button>
                </div>

                <div className="p-3 bg-white border-2 border-slate-200 hover:border-emerald-300 rounded-2xl flex items-center justify-between transition-all">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-50 text-2xl flex items-center justify-center">
                      👑
                    </div>
                    <div>
                      <h5 className="text-xs font-black text-slate-800">
                        30x Pesta Hidangan Akbar
                      </h5>
                      <p className="text-[10px] text-slate-500">
                        Kenikmatan penuh untuk membuat pet selalu tersenyum
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleBuyFoodTreats(30, 60)}
                    className="px-3 py-1.5 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-950 font-black text-xs cursor-pointer transition-all"
                  >
                    60 ⭐ Beli
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: ROOM DECORATIONS */}
          {activeTab === 'decorations' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-black text-[#164C68] font-heading uppercase tracking-wider">
                    Dekorasi Kamar Sahabat
                  </h4>
                  <p className="text-[10px] text-slate-500 font-medium">
                    Beli perabot kamar menggunakan bintang dan pasang langsung
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('buy_stars')}
                  className="text-[10px] font-black text-amber-600 bg-amber-50 hover:bg-amber-100 px-2 py-1 rounded-lg border border-amber-200 cursor-pointer"
                >
                  + Tambah Bintang
                </button>
              </div>

              <div className="space-y-2">
                {ROOM_DECORATIONS.map((dec) => {
                  const isOwned = companion.unlockedItems.includes(dec.id);
                  const isPlaced = companion.roomItems.includes(dec.id);

                  return (
                    <div
                      key={dec.id}
                      className={`p-3 rounded-2xl border-2 flex items-center justify-between transition-all ${
                        isPlaced
                          ? 'bg-cyan-50/70 border-[#08B9EF]'
                          : isOwned
                          ? 'bg-[#EEF8FF]/50 border-[#C9E1ED]'
                          : 'bg-white border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
                          {renderDecorationVisual(dec.id, dec.icon, 30)}
                        </div>
                        <div>
                          <h5 className="text-xs font-bold text-[#164C68]">{dec.name}</h5>
                          <p className="text-[10px] text-[#8C9BA7]">{dec.unlockRequirement}</p>
                        </div>
                      </div>

                      <button
                        onClick={() => handleToggleRoomItem(dec.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                          isPlaced
                            ? 'bg-[#08B9EF] text-white shadow-xs'
                            : isOwned
                            ? 'bg-[#EEF8FF] text-[#08B9EF] border border-[#C9E1ED] hover:bg-cyan-100'
                            : 'bg-amber-100 text-amber-900 hover:bg-amber-200'
                        }`}
                      >
                        {isPlaced ? 'Terpasang' : isOwned ? 'Pasang' : `${dec.costStars} ⭐ Beli`}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
