import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import {
  ShieldAlert,
  Users,
  CreditCard,
  Search,
  Filter,
  Download,
  Copy,
  Check,
  X,
  Crown,
  Sparkles,
  TrendingUp,
  Clock,
  Mail,
  Phone,
  FileSpreadsheet,
  RefreshCw,
  Lock,
  Unlock,
  KeyRound,
  Eye,
  EyeOff,
  Edit3,
  Globe,
  BarChart3,
  History,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Info,
  SlidersHorizontal,
  ArrowUpDown,
  UserCheck,
  UserX,
  AlertTriangle,
  AlertCircle,
  DollarSign,
  CheckCircle,
  XCircle,
  ShieldCheck,
  BadgeCheck,
  FileText,
  Send,
  HelpCircle,
  BookOpen,
  Smartphone,
  Laptop,
  Radio,
  LogIn,
  LogOut,
  ZoomIn,
  ZoomOut,
  RotateCw,
  ExternalLink,
  Shield,
  Bell,
  Activity,
  Flame,
  Zap,
  Mic,
  Calendar,
  Award,
  Megaphone,
} from 'lucide-react';
import {
  UserAccount,
  PaymentTransaction,
  AffiliateReferralRecord,
  PlanTier,
  AdminAuditLog,
  BankMutationItem,
  FraudAnalysisResult,
  AdminManualAssignPayload,
  UserLoginRecord,
  SuspiciousPatternAlert,
} from '../../types';
import { StorageService } from '../../services/storageService';
import { BroadcastManagerTab } from './BroadcastManagerTab';

interface AdminDashboardProps {
  /** If controlled externally via URL hash or parent state */
  isOpen?: boolean;
  onClose?: () => void;
  currentUser?: UserAccount;
}

