import React, { useState } from 'react';
import { User, X, CheckCircle2, Sparkles, Heart, Crown, Lock } from 'lucide-react';
import { LearningLevel, ChildProfile } from '../../types';
import { CompanionSpecies } from '../../types/companion';
import { COMPANION_SPECIES_LIST } from '../../data/companionData';
import { CompanionService } from '../../services/companionService';
import { StorageService } from '../../services/storageService';
import { Button } from '../common/Button';
import { CompanionSprite } from '../companion/CompanionSprite';

interface ChildProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onChildCreated: (child: ChildProfile) => void;
  isPro?: boolean;
  existingChildrenCount?: number;
  onOpenUpgradeModal?: () => void;
}

export const ChildProfileModal: React.FC<ChildProfileModalProps> = ({
  isOpen,
  onClose,
  onChildCreated,
  isPro = false,
  existingChildrenCount = 0,
  onOpenUpgradeModal,
}) => {
  const [name, setName] = useState<string>('');
  const [avatar, setAvatar] = useState<string>('👧');
  const [petSpecies, setPetSpecies] = useState<CompanionSpecies>('lumi');
  const [level, setLevel] = useState<LearningLevel>('pemula');
  const [birthYear, setBirthYear] = useState<string>('2018');
  const [petUpgradeNotice, setPetUpgradeNotice] = useState<string | null>(null);

  if (!isOpen) return null;

  const isExceededFreeLimit = !isPro && existingChildrenCount >= 1;
  const avatarsList = ['👧', '👦', '🧒', '🧕', '👳', '🌟', '🌱', '🌸', '🦁', '🐬'];

  const handleSelectPet = (speciesId: CompanionSpecies) => {
    if (!isPro && speciesId !== 'lumi') {
      const pet = COMPANION_SPECIES_LIST.find((p) => p.id === speciesId);
      setPetUpgradeNotice(
        `👑 Karakter ${pet?.name || speciesId} adalah fitur eksklusif PRO. Gunakan Lumi (Free) atau Upgrade ke PRO untuk membuka!`
      );
      return;
    }
    setPetSpecies(speciesId);
    setPetUpgradeNotice(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isExceededFreeLimit) {
      onOpenUpgradeModal?.();
      return;
    }

    if (!name.trim()) return;

    const newChild = StorageService.createChild(
      name.trim(),
      avatar,
      level,
      birthYear ? parseInt(birthYear, 10) : undefined
    );
    // Initialize chosen Tamagotchi companion
    CompanionService.setCompanionSpecies(newChild.id, petSpecies);

    onChildCreated(newChild);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white border-2 border-[#C9E1ED] rounded-3xl p-6 max-w-sm w-full shadow-2xl relative animate-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-[#EEF8FF] text-[#164C68] flex items-center justify-center hover:bg-slate-200 transition-colors"
        >
          <X size={18} />
        </button>

        <div className="text-center mb-5">
          <div className="w-14 h-14 rounded-2xl bg-cyan-50 border border-cyan-200 text-3xl flex items-center justify-center mx-auto mb-2 shadow-xs">
            {avatar}
          </div>
          <h2 className="text-xl font-black text-[#164C68] font-heading">
            Tambah Profil Anak
          </h2>
          <p className="text-xs text-[#8C9BA7] font-medium mt-0.5">
            Setiap anak memiliki catatan hafalan & bintang tersendiri
          </p>
        </div>

        {/* Free Tier Notice if attempting 2nd child */}
        {isExceededFreeLimit && (
          <div className="p-3 mb-4 bg-amber-50 border border-amber-300 rounded-2xl text-center space-y-2">
            <span className="text-xl block">👑</span>
            <h4 className="text-xs font-black text-amber-900">
              Multi-Anak Khusus Pengguna PRO
            </h4>
            <p className="text-[11px] text-amber-800 leading-snug">
              Akun Free dibatasi maksimal 1 anak. Upgrade ke PRO untuk menambah profil anak kedua dan seterusnya!
            </p>
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenUpgradeModal?.();
              }}
              className="w-full py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-amber-950 font-black text-xs cursor-pointer shadow-xs"
            >
              Upgrade ke PRO Sekarang
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Avatar selector */}
          <div>
            <label className="text-xs font-bold text-[#8C9BA7] uppercase tracking-wider block mb-1.5">
              Pilih Avatar
            </label>
            <div className="flex flex-wrap gap-2 justify-center">
              {avatarsList.map((av) => (
                <button
                  type="button"
                  key={av}
                  onClick={() => setAvatar(av)}
                  className={`w-10 h-10 rounded-2xl text-2xl flex items-center justify-center transition-all cursor-pointer ${
                    avatar === av
                      ? 'bg-[#08B9EF] shadow-md scale-110'
                      : 'bg-[#EEF8FF] hover:bg-[#d8eefc]'
                  }`}
                >
                  {av}
                </button>
              ))}
            </div>
          </div>

          {/* Pet Companion (Tamagotchi) Selector */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-[#8C9BA7] uppercase tracking-wider block">
                Pilih Sahabat Petualang (Pet)
              </label>
              <span className="text-[10px] text-[#08B9EF] font-bold">
                {isPro ? 'Semua Terbuka 👑' : 'Lumi (Free)'}
              </span>
            </div>
            <div className="grid grid-cols-5 gap-1.5">
              {COMPANION_SPECIES_LIST.map((pet) => {
                const isLocked = !isPro && pet.id !== 'lumi';

                return (
                  <button
                    type="button"
                    key={pet.id}
                    onClick={() => handleSelectPet(pet.id)}
                    className={`p-2 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1 relative ${
                      petSpecies === pet.id
                        ? 'bg-cyan-50 border-[#08B9EF] shadow-md ring-2 ring-[#08B9EF]/40 scale-105'
                        : isLocked
                        ? 'bg-slate-50 border-slate-200 opacity-60 hover:opacity-80'
                        : 'bg-[#EEF8FF] border-slate-200 hover:bg-slate-100 opacity-80'
                    }`}
                    title={isLocked ? `${pet.name} (Khusus PRO)` : pet.description}
                  >
                    {isLocked && (
                      <span className="absolute top-1 right-1 text-[8px] bg-amber-400 text-amber-950 px-1 rounded-full font-black">
                        PRO
                      </span>
                    )}
                    <div className="w-10 h-10 flex items-center justify-center overflow-hidden">
                      <CompanionSprite species={pet.id} stage="hatchling" size={36} />
                    </div>
                    <span className="text-[9px] font-black text-[#164C68] truncate max-w-[50px] block">
                      {pet.name.split(' ')[0]}
                    </span>
                  </button>
                );
              })}
            </div>

            {petUpgradeNotice ? (
              <p className="text-[10px] text-amber-900 bg-amber-50 border border-amber-300 rounded-xl p-2 mt-2 leading-relaxed font-bold animate-in fade-in">
                {petUpgradeNotice}
              </p>
            ) : (
              <p className="text-[10px] text-cyan-800 bg-cyan-50 border border-cyan-200 rounded-xl p-2 mt-2 leading-relaxed font-medium">
                ✨ <strong>{COMPANION_SPECIES_LIST.find((p) => p.id === petSpecies)?.name}:</strong>{' '}
                {COMPANION_SPECIES_LIST.find((p) => p.id === petSpecies)?.description}
              </p>
            )}
          </div>

          {/* Child Name */}
          <div>
            <label className="text-xs font-bold text-[#8C9BA7] uppercase tracking-wider block mb-1.5">
              Nama Panggilan Anak
            </label>
            <input
              type="text"
              required
              disabled={isExceededFreeLimit}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Fatimah / Yusuf"
              className="w-full bg-[#EEF8FF] border border-[#C9E1ED] focus:border-[#08B9EF] rounded-2xl py-2.5 px-3.5 text-xs font-bold text-[#164C68] focus:outline-none disabled:opacity-50"
            />
          </div>

          {/* Learning Level */}
          <div>
            <label className="text-xs font-bold text-[#8C9BA7] uppercase tracking-wider block mb-1.5">
              Tingkat Hafalan
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['pemula', 'menengah', 'mahir'] as const).map((lvl) => (
                <button
                  type="button"
                  key={lvl}
                  disabled={isExceededFreeLimit}
                  onClick={() => setLevel(lvl)}
                  className={`py-2 rounded-xl text-xs font-bold capitalize transition-all ${
                    level === lvl
                      ? 'bg-[#08B9EF] text-white shadow-xs'
                      : 'bg-[#EEF8FF] text-[#164C68] hover:bg-[#d8eefc]'
                  } disabled:opacity-50`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          {/* Submit */}
          <div className="pt-2">
            <Button
              variant={isExceededFreeLimit ? 'secondary' : 'green'}
              size="lg"
              fullWidth
              type="submit"
              icon={<CheckCircle2 size={18} />}
            >
              {isExceededFreeLimit ? 'Buka Kunci PRO untuk Tambah Anak' : 'Simpan Profil Baru'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
