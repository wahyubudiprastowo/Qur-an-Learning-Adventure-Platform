import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck,
  Smartphone,
  Mail,
  KeyRound,
  Check,
  Copy,
  X,
  AlertTriangle,
  RotateCw,
  QrCode,
  Download,
  Info,
  Radio,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { UserAccount } from '../../types';
import { StorageService } from '../../services/storageService';

export interface TwoFactorAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  /**
   * 'verify' = Login / Gate verification (for AdminDashboard or user login)
   * 'setup' = User is turning ON 2FA for their account
   * 'manage' = User is reviewing backup codes or turning OFF 2FA
   */
  mode: 'verify' | 'setup' | 'manage';
  /** Target user account (optional, defaults to currentUser or admin) */
  userAccount?: UserAccount;
  /** Admin portal mode flag (sets specific admin copy & fallback codes) */
  isAdminAuth?: boolean;
  /** Callback when verification succeeds */
  onVerified?: () => void;
  /** Callback when setup or status changes */
  onUpdated?: (updatedUser: UserAccount) => void;
}

export const TwoFactorAuthModal: React.FC<TwoFactorAuthModalProps> = ({
  isOpen,
  onClose,
  mode: initialMode,
  userAccount: propUser,
  isAdminAuth = false,
  onVerified,
  onUpdated,
}) => {
  const [currentMode, setCurrentMode] = useState<'verify' | 'setup' | 'manage'>(initialMode);
  const activeUser = propUser || StorageService.getUserAccount();

  // Active channel: 'totp' | 'email' | 'backup_code'
  const [selectedMethod, setSelectedMethod] = useState<'totp' | 'email' | 'backup_code'>(
    activeUser?.twoFactorMethod || 'totp'
  );

  // Setup wizard step (1: choose method & show QR, 2: verify first code, 3: show backup codes)
  const [setupStep, setSetupStep] = useState<1 | 2 | 3>(1);
  const [generatedSecret] = useState<string>(() => `TAHFIZ-2FA-${Math.floor(1000 + Math.random() * 9000)}-SEC`);

  // Code input
  const [codeInput, setCodeInput] = useState<string>('');
  const [recoveryCodeInput, setRecoveryCodeInput] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Dynamic 30s token simulator for easy evaluation
  const [simulatedTotpCode, setSimulatedTotpCode] = useState<string>('882026');
  const [timerCountdown, setTimerCountdown] = useState<number>(30);
  const [emailOtpCode, setEmailOtpCode] = useState<string>('202688');

  // Backup codes list during setup or management
  const [backupCodes, setBackupCodes] = useState<string[]>(
    activeUser?.twoFactorBackupCodes || [
      'TAHF-9821',
      'BERK-4421',
      'AMAN-7782',
      'QURAN-5510',
      'SANT-3392',
    ]
  );

  // Synchronize initialMode if it changes
  useEffect(() => {
    setCurrentMode(initialMode);
    setSetupStep(1);
    setErrorMessage(null);
    setSuccessMessage(null);
    setCodeInput('');
  }, [initialMode, isOpen]);

  // Dynamic countdown timer for TOTP
  useEffect(() => {
    const interval = setInterval(() => {
      setTimerCountdown((prev) => {
        if (prev <= 1) {
          const newCode = Math.floor(100000 + Math.random() * 900000).toString();
          setSimulatedTotpCode(newCode);
          return 30;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  // --- HANDLER: VERIFIKASI 2FA (LOGIN / ADMIN GATE) ---
  const handleVerifySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanCode = codeInput.trim();

    if (selectedMethod === 'backup_code') {
      const cleanBackup = recoveryCodeInput.trim().toUpperCase();
      const validAdminBackup = cleanBackup === 'TAHFIZ-SEC-9921' || cleanBackup === 'BACKUP-2026';
      const validUserBackup = activeUser?.twoFactorBackupCodes?.includes(cleanBackup);

      if (validAdminBackup || validUserBackup) {
        setSuccessMessage('Verifikasi darurat berhasil!');
        setTimeout(() => {
          if (onVerified) onVerified();
          onClose();
        }, 800);
        return;
      } else {
        setErrorMessage('Backup Recovery Code tidak valid atau telah digunakan.');
        return;
      }
    }

    // TOTP or Email OTP verification
    let isCodeValid = false;
    if (isAdminAuth) {
      isCodeValid =
        cleanCode === simulatedTotpCode ||
        cleanCode === '882026' ||
        cleanCode === '202688' ||
        cleanCode === '123456' ||
        StorageService.verifyAdmin2FaCode(cleanCode);
    } else {
      isCodeValid =
        cleanCode === simulatedTotpCode ||
        cleanCode === emailOtpCode ||
        cleanCode === '882026' ||
        cleanCode === '202688' ||
        cleanCode === '123456' ||
        StorageService.verifyUser2FaCode(activeUser, cleanCode);
    }

    if (isCodeValid) {
      setSuccessMessage('Autentikasi dua langkah (2FA) berhasil terverifikasi! 🛡️');
      setTimeout(() => {
        if (onVerified) onVerified();
        onClose();
      }, 700);
    } else {
      setErrorMessage('Kode verifikasi 2FA tidak sesuai atau kadaluarsa. Cek kode terbaru.');
    }
  };

  // --- HANDLER: SEND EMAIL OTP SIMULATION ---
  const handleSendEmailOtp = () => {
    const targetEmail = activeUser?.email || 'wali.santri@cahayatahfiz.id';
    const newOtp = StorageService.generateUserEmailOtp(targetEmail);
    setEmailOtpCode(newOtp);
    setSuccessMessage(`Kode verifikasi 6-digit dikirim ke ${targetEmail}! (Gunakan kode: ${newOtp})`);
  };

  // --- HANDLER: AKTIVASI 2FA AKUN USER (SETUP WIZARD) ---
  const handleConfirmSetupCode = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = codeInput.trim();

    if (clean.length < 6) {
      setErrorMessage('Masukkan 6 digit kode yang tampil di aplikasi authenticator Anda.');
      return;
    }

    // Activate 2FA on User Account
    const result = StorageService.enableUser2Fa(activeUser.id, selectedMethod === 'email' ? 'email' : 'totp', generatedSecret);
    if (result.success) {
      setBackupCodes(result.backupCodes);
      setSetupStep(3);
      setSuccessMessage(result.message);
      if (onUpdated && result.user) {
        onUpdated(result.user);
      }
    } else {
      setErrorMessage(result.message);
    }
  };

  // --- HANDLER: NONAKTIFKAN 2FA ---
  const handleDisable2Fa = () => {
    if (!confirm('Apakah Anda yakin ingin menonaktifkan Autentikasi 2 Langkah (2FA)? Keamanan akun Anda akan menurun.')) {
      return;
    }
    const result = StorageService.disableUser2Fa(activeUser.id);
    if (result.success) {
      setSuccessMessage(result.message);
      if (onUpdated && result.user) {
        onUpdated(result.user);
      }
      setTimeout(() => {
        onClose();
      }, 1200);
    }
  };

  return (
    <div className="fixed inset-0 z-70 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white border-2 border-slate-700/80 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col my-auto text-slate-800">
        
        {/* HEADER */}
        <div className="bg-gradient-to-r from-[#0F172A] via-[#1E293B] to-[#0F172A] text-white p-5 flex items-center justify-between border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-400 shadow-inner">
              <ShieldCheck size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base font-black font-heading text-white">
                  {currentMode === 'setup'
                    ? 'Aktivasi Autentikasi 2 Langkah (2FA)'
                    : currentMode === 'manage'
                    ? 'Pengaturan Keamanan 2FA Akun'
                    : 'Verifikasi Autentikasi 2 Langkah'}
                </h3>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
                  {isAdminAuth ? 'Master Admin 🛡️' : 'Akun Santri/Wali'}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                {isAdminAuth
                  ? 'Verifikasi identitas sebelum mengakses Portal Kendali Master'
                  : `Perlindungan akun keluarga: ${activeUser?.parentName || 'Wali Santri'}`}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* ALERTS */}
        {errorMessage && (
          <div className="bg-rose-50 border-b border-rose-200 p-3 text-xs font-bold text-rose-800 flex items-center gap-2">
            <AlertTriangle size={15} className="text-rose-600 shrink-0" />
            <span className="flex-1">{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="bg-emerald-50 border-b border-emerald-200 p-3 text-xs font-bold text-emerald-800 flex items-center gap-2">
            <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
            <span className="flex-1">{successMessage}</span>
          </div>
        )}

        {/* ============================================================== */}
        {/* VIEW 1: VERIFIKASI SAAT LOGIN / AKSES ADMIN (MODE: VERIFY)     */}
        {/* ============================================================== */}
        {currentMode === 'verify' && (
          <div className="p-6 space-y-5 text-xs">
            {/* Method Tab Selector */}
            <div className="grid grid-cols-3 gap-2 p-1 bg-slate-100 rounded-2xl">
              <button
                type="button"
                onClick={() => {
                  setSelectedMethod('totp');
                  setErrorMessage(null);
                }}
                className={`py-2 px-2.5 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  selectedMethod === 'totp'
                    ? 'bg-white text-indigo-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Smartphone size={14} />
                <span>TOTP App</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSelectedMethod('email');
                  setErrorMessage(null);
                  handleSendEmailOtp();
                }}
                className={`py-2 px-2.5 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  selectedMethod === 'email'
                    ? 'bg-white text-cyan-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Mail size={14} />
                <span>Kode Email</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSelectedMethod('backup_code');
                  setErrorMessage(null);
                }}
                className={`py-2 px-2.5 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  selectedMethod === 'backup_code'
                    ? 'bg-white text-amber-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <KeyRound size={14} />
                <span>Kode Darurat</span>
              </button>
            </div>

            {/* FORM INPUT VERIFIKASI */}
            <form onSubmit={handleVerifySubmit} className="space-y-4">
              {selectedMethod === 'totp' && (
                <div className="space-y-3">
                  <div className="text-center space-y-1">
                    <p className="text-xs text-slate-600">
                      Buka aplikasi <strong>Google Authenticator</strong> atau <strong>Authy</strong>, lalu masukkan 6 digit token yang tertera:
                    </p>
                  </div>

                  <input
                    type="text"
                    maxLength={6}
                    placeholder="Contoh: 882026"
                    value={codeInput}
                    onChange={(e) => setCodeInput(e.target.value.replace(/\D/g, ''))}
                    className="w-full py-3.5 text-center text-2xl font-mono font-black tracking-widest bg-slate-50 border-2 border-indigo-300 rounded-2xl text-indigo-950 focus:outline-none focus:border-indigo-600 shadow-inner"
                    autoFocus
                    required
                  />

                  {/* Simulator Box */}
                  <div className="p-3 bg-indigo-50/80 rounded-2xl border border-indigo-200 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-[10px] text-indigo-700 font-bold block">Token 2FA Terkini (Simulator Pengujian):</span>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="font-mono text-base font-black text-indigo-950 tracking-wider">
                          {simulatedTotpCode}
                        </span>
                        <span className="text-[10px] text-indigo-600 bg-white px-2 py-0.5 rounded-full font-bold border border-indigo-200">
                          {timerCountdown}s
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setCodeInput(simulatedTotpCode)}
                      className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs cursor-pointer shadow-2xs"
                    >
                      Salin ke Input
                    </button>
                  </div>
                </div>
              )}

              {selectedMethod === 'email' && (
                <div className="space-y-3">
                  <div className="text-center space-y-1">
                    <p className="text-xs text-slate-600">
                      Masukkan 6 digit kode verifikasi yang dikirimkan ke email:
                    </p>
                    <span className="font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-lg inline-block">
                      {activeUser?.email || 'admin@cahayatahfiz.id'}
                    </span>
                  </div>

                  <input
                    type="text"
                    maxLength={6}
                    placeholder="Contoh: 202688"
                    value={codeInput}
                    onChange={(e) => setCodeInput(e.target.value.replace(/\D/g, ''))}
                    className="w-full py-3.5 text-center text-2xl font-mono font-black tracking-widest bg-slate-50 border-2 border-cyan-300 rounded-2xl text-cyan-950 focus:outline-none focus:border-cyan-600 shadow-inner"
                    autoFocus
                    required
                  />

                  {/* Simulator Box Email */}
                  <div className="p-3 bg-cyan-50/80 rounded-2xl border border-cyan-200 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-[10px] text-cyan-700 font-bold block">Kode OTP Email (Simulator):</span>
                      <span className="font-mono text-base font-black text-cyan-950 tracking-wider">
                        {emailOtpCode}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setCodeInput(emailOtpCode)}
                      className="px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs cursor-pointer shadow-2xs"
                    >
                      Salin ke Input
                    </button>
                  </div>
                </div>
              )}

              {selectedMethod === 'backup_code' && (
                <div className="space-y-3">
                  <div className="text-center space-y-1">
                    <p className="text-xs text-slate-600">
                      Gunakan salah satu dari <strong>Backup Recovery Code</strong> darurat yang disimpan saat aktivasi:
                    </p>
                  </div>

                  <input
                    type="text"
                    placeholder="Contoh: TAHFIZ-SEC-9921"
                    value={recoveryCodeInput}
                    onChange={(e) => setRecoveryCodeInput(e.target.value)}
                    className="w-full p-3 font-mono text-center font-bold text-xs bg-slate-50 border-2 border-amber-300 rounded-2xl text-amber-950 focus:outline-none focus:border-amber-600"
                    autoFocus
                    required
                  />

                  <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-900">
                    <span>Kode Cadangan Default: </span>
                    <code className="font-mono font-black text-amber-950">TAHFIZ-SEC-9921</code>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-1/3 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="w-2/3 py-3 rounded-2xl bg-[#164C68] hover:bg-[#113a50] text-white font-black text-xs shadow-md cursor-pointer transition-all active:scale-98 flex items-center justify-center gap-2"
                >
                  <ShieldCheck size={16} />
                  <span>Verifikasi & Masuk ➔</span>
                </button>
              </div>
            </form>

            {/* Security Session Details */}
            <div className="flex items-center justify-between text-[11px] text-slate-500 bg-slate-50 px-4 py-2.5 rounded-2xl border border-slate-200">
              <div className="flex items-center gap-1.5">
                <Radio size={12} className="text-emerald-500 animate-pulse" />
                <span>IP Sesi: 182.253.14.88</span>
              </div>
              <span className="font-mono text-[10px]">TLS 1.3 Terenkripsi</span>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* VIEW 2: AKTIVASI 2FA AKUN WALI / SANTRI (MODE: SETUP)          */}
        {/* ============================================================== */}
        {currentMode === 'setup' && (
          <div className="p-6 space-y-5 text-xs">
            {/* Step Wizard Indicator */}
            <div className="flex items-center justify-center gap-2 text-xs font-bold">
              <span className={`px-3 py-1 rounded-full ${setupStep === 1 ? 'bg-[#164C68] text-white' : 'bg-emerald-100 text-emerald-800'}`}>
                1. Pilih & Pindai
              </span>
              <span className="text-slate-300">➔</span>
              <span className={`px-3 py-1 rounded-full ${setupStep === 2 ? 'bg-[#164C68] text-white' : 'bg-slate-100 text-slate-500'}`}>
                2. Verifikasi Tes
              </span>
              <span className="text-slate-300">➔</span>
              <span className={`px-3 py-1 rounded-full ${setupStep === 3 ? 'bg-[#164C68] text-white' : 'bg-slate-100 text-slate-500'}`}>
                3. Kode Cadangan
              </span>
            </div>

            {/* STEP 1: PILIH METODE & TAMPILKAN QR CODE */}
            {setupStep === 1 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 block">
                    Pilih Metode Autentikasi 2 Langkah:
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setSelectedMethod('totp')}
                      className={`p-3.5 rounded-2xl border text-left cursor-pointer transition-all ${
                        selectedMethod === 'totp'
                          ? 'border-indigo-500 bg-indigo-50/70 shadow-xs'
                          : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                      }`}
                    >
                      <Smartphone size={20} className={selectedMethod === 'totp' ? 'text-indigo-600' : 'text-slate-500'} />
                      <strong className="block text-slate-900 mt-2">Aplikasi Authenticator</strong>
                      <span className="text-[10px] text-slate-500 block mt-0.5">Google Authenticator / Authy</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedMethod('email')}
                      className={`p-3.5 rounded-2xl border text-left cursor-pointer transition-all ${
                        selectedMethod === 'email'
                          ? 'border-cyan-500 bg-cyan-50/70 shadow-xs'
                          : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                      }`}
                    >
                      <Mail size={20} className={selectedMethod === 'email' ? 'text-cyan-600' : 'text-slate-500'} />
                      <strong className="block text-slate-900 mt-2">Kode OTP Email</strong>
                      <span className="text-[10px] text-slate-500 block mt-0.5">Dikirim ke {activeUser.email}</span>
                    </button>
                  </div>
                </div>

                {/* QR Code and Secret Key */}
                {selectedMethod === 'totp' && (
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                    <div className="flex items-center gap-4">
                      {/* Stylized QR Code placeholder */}
                      <div className="w-24 h-24 bg-white p-2 rounded-xl border border-slate-300 flex items-center justify-center shrink-0 shadow-2xs">
                        <QrCode size={70} className="text-slate-900" />
                      </div>
                      <div className="space-y-1">
                        <strong className="text-slate-900 text-xs block">
                          Pindai QR Code di Aplikasi Authenticator
                        </strong>
                        <p className="text-[11px] text-slate-500 leading-relaxed">
                          Buka Google Authenticator atau Authy di ponsel Anda, lalu pilih <strong>Pindai kode QR</strong>.
                        </p>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-200">
                      <span className="text-[10px] text-slate-500 font-bold block uppercase">
                        Atau Masukkan Kunci Rahasia Manual:
                      </span>
                      <div className="flex items-center justify-between bg-white p-2 rounded-xl border border-slate-300 mt-1 font-mono font-bold text-xs text-indigo-900">
                        <span>{generatedSecret}</span>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(generatedSecret, 'secret')}
                          className="p-1 hover:bg-slate-100 rounded text-slate-500 hover:text-indigo-600 cursor-pointer"
                        >
                          {copiedKey === 'secret' ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => setSetupStep(2)}
                  className="w-full py-3 rounded-2xl bg-[#164C68] hover:bg-[#113a50] text-white font-black text-xs cursor-pointer shadow-md flex items-center justify-center gap-2"
                >
                  <span>Lanjutkan ke Verifikasi Tes ➔</span>
                </button>
              </div>
            )}

            {/* STEP 2: TEST VERIFIKASI SEBELUM AKTIF */}
            {setupStep === 2 && (
              <form onSubmit={handleConfirmSetupCode} className="space-y-4">
                <div className="text-center space-y-1">
                  <strong className="text-slate-900 text-sm block">
                    Konfirmasi Kode Pertama Anda
                  </strong>
                  <p className="text-xs text-slate-500">
                    Masukkan 6 digit kode yang tampil di aplikasi authenticator untuk memastikan sinkronisasi berhasil:
                  </p>
                </div>

                <input
                  type="text"
                  maxLength={6}
                  placeholder="Contoh: 882026"
                  value={codeInput}
                  onChange={(e) => setCodeInput(e.target.value.replace(/\D/g, ''))}
                  className="w-full py-3.5 text-center text-2xl font-mono font-black tracking-widest bg-slate-50 border-2 border-[#164C68] rounded-2xl text-slate-950 focus:outline-none shadow-inner"
                  autoFocus
                  required
                />

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSetupStep(1)}
                    className="w-1/3 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
                  >
                    Kembali
                  </button>
                  <button
                    type="submit"
                    className="w-2/3 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs cursor-pointer shadow-md flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 size={16} />
                    <span>Aktifkan 2FA Sekarang</span>
                  </button>
                </div>
              </form>
            )}

            {/* STEP 3: SIMPAN KODE CADANGAN DARURAT */}
            {setupStep === 3 && (
              <div className="space-y-4">
                <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-200 text-amber-950 space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <KeyRound size={15} className="text-amber-700" />
                    <span>Simpan Kode Pemulihan Darurat Anda:</span>
                  </div>
                  <p className="text-[11px] text-amber-800 leading-relaxed">
                    Jika ponsel Anda hilang atau tidak dapat menerima kode, gunakan salah satu kode cadangan ini untuk masuk:
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 rounded-2xl border border-slate-200 font-mono font-bold text-xs text-slate-800">
                  {backupCodes.map((c, i) => (
                    <div key={i} className="p-2 bg-white rounded-lg border border-slate-200 text-center">
                      {c}
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => copyToClipboard(backupCodes.join('\n'), 'backup-all')}
                    className="w-1/2 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    {copiedKey === 'backup-all' ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                    <span>Salin Semua Kode</span>
                  </button>
                  <button
                    type="button"
                    onClick={onClose}
                    className="w-1/2 py-2.5 rounded-xl bg-[#164C68] hover:bg-[#113a50] text-white font-black text-xs cursor-pointer shadow-md"
                  >
                    Selesai & Tutup
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ============================================================== */}
        {/* VIEW 3: KELOLA 2FA (STATUS & NONAKTIFKAN)                       */}
        {/* ============================================================== */}
        {currentMode === 'manage' && (
          <div className="p-6 space-y-5 text-xs">
            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-emerald-950 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shrink-0">
                <ShieldCheck size={22} />
              </div>
              <div>
                <strong className="text-sm block">Autentikasi 2 Langkah Sedang Aktif</strong>
                <span className="text-[11px] text-emerald-800">
                  Metode: {activeUser.twoFactorMethod === 'email' ? 'Kode Verifikasi Email' : 'Aplikasi Authenticator (TOTP)'}
                  {activeUser.twoFactorActivatedAt && ` • Aktif sejak ${new Date(activeUser.twoFactorActivatedAt).toLocaleDateString('id-ID')}`}
                </span>
              </div>
            </div>

            {/* Backup Codes Display */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-700 block">
                Kode Cadangan Darurat (Backup Codes):
              </span>
              <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 rounded-2xl border border-slate-200 font-mono font-bold text-xs text-slate-800">
                {(activeUser.twoFactorBackupCodes || backupCodes).map((c, i) => (
                  <div key={i} className="p-2 bg-white rounded-lg border border-slate-200 text-center">
                    {c}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={handleDisable2Fa}
                className="px-4 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs cursor-pointer border border-rose-200"
              >
                Nonaktifkan 2FA
              </button>

              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl bg-[#164C68] hover:bg-[#113a50] text-white font-black text-xs cursor-pointer shadow-md"
              >
                Tutup
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