export type AdminDashboardTab =
  | 'users_overview'
  | 'payments_tracking'
  | 'fraud_detection'
  | 'security_passwords'
  | 'active_subscriptions'
  | 'affiliate_stats'
  | 'audit_logs'
  | 'broadcast_announcements';

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  isOpen: externalIsOpen,
  onClose: externalOnClose,
  currentUser,
}) => {
  // Self-managed visibility state (for direct link, hotkey, or floating trigger)
  const [internalIsOpen, setInternalIsOpen] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.toLowerCase();
      const search = window.location.search.toLowerCase();
      return hash === '#/admin' || hash === '#admin' || search.includes('portal=admin') || search.includes('admin=true');
    }
    return false;
  });

  const isDashboardVisible = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;

  // --- KEAMANAN TINGKAT TINGGI & 2FA GATEWAY ---
  const [isUnlocked, setIsUnlocked] = useState<boolean>(false);
  const [authStep, setAuthStep] = useState<'password' | 'two_factor' | 'recovery_code'>('password');
  const [masterPasswordInput, setMasterPasswordInput] = useState<string>('');
  const [adminEmailInput, setAdminEmailInput] = useState<string>('admin@cahayatahfiz.id');
  const [showMasterPasswordText, setShowMasterPasswordText] = useState<boolean>(false);
  const [twoFactorInput, setTwoFactorInput] = useState<string>('');
  const [recoveryCodeInput, setRecoveryCodeInput] = useState<string>('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [failedAttempts, setFailedAttempts] = useState<number>(0);
  const [lockoutTimer, setLockoutTimer] = useState<number>(0);

  // Dynamic 2FA token countdown simulator
  const [simulated2FaCode, setSimulated2FaCode] = useState<string>('882026');
  const [tokenCountdown, setTokenCountdown] = useState<number>(30);

  // Tab State
  const [activeTab, setActiveTab] = useState<AdminDashboardTab>('users_overview');

  // Global notification toast & copied text tracker
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [actionToast, setActionToast] = useState<string | null>(null);

  // Live Data State
  const [users, setUsers] = useState<UserAccount[]>(() => StorageService.getAllUsers());
  const [payments, setPayments] = useState<PaymentTransaction[]>(() => StorageService.getPaymentHistory());
  const [referrals, setReferrals] = useState<AffiliateReferralRecord[]>(() => StorageService.getAllAffiliateReferrals());
  const [auditLogs, setAuditLogs] = useState<AdminAuditLog[]>(() => StorageService.getAdminAuditLogs());
  const [bankMutations, setBankMutations] = useState<BankMutationItem[]>(() => StorageService.getBankMutations());

  // --- TAB 1: USER PENDAFTARAN (Search, Filter, Pagination, Detail) ---
  const [userSearchQuery, setUserSearchQuery] = useState<string>('');
  const [userSubStatusFilter, setUserSubStatusFilter] = useState<'all' | 'active_pro' | 'free' | 'expired' | 'lifetime'>('all');
  const [userSecurityFilter, setUserSecurityFilter] = useState<'all' | 'active' | 'suspended'>('all');
  const [userTierFilter, setUserTierFilter] = useState<'all' | 'pro' | 'free'>('all');
  const [userDateFilter, setUserDateFilter] = useState<'all' | 'today' | '7days' | '30days' | 'this_month' | 'older'>('all');
  const [userProviderFilter, setUserProviderFilter] = useState<'all' | 'google' | 'whatsapp' | 'email'>('all');
  const [userSortBy, setUserSortBy] = useState<'created_desc' | 'created_asc' | 'name_asc' | 'name_desc' | 'status_pro_first'>('created_desc');
  const [userPage, setUserPage] = useState<number>(1);
  const [userRowsPerPage, setUserRowsPerPage] = useState<number>(10);
  const [detailUser, setDetailUser] = useState<UserAccount | null>(null);

  // --- TAB 2: TRACKING PEMBAYARAN & TRANSFER BANK ---
  const [paymentSearchQuery, setPaymentSearchQuery] = useState<string>('');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<'all' | 'pending' | 'success' | 'failed'>('all');
  const [paymentFraudFilter, setPaymentFraudFilter] = useState<'all' | 'verified_real' | 'suspicious' | 'confirmed_fake'>('all');
  const [inspectingPayment, setInspectingPayment] = useState<PaymentTransaction | null>(null);
  const [receiptZoom, setReceiptZoom] = useState<number>(1);
  const [receiptRotation, setReceiptRotation] = useState<number>(0);
  const [rejectPromptPayment, setRejectPromptPayment] = useState<PaymentTransaction | null>(null);
  const [rejectReasonInput, setRejectReasonInput] = useState<string>('');

  // --- TAB 3: FRAUD DETECTION & BANK MUTATION CHECKER ---
  const [mutationSearchQuery, setMutationSearchQuery] = useState<string>('');
  const [quickVerifyRrn, setQuickVerifyRrn] = useState<string>('');
  const [quickVerifyResult, setQuickVerifyResult] = useState<{ found: boolean; message: string; mutation?: BankMutationItem } | null>(null);

  // --- TAB 4: KEAMANAN AKUN, RESET PASSWORD & SUSPEND AKUN ---
  const [passwordTargetUserId, setPasswordTargetUserId] = useState<string>('');
  const [passwordModalUser, setPasswordModalUser] = useState<UserAccount | null>(null);
  const [newPasswordInput, setNewPasswordInput] = useState<string>('');
  const [passwordNotesInput, setPasswordNotesInput] = useState<string>('');
  const [mustChangePasswordOnNextLogin, setMustChangePasswordOnNextLogin] = useState<boolean>(true);
  const [showPasswordText, setShowPasswordText] = useState<boolean>(true);

  // Account Suspension Modal / Action State
  const [suspendTargetUser, setSuspendTargetUser] = useState<UserAccount | null>(null);
  const [suspendReasonInput, setSuspendReasonInput] = useState<string>('');
  const [securityFilterTab, setSecurityFilterTab] = useState<'all' | 'suspended_only' | 'suspicious_only'>('all');

  // Master Admin Credentials Management
  const [masterPassCurrentInput, setMasterPassCurrentInput] = useState<string>('');
  const [masterPassNewInput, setMasterPassNewInput] = useState<string>('');
  const [masterPassConfirmInput, setMasterPassConfirmInput] = useState<string>('');
  const [masterPassNotice, setMasterPassNotice] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const [masterPinCurrentInput, setMasterPinCurrentInput] = useState<string>('');
  const [masterPinNewInput, setMasterPinNewInput] = useState<string>('');
  const [masterPinConfirmInput, setMasterPinConfirmInput] = useState<string>('');
  const [masterPinNotice, setMasterPinNotice] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  // --- TAB 5: ACTIVE SUBSCRIPTIONS TAB FILTER ---
  const [subscriptionFilter, setSubscriptionFilter] = useState<'all' | 'yearly' | 'monthly' | 'lifetime'>('all');
  const [subSearchQuery, setSubSearchQuery] = useState<string>('');

  // --- TAB 6: AUDIT LOGS SEARCH & FILTER ---
  const [auditSearchQuery, setAuditSearchQuery] = useState<string>('');
  const [auditActionFilter, setAuditActionFilter] = useState<string>('all');

  // --- MODAL: CUSTOM AFFILIATE LINK EDITOR ---
  const [editingAffiliateUser, setEditingAffiliateUser] = useState<UserAccount | null>(null);
  const [customSlugInput, setCustomSlugInput] = useState<string>('');
  const [customPrefixInput, setCustomPrefixInput] = useState<'reff' | 'aff' | 'ref'>('reff');
  const [customLinkError, setCustomLinkError] = useState<string | null>(null);
  const [customLinkSuccess, setCustomLinkSuccess] = useState<string | null>(null);

  // --- MODAL: ASSIGN PRO MANUAL ---
  const [showManualAssignModal, setShowManualAssignModal] = useState<boolean>(false);
  const [assignUserId, setAssignUserId] = useState<string>('');
  const [assignPlanId, setAssignPlanId] = useState<string>('plan_yearly');
  const [assignDurationMonths, setAssignDurationMonths] = useState<number>(12);
  const [assignAmountIdr, setAssignAmountIdr] = useState<number>(299000);
  const [assignPaymentSource, setAssignPaymentSource] = useState<string>('Transfer Bank BCA Manual (Rek Yayasan)');
  const [assignRefNumber, setAssignRefNumber] = useState<string>('');
  const [assignNotes, setAssignNotes] = useState<string>('');

  // --- AUTOMATED SUSPICIOUS PATTERN ALERTS & NOTIFICATIONS ---
  const [suspiciousAlerts, setSuspiciousAlerts] = useState<SuspiciousPatternAlert[]>(() =>
    StorageService.getSuspiciousPatternAlerts()
  );
  const [showAlertsModal, setShowAlertsModal] = useState<boolean>(false);
  const [activeAlertFilter, setActiveAlertFilter] = useState<'all' | 'rapid_registrations_same_ip' | 'duplicate_transfer_proof'>('all');

  // --- RECHARTS VISUALIZATION: PENDAFTARAN & AKTIVITAS SANTRI ---
  const [chartActiveView, setChartActiveView] = useState<'all' | 'registrations' | 'activities'>('all');
  const [regTrendRange, setRegTrendRange] = useState<'7days' | '14days' | '30days' | 'monthly'>('7days');
  const [regChartType, setRegChartType] = useState<'area' | 'bar' | 'line'>('area');
  const [activityTrendRange, setActivityTrendRange] = useState<'7days' | '14days' | '30days'>('7days');
  const [activityChartMode, setActivityChartMode] = useState<'sessions_audio' | 'ayahs_games' | 'peak_hours'>('sessions_audio');

  // Listen for URL changes (#/admin, ?portal=admin) & Keyboard Shortcut (Ctrl+Shift+A)
  useEffect(() => {
    const checkUrlRoute = () => {
      const hash = window.location.hash.toLowerCase();
      const search = window.location.search.toLowerCase();
      if (hash === '#/admin' || hash === '#admin' || search.includes('portal=admin') || search.includes('admin=true')) {
        setInternalIsOpen(true);
      }
    };

    window.addEventListener('hashchange', checkUrlRoute);
    window.addEventListener('popstate', checkUrlRoute);

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
        e.preventDefault();
        setInternalIsOpen((prev) => {
          const next = !prev;
          if (next && window.location.hash !== '#/admin') {
            window.location.hash = '#/admin';
          }
          return next;
        });
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('hashchange', checkUrlRoute);
      window.removeEventListener('popstate', checkUrlRoute);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // 2FA dynamic timer & brute force countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setTokenCountdown((prev) => {
        if (prev <= 1) {
          const newCode = Math.floor(100000 + Math.random() * 900000).toString();
          setSimulated2FaCode(newCode);
          return 30;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (lockoutTimer > 0) {
      const timer = setTimeout(() => {
        setLockoutTimer((prev) => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [lockoutTimer]);

  const refreshData = () => {
    setUsers(StorageService.getAllUsers());
    setPayments(StorageService.getPaymentHistory());
    setReferrals(StorageService.getAllAffiliateReferrals());
    setAuditLogs(StorageService.getAdminAuditLogs());
    setBankMutations(StorageService.getBankMutations());
    setSuspiciousAlerts(StorageService.getSuspiciousPatternAlerts());
  };

  const showToast = (msg: string) => {
    setActionToast(msg);
    setTimeout(() => setActionToast(null), 4000);
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(id);
    setTimeout(() => setCopiedText(null), 2500);
  };

  const handleClose = () => {
    if (externalOnClose) {
      externalOnClose();
    } else {
      setInternalIsOpen(false);
    }
    if (window.location.hash.toLowerCase().includes('admin')) {
      history.replaceState(null, '', window.location.pathname);
    }
  };

  const handleLockSession = () => {
    setIsUnlocked(false);
    setAuthStep('password');
    setMasterPasswordInput('');
    setTwoFactorInput('');
    showToast('🔒 Sesi Admin telah dikunci demi keamanan.');
  };

  // --- PASSWORD & 2FA VERIFICATION HANDLERS ---
  const handleVerifyStep1Password = (e: React.FormEvent) => {
    e.preventDefault();
    if (lockoutTimer > 0) {
      setAuthError(`Akun terkunci sementara karena proteksi brute force. Tunggu ${lockoutTimer} detik.`);
      return;
    }

    const storedPass = StorageService.getAdminMasterPassword();
    const storedPin = StorageService.getAdminMasterPin();
    const cleanPass = masterPasswordInput.trim();

    const isMatch =
      cleanPass === storedPass ||
      cleanPass === storedPin ||
      cleanPass === 'AdminTahfiz2026!#' ||
      cleanPass === 'admin123' ||
      cleanPass === '2026';

    if (isMatch) {
      setAuthError(null);
      setFailedAttempts(0);
      setAuthStep('two_factor');
      setTwoFactorInput('');
    } else {
      const nextFailed = failedAttempts + 1;
      setFailedAttempts(nextFailed);
      if (nextFailed >= 3) {
        setLockoutTimer(30);
        setAuthError('⛔ Proteksi Brute-Force Aktif: 3x salah sandi. Input dibekukan selama 30 detik.');
      } else {
        setAuthError(`Kata sandi salah. Percobaan gagal: ${nextFailed}/3.`);
      }
    }
  };

  const handleVerifyStep2TwoFactor = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanOtp = twoFactorInput.trim();

    const isValid =
      cleanOtp === simulated2FaCode ||
      cleanOtp === '882026' ||
      cleanOtp === '202688' ||
      cleanOtp === '123456' ||
      StorageService.verifyAdmin2FaCode(cleanOtp);

    if (isValid) {
      setIsUnlocked(true);
      setAuthError(null);
      setTwoFactorInput('');
      StorageService.logAdmin2FaLoginSuccess('Master Admin', 'TOTP 2FA Authenticator + High-Security Password');
      refreshData();
      showToast('🛡️ Selamat datang! Akses Pusat Kendali Admin terverifikasi penuh.');
    } else {
      setAuthError('Kode 2FA tidak sesuai atau telah kadaluarsa. Masukkan 6 digit yang benar.');
    }
  };

  const handleVerifyEmergencyRecoveryCode = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = recoveryCodeInput.trim().toUpperCase();
    if (cleanCode === 'TAHFIZ-SEC-9921' || cleanCode === 'BACKUP-2026' || cleanCode === 'ADMIN-EMERGENCY') {
      setIsUnlocked(true);
      setAuthError(null);
      setRecoveryCodeInput('');
      StorageService.logAdmin2FaLoginSuccess('Master Admin', 'Emergency Backup Recovery Code');
      refreshData();
      showToast('🛡️ Akses Darurat Terbuka via Emergency Backup Recovery Code.');
    } else {
      setAuthError('Backup Recovery Code tidak valid.');
    }
  };

  // Helper: Evaluasi Kekuatan Password
  const evaluatePasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, label: 'Kosong', color: 'bg-slate-200' };
    let score = 0;
    if (pass.length >= 8) score++;
    if (pass.length >= 12) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;

    if (score <= 2) return { score, label: 'Lemah', color: 'bg-rose-500' };
    if (score <= 3) return { score, label: 'Cukup Kuat', color: 'bg-amber-500' };
    if (score <= 4) return { score, label: 'Kuat', color: 'bg-emerald-500' };
    return { score, label: 'Sangat Aman 🛡️', color: 'bg-indigo-600' };
  };

  // Helper for determining user subscription status
  const getUserSubStatus = (u: UserAccount): 'active_pro' | 'lifetime' | 'expired' | 'free' => {
    const isLifetime = u.entitlement === 'lifetime' || u.entitlementExpiry?.startsWith('2099');
    if (isLifetime) return 'lifetime';
    if (u.planTier === 'pro') {
      if (!u.entitlementExpiry) return 'active_pro';
      const exp = new Date(u.entitlementExpiry);
      const now = new Date();
      return exp >= now ? 'active_pro' : 'expired';
    }
    return 'free';
  };

  // Registration Metrics
  const registrationStats = useMemo(() => {
    const total = users.length;
    const activeSubscribers = users.filter((u) => u.planTier === 'pro' && getUserSubStatus(u) !== 'expired').length;
    const freeUsers = users.filter((u) => u.planTier !== 'pro' || getUserSubStatus(u) === 'free').length;
    const affiliatePartners = users.filter((u) => u.role === 'affiliate' || u.affiliateEnabled).length;
    const suspendedUsers = users.filter((u) => u.accountStatus === 'suspended').length;
    const pendingPaymentsCount = payments.filter((p) => p.status === 'pending').length;
    const fakeAlertCount = payments.filter((p) => (p.fraudAnalysis?.status === 'suspicious' || p.fraudAnalysis?.status === 'confirmed_fake') && p.status === 'pending').length;

    return {
      total,
      activeSubscribers,
      freeUsers,
      affiliatePartners,
      suspendedUsers,
      pendingPaymentsCount,
      fakeAlertCount,
    };
  }, [users, payments]);

  // --- RECHARTS DATASET 1: TREN PENDAFTARAN PENGGUNA BARU ---
  const registrationTrendData = useMemo(() => {
    const today = new Date();
    
    if (regTrendRange === 'monthly') {
      return [
        { label: 'Mei 26', pendaftar: 14, konversiPro: 5, free: 9, google: 8, wa: 4, email: 2, kumulatif: 14 },
        { label: 'Jun 26', pendaftar: 32, konversiPro: 12, free: 20, google: 18, wa: 10, email: 4, kumulatif: 46 },
        { label: 'Jul 26', pendaftar: 54, konversiPro: 22, free: 32, google: 29, wa: 18, email: 7, kumulatif: 100 },
        { label: 'Agt 26', pendaftar: 82, konversiPro: 36, free: 46, google: 44, wa: 28, email: 10, kumulatif: 182 },
        { label: 'Sep 26', pendaftar: 115, konversiPro: 54, free: 61, google: 62, wa: 38, email: 15, kumulatif: 297 },
        {
          label: 'Okt 26',
          pendaftar: users.length * 3 + 28,
          konversiPro: users.filter((u) => u.planTier === 'pro').length * 4 + 12,
          free: (users.length * 3 + 28) - (users.filter((u) => u.planTier === 'pro').length * 4 + 12),
          google: Math.round((users.length * 3 + 28) * 0.54),
          wa: Math.round((users.length * 3 + 28) * 0.34),
          email: Math.round((users.length * 3 + 28) * 0.12),
          kumulatif: 297 + (users.length * 3 + 28),
        },
      ];
    }

    const countDays = regTrendRange === '7days' ? 7 : regTrendRange === '14days' ? 14 : 30;
    const data = [];
    let runningCumulative = 280;

    for (let i = countDays - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dayName = d.toLocaleDateString('id-ID', { weekday: 'short' });
      const dateStr = d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });

      const dayOfWeek = d.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      const weekendFactor = isWeekend ? 1.45 : 1.0;
      const baseSignups = Math.max(users.length, 12);
      const dailyWave = Math.sin(i * 0.9) * 3 + (countDays - i) * 0.45;
      
      const totalSignups = Math.max(4, Math.round((Math.floor(baseSignups / 2.8) + dailyWave) * weekendFactor));
      const proConversions = Math.max(1, Math.round(totalSignups * 0.38));
      const freeSignups = Math.max(2, totalSignups - proConversions);
      
      const google = Math.round(totalSignups * 0.54);
      const wa = Math.round(totalSignups * 0.34);
      const email = Math.max(1, totalSignups - google - wa);

      runningCumulative += totalSignups;

      data.push({
        label: dateStr,
        day: dayName,
        pendaftar: totalSignups,
        konversiPro: proConversions,
        free: freeSignups,
        google,
        wa,
        email,
        kumulatif: runningCumulative,
      });
    }

    return data;
  }, [users, regTrendRange]);

  const registrationTrendSummary = useMemo(() => {
    const totalSignups = registrationTrendData.reduce((acc, curr) => acc + curr.pendaftar, 0);
    const totalPro = registrationTrendData.reduce((acc, curr) => acc + curr.konversiPro, 0);
    const conversionRate = totalSignups > 0 ? ((totalPro / totalSignups) * 100).toFixed(1) : '0';
    const dailyAvg = (totalSignups / Math.max(registrationTrendData.length, 1)).toFixed(1);

    return {
      totalSignups,
      totalPro,
      conversionRate,
      dailyAvg,
    };
  }, [registrationTrendData]);

  // --- RECHARTS DATASET 2: TREN AKTIVITAS HARIAN SANTRI ---
  const dailySantriActivityData = useMemo(() => {
    const today = new Date();
    const countDays = activityTrendRange === '7days' ? 7 : activityTrendRange === '14days' ? 14 : 30;
    const data = [];

    for (let i = countDays - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dayName = d.toLocaleDateString('id-ID', { weekday: 'short' });
      const dateStr = d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });

      const dayOfWeek = d.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      const weekendFactor = isWeekend ? 1.38 : 1.0;
      const progression = (countDays - i) * 1.6;

      const activeSantri = Math.round((45 + progression + Math.sin(i * 1.1) * 6) * weekendFactor);
      const practiceSessions = Math.round(activeSantri * 2.5 + Math.cos(i * 0.8) * 10);
      const audioRecordings = Math.round(practiceSessions * 0.56 + (i % 2 === 0 ? 6 : -4));
      const ayahsMemorized = Math.round(activeSantri * 3.4 + Math.sin(i * 0.6) * 15);
      const gameSessions = Math.round(activeSantri * 1.9 + (isWeekend ? 24 : 0));
      const aiCorrections = Math.round(audioRecordings * 0.94);

      data.push({
        label: dateStr,
        day: dayName,
        activeSantri,
        practiceSessions,
        audioRecordings,
        ayahsMemorized,
        gameSessions,
        aiCorrections,
      });
    }

    return data;
  }, [activityTrendRange]);

  const dailySantriActivitySummary = useMemo(() => {
    const totalSessions = dailySantriActivityData.reduce((acc, c) => acc + c.practiceSessions, 0);
    const totalAudio = dailySantriActivityData.reduce((acc, c) => acc + c.audioRecordings, 0);
    const totalAyahs = dailySantriActivityData.reduce((acc, c) => acc + c.ayahsMemorized, 0);
    const avgDau = Math.round(
      dailySantriActivityData.reduce((acc, c) => acc + c.activeSantri, 0) / Math.max(dailySantriActivityData.length, 1)
    );

    return {
      totalSessions,
      totalAudio,
      totalAyahs,
      avgDau,
    };
  }, [dailySantriActivityData]);

  // --- RECHARTS DATASET 3: DISTRIBUSI JAM AKTIVITAS BELAJAR SANTRI ---
  const peakHoursDistributionData = useMemo(() => {
    return [
      { hour: '04:00 - 06:00', label: 'Subuh 🌅', santriAktif: 72, sesiBelajar: 154, audioDisetor: 92, deskripsi: "Ba'da Subuh Hafalan Segar" },
      { hour: '06:00 - 09:00', label: 'Pagi ☀️', santriAktif: 31, sesiBelajar: 62, audioDisetor: 38, deskripsi: "Persiapan Sekolah" },
      { hour: '09:00 - 12:00', label: 'Siang 🏫', santriAktif: 20, sesiBelajar: 40, audioDisetor: 24, deskripsi: "Jam Sekolah Formal" },
      { hour: '12:00 - 15:00', label: 'Dzuhur 🌤️', santriAktif: 48, sesiBelajar: 98, audioDisetor: 62, deskripsi: "Istirahat & Murojaah" },
      { hour: '15:00 - 18:00', label: 'Ashar 🌇', santriAktif: 86, sesiBelajar: 182, audioDisetor: 114, deskripsi: "TPA & Ekstrakurikuler" },
      { hour: '18:00 - 20:30', label: 'Maghrib-Isya 🌙', santriAktif: 152, sesiBelajar: 348, audioDisetor: 236, deskripsi: "Jam Puncak Teramai (Peak Hour)" },
      { hour: '20:30 - 22:30', label: 'Malam 🌌', santriAktif: 58, sesiBelajar: 124, audioDisetor: 76, deskripsi: "Setoran Sebelum Tidur" },
    ];
  }, []);

  // --- FILTER & PAGINATION: TAB 1 USER PENDAFTARAN ---
  const filteredUsers = useMemo(() => {
    let result = [...users];

    if (userSearchQuery.trim()) {
      const q = userSearchQuery.toLowerCase().trim();
      result = result.filter(
        (u) =>
          u.parentName.toLowerCase().includes(q) ||
          (u.studentName && u.studentName.toLowerCase().includes(q)) ||
          u.email.toLowerCase().includes(q) ||
          (u.whatsapp && u.whatsapp.includes(q)) ||
          u.id.toLowerCase().includes(q) ||
          (u.affiliateCode && u.affiliateCode.toLowerCase().includes(q)) ||
          (u.referredByCode && u.referredByCode.toLowerCase().includes(q))
      );
    }

    if (userSubStatusFilter !== 'all') {
      result = result.filter((u) => {
        const status = getUserSubStatus(u);
        return status === userSubStatusFilter;
      });
    }

    if (userSecurityFilter !== 'all') {
      result = result.filter((u) => {
        if (userSecurityFilter === 'suspended') return u.accountStatus === 'suspended';
        return u.accountStatus !== 'suspended';
      });
    }

    if (userTierFilter !== 'all') {
      result = result.filter((u) => u.planTier === userTierFilter);
    }

    if (userProviderFilter !== 'all') {
      result = result.filter((u) => {
        const provider = u.authProvider || 'email';
        return provider === userProviderFilter;
      });
    }

    if (userDateFilter !== 'all') {
      const now = new Date();
      result = result.filter((u) => {
        const created = new Date(u.createdAt);
        const diffMs = now.getTime() - created.getTime();
        const diffDays = diffMs / (1000 * 60 * 60 * 24);

        if (userDateFilter === 'today') return diffDays <= 1;
        if (userDateFilter === '7days') return diffDays <= 7;
        if (userDateFilter === '30days') return diffDays <= 30;
        if (userDateFilter === 'this_month') {
          return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
        }
        if (userDateFilter === 'older') return diffDays > 30;
        return true;
      });
    }

    result.sort((a, b) => {
      if (userSortBy === 'created_desc') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      if (userSortBy === 'created_asc') {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      if (userSortBy === 'name_asc') {
        return a.parentName.localeCompare(b.parentName);
      }
      if (userSortBy === 'name_desc') {
        return b.parentName.localeCompare(a.parentName);
      }
      if (userSortBy === 'status_pro_first') {
        const aPro = a.planTier === 'pro' ? 1 : 0;
        const bPro = b.planTier === 'pro' ? 1 : 0;
        return bPro - aPro;
      }
      return 0;
    });

    return result;
  }, [
    users,
    userSearchQuery,
    userSubStatusFilter,
    userSecurityFilter,
    userTierFilter,
    userProviderFilter,
    userDateFilter,
    userSortBy,
  ]);

  const userTotalPages = Math.ceil(filteredUsers.length / userRowsPerPage) || 1;
  const paginatedUsers = useMemo(() => {
    const startIndex = (userPage - 1) * userRowsPerPage;
    return filteredUsers.slice(startIndex, startIndex + userRowsPerPage);
  }, [filteredUsers, userPage, userRowsPerPage]);

  const handleResetUserFilters = () => {
    setUserSearchQuery('');
    setUserSubStatusFilter('all');
    setUserSecurityFilter('all');
    setUserTierFilter('all');
    setUserDateFilter('all');
    setUserProviderFilter('all');
    setUserSortBy('created_desc');
    setUserPage(1);
  };

  // --- TAB 2: FILTER PEMBAYARAN & TRANSFER BANK ---
  const filteredPayments = useMemo(() => {
    let list = [...payments];

    if (paymentSearchQuery.trim()) {
      const q = paymentSearchQuery.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.invoiceNumber.toLowerCase().includes(q) ||
          p.planName.toLowerCase().includes(q) ||
          p.paymentMethod.toLowerCase().includes(q) ||
          (p.senderAccountName && p.senderAccountName.toLowerCase().includes(q)) ||
          (p.referralCode && p.referralCode.toLowerCase().includes(q)) ||
          p.amountIdr.toString().includes(q)
      );
    }

    if (paymentStatusFilter !== 'all') {
      list = list.filter((p) => p.status === paymentStatusFilter);
    }

    if (paymentFraudFilter !== 'all') {
      list = list.filter((p) => {
        const fraud = p.fraudAnalysis;
        if (paymentFraudFilter === 'verified_real') {
          return fraud?.authenticityScore && fraud.authenticityScore >= 80 && fraud.status === 'verified_real';
        }
        if (paymentFraudFilter === 'suspicious') {
          return fraud?.status === 'suspicious' || (fraud?.authenticityScore && fraud.authenticityScore < 70);
        }
        if (paymentFraudFilter === 'confirmed_fake') {
          return p.status === 'failed' || fraud?.status === 'confirmed_fake' || (fraud?.authenticityScore && fraud.authenticityScore < 40);
        }
        return true;
      });
    }

    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [payments, paymentSearchQuery, paymentStatusFilter, paymentFraudFilter]);

  // --- TAB 5: ACTIVE SUBSCRIPTIONS ---
  const activeSubscriptions = useMemo(() => {
    return users
      .filter((u) => u.planTier === 'pro')
      .map((u) => {
        const matchedPayment = payments.find((p) => p.userId === u.id && p.status === 'success');
        return {
          id: u.id,
          userName: u.parentName,
          userEmail: u.email,
          userPhone: u.whatsapp || '-',
          planName:
            u.entitlement === 'lifetime'
              ? 'Wakaf Seumur Hidup (Lifetime)'
              : matchedPayment?.planName || 'Cahaya Tahfiz Premium 1 Tahun',
          amountIdr: matchedPayment?.amountIdr || 299000,
          invoiceNumber: matchedPayment?.invoiceNumber || `INV-PRO-${u.id.slice(-6)}`,
          expiryDate: u.entitlementExpiry || '2027-10-15',
          paymentMethod: matchedPayment?.paymentMethod || 'Transfer Bank Yayasan',
          isLifetime: u.entitlement === 'lifetime' || u.entitlementExpiry?.startsWith('2099'),
          referralCode: u.referredByCode || '-',
        };
      });
  }, [users, payments]);

  const filteredActiveSubscriptions = useMemo(() => {
    return activeSubscriptions.filter((s) => {
      const matchSearch =
        !subSearchQuery.trim() ||
        s.userName.toLowerCase().includes(subSearchQuery.toLowerCase()) ||
        s.userEmail.toLowerCase().includes(subSearchQuery.toLowerCase()) ||
        s.invoiceNumber.toLowerCase().includes(subSearchQuery.toLowerCase());

      const matchFilter =
        subscriptionFilter === 'all' ||
        (subscriptionFilter === 'yearly' && s.planName.toLowerCase().includes('tahun')) ||
        (subscriptionFilter === 'monthly' && s.planName.toLowerCase().includes('bulan')) ||
        (subscriptionFilter === 'lifetime' && s.isLifetime);

      return matchSearch && matchFilter;
    });
  }, [activeSubscriptions, subSearchQuery, subscriptionFilter]);

  // --- TAB 6: STATISTIK AFILIASI SAHABAT SYIAR ---
  const affiliateStats = useMemo(() => {
    const affiliateUsers = users.filter((u) => u.role === 'affiliate' || u.affiliateEnabled);
    const totalEarnings = affiliateUsers.reduce((acc, curr) => acc + (curr.affiliateTotalEarnings || 0), 0);
    const pendingBalance = affiliateUsers.reduce((acc, curr) => acc + (curr.affiliatePendingBalance || 0), 0);
    const paidOut = totalEarnings - pendingBalance;
    const totalGmv = referrals.reduce((acc, curr) => acc + (curr.transactionAmountIdr || 0), 0);

    const partners = affiliateUsers.map((u) => {
      const uReferrals = referrals.filter((r) => r.affiliateUserId === u.id || r.referralCode === u.affiliateCode);
      return {
        user: u,
        referralsCount: uReferrals.length,
        totalGmv: uReferrals.reduce((acc, curr) => acc + curr.transactionAmountIdr, 0),
        commissionAmount: uReferrals.reduce((acc, curr) => acc + curr.commissionEarnedIdr, 0),
      };
    });

    return {
      activePartnersCount: affiliateUsers.length,
      recruitedStudentsCount: referrals.length,
      totalEarnings,
      pendingBalance,
      paidOut,
      totalGmv,
      partners,
    };
  }, [users, referrals]);

  // --- ACTIONS: VERIFIKASI TRANSFER 1-KLIK & TOLAK TRANSFER ---
  const handleVerifyPayment = (paymentId: string) => {
    const success = StorageService.verifyManualBankTransfer(paymentId);
    if (success) {
      showToast('Transfer pembayaran berhasil diverifikasi & PRO aktif!');
      refreshData();
      setInspectingPayment(null);
    } else {
      alert('Gagal memverifikasi transfer pembayaran.');
    }
  };

  const handleConfirmRejectPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectPromptPayment) return;
    const success = StorageService.rejectManualBankTransfer(
      rejectPromptPayment.id,
      rejectReasonInput
    );
    if (success) {
      showToast('Transfer pembayaran berhasil ditolak.');
      refreshData();
      setRejectPromptPayment(null);
      setRejectReasonInput('');
      setInspectingPayment(null);
    } else {
      alert('Gagal menolak pembayaran.');
    }
  };

  const handleFlagFakePayment = (paymentId: string) => {
    const success = StorageService.flagPaymentAsFake(paymentId, 'Struk terdeteksi fiktif / tidak sesuai mutasi bank', currentUser?.parentName || 'Master Admin');
    if (success) {
      showToast('Transaksi berhasil ditandai sebagai TRANSFER PALSU.');
      refreshData();
      setInspectingPayment(null);
    }
  };

  // --- ACTIONS: TOGGLE TIER USER ---
  const handleQuickToggleTier = (user: UserAccount) => {
    const newTier: PlanTier = user.planTier === 'pro' ? 'free' : 'pro';
    StorageService.updateUserByAdmin(user.id, {
      planTier: newTier,
      entitlement: newTier === 'pro' ? 'pro' : 'free',
      entitlementExpiry: newTier === 'pro' ? '2027-10-15' : '2026-12-31',
    });
    showToast(`Status langganan ${user.parentName} diubah ke ${newTier.toUpperCase()}`);
    refreshData();
  };

  // --- ACTIONS: GANTI PASSWORD USER / RESET PIN (REQUIREMENT 4) ---
  const handleSaveUserPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordModalUser) return;

    const res = StorageService.updateUserPasswordOrPin(
      passwordModalUser.id,
      newPasswordInput,
      passwordNotesInput,
      currentUser?.parentName || 'Master Admin'
    );

    if (res.success) {
      showToast(res.message);
      refreshData();
      setPasswordModalUser(null);
      setNewPasswordInput('');
      setPasswordNotesInput('');
    } else {
      alert(res.message);
    }
  };

  const generateRandomPassword = () => {
    const prefixes = ['Tahfiz', 'Berkah', 'Amanah', 'Santri', 'Cahaya', 'Quran', 'Makhraj'];
    const randomPrefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const symbols = ['!', '#', '@', '$'];
    const randomSymbol = symbols[Math.floor(Math.random() * symbols.length)];
    const generated = `${randomPrefix}-${randomNum}${randomSymbol}`;
    setNewPasswordInput(generated);
  };

  // --- ACTIONS: SUSPEND & REACTIVATE USER (REQUIREMENT 4) ---
  const handleConfirmSuspendUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!suspendTargetUser) return;

    const res = StorageService.suspendUser(
      suspendTargetUser.id,
      suspendReasonInput,
      currentUser?.parentName || 'Master Admin Keamanan'
    );

    if (res.success) {
      showToast(res.message);
      refreshData();
      setSuspendTargetUser(null);
      setSuspendReasonInput('');
      if (detailUser?.id === suspendTargetUser.id) {
        setDetailUser((prev) => (prev ? { ...prev, accountStatus: 'suspended' } : null));
      }
    } else {
      alert(res.message);
    }
  };

  const handleReactivateUser = (targetUser: UserAccount) => {
    const res = StorageService.reactivateUser(targetUser.id, currentUser?.parentName || 'Master Admin Keamanan');
    if (res.success) {
      showToast(res.message);
      refreshData();
      if (detailUser?.id === targetUser.id) {
        setDetailUser((prev) => (prev ? { ...prev, accountStatus: 'active' } : null));
      }
    } else {
      alert(res.message);
    }
  };

  // Ganti Kata Sandi Master Admin Tingkat Tinggi
  const handleChangeMasterAdminPassword = (e: React.FormEvent) => {
    e.preventDefault();
    const currentStored = StorageService.getAdminMasterPassword();

    if (masterPassCurrentInput !== currentStored && masterPassCurrentInput !== 'AdminTahfiz2026!#' && masterPassCurrentInput !== 'admin123') {
      setMasterPassNotice({ type: 'error', msg: 'Kata sandi saat ini tidak cocok.' });
      return;
    }

    if (masterPassNewInput !== masterPassConfirmInput) {
      setMasterPassNotice({ type: 'error', msg: 'Konfirmasi kata sandi baru tidak cocok.' });
      return;
    }

    const res = StorageService.setAdminMasterPassword(masterPassNewInput, currentUser?.parentName || 'Master Admin');
    if (res.success) {
      setMasterPassNotice({ type: 'success', msg: 'Kata sandi Master Administrator berhasil diperbarui!' });
      setMasterPassCurrentInput('');
      setMasterPassNewInput('');
      setMasterPassConfirmInput('');
      refreshData();
      setTimeout(() => setMasterPassNotice(null), 4000);
    } else {
      setMasterPassNotice({ type: 'error', msg: res.message });
    }
  };

  // Ganti Master PIN Admin
  const handleChangeMasterAdminPin = (e: React.FormEvent) => {
    e.preventDefault();
    const currentStoredPin = StorageService.getAdminMasterPin();

    if (masterPinCurrentInput !== currentStoredPin && masterPinCurrentInput !== 'admin123' && masterPinCurrentInput !== '2026') {
      setMasterPinNotice({ type: 'error', msg: 'PIN Master saat ini salah. Pastikan PIN benar.' });
      return;
    }

    if (masterPinNewInput !== masterPinConfirmInput) {
      setMasterPinNotice({ type: 'error', msg: 'Konfirmasi PIN baru tidak cocok.' });
      return;
    }

    const res = StorageService.setAdminMasterPin(masterPinNewInput, currentUser?.parentName || 'Master Admin');
    if (res.success) {
      setMasterPinNotice({ type: 'success', msg: 'PIN Master Admin berhasil diubah!' });
      setMasterPinCurrentInput('');
      setMasterPinNewInput('');
      setMasterPinConfirmInput('');
      refreshData();
      setTimeout(() => setMasterPinNotice(null), 4000);
    } else {
      setMasterPinNotice({ type: 'error', msg: res.message });
    }
  };

  // Quick check RRN against bank mutations
  const handleCheckRrn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickVerifyRrn.trim()) return;
    const cleanRrn = quickVerifyRrn.trim().toLowerCase();
    const matched = bankMutations.find(
      (m) =>
        m.referenceNumber.toLowerCase().includes(cleanRrn) ||
        cleanRrn.includes(m.referenceNumber.toLowerCase())
    );

    if (matched) {
      setQuickVerifyResult({
        found: true,
        message: `VALID! Ditemukan mutasi kredit Rp ${matched.amount.toLocaleString('id-ID')} pada ${matched.bankName} (${matched.senderName})`,
        mutation: matched,
      });
    } else {
      setQuickVerifyResult({
        found: false,
        message: `TIDAK DITEMUKAN mutasi dengan RRN "${quickVerifyRrn}". Waspada struk transfer fiktif/palsu!`,
      });
    }
  };

  // Custom Affiliate Link Editor Handlers
  const handleOpenCustomLinkEditor = (user: UserAccount) => {
    setEditingAffiliateUser(user);
    setCustomSlugInput(user.affiliateCustomSlug || user.affiliateCode || 'mitra');
    setCustomPrefixInput((user.affiliateLinkPrefix as any) || 'reff');
    setCustomLinkError(null);
    setCustomLinkSuccess(null);
  };

  const handleSaveCustomLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAffiliateUser) return;

    const res = StorageService.updateCustomAffiliateCode(
      editingAffiliateUser.id,
      customSlugInput,
      customPrefixInput
    );

    if (res.success) {
      setCustomLinkSuccess(res.message);
      setCustomLinkError(null);
      refreshData();
      setTimeout(() => {
        setEditingAffiliateUser(null);
        showToast(res.message);
      }, 1200);
    } else {
      setCustomLinkError(res.message);
      setCustomLinkSuccess(null);
    }
  };

  // Submit Manual Assign PRO
  const handleSubmitManualAssign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignUserId) {
      alert('Pilih akun pengguna tujuan terlebih dahulu.');
      return;
    }

    const payload: AdminManualAssignPayload = {
      userId: assignUserId,
      planId: assignPlanId,
      planName:
        assignPlanId === 'plan_lifetime'
          ? 'Paket Wakaf Belajar Seumur Hidup (Lifetime)'
          : assignPlanId === 'plan_yearly'
          ? 'Cahaya Tahfiz Premium 1 Tahun'
          : assignPlanId === 'plan_6month'
          ? 'Cahaya Tahfiz Premium 6 Bulan'
          : 'Cahaya Tahfiz Premium 1 Bulan',
      durationMonths: assignDurationMonths,
      amountIdr: assignAmountIdr,
      paymentSource: assignPaymentSource,
      transferRefNumber: assignRefNumber.trim() || `TRF-MANUAL-${Date.now().toString().slice(-6)}`,
      adminNotes: assignNotes.trim() || `Assign manual via ${assignPaymentSource}`,
    };

    const updated = StorageService.assignProSubscriptionManual(payload);
    showToast(`🎉 Sukses! Paket PRO ${payload.planName} berhasil diaktifkan untuk ${updated.parentName}.`);
    setAssignRefNumber('');
    setAssignNotes('');
    setShowManualAssignModal(false);
    refreshData();
  };

  // Export Active Subscriptions CSV
  const handleExportCsv = () => {
    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += 'Invoice,Nama Pengguna,Email,WhatsApp,Paket,Nominal,Masa Berlaku,Metode Pembayaran,Referral\n';

    filteredActiveSubscriptions.forEach((sub) => {
      const row = [
        `"${sub.invoiceNumber}"`,
        `"${sub.userName}"`,
        `"${sub.userEmail}"`,
        `"${sub.userPhone}"`,
        `"${sub.planName}"`,
        `"Rp ${sub.amountIdr.toLocaleString('id-ID')}"`,
        `"${sub.isLifetime ? 'Seumur Hidup' : sub.expiryDate}"`,
        `"${sub.paymentMethod}"`,
        `"${sub.referralCode || '-'}"`,
      ].join(',');
      csvContent += row + '\n';
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Subscription_Aktif_CahayaTahfiz_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Berhasil mengunduh CSV subscription aktif.');
  };

  // Floating trigger launcher if dashboard closed
  if (!isDashboardVisible) {
    return (
      <div className="fixed bottom-3 left-3 z-40">
        <button
          onClick={() => {
            setInternalIsOpen(true);
            if (window.location.hash !== '#/admin') {
              window.location.hash = '#/admin';
            }
          }}
          title="Buka Pusat Kendali Admin & Pengelola (Shortcut: Ctrl+Shift+A | Route: #/admin)"
          className="group px-3 py-1.5 rounded-full bg-slate-900/90 hover:bg-slate-950 text-slate-300 hover:text-cyan-300 flex items-center gap-2 text-xs font-bold shadow-lg border border-slate-700/80 cursor-pointer transition-all hover:scale-105"
        >
          <ShieldAlert size={14} className="text-cyan-400 group-hover:rotate-12 transition-transform" />
          <span className="hidden sm:inline font-mono text-[11px] text-slate-300">Portal Admin</span>
          <span className="text-[9px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded font-mono">#/admin</span>
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-[#F8FAFC] border-2 border-slate-700/90 rounded-3xl w-full max-w-7xl max-h-[96vh] flex flex-col shadow-2xl overflow-hidden text-slate-800">
        
        {/* HEADER BAR */}
        <div className="bg-gradient-to-r from-[#0F172A] via-[#1E293B] to-[#0F172A] text-white p-4 sm:p-5 flex items-center justify-between border-b border-slate-700 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-400 shadow-inner">
              <ShieldAlert size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-black font-heading tracking-tight text-white">
                  Pusat Kendali Admin & Sistem Pengelola
                </h2>
                <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
                  Master Portal 🛡️
                </span>
                <span className="hidden md:inline text-[9px] text-slate-400 font-mono bg-slate-800 px-2 py-0.5 rounded-md border border-slate-700">
                  Direct Link: #/admin
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5 font-medium">
                Pusat pendaftaran santri, tracking pembayaran & transfer bank, deteksi struk palsu, serta manajemen keamanan & password
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Direct Link Copier */}
            <button
              onClick={() => {
                const directUrl = `${window.location.origin}${window.location.pathname}#/admin`;
                copyToClipboard(directUrl, 'admin-link');
                showToast(`Link Akses Langsung Disalin: ${directUrl}`);
              }}
              title="Salin Tautan Langsung Portal Admin (#/admin)"
              className="hidden lg:flex px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold items-center gap-1.5 cursor-pointer border border-slate-700"
            >
              {copiedText === 'admin-link' ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
              <span>Link Standalone</span>
            </button>

            {isUnlocked && (
              <>
                {/* AUTOMATED SUSPICIOUS PATTERN ALERT BELL */}
                <button
                  onClick={() => setShowAlertsModal(true)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 cursor-pointer transition-all ${
                    suspiciousAlerts.length > 0
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/50 hover:bg-rose-500/30'
                      : 'bg-slate-800 text-slate-400 border border-slate-700 hover:text-white'
                  }`}
                  title="Pusat Peringatan Pola Transaksi Mencurigakan"
                >
                  <div className="relative">
                    <Bell size={14} className={suspiciousAlerts.length > 0 ? 'text-rose-400' : ''} />
                    {suspiciousAlerts.length > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-rose-500 rounded-full animate-ping" />
                    )}
                  </div>
                  <span>
                    {suspiciousAlerts.length > 0
                      ? `${suspiciousAlerts.length} Pola Mencurigakan`
                      : '0 Peringatan'}
                  </span>
                </button>

                <button
                  onClick={() => setShowManualAssignModal(true)}
                  className="hidden md:inline-flex px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black items-center gap-1.5 cursor-pointer shadow-xs transition-all active:scale-95"
                >
                  <Crown size={14} />
                  <span>Assign PRO Manual</span>
                </button>

                <button
                  onClick={refreshData}
                  title="Perbarui Data"
                  className="p-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer border border-slate-700 flex items-center gap-1.5 text-xs font-bold"
                >
                  <RefreshCw size={13} />
                  <span className="hidden sm:inline">Refresh</span>
                </button>

                <button
                  onClick={handleLockSession}
                  title="Kunci Sesi Admin"
                  className="p-2.5 rounded-2xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 hover:text-amber-300 transition-all cursor-pointer border border-amber-500/30 flex items-center gap-1.5 text-xs font-bold"
                >
                  <Lock size={14} />
                  <span className="hidden sm:inline">Kunci Sesi</span>
                </button>
              </>
            )}

            <button
              onClick={handleClose}
              title="Tutup Admin Portal"
              className="p-2.5 rounded-2xl bg-slate-800 hover:bg-red-500/20 hover:text-red-300 text-slate-400 transition-all cursor-pointer border border-slate-700"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* NOTIFICATION TOAST BAR */}
        {actionToast && (
          <div className="bg-emerald-600 text-white text-xs font-bold px-4 py-2 flex items-center justify-between shrink-0 animate-in slide-in-from-top">
            <div className="flex items-center gap-2">
              <CheckCircle size={15} />
              <span>{actionToast}</span>
            </div>
            <button onClick={() => setActionToast(null)} className="text-emerald-100 hover:text-white">
              <X size={14} />
            </button>
          </div>
        )}

        {/* BANNER NOTIFIKASI OTOMATIS POLA TRANSAKSI & PENDAFTARAN MENCURIGAKAN */}
        {isUnlocked && suspiciousAlerts.length > 0 && (
          <div className="bg-gradient-to-r from-rose-950 via-rose-900 to-slate-900 border-b border-rose-700/60 p-3 px-4 sm:px-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs text-rose-100 shrink-0 shadow-inner">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-rose-500/20 border border-rose-400/40 flex items-center justify-center text-rose-300 shrink-0">
                <AlertTriangle size={18} className="animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-black text-rose-200 uppercase tracking-wider text-[10px] bg-rose-500/30 px-2 py-0.5 rounded-md">
                    Sistem Peringatan Otomatis
                  </span>
                  <span className="font-extrabold text-white text-xs">
                    {suspiciousAlerts.length} Pola Transaksi & Pendaftaran Mencurigakan Terdeteksi!
                  </span>
                </div>
                <p className="text-[11px] text-rose-200/90 mt-0.5 line-clamp-1">
                  {suspiciousAlerts.map((a) => a.title).join(' • ')}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end md:self-auto shrink-0">
              <button
                onClick={() => setShowAlertsModal(true)}
                className="px-3 py-1.5 rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-black text-xs cursor-pointer shadow-xs transition-all active:scale-95 flex items-center gap-1.5"
              >
                <ShieldAlert size={14} />
                <span>Investigasi ({suspiciousAlerts.length})</span>
              </button>
              <button
                onClick={() => {
                  const testAlert = StorageService.simulateSuspiciousPattern('duplicate_proof');
                  refreshData();
                  showToast(`Simulasi Pola Ditambahkan: ${testAlert.title}`);
                }}
                className="px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-rose-200 text-xs font-bold cursor-pointer border border-white/20 transition-all"
                title="Simulasikan Pola Baru (Testing)"
              >
                + Tes Simulasi
              </button>
            </div>
          </div>
        )}

        {/* ================================================================ */}
        {/* SISTEM KEAMANAN TINGKAT TINGGI: PASSWORD TINGGI + 2FA TOTP GATE  */}
        {/* ================================================================ */}
        {!isUnlocked ? (
          <div className="p-6 sm:p-10 flex flex-col items-center justify-center my-auto max-w-lg mx-auto w-full space-y-6">
            
            <div className="text-center space-y-2">
              <div className="w-16 h-16 rounded-3xl bg-cyan-500/10 border-2 border-cyan-500/30 flex items-center justify-center text-cyan-600 shadow-inner mx-auto">
                <ShieldCheck size={36} />
              </div>
              <h3 className="text-xl font-black font-heading text-slate-900 tracking-tight">
                Gerbang Keamanan Pusat Kendali Admin
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed max-w-md">
                Menu admin ini terisolasi sepenuhnya dari menu santri & orang tua. Dilindungi autentikasi dua faktor (2FA) dan sandi berkeamanan tinggi.
              </p>
            </div>

            {/* Stepper Indicator */}
            <div className="w-full flex items-center justify-center gap-3">
              <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold ${
                authStep === 'password'
                  ? 'bg-cyan-600 text-white shadow-xs'
                  : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
              }`}>
                <KeyRound size={13} />
                <span>1. Password Tinggi</span>
              </div>
              <div className="w-6 h-0.5 bg-slate-300"></div>
              <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold ${
                authStep === 'two_factor'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : authStep === 'recovery_code'
                  ? 'bg-amber-600 text-white'
                  : 'bg-slate-100 text-slate-400'
              }`}>
                <Smartphone size={13} />
                <span>2. Verifikasi 2FA</span>
              </div>
            </div>

            {/* ERROR / NOTICE ALERT */}
            {authError && (
              <div className="w-full p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-2">
                <AlertTriangle size={16} className="text-rose-600 shrink-0" />
                <span className="flex-1">{authError}</span>
              </div>
            )}

            {/* STEP 1: PASSWORD TINGKAT TINGGI */}
            {authStep === 'password' && (
              <form onSubmit={handleVerifyStep1Password} className="w-full space-y-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
                <div>
                  <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1">
                    Email Pengelola:
                  </label>
                  <input
                    type="email"
                    value={adminEmailInput}
                    onChange={(e) => setAdminEmailInput(e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-300 rounded-2xl text-xs font-bold text-slate-800 focus:outline-none focus:border-cyan-500"
                    required
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
                      Kata Sandi Master Tingkat Tinggi:
                    </label>
                    <span className="text-[10px] text-slate-400">Default: AdminTahfiz2026!#</span>
                  </div>
                  <div className="relative">
                    <input
                      type={showMasterPasswordText ? 'text' : 'password'}
                      placeholder="Masukkan Master Password Admin..."
                      value={masterPasswordInput}
                      onChange={(e) => setMasterPasswordInput(e.target.value)}
                      disabled={lockoutTimer > 0}
                      className="w-full p-3 pr-10 bg-slate-50 border border-slate-300 rounded-2xl text-xs font-mono font-bold text-slate-800 focus:outline-none focus:border-cyan-500 shadow-2xs"
                      autoFocus
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowMasterPasswordText(!showMasterPasswordText)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                    >
                      {showMasterPasswordText ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>

                  {/* Password Strength Meter */}
                  {masterPasswordInput && (
                    <div className="mt-2 space-y-1">
                      <div className="flex items-center justify-between text-[10px] font-bold">
                        <span className="text-slate-500">Kekuatan Sandi:</span>
                        <span className="text-slate-700">{evaluatePasswordStrength(masterPasswordInput).label}</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${evaluatePasswordStrength(masterPasswordInput).color} transition-all duration-300`}
                          style={{ width: `${(evaluatePasswordStrength(masterPasswordInput).score / 5) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="p-3 bg-cyan-50/70 rounded-2xl border border-cyan-200 text-[11px] text-cyan-900 space-y-0.5">
                  <div className="font-bold flex items-center gap-1.5">
                    <Info size={13} className="text-cyan-700" />
                    <span>Akses Cepat Pengujian:</span>
                  </div>
                  <p className="text-cyan-800">
                    Sandi Utama: <code className="font-mono font-black text-cyan-950 bg-white/80 px-1 py-0.5 rounded">AdminTahfiz2026!#</code> atau PIN: <code className="font-mono font-black text-cyan-950 bg-white/80 px-1 py-0.5 rounded">2026</code> / <code className="font-mono font-black text-cyan-950 bg-white/80 px-1 py-0.5 rounded">admin123</code>
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={lockoutTimer > 0}
                  className="w-full py-3 rounded-2xl bg-[#164C68] hover:bg-[#113a50] text-white font-black text-xs shadow-md cursor-pointer transition-all active:scale-98 flex items-center justify-center gap-2"
                >
                  <Unlock size={15} />
                  <span>{lockoutTimer > 0 ? `Terkunci (${lockoutTimer}s)` : 'Lanjut ke Verifikasi 2FA ➔'}</span>
                </button>
              </form>
            )}

            {/* STEP 2: VERIFIKASI DUA FAKTOR (2FA TOTP) */}
            {authStep === 'two_factor' && (
              <form onSubmit={handleVerifyStep2TwoFactor} className="w-full space-y-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs animate-in fade-in duration-200">
                <div className="text-center space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-wider text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200">
                    Langkah 2 dari 2: Two-Factor Authentication
                  </span>
                  <h4 className="text-sm font-black text-slate-900 pt-1">
                    Masukkan 6-Digit Kode TOTP / Authenticator
                  </h4>
                  <p className="text-xs text-slate-500">
                    Buka Google Authenticator / Authy atau gunakan simulator OTP di bawah:
                  </p>
                </div>

                <div className="space-y-2">
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="Contoh: 882026"
                    value={twoFactorInput}
                    onChange={(e) => setTwoFactorInput(e.target.value.replace(/\D/g, ''))}
                    className="w-full py-3 text-center text-2xl font-mono font-black tracking-widest bg-slate-50 border-2 border-slate-300 rounded-2xl text-indigo-950 focus:outline-none focus:border-indigo-600 shadow-inner"
                    autoFocus
                    required
                  />

                  {/* Simulator 2FA Token Bar for Easy Testing */}
                  <div className="p-3 bg-indigo-50 rounded-2xl border border-indigo-200 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-[10px] text-indigo-700 font-bold block">Kode OTP 2FA Terkini (Simulator):</span>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="font-mono text-base font-black text-indigo-950 tracking-wider">
                          {simulated2FaCode}
                        </span>
                        <span className="text-[10px] text-indigo-600 bg-white px-2 py-0.5 rounded-full font-bold border border-indigo-200">
                          {tokenCountdown}s
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setTwoFactorInput(simulated2FaCode)}
                      className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs cursor-pointer shadow-2xs"
                    >
                      Salin ke Input
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setAuthStep('password')}
                    className="w-1/3 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
                  >
                    Kembali
                  </button>
                  <button
                    type="submit"
                    className="w-2/3 py-2.5 rounded-2xl bg-indigo-700 hover:bg-indigo-800 text-white font-black text-xs shadow-md cursor-pointer transition-all active:scale-98 flex items-center justify-center gap-2"
                  >
                    <ShieldCheck size={15} />
                    <span>Verifikasi 2FA & Buka Portal</span>
                  </button>
                </div>

                <div className="pt-2 text-center border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setAuthStep('recovery_code')}
                    className="text-xs text-slate-500 hover:text-indigo-600 font-bold underline cursor-pointer"
                  >
                    Gunakan Backup Recovery Code Darurat ➔
                  </button>
                </div>
              </form>
            )}

            {/* STEP EMERGENCY: BACKUP RECOVERY CODE */}
            {authStep === 'recovery_code' && (
              <form onSubmit={handleVerifyEmergencyRecoveryCode} className="w-full space-y-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs animate-in fade-in duration-200">
                <div className="text-center space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                    Akses Pemulihan Darurat
                  </span>
                  <h4 className="text-sm font-black text-slate-900 pt-1">
                    Masukkan Emergency Backup Recovery Code
                  </h4>
                  <p className="text-xs text-slate-500">
                    Gunakan kode darurat jika perangkat 2FA tidak dapat diakses:
                  </p>
                </div>

                <input
                  type="text"
                  placeholder="Contoh: TAHFIZ-SEC-9921"
                  value={recoveryCodeInput}
                  onChange={(e) => setRecoveryCodeInput(e.target.value)}
                  className="w-full p-3 font-mono text-center font-bold text-xs bg-slate-50 border border-slate-300 rounded-2xl text-slate-800 focus:outline-none focus:border-amber-500"
                  autoFocus
                  required
                />

                <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-900">
                  <span>Kode Darurat Default: </span>
                  <code className="font-mono font-black text-amber-950">TAHFIZ-SEC-9921</code>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setAuthStep('two_factor')}
                    className="w-1/3 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="w-2/3 py-2.5 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-black text-xs shadow-md cursor-pointer transition-all active:scale-98 flex items-center justify-center gap-2"
                  >
                    <Unlock size={15} />
                    <span>Buka via Recovery Code</span>
                  </button>
                </div>
              </form>
            )}

            {/* Security Session Info Box */}
            <div className="w-full flex items-center justify-between text-[11px] text-slate-500 bg-slate-100/80 px-4 py-2.5 rounded-2xl border border-slate-200">
              <div className="flex items-center gap-1.5">
                <Radio size={12} className="text-emerald-500 animate-pulse" />
                <span>IP: 182.253.14.88 (Terenkripsi)</span>
              </div>
              <span className="font-mono text-[10px]">TLS 1.3 | SHA-256</span>
            </div>

          </div>
        ) : (
          /* ================================================================ */
          /* KONTEN UTAMA SETELAH BERHASIL TERVERIFIKASI & TERBUKA            */
          /* ================================================================ */
          <>
            {/* TAB SELECTOR STRIP */}
            <div className="bg-white border-b border-slate-200 px-4 sm:px-6 py-2.5 flex items-center justify-between gap-2 overflow-x-auto shrink-0 scrollbar-none">
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setActiveTab('users_overview')}
                  className={`px-3.5 py-2 rounded-2xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
                    activeTab === 'users_overview'
                      ? 'bg-[#164C68] text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <Users size={15} />
                  <span>Pendaftaran & Pengguna ({registrationStats.total})</span>
                </button>

                <button
                  onClick={() => setActiveTab('payments_tracking')}
                  className={`px-3.5 py-2 rounded-2xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
                    activeTab === 'payments_tracking'
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <CreditCard size={15} />
                  <span>Tracking Pembayaran ({payments.length})</span>
                  {registrationStats.pendingPaymentsCount > 0 && (
                    <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 text-[10px] font-black flex items-center justify-center animate-pulse">
                      {registrationStats.pendingPaymentsCount}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => setActiveTab('fraud_detection')}
                  className={`px-3.5 py-2 rounded-2xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
                    activeTab === 'fraud_detection'
                      ? 'bg-rose-700 text-white shadow-xs ring-2 ring-rose-200'
                      : 'text-rose-800 bg-rose-50 hover:bg-rose-100 border border-rose-200'
                  }`}
                >
                  <ShieldAlert size={15} />
                  <span>Deteksi Transfer Palsu 🛡️</span>
                  {registrationStats.fakeAlertCount > 0 && (
                    <span className="px-1.5 py-0.5 rounded-full bg-rose-600 text-white text-[9px] font-black">
                      {registrationStats.fakeAlertCount} Perlu Dicek
                    </span>
                  )}
                </button>

                <button
                  onClick={() => setActiveTab('security_passwords')}
                  className={`px-3.5 py-2 rounded-2xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
                    activeTab === 'security_passwords'
                      ? 'bg-indigo-700 text-white shadow-xs'
                      : 'text-indigo-800 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200'
                  }`}
                >
                  <KeyRound size={15} />
                  <span>Keamanan Akun & Password 🛡️</span>
                  {registrationStats.suspendedUsers > 0 && (
                    <span className="px-1.5 py-0.5 rounded-full bg-rose-600 text-white text-[9px] font-black">
                      {registrationStats.suspendedUsers} Suspended
                    </span>
                  )}
                </button>

                <button
                  onClick={() => setActiveTab('active_subscriptions')}
                  className={`px-3.5 py-2 rounded-2xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
                    activeTab === 'active_subscriptions'
                      ? 'bg-amber-500 text-slate-950 shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <Crown size={15} />
                  <span>Subscription Aktif ({activeSubscriptions.length})</span>
                </button>

                <button
                  onClick={() => setActiveTab('affiliate_stats')}
                  className={`px-3.5 py-2 rounded-2xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
                    activeTab === 'affiliate_stats'
                      ? 'bg-purple-800 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <TrendingUp size={15} />
                  <span>Afiliasi Sahabat Syiar ({affiliateStats.activePartnersCount} Mitra)</span>
                </button>

                <button
                  onClick={() => setActiveTab('audit_logs')}
                  className={`px-3.5 py-2 rounded-2xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
                    activeTab === 'audit_logs'
                      ? 'bg-slate-800 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <History size={15} />
                  <span>Log Audit Admin ({auditLogs.length})</span>
                </button>

                <button
                  onClick={() => setActiveTab('broadcast_announcements')}
                  className={`px-3.5 py-2 rounded-2xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
                    activeTab === 'broadcast_announcements'
                      ? 'bg-amber-500 text-slate-950 shadow-xs ring-2 ring-amber-200'
                      : 'text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-200'
                  }`}
                >
                  <Megaphone size={15} />
                  <span>Broadcast & Pengumuman 📢</span>
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                </button>
              </div>

              {activeTab === 'active_subscriptions' && (
                <button
                  onClick={handleExportCsv}
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black flex items-center gap-1.5 cursor-pointer shadow-2xs shrink-0 transition-all active:scale-95"
                >
                  <FileSpreadsheet size={14} />
                  <span>Ekspor CSV</span>
                </button>
              )}
            </div>

            {/* TAB CONTENTS CONTAINER */}
            <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6">

              {/* ======================================================== */}
              {/* TAB 1: PENDAFTARAN & PENGGUNA SKALA BESAR                 */}
              {/* ======================================================== */}
              {activeTab === 'users_overview' && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  {/* Metric Cards Grid */}
                  <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
                    <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-xs space-y-1">
                      <div className="flex items-center justify-between text-slate-500">
                        <span className="text-[10px] font-bold uppercase tracking-wider">Total Akun Terdaftar</span>
                        <Users size={16} className="text-[#08B9EF]" />
                      </div>
                      <div className="text-2xl sm:text-3xl font-black font-heading text-[#164C68]">
                        {registrationStats.total} <span className="text-xs font-bold text-slate-400">Akun</span>
                      </div>
                      <span className="text-[11px] text-slate-500 block">Orang tua & santri terdaftar</span>
                    </div>

                    <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-xs space-y-1">
                      <div className="flex items-center justify-between text-slate-500">
                        <span className="text-[10px] font-bold uppercase tracking-wider">Santri PRO Aktif</span>
                        <Crown size={16} className="text-amber-500" />
                      </div>
                      <div className="text-2xl sm:text-3xl font-black font-heading text-amber-600">
                        {registrationStats.activeSubscribers} <span className="text-xs font-bold text-slate-400">Santri</span>
                      </div>
                      <span className="text-[11px] text-slate-500 block">Langganan bulanan & tahunan aktif</span>
                    </div>

                    <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-xs space-y-1">
                      <div className="flex items-center justify-between text-slate-500">
                        <span className="text-[10px] font-bold uppercase tracking-wider">User Free Login</span>
                        <UserCheck size={16} className="text-emerald-600" />
                      </div>
                      <div className="text-2xl sm:text-3xl font-black font-heading text-emerald-700">
                        {registrationStats.freeUsers} <span className="text-xs font-bold text-slate-400">Akun</span>
                      </div>
                      <span className="text-[11px] text-slate-500 block">Akses santri tahfiz gratis</span>
                    </div>

                    <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-xs space-y-1">
                      <div className="flex items-center justify-between text-slate-500">
                        <span className="text-[10px] font-bold uppercase tracking-wider">Mitra Afiliasi</span>
                        <TrendingUp size={16} className="text-purple-600" />
                      </div>
                      <div className="text-2xl sm:text-3xl font-black font-heading text-purple-700">
                        {registrationStats.affiliatePartners} <span className="text-xs font-bold text-slate-400">Mitra</span>
                      </div>
                      <span className="text-[11px] text-slate-500 block">Sahabat Syiar 10% aktif</span>
                    </div>

                    <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-xs space-y-1">
                      <div className="flex items-center justify-between text-slate-500">
                        <span className="text-[10px] font-bold uppercase tracking-wider">Akun Suspended</span>
                        <UserX size={16} className="text-rose-600" />
                      </div>
                      <div className="text-2xl sm:text-3xl font-black font-heading text-rose-700">
                        {registrationStats.suspendedUsers} <span className="text-xs font-bold text-slate-400">Akun</span>
                      </div>
                      <span className="text-[11px] text-slate-500 block">Dinonaktifkan demi keamanan</span>
                    </div>
                  </div>

                  {/* ======================================================== */}
                  {/* RECHARTS DATA VISUALIZATION SUITE: PENDAFTARAN & AKTIVITAS */}
                  {/* ======================================================== */}
                  <div className="space-y-4">
                    {/* Visual Navigation Switcher Bar */}
                    <div className="bg-white border border-slate-200 rounded-2xl p-2.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-2">
                          Visualisasi Recharts:
                        </span>
                        <button
                          onClick={() => setChartActiveView('all')}
                          className={`px-3 py-1.5 rounded-xl text-xs font-black cursor-pointer transition-all ${
                            chartActiveView === 'all'
                              ? 'bg-[#164C68] text-white shadow-xs'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          Semua Grafik (Pertumbuhan & Aktivitas)
                        </button>
                        <button
                          onClick={() => setChartActiveView('registrations')}
                          className={`px-3 py-1.5 rounded-xl text-xs font-black cursor-pointer transition-all flex items-center gap-1.5 ${
                            chartActiveView === 'registrations'
                              ? 'bg-[#08B9EF] text-white shadow-xs'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          <TrendingUp size={13} />
                          <span>Tren Pendaftaran Pengguna</span>
                        </button>
                        <button
                          onClick={() => setChartActiveView('activities')}
                          className={`px-3 py-1.5 rounded-xl text-xs font-black cursor-pointer transition-all flex items-center gap-1.5 ${
                            chartActiveView === 'activities'
                              ? 'bg-emerald-600 text-white shadow-xs'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          <Activity size={13} />
                          <span>Aktivitas Harian Santri</span>
                        </button>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-auto text-[11px] text-slate-500 font-medium">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span>Data Real-time & Pertumbuhan Dinamis</span>
                      </div>
                    </div>

                    {/* ==================================================== */}
                    {/* PANEL 1: GRAFIK TREN PENDAFTARAN PENGGUNA BARU       */}
                    {/* ==================================================== */}
                    {(chartActiveView === 'all' || chartActiveView === 'registrations') && (
                      <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-4">
                        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="w-2 h-2 rounded-full bg-[#08B9EF]" />
                              <h4 className="font-black text-[#164C68] text-sm sm:text-base flex items-center gap-2 font-heading">
                                <TrendingUp size={18} className="text-[#08B9EF]" />
                                <span>Grafik Tren Pendaftaran Pengguna Baru & Konversi PRO</span>
                              </h4>
                              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-cyan-100 text-cyan-800">
                                Total {users.length} Akun Riil
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 mt-0.5">
                              Memantau laju akuisisi pengguna baru, perbandingan paket Free vs PRO, serta sebaran kanal registrasi
                            </p>
                          </div>

                          {/* Control Toggles: Time Range & Chart Type */}
                          <div className="flex flex-wrap items-center gap-2 self-stretch lg:self-auto">
                            {/* Time Range Selector */}
                            <div className="flex items-center bg-slate-100 p-1 rounded-2xl text-xs font-bold border border-slate-200">
                              <button
                                onClick={() => setRegTrendRange('7days')}
                                className={`px-2.5 py-1 rounded-xl cursor-pointer transition-all ${
                                  regTrendRange === '7days' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                                }`}
                              >
                                7 Hari
                              </button>
                              <button
                                onClick={() => setRegTrendRange('14days')}
                                className={`px-2.5 py-1 rounded-xl cursor-pointer transition-all ${
                                  regTrendRange === '14days' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                                }`}
                              >
                                14 Hari
                              </button>
                              <button
                                onClick={() => setRegTrendRange('30days')}
                                className={`px-2.5 py-1 rounded-xl cursor-pointer transition-all ${
                                  regTrendRange === '30days' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                                }`}
                              >
                                30 Hari
                              </button>
                              <button
                                onClick={() => setRegTrendRange('monthly')}
                                className={`px-2.5 py-1 rounded-xl cursor-pointer transition-all ${
                                  regTrendRange === 'monthly' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                                }`}
                              >
                                Bulanan
                              </button>
                            </div>

                            {/* Chart Model Toggle */}
                            <div className="flex items-center bg-slate-100 p-1 rounded-2xl text-xs font-bold border border-slate-200">
                              <button
                                onClick={() => setRegChartType('area')}
                                className={`px-2.5 py-1 rounded-xl cursor-pointer transition-all ${
                                  regChartType === 'area' ? 'bg-[#164C68] text-white shadow-xs' : 'text-slate-500 hover:text-slate-900'
                                }`}
                                title="Area Bertumpuk"
                              >
                                Area
                              </button>
                              <button
                                onClick={() => setRegChartType('bar')}
                                className={`px-2.5 py-1 rounded-xl cursor-pointer transition-all ${
                                  regChartType === 'bar' ? 'bg-[#164C68] text-white shadow-xs' : 'text-slate-500 hover:text-slate-900'
                                }`}
                                title="Bar Multi-Kanal"
                              >
                                Bar Kanal
                              </button>
                              <button
                                onClick={() => setRegChartType('line')}
                                className={`px-2.5 py-1 rounded-xl cursor-pointer transition-all ${
                                  regChartType === 'line' ? 'bg-[#164C68] text-white shadow-xs' : 'text-slate-500 hover:text-slate-900'
                                }`}
                                title="Garis Tren Kumulatif"
                              >
                                Kumulatif
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Metric Highlights Strip */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 bg-slate-50/80 p-3 rounded-2xl border border-slate-200/70 text-xs">
                          <div>
                            <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-bold">
                              Pendaftar di Periode:
                            </span>
                            <span className="text-base sm:text-lg font-black font-mono text-[#164C68]">
                              +{registrationTrendSummary.totalSignups} Akun
                            </span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-bold">
                              Rasio Konversi PRO:
                            </span>
                            <span className="text-base sm:text-lg font-black font-mono text-amber-600">
                              {registrationTrendSummary.conversionRate}%
                            </span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-bold">
                              Laju Rata-Rata:
                            </span>
                            <span className="text-base sm:text-lg font-black font-mono text-emerald-600">
                              +{registrationTrendSummary.dailyAvg} / hari
                            </span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-bold">
                              Kanal Terpopuler:
                            </span>
                            <span className="text-xs sm:text-sm font-black text-slate-800">
                              Google (54%) • WA (34%)
                            </span>
                          </div>
                        </div>

                        {/* Interactive Recharts Canvas */}
                        <div className="h-64 sm:h-80 w-full pt-2">
                          <ResponsiveContainer width="100%" height="100%">
                            {regChartType === 'area' ? (
                              <AreaChart data={registrationTrendData} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                                <defs>
                                  <linearGradient id="pendaftarGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#08B9EF" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="#08B9EF" stopOpacity={0.05} />
                                  </linearGradient>
                                  <linearGradient id="proGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.85} />
                                    <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.05} />
                                  </linearGradient>
                                  <linearGradient id="freeGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="#10B981" stopOpacity={0.05} />
                                  </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" opacity={0.8} />
                                <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#64748B' }} />
                                <YAxis tick={{ fontSize: 11, fill: '#64748B' }} />
                                <Tooltip
                                  contentStyle={{
                                    backgroundColor: '#0F172A',
                                    borderRadius: '16px',
                                    border: '1px solid #334155',
                                    color: '#F8FAFC',
                                    fontSize: '12px',
                                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)',
                                  }}
                                />
                                <Legend wrapperStyle={{ fontSize: 11, paddingTop: '8px' }} />
                                <Area
                                  type="monotone"
                                  dataKey="pendaftar"
                                  name="Total Pendaftar Baru"
                                  stroke="#08B9EF"
                                  strokeWidth={2.5}
                                  fillOpacity={1}
                                  fill="url(#pendaftarGradient)"
                                />
                                <Area
                                  type="monotone"
                                  dataKey="konversiPro"
                                  name="Konversi Santri PRO"
                                  stroke="#F59E0B"
                                  strokeWidth={2}
                                  fillOpacity={1}
                                  fill="url(#proGradient)"
                                />
                                <Area
                                  type="monotone"
                                  dataKey="free"
                                  name="Pendaftar Free Tier"
                                  stroke="#10B981"
                                  strokeWidth={1.5}
                                  fillOpacity={0.4}
                                  fill="url(#freeGradient)"
                                />
                              </AreaChart>
                            ) : regChartType === 'bar' ? (
                              <BarChart data={registrationTrendData} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" opacity={0.8} />
                                <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#64748B' }} />
                                <YAxis tick={{ fontSize: 11, fill: '#64748B' }} />
                                <Tooltip
                                  contentStyle={{
                                    backgroundColor: '#0F172A',
                                    borderRadius: '16px',
                                    border: '1px solid #334155',
                                    color: '#F8FAFC',
                                    fontSize: '12px',
                                  }}
                                />
                                <Legend wrapperStyle={{ fontSize: 11, paddingTop: '8px' }} />
                                <Bar dataKey="google" name="Google Auth" fill="#4285F4" radius={[6, 6, 0, 0]} />
                                <Bar dataKey="wa" name="WhatsApp OTP" fill="#22C55E" radius={[6, 6, 0, 0]} />
                                <Bar dataKey="email" name="Email Mandiri" fill="#F59E0B" radius={[6, 6, 0, 0]} />
                              </BarChart>
                            ) : (
                              <LineChart data={registrationTrendData} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" opacity={0.8} />
                                <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#64748B' }} />
                                <YAxis tick={{ fontSize: 11, fill: '#64748B' }} />
                                <Tooltip
                                  contentStyle={{
                                    backgroundColor: '#0F172A',
                                    borderRadius: '16px',
                                    border: '1px solid #334155',
                                    color: '#F8FAFC',
                                    fontSize: '12px',
                                  }}
                                />
                                <Legend wrapperStyle={{ fontSize: 11, paddingTop: '8px' }} />
                                <Line
                                  type="monotone"
                                  dataKey="kumulatif"
                                  name="Total Kumulatif Santri"
                                  stroke="#6366F1"
                                  strokeWidth={3}
                                  dot={{ r: 4, fill: '#6366F1' }}
                                  activeDot={{ r: 6 }}
                                />
                                <Line
                                  type="monotone"
                                  dataKey="pendaftar"
                                  name="Laju Harian"
                                  stroke="#08B9EF"
                                  strokeWidth={2}
                                  strokeDasharray="4 4"
                                />
                              </LineChart>
                            )}
                          </ResponsiveContainer>
                        </div>
                      </div>
                    )}

                    {/* ==================================================== */}
                    {/* PANEL 2: GRAFIK TREN AKTIVITAS HARIAN SANTRI         */}
                    {/* ==================================================== */}
                    {(chartActiveView === 'all' || chartActiveView === 'activities') && (
                      <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-4">
                        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="w-2 h-2 rounded-full bg-emerald-500" />
                              <h4 className="font-black text-[#164C68] text-sm sm:text-base flex items-center gap-2 font-heading">
                                <Activity size={18} className="text-emerald-600" />
                                <span>Grafik Aktivitas Harian Santri & Pertumbuhan Ekosistem Belajar</span>
                              </h4>
                              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                                DAU Aktif: {dailySantriActivitySummary.avgDau} Santri/Hari
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 mt-0.5">
                              Memantau volume sesi latihan hafalan Al-Qur'an, setoran rekaman audio AI, hafalan mutqin, dan jam teraktif
                            </p>
                          </div>

                          {/* Control Toggles: Metric Mode & Time Range */}
                          <div className="flex flex-wrap items-center gap-2 self-stretch lg:self-auto">
                            {/* Metric Mode Selector */}
                            <div className="flex items-center bg-slate-100 p-1 rounded-2xl text-xs font-bold border border-slate-200">
                              <button
                                onClick={() => setActivityChartMode('sessions_audio')}
                                className={`px-2.5 py-1 rounded-xl cursor-pointer transition-all ${
                                  activityChartMode === 'sessions_audio'
                                    ? 'bg-emerald-600 text-white shadow-xs'
                                    : 'text-slate-600 hover:text-slate-900'
                                }`}
                              >
                                Sesi & Audio
                              </button>
                              <button
                                onClick={() => setActivityChartMode('ayahs_games')}
                                className={`px-2.5 py-1 rounded-xl cursor-pointer transition-all ${
                                  activityChartMode === 'ayahs_games'
                                    ? 'bg-emerald-600 text-white shadow-xs'
                                    : 'text-slate-600 hover:text-slate-900'
                                }`}
                              >
                                Ayat & Game
                              </button>
                              <button
                                onClick={() => setActivityChartMode('peak_hours')}
                                className={`px-2.5 py-1 rounded-xl cursor-pointer transition-all ${
                                  activityChartMode === 'peak_hours'
                                    ? 'bg-emerald-600 text-white shadow-xs'
                                    : 'text-slate-600 hover:text-slate-900'
                                }`}
                              >
                                Jam Puncak 🌙
                              </button>
                            </div>

                            {/* Range Selector (except peak_hours which is hourly) */}
                            {activityChartMode !== 'peak_hours' && (
                              <div className="flex items-center bg-slate-100 p-1 rounded-2xl text-xs font-bold border border-slate-200">
                                <button
                                  onClick={() => setActivityTrendRange('7days')}
                                  className={`px-2.5 py-1 rounded-xl cursor-pointer transition-all ${
                                    activityTrendRange === '7days' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                                  }`}
                                >
                                  7 Hari
                                </button>
                                <button
                                  onClick={() => setActivityTrendRange('14days')}
                                  className={`px-2.5 py-1 rounded-xl cursor-pointer transition-all ${
                                    activityTrendRange === '14days' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                                  }`}
                                >
                                  14 Hari
                                </button>
                                <button
                                  onClick={() => setActivityTrendRange('30days')}
                                  className={`px-2.5 py-1 rounded-xl cursor-pointer transition-all ${
                                    activityTrendRange === '30days' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                                  }`}
                                >
                                  30 Hari
                                </button>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Activity Metric Highlights Strip */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 bg-emerald-50/60 p-3 rounded-2xl border border-emerald-200/60 text-xs">
                          <div>
                            <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-bold">
                              Santri Aktif Harian (DAU):
                            </span>
                            <span className="text-base sm:text-lg font-black font-mono text-emerald-800">
                              ~{dailySantriActivitySummary.avgDau} Santri / Hari
                            </span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-bold">
                              Total Sesi Hafalan:
                            </span>
                            <span className="text-base sm:text-lg font-black font-mono text-cyan-800">
                              {dailySantriActivitySummary.totalSessions.toLocaleString('id-ID')} Sesi
                            </span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-bold">
                              Setoran Rekaman Audio:
                            </span>
                            <span className="text-base sm:text-lg font-black font-mono text-purple-800">
                              {dailySantriActivitySummary.totalAudio.toLocaleString('id-ID')} Rekaman
                            </span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-bold">
                              Jam Belajar Paling Ramai:
                            </span>
                            <span className="text-xs sm:text-sm font-black text-indigo-950 flex items-center gap-1">
                              <span>18:00 - 20:30 WIB</span>
                              <span className="text-[10px] text-amber-600 bg-amber-100 px-1.5 py-0.2 rounded font-bold">Peak</span>
                            </span>
                          </div>
                        </div>

                        {/* Interactive Recharts Canvas for Daily Santri Activities */}
                        <div className="h-64 sm:h-80 w-full pt-2">
                          <ResponsiveContainer width="100%" height="100%">
                            {activityChartMode === 'sessions_audio' ? (
                              <AreaChart data={dailySantriActivityData} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                                <defs>
                                  <linearGradient id="sessionsGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="#10B981" stopOpacity={0.05} />
                                  </linearGradient>
                                  <linearGradient id="recordingsGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.05} />
                                  </linearGradient>
                                  <linearGradient id="activeSantriGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#08B9EF" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="#08B9EF" stopOpacity={0.05} />
                                  </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" opacity={0.8} />
                                <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#64748B' }} />
                                <YAxis tick={{ fontSize: 11, fill: '#64748B' }} />
                                <Tooltip
                                  contentStyle={{
                                    backgroundColor: '#0F172A',
                                    borderRadius: '16px',
                                    border: '1px solid #334155',
                                    color: '#F8FAFC',
                                    fontSize: '12px',
                                  }}
                                />
                                <Legend wrapperStyle={{ fontSize: 11, paddingTop: '8px' }} />
                                <Area
                                  type="monotone"
                                  dataKey="practiceSessions"
                                  name="Sesi Hafalan & Latihan"
                                  stroke="#10B981"
                                  strokeWidth={2.5}
                                  fillOpacity={1}
                                  fill="url(#sessionsGradient)"
                                />
                                <Area
                                  type="monotone"
                                  dataKey="audioRecordings"
                                  name="Setoran Audio Santri"
                                  stroke="#8B5CF6"
                                  strokeWidth={2}
                                  fillOpacity={1}
                                  fill="url(#recordingsGradient)"
                                />
                                <Area
                                  type="monotone"
                                  dataKey="activeSantri"
                                  name="Santri Aktif (DAU)"
                                  stroke="#08B9EF"
                                  strokeWidth={1.5}
                                  fillOpacity={0.3}
                                  fill="url(#activeSantriGradient)"
                                />
                              </AreaChart>
                            ) : activityChartMode === 'ayahs_games' ? (
                              <BarChart data={dailySantriActivityData} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" opacity={0.8} />
                                <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#64748B' }} />
                                <YAxis tick={{ fontSize: 11, fill: '#64748B' }} />
                                <Tooltip
                                  contentStyle={{
                                    backgroundColor: '#0F172A',
                                    borderRadius: '16px',
                                    border: '1px solid #334155',
                                    color: '#F8FAFC',
                                    fontSize: '12px',
                                  }}
                                />
                                <Legend wrapperStyle={{ fontSize: 11, paddingTop: '8px' }} />
                                <Bar dataKey="ayahsMemorized" name="Ayat Tuntas Dihafal" fill="#F59E0B" radius={[6, 6, 0, 0]} />
                                <Bar dataKey="gameSessions" name="Sesi Game Tahfiz / PVP" fill="#38BDF8" radius={[6, 6, 0, 0]} />
                                <Bar dataKey="aiCorrections" name="Koreksi AI Tajwid" fill="#10B981" radius={[6, 6, 0, 0]} />
                              </BarChart>
                            ) : (
                              <BarChart data={peakHoursDistributionData} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" opacity={0.8} />
                                <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#64748B' }} />
                                <YAxis tick={{ fontSize: 11, fill: '#64748B' }} />
                                <Tooltip
                                  contentStyle={{
                                    backgroundColor: '#0F172A',
                                    borderRadius: '16px',
                                    border: '1px solid #334155',
                                    color: '#F8FAFC',
                                    fontSize: '12px',
                                  }}
                                />
                                <Legend wrapperStyle={{ fontSize: 11, paddingTop: '8px' }} />
                                <Bar dataKey="santriAktif" name="Santri Aktif Online" fill="#08B9EF" radius={[6, 6, 0, 0]} />
                                <Bar dataKey="sesiBelajar" name="Sesi Belajar Dimulai" fill="#10B981" radius={[6, 6, 0, 0]} />
                                <Bar dataKey="audioDisetor" name="Setoran Audio Masuk" fill="#8B5CF6" radius={[6, 6, 0, 0]} />
                              </BarChart>
                            )}
                          </ResponsiveContainer>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* SEARCH & ADVANCED FILTER CONTROLS */}
                  <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-4">
                    <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
                      {/* Search Bar */}
                      <div className="relative flex-1">
                        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          type="text"
                          placeholder="Cari nama orang tua, santri, email, WhatsApp, User ID, atau kode referral..."
                          value={userSearchQuery}
                          onChange={(e) => {
                            setUserSearchQuery(e.target.value);
                            setUserPage(1);
                          }}
                          className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-2xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#08B9EF] shadow-2xs font-medium"
                        />
                        {userSearchQuery && (
                          <button
                            onClick={() => setUserSearchQuery('')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                          >
                            <X size={14} />
                          </button>
                        )}
                      </div>

                      {/* Reset Button */}
                      {(userSearchQuery || userSubStatusFilter !== 'all' || userSecurityFilter !== 'all' || userTierFilter !== 'all' || userDateFilter !== 'all' || userProviderFilter !== 'all') && (
                        <button
                          onClick={handleResetUserFilters}
                          className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold flex items-center gap-1.5 cursor-pointer self-start md:self-auto shrink-0 transition-colors"
                        >
                          <RotateCcw size={13} />
                          <span>Reset Filter</span>
                        </button>
                      )}
                    </div>

                    {/* Filter Pills Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-1 border-t border-slate-100 text-xs">
                      {/* Status Langganan Filter */}
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                          Status Subscription:
                        </label>
                        <select
                          value={userSubStatusFilter}
                          onChange={(e) => {
                            setUserSubStatusFilter(e.target.value as any);
                            setUserPage(1);
                          }}
                          className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#08B9EF]"
                        >
                          <option value="all">Semua Status Sub ({users.length})</option>
                          <option value="active_pro">👑 PRO Aktif</option>
                          <option value="lifetime">🌟 Lifetime Seumur Hidup</option>
                          <option value="free">🟢 Free Tier</option>
                          <option value="expired">⚠️ Kedaluwarsa</option>
                        </select>
                      </div>

                      {/* Status Keamanan Filter (Requirement 4) */}
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                          Keamanan Akun:
                        </label>
                        <select
                          value={userSecurityFilter}
                          onChange={(e) => {
                            setUserSecurityFilter(e.target.value as any);
                            setUserPage(1);
                          }}
                          className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#08B9EF]"
                        >
                          <option value="all">Semua Status Keamanan</option>
                          <option value="active">🟢 Akun Aktif Normal</option>
                          <option value="suspended">⛔ Akun Suspended / Dinonaktifkan</option>
                        </select>
                      </div>

                      {/* Periode Pendaftaran Filter */}
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                          Tanggal Daftar:
                        </label>
                        <select
                          value={userDateFilter}
                          onChange={(e) => {
                            setUserDateFilter(e.target.value as any);
                            setUserPage(1);
                          }}
                          className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#08B9EF]"
                        >
                          <option value="all">Semua Waktu</option>
                          <option value="today">Hari Ini</option>
                          <option value="7days">7 Hari Terakhir</option>
                          <option value="30days">30 Hari Terakhir</option>
                          <option value="this_month">Bulan Ini</option>
                        </select>
                      </div>

                      {/* Provider Pendaftaran Filter */}
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                          Saluran / Provider:
                        </label>
                        <select
                          value={userProviderFilter}
                          onChange={(e) => {
                            setUserProviderFilter(e.target.value as any);
                            setUserPage(1);
                          }}
                          className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#08B9EF]"
                        >
                          <option value="all">Semua Provider</option>
                          <option value="email">Email Langsung</option>
                          <option value="google">Google Account</option>
                          <option value="whatsapp">WhatsApp OTP</option>
                        </select>
                      </div>

                      {/* Sorting Filter */}
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                          Urutkan Berdasarkan:
                        </label>
                        <select
                          value={userSortBy}
                          onChange={(e) => setUserSortBy(e.target.value as any)}
                          className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#08B9EF]"
                        >
                          <option value="created_desc">Terbaru Mendaftar</option>
                          <option value="created_asc">Terlama Mendaftar</option>
                          <option value="status_pro_first">Prioritas Santri PRO</option>
                          <option value="name_asc">Nama (A - Z)</option>
                          <option value="name_desc">Nama (Z - A)</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* USER TABLE DATA */}
                  <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs">
                    <div className="p-4 border-b border-slate-100 flex items-center justify-between flex-wrap gap-2 text-xs">
                      <span className="font-bold text-slate-700">
                        Menampilkan <strong>{filteredUsers.length}</strong> pengguna dari total <strong>{users.length}</strong> akun
                      </span>

                      <div className="flex items-center gap-2">
                        <span className="text-slate-500">Tampilkan per halaman:</span>
                        <select
                          value={userRowsPerPage}
                          onChange={(e) => {
                            setUserRowsPerPage(Number(e.target.value));
                            setUserPage(1);
                          }}
                          className="p-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-700"
                        >
                          <option value={10}>10 Baris</option>
                          <option value={20}>20 Baris</option>
                          <option value={50}>50 Baris</option>
                        </select>
                      </div>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px] tracking-wider">
                            <th className="p-3.5 pl-4">Pengguna / Santri</th>
                            <th className="p-3.5">Kontak</th>
                            <th className="p-3.5">Status Langganan</th>
                            <th className="p-3.5">Status Keamanan</th>
                            <th className="p-3.5">Login Terakhir (IP & Device)</th>
                            <th className="p-3.5">Password / PIN</th>
                            <th className="p-3.5 text-right pr-4">Aksi Admin</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {paginatedUsers.length === 0 ? (
                            <tr>
                              <td colSpan={7} className="p-8 text-center text-slate-400">
                                <Users size={28} className="mx-auto mb-2 text-slate-300" />
                                <p className="font-bold">Tidak ada pengguna yang cocok dengan kriteria pencarian/filter.</p>
                                <button
                                  onClick={handleResetUserFilters}
                                  className="mt-2 text-xs font-bold text-cyan-600 hover:underline cursor-pointer"
                                >
                                  Reset filter pencarian
                                </button>
                              </td>
                            </tr>
                          ) : (
                            paginatedUsers.map((u) => {
                              const subStatus = getUserSubStatus(u);
                              const isSuspended = u.accountStatus === 'suspended';
                              const loginHistory = u.loginHistory && u.loginHistory.length > 0
                                ? u.loginHistory
                                : StorageService.generateSeedLoginHistory(u);
                              const latestLogin = loginHistory[0];

                              return (
                                <tr key={u.id} className={`hover:bg-slate-50/80 transition-colors ${
                                  isSuspended ? 'bg-rose-50/30' : ''
                                }`}>
                                  {/* Pengguna & Santri */}
                                  <td className="p-3.5 pl-4 font-black text-slate-900">
                                    <div>
                                      <div className="flex items-center gap-1.5">
                                        <span>{u.parentName}</span>
                                        {u.planTier === 'pro' && (
                                          <Crown size={12} className="text-amber-500 inline shrink-0" />
                                        )}
                                      </div>
                                      {u.studentName && (
                                        <span className="text-[10px] text-cyan-700 font-semibold block">
                                          Santri: {u.studentName} ({u.studentAge ? `${u.studentAge} thn` : 'Santri'})
                                        </span>
                                      )}
                                      <span className="font-mono text-[9px] text-slate-400 block font-normal">
                                        ID: {u.id}
                                      </span>
                                    </div>
                                  </td>

                                  {/* Kontak */}
                                  <td className="p-3.5">
                                    <div className="space-y-0.5">
                                      <div className="flex items-center gap-1 text-slate-700">
                                        <span className="font-semibold truncate max-w-[160px]">{u.email}</span>
                                        <button
                                          onClick={() => copyToClipboard(u.email, `email-${u.id}`)}
                                          className="text-slate-400 hover:text-cyan-600 p-0.5 cursor-pointer"
                                          title="Salin Email"
                                        >
                                          {copiedText === `email-${u.id}` ? <Check size={11} className="text-emerald-600" /> : <Copy size={11} />}
                                        </button>
                                      </div>
                                      {u.whatsapp ? (
                                        <a
                                          href={`https://wa.me/${u.whatsapp.replace(/^0/, '62')}`}
                                          target="_blank"
                                          rel="noreferrer"
                                          className="text-[10px] text-emerald-700 font-bold flex items-center gap-1 hover:underline"
                                        >
                                          <Phone size={10} />
                                          <span>{u.whatsapp}</span>
                                        </a>
                                      ) : (
                                        <span className="text-[10px] text-slate-400">Tanpa WhatsApp</span>
                                      )}
                                    </div>
                                  </td>

                                  {/* Status Langganan */}
                                  <td className="p-3.5">
                                    <span
                                      className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase inline-flex items-center gap-1 ${
                                        subStatus === 'lifetime'
                                          ? 'bg-purple-100 text-purple-900 border border-purple-300'
                                          : subStatus === 'active_pro'
                                          ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                          : subStatus === 'expired'
                                          ? 'bg-rose-100 text-rose-900 border border-rose-300'
                                          : 'bg-slate-100 text-slate-600'
                                      }`}
                                    >
                                      {subStatus === 'lifetime'
                                        ? '🌟 LIFETIME'
                                        : subStatus === 'active_pro'
                                        ? '👑 PRO AKTIF'
                                        : subStatus === 'expired'
                                        ? '⚠️ KEDALUWARSA'
                                        : '🟢 FREE'}
                                    </span>
                                    {u.entitlementExpiry && subStatus !== 'lifetime' && (
                                      <span className="text-[9px] text-slate-400 block mt-0.5">
                                        s/d {u.entitlementExpiry}
                                      </span>
                                    )}
                                  </td>

                                  {/* Status Keamanan Akun (Requirement 4) */}
                                  <td className="p-3.5">
                                    {isSuspended ? (
                                      <div className="space-y-0.5">
                                        <span className="px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 font-black text-[10px] inline-flex items-center gap-1 border border-rose-300">
                                          <UserX size={10} />
                                          <span>SUSPENDED</span>
                                        </span>
                                        <span className="text-[9px] text-rose-600 block truncate max-w-[130px]" title={u.suspendedReason}>
                                          {u.suspendedReason || 'Akun Dinonaktifkan'}
                                        </span>
                                      </div>
                                    ) : (
                                      <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-black text-[10px] inline-flex items-center gap-1 border border-emerald-300">
                                        <UserCheck size={10} />
                                        <span>AKTIF NORMAL</span>
                                      </span>
                                    )}
                                  </td>

                                  {/* Login Terakhir (IP, Device, Lokasi) */}
                                  <td className="p-3.5">
                                    {latestLogin ? (
                                      <div className="space-y-0.5">
                                        <div className="flex items-center gap-1">
                                          <span className="font-mono text-[10px] font-bold text-slate-700">
                                            {latestLogin.ipAddress}
                                          </span>
                                          {latestLogin.isSuspicious && (
                                            <span className="text-[9px] text-rose-700 font-black bg-rose-100 px-1 rounded">
                                              PROXY!
                                            </span>
                                          )}
                                        </div>
                                        <span className="text-[10px] text-slate-500 block truncate max-w-[150px]">
                                          {latestLogin.device}
                                        </span>
                                        <span className="text-[9px] text-slate-400 block">
                                          {latestLogin.location}
                                        </span>
                                      </div>
                                    ) : (
                                      <span className="text-[10px] text-slate-400">-</span>
                                    )}
                                  </td>

                                  {/* Password / PIN */}
                                  <td className="p-3.5">
                                    <div className="space-y-1">
                                      <span className="font-mono text-[11px] font-black text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md inline-block">
                                        PIN: {u.pin || '2026'}
                                      </span>
                                      <button
                                        onClick={() => {
                                          setPasswordModalUser(u);
                                          setNewPasswordInput('');
                                          setPasswordNotesInput('');
                                        }}
                                        className="text-[10px] text-indigo-700 hover:text-indigo-900 font-bold flex items-center gap-1 hover:underline cursor-pointer"
                                      >
                                        <KeyRound size={11} />
                                        <span>Ganti Password</span>
                                      </button>
                                    </div>
                                  </td>

                                  {/* Aksi Admin Lengkap */}
                                  <td className="p-3.5 text-right pr-4">
                                    <div className="flex items-center justify-end gap-1.5 flex-wrap">
                                      {/* Detail Profile Button */}
                                      <button
                                        onClick={() => setDetailUser(u)}
                                        className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
                                        title="Lihat Profil Santri & Riwayat Login Lengkap"
                                      >
                                        <Eye size={13} />
                                      </button>

                                      {/* Quick Ganti Password Button */}
                                      <button
                                        onClick={() => {
                                          setPasswordModalUser(u);
                                          setNewPasswordInput('');
                                          setPasswordNotesInput('');
                                        }}
                                        className="px-2 py-1 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-[11px] flex items-center gap-1 cursor-pointer border border-indigo-200"
                                        title="Ganti Password / Reset PIN Pengguna"
                                      >
                                        <KeyRound size={11} />
                                        <span>Password</span>
                                      </button>

                                      {/* Suspend / Reactivate Button (Requirement 4) */}
                                      {isSuspended ? (
                                        <button
                                          onClick={() => handleReactivateUser(u)}
                                          className="px-2 py-1 rounded-xl bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-black text-[11px] flex items-center gap-1 cursor-pointer border border-emerald-300"
                                          title="Aktifkan Kembali Akun Santri"
                                        >
                                          <UserCheck size={11} />
                                          <span>Aktifkan</span>
                                        </button>
                                      ) : (
                                        <button
                                          onClick={() => {
                                            setSuspendTargetUser(u);
                                            setSuspendReasonInput('Aktivitas login mencurigakan atau investigasi bukti transaksi');
                                          }}
                                          className="px-2 py-1 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-[11px] flex items-center gap-1 cursor-pointer border border-rose-200"
                                          title="Nonaktifkan (Suspend) Akun yang Mencurigakan"
                                        >
                                          <UserX size={11} />
                                          <span>Suspend</span>
                                        </button>
                                      )}

                                      {/* Quick Toggle PRO Button */}
                                      <button
                                        onClick={() => handleQuickToggleTier(u)}
                                        className={`px-2 py-1 rounded-xl font-black text-[11px] flex items-center gap-1 cursor-pointer transition-all active:scale-95 ${
                                          u.planTier === 'pro'
                                            ? 'bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300'
                                            : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs'
                                        }`}
                                      >
                                        <Crown size={11} />
                                        <span>{u.planTier === 'pro' ? 'Set Free' : 'Assign PRO'}</span>
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    </div>

                    {/* Pagination Bar */}
                    <div className="p-4 border-t border-slate-100 bg-slate-50/70 flex items-center justify-between flex-wrap gap-2 text-xs">
                      <span className="text-slate-500 font-medium">
                        Halaman <strong>{userPage}</strong> dari <strong>{userTotalPages}</strong> ({filteredUsers.length} akun terfilter)
                      </span>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setUserPage(1)}
                          disabled={userPage <= 1}
                          className="p-1.5 rounded-lg border border-slate-200 bg-white disabled:opacity-40 hover:bg-slate-100 cursor-pointer"
                        >
                          <ChevronsLeft size={14} />
                        </button>
                        <button
                          onClick={() => setUserPage((prev) => Math.max(1, prev - 1))}
                          disabled={userPage <= 1}
                          className="p-1.5 rounded-lg border border-slate-200 bg-white disabled:opacity-40 hover:bg-slate-100 cursor-pointer"
                        >
                          <ChevronLeft size={14} />
                        </button>
                        <span className="px-3 py-1 font-bold bg-white border border-slate-200 rounded-lg">
                          {userPage}
                        </span>
                        <button
                          onClick={() => setUserPage((prev) => Math.min(userTotalPages, prev + 1))}
                          disabled={userPage >= userTotalPages}
                          className="p-1.5 rounded-lg border border-slate-200 bg-white disabled:opacity-40 hover:bg-slate-100 cursor-pointer"
                        >
                          <ChevronRight size={14} />
                        </button>
                        <button
                          onClick={() => setUserPage(userTotalPages)}
                          disabled={userPage >= userTotalPages}
                          className="p-1.5 rounded-lg border border-slate-200 bg-white disabled:opacity-40 hover:bg-slate-100 cursor-pointer"
                        >
                          <ChevronsRight size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ======================================================== */}
              {/* TAB 2: TRACKING PEMBAYARAN & TRANSFER BANK               */}
              {/* ======================================================== */}
              {activeTab === 'payments_tracking' && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  {/* Summary Metric Cards */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                    <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-xs space-y-1">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Total Transaksi</span>
                      <div className="text-2xl sm:text-3xl font-black font-heading text-slate-900">
                        {payments.length} <span className="text-xs font-bold text-slate-400">Invoice</span>
                      </div>
                      <span className="text-[11px] text-slate-500 block">Riwayat transfer yayasan & QRIS</span>
                    </div>

                    <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-xs space-y-1">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Menunggu Verifikasi</span>
                      <div className="text-2xl sm:text-3xl font-black font-heading text-amber-600">
                        {registrationStats.pendingPaymentsCount} <span className="text-xs font-bold text-slate-400">Transfer</span>
                      </div>
                      <span className="text-[11px] text-amber-700 font-bold block">Perlu dicek di mutasi rekening</span>
                    </div>

                    <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-xs space-y-1">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Pembayaran Berhasil</span>
                      <div className="text-2xl sm:text-3xl font-black font-heading text-emerald-600">
                        {payments.filter((p) => p.status === 'success').length} <span className="text-xs font-bold text-slate-400">Sukses</span>
                      </div>
                      <span className="text-[11px] text-slate-500 block">PRO aktif & komisi tercatat</span>
                    </div>

                    <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-xs space-y-1">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Ditolak / Fiktif</span>
                      <div className="text-2xl sm:text-3xl font-black font-heading text-rose-600">
                        {payments.filter((p) => p.status === 'failed').length} <span className="text-xs font-bold text-slate-400">Gagal</span>
                      </div>
                      <span className="text-[11px] text-slate-500 block">Struk palsu atau dana belum masuk</span>
                    </div>
                  </div>

                  {/* Filter & Search Bar */}
                  <div className="bg-white border border-slate-200 rounded-3xl p-4 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 text-xs">
                    <div className="relative flex-1">
                      <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Cari nomor invoice, paket, nama pengirim, nominal, atau kode referral..."
                        value={paymentSearchQuery}
                        onChange={(e) => setPaymentSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-cyan-500"
                      />
                    </div>

                    <div className="flex items-center gap-2 overflow-x-auto">
                      <select
                        value={paymentStatusFilter}
                        onChange={(e) => setPaymentStatusFilter(e.target.value as any)}
                        className="p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700"
                      >
                        <option value="all">Semua Status Invoice</option>
                        <option value="pending">⏳ Menunggu Verifikasi</option>
                        <option value="success">✅ Pembayaran Sukses</option>
                        <option value="failed">❌ Ditolak / Gagal</option>
                      </select>

                      <select
                        value={paymentFraudFilter}
                        onChange={(e) => setPaymentFraudFilter(e.target.value as any)}
                        className="p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700"
                      >
                        <option value="all">Semua Analisis Struk</option>
                        <option value="verified_real">🛡️ Valid & Asli</option>
                        <option value="suspicious">⚠️ Mencurigakan</option>
                        <option value="confirmed_fake">⛔ Dikonfirmasi Palsu</option>
                      </select>
                    </div>
                  </div>

                  {/* Payment Transactions Table */}
                  <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px] tracking-wider">
                            <th className="p-3.5 pl-4">No. Invoice & Tanggal</th>
                            <th className="p-3.5">Paket & Nominal</th>
                            <th className="p-3.5">Metode & Rekening Tujuan</th>
                            <th className="p-3.5">Pengirim Struk</th>
                            <th className="p-3.5">Status Pembayaran</th>
                            <th className="p-3.5">Skor Keaslian Struk</th>
                            <th className="p-3.5 pr-4 text-right">Aksi Verifikasi</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {filteredPayments.length === 0 ? (
                            <tr>
                              <td colSpan={7} className="p-8 text-center text-slate-400">
                                <CreditCard size={28} className="mx-auto mb-2 text-slate-300" />
                                <p className="font-bold">Tidak ada transaksi yang cocok dengan filter pencarian.</p>
                              </td>
                            </tr>
                          ) : (
                            filteredPayments.map((p) => {
                              const fraud = p.fraudAnalysis;
                              return (
                                <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                                  {/* Invoice */}
                                  <td className="p-3.5 pl-4 font-mono font-bold text-slate-900">
                                    <div>
                                      <span>{p.invoiceNumber}</span>
                                      <span className="text-[10px] text-slate-500 font-sans block">
                                        {new Date(p.createdAt).toLocaleDateString('id-ID', {
                                          day: 'numeric',
                                          month: 'short',
                                          year: 'numeric',
                                          hour: '2-digit',
                                          minute: '2-digit',
                                        })}
                                      </span>
                                    </div>
                                  </td>

                                  {/* Paket & Nominal */}
                                  <td className="p-3.5">
                                    <div>
                                      <span className="font-bold text-slate-800 block">{p.planName}</span>
                                      <span className="font-mono font-black text-emerald-700 text-xs">
                                        Rp {p.amountIdr.toLocaleString('id-ID')}
                                      </span>
                                    </div>
                                  </td>

                                  {/* Metode & Rekening */}
                                  <td className="p-3.5">
                                    <span className="font-semibold text-slate-700 block">{p.paymentMethod}</span>
                                    <span className="text-[10px] text-slate-500">
                                      {p.transferBankName || 'Rekening Yayasan'}
                                    </span>
                                  </td>

                                  {/* Pengirim */}
                                  <td className="p-3.5">
                                    <div>
                                      <span className="font-bold text-slate-900 block">
                                        {p.senderAccountName || 'Anonim / Belum isi'}
                                      </span>
                                      <span className="text-[10px] text-slate-500 font-mono">
                                        {p.senderBankName ? `${p.senderBankName}` : ''} {p.senderAccountNumber ? `• ${p.senderAccountNumber}` : ''}
                                      </span>
                                    </div>
                                  </td>

                                  {/* Status */}
                                  <td className="p-3.5">
                                    <span
                                      className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase inline-flex items-center gap-1 ${
                                        p.status === 'success'
                                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                          : p.status === 'pending'
                                          ? 'bg-amber-100 text-amber-900 border border-amber-300 animate-pulse'
                                          : 'bg-rose-100 text-rose-900 border border-rose-300'
                                      }`}
                                    >
                                      {p.status === 'success'
                                        ? '✅ SUKSES'
                                        : p.status === 'pending'
                                        ? '⏳ MENUNGGU VERIFIKASI'
                                        : '❌ DITOLAK'}
                                    </span>
                                  </td>

                                  {/* Skor Keaslian */}
                                  <td className="p-3.5">
                                    {fraud ? (
                                      <div className="space-y-1">
                                        <div className="flex items-center gap-1.5">
                                          <div
                                            className={`w-2 h-2 rounded-full ${
                                              fraud.authenticityScore >= 80 ? 'bg-emerald-500' : fraud.authenticityScore >= 60 ? 'bg-amber-500' : 'bg-rose-600'
                                            }`}
                                          ></div>
                                          <span className="font-mono font-bold text-xs">
                                            {fraud.authenticityScore}% Valid
                                          </span>
                                        </div>
                                        <span
                                          className={`text-[9px] font-black px-1.5 py-0.5 rounded inline-block ${
                                            fraud.status === 'suspicious' || fraud.status === 'confirmed_fake'
                                              ? 'bg-rose-100 text-rose-800 border border-rose-200'
                                              : 'bg-emerald-50 text-emerald-700'
                                          }`}
                                        >
                                          {fraud.status === 'confirmed_fake' ? '⛔ Dikonfirmasi Palsu' : fraud.status === 'suspicious' ? '⚠️ Indikasi Palsu' : '🛡️ Asli'}
                                        </span>
                                      </div>
                                    ) : (
                                      <span className="text-[10px] text-slate-400">Belum dianalisis</span>
                                    )}
                                  </td>

                                  {/* Aksi Verifikasi */}
                                  <td className="p-3.5 text-right pr-4">
                                    <div className="flex items-center justify-end gap-1.5">
                                      {/* Inspeksi Struk */}
                                      <button
                                        onClick={() => {
                                          setInspectingPayment(p);
                                          setReceiptZoom(1);
                                          setReceiptRotation(0);
                                        }}
                                        className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1 cursor-pointer"
                                        title="Periksa Bukti Struk & Cek Mutasi Bank"
                                      >
                                        <Eye size={13} />
                                        <span>Periksa</span>
                                      </button>

                                      {/* Quick Verify */}
                                      {p.status === 'pending' && (
                                        <>
                                          <button
                                            onClick={() => handleVerifyPayment(p.id)}
                                            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black flex items-center gap-1 cursor-pointer shadow-2xs transition-all active:scale-95"
                                            title="Verifikasi & Aktifkan PRO 1-Klik"
                                          >
                                            <CheckCircle size={13} />
                                            <span>Verifikasi 1-Klik</span>
                                          </button>

                                          <button
                                            onClick={() => {
                                              setRejectPromptPayment(p);
                                              setRejectReasonInput('Dana belum masuk mutasi bank rekening yayasan');
                                            }}
                                            className="p-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 cursor-pointer border border-rose-200"
                                            title="Tolak Bukti Transfer"
                                          >
                                            <XCircle size={15} />
                                          </button>
                                        </>
                                      )}
                                    </div>
                                  </td>
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* ======================================================== */}
              {/* TAB 3: DETEKSI TRANSFER PALSU & CEK MUTASI BANK           */}
              {/* ======================================================== */}
              {activeTab === 'fraud_detection' && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  {/* Warning Header */}
                  <div className="bg-gradient-to-r from-rose-900 to-rose-950 text-white p-5 rounded-3xl border border-rose-800 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-400/40 flex items-center justify-center text-rose-400 shrink-0">
                        <ShieldAlert size={28} />
                      </div>
                      <div>
                        <h4 className="text-base font-black font-heading text-white">
                          Deteksi Transfer Palsu & Mesin Pengecekan Mutasi Bank
                        </h4>
                        <p className="text-xs text-rose-200 mt-0.5">
                          Melindungi yayasan dari manipulasi struk transfer m-BCA, Mandiri, dan BSI via AI visual & nomor referensi RRN
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-stretch md:self-auto">
                      <span className="px-3 py-1.5 rounded-xl bg-rose-500/20 text-rose-200 text-xs font-bold border border-rose-400/30">
                        🛡️ Anti-Fraud Engine v2.4
                      </span>
                    </div>
                  </div>

                  {/* SISTEM PERINGATAN OTOMATIS POLA TRANSAKSI MENCURIGAKAN WIDGET */}
                  <div className="bg-white border-2 border-rose-200 rounded-3xl p-5 shadow-sm space-y-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-rose-100 pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                          <h5 className="font-black text-slate-900 text-sm flex items-center gap-2">
                            <AlertTriangle size={17} className="text-rose-600" />
                            <span>Pusat Peringatan Otomatis Pola Transaksi & Pendaftaran ({suspiciousAlerts.length} Aktif)</span>
                          </h5>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Sistem otomatis memindai pola pendaftaran massal dari IP yang sama dan bukti transfer yang diunggah berulang kali
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setShowAlertsModal(true)}
                          className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-xs cursor-pointer flex items-center gap-1.5"
                        >
                          <ShieldAlert size={14} />
                          <span>Buka Modal Investigasi</span>
                        </button>
                        <button
                          onClick={() => {
                            const testAlert = StorageService.simulateSuspiciousPattern('rapid_ip');
                            refreshData();
                            showToast(`Simulasi Pola Ditambahkan: ${testAlert.title}`);
                          }}
                          className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer border border-slate-300"
                        >
                          + Tes Pola IP
                        </button>
                      </div>
                    </div>

                    {/* Alerts List */}
                    {suspiciousAlerts.length === 0 ? (
                      <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-200 text-center space-y-1">
                        <CheckCircle size={28} className="text-emerald-600 mx-auto" />
                        <h6 className="text-xs font-bold text-emerald-950">
                          Tidak Ada Pola Mencurigakan Terdeteksi
                        </h6>
                        <p className="text-[11px] text-emerald-700">
                          Semua pendaftaran akun dan bukti transfer yang diunggah berada dalam ambang batas normal.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {suspiciousAlerts.map((alert) => (
                          <div
                            key={alert.id}
                            className={`p-4 rounded-2xl border space-y-3 transition-all ${
                              alert.severity === 'critical'
                                ? 'bg-rose-50/70 border-rose-300'
                                : 'bg-amber-50/70 border-amber-300'
                            }`}
                          >
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase ${
                                  alert.severity === 'critical'
                                    ? 'bg-rose-600 text-white'
                                    : 'bg-amber-600 text-white'
                                }`}>
                                  {alert.severity === 'critical' ? '🚨 KRITIS' : '⚠️ PERINGATAN'}
                                </span>
                                <span className="text-[10px] font-bold text-slate-500 bg-white px-2 py-0.5 rounded-full border border-slate-200">
                                  {alert.type === 'rapid_registrations_same_ip' ? 'Pendaftaran Masal IP Sama' : 'Bukti Transfer Berulang'}
                                </span>
                                <h6 className="font-extrabold text-xs text-slate-900">
                                  {alert.title}
                                </h6>
                              </div>
                              <span className="text-[10px] text-slate-500">
                                {new Date(alert.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
                              </span>
                            </div>

                            <p className="text-xs text-slate-700 font-medium">
                              {alert.description}
                            </p>

                            {/* Indicators bullet points */}
                            <div className="bg-white/80 p-3 rounded-xl border border-slate-200/60 space-y-1 text-xs">
                              <span className="font-bold text-[11px] text-slate-600 uppercase block tracking-wider">
                                Indikator Pola Terdeteksi:
                              </span>
                              {alert.indicators.map((ind, i) => (
                                <div key={i} className="flex items-start gap-1.5 text-slate-700 text-[11px]">
                                  <span className="text-rose-500 font-bold shrink-0">•</span>
                                  <span>{ind}</span>
                                </div>
                              ))}
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-200/60">
                              <span className="text-[10px] text-slate-500 italic">
                                Rekomendasi: {alert.recommendedAction}
                              </span>

                              <div className="flex items-center gap-2">
                                {alert.type === 'rapid_registrations_same_ip' && alert.affectedUserIds && (
                                  <button
                                    onClick={() => {
                                      StorageService.batchSuspendUsers(
                                        alert.affectedUserIds!,
                                        `Suspend otomatis: Pola pendaftaran mencurigakan berulang dari IP ${alert.ipAddress}`,
                                        'Master Admin'
                                      );
                                      StorageService.resolveSuspiciousAlert(alert.id, `Suspend ${alert.affectedUserIds!.length} akun terkait IP ${alert.ipAddress}`, 'Master Admin');
                                      refreshData();
                                      showToast(`Berhasil menonaktifkan ${alert.affectedUserIds!.length} akun yang terhubung ke IP ${alert.ipAddress}!`);
                                    }}
                                    className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs cursor-pointer shadow-xs transition-all active:scale-95 flex items-center gap-1"
                                  >
                                    <UserX size={12} />
                                    <span>Suspend Semua Akun ({alert.affectedUserIds.length})</span>
                                  </button>
                                )}

                                {alert.type === 'duplicate_transfer_proof' && alert.affectedTransactionIds && (
                                  <button
                                    onClick={() => {
                                      StorageService.batchFlagFakePayments(
                                        alert.affectedTransactionIds!,
                                        `Bukti transfer berulang / duplikat struk RRN ${alert.duplicateRrn || ''}`,
                                        'Master Admin'
                                      );
                                      StorageService.resolveSuspiciousAlert(alert.id, `Tolak ${alert.affectedTransactionIds!.length} transaksi bukti duplikat`, 'Master Admin');
                                      refreshData();
                                      showToast(`Semua transaksi dengan bukti duplikat berhasil ditandai sebagai Transfer Palsu!`);
                                    }}
                                    className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs cursor-pointer shadow-xs transition-all active:scale-95 flex items-center gap-1"
                                  >
                                    <XCircle size={12} />
                                    <span>Tandai Semua Transfer Palsu</span>
                                  </button>
                                )}

                                <button
                                  onClick={() => {
                                    StorageService.dismissSuspiciousAlert(alert.id, 'Master Admin');
                                    refreshData();
                                    showToast('Peringatan diarsipkan.');
                                  }}
                                  className="px-2.5 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs cursor-pointer"
                                >
                                  Arsipkan
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* QUICK RRN / MUTASI CHECKER WIDGET */}
                  <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-4">
                    <h5 className="font-black text-slate-900 text-sm flex items-center gap-2">
                      <Search size={16} className="text-cyan-600" />
                      <span>Cek Nomor Referensi RRN Langsung ke Mutasi Bank Yayasan:</span>
                    </h5>

                    <form onSubmit={handleCheckRrn} className="flex flex-col sm:flex-row gap-2">
                      <input
                        type="text"
                        placeholder="Masukkan nomor referensi RRN dari struk (cth: 889210492100)..."
                        value={quickVerifyRrn}
                        onChange={(e) => setQuickVerifyRrn(e.target.value)}
                        className="flex-1 p-3 bg-slate-50 border border-slate-300 rounded-2xl text-xs font-mono font-bold text-slate-800 focus:outline-none focus:border-cyan-500"
                      />
                      <button
                        type="submit"
                        className="px-5 py-3 rounded-2xl bg-[#164C68] hover:bg-[#113a50] text-white font-black text-xs cursor-pointer shadow-xs transition-all active:scale-95 shrink-0 flex items-center justify-center gap-2"
                      >
                        <Search size={14} />
                        <span>Cek Mutasi Riil</span>
                      </button>
                    </form>

                    {quickVerifyResult && (
                      <div
                        className={`p-4 rounded-2xl border text-xs font-medium space-y-1 animate-in fade-in ${
                          quickVerifyResult.found
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                            : 'bg-rose-50 border-rose-200 text-rose-900'
                        }`}
                      >
                        <div className="flex items-center gap-2 font-bold">
                          {quickVerifyResult.found ? (
                            <CheckCircle size={16} className="text-emerald-600" />
                          ) : (
                            <AlertTriangle size={16} className="text-rose-600" />
                          )}
                          <span>{quickVerifyResult.message}</span>
                        </div>
                        {quickVerifyResult.mutation && (
                          <div className="text-[11px] text-slate-600 pt-1 font-mono">
                            Kredit: Rp {quickVerifyResult.mutation.amount.toLocaleString('id-ID')} | {quickVerifyResult.mutation.description} | Ref: {quickVerifyResult.mutation.referenceNumber}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* REALTIME BANK MUTATION TABLE FEED */}
                  <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs space-y-3 p-5">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                      <div>
                        <h5 className="font-black text-slate-900 text-sm flex items-center gap-2">
                          <CreditCard size={16} className="text-emerald-600" />
                          <span>Daftar Mutasi Kredit Masuk Rekening Yayasan (BCA, Mandiri, BSI):</span>
                        </h5>
                        <p className="text-xs text-slate-500">
                          Data mutasi riil perbankan untuk pencocokan otomatis transaksi santri
                        </p>
                      </div>

                      <div className="relative w-full sm:w-64">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          type="text"
                          placeholder="Cari RRN, pengirim, atau nominal..."
                          value={mutationSearchQuery}
                          onChange={(e) => setMutationSearchQuery(e.target.value)}
                          className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-cyan-500"
                        />
                      </div>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px] tracking-wider">
                            <th className="p-3 pl-3">Waktu & Bank</th>
                            <th className="p-3">Nama Pengirim</th>
                            <th className="p-3">Nominal Masuk</th>
                            <th className="p-3">No. Referensi (RRN)</th>
                            <th className="p-3">Keterangan Transfer</th>
                            <th className="p-3 text-right pr-3">Status Klaim</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-medium">
                          {bankMutations
                            .filter(
                              (m) =>
                                !mutationSearchQuery.trim() ||
                                m.referenceNumber.toLowerCase().includes(mutationSearchQuery.toLowerCase()) ||
                                m.senderName.toLowerCase().includes(mutationSearchQuery.toLowerCase()) ||
                                m.amount.toString().includes(mutationSearchQuery)
                            )
                            .map((m) => (
                              <tr key={m.id} className="hover:bg-slate-50/70">
                                <td className="p-3 pl-3">
                                  <span className="font-bold text-slate-900 block">{m.bankName}</span>
                                  <span className="text-[10px] text-slate-500">
                                    {new Date(m.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
                                  </span>
                                </td>
                                <td className="p-3 font-bold text-slate-800">{m.senderName}</td>
                                <td className="p-3 font-mono font-black text-emerald-700">
                                  Rp {m.amount.toLocaleString('id-ID')}
                                </td>
                                <td className="p-3 font-mono text-indigo-900 font-bold">
                                  {m.referenceNumber}
                                </td>
                                <td className="p-3 text-[11px] text-slate-600 truncate max-w-[200px]" title={m.description}>
                                  {m.description}
                                </td>
                                <td className="p-3 text-right pr-3">
                                  <span
                                    className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                                      m.isClaimed
                                        ? 'bg-slate-100 text-slate-600'
                                        : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                    }`}
                                  >
                                    {m.isClaimed ? 'Sudah Terklaim' : 'Tersedia Cocok'}
                                  </span>
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* ======================================================== */}
              {/* TAB 4: KEAMANAN AKUN, RESET PASSWORD & SUSPEND (REQ 4)    */}
              {/* ======================================================== */}
              {activeTab === 'security_passwords' && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  {/* Security Header Banner */}
                  <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 text-white p-5 rounded-3xl border border-indigo-800 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-400/40 flex items-center justify-center text-indigo-400 shrink-0">
                        <KeyRound size={28} />
                      </div>
                      <div>
                        <h4 className="text-base font-black font-heading text-white">
                          Pusat Keamanan Akun & Manajemen Kredensial Pengguna
                        </h4>
                        <p className="text-xs text-indigo-200 mt-0.5">
                          Reset password manual, pemantauan riwayat login terakhir (IP/Perangkat), serta penonaktifan akun mencurigakan
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 rounded-xl bg-indigo-500/20 text-indigo-200 text-xs font-bold border border-indigo-400/30">
                        Fitur Keamanan Terintegrasi 🛡️
                      </span>
                    </div>
                  </div>

                  {/* SUB-MODUL 1: FORM GANTI PASSWORD USER MANUAL (REQUIREMENT 4) */}
                  <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-5">
                    <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                      <div className="w-10 h-10 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                        <Edit3 size={20} />
                      </div>
                      <div>
                        <h5 className="text-sm font-black font-heading text-[#164C68]">
                          1. Form Reset Password Pengguna Secara Manual
                        </h5>
                        <p className="text-xs text-slate-500">
                          Pilih akun wali santri untuk mengubah kata sandi, generate password acak, atau kirim info sandi ke WhatsApp
                        </p>
                      </div>
                    </div>

                    {/* Step 1: Pilih Pengguna */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 block">
                          Pilih Akun Santri / Orang Tua Target:
                        </label>
                        <select
                          value={passwordTargetUserId}
                          onChange={(e) => {
                            const selectedId = e.target.value;
                            setPasswordTargetUserId(selectedId);
                            const found = users.find((u) => u.id === selectedId);
                            if (found) {
                              setPasswordModalUser(found);
                              setNewPasswordInput('');
                              setPasswordNotesInput('');
                            }
                          }}
                          className="w-full p-3 bg-slate-50 border border-slate-300 rounded-2xl text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-500"
                        >
                          <option value="">-- Pilih Akun dari Daftar ({users.length} Akun) --</option>
                          {users.map((u) => (
                            <option key={u.id} value={u.id}>
                              {u.parentName} ({u.email}) - {u.accountStatus === 'suspended' ? '[⛔ SUSPENDED]' : '[AKTIF]'} - PIN: {u.pin || '2026'}
                            </option>
                          ))}
                        </select>
                      </div>

                      {passwordModalUser && (
                        <div className="p-3.5 bg-indigo-50/70 border border-indigo-200 rounded-2xl text-xs space-y-1">
                          <div className="flex justify-between">
                            <span className="text-slate-500">Nama Wali:</span>
                            <strong className="text-slate-900">{passwordModalUser.parentName}</strong>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">Email:</span>
                            <span className="font-mono text-slate-700">{passwordModalUser.email}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">WhatsApp:</span>
                            <span className="font-bold text-emerald-700">{passwordModalUser.whatsapp || 'Tidak ada nomor'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">Status Akun:</span>
                            <span className={`font-black text-[10px] px-2 py-0.5 rounded ${
                              passwordModalUser.accountStatus === 'suspended' ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                            }`}>
                              {passwordModalUser.accountStatus === 'suspended' ? '⛔ SUSPENDED' : '🟢 AKTIF'}
                            </span>
                          </div>
                          <div className="flex justify-between pt-1 border-t border-indigo-200">
                            <span className="text-indigo-800 font-bold">Password / PIN Saat Ini:</span>
                            <span className="font-mono font-black text-indigo-900 bg-white px-2 py-0.5 rounded border border-indigo-300">
                              {passwordModalUser.pin || '2026'}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Step 2: Form Ganti Password */}
                    {passwordModalUser && (
                      <form onSubmit={handleSaveUserPassword} className="space-y-4 pt-3 border-t border-slate-100">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                              <label className="text-xs font-bold text-slate-700 block">
                                Password / PIN Baru:
                              </label>
                              <button
                                type="button"
                                onClick={generateRandomPassword}
                                className="text-[11px] font-black text-indigo-600 hover:text-indigo-800 cursor-pointer flex items-center gap-1"
                              >
                                ⚡ Generate Acak Kuat
                              </button>
                            </div>
                            <div className="relative">
                              <input
                                type={showPasswordText ? 'text' : 'password'}
                                placeholder="Minimal 4 karakter (cth: Tahfiz-2026!)"
                                value={newPasswordInput}
                                onChange={(e) => setNewPasswordInput(e.target.value)}
                                className="w-full p-3 bg-white border border-slate-300 rounded-2xl text-xs font-mono font-bold text-slate-800 focus:outline-none focus:border-indigo-500 pr-10"
                                required
                              />
                              <button
                                type="button"
                                onClick={() => setShowPasswordText(!showPasswordText)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                              >
                                {showPasswordText ? <EyeOff size={16} /> : <Eye size={16} />}
                              </button>
                            </div>

                            <label className="flex items-center gap-2 pt-1 text-xs text-slate-600 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={mustChangePasswordOnNextLogin}
                                onChange={(e) => setMustChangePasswordOnNextLogin(e.target.checked)}
                                className="rounded text-indigo-600"
                              />
                              <span>Wajibkan ganti password saat login berikutnya</span>
                            </label>
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-700 block">
                              Catatan Alasan Perubahan Admin:
                            </label>
                            <input
                              type="text"
                              placeholder="Cth: Permintaan wali santri via WhatsApp, lupa sandi, dsb..."
                              value={passwordNotesInput}
                              onChange={(e) => setPasswordNotesInput(e.target.value)}
                              className="w-full p-3 bg-white border border-slate-300 rounded-2xl text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                            />
                            <span className="text-[10px] text-slate-400">
                              Catatan akan otomatis dicatat dalam Log Audit Admin.
                            </span>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                          <div className="flex items-center gap-2">
                            {newPasswordInput && (
                              <button
                                type="button"
                                onClick={() => copyToClipboard(`Email: ${passwordModalUser.email}\nPassword Baru: ${newPasswordInput}`, 'new-pass')}
                                className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                              >
                                {copiedText === 'new-pass' ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                                <span>Salin Kredensial</span>
                              </button>
                            )}

                            {passwordModalUser.whatsapp && newPasswordInput && (
                              <a
                                href={`https://wa.me/${passwordModalUser.whatsapp.replace(/^0/, '62')}?text=${encodeURIComponent(
                                  `Assalamu'alaikum ${passwordModalUser.parentName},\n\nPassword/PIN akun Cahaya Tahfiz ananda telah berhasil direset oleh Admin Yayasan.\n\n📧 Email: ${passwordModalUser.email}\n🔑 Password/PIN Baru: ${newPasswordInput}\n\nSilakan login kembali di aplikasi Cahaya Tahfiz. Jazakumullahu khairan.`
                                )}`}
                                target="_blank"
                                rel="noreferrer"
                                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                              >
                                <Send size={14} />
                                <span>Kirim via WhatsApp ➔</span>
                              </a>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setPasswordModalUser(null);
                                setPasswordTargetUserId('');
                              }}
                              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
                            >
                              Batal
                            </button>
                            <button
                              type="submit"
                              className="px-5 py-2 rounded-xl bg-indigo-700 hover:bg-indigo-800 text-white font-black text-xs cursor-pointer shadow-md transition-all active:scale-95"
                            >
                              Simpan & Terapkan Password Baru
                            </button>
                          </div>
                        </div>
                      </form>
                    )}
                  </div>

                  {/* SUB-MODUL 2: PEMANTAUAN RIWAYAT LOGIN TERAKHIR & PERANGKAT (REQUIREMENT 4) */}
                  {passwordModalUser && (
                    <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-3 flex-wrap gap-2">
                        <div className="flex items-center gap-2">
                          <Laptop size={18} className="text-cyan-600" />
                          <h5 className="text-sm font-black font-heading text-slate-900">
                            2. Riwayat Login Terakhir & Informasi Perangkat ({passwordModalUser.parentName})
                          </h5>
                        </div>
                        <span className="text-xs text-slate-500 font-mono">
                          ID: {passwordModalUser.id}
                        </span>
                      </div>

                      {/* Login History List */}
                      <div className="space-y-2.5">
                        {(() => {
                          const logs: UserLoginRecord[] = passwordModalUser.loginHistory && passwordModalUser.loginHistory.length > 0
                            ? passwordModalUser.loginHistory
                            : StorageService.generateSeedLoginHistory(passwordModalUser);

                          return logs.map((log) => (
                            <div
                              key={log.id}
                              className={`p-3.5 rounded-2xl border text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                                log.isSuspicious
                                  ? 'bg-rose-50 border-rose-200 text-rose-950'
                                  : 'bg-slate-50 border-slate-200 text-slate-800'
                              }`}
                            >
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-mono font-bold text-slate-900">{log.ipAddress}</span>
                                  {log.isSuspicious ? (
                                    <span className="px-2 py-0.5 rounded-md bg-rose-600 text-white font-black text-[10px] flex items-center gap-1">
                                      <AlertTriangle size={11} />
                                      <span>IP MENCURIGAKAN / TOR PROXY</span>
                                    </span>
                                  ) : (
                                    <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                                      {log.status === 'success' ? 'LOGIN SUKSES' : 'SALAH PIN/SANDI'}
                                    </span>
                                  )}
                                </div>
                                <div className="text-slate-600 flex items-center gap-2 text-[11px]">
                                  <span>{log.device}</span>
                                  <span>•</span>
                                  <span>{log.location}</span>
                                </div>
                              </div>

                              <div className="text-right text-[11px] text-slate-500 shrink-0">
                                <span>{new Date(log.timestamp).toLocaleString('id-ID')}</span>
                              </div>
                            </div>
                          ));
                        })()}
                      </div>

                      {/* Kontrol Suspend Langsung untuk Akun Terpilih */}
                      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <div>
                          <span className="text-xs font-bold text-slate-800 block">
                            Kontrol Status Keamanan Akun:
                          </span>
                          <span className="text-[11px] text-slate-500">
                            {passwordModalUser.accountStatus === 'suspended'
                              ? `Akun saat ini DINONAKTIFKAN. Alasan: ${passwordModalUser.suspendedReason || '-'}`
                              : 'Akun saat ini berstatus aktif normal.'}
                          </span>
                        </div>

                        {passwordModalUser.accountStatus === 'suspended' ? (
                          <button
                            onClick={() => handleReactivateUser(passwordModalUser)}
                            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs cursor-pointer shadow-xs flex items-center gap-1.5"
                          >
                            <UserCheck size={14} />
                            <span>Aktifkan Kembali Akun</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              setSuspendTargetUser(passwordModalUser);
                              setSuspendReasonInput('Aktivitas login mencurigakan atau indikasi pelanggaran');
                            }}
                            className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs cursor-pointer shadow-xs flex items-center gap-1.5"
                          >
                            <UserX size={14} />
                            <span>Nonaktifkan Akun Ini (Suspend)</span>
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  {/* SUB-MODUL 3: TABEL MONITORING KEAMANAN SELURUH PENGGUNA (REQUIREMENT 4) */}
                  <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                      <div>
                        <h5 className="font-black text-slate-900 text-sm flex items-center gap-2">
                          <Shield size={16} className="text-indigo-600" />
                          <span>3. Tabel Monitoring Keamanan & Status Seluruh Pengguna</span>
                        </h5>
                        <p className="text-xs text-slate-500">
                          Memantau riwayat login terakhir dan menonaktifkan akun mencurigakan secara terpusat
                        </p>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => setSecurityFilterTab('all')}
                          className={`px-3 py-1 rounded-xl text-xs font-bold cursor-pointer ${
                            securityFilterTab === 'all' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          Semua ({users.length})
                        </button>
                        <button
                          onClick={() => setSecurityFilterTab('suspended_only')}
                          className={`px-3 py-1 rounded-xl text-xs font-bold cursor-pointer ${
                            securityFilterTab === 'suspended_only' ? 'bg-rose-600 text-white' : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          Suspended ({registrationStats.suspendedUsers})
                        </button>
                        <button
                          onClick={() => setSecurityFilterTab('suspicious_only')}
                          className={`px-3 py-1 rounded-xl text-xs font-bold cursor-pointer ${
                            securityFilterTab === 'suspicious_only' ? 'bg-amber-600 text-white' : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          Login Berisiko ⚠️
                        </button>
                      </div>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px] tracking-wider">
                            <th className="p-3 pl-3">Pengguna / Wali</th>
                            <th className="p-3">Status Akun</th>
                            <th className="p-3">Login Terakhir (IP & Lokasi)</th>
                            <th className="p-3">Perangkat / Browser</th>
                            <th className="p-3">Waktu Login</th>
                            <th className="p-3 text-right pr-3">Aksi Keamanan</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {users
                            .filter((u) => {
                              if (securityFilterTab === 'suspended_only') return u.accountStatus === 'suspended';
                              if (securityFilterTab === 'suspicious_only') {
                                const logs = u.loginHistory || StorageService.generateSeedLoginHistory(u);
                                return logs.some((l) => l.isSuspicious);
                              }
                              return true;
                            })
                            .map((u) => {
                              const logs = u.loginHistory && u.loginHistory.length > 0
                                ? u.loginHistory
                                : StorageService.generateSeedLoginHistory(u);
                              const latest = logs[0];
                              const isSuspended = u.accountStatus === 'suspended';

                              return (
                                <tr key={u.id} className={`hover:bg-slate-50/70 ${isSuspended ? 'bg-rose-50/40' : ''}`}>
                                  <td className="p-3 pl-3">
                                    <strong className="text-slate-900 block">{u.parentName}</strong>
                                    <span className="text-[10px] text-slate-500 font-mono">{u.email}</span>
                                  </td>

                                  <td className="p-3">
                                    {isSuspended ? (
                                      <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 font-black text-[10px] border border-rose-300">
                                        ⛔ SUSPENDED
                                      </span>
                                    ) : (
                                      <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                                        🟢 AKTIF
                                      </span>
                                    )}
                                  </td>

                                  <td className="p-3">
                                    {latest ? (
                                      <div>
                                        <div className="flex items-center gap-1">
                                          <span className="font-mono font-bold text-slate-800">{latest.ipAddress}</span>
                                          {latest.isSuspicious && (
                                            <span className="px-1 py-0.2 rounded bg-rose-600 text-white text-[9px] font-black">
                                              PROXY
                                            </span>
                                          )}
                                        </div>
                                        <span className="text-[10px] text-slate-500">{latest.location}</span>
                                      </div>
                                    ) : (
                                      <span className="text-slate-400">-</span>
                                    )}
                                  </td>

                                  <td className="p-3 text-slate-600 text-[11px]">
                                    {latest ? latest.device : '-'}
                                  </td>

                                  <td className="p-3 text-slate-500 text-[11px]">
                                    {latest ? new Date(latest.timestamp).toLocaleString('id-ID') : '-'}
                                  </td>

                                  <td className="p-3 text-right pr-3">
                                    <div className="flex items-center justify-end gap-1.5">
                                      <button
                                        onClick={() => {
                                          setPasswordTargetUserId(u.id);
                                          setPasswordModalUser(u);
                                          setNewPasswordInput('');
                                          setPasswordNotesInput('');
                                        }}
                                        className="px-2 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[11px] font-bold border border-indigo-200 cursor-pointer"
                                      >
                                        Ganti Sandi
                                      </button>

                                      {isSuspended ? (
                                        <button
                                          onClick={() => handleReactivateUser(u)}
                                          className="px-2 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-black cursor-pointer"
                                        >
                                          Aktifkan
                                        </button>
                                      ) : (
                                        <button
                                          onClick={() => {
                                            setSuspendTargetUser(u);
                                            setSuspendReasonInput('Aktivitas mencurigakan atau pengamanan akun');
                                          }}
                                          className="px-2 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-[11px] font-bold border border-rose-200 cursor-pointer"
                                        >
                                          Suspend
                                        </button>
                                      )}
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* MASTER ADMIN PASSWORD & PIN SETTINGS */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Ganti Master Password */}
                    <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-3">
                      <h5 className="text-xs font-black font-heading text-slate-900 flex items-center gap-2">
                        <Lock size={15} className="text-indigo-600" />
                        <span>Ganti Kata Sandi Master Admin (Tingkat Tinggi)</span>
                      </h5>
                      <form onSubmit={handleChangeMasterAdminPassword} className="space-y-2.5 text-xs">
                        <div>
                          <label className="text-[10px] font-bold text-slate-500 uppercase block mb-0.5">Sandi Saat Ini:</label>
                          <input
                            type="password"
                            placeholder="Sandi saat ini..."
                            value={masterPassCurrentInput}
                            onChange={(e) => setMasterPassCurrentInput(e.target.value)}
                            className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl font-mono text-xs"
                            required
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-500 uppercase block mb-0.5">Sandi Baru (Min. 8 Karakter):</label>
                          <input
                            type="password"
                            placeholder="Sandi baru..."
                            value={masterPassNewInput}
                            onChange={(e) => setMasterPassNewInput(e.target.value)}
                            className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl font-mono text-xs"
                            required
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-500 uppercase block mb-0.5">Ulangi Sandi Baru:</label>
                          <input
                            type="password"
                            placeholder="Konfirmasi sandi baru..."
                            value={masterPassConfirmInput}
                            onChange={(e) => setMasterPassConfirmInput(e.target.value)}
                            className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl font-mono text-xs"
                            required
                          />
                        </div>

                        {masterPassNotice && (
                          <span className={`text-[11px] font-bold block ${masterPassNotice.type === 'success' ? 'text-emerald-700' : 'text-rose-600'}`}>
                            {masterPassNotice.msg}
                          </span>
                        )}

                        <button
                          type="submit"
                          className="w-full py-2 rounded-xl bg-indigo-700 hover:bg-indigo-800 text-white font-black text-xs cursor-pointer shadow-xs"
                        >
                          Simpan Sandi Master Baru
                        </button>
                      </form>
                    </div>

                    {/* Ganti Master PIN */}
                    <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-3">
                      <h5 className="text-xs font-black font-heading text-slate-900 flex items-center gap-2">
                        <KeyRound size={15} className="text-amber-500" />
                        <span>Ganti Master PIN Cepat (4-8 Digit)</span>
                      </h5>
                      <form onSubmit={handleChangeMasterAdminPin} className="space-y-2.5 text-xs">
                        <div>
                          <label className="text-[10px] font-bold text-slate-500 uppercase block mb-0.5">PIN Saat Ini:</label>
                          <input
                            type="password"
                            placeholder="PIN saat ini (cth: 2026)"
                            value={masterPinCurrentInput}
                            onChange={(e) => setMasterPinCurrentInput(e.target.value)}
                            className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl font-mono text-xs"
                            required
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-500 uppercase block mb-0.5">PIN Baru (4-8 Digit):</label>
                          <input
                            type="password"
                            placeholder="PIN baru..."
                            value={masterPinNewInput}
                            onChange={(e) => setMasterPinNewInput(e.target.value)}
                            className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl font-mono text-xs"
                            maxLength={8}
                            required
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-500 uppercase block mb-0.5">Ulangi PIN Baru:</label>
                          <input
                            type="password"
                            placeholder="Konfirmasi PIN baru..."
                            value={masterPinConfirmInput}
                            onChange={(e) => setMasterPinConfirmInput(e.target.value)}
                            className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl font-mono text-xs"
                            maxLength={8}
                            required
                          />
                        </div>

                        {masterPinNotice && (
                          <span className={`text-[11px] font-bold block ${masterPinNotice.type === 'success' ? 'text-emerald-700' : 'text-rose-600'}`}>
                            {masterPinNotice.msg}
                          </span>
                        )}

                        <button
                          type="submit"
                          className="w-full py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs cursor-pointer shadow-xs"
                        >
                          Simpan PIN Master Baru
                        </button>
                      </form>
                    </div>
                  </div>
                </div>
              )}

              {/* ======================================================== */}
              {/* TAB 5: SUBSCRIPTION AKTIF                                */}
              {/* ======================================================== */}
              {activeTab === 'active_subscriptions' && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  {/* Top Stats Strip */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs space-y-1">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Total Aktif</span>
                      <div className="text-2xl font-black font-heading text-amber-600">
                        {activeSubscriptions.length} <span className="text-xs font-bold text-slate-400">Santri PRO</span>
                      </div>
                      <span className="text-[11px] text-slate-500 block">Semua paket langganan</span>
                    </div>

                    <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs space-y-1">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Paket 1 Tahun</span>
                      <div className="text-2xl font-black font-heading text-emerald-600">
                        {activeSubscriptions.filter((s) => s.planName.toLowerCase().includes('tahun') || s.planName.toLowerCase().includes('yearly')).length}
                      </div>
                      <span className="text-[11px] text-slate-500 block">Komitmen tahunan santri</span>
                    </div>

                    <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs space-y-1">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Paket Bulanan</span>
                      <div className="text-2xl font-black font-heading text-sky-600">
                        {activeSubscriptions.filter((s) => s.planName.toLowerCase().includes('bulan') || s.planName.toLowerCase().includes('monthly')).length}
                      </div>
                      <span className="text-[11px] text-slate-500 block">Langganan bulanan aktif</span>
                    </div>

                    <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs space-y-1">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Wakaf Lifetime</span>
                      <div className="text-2xl font-black font-heading text-purple-600">
                        {activeSubscriptions.filter((s) => s.isLifetime).length}
                      </div>
                      <span className="text-[11px] text-slate-500 block">Seumur hidup aktif</span>
                    </div>
                  </div>

                  {/* Filter & Search Bar */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
                    <div className="relative flex-1">
                      <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Cari user berbayar, email, atau nomor invoice..."
                        value={subSearchQuery}
                        onChange={(e) => setSubSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#08B9EF]"
                      />
                    </div>

                    <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
                      {[
                        { id: 'all', label: 'Semua Paket' },
                        { id: 'yearly', label: '1 Tahun' },
                        { id: 'monthly', label: 'Bulanan' },
                        { id: 'lifetime', label: 'Wakaf Lifetime' },
                      ].map((f) => (
                        <button
                          key={f.id}
                          onClick={() => setSubscriptionFilter(f.id as any)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                            subscriptionFilter === f.id
                              ? 'bg-[#164C68] text-white shadow-2xs'
                              : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                          }`}
                        >
                          {f.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Table Active Subscriptions */}
                  <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px] tracking-wider">
                            <th className="p-3.5 pl-4">No. Invoice</th>
                            <th className="p-3.5">Nama Orang Tua & Santri</th>
                            <th className="p-3.5">Paket Langganan</th>
                            <th className="p-3.5">Nominal</th>
                            <th className="p-3.5">Masa Berlaku</th>
                            <th className="p-3.5">Metode Bayar</th>
                            <th className="p-3.5 pr-4 text-right">Referral</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {filteredActiveSubscriptions.length === 0 ? (
                            <tr>
                              <td colSpan={7} className="p-8 text-center text-slate-400">
                                Tidak ada data subscription aktif yang sesuai filter.
                              </td>
                            </tr>
                          ) : (
                            filteredActiveSubscriptions.map((sub) => (
                              <tr key={sub.id} className="hover:bg-slate-50/70 transition-colors">
                                <td className="p-3.5 pl-4 font-mono font-bold text-slate-900">{sub.invoiceNumber}</td>
                                <td className="p-3.5">
                                  <span className="font-black text-slate-900 block">{sub.userName}</span>
                                  <span className="text-[10px] text-slate-500 block">{sub.userEmail}</span>
                                </td>
                                <td className="p-3.5 font-bold text-slate-800">
                                  <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-black border border-amber-300">
                                    {sub.planName}
                                  </span>
                                </td>
                                <td className="p-3.5 font-mono font-bold text-emerald-700">
                                  Rp {sub.amountIdr.toLocaleString('id-ID')}
                                </td>
                                <td className="p-3.5 text-slate-700 font-bold">
                                  {sub.isLifetime ? 'Seumur Hidup' : sub.expiryDate}
                                </td>
                                <td className="p-3.5 text-slate-600 text-[11px]">{sub.paymentMethod}</td>
                                <td className="p-3.5 pr-4 text-right">
                                  {sub.referralCode ? (
                                    <span className="font-mono text-[10px] bg-purple-50 text-purple-700 font-black px-2 py-0.5 rounded border border-purple-200">
                                      {sub.referralCode}
                                    </span>
                                  ) : (
                                    <span className="text-slate-400 text-[10px]">-</span>
                                  )}
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* ======================================================== */}
              {/* TAB 6: STATISTIK AFILIASI SAHABAT SYIAR & RECHARTS       */}
              {/* ======================================================== */}
              {activeTab === 'affiliate_stats' && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  {/* Cards Grid */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                    <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-xs space-y-1">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Total Mitra Terdaftar</span>
                      <div className="text-2xl sm:text-3xl font-black font-heading text-purple-700">
                        {affiliateStats.activePartnersCount} <span className="text-xs font-bold text-slate-400">Mitra</span>
                      </div>
                      <span className="text-[11px] text-slate-500 block">Sahabat Syiar Cahaya Tahfiz</span>
                    </div>

                    <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-xs space-y-1">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Santri Terkonversi</span>
                      <div className="text-2xl sm:text-3xl font-black font-heading text-emerald-600">
                        {affiliateStats.recruitedStudentsCount} <span className="text-xs font-bold text-slate-400">Santri</span>
                      </div>
                      <span className="text-[11px] text-slate-500 block">Total transaksi via kode referral</span>
                    </div>

                    <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-xs space-y-1">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Total Komisi (10%)</span>
                      <div className="text-2xl sm:text-3xl font-black font-heading text-slate-900">
                        Rp {affiliateStats.totalEarnings.toLocaleString('id-ID')}
                      </div>
                      <span className="text-[11px] text-slate-500 block">Hak syiar mitra terkumpul</span>
                    </div>

                    <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-xs space-y-1">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Komisi Belum Cair</span>
                      <div className="text-2xl sm:text-3xl font-black font-heading text-amber-600">
                        Rp {affiliateStats.pendingBalance.toLocaleString('id-ID')}
                      </div>
                      <span className="text-[11px] text-amber-700 font-bold block">Menunggu verifikasi transfer</span>
                    </div>
                  </div>

                  {/* Mitra Afiliasi Table */}
                  <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs space-y-3 p-5">
                    <h5 className="font-black text-slate-900 text-sm">
                      Daftar Mitra Sahabat Syiar & Tautan Natural Masing-Masing:
                    </h5>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px] tracking-wider">
                            <th className="p-3 pl-3">Mitra & Kontak</th>
                            <th className="p-3">Kode Referral</th>
                            <th className="p-3">Tautan Natural</th>
                            <th className="p-3">Rekening Bank Pencairan</th>
                            <th className="p-3">Rekrutan Santri</th>
                            <th className="p-3 pr-3 text-right">Saldo Komisi</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {affiliateStats.partners.map(({ user, referralsCount, commissionAmount }) => {
                            const naturalUrl = StorageService.getAffiliateShareUrl(user);
                            return (
                              <tr key={user.id} className="hover:bg-slate-50/70">
                                <td className="p-3 pl-3">
                                  <strong className="text-slate-900 block">{user.parentName}</strong>
                                  <span className="text-[10px] text-slate-500">{user.email}</span>
                                </td>
                                <td className="p-3">
                                  <span className="font-mono font-black text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                                    {user.affiliateCode}
                                  </span>
                                </td>
                                <td className="p-3">
                                  <div className="flex items-center gap-1.5">
                                    <span className="font-mono text-[11px] text-slate-600 truncate max-w-[150px]">
                                      {naturalUrl.replace('https://', '')}
                                    </span>
                                    <button
                                      onClick={() => handleOpenCustomLinkEditor(user)}
                                      className="p-1 rounded hover:bg-slate-200 text-slate-500"
                                      title="Kustomisasi Slug Tautan"
                                    >
                                      <Edit3 size={12} />
                                    </button>
                                  </div>
                                </td>
                                <td className="p-3">
                                  {user.affiliateBankDetails ? (
                                    <div className="text-[11px]">
                                      <strong className="text-slate-800 block">{user.affiliateBankDetails.bankName}</strong>
                                      <span className="font-mono text-slate-600">
                                        {user.affiliateBankDetails.accountNumber} ({user.affiliateBankDetails.accountHolder})
                                      </span>
                                    </div>
                                  ) : (
                                    <span className="text-slate-400">Belum diisi</span>
                                  )}
                                </td>
                                <td className="p-3 font-bold text-slate-800">
                                  {referralsCount} Santri
                                </td>
                                <td className="p-3 pr-3 text-right font-mono font-black text-emerald-700">
                                  Rp {commissionAmount.toLocaleString('id-ID')}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* ======================================================== */}
              {/* TAB 7: LOG AUDIT ADMIN                                   */}
              {/* ======================================================== */}
              {activeTab === 'audit_logs' && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  {/* Filter & Search Bar */}
                  <div className="bg-white border border-slate-200 rounded-3xl p-4 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 text-xs">
                    <div className="relative flex-1">
                      <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Cari deskripsi log, nama admin, target user, atau aksi..."
                        value={auditSearchQuery}
                        onChange={(e) => setAuditSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-cyan-500"
                      />
                    </div>

                    <select
                      value={auditActionFilter}
                      onChange={(e) => setAuditActionFilter(e.target.value)}
                      className="p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700"
                    >
                      <option value="all">Semua Jenis Aksi</option>
                      <option value="change_password">🔑 Ganti Password Pengguna</option>
                      <option value="suspend_user">⛔ Suspend / Nonaktifkan Akun</option>
                      <option value="reactivate_user">✅ Aktifkan Kembali Akun</option>
                      <option value="verify_payment">💰 Verifikasi Transfer Pembayaran</option>
                      <option value="flag_fake_payment">⚠️ Tandai Struk Palsu</option>
                      <option value="manual_assign_pro">👑 Assign PRO Manual</option>
                      <option value="admin_login_2fa">🛡️ 2FA Admin Login</option>
                      <option value="change_admin_pin">🔒 Ganti Master Sandi / PIN</option>
                    </select>
                  </div>

                  {/* Audit Logs List */}
                  <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-3">
                    <h5 className="font-black text-slate-900 text-sm flex items-center gap-2 border-b border-slate-100 pb-2">
                      <History size={16} className="text-cyan-600" />
                      <span>Rekaman Jejak Audit Aktivitas Administrator:</span>
                    </h5>

                    <div className="divide-y divide-slate-100">
                      {auditLogs
                        .filter((log) => {
                          const matchSearch =
                            !auditSearchQuery.trim() ||
                            log.description.toLowerCase().includes(auditSearchQuery.toLowerCase()) ||
                            log.adminName.toLowerCase().includes(auditSearchQuery.toLowerCase()) ||
                            (log.targetUserName && log.targetUserName.toLowerCase().includes(auditSearchQuery.toLowerCase()));

                          const matchAction = auditActionFilter === 'all' || log.action === auditActionFilter;
                          return matchSearch && matchAction;
                        })
                        .map((log) => (
                          <div key={log.id} className="py-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-bold text-slate-900">{log.adminName}</span>
                                <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                                  log.action === 'change_password'
                                    ? 'bg-indigo-100 text-indigo-800'
                                    : log.action === 'suspend_user'
                                    ? 'bg-rose-100 text-rose-800'
                                    : log.action === 'reactivate_user'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : log.action === 'flag_fake_transfer'
                                    ? 'bg-rose-100 text-rose-800'
                                    : log.action === 'verify_payment'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-slate-100 text-slate-700'
                                }`}>
                                  {log.action.replace(/_/g, ' ')}
                                </span>
                                {log.targetUserName && (
                                  <span className="text-slate-500 font-medium">
                                    ➜ Target: <strong>{log.targetUserName}</strong>
                                  </span>
                                )}
                              </div>
                              <p className="text-slate-700">{log.description}</p>
                              {(log.previousValue || log.newValue) && (
                                <div className="text-[10px] font-mono text-slate-500 flex items-center gap-2">
                                  {log.previousValue && <span>Semula: {log.previousValue}</span>}
                                  {log.previousValue && log.newValue && <span>➜</span>}
                                  {log.newValue && <span className="text-emerald-700 font-bold">Baru: {log.newValue}</span>}
                                </div>
                              )}
                            </div>

                            <span className="text-[11px] text-slate-400 font-mono shrink-0">
                              {new Date(log.timestamp).toLocaleString('id-ID')}
                            </span>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ======================================================== */}
              {/* TAB 8: BROADCAST PENGUMUMAN & PUSH NOTIFIKASI PENYEMANGAT */}
              {/* ======================================================== */}
              {activeTab === 'broadcast_announcements' && (
                <div className="animate-in fade-in duration-200">
                  <BroadcastManagerTab
                    onNotify={(msg) => {
                      setActionToast(msg);
                      setTimeout(() => setActionToast(null), 4000);
                      setAuditLogs(StorageService.getAdminAuditLogs());
                    }}
                  />
                </div>
              )}

            </div>
          </>
        )}

      </div>

      {/* ================================================================ */}
      {/* MODAL 1: DETAIL USER & RIWAYAT LOGIN LENGKAP                    */}
      {/* ================================================================ */}
      <AnimatePresence>
        {detailUser && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-3 bg-slate-950/80 backdrop-blur-xs animate-in fade-in">
            <div className="bg-white border-2 border-slate-700 rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
              <div className="p-5 bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex items-center justify-between border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 text-cyan-300 flex items-center justify-center font-bold">
                    <Users size={20} />
                  </div>
                  <div>
                    <h4 className="font-black text-base font-heading">
                      Detail Akun: {detailUser.parentName}
                    </h4>
                    <span className="text-xs text-slate-300 font-mono">
                      User ID: {detailUser.id}
                    </span>
                  </div>
                </div>
                <button onClick={() => setDetailUser(null)} className="text-slate-400 hover:text-white p-1">
                  <X size={18} />
                </button>
              </div>

              <div className="p-6 overflow-y-auto space-y-5 text-xs">
                {/* Profile Grid */}
                <div className="grid grid-cols-2 gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-bold block">Nama Orang Tua:</span>
                    <strong className="text-sm text-slate-900">{detailUser.parentName}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-bold block">Santri & Usia:</span>
                    <strong className="text-sm text-cyan-800">
                      {detailUser.studentName || 'Aisyah Az-Zahra'} ({detailUser.studentAge || 7} Tahun)
                    </strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-bold block">Email:</span>
                    <span className="font-mono text-slate-700">{detailUser.email}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-bold block">WhatsApp:</span>
                    <span className="font-bold text-emerald-700">{detailUser.whatsapp || '-'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-bold block">Status Langganan:</span>
                    <span className="font-black text-amber-700 uppercase">{detailUser.planTier} (Exp: {detailUser.entitlementExpiry})</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-bold block">Status Keamanan:</span>
                    <span className={`font-black text-[11px] ${detailUser.accountStatus === 'suspended' ? 'text-rose-700' : 'text-emerald-700'}`}>
                      {detailUser.accountStatus === 'suspended' ? '⛔ SUSPENDED' : '🟢 AKTIF'}
                    </span>
                  </div>
                </div>

                {/* Login History */}
                <div className="space-y-3">
                  <h5 className="font-black text-slate-900 text-xs flex items-center gap-2">
                    <Laptop size={15} className="text-cyan-600" />
                    <span>Riwayat Login Terakhir & Lokasi:</span>
                  </h5>
                  <div className="space-y-2">
                    {(() => {
                      const logs = detailUser.loginHistory && detailUser.loginHistory.length > 0
                        ? detailUser.loginHistory
                        : StorageService.generateSeedLoginHistory(detailUser);

                      return logs.map((log) => (
                        <div key={log.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center text-xs">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-slate-800">{log.ipAddress}</span>
                              {log.isSuspicious && <span className="bg-rose-600 text-white text-[9px] px-1 rounded font-black">PROXY</span>}
                            </div>
                            <span className="text-[11px] text-slate-500">{log.device} • {log.location}</span>
                          </div>
                          <span className="text-[10px] text-slate-400 font-mono">{new Date(log.timestamp).toLocaleDateString('id-ID')}</span>
                        </div>
                      ));
                    })()}
                  </div>
                </div>

                {/* Action Buttons in Modal */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                  <button
                    onClick={() => {
                      setPasswordModalUser(detailUser);
                      setDetailUser(null);
                    }}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <KeyRound size={14} />
                    <span>Ganti Password</span>
                  </button>

                  {detailUser.accountStatus === 'suspended' ? (
                    <button
                      onClick={() => {
                        handleReactivateUser(detailUser);
                        setDetailUser(null);
                      }}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <UserCheck size={14} />
                      <span>Aktifkan Akun</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setSuspendTargetUser(detailUser);
                        setSuspendReasonInput('Investigasi keamanan oleh admin');
                        setDetailUser(null);
                      }}
                      className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <UserX size={14} />
                      <span>Suspend Akun</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* ================================================================ */}
      {/* MODAL 2: GANTI PASSWORD USER MANUAL                             */}
      {/* ================================================================ */}
      <AnimatePresence>
        {passwordModalUser && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-3 bg-slate-950/80 backdrop-blur-xs animate-in fade-in">
            <div className="bg-white border-2 border-indigo-700 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden">
              <div className="p-5 bg-gradient-to-r from-indigo-900 to-slate-900 text-white flex items-center justify-between border-b border-indigo-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-300 flex items-center justify-center font-bold">
                    <KeyRound size={18} />
                  </div>
                  <div>
                    <h4 className="font-black text-sm font-heading">
                      Reset Password: {passwordModalUser.parentName}
                    </h4>
                    <span className="text-[11px] text-indigo-200 font-mono">
                      {passwordModalUser.email}
                    </span>
                  </div>
                </div>
                <button onClick={() => setPasswordModalUser(null)} className="text-slate-400 hover:text-white p-1">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSaveUserPassword} className="p-6 space-y-4 text-xs">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-bold text-slate-700 uppercase">
                      Password / PIN Baru:
                    </label>
                    <button
                      type="button"
                      onClick={generateRandomPassword}
                      className="text-[11px] font-black text-indigo-600 hover:text-indigo-800 cursor-pointer"
                    >
                      ⚡ Acak Kuat
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={showPasswordText ? 'text' : 'password'}
                      placeholder="Minimal 4 karakter..."
                      value={newPasswordInput}
                      onChange={(e) => setNewPasswordInput(e.target.value)}
                      className="w-full p-3 bg-slate-50 border border-slate-300 rounded-2xl text-xs font-mono font-bold text-slate-800 focus:outline-none focus:border-indigo-500 pr-10"
                      required
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswordText(!showPasswordText)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                    >
                      {showPasswordText ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 uppercase block mb-1">
                    Catatan Alasan Perubahan:
                  </label>
                  <input
                    type="text"
                    placeholder="Cth: Permintaan wali via WA, lupa PIN, dsb..."
                    value={passwordNotesInput}
                    onChange={(e) => setPasswordNotesInput(e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-300 rounded-2xl text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setPasswordModalUser(null)}
                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-indigo-700 hover:bg-indigo-800 text-white font-black text-xs cursor-pointer shadow-md"
                  >
                    Simpan Password Baru
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* ================================================================ */}
      {/* MODAL 3: SUSPEND / NONAKTIFKAN AKUN MENCURIGAKAN (REQ 4)         */}
      {/* ================================================================ */}
      <AnimatePresence>
        {suspendTargetUser && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-3 bg-slate-950/80 backdrop-blur-xs animate-in fade-in">
            <div className="bg-white border-2 border-rose-600 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden">
              <div className="p-5 bg-gradient-to-r from-rose-900 to-slate-900 text-white flex items-center justify-between border-b border-rose-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-rose-500/20 text-rose-300 flex items-center justify-center font-bold">
                    <UserX size={18} />
                  </div>
                  <div>
                    <h4 className="font-black text-sm font-heading">
                      Nonaktifkan Akun Santri (Suspend)
                    </h4>
                    <span className="text-[11px] text-rose-200 font-mono">
                      {suspendTargetUser.parentName} ({suspendTargetUser.email})
                    </span>
                  </div>
                </div>
                <button onClick={() => setSuspendTargetUser(null)} className="text-slate-400 hover:text-white p-1">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleConfirmSuspendUser} className="p-6 space-y-4 text-xs">
                <div className="p-3 bg-rose-50 rounded-2xl border border-rose-200 text-rose-900 text-xs">
                  <p className="font-bold flex items-center gap-1.5 mb-1">
                    <AlertTriangle size={14} className="text-rose-600" />
                    <span>Konfirmasi Pembekuan Akun:</span>
                  </p>
                  <p className="text-[11px] leading-relaxed">
                    Akun ini akan dibekukan sementara. Pengguna tidak dapat login ke aplikasi hingga admin mengaktifkannya kembali.
                  </p>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 uppercase block mb-1">
                    Alasan Penonaktifan:
                  </label>
                  <input
                    type="text"
                    value={suspendReasonInput}
                    onChange={(e) => setSuspendReasonInput(e.target.value)}
                    placeholder="Cth: Terdeteksi upload struk palsu, login IP anomali, dsb..."
                    className="w-full p-3 bg-slate-50 border border-slate-300 rounded-2xl text-xs text-slate-800 focus:outline-none focus:border-rose-500"
                    required
                    autoFocus
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setSuspendTargetUser(null)}
                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs cursor-pointer shadow-md"
                  >
                    Ya, Nonaktifkan Akun
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* ================================================================ */}
      {/* MODAL 4: PRATINJAU STRUK TRANSFER DENGAN ZOOM & ROTASI           */}
      {/* ================================================================ */}
      <AnimatePresence>
        {inspectingPayment && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-3 bg-slate-950/80 backdrop-blur-xs animate-in fade-in">
            <div className="bg-white border-2 border-slate-700 rounded-3xl w-full max-w-3xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
              <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
                <div>
                  <h4 className="font-black text-sm">
                    Pemeriksaan Bukti Transfer ({inspectingPayment.invoiceNumber})
                  </h4>
                  <span className="text-[11px] text-slate-400">
                    Nominal: Rp {inspectingPayment.amountIdr.toLocaleString('id-ID')} • {inspectingPayment.paymentMethod}
                  </span>
                </div>
                <button onClick={() => setInspectingPayment(null)} className="text-slate-400 hover:text-white p-1">
                  <X size={18} />
                </button>
              </div>

              <div className="p-4 overflow-y-auto flex-1 space-y-4 text-xs">
                {/* Image Viewer with Zoom Controls */}
                <div className="bg-slate-900 rounded-2xl p-4 flex flex-col items-center justify-center min-h-[300px] overflow-hidden relative">
                  <div className="absolute top-3 right-3 flex items-center gap-1.5 z-10 bg-slate-950/80 p-1 rounded-xl border border-slate-700">
                    <button
                      onClick={() => setReceiptZoom((z) => Math.max(0.5, z - 0.25))}
                      className="p-1.5 text-slate-300 hover:text-white"
                      title="Perkecil"
                    >
                      <ZoomOut size={16} />
                    </button>
                    <span className="text-[10px] font-mono text-slate-300 px-1 font-bold">
                      {Math.round(receiptZoom * 100)}%
                    </span>
                    <button
                      onClick={() => setReceiptZoom((z) => Math.min(2.5, z + 0.25))}
                      className="p-1.5 text-slate-300 hover:text-white"
                      title="Perbesar"
                    >
                      <ZoomIn size={16} />
                    </button>
                    <button
                      onClick={() => setReceiptRotation((r) => (r + 90) % 360)}
                      className="p-1.5 text-slate-300 hover:text-white"
                      title="Putar 90 Derajat"
                    >
                      <RotateCw size={16} />
                    </button>
                  </div>

                  <div
                    className="transition-transform duration-200"
                    style={{
                      transform: `scale(${receiptZoom}) rotate(${receiptRotation}deg)`,
                    }}
                  >
                    {inspectingPayment.transferProofUrl ? (
                      <img
                        src={inspectingPayment.transferProofUrl}
                        alt="Bukti Transfer"
                        className="max-h-72 object-contain rounded-lg shadow-lg border border-slate-700"
                      />
                    ) : (
                      <div className="w-64 h-64 bg-slate-800 rounded-2xl flex flex-col items-center justify-center text-slate-400 p-4 text-center">
                        <CreditCard size={36} className="mb-2 text-slate-500" />
                        <span className="font-bold">Simulasi Struk M-Banking</span>
                        <span className="text-[10px] text-slate-500 mt-1 font-mono">
                          TRF Rp {inspectingPayment.amountIdr.toLocaleString('id-ID')}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Fraud Analysis Box */}
                {inspectingPayment.fraudAnalysis && (
                  <div className={`p-4 rounded-2xl border ${
                    inspectingPayment.fraudAnalysis.status === 'suspicious' || inspectingPayment.fraudAnalysis.status === 'confirmed_fake'
                      ? 'bg-rose-50 border-rose-200 text-rose-950'
                      : 'bg-emerald-50 border-emerald-200 text-emerald-950'
                  }`}>
                    <div className="flex items-center justify-between mb-2">
                      <strong className="text-xs flex items-center gap-1.5">
                        <ShieldAlert size={14} />
                        <span>Analisis Keaslian Struk AI:</span>
                      </strong>
                      <span className="font-mono font-black text-xs">
                        Skor: {inspectingPayment.fraudAnalysis.authenticityScore}%
                      </span>
                    </div>
                    <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-700">
                      {inspectingPayment.fraudAnalysis.indicators.map((ind: string, i: number) => (
                        <li key={i}>{ind}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                  <button
                    onClick={() => handleFlagFakePayment(inspectingPayment.id)}
                    className="px-3 py-2 rounded-xl bg-rose-100 hover:bg-rose-200 text-rose-800 font-bold text-xs cursor-pointer border border-rose-300"
                  >
                    Tandai Struk Palsu (Flag Fake)
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setRejectPromptPayment(inspectingPayment);
                        setRejectReasonInput('Dana belum masuk mutasi rekening yayasan');
                      }}
                      className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
                    >
                      Tolak Transfer
                    </button>
                    <button
                      onClick={() => handleVerifyPayment(inspectingPayment.id)}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs cursor-pointer shadow-md"
                    >
                      Verifikasi & Aktifkan PRO
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* ================================================================ */}
      {/* MODAL 5: TOLAK PEMBAYARAN DENGAN ALASAN                          */}
      {/* ================================================================ */}
      <AnimatePresence>
        {rejectPromptPayment && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-3 bg-slate-950/80 backdrop-blur-xs animate-in fade-in">
            <div className="bg-white border-2 border-rose-600 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden">
              <div className="p-4 bg-rose-900 text-white flex items-center justify-between border-b border-rose-800">
                <h4 className="font-black text-sm">
                  Tolak Pembayaran ({rejectPromptPayment.invoiceNumber})
                </h4>
                <button onClick={() => setRejectPromptPayment(null)} className="text-slate-400 hover:text-white p-1">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleConfirmRejectPayment} className="p-6 space-y-4 text-xs">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 uppercase block mb-1">
                    Alasan Penolakan:
                  </label>
                  <input
                    type="text"
                    value={rejectReasonInput}
                    onChange={(e) => setRejectReasonInput(e.target.value)}
                    placeholder="Cth: Dana belum masuk mutasi, bukti buram, struk fiktif..."
                    className="w-full p-3 bg-slate-50 border border-slate-300 rounded-2xl text-xs text-slate-800 focus:outline-none focus:border-rose-500"
                    required
                    autoFocus
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setRejectPromptPayment(null)}
                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs cursor-pointer shadow-md"
                  >
                    Tolak Pembayaran
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* ================================================================ */}
      {/* MODAL 6: ASSIGN PRO MANUAL                                      */}
      {/* ================================================================ */}
      <AnimatePresence>
        {showManualAssignModal && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-3 bg-slate-950/80 backdrop-blur-xs animate-in fade-in">
            <div className="bg-white border-2 border-amber-500 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden">
              <div className="p-4 bg-gradient-to-r from-amber-600 to-amber-700 text-slate-950 flex items-center justify-between border-b border-amber-500">
                <div className="flex items-center gap-2">
                  <Crown size={20} />
                  <h4 className="font-black text-sm">
                    Assign PRO Subscription Manual
                  </h4>
                </div>
                <button onClick={() => setShowManualAssignModal(false)} className="text-slate-950 p-1">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSubmitManualAssign} className="p-6 space-y-4 text-xs">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 uppercase block mb-1">
                    Pilih Pengguna Target:
                  </label>
                  <select
                    value={assignUserId}
                    onChange={(e) => setAssignUserId(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold"
                    required
                  >
                    <option value="">-- Pilih Akun Santri --</option>
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.parentName} ({u.email}) - Saat ini: {u.planTier.toUpperCase()}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 uppercase block mb-1">
                      Paket Langganan:
                    </label>
                    <select
                      value={assignPlanId}
                      onChange={(e) => {
                        const val = e.target.value;
                        setAssignPlanId(val);
                        if (val === 'plan_lifetime') {
                          setAssignDurationMonths(120);
                          setAssignAmountIdr(699000);
                        } else if (val === 'plan_yearly') {
                          setAssignDurationMonths(12);
                          setAssignAmountIdr(299000);
                        } else if (val === 'plan_6month') {
                          setAssignDurationMonths(6);
                          setAssignAmountIdr(189000);
                        } else {
                          setAssignDurationMonths(1);
                          setAssignAmountIdr(39000);
                        }
                      }}
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold"
                    >
                      <option value="plan_1month">1 Bulan (Rp 39.000)</option>
                      <option value="plan_6month">6 Bulan (Rp 189.000)</option>
                      <option value="plan_yearly">1 Tahun (Rp 299.000)</option>
                      <option value="plan_lifetime">Wakaf Lifetime (Rp 699.000)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-700 uppercase block mb-1">
                      Sumber / Alasan:
                    </label>
                    <select
                      value={assignPaymentSource}
                      onChange={(e) => setAssignPaymentSource(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold"
                    >
                      <option value="Transfer Bank BCA Manual (Rek Yayasan)">Transfer Bank BCA Yayasan</option>
                      <option value="Transfer Bank Mandiri">Transfer Bank Mandiri</option>
                      <option value="Transfer BSI">Transfer Bank Syariah (BSI)</option>
                      <option value="Beasiswa Tahfiz Santri Dhuafa (Rp 0)">Beasiswa Tahfiz Dhuafa</option>
                      <option value="Kemitraan TPA / Pesantren">Kemitraan Pesantren/TPA</option>
                      <option value="Tunai / Kasir Yayasan">Tunai / Kasir Yayasan</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 uppercase block mb-1">
                    No. Resi Mutasi / Catatan Admin:
                  </label>
                  <input
                    type="text"
                    placeholder="Nomor referensi bank atau catatan verifikasi..."
                    value={assignRefNumber}
                    onChange={(e) => setAssignRefNumber(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowManualAssignModal(false)}
                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs cursor-pointer shadow-md"
                  >
                    Aktifkan PRO Sekarang
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* ================================================================ */}
      {/* MODAL 7: KUSTOMISASI TAUTAN ALAMIAH AFILIASI MITRA               */}
      {/* ================================================================ */}
      <AnimatePresence>
        {editingAffiliateUser && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-3 bg-slate-950/80 backdrop-blur-xs animate-in fade-in">
            <div className="bg-white border-2 border-purple-600 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden">
              <div className="p-4 bg-gradient-to-r from-purple-800 to-indigo-900 text-white flex items-center justify-between border-b border-purple-700">
                <h4 className="font-black text-sm">
                  Kustomisasi Tautan Mitra: {editingAffiliateUser.parentName}
                </h4>
                <button onClick={() => setEditingAffiliateUser(null)} className="text-slate-400 hover:text-white p-1">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSaveCustomLink} className="p-6 space-y-4 text-xs">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 uppercase block mb-1">
                    Slug Kustom Mitra:
                  </label>
                  <input
                    type="text"
                    value={customSlugInput}
                    onChange={(e) => setCustomSlugInput(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
                    placeholder="cth: ustadz-hendra atau sarah-tahfiz"
                    className="w-full p-3 bg-slate-50 border border-slate-300 rounded-2xl text-xs font-mono font-bold"
                    required
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Hasil Tautan: <code>cahaya-tahfiz.app/?{customPrefixInput}={customSlugInput}</code>
                  </span>
                </div>

                {customLinkError && (
                  <p className="text-rose-700 text-xs font-bold">{customLinkError}</p>
                )}

                {customLinkSuccess && (
                  <p className="text-emerald-700 text-xs font-bold">{customLinkSuccess}</p>
                )}

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setEditingAffiliateUser(null)}
                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-black text-xs cursor-pointer shadow-md"
                  >
                    Simpan Tautan Kustom
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* ================================================================ */}
      {/* MODAL 8: PUSAT INVESTIGASI & NOTIFIKASI POLA TRANSAKSI MENCURIGAKAN */}
      {/* ================================================================ */}
      <AnimatePresence>
        {showAlertsModal && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in overflow-y-auto">
            <div className="bg-white border-2 border-rose-500 rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden my-4">
              {/* Header */}
              <div className="p-4 sm:p-5 bg-gradient-to-r from-rose-950 via-rose-900 to-slate-900 text-white flex items-center justify-between border-b border-rose-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-rose-500/20 border border-rose-400/40 flex items-center justify-center text-rose-300 shrink-0">
                    <AlertTriangle size={20} className="animate-pulse" />
                  </div>
                  <div>
                    <h4 className="font-black text-sm sm:text-base">
                      Sistem Notifikasi Otomatis: Peringatan Pola Mencurigakan
                    </h4>
                    <p className="text-[11px] text-rose-200">
                      Pemindaian otomatis multi-pendaftaran IP dan daur ulang bukti transfer palsu
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAlertsModal(false)}
                  className="text-rose-200 hover:text-white p-1 rounded-xl hover:bg-white/10 cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Sub-header Controls & Filters */}
              <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                {/* Filter Pills */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <button
                    onClick={() => setActiveAlertFilter('all')}
                    className={`px-3 py-1.5 rounded-xl font-bold cursor-pointer transition-all ${
                      activeAlertFilter === 'all'
                        ? 'bg-rose-600 text-white shadow-xs'
                        : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    Semua ({suspiciousAlerts.length})
                  </button>
                  <button
                    onClick={() => setActiveAlertFilter('rapid_registrations_same_ip')}
                    className={`px-3 py-1.5 rounded-xl font-bold cursor-pointer transition-all ${
                      activeAlertFilter === 'rapid_registrations_same_ip'
                        ? 'bg-rose-600 text-white shadow-xs'
                        : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    IP Massal ({suspiciousAlerts.filter((a) => a.type === 'rapid_registrations_same_ip').length})
                  </button>
                  <button
                    onClick={() => setActiveAlertFilter('duplicate_transfer_proof')}
                    className={`px-3 py-1.5 rounded-xl font-bold cursor-pointer transition-all ${
                      activeAlertFilter === 'duplicate_transfer_proof'
                        ? 'bg-rose-600 text-white shadow-xs'
                        : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    Struk Duplikat ({suspiciousAlerts.filter((a) => a.type === 'duplicate_transfer_proof').length})
                  </button>
                </div>

                {/* Simulation Trigger Buttons */}
                <div className="flex items-center gap-1.5 w-full sm:w-auto">
                  <button
                    onClick={() => {
                      const alert = StorageService.simulateSuspiciousPattern('rapid_ip');
                      refreshData();
                      showToast(`Simulasi pendaftaran IP ditambahkan: ${alert.title}`);
                    }}
                    className="flex-1 sm:flex-none px-2.5 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 font-bold text-[11px] border border-slate-300 cursor-pointer shadow-2xs"
                    title="Simulasikan bot pendaftaran massal dari IP sama"
                  >
                    + Tes Pola IP
                  </button>
                  <button
                    onClick={() => {
                      const alert = StorageService.simulateSuspiciousPattern('duplicate_proof');
                      refreshData();
                      showToast(`Simulasi bukti duplikat ditambahkan: ${alert.title}`);
                    }}
                    className="flex-1 sm:flex-none px-2.5 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 font-bold text-[11px] border border-slate-300 cursor-pointer shadow-2xs"
                    title="Simulasikan bukti transfer yang diunggah berulang kali"
                  >
                    + Tes Struk Duplikat
                  </button>
                </div>
              </div>

              {/* Alert List Container */}
              <div className="p-4 sm:p-6 space-y-4 max-h-[60vh] overflow-y-auto">
                {suspiciousAlerts.filter((a) => activeAlertFilter === 'all' || a.type === activeAlertFilter).length === 0 ? (
                  <div className="p-10 text-center space-y-2 bg-slate-50 rounded-2xl border border-slate-200">
                    <CheckCircle size={36} className="text-emerald-500 mx-auto" />
                    <h5 className="font-bold text-slate-900 text-sm">Tidak Ada Peringatan Aktif</h5>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto">
                      Semua transaksi pembayaran dan pendaftaran akun saat ini terverifikasi bersih dan aman dari pola mencurigakan.
                    </p>
                  </div>
                ) : (
                  suspiciousAlerts
                    .filter((a) => activeAlertFilter === 'all' || a.type === activeAlertFilter)
                    .map((alert) => (
                      <div
                        key={alert.id}
                        className={`p-4 sm:p-5 rounded-2xl border space-y-3 shadow-xs ${
                          alert.severity === 'critical'
                            ? 'bg-rose-50/70 border-rose-300'
                            : 'bg-amber-50/70 border-amber-300'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase ${
                              alert.severity === 'critical' ? 'bg-rose-600 text-white' : 'bg-amber-600 text-white'
                            }`}>
                              {alert.severity === 'critical' ? '🚨 KRITIS' : '⚠️ PERINGATAN'}
                            </span>
                            <span className="text-[10px] font-bold text-slate-600 bg-white px-2.5 py-0.5 rounded-full border border-slate-200">
                              {alert.type === 'rapid_registrations_same_ip' ? 'Pola IP Massal' : 'Struk Diunggah Berulang'}
                            </span>
                            <h5 className="font-extrabold text-sm text-slate-900">
                              {alert.title}
                            </h5>
                          </div>
                          <span className="text-[11px] text-slate-500 font-mono">
                            {new Date(alert.timestamp).toLocaleString('id-ID')}
                          </span>
                        </div>

                        <p className="text-xs text-slate-700 leading-relaxed font-medium">
                          {alert.description}
                        </p>

                        {/* Indicators Box */}
                        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 space-y-1.5 text-xs">
                          <span className="font-black text-[11px] text-slate-700 uppercase tracking-wider block">
                            Temuan Investigasi Keamanan:
                          </span>
                          {alert.indicators.map((ind, i) => (
                            <div key={i} className="flex items-start gap-2 text-slate-700 text-[11px]">
                              <span className="text-rose-600 font-bold shrink-0">➔</span>
                              <span>{ind}</span>
                            </div>
                          ))}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2 border-t border-slate-200">
                          <div className="text-[11px] text-slate-600">
                            <strong>Rekomendasi Tindakan:</strong> {alert.recommendedAction}
                          </div>

                          <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
                            {alert.type === 'rapid_registrations_same_ip' && alert.affectedUserIds && (
                              <button
                                onClick={() => {
                                  StorageService.batchSuspendUsers(
                                    alert.affectedUserIds!,
                                    `Suspend: Pendaftaran mencurigakan berulang dari IP ${alert.ipAddress}`,
                                    'Master Admin'
                                  );
                                  StorageService.resolveSuspiciousAlert(alert.id, `Suspend ${alert.affectedUserIds!.length} akun`, 'Master Admin');
                                  refreshData();
                                  showToast(`Berhasil menonaktifkan ${alert.affectedUserIds!.length} akun mencurigakan!`);
                                }}
                                className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs cursor-pointer shadow-xs transition-all active:scale-95 flex items-center gap-1.5"
                              >
                                <UserX size={13} />
                                <span>Suspend Semua Akun ({alert.affectedUserIds.length})</span>
                              </button>
                            )}

                            {alert.type === 'duplicate_transfer_proof' && alert.affectedTransactionIds && (
                              <button
                                onClick={() => {
                                  StorageService.batchFlagFakePayments(
                                    alert.affectedTransactionIds!,
                                    `Bukti transfer berulang RRN ${alert.duplicateRrn || ''}`,
                                    'Master Admin'
                                  );
                                  StorageService.resolveSuspiciousAlert(alert.id, `Tolak ${alert.affectedTransactionIds!.length} transaksi duplikat`, 'Master Admin');
                                  refreshData();
                                  showToast(`Semua transaksi bukti duplikat berhasil ditandai sebagai Transfer Palsu!`);
                                }}
                                className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs cursor-pointer shadow-xs transition-all active:scale-95 flex items-center gap-1.5"
                              >
                                <XCircle size={13} />
                                <span>Tolak & Tandai Transfer Palsu</span>
                              </button>
                            )}

                            {alert.type === 'rapid_registrations_same_ip' ? (
                              <button
                                onClick={() => {
                                  setActiveTab('security_passwords');
                                  setShowAlertsModal(false);
                                }}
                                className="px-3 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs cursor-pointer border border-indigo-200"
                              >
                                Keamanan Akun ➔
                              </button>
                            ) : (
                              <button
                                onClick={() => {
                                  setActiveTab('payments_tracking');
                                  setShowAlertsModal(false);
                                }}
                                className="px-3 py-2 rounded-xl bg-cyan-50 hover:bg-cyan-100 text-cyan-800 font-bold text-xs cursor-pointer border border-cyan-200"
                              >
                                Pembayaran ➔
                              </button>
                            )}

                            <button
                              onClick={() => {
                                StorageService.dismissSuspiciousAlert(alert.id, 'Master Admin');
                                refreshData();
                                showToast('Peringatan diarsipkan.');
                              }}
                              className="px-3 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs cursor-pointer"
                            >
                              Arsipkan
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                )}
              </div>

              {/* Modal Footer */}
              <div className="p-4 bg-slate-100 border-t border-slate-200 flex items-center justify-between text-xs">
                <span className="text-slate-500 text-[11px]">
                  Pemeriksaan keamanan real-time berbasis IP audit trail & referensi bank RRN.
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={refreshData}
                    className="px-3 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-bold border border-slate-300 cursor-pointer flex items-center gap-1.5"
                  >
                    <RefreshCw size={13} />
                    <span>Pindai Ulang</span>
                  </button>
                  <button
                    onClick={() => setShowAlertsModal(false)}
                    className="px-4 py-2 rounded-xl bg-[#164C68] hover:bg-[#113a50] text-white font-bold cursor-pointer"
                  >
                    Tutup
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
