import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Eye,
  EyeOff,
  CheckCircle2,
  Sparkles,
  Phone,
  Mail,
  User,
  Lock,
  Heart,
  BookOpen,
  Mic,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { UserAccount } from '../../types';
import { StorageService } from '../../services/storageService';

interface AuthModalProps {
  isOpen: boolean;
  initialMode?: 'login' | 'register';
  onClose: () => void;
  onAuthSuccess: (account: UserAccount) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  initialMode = 'register',
  onClose,
  onAuthSuccess,
}) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);

  // Form Fields (Inspired by Hijalearn.id parent & child onboarding)
  const [parentName, setParentName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [childName, setChildName] = useState('');
  const [childAgeGroup, setChildAgeGroup] = useState<string>('6-8 thn');
  const [learningTarget, setLearningTarget] = useState<string>('juz30');
  const [agreedTerms, setAgreedTerms] = useState(true);
  const [rememberMe, setRememberMe] = useState(true);

  // Feedback states
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const validate = (): boolean => {
    setErrorMessage(null);

    if (mode === 'register') {
      if (!parentName.trim()) {
        setErrorMessage('Nama Ayah/Bunda wajib diisi.');
        return false;
      }
      if (!email.trim() || !email.includes('@')) {
        setErrorMessage('Format email belum valid.');
        return false;
      }
      if (!whatsapp.trim() || whatsapp.trim().length < 9) {
        setErrorMessage('Nomor WhatsApp aktif wajib diisi (minimal 9 digit).');
        return false;
      }
      if (password.length < 8) {
        setErrorMessage('Kata sandi minimal 8 karakter demi keamanan akun keluarga.');
        return false;
      }
      if (!agreedTerms) {
        setErrorMessage('Silakan setujui ketentuan layanan untuk melanjutkan.');
        return false;
      }
    } else {
      // Login validation
      if (!email.trim()) {
        setErrorMessage('Email atau nomor WhatsApp wajib diisi.');
        return false;
      }
      if (!password || password.length < 6) {
        setErrorMessage('Kata sandi harus diisi.');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    if (mode === 'register') {
      const targetLabel =
        learningTarget === 'juz30'
          ? 'Hafalan Juz 30'
          : learningTarget === 'iqra'
          ? 'Iqra & Huruf Hijaiyah'
          : 'Tartil & Makhraj AI';

      const account = StorageService.registerUser(
        parentName,
        email,
        whatsapp,
        childName,
        targetLabel
      );

      setSuccessMessage(
        `Alhamdulillah! Akun keluarga ${parentName} berhasil didaftarkan.`
      );

      try {
        confetti({
          particleCount: 50,
          spread: 80,
          origin: { y: 0.5 },
          colors: ['#22C55E', '#10B981', '#38BDF8', '#FBBF24'],
        });
      } catch {
        // Ignore
      }

      setTimeout(() => {
        onAuthSuccess(account);
        onClose();
      }, 1000);
    } else {
      const account = StorageService.loginUser(email, parentName || undefined);
      setSuccessMessage('Selamat datang kembali! Masuk berhasil.');
      setTimeout(() => {
        onAuthSuccess(account);
        onClose();
      }, 900);
    }
  };

  const handleGoogleAuth = () => {
    const defaultEmail = email.trim() || 'keluarga.quran@gmail.com';
    const defaultName = parentName.trim() || 'Orang Tua Hafiz';
    const account = StorageService.registerUser(
      defaultName,
      defaultEmail,
      whatsapp || '081234567890',
      childName || 'Aisyah',
      'Hafalan Juz 30'
    );

    setSuccessMessage(`Berhasil terhubung dengan Google (${defaultEmail})!`);

    try {
      confetti({
        particleCount: 40,
        spread: 70,
        origin: { y: 0.5 },
        colors: ['#4285F4', '#34A853', '#FBBC05', '#EA4335'],
      });
    } catch {
      // Ignore
    }

    setTimeout(() => {
      onAuthSuccess(account);
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 14 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 14 }}
        className="bg-[#0B132B] text-slate-100 border border-[#1E293B] rounded-3xl max-w-lg w-full max-h-[92vh] flex flex-col shadow-2xl relative overflow-hidden font-sans"
      >
        {/* Decorative Ambient Glow */}
        <div className="absolute -top-24 -right-24 w-52 h-52 bg-[#22C55E]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-52 h-52 bg-[#0284C7]/15 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header Section */}
        <div className="p-5 sm:p-6 pb-3 border-b border-[#1E293B] shrink-0 relative">
          <button
            onClick={onClose}
            aria-label="Tutup"
            className="absolute top-5 right-5 w-8 h-8 rounded-full bg-[#1E293B] text-slate-400 hover:text-white hover:bg-slate-700 flex items-center justify-center transition-colors cursor-pointer z-10"
          >
            <X size={17} />
          </button>

          {/* Logo & Platform Name */}
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">✨</span>
            <span className="text-lg font-black font-heading tracking-tight text-white">
              Cahaya<span className="text-[#22C55E]">Tahfiz</span>
            </span>
            <span className="text-[10px] font-bold bg-[#22C55E]/20 text-[#22C55E] border border-[#22C55E]/30 px-2 py-0.5 rounded-full">
              Hijalearn Platform
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-white font-heading tracking-tight">
            {mode === 'register' ? 'Buat Akun Belajar Keluarga' : 'Selamat Datang Kembali!'}
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {mode === 'register'
              ? 'Daftar gratis untuk simpan rapor hafalan, koreksi makhraj AI & pantau progres anak.'
              : 'Masuk untuk melanjutkan petualangan Al-Qur\'an si kecil.'}
          </p>

          {/* Mode Switch Tabs (Hijalearn style tabs) */}
          <div className="mt-4 grid grid-cols-2 gap-2 bg-[#111C35] p-1 rounded-2xl border border-[#223554]">
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setErrorMessage(null);
              }}
              className={`py-2 px-3 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                mode === 'register'
                  ? 'bg-[#22C55E] text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>Daftar Akun Baru</span>
              <span className="text-[9px] bg-slate-950/20 px-1.5 py-0.2 rounded-full font-bold">
                Gratis
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                setMode('login');
                setErrorMessage(null);
              }}
              className={`py-2 px-3 rounded-xl text-xs font-black transition-all cursor-pointer ${
                mode === 'login'
                  ? 'bg-slate-700 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Sudah Punya Akun? Masuk
            </button>
          </div>
        </div>

        {/* Scrollable Form Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
          {/* Success Message Banner */}
          {successMessage && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 bg-emerald-950/80 border border-emerald-500/50 rounded-2xl flex items-center gap-2.5 text-xs text-emerald-300 font-bold"
            >
              <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
              <span>{successMessage}</span>
            </motion.div>
          )}

          {/* Error Message Banner */}
          {errorMessage && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 bg-rose-950/80 border border-rose-500/50 rounded-2xl flex items-center gap-2.5 text-xs text-rose-300 font-bold"
            >
              <span className="text-rose-400 shrink-0">⚠️</span>
              <span>{errorMessage}</span>
            </motion.div>
          )}

          {/* Quick Highlight of Free Benefits (Hijalearn style assurance) */}
          {mode === 'register' && (
            <div className="bg-emerald-950/30 border border-emerald-500/30 rounded-2xl p-3 text-xs space-y-1.5">
              <div className="text-[11px] font-black text-emerald-400 flex items-center gap-1.5">
                <Sparkles size={14} />
                <span>KEUNTUNGAN AKUN CAHAYA TAHFIZ (100% GRATIS)</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300">
                <div className="flex items-center gap-1.5">
                  <span className="text-emerald-400">✓</span>
                  <span>Juz 30 Lengkap 37 Surah</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-emerald-400">✓</span>
                  <span>Deteksi Suara AI Tartil</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-emerald-400">✓</span>
                  <span>Pet Tamagotchi Interaktif</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-emerald-400">✓</span>
                  <span>Simpan Rapor di Cloud</span>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {/* REGISTER FIELDS */}
            {mode === 'register' && (
              <>
                {/* 1. Nama Orang Tua */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">
                    Nama Ayah / Bunda <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={parentName}
                      onChange={(e) => setParentName(e.target.value)}
                      placeholder="Contoh: Bunda Sarah / Ayah Rahman"
                      className="w-full bg-[#111C35] border border-[#223554] focus:border-[#22C55E] focus:ring-1 focus:ring-[#22C55E] text-white placeholder-slate-500 rounded-2xl pl-10 pr-4 py-3 text-xs font-medium outline-hidden transition-all"
                    />
                  </div>
                </div>

                {/* 2. Nomor WhatsApp */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1 flex items-center justify-between">
                    <span>Nomor WhatsApp Aktif <span className="text-rose-400">*</span></span>
                    <span className="text-[10px] text-emerald-400 font-semibold">Untuk Rapor & Update</span>
                  </label>
                  <div className="relative">
                    <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="tel"
                      value={whatsapp}
                      onChange={(e) => setWhatsapp(e.target.value)}
                      placeholder="Contoh: 081234567890"
                      className="w-full bg-[#111C35] border border-[#223554] focus:border-[#22C55E] focus:ring-1 focus:ring-[#22C55E] text-white placeholder-slate-500 rounded-2xl pl-10 pr-4 py-3 text-xs font-medium outline-hidden transition-all"
                    />
                  </div>
                </div>
              </>
            )}

            {/* Email (Both modes) */}
            <div>
              <label className="block text-[11px] font-bold text-slate-300 mb-1">
                Alamat Email <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="keluarga@email.com"
                  className="w-full bg-[#111C35] border border-[#223554] focus:border-[#22C55E] focus:ring-1 focus:ring-[#22C55E] text-white placeholder-slate-500 rounded-2xl pl-10 pr-4 py-3 text-xs font-medium outline-hidden transition-all"
                />
              </div>
            </div>

            {/* Password (Both modes) */}
            <div>
              <label className="block text-[11px] font-bold text-slate-300 mb-1">
                Kata Sandi <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={mode === 'register' ? 'Minimal 8 karakter' : 'Masukkan kata sandi'}
                  className="w-full bg-[#111C35] border border-[#223554] focus:border-[#22C55E] focus:ring-1 focus:ring-[#22C55E] text-white placeholder-slate-500 rounded-2xl pl-10 pr-11 py-3 text-xs font-medium outline-hidden transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 cursor-pointer"
                  title={showPassword ? 'Sembunyikan' : 'Tampilkan'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* REGISTER ONLY: Child details & target */}
            {mode === 'register' && (
              <div className="pt-2 border-t border-[#1E293B] space-y-3">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  DATA PROFIL ANAK (BISA DIUBAH NANTI)
                </div>

                {/* Nama Panggilan Anak */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">
                    Nama Panggilan Anak
                  </label>
                  <input
                    type="text"
                    value={childName}
                    onChange={(e) => setChildName(e.target.value)}
                    placeholder="Contoh: Aisyah / Fatih"
                    className="w-full bg-[#111C35] border border-[#223554] focus:border-[#22C55E] focus:ring-1 focus:ring-[#22C55E] text-white placeholder-slate-500 rounded-2xl px-4 py-2.5 text-xs font-medium outline-hidden transition-all"
                  />
                </div>

                {/* Usia Anak Pills */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">
                    Kelompok Usia Anak
                  </label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {['3-5 thn', '6-8 thn', '9-12 thn', '> 12 thn'].map((age) => (
                      <button
                        type="button"
                        key={age}
                        onClick={() => setChildAgeGroup(age)}
                        className={`py-1.5 px-2 rounded-xl text-[11px] font-bold border transition-all cursor-pointer ${
                          childAgeGroup === age
                            ? 'bg-[#08B9EF] text-white border-[#08B9EF]'
                            : 'bg-[#111C35] text-slate-400 border-[#223554] hover:text-white'
                        }`}
                      >
                        {age}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Target Belajar Awal */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">
                    Target Utama Belajar
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    <button
                      type="button"
                      onClick={() => setLearningTarget('juz30')}
                      className={`p-2 rounded-xl text-left border transition-all cursor-pointer flex flex-col justify-between ${
                        learningTarget === 'juz30'
                          ? 'bg-emerald-950/70 border-[#22C55E] text-white'
                          : 'bg-[#111C35] border-[#223554] text-slate-400'
                      }`}
                    >
                      <span className="text-base">📖</span>
                      <span className="text-[10px] font-black mt-1 leading-tight">Tahfiz Juz 30</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setLearningTarget('iqra')}
                      className={`p-2 rounded-xl text-left border transition-all cursor-pointer flex flex-col justify-between ${
                        learningTarget === 'iqra'
                          ? 'bg-emerald-950/70 border-[#22C55E] text-white'
                          : 'bg-[#111C35] border-[#223554] text-slate-400'
                      }`}
                    >
                      <span className="text-base">🔤</span>
                      <span className="text-[10px] font-black mt-1 leading-tight">Iqra & Huruf</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setLearningTarget('makhraj')}
                      className={`p-2 rounded-xl text-left border transition-all cursor-pointer flex flex-col justify-between ${
                        learningTarget === 'makhraj'
                          ? 'bg-emerald-950/70 border-[#22C55E] text-white'
                          : 'bg-[#111C35] border-[#223554] text-slate-400'
                      }`}
                    >
                      <span className="text-base">🎙️</span>
                      <span className="text-[10px] font-black mt-1 leading-tight">Makhraj Tartil</span>
                    </button>
                  </div>
                </div>

                {/* Terms agreement checkbox */}
                <div className="pt-1">
                  <label className="flex items-start gap-2.5 text-[11px] text-slate-400 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={agreedTerms}
                      onChange={(e) => setAgreedTerms(e.target.checked)}
                      className="mt-0.5 rounded border-[#223554] text-[#22C55E] focus:ring-[#22C55E] bg-[#111C35]"
                    />
                    <span>
                      Saya setuju dengan{' '}
                      <span className="text-emerald-400 font-bold hover:underline">Ketentuan Layanan</span> dan{' '}
                      <span className="text-emerald-400 font-bold hover:underline">Kebijakan Privasi</span> Cahaya Tahfiz.
                    </span>
                  </label>
                </div>
              </div>
            )}

            {/* LOGIN EXTRAS: Ingat Saya & Lupa Sandi */}
            {mode === 'login' && (
              <div className="flex items-center justify-between text-xs text-slate-400 pt-0.5">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-[#223554] text-[#22C55E] focus:ring-[#22C55E] bg-[#111C35]"
                  />
                  <span>Ingat saya</span>
                </label>

                <button
                  type="button"
                  onClick={() => setErrorMessage('Tautan reset sandi telah dikirim ke email atau WhatsApp Anda.')}
                  className="text-[#22C55E] hover:underline font-bold cursor-pointer"
                >
                  Lupa sandi?
                </button>
              </div>
            )}

            {/* Primary Action Button (Hijalearn Emerald Green CTA) */}
            <button
              type="submit"
              className="w-full mt-3 py-3.5 px-4 rounded-2xl bg-[#22C55E] hover:bg-[#16A34A] text-slate-950 font-black text-sm uppercase tracking-wider shadow-lg shadow-emerald-500/25 active:scale-98 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <span>{mode === 'register' ? 'DAFTAR AKUN SEKARANG' : 'MASUK KE AKUN'}</span>
              <ChevronRight size={18} strokeWidth={3} />
            </button>
          </form>

          {/* DIVIDER: ATAU */}
          <div className="relative my-3 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#1E293B]" />
            </div>
            <span className="relative bg-[#0B132B] px-3 text-[11px] font-bold text-slate-500 uppercase tracking-widest">
              ATAU
            </span>
          </div>

          {/* GOOGLE SIGN IN BUTTON */}
          <button
            onClick={handleGoogleAuth}
            type="button"
            className="w-full py-3 px-4 rounded-2xl bg-[#111C35] hover:bg-[#182647] border border-[#223554] text-white font-extrabold text-xs flex items-center justify-center gap-2.5 transition-all cursor-pointer active:scale-98"
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span className="tracking-wide">
              {mode === 'register' ? 'DAFTAR DENGAN GOOGLE' : 'MASUK DENGAN GOOGLE'}
            </span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};
