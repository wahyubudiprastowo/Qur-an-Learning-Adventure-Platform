import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Mail,
  Phone,
  ArrowRight,
  ShieldCheck,
  User,
  Users,
  LogOut,
  CheckCircle2,
  Sparkles,
  Smartphone,
  Lock,
  Globe,
  KeyRound,
  Check,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { UserAccount } from '../../types';
import { StorageService } from '../../services/storageService';

interface AuthModalProps {
  isOpen: boolean;
  initialMode?: 'login' | 'register' | 'switch';
  onClose: () => void;
  onAuthSuccess: (account: UserAccount) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  initialMode = 'login',
  onClose,
  onAuthSuccess,
}) => {
  const [activeTab, setActiveTab] = useState<'login' | 'register' | 'switch'>(initialMode);
  const [authChannel, setAuthChannel] = useState<'google' | 'whatsapp' | 'email'>('google');

  // Input states
  const [emailInput, setEmailInput] = useState<string>('wahyubudiprastowo@gmail.com');
  const [passwordInput, setPasswordInput] = useState<string>('••••••••');
  const [whatsappInput, setWhatsappInput] = useState<string>('081288882026');
  const [parentNameInput, setParentNameInput] = useState<string>('Wahyu Budi Prastowo');
  const [childNameInput, setChildNameInput] = useState<string>('Aisyah');

  // WhatsApp OTP simulation state
  const [otpSent, setOtpSent] = useState<boolean>(false);
  const [otpCode, setOtpCode] = useState<string>('202688');

  // Notices
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  if (!isOpen) return null;

  const allUsers = StorageService.getAllUsers();
  const currentAccount = StorageService.getUserAccount();

  // Fast One-Tap Google / Gmail Sign In
  const handleGoogleLogin = (customEmail?: string, customName?: string) => {
    setErrorMessage(null);
    const targetEmail = customEmail || emailInput.trim() || 'wahyubudiprastowo@gmail.com';
    const targetName = customName || parentNameInput.trim() || 'Wahyu Budi Prastowo';

    const account = StorageService.loginWithProvider(targetEmail, 'google', targetName);
    
    try {
      confetti({
        particleCount: 50,
        spread: 70,
        origin: { y: 0.5 },
        colors: ['#08B9EF', '#FFD83E', '#81E850', '#EA4335'],
      });
    } catch {}

    setSuccessNotice(`Berhasil masuk dengan Akun Google (${targetEmail})! Selamat datang, ${account.parentName}.`);
    setTimeout(() => {
      onAuthSuccess(account);
      onClose();
    }, 1000);
  };

  // WhatsApp OTP Login
  const handleSendWhatsAppOtp = () => {
    if (!whatsappInput || whatsappInput.replace(/\D/g, '').length < 9) {
      setErrorMessage('Masukkan nomor WhatsApp yang valid (minimal 9 digit).');
      return;
    }
    setErrorMessage(null);
    setOtpSent(true);
    setSuccessNotice(`Kode OTP 6-digit berhasil dikirim via WhatsApp ke ${whatsappInput}! (Gunakan kode: 202688)`);
  };

  const handleVerifyWhatsAppOtp = () => {
    if (otpCode !== '202688' && otpCode.length !== 6) {
      setErrorMessage('Kode OTP salah. Masukkan kode 202688 untuk verifikasi tes.');
      return;
    }
    const cleanWa = whatsappInput.trim();
    const account = StorageService.loginWithProvider(
      cleanWa,
      'whatsapp',
      parentNameInput.trim() || 'Keluarga WhatsApp'
    );

    try {
      confetti({
        particleCount: 45,
        spread: 60,
        origin: { y: 0.5 },
      });
    } catch {}

    setSuccessNotice(`Verifikasi WhatsApp Berhasil! Selamat datang, ${account.parentName}.`);
    setTimeout(() => {
      onAuthSuccess(account);
      onClose();
    }, 1000);
  };

  // Standard Email Login or Register
  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanEmail = emailInput.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setErrorMessage('Silakan masukkan format alamat email yang valid.');
      return;
    }

    const account = StorageService.loginWithProvider(
      cleanEmail,
      'email',
      parentNameInput.trim() || undefined
    );

    if (childNameInput.trim()) {
      const activeChild = StorageService.getActiveChild();
      if (activeChild) {
        StorageService.updateChild(activeChild.id, { name: childNameInput.trim() });
      }
    }

    try {
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.5 },
      });
    } catch {}

    setSuccessNotice(`Berhasil masuk dengan email! Selamat datang, ${account.parentName}.`);
    setTimeout(() => {
      onAuthSuccess(account);
      onClose();
    }, 1000);
  };

  // Switch between existing registered users on device
  const handleSwitchAccount = (userId: string) => {
    const updated = StorageService.switchAccount(userId);
    setSuccessNotice(`Beralih ke akun ${updated.parentName}.`);
    setTimeout(() => {
      onAuthSuccess(updated);
      onClose();
    }, 800);
  };

  const handleLogout = () => {
    const guest = StorageService.logoutUser();
    setSuccessNotice('Berhasil keluar dari akun.');
    setTimeout(() => {
      onAuthSuccess(guest);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 15 }}
        className="bg-white rounded-3xl border border-[#C9E1ED] shadow-2xl max-w-3xl w-full overflow-hidden my-4 relative font-sans"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer"
        >
          <X size={16} />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-12 min-h-[500px]">
          {/* LEFT COLUMN: MAIN AUTH / REGISTER / SWITCHER */}
          <div className="md:col-span-7 p-6 sm:p-8 flex flex-col justify-between space-y-4">
            <div>
              {/* Header Title */}
              <div className="flex items-center gap-2 mb-1">
                <span className="text-2xl">🕌</span>
                <h2 className="text-xl sm:text-2xl font-black text-[#164C68] font-heading tracking-tight">
                  {activeTab === 'login'
                    ? 'Masuk Akun Keluarga'
                    : activeTab === 'register'
                    ? 'Daftar Akun Baru'
                    : 'Pilih Akun Tersimpan'}
                </h2>
              </div>
              <p className="text-xs text-[#8C9BA7] font-medium leading-relaxed">
                {activeTab === 'switch'
                  ? 'Ganti profil pengguna atau masuk sebagai anggota keluarga lain di perangkat ini.'
                  : 'Sinkronisasi riwayat hafalan anak, status paket PRO, & ranking antar perangkat.'}
              </p>

              {/* Main Mode Segmented Control */}
              <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-2xl mt-4">
                <button
                  type="button"
                  onClick={() => setActiveTab('login')}
                  className={`py-2 text-xs font-black rounded-xl transition-all cursor-pointer ${
                    activeTab === 'login'
                      ? 'bg-white text-[#164C68] shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Masuk
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('register')}
                  className={`py-2 text-xs font-black rounded-xl transition-all cursor-pointer ${
                    activeTab === 'register'
                      ? 'bg-white text-[#164C68] shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Daftar
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('switch')}
                  className={`py-2 text-xs font-black rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1 ${
                    activeTab === 'switch'
                      ? 'bg-[#164C68] text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Users size={12} />
                  <span>Akun ({allUsers.length})</span>
                </button>
              </div>

              {/* Feedback messages */}
              {errorMessage && (
                <div className="mt-3 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold animate-in fade-in">
                  {errorMessage}
                </div>
              )}
              {successNotice && (
                <div className="mt-3 p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold animate-in fade-in flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                  <span>{successNotice}</span>
                </div>
              )}

              {/* TAB CONTENT: SWITCH ACCOUNTS (MULTI-USER) */}
              {activeTab === 'switch' && (
                <div className="mt-4 space-y-2.5">
                  <span className="text-[11px] font-black text-[#8C9BA7] uppercase tracking-wider block">
                    Daftar Akun di Perangkat Ini
                  </span>

                  <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
                    {allUsers.map((u) => {
                      const isCurrent = u.id === currentAccount.id;
                      return (
                        <div
                          key={u.id}
                          className={`p-3 rounded-2xl border-2 transition-all flex items-center justify-between ${
                            isCurrent
                              ? 'border-[#08B9EF] bg-cyan-50/60 shadow-xs ring-1 ring-cyan-200'
                              : 'border-slate-200 hover:border-slate-300 bg-white'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center text-xl shrink-0 border border-slate-200">
                              {u.authProvider === 'google' ? '🌐' : u.authProvider === 'whatsapp' ? '💬' : '👤'}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs font-black text-[#164C68] truncate">
                                  {u.parentName}
                                </span>
                                {isCurrent && (
                                  <span className="text-[9px] font-black bg-[#08B9EF] text-white px-1.5 py-0.2 rounded-md">
                                    AKTIF
                                  </span>
                                )}
                                <span
                                  className={`text-[9px] font-black px-1.5 py-0.2 rounded-md ${
                                    u.planTier === 'pro'
                                      ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                      : 'bg-slate-100 text-slate-600'
                                  }`}
                                >
                                  {u.planTier === 'pro' ? '👑 PRO' : 'FREE'}
                                </span>
                              </div>
                              <span className="text-[10px] text-[#8C9BA7] truncate block">
                                {u.email || u.whatsapp || 'Akun Tamu'}
                              </span>
                            </div>
                          </div>

                          {!isCurrent ? (
                            <button
                              type="button"
                              onClick={() => handleSwitchAccount(u.id)}
                              className="px-3 py-1.5 rounded-xl bg-[#164C68] hover:bg-[#08B9EF] text-white text-xs font-bold transition-colors cursor-pointer shrink-0"
                            >
                              Pilih
                            </button>
                          ) : (
                            <span className="text-xs font-bold text-emerald-600 flex items-center gap-0.5 shrink-0">
                              <Check size={14} /> Digunakan
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <div className="pt-2 flex gap-2">
                    <button
                      type="button"
                      onClick={() => setActiveTab('register')}
                      className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors cursor-pointer text-center"
                    >
                      + Tambah Akun Baru
                    </button>
                    {currentAccount.isRegistered && (
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="px-3 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                      >
                        <LogOut size={13} />
                        <span>Keluar</span>
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* TAB CONTENT: LOGIN / REGISTER CHANNELS */}
              {activeTab !== 'switch' && (
                <div className="mt-4 space-y-4">
                  {/* Channel Switcher Tabs */}
                  <div className="grid grid-cols-3 gap-1.5">
                    <button
                      type="button"
                      onClick={() => setAuthChannel('google')}
                      className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                        authChannel === 'google'
                          ? 'border-[#08B9EF] bg-cyan-50/60 text-[#08B9EF] shadow-2xs font-black'
                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <span>🌐</span>
                      <span>Google / Gmail</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setAuthChannel('whatsapp')}
                      className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                        authChannel === 'whatsapp'
                          ? 'border-[#25D366] bg-emerald-50/60 text-[#25D366] shadow-2xs font-black'
                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <span>💬</span>
                      <span>WhatsApp</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setAuthChannel('email')}
                      className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                        authChannel === 'email'
                          ? 'border-[#164C68] bg-slate-100 text-[#164C68] shadow-2xs font-black'
                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <span>📧</span>
                      <span>Email</span>
                    </button>
                  </div>

                  {/* 1. GOOGLE SIGN-IN */}
                  {authChannel === 'google' && (
                    <div className="space-y-3 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                      <div className="text-center space-y-1">
                        <span className="text-xs font-bold text-slate-700 block">
                          Masuk Cepat dengan Akun Google
                        </span>
                        <p className="text-[11px] text-slate-500">
                          Satu klik tanpa ribet mengingat kata sandi.
                        </p>
                      </div>

                      {/* Fast Google Account Button (matching user's actual email) */}
                      <button
                        type="button"
                        onClick={() => handleGoogleLogin('wahyubudiprastowo@gmail.com', 'Wahyu Budi Prastowo')}
                        className="w-full py-3 px-4 rounded-2xl bg-white hover:bg-slate-100 border-2 border-slate-300 text-slate-800 text-xs font-bold shadow-xs cursor-pointer flex items-center justify-center gap-2.5 transition-all group"
                      >
                        <svg className="w-4 h-4" viewBox="0 0 24 24">
                          <path
                            fill="#4285F4"
                            d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                          />
                          <path
                            fill="#34A853"
                            d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                          />
                          <path
                            fill="#FBBC05"
                            d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.17 0 9.97 0 12s.45 3.83 1.25 5.42l4.03-3.15z"
                          />
                          <path
                            fill="#EA4335"
                            d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                          />
                        </svg>
                        <span className="truncate">
                          Lanjutkan sebagai Wahyu Budi (wahyubudiprastowo@gmail.com)
                        </span>
                      </button>

                      {/* Custom google email input if desired */}
                      <div className="space-y-1.5 pt-1">
                        <label className="text-[10px] font-bold text-slate-500 block">
                          Atau gunakan akun Google / Gmail lainnya:
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="email"
                            value={emailInput}
                            onChange={(e) => setEmailInput(e.target.value)}
                            placeholder="nama.kamu@gmail.com"
                            className="flex-1 px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-[#08B9EF]"
                          />
                          <button
                            type="button"
                            onClick={() => handleGoogleLogin(emailInput)}
                            className="px-3 py-2 rounded-xl bg-[#08B9EF] text-white text-xs font-bold cursor-pointer"
                          >
                            Masuk
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 2. WHATSAPP SIGN-IN */}
                  {authChannel === 'whatsapp' && (
                    <div className="space-y-3 p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200">
                      <div>
                        <label className="text-xs font-bold text-emerald-950 block mb-1">
                          Nomor WhatsApp Orang Tua
                        </label>
                        <div className="flex gap-2">
                          <span className="px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-black text-slate-700 flex items-center">
                            🇮🇩 +62
                          </span>
                          <input
                            type="tel"
                            value={whatsappInput}
                            onChange={(e) => setWhatsappInput(e.target.value)}
                            placeholder="81288882026"
                            className="flex-1 px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-[#25D366]"
                          />
                        </div>
                      </div>

                      {activeTab === 'register' && (
                        <div>
                          <label className="text-[11px] font-bold text-slate-600 block mb-1">
                            Nama Wali / Orang Tua
                          </label>
                          <input
                            type="text"
                            value={parentNameInput}
                            onChange={(e) => setParentNameInput(e.target.value)}
                            placeholder="Bunda Sarah / Ayah Hendra"
                            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-none"
                          />
                        </div>
                      )}

                      {!otpSent ? (
                        <button
                          type="button"
                          onClick={handleSendWhatsAppOtp}
                          className="w-full py-2.5 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs font-black shadow-xs cursor-pointer flex items-center justify-center gap-2"
                        >
                          <Smartphone size={14} />
                          <span>Kirim Kode OTP ke WhatsApp</span>
                        </button>
                      ) : (
                        <div className="space-y-2 pt-1 animate-in fade-in">
                          <label className="text-xs font-bold text-emerald-950 block">
                            Masukkan 6-Digit Kode OTP WhatsApp (Gunakan: 202688)
                          </label>
                          <input
                            type="text"
                            value={otpCode}
                            onChange={(e) => setOtpCode(e.target.value)}
                            maxLength={6}
                            className="w-full px-3 py-2 bg-white border border-emerald-300 rounded-xl text-center text-lg font-mono font-black tracking-widest text-[#164C68] focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={handleVerifyWhatsAppOtp}
                            className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-xs cursor-pointer flex items-center justify-center gap-2"
                          >
                            <span>Verifikasi & Masuk Akun</span>
                            <ArrowRight size={14} />
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* 3. EMAIL SIGN-IN */}
                  {authChannel === 'email' && (
                    <form onSubmit={handleEmailSubmit} className="space-y-3 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">
                          Alamat Email
                        </label>
                        <input
                          type="email"
                          value={emailInput}
                          onChange={(e) => setEmailInput(e.target.value)}
                          placeholder="keluarga@email.com"
                          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-[#08B9EF]"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">
                          Kata Sandi
                        </label>
                        <input
                          type="password"
                          value={passwordInput}
                          onChange={(e) => setPasswordInput(e.target.value)}
                          placeholder="Minimal 6 karakter"
                          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-[#08B9EF]"
                        />
                      </div>

                      {activeTab === 'register' && (
                        <div>
                          <label className="text-xs font-bold text-slate-700 block mb-1">
                            Nama Orang Tua
                          </label>
                          <input
                            type="text"
                            value={parentNameInput}
                            onChange={(e) => setParentNameInput(e.target.value)}
                            placeholder="Ayah / Bunda"
                            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-[#08B9EF]"
                          />
                        </div>
                      )}

                      <button
                        type="submit"
                        className="w-full py-2.5 rounded-xl bg-[#164C68] hover:bg-[#08B9EF] text-white text-xs font-black shadow-xs cursor-pointer flex items-center justify-center gap-2 transition-colors"
                      >
                        <span>{activeTab === 'register' ? 'Daftar Sekarang' : 'Masuk dengan Email'}</span>
                        <ArrowRight size={14} />
                      </button>
                    </form>
                  )}
                </div>
              )}
            </div>

            {/* Bottom info */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-[#8C9BA7]">
              <span>Privasi data santri 100% terjaga</span>
              <button
                type="button"
                onClick={onClose}
                className="font-bold text-[#164C68] hover:underline cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>

          {/* RIGHT COLUMN: BENEFITS & MASCOT */}
          <div className="md:col-span-5 bg-gradient-to-br from-[#164C68] via-[#0E3D55] to-[#08B9EF] p-6 text-white flex flex-col justify-between">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-1.5 bg-white/15 px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase backdrop-blur-xs">
                <Sparkles size={12} className="text-amber-300" />
                <span>Multi-Akun & Sinkronisasi Cloud</span>
              </div>

              <div>
                <h3 className="text-lg font-black font-heading leading-snug">
                  Belajar & Menghafal Al-Qur'an Lebih Tenang Bersama Keluarga
                </h3>
                <p className="text-xs text-cyan-100 font-medium mt-1 leading-relaxed">
                  Semua kemajuan hafalan, level Sahabat 3D Lumi, dan bintang mutqin tersimpan otomatis.
                </p>
              </div>

              {/* Checklist */}
              <div className="space-y-2.5 pt-2 text-xs">
                {[
                  'Bisa login lewat Gmail, WhatsApp, & Email',
                  'Ganti akun multi-wali murid di 1 HP',
                  'Akses 8 arena mini-game edukatif',
                  'Laporan hafalan mingguan visual',
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-emerald-400 text-slate-950 flex items-center justify-center text-[10px] font-black shrink-0">
                      ✓
                    </div>
                    <span className="text-white/90 font-medium">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white/10 rounded-2xl p-3.5 backdrop-blur-xs border border-white/20 mt-4 text-center">
              <span className="text-2xl block mb-1">🌟</span>
              <p className="text-[11px] font-bold text-white">
                "Sebaik-baik kalian adalah orang yang belajar Al-Qur'an dan mengajarkannya."
              </p>
              <span className="text-[10px] text-cyan-200 block mt-0.5">(HR. Bukhari)</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
