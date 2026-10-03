import React, { useState } from 'react';
import { User, X, CheckCircle2, Sparkles } from 'lucide-react';
import { LearningLevel, ChildProfile } from '../../types';
import { StorageService } from '../../services/storageService';
import { Button } from '../common/Button';

interface ChildProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onChildCreated: (child: ChildProfile) => void;
}

export const ChildProfileModal: React.FC<ChildProfileModalProps> = ({
  isOpen,
  onClose,
  onChildCreated,
}) => {
  const [name, setName] = useState<string>('');
  const [avatar, setAvatar] = useState<string>('👧');
  const [level, setLevel] = useState<LearningLevel>('pemula');
  const [birthYear, setBirthYear] = useState<string>('2018');

  if (!isOpen) return null;

  const avatarsList = ['👧', '👦', '🧒', '🧕', '👳', '🌟', '🌱', '🌸', '🦁', '🐬'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newChild = StorageService.createChild(
      name.trim(),
      avatar,
      level,
      birthYear ? parseInt(birthYear, 10) : undefined
    );
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

          {/* Child Name */}
          <div>
            <label className="text-xs font-bold text-[#8C9BA7] uppercase tracking-wider block mb-1.5">
              Nama Panggilan Anak
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Fatimah / Yusuf"
              className="w-full bg-[#EEF8FF] border border-[#C9E1ED] focus:border-[#08B9EF] rounded-2xl py-2.5 px-3.5 text-xs font-bold text-[#164C68] focus:outline-none"
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
                  onClick={() => setLevel(lvl)}
                  className={`py-2 rounded-xl text-xs font-bold capitalize transition-all ${
                    level === lvl
                      ? 'bg-[#08B9EF] text-white shadow-xs'
                      : 'bg-[#EEF8FF] text-[#164C68] hover:bg-[#d8eefc]'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          {/* Submit */}
          <div className="pt-2">
            <Button variant="green" size="lg" fullWidth type="submit" icon={<CheckCircle2 size={18} />}>
              Simpan Profil Baru
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
