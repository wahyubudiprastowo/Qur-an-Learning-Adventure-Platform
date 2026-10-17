import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck,
  X,
  Users,
  CreditCard,
  Share2,
  UserCheck,
  CheckCircle2,
  Clock,
  AlertCircle,
  Search,
  Filter,
  Crown,
  Sparkles,
  ArrowUpRight,
  TrendingUp,
  RefreshCw,
  PlusCircle,
  ChevronRight,
  ChevronDown,
  Building,
  Calendar,
  Check,
  XCircle,
  ExternalLink,
  BookOpen,
  DollarSign,
  FileText,
  BadgeCheck,
  Info,
  Gift,
  HelpCircle,
  KeyRound,
  Lock,
  Unlock,
  ShieldAlert,
  History,
  FileSpreadsheet,
  AlertTriangle,
  CheckCircle,
  Copy,
  Edit3,
  SlidersHorizontal,
  Eye,
  EyeOff,
  UserX,
  Phone,
  Mail,
  RotateCcw,
} from 'lucide-react';
import {
  UserAccount,
  PaymentTransaction,
  AffiliateReferralRecord,
  AdminManualAssignPayload,
  PlanTier,
  AdminAuditLog,
  FraudAnalysisResult,
  BankMutationItem,
} from '../../types';
import { StorageService } from '../../services/storageService';

interface AdminMasterModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserAccount;
  onDataChanged: () => void;
}

type AdminTab =
  | 'overview'
  | 'users'
  | 'subscriptions'
  | 'fraud_detection'
  | 'affiliates'
  | 'manual_assign'
  | 'security_passwords'
  | 'audit_logs'
  | 'rubric';

export const AdminMasterModal: React.FC<AdminMasterModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onDataChanged,
}) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [users, setUsers] = useState<UserAccount[]>(() => StorageService.getAllUsers());
  const [payments, setPayments] = useState<PaymentTransaction[]>(() => StorageService.getPaymentHistory());
  const [referrals, setReferrals] = useState<AffiliateReferralRecord[]>(() => StorageService.getAllAffiliateReferrals());
  const [auditLogs, setAuditLogs] = useState<AdminAuditLog[]>(() => StorageService.getAdminAuditLogs());
  const [bankMutations, setBankMutations] = useState<BankMutationItem[]>(() => StorageService.getBankMutations());

  // Global search & notifications
  const [actionSuccessNotice, setActionSuccessNotice] = useState<string | null>(null);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // --- Tab Users: Search & Filter State ---
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [userTierFilter, setUserTierFilter] = useState<'all' | 'pro' | 'free' | 'guest'>('all');
  const [userSubStatusFilter, setUserSubStatusFilter] = useState<'all' | 'active_pro' | 'free' | 'expired' | 'lifetime'>('all');
  const [userDateFilter, setUserDateFilter] = useState<'all' | 'today' | '7days' | '30days' | 'this_month' | 'older'>('all');
  const [userProviderFilter, setUserProviderFilter] = useState<'all' | 'google' | 'whatsapp' | 'email'>('all');
  const [userSortBy, setUserSortBy] = useState<'created_desc' | 'created_asc' | 'name_asc' | 'name_desc' | 'status_pro_first'>('created_desc');
  const [userPage, setUserPage] = useState<number>(1);
  const [userRowsPerPage, setUserRowsPerPage] = useState<number>(10);
  const [selectedUserDetail, setSelectedUserDetail] = useState<UserAccount | null>(null);

  // --- Tab Subscriptions & Fraud: Search & Filter State ---
  const [paymentSearchQuery, setPaymentSearchQuery] = useState('');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<'all' | 'pending' | 'success' | 'failed'>('all');
  const [paymentFraudFilter, setPaymentFraudFilter] = useState<'all' | 'verified_real' | 'suspicious' | 'confirmed_fake'>('all');
  const [inspectingPayment, setInspectingPayment] = useState<PaymentTransaction | null>(null);
  const [rejectPromptPayment, setRejectPromptPayment] = useState<PaymentTransaction | null>(null);
  const [rejectReasonInput, setRejectReasonInput] = useState<string>('');

  // --- Tab Password & Security State ---
  const [passwordModalUser, setPasswordModalUser] = useState<UserAccount | null>(null);
  const [newPasswordInput, setNewPasswordInput] = useState<string>('');
  const [passwordNotesInput, setPasswordNotesInput] = useState<string>('');
  const [showPasswordText, setShowPasswordText] = useState<boolean>(false);

  // Master Admin PIN change state
  const [currentMasterPinInput, setCurrentMasterPinInput] = useState<string>('');
  const [newMasterPinInput, setNewMasterPinInput] = useState<string>('');
  const [confirmMasterPinInput, setConfirmMasterPinInput] = useState<string>('');
  const [masterPinNotice, setMasterPinNotice] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  // --- Manual Assign Form State ---
  const [assignUserId, setAssignUserId] = useState<string>('');
  const [assignPlanId, setAssignPlanId] = useState<string>('plan_yearly');
  const [assignDurationMonths, setAssignDurationMonths] = useState<number>(12);
  const [assignAmountIdr, setAssignAmountIdr] = useState<number>(299000);
  const [assignPaymentSource, setAssignPaymentSource] = useState<string>('Transfer Bank BCA Manual (Rek Yayasan)');
  const [assignRefNumber, setAssignRefNumber] = useState<string>('');
  const [assignNotes, setAssignNotes] = useState<string>('');

  // --- Tab Audit Logs State ---
  const [auditSearchQuery, setAuditSearchQuery] = useState<string>('');
  const [auditActionFilter, setAuditActionFilter] = useState<string>('all');

  const refreshAdminData = () => {
    setUsers(StorageService.getAllUsers());
    setPayments(StorageService.getPaymentHistory());
    setReferrals(StorageService.getAllAffiliateReferrals());
    setAuditLogs(StorageService.getAdminAuditLogs());
    setBankMutations(StorageService.getBankMutations());
    onDataChanged();
  };

  const showToast = (msg: string) => {
    setActionSuccessNotice(msg);
    setTimeout(() => setActionSuccessNotice(null), 4500);
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(id);
    setTimeout(() => setCopiedText(null), 2500);
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

  // Helper for registration date filter matching
  const matchesDateFilter = (
    dateStr: string | undefined,
    filter: 'all' | 'today' | '7days' | '30days' | 'this_month' | 'older'
  ): boolean => {
    if (filter === 'all') return true;
    if (!dateStr) return false;
    const created = new Date(dateStr).getTime();
    const now = Date.now();
    const diffMs = now - created;
    const oneDay = 86400000;

    if (filter === 'today') return diffMs <= oneDay;
    if (filter === '7days') return diffMs <= 7 * oneDay;
    if (filter === '30days') return diffMs <= 30 * oneDay;
    if (filter === 'this_month') {
      const d = new Date(dateStr);
      const today = new Date();
      return d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
    }
    if (filter === 'older') return diffMs > 30 * oneDay;
    return true;
  };

  // Metrics Calculations
  const metrics = useMemo(() => {
    const totalRegistered = users.filter((u) => u.isRegistered !== false).length;
    const proUsers = users.filter((u) => u.planTier === 'pro').length;
    const freeUsers = users.filter((u) => u.planTier !== 'pro').length;
    const activeAffiliates = users.filter((u) => u.affiliateEnabled).length;

    const pendingPayments = payments.filter((p) => p.status === 'pending');
    const fakeAlertPayments = payments.filter(
      (p) => p.fraudAnalysis?.status === 'confirmed_fake' || p.fraudAnalysis?.status === 'suspicious'
    );
    const successfulPayments = payments.filter((p) => p.status === 'success');
    const totalRevenueIdr = successfulPayments.reduce((acc, curr) => acc + (curr.amountIdr || 0), 0);

    const pendingPayoutReferrals = referrals.filter((r) => r.status === 'ready_to_claim');
    const totalPendingCommission = pendingPayoutReferrals.reduce((acc, curr) => acc + curr.commissionEarnedIdr, 0);
    const totalPaidCommission = referrals
      .filter((r) => r.status === 'paid')
      .reduce((acc, curr) => acc + curr.commissionEarnedIdr, 0);

    return {
      totalRegistered,
      proUsers,
      freeUsers,
      activeAffiliates,
      pendingPaymentsCount: pendingPayments.length,
      fakeAlertCount: fakeAlertPayments.length,
      totalRevenueIdr,
      totalPendingCommission,
      totalPaidCommission,
      totalReferralRecruits: referrals.length,
    };
  }, [users, payments, referrals]);

  // --- FILTERED & SORTED USERS LIST ---
  const filteredAndSortedUsers = useMemo(() => {
    return users.filter((u) => {
      if (userSearchQuery.trim()) {
        const query = userSearchQuery.toLowerCase().trim();
        const matchName = (u.parentName || '').toLowerCase().includes(query);
        const matchEmail = (u.email || '').toLowerCase().includes(query);
        const matchWa = u.whatsapp ? u.whatsapp.toLowerCase().includes(query) : false;
        const matchId = (u.id || '').toLowerCase().includes(query);
        const matchAff = u.affiliateCode ? u.affiliateCode.toLowerCase().includes(query) : false;
        const matchRefBy = u.referredByCode ? u.referredByCode.toLowerCase().includes(query) : false;
        if (!matchName && !matchEmail && !matchWa && !matchId && !matchAff && !matchRefBy) {
          return false;
        }
      }

      const status = getUserSubStatus(u);
      if (userSubStatusFilter !== 'all') {
        if (userSubStatusFilter === 'active_pro' && status !== 'active_pro' && status !== 'lifetime') return false;
        if (userSubStatusFilter === 'free' && status !== 'free') return false;
        if (userSubStatusFilter === 'expired' && status !== 'expired') return false;
        if (userSubStatusFilter === 'lifetime' && status !== 'lifetime') return false;
      }

      if (userTierFilter !== 'all') {
        if (userTierFilter === 'pro' && u.planTier !== 'pro') return false;
        if (userTierFilter === 'free' && (u.planTier === 'pro' || !u.isRegistered)) return false;
        if (userTierFilter === 'guest' && u.isRegistered) return false;
      }

      if (!matchesDateFilter(u.createdAt, userDateFilter)) {
        return false;
      }

      if (userProviderFilter !== 'all') {
        const provider = u.authProvider || 'email';
        if (provider !== userProviderFilter) return false;
      }

      return true;
    }).sort((a, b) => {
      if (userSortBy === 'created_desc') {
        const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return timeB - timeA;
      }
      if (userSortBy === 'created_asc') {
        const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return timeA - timeB;
      }
      if (userSortBy === 'name_asc') {
        return (a.parentName || '').localeCompare(b.parentName || '');
      }
      if (userSortBy === 'name_desc') {
        return (b.parentName || '').localeCompare(a.parentName || '');
      }
      if (userSortBy === 'status_pro_first') {
        const aIsPro = a.planTier === 'pro' ? 1 : 0;
        const bIsPro = b.planTier === 'pro' ? 1 : 0;
        return bIsPro - aIsPro;
      }
      return 0;
    });
  }, [users, userSearchQuery, userSubStatusFilter, userTierFilter, userDateFilter, userProviderFilter, userSortBy]);

  const totalUserPages = Math.max(1, Math.ceil(filteredAndSortedUsers.length / userRowsPerPage));
  const currentSafePage = Math.min(Math.max(1, userPage), totalUserPages);
  const userStartIndex = (currentSafePage - 1) * userRowsPerPage;
  const userEndIndex = userStartIndex + userRowsPerPage;
  const paginatedUsers = useMemo(() => {
    return filteredAndSortedUsers.slice(userStartIndex, userEndIndex);
  }, [filteredAndSortedUsers, userStartIndex, userEndIndex]);

  const handleResetUserFilters = () => {
    setUserSearchQuery('');
    setUserSubStatusFilter('all');
    setUserTierFilter('all');
    setUserDateFilter('all');
    setUserProviderFilter('all');
    setUserSortBy('created_desc');
    setUserPage(1);
  };

  const handleExportUsersCsv = () => {
    let csv = 'data:text/csv;charset=utf-8,';
    csv += 'User ID,Nama Ortu,Email,WhatsApp,Tier,Status Subscription,Masa Berlaku,Provider,Tanggal Daftar,PIN Akun,Kode Referral\n';

    filteredAndSortedUsers.forEach((u) => {
      const status = getUserSubStatus(u);
      const row = [
        `"${u.id}"`,
        `"${u.parentName}"`,
        `"${u.email}"`,
        `"${u.whatsapp || '-'}"`,
        `"${u.planTier.toUpperCase()}"`,
        `"${status.toUpperCase()}"`,
        `"${u.entitlementExpiry || '-'}"`,
        `"${u.authProvider || 'email'}"`,
        `"${u.createdAt ? new Date(u.createdAt).toISOString().split('T')[0] : '-'}"`,
        `"${u.pin || '2026'}"`,
        `"${u.affiliateCode || '-'}"`,
      ].join(',');
      csv += row + '\n';
    });

    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csv));
    link.setAttribute('download', `Daftar_Pengguna_CahayaTahfiz_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --- FILTERED PAYMENTS LIST ---
  const filteredPayments = useMemo(() => {
    return payments.filter((p) => {
      if (paymentSearchQuery.trim()) {
        const q = paymentSearchQuery.toLowerCase().trim();
        const mInv = p.invoiceNumber.toLowerCase().includes(q);
        const mName = (p.userName || '').toLowerCase().includes(q);
        const mEmail = (p.userEmail || '').toLowerCase().includes(q);
        const mBank = (p.transferBankName || p.paymentMethodDetails || '').toLowerCase().includes(q);
        const mPlan = p.planName.toLowerCase().includes(q);
        const mRrn = (p.transferRrn || '').toLowerCase().includes(q);
        if (!mInv && !mName && !mEmail && !mBank && !mPlan && !mRrn) return false;
      }

      if (paymentStatusFilter !== 'all' && p.status !== paymentStatusFilter) return false;

      if (paymentFraudFilter !== 'all') {
        const fStatus = p.fraudAnalysis?.status || 'unverified';
        if (fStatus !== paymentFraudFilter) return false;
      }

      return true;
    });
  }, [payments, paymentSearchQuery, paymentStatusFilter, paymentFraudFilter]);

  // --- VERIFY PAYMENT (CONFIRMED REAL) ---
  const handleVerifyPayment = (tx: PaymentTransaction) => {
    const success = StorageService.verifyManualBankTransfer(
      tx.id,
      `Diverifikasi ASLI oleh Admin (${currentUser.parentName}) pada ${new Date().toLocaleString('id-ID')}`
    );
    if (success) {
      showToast(`✅ Pembayaran ${tx.invoiceNumber} (${tx.planName}) berhasil diverifikasi! Pengguna aktif sebagai PRO.`);
      refreshAdminData();
      if (inspectingPayment?.id === tx.id) {
        setInspectingPayment(null);
      }
    }
  };

  // --- FLAG PAYMENT AS FAKE (REJECT FRAUD) ---
  const handleConfirmFlagFake = (tx: PaymentTransaction, reason: string) => {
    const finalReason = reason.trim() || 'Struk terindikasi editan / mutasi tidak ditemukan di rekening yayasan.';
    const success = StorageService.flagPaymentAsFake(tx.id, finalReason, currentUser.parentName);
    if (success) {
      showToast(`⛔ Transaksi ${tx.invoiceNumber} BERHASIL DITANDAI SEBAGAI TRANSFER PALSU & DITOLAK.`);
      refreshAdminData();
      setRejectPromptPayment(null);
      setRejectReasonInput('');
      if (inspectingPayment?.id === tx.id) {
        setInspectingPayment(null);
      }
    }
  };

  // --- HANDLE QUICK TOGGLE TIER ---
  const handleQuickToggleTier = (user: UserAccount) => {
    const newTier: PlanTier = user.planTier === 'pro' ? 'free' : 'pro';
    StorageService.updateUserByAdmin(user.id, {
      planTier: newTier,
      entitlement: newTier === 'pro' ? 'pro' : 'free',
      entitlementExpiry: newTier === 'pro' ? '2027-10-15' : '2026-12-31',
    });
    showToast(`Status langganan ${user.parentName} diubah ke ${newTier.toUpperCase()}`);
    refreshAdminData();
  };

  // --- HANDLE CHANGE USER PASSWORD / PIN ---
  const handleSaveUserPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordModalUser) return;

    const res = StorageService.updateUserPasswordOrPin(
      passwordModalUser.id,
      newPasswordInput,
      passwordNotesInput,
      currentUser.parentName
    );

    if (res.success) {
      showToast(res.message);
      refreshAdminData();
      setPasswordModalUser(null);
      setNewPasswordInput('');
      setPasswordNotesInput('');
    } else {
      showToast(res.message);
    }
  };

  // --- HANDLE CHANGE MASTER ADMIN PIN ---
  const handleChangeMasterAdminPin = (e: React.FormEvent) => {
    e.preventDefault();
    const currentStoredPin = StorageService.getAdminMasterPin();

    if (currentMasterPinInput !== currentStoredPin && currentMasterPinInput !== 'admin123') {
      setMasterPinNotice({ type: 'error', msg: 'PIN Master saat ini salah. Pastikan PIN benar.' });
      return;
    }

    if (newMasterPinInput !== confirmMasterPinInput) {
      setMasterPinNotice({ type: 'error', msg: 'Konfirmasi PIN baru tidak cocok.' });
      return;
    }

    const res = StorageService.setAdminMasterPin(newMasterPinInput, currentUser.parentName);
    if (res.success) {
      setMasterPinNotice({ type: 'success', msg: 'PIN Master Admin berhasil diubah!' });
      setCurrentMasterPinInput('');
      setNewMasterPinInput('');
      setConfirmMasterPinInput('');
      refreshAdminData();
      setTimeout(() => setMasterPinNotice(null), 4000);
    } else {
      setMasterPinNotice({ type: 'error', msg: res.message });
    }
  };

  // --- HANDLE SUBMIT MANUAL ASSIGN PRO ---
  const handleSubmitManualAssign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignUserId) {
      showToast('Pilih akun pengguna tujuan terlebih dahulu.');
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
    refreshAdminData();
    setActiveTab('users');
  };

  // --- HANDLE PROCESS AFFILIATE PAYOUT ---
  const handlePayoutAffiliate = (affiliateUserId: string) => {
    const affiliateRecords = referrals.filter(
      (r) => r.affiliateUserId === affiliateUserId && r.status === 'ready_to_claim'
    );
    if (affiliateRecords.length === 0) {
      showToast('Tidak ada komisi yang menunggu pencairan untuk mitra ini.');
      return;
    }

    const totalAmount = affiliateRecords.reduce((acc, curr) => acc + curr.commissionEarnedIdr, 0);
    const ref = prompt(
      `Konfirmasi pencairan komisi Rp ${totalAmount.toLocaleString('id-ID')}?\nMasukkan nomor referensi transfer bank (cth: BSI-TRF-882910):`,
      `BSI-TRF-${Date.now().toString().slice(-6)}`
    );

    if (!ref) return;

    const ids = affiliateRecords.map((r) => r.id);
    const success = StorageService.payoutAffiliateCommission(ids, ref);
    if (success) {
      showToast(`💸 Komisi Rp ${totalAmount.toLocaleString('id-ID')} berhasil dicairkan dengan referensi ${ref}!`);
      refreshAdminData();
    }
  };

  // --- FILTERED AUDIT LOGS ---
  const filteredAuditLogs = useMemo(() => {
    return auditLogs.filter((l) => {
      if (auditActionFilter !== 'all' && l.action !== auditActionFilter) return false;
      if (auditSearchQuery.trim()) {
        const q = auditSearchQuery.toLowerCase().trim();
        const mAdmin = (l.adminName || '').toLowerCase().includes(q);
        const mUser = (l.targetUserName || '').toLowerCase().includes(q);
        const mEmail = (l.targetUserEmail || '').toLowerCase().includes(q);
        const mDesc = (l.description || '').toLowerCase().includes(q);
        if (!mAdmin && !mUser && !mEmail && !mDesc) return false;
      }
      return true;
    });
  }, [auditLogs, auditActionFilter, auditSearchQuery]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-[#F8FAFC] border-2 border-slate-700/80 rounded-3xl w-full max-w-6xl max-h-[96vh] flex flex-col shadow-2xl overflow-hidden text-slate-800">
        
        {/* HEADER BAR */}
        <div className="bg-gradient-to-r from-[#0F172A] via-[#1E293B] to-[#0F172A] text-white p-4 sm:p-5 flex items-center justify-between border-b border-slate-700 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-400 shadow-inner">
              <ShieldCheck size={28} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black font-heading tracking-tight text-white">
                  Pusat Kendali Admin & Pengelola
                </h2>
                <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
                  Master Portal 🛡️
                </span>
                <span className="hidden md:inline text-[9px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-md border border-slate-700 font-mono">
                  Multi-System Control
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5 font-medium">
                Pantau pendaftaran, verifikasi transfer & deteksi palsu, kelola password pengguna, dan assign PRO manual
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={refreshAdminData}
              title="Perbarui Data"
              className="p-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer border border-slate-700 flex items-center gap-1.5 text-xs font-bold"
            >
              <RefreshCw size={14} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            <button
              onClick={onClose}
              className="p-2.5 rounded-2xl bg-slate-800 hover:bg-red-500/20 hover:text-red-300 text-slate-400 transition-all cursor-pointer border border-slate-700"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* NOTIFICATION TOAST */}
        {actionSuccessNotice && (
          <div className="bg-emerald-600 text-white px-4 py-2.5 text-xs font-bold flex items-center justify-between shadow-md shrink-0 animate-in slide-in-from-top">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} />
              <span>{actionSuccessNotice}</span>
            </div>
            <button onClick={() => setActionSuccessNotice(null)} className="text-emerald-200 hover:text-white">
              <X size={14} />
            </button>
          </div>
        )}

        {/* NAVIGATION TABS SELECTOR */}
        <div className="bg-white border-b border-slate-200 px-4 sm:px-6 py-2.5 flex items-center gap-1.5 sm:gap-2 overflow-x-auto shrink-0 scrollbar-none">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3.5 py-2 rounded-2xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer shrink-0 ${
              activeTab === 'overview'
                ? 'bg-[#164C68] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <TrendingUp size={14} />
            <span>Ringkasan Metrik</span>
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={`px-3.5 py-2 rounded-2xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer shrink-0 ${
              activeTab === 'users'
                ? 'bg-[#164C68] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Users size={14} />
            <span>Pendaftaran & Pengguna ({users.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('subscriptions')}
            className={`px-3.5 py-2 rounded-2xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer shrink-0 ${
              activeTab === 'subscriptions'
                ? 'bg-[#164C68] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <CreditCard size={14} />
            <span>Pembayaran & Transfer ({payments.length})</span>
            {metrics.pendingPaymentsCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-amber-500 text-white text-[10px] flex items-center justify-center font-black animate-pulse">
                {metrics.pendingPaymentsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('fraud_detection')}
            className={`px-3.5 py-2 rounded-2xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer shrink-0 ${
              activeTab === 'fraud_detection'
                ? 'bg-rose-700 text-white shadow-xs ring-2 ring-rose-200'
                : 'text-rose-800 bg-rose-50 hover:bg-rose-100 border border-rose-200'
            }`}
          >
            <ShieldAlert size={14} />
            <span>Deteksi Transfer Palsu 🛡️</span>
            {metrics.fakeAlertCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-rose-600 text-white text-[9px] font-black">
                {metrics.fakeAlertCount} Perlu Dicek
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('security_passwords')}
            className={`px-3.5 py-2 rounded-2xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer shrink-0 ${
              activeTab === 'security_passwords'
                ? 'bg-indigo-700 text-white shadow-xs'
                : 'text-indigo-800 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200'
            }`}
          >
            <KeyRound size={14} />
            <span>Ganti Password & PIN 🔑</span>
          </button>

          <button
            onClick={() => setActiveTab('affiliates')}
            className={`px-3.5 py-2 rounded-2xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer shrink-0 ${
              activeTab === 'affiliates'
                ? 'bg-purple-800 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Share2 size={14} />
            <span>Afiliasi Sahabat Syiar ({metrics.totalReferralRecruits})</span>
          </button>

          <button
            onClick={() => setActiveTab('manual_assign')}
            className={`px-3.5 py-2 rounded-2xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer shrink-0 ${
              activeTab === 'manual_assign'
                ? 'bg-amber-500 text-slate-950 shadow-xs'
                : 'text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-200'
            }`}
          >
            <Crown size={14} />
            <span>Assign PRO Sub Manual 👑</span>
          </button>

          <button
            onClick={() => setActiveTab('audit_logs')}
            className={`px-3.5 py-2 rounded-2xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer shrink-0 ${
              activeTab === 'audit_logs'
                ? 'bg-slate-800 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <History size={14} />
            <span>Log Audit Admin ({auditLogs.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('rubric')}
            className={`px-3.5 py-2 rounded-2xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer shrink-0 ${
              activeTab === 'rubric'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200'
            }`}
          >
            <BookOpen size={14} />
            <span>Rubrik Tartil (Anti-Ngaco)</span>
          </button>
        </div>

        {/* TAB CONTENTS CONTAINER */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6">

          {/* ======================================================== */}
          {/* TAB 1: OVERVIEW METRICS                                  */}
          {/* ======================================================== */}
          {activeTab === 'overview' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Alert Banner for Fake / Suspicious transfers */}
              {metrics.fakeAlertCount > 0 && (
                <div className="bg-rose-50 border-2 border-rose-300 rounded-3xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-rose-600 text-white flex items-center justify-center shrink-0">
                      <ShieldAlert size={22} />
                    </div>
                    <div>
                      <h4 className="font-black text-rose-950 text-sm">
                        Perhatian Admin: Terdeteksi {metrics.fakeAlertCount} Transaksi Mencurigakan / Indikasi Palsu!
                      </h4>
                      <p className="text-xs text-rose-800">
                        Mesin deteksi mendeteksi struk transfer tanpa mutasi bank yayasan atau pola RRN fiktif.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveTab('fraud_detection')}
                    className="px-4 py-2 rounded-2xl bg-rose-700 hover:bg-rose-800 text-white text-xs font-black shrink-0 cursor-pointer shadow-xs"
                  >
                    Buka Deteksi Transfer Palsu ➔
                  </button>
                </div>
              )}

              {/* Metric Cards Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-xs space-y-1">
                  <div className="flex items-center justify-between text-slate-500">
                    <span className="text-[11px] font-bold uppercase tracking-wider">Total Terdaftar</span>
                    <Users size={18} className="text-[#08B9EF]" />
                  </div>
                  <div className="text-2xl sm:text-3xl font-black font-heading text-[#164C68]">
                    {metrics.totalRegistered} <span className="text-xs font-bold text-slate-400">Akun</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                    <span className="text-amber-600 font-bold">{metrics.proUsers} PRO</span>
                    <span>•</span>
                    <span className="text-slate-600">{metrics.freeUsers} Free</span>
                  </div>
                </div>

                <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-xs space-y-1">
                  <div className="flex items-center justify-between text-slate-500">
                    <span className="text-[11px] font-bold uppercase tracking-wider">Verifikasi Transfer</span>
                    <Clock size={18} className="text-amber-500" />
                  </div>
                  <div className="text-2xl sm:text-3xl font-black font-heading text-amber-600">
                    {metrics.pendingPaymentsCount} <span className="text-xs font-bold text-slate-400">Antrean</span>
                  </div>
                  <div className="text-[11px] text-slate-500">
                    {metrics.pendingPaymentsCount > 0 ? (
                      <span className="text-amber-700 font-bold">Cek mutasi rekening yayasan</span>
                    ) : (
                      <span className="text-emerald-600 font-bold">Semua transfer selesai diverifikasi</span>
                    )}
                  </div>
                </div>

                <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-xs space-y-1">
                  <div className="flex items-center justify-between text-slate-500">
                    <span className="text-[11px] font-bold uppercase tracking-wider">Total Omset Sukses</span>
                    <DollarSign size={18} className="text-emerald-600" />
                  </div>
                  <div className="text-2xl sm:text-3xl font-black font-heading text-emerald-700">
                    Rp {(metrics.totalRevenueIdr / 1000).toLocaleString('id-ID')}k
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Dari paket bulanan, tahunan & lifetime
                  </div>
                </div>

                <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-xs space-y-1">
                  <div className="flex items-center justify-between text-slate-500">
                    <span className="text-[11px] font-bold uppercase tracking-wider">Mitra Afiliasi</span>
                    <Share2 size={18} className="text-purple-600" />
                  </div>
                  <div className="text-2xl sm:text-3xl font-black font-heading text-purple-700">
                    {metrics.activeAffiliates} <span className="text-xs font-bold text-slate-400">Mitra</span>
                  </div>
                  <div className="text-[11px] text-slate-500">
                    {metrics.totalReferralRecruits} santri rekrutan
                  </div>
                </div>
              </div>

              {/* Quick Actions Shortcuts */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <button
                  onClick={() => setActiveTab('fraud_detection')}
                  className="p-4 rounded-3xl bg-white border border-slate-200 hover:border-rose-400 text-left shadow-xs flex items-center justify-between group transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center font-bold">
                      🛡️
                    </div>
                    <div>
                      <span className="font-black text-slate-900 block text-xs">Inspeksi & Anti-Fraud</span>
                      <span className="text-[11px] text-slate-500">Cek struk editan vs mutasi bank</span>
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-slate-400 group-hover:translate-x-1 transition-transform" />
                </button>

                <button
                  onClick={() => setActiveTab('security_passwords')}
                  className="p-4 rounded-3xl bg-white border border-slate-200 hover:border-indigo-400 text-left shadow-xs flex items-center justify-between group transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                      🔑
                    </div>
                    <div>
                      <span className="font-black text-slate-900 block text-xs">Ganti Password / PIN User</span>
                      <span className="text-[11px] text-slate-500">Reset PIN akun santri & master admin</span>
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-slate-400 group-hover:translate-x-1 transition-transform" />
                </button>

                <button
                  onClick={() => setActiveTab('manual_assign')}
                  className="p-4 rounded-3xl bg-white border border-slate-200 hover:border-amber-400 text-left shadow-xs flex items-center justify-between group transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                      👑
                    </div>
                    <div>
                      <span className="font-black text-slate-900 block text-xs">Assign PRO Sub Manual</span>
                      <span className="text-[11px] text-slate-500">Beri akses PRO langsung ke santri</span>
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-slate-400 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 2: SISTEM PANTAU USER PENDAFTARAN & FILTER SKALA BESAR*/}
          {/* ======================================================== */}
          {activeTab === 'users' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              {/* Stat Chips */}
              <div className="flex flex-wrap items-center justify-between gap-2 bg-white p-3.5 rounded-3xl border border-slate-200 shadow-xs">
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="font-black text-slate-800">
                    Menampilkan {filteredAndSortedUsers.length} dari {users.length} Akun
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 font-bold text-[10px]">
                    {filteredAndSortedUsers.filter((u) => u.planTier === 'pro').length} PRO Aktif
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-bold text-[10px]">
                    {filteredAndSortedUsers.filter((u) => u.planTier !== 'pro').length} Free
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                    {filteredAndSortedUsers.filter((u) => matchesDateFilter(u.createdAt, '7days')).length} Baru 7 Hari
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleExportUsersCsv}
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <FileSpreadsheet size={13} />
                    <span>Ekspor User (CSV)</span>
                  </button>
                  <button
                    onClick={() => {
                      setAssignUserId(users[0]?.id || '');
                      setActiveTab('manual_assign');
                    }}
                    className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs flex items-center gap-1 cursor-pointer shadow-2xs"
                  >
                    <Crown size={13} />
                    <span>Assign PRO Manual</span>
                  </button>
                </div>
              </div>

              {/* Advanced Filter Toolbar */}
              <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs space-y-3">
                <div className="flex flex-col md:flex-row items-center gap-2.5">
                  {/* Search Bar */}
                  <div className="relative flex-1 w-full">
                    <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Cari nama orang tua, email, whatsapp, ID user, referral..."
                      value={userSearchQuery}
                      onChange={(e) => {
                        setUserSearchQuery(e.target.value);
                        setUserPage(1);
                      }}
                      className="w-full pl-10 pr-8 py-2 bg-slate-50 border border-slate-300 rounded-2xl text-xs font-medium focus:outline-none focus:border-[#08B9EF]"
                    />
                    {userSearchQuery && (
                      <button
                        onClick={() => setUserSearchQuery('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                      >
                        <X size={13} />
                      </button>
                    )}
                  </div>

                  {/* Reset Button if active */}
                  {(userSearchQuery || userSubStatusFilter !== 'all' || userTierFilter !== 'all' || userDateFilter !== 'all' || userProviderFilter !== 'all') && (
                    <button
                      onClick={handleResetUserFilters}
                      className="px-3 py-2 rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs flex items-center gap-1 cursor-pointer shrink-0"
                    >
                      <RotateCcw size={12} />
                      <span>Reset Filter</span>
                    </button>
                  )}
                </div>

                {/* Filters Row */}
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-2 text-xs">
                  {/* 1. Status Sub Filter */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                      Status Langganan:
                    </label>
                    <select
                      value={userSubStatusFilter}
                      onChange={(e) => {
                        setUserSubStatusFilter(e.target.value as any);
                        setUserPage(1);
                      }}
                      className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:border-[#08B9EF]"
                    >
                      <option value="all">Semua Status</option>
                      <option value="active_pro">👑 Aktif PRO</option>
                      <option value="free">🟢 Free (Gratis)</option>
                      <option value="lifetime">🌟 Lifetime (Seumur Hidup)</option>
                      <option value="expired">⚠️ Kedaluwarsa</option>
                    </select>
                  </div>

                  {/* 2. Tier Filter */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                      Tier Akun:
                    </label>
                    <select
                      value={userTierFilter}
                      onChange={(e) => {
                        setUserTierFilter(e.target.value as any);
                        setUserPage(1);
                      }}
                      className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:border-[#08B9EF]"
                    >
                      <option value="all">Semua Tier</option>
                      <option value="pro">Tier PRO</option>
                      <option value="free">Tier Free</option>
                      <option value="guest">Tamu / Guest</option>
                    </select>
                  </div>

                  {/* 3. Tanggal Daftar Filter */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                      Tanggal Daftar:
                    </label>
                    <select
                      value={userDateFilter}
                      onChange={(e) => {
                        setUserDateFilter(e.target.value as any);
                        setUserPage(1);
                      }}
                      className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:border-[#08B9EF]"
                    >
                      <option value="all">Semua Waktu</option>
                      <option value="today">Hari Ini (24 Jam)</option>
                      <option value="7days">7 Hari Terakhir</option>
                      <option value="30days">30 Hari Terakhir</option>
                      <option value="this_month">Bulan Ini (Okt 2026)</option>
                      <option value="older">&gt; 30 Hari Lalu</option>
                    </select>
                  </div>

                  {/* 4. Provider Filter */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                      Saluran Daftar:
                    </label>
                    <select
                      value={userProviderFilter}
                      onChange={(e) => {
                        setUserProviderFilter(e.target.value as any);
                        setUserPage(1);
                      }}
                      className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:border-[#08B9EF]"
                    >
                      <option value="all">Semua Channel</option>
                      <option value="google">Google Gmail</option>
                      <option value="whatsapp">WhatsApp OTP</option>
                      <option value="email">Email Mandiri</option>
                    </select>
                  </div>

                  {/* 5. Sort By */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                      Urutkan Berdasarkan:
                    </label>
                    <select
                      value={userSortBy}
                      onChange={(e) => setUserSortBy(e.target.value as any)}
                      className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:border-[#08B9EF]"
                    >
                      <option value="created_desc">Terbaru Mendaftar</option>
                      <option value="created_asc">Terlama Mendaftar</option>
                      <option value="name_asc">Nama (A - Z)</option>
                      <option value="name_desc">Nama (Z - A)</option>
                      <option value="status_pro_first">Prioritas PRO</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Users Table */}
              <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                        <th className="p-3.5 pl-5">Orang Tua & ID</th>
                        <th className="p-3.5">Kontak</th>
                        <th className="p-3.5">Status Langganan</th>
                        <th className="p-3.5">Masa Berlaku</th>
                        <th className="p-3.5">Tanggal Daftar</th>
                        <th className="p-3.5">PIN / Keamanan</th>
                        <th className="p-3.5 text-right pr-5">Aksi Admin</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {paginatedUsers.length > 0 ? (
                        paginatedUsers.map((u) => {
                          const status = getUserSubStatus(u);
                          return (
                            <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                              {/* Nama & ID */}
                              <td className="p-3.5 pl-5">
                                <div className="flex items-center gap-2.5">
                                  <div className="w-9 h-9 rounded-2xl bg-cyan-100 text-cyan-800 flex items-center justify-center font-black text-xs shrink-0">
                                    {u.parentName ? u.parentName.charAt(0) : 'U'}
                                  </div>
                                  <div>
                                    <div className="flex items-center gap-1.5">
                                      <span className="font-black text-slate-900">{u.parentName}</span>
                                      {u.role === 'admin' && (
                                        <span className="px-1.5 py-0.2 rounded-md bg-purple-100 text-purple-800 font-bold text-[9px]">
                                          ADMIN
                                        </span>
                                      )}
                                      {u.role === 'affiliate' && (
                                        <span className="px-1.5 py-0.2 rounded-md bg-emerald-100 text-emerald-800 font-bold text-[9px]">
                                          MITRA
                                        </span>
                                      )}
                                    </div>
                                    <span className="font-mono text-[10px] text-slate-400 block">{u.id}</span>
                                  </div>
                                </div>
                              </td>

                              {/* Kontak */}
                              <td className="p-3.5">
                                <div className="space-y-0.5">
                                  <div className="flex items-center gap-1 text-slate-700">
                                    <span className="font-semibold">{u.email}</span>
                                    <button
                                      onClick={() => copyToClipboard(u.email, `email-${u.id}`)}
                                      className="text-slate-400 hover:text-cyan-600 p-0.5"
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
                                    <span className="text-[10px] text-slate-400">Tanpa WA</span>
                                  )}
                                </div>
                              </td>

                              {/* Status Sub */}
                              <td className="p-3.5">
                                <span
                                  className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase inline-flex items-center gap-1 ${
                                    status === 'lifetime'
                                      ? 'bg-purple-100 text-purple-900 border border-purple-300'
                                      : status === 'active_pro'
                                      ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                      : status === 'expired'
                                      ? 'bg-rose-100 text-rose-900 border border-rose-300'
                                      : 'bg-slate-100 text-slate-600'
                                  }`}
                                >
                                  {status === 'lifetime'
                                    ? '🌟 LIFETIME'
                                    : status === 'active_pro'
                                    ? '👑 PRO AKTIF'
                                    : status === 'expired'
                                    ? '⚠️ KEDALUWARSA'
                                    : '🟢 FREE'}
                                </span>
                              </td>

                              {/* Masa Berlaku */}
                              <td className="p-3.5 text-slate-600">
                                {status === 'lifetime' ? (
                                  <span className="font-bold text-purple-900">Seumur Hidup</span>
                                ) : status === 'active_pro' ? (
                                  <span className="font-bold text-amber-900">
                                    s/d {u.entitlementExpiry || '2027-10-15'}
                                  </span>
                                ) : status === 'expired' ? (
                                  <span className="text-rose-700 font-bold">
                                    Habis: {u.entitlementExpiry}
                                  </span>
                                ) : (
                                  <span className="text-slate-400">Akun Gratis</span>
                                )}
                              </td>

                              {/* Tanggal Daftar */}
                              <td className="p-3.5 text-slate-600 text-[11px]">
                                <span className="font-semibold block">
                                  {u.createdAt ? new Date(u.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}
                                </span>
                                <span className="text-[10px] text-slate-400 capitalize">
                                  via {u.authProvider || 'email'}
                                </span>
                              </td>

                              {/* PIN / Password */}
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
                                    className="text-[10px] text-indigo-700 hover:text-indigo-900 font-bold flex items-center gap-1 hover:underline cursor-pointer block"
                                  >
                                    <KeyRound size={11} />
                                    <span>Ganti PIN</span>
                                  </button>
                                </div>
                              </td>

                              {/* Aksi Admin */}
                              <td className="p-3.5 text-right pr-5">
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    onClick={() => setSelectedUserDetail(u)}
                                    title="Lihat Detail Profil & Santri"
                                    className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
                                  >
                                    <Eye size={13} />
                                  </button>
                                  <button
                                    onClick={() => {
                                      setAssignUserId(u.id);
                                      setActiveTab('manual_assign');
                                    }}
                                    className="px-2 py-1 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-950 font-black text-[10px] cursor-pointer inline-flex items-center gap-1"
                                    title="Assign PRO Manual"
                                  >
                                    <Crown size={11} />
                                    <span>Assign PRO</span>
                                  </button>
                                  <button
                                    onClick={() => handleQuickToggleTier(u)}
                                    className="px-2 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[10px] cursor-pointer"
                                    title="Toggle PRO / Free"
                                  >
                                    Toggle
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={7} className="p-8 text-center text-slate-400">
                            Tidak ada pengguna yang cocok dengan kriteria pencarian dan filter saat ini.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination Toolbar */}
                <div className="bg-slate-50 border-t border-slate-200 p-3 px-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
                  <div className="flex items-center gap-3">
                    <span>
                      Menampilkan <strong>{filteredAndSortedUsers.length > 0 ? userStartIndex + 1 : 0}</strong> -{' '}
                      <strong>{Math.min(userEndIndex, filteredAndSortedUsers.length)}</strong> dari{' '}
                      <strong>{filteredAndSortedUsers.length}</strong> pengguna
                    </span>
                    <div className="flex items-center gap-1">
                      <span className="text-[11px] text-slate-500">Baris:</span>
                      <select
                        value={userRowsPerPage}
                        onChange={(e) => {
                          setUserRowsPerPage(Number(e.target.value));
                          setUserPage(1);
                        }}
                        className="p-1 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-700"
                      >
                        <option value={10}>10</option>
                        <option value={25}>25</option>
                        <option value={50}>50</option>
                        <option value={100}>100</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setUserPage(1)}
                      disabled={userPage <= 1}
                      className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 disabled:opacity-40 font-bold cursor-pointer"
                    >
                      «
                    </button>
                    <button
                      onClick={() => setUserPage((p) => Math.max(1, p - 1))}
                      disabled={userPage <= 1}
                      className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 disabled:opacity-40 font-bold cursor-pointer"
                    >
                      ‹
                    </button>
                    <span className="px-3 py-1 bg-white font-mono font-bold border border-slate-200 rounded-lg">
                      {userPage} / {totalUserPages}
                    </span>
                    <button
                      onClick={() => setUserPage((p) => Math.min(totalUserPages, p + 1))}
                      disabled={userPage >= totalUserPages}
                      className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 disabled:opacity-40 font-bold cursor-pointer"
                    >
                      ›
                    </button>
                    <button
                      onClick={() => setUserPage(totalUserPages)}
                      disabled={userPage >= totalUserPages}
                      className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 disabled:opacity-40 font-bold cursor-pointer"
                    >
                      »
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 3: PEMBAYARAN & VERIFIKASI TRANSFER                  */}
          {/* ======================================================== */}
          {activeTab === 'subscriptions' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              {/* Payment Toolbar */}
              <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="relative w-full sm:w-80">
                  <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Cari invoice, nama user, bank, paket, RRN..."
                    value={paymentSearchQuery}
                    onChange={(e) => setPaymentSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-2xl text-xs font-medium focus:outline-none focus:border-[#08B9EF]"
                  />
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
                  <span className="text-xs font-bold text-slate-500 shrink-0">Filter Status:</span>
                  {(['all', 'pending', 'success', 'failed'] as const).map((st) => (
                    <button
                      key={st}
                      onClick={() => setPaymentStatusFilter(st)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer shrink-0 ${
                        paymentStatusFilter === st
                          ? 'bg-[#164C68] text-white shadow-2xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {st === 'pending' ? '⏳ Antrean Verifikasi' : st === 'success' ? '✅ Sukses' : st === 'failed' ? '❌ Gagal/Ditolak' : 'Semua'}
                    </button>
                  ))}
                  <button
                    onClick={() => setActiveTab('fraud_detection')}
                    className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs flex items-center gap-1 cursor-pointer shrink-0 shadow-2xs"
                  >
                    <ShieldAlert size={13} />
                    <span>Deteksi Palsu</span>
                  </button>
                </div>
              </div>

              {/* Payments Table */}
              <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                        <th className="p-3.5 pl-5">Invoice & Waktu</th>
                        <th className="p-3.5">Pembayar</th>
                        <th className="p-3.5">Paket & Nominal</th>
                        <th className="p-3.5">Metode / Bank & RRN</th>
                        <th className="p-3.5">Analisa Keaslian (Anti-Palsu)</th>
                        <th className="p-3.5">Status</th>
                        <th className="p-3.5 text-right pr-5">Aksi Admin</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredPayments.map((p) => {
                        const fraud = p.fraudAnalysis;
                        return (
                          <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                            {/* Invoice & Time */}
                            <td className="p-3.5 pl-5">
                              <span className="font-mono font-black text-slate-900 block">{p.invoiceNumber}</span>
                              <span className="text-[10px] text-slate-500">
                                {new Date(p.createdAt).toLocaleDateString('id-ID', {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                            </td>

                            {/* Pembayar */}
                            <td className="p-3.5">
                              <span className="font-bold text-slate-800 block">{p.userName || p.userId}</span>
                              <span className="text-[11px] text-slate-500 block">{p.userEmail}</span>
                              {p.userWhatsapp && (
                                <span className="text-[10px] text-emerald-700 font-medium block">
                                  WA: {p.userWhatsapp}
                                </span>
                              )}
                            </td>

                            {/* Paket & Nominal */}
                            <td className="p-3.5">
                              <span className="font-black text-slate-900 block">{p.planName}</span>
                              <span className="font-black text-emerald-700 text-sm">
                                Rp {(p.amountIdr || 0).toLocaleString('id-ID')}
                              </span>
                            </td>

                            {/* Bank & RRN */}
                            <td className="p-3.5">
                              <div className="space-y-0.5">
                                <span className="font-bold text-slate-700 block">
                                  {p.transferBankName || p.paymentMethodDetails || p.paymentMethod}
                                </span>
                                {p.transferRrn && (
                                  <span className="font-mono text-[10px] text-slate-500 block">
                                    RRN: {p.transferRrn}
                                  </span>
                                )}
                              </div>
                            </td>

                            {/* Analisa Keaslian Fraud */}
                            <td className="p-3.5">
                              {fraud ? (
                                <div className="space-y-1">
                                  <span
                                    className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase inline-flex items-center gap-1 ${
                                      fraud.status === 'verified_real'
                                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                        : fraud.status === 'confirmed_fake'
                                        ? 'bg-rose-100 text-rose-900 border border-rose-300'
                                        : 'bg-amber-100 text-amber-900 border border-amber-300'
                                    }`}
                                  >
                                    {fraud.status === 'verified_real'
                                      ? `🟢 Asli (${fraud.authenticityScore}%)`
                                      : fraud.status === 'confirmed_fake'
                                      ? `🔴 PALSU (${fraud.authenticityScore}%)`
                                      : `⚠️ Perlu Cek (${fraud.authenticityScore}%)`}
                                  </span>
                                  <button
                                    onClick={() => setInspectingPayment(p)}
                                    className="text-[10px] text-[#08B9EF] font-bold block hover:underline cursor-pointer"
                                  >
                                    Inspeksi Bukti ➔
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => setInspectingPayment(p)}
                                  className="text-[10px] text-slate-500 font-bold hover:text-cyan-700 underline cursor-pointer"
                                >
                                  Cek Keaslian Struk
                                </button>
                              )}
                            </td>

                            {/* Status */}
                            <td className="p-3.5">
                              <span
                                className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase inline-flex items-center gap-1 ${
                                  p.status === 'success'
                                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                    : p.status === 'pending'
                                    ? 'bg-amber-100 text-amber-900 border border-amber-300 animate-pulse'
                                    : 'bg-rose-100 text-rose-800 border border-rose-300'
                                }`}
                              >
                                {p.status === 'success' ? '✅ SUKSES' : p.status === 'pending' ? '⏳ PENDING' : '❌ GAGAL / PALSU'}
                              </span>
                            </td>

                            {/* Aksi Admin */}
                            <td className="p-3.5 text-right pr-5">
                              {p.status === 'pending' ? (
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    onClick={() => setInspectingPayment(p)}
                                    className="px-2.5 py-1.5 rounded-xl bg-cyan-50 hover:bg-cyan-100 text-cyan-900 font-black text-xs cursor-pointer"
                                    title="Inspeksi Struk & Cek Mutasi Bank"
                                  >
                                    🔍 Cek
                                  </button>
                                  <button
                                    onClick={() => handleVerifyPayment(p)}
                                    className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-xs cursor-pointer flex items-center gap-1 active:scale-95"
                                  >
                                    <Check size={12} />
                                    <span>Verifikasi PRO</span>
                                  </button>
                                  <button
                                    onClick={() => {
                                      setRejectPromptPayment(p);
                                      setRejectReasonInput('Struk terindikasi palsu / dana belum masuk mutasi bank yayasan.');
                                    }}
                                    className="px-2.5 py-1.5 rounded-xl bg-rose-100 hover:bg-rose-200 text-rose-800 font-bold text-xs cursor-pointer"
                                  >
                                    Tolak / Palsu
                                  </button>
                                </div>
                              ) : (
                                <span className="text-[11px] text-slate-400 font-semibold">
                                  Selesai Diproses
                                </span>
                              )}
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
          {/* TAB 4: DETEKSI TRANSFER PALSU & CEK MUTASI BANK YAYASAN */}
          {/* ======================================================== */}
          {activeTab === 'fraud_detection' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Educational & Safeguard Banner */}
              <div className="bg-gradient-to-r from-rose-950 via-slate-900 to-rose-950 text-white p-5 rounded-3xl border-2 border-rose-700/60 shadow-lg space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-rose-600/30 border border-rose-500/40 flex items-center justify-center text-rose-400 text-2xl">
                    🛡️
                  </div>
                  <div>
                    <h3 className="text-base font-black font-heading text-white">
                      Anti-Fraud Transfer Inspector & Cek Mutasi Bank Yayasan
                    </h3>
                    <p className="text-xs text-rose-200">
                      Melindungi yayasan dari penipuan struk palsu editan Canva/Photoshop. Sistem secara otomatis mencocokkan nominal, RRN, dan mutasi riil di rekening bank yayasan.
                    </p>
                  </div>
                </div>
              </div>

              {/* Feed Mutasi Rekening Bank Yayasan Realtime (BCA, Mandiri, BSI) */}
              <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Building size={16} className="text-cyan-700" />
                    <h4 className="font-black text-[#164C68] text-sm">
                      Feed Mutasi Kredit Rekening Yayasan (Riil Masuk Bank)
                    </h4>
                  </div>
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-200">
                    🟢 Live Terhubung Rekening Yayasan
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                  {bankMutations.map((m) => (
                    <div key={m.id} className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-black text-slate-800">{m.bankName.split(' ')[1] || m.bankName}</span>
                        <span className="font-mono text-[10px] text-slate-500">{m.accountNumber}</span>
                      </div>
                      <div className="text-base font-black text-emerald-700 font-mono">
                        +Rp {m.amount.toLocaleString('id-ID')}
                      </div>
                      <span className="text-[10px] text-slate-600 font-semibold block truncate">
                        Pengirim: {m.senderName}
                      </span>
                      <span className="font-mono text-[9px] text-slate-400 block truncate">
                        Ref: {m.referenceNumber}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Queue of Transfers to Verify */}
              <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-3">
                <h4 className="font-black text-[#164C68] text-sm flex items-center gap-2">
                  <ShieldAlert size={16} className="text-rose-600" />
                  <span>Daftar Bukti Transfer yang Harus Diperiksa Keasliannya:</span>
                </h4>

                <div className="space-y-3">
                  {payments.filter((p) => p.paymentMethod === 'bank_transfer_manual').map((tx) => {
                    const fraud = tx.fraudAnalysis;
                    const isConfirmedFake = fraud?.status === 'confirmed_fake' || tx.status === 'failed';
                    const isReal = fraud?.status === 'verified_real' || tx.status === 'success';

                    return (
                      <div
                        key={tx.id}
                        className={`p-4 rounded-2xl border-2 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-3 ${
                          isConfirmedFake
                            ? 'bg-rose-50/70 border-rose-300'
                            : isReal
                            ? 'bg-emerald-50/60 border-emerald-300'
                            : 'bg-amber-50/70 border-amber-300'
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-black text-slate-900 text-sm">
                              {tx.userName} ({tx.invoiceNumber})
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded-full font-black text-[10px] uppercase ${
                                isConfirmedFake
                                  ? 'bg-rose-600 text-white'
                                  : isReal
                                  ? 'bg-emerald-600 text-white'
                                  : 'bg-amber-500 text-slate-950 animate-pulse'
                              }`}
                            >
                              {isConfirmedFake
                                ? '🚨 TRANSFER PALSU'
                                : isReal
                                ? '✅ ASLI TERVERIFIKASI'
                                : '⚠️ BUTUH CEK MUTASI'}
                            </span>
                          </div>

                          <div className="text-xs text-slate-600 flex flex-wrap items-center gap-3">
                            <span>Paket: <strong>{tx.planName}</strong></span>
                            <span>Nominal: <strong className="text-emerald-700">Rp {tx.amountIdr.toLocaleString('id-ID')}</strong></span>
                            <span>Tujuan: <strong>{tx.transferBankName}</strong></span>
                            {tx.transferRrn && <span>RRN: <code className="bg-white px-1 rounded">{tx.transferRrn}</code></span>}
                          </div>

                          {fraud && (
                            <div className="text-[11px] text-slate-700 pt-1 space-y-0.5">
                              <span className="font-bold block">
                                Skor Keaslian: <span className={fraud.authenticityScore >= 70 ? 'text-emerald-700 font-black' : 'text-rose-700 font-black'}>{fraud.authenticityScore}%</span>
                              </span>
                              <ul className="list-disc list-inside text-slate-600">
                                {fraud.indicators.slice(0, 2).map((ind, i) => (
                                  <li key={i}>{ind}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => setInspectingPayment(tx)}
                            className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-800 font-black text-xs border border-slate-300 cursor-pointer shadow-2xs"
                          >
                            🔍 Inspeksi Bukti Struk
                          </button>
                          {tx.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleVerifyPayment(tx)}
                                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs cursor-pointer shadow-xs"
                              >
                                Verifikasi Asli
                              </button>
                              <button
                                onClick={() => {
                                  setRejectPromptPayment(tx);
                                  setRejectReasonInput('Struk palsu / tidak ada mutasi masuk rekening yayasan.');
                                }}
                                className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs cursor-pointer shadow-xs"
                              >
                                Tandai Palsu
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 5: GANTI PASSWORD & KEAMANAN AKUN                    */}
          {/* ======================================================== */}
          {activeTab === 'security_passwords' && (
            <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-200">
              {/* Section 1: Ganti Password / PIN User */}
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
                <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                    <KeyRound size={20} />
                  </div>
                  <div>
                    <h3 className="font-black text-[#164C68] text-base font-heading">
                      Ganti Password / Reset PIN Akun Pengguna (Orang Tua / Santri)
                    </h3>
                    <p className="text-xs text-slate-500">
                      Bantu orang tua yang lupa PIN/password atau ingin mengganti kode akses akun tahfiz mereka.
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-xs font-bold text-slate-700 block">
                    Pilih Pengguna yang Ingin Diubah Password / PIN:
                  </label>
                  <select
                    onChange={(e) => {
                      const u = users.find((user) => user.id === e.target.value);
                      if (u) {
                        setPasswordModalUser(u);
                        setNewPasswordInput('');
                        setPasswordNotesInput('');
                      }
                    }}
                    value={passwordModalUser?.id || ''}
                    className="w-full p-3 bg-slate-50 border border-slate-300 rounded-2xl text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="">-- Pilih Akun Orang Tua / Santri --</option>
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.parentName} ({u.email}) - PIN Saat Ini: {u.pin || '2026'} [{u.planTier.toUpperCase()}]
                      </option>
                    ))}
                  </select>
                </div>

                {passwordModalUser && (
                  <form onSubmit={handleSaveUserPassword} className="bg-indigo-50/50 border border-indigo-200 p-4 rounded-2xl space-y-3 text-xs">
                    <div className="flex items-center justify-between font-bold text-indigo-950">
                      <span>Akun Terpilih: <strong>{passwordModalUser.parentName}</strong></span>
                      <span className="font-mono text-slate-500">ID: {passwordModalUser.id}</span>
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-700 block">
                        Masukkan Password / PIN Baru:
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Contoh: 1234 atau bunda2026"
                        value={newPasswordInput}
                        onChange={(e) => setNewPasswordInput(e.target.value)}
                        className="w-full p-2.5 bg-white border border-indigo-300 rounded-xl text-xs font-mono font-bold text-indigo-900 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-700 block">
                        Catatan Admin (Alasan Reset):
                      </label>
                      <input
                        type="text"
                        placeholder="Contoh: Permintaan reset via WhatsApp ortu"
                        value={passwordNotesInput}
                        onChange={(e) => setPasswordNotesInput(e.target.value)}
                        className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs focus:outline-none"
                      />
                    </div>

                    <div className="pt-2 flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setPasswordModalUser(null)}
                        className="px-3.5 py-2 rounded-xl bg-slate-200 text-slate-700 font-bold"
                      >
                        Batal
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2 rounded-xl bg-indigo-700 hover:bg-indigo-800 text-white font-black shadow-md cursor-pointer active:scale-95"
                      >
                        Simpan Password / PIN Baru ➔
                      </button>
                    </div>
                  </form>
                )}
              </div>

              {/* Section 2: Ganti PIN Master Admin Portal */}
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
                <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                    <Lock size={20} />
                  </div>
                  <div>
                    <h3 className="font-black text-[#164C68] text-base font-heading">
                      Ganti PIN Master Admin Portal
                    </h3>
                    <p className="text-xs text-slate-500">
                      PIN ini digunakan untuk membuka panel admin tersembunyi (Shortcut: Ctrl+Shift+A). Default: 2026.
                    </p>
                  </div>
                </div>

                <form onSubmit={handleChangeMasterAdminPin} className="space-y-3 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label className="font-bold text-slate-700 block">
                        PIN Master Saat Ini:
                      </label>
                      <input
                        type="password"
                        required
                        placeholder="Default: 2026"
                        value={currentMasterPinInput}
                        onChange={(e) => setCurrentMasterPinInput(e.target.value)}
                        className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-bold"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-700 block">
                        PIN Master Baru:
                      </label>
                      <input
                        type="password"
                        required
                        placeholder="4-12 karakter"
                        value={newMasterPinInput}
                        onChange={(e) => setNewMasterPinInput(e.target.value)}
                        className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-bold"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-700 block">
                        Konfirmasi PIN Baru:
                      </label>
                      <input
                        type="password"
                        required
                        placeholder="Ulangi PIN baru"
                        value={confirmMasterPinInput}
                        onChange={(e) => setConfirmMasterPinInput(e.target.value)}
                        className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-bold"
                      />
                    </div>
                  </div>

                  {masterPinNotice && (
                    <div
                      className={`p-2.5 rounded-xl font-bold text-xs flex items-center gap-2 ${
                        masterPinNotice.type === 'success'
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                          : 'bg-rose-50 text-rose-800 border border-rose-300'
                      }`}
                    >
                      {masterPinNotice.type === 'success' ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
                      <span>{masterPinNotice.msg}</span>
                    </div>
                  )}

                  <div className="pt-2 flex justify-end">
                    <button
                      type="submit"
                      className="px-5 py-2.5 rounded-xl bg-[#164C68] hover:bg-[#113a50] text-white font-black shadow-md cursor-pointer active:scale-95 flex items-center gap-1.5"
                    >
                      <Lock size={13} />
                      <span>Perbarui PIN Master Admin</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 6: AFILIASI SAHABAT SYIAR & PENCAIRAN KOMISI         */}
          {/* ======================================================== */}
          {activeTab === 'affiliates' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-purple-950 text-white rounded-3xl p-5 shadow-lg border border-purple-700/60 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-purple-500/20 border border-purple-400/30 flex items-center justify-center text-3xl">
                    🎁
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-black font-heading">
                      Program Afiliasi Sahabat Syiar (10% Komisi)
                    </h3>
                    <p className="text-xs text-purple-200 mt-0.5">
                      Pantau santri yang mendaftar via kode referral, komisi per transaksi, dan pencairan komisi ke rekening mitra.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-center sm:text-right shrink-0">
                  <div className="bg-white/10 px-4 py-2 rounded-2xl border border-white/20">
                    <span className="text-[10px] text-purple-200 block uppercase font-bold">Siap Dicairkan</span>
                    <span className="text-lg font-black text-amber-300 font-mono">
                      Rp {metrics.totalPendingCommission.toLocaleString('id-ID')}
                    </span>
                  </div>
                  <div className="bg-white/10 px-4 py-2 rounded-2xl border border-white/20">
                    <span className="text-[10px] text-purple-200 block uppercase font-bold">Sudah Ditransfer</span>
                    <span className="text-lg font-black text-emerald-300 font-mono">
                      Rp {metrics.totalPaidCommission.toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Active Affiliates Table */}
              <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-4">
                <h4 className="font-black text-[#164C68] text-sm flex items-center gap-2">
                  <Users size={16} className="text-purple-600" />
                  <span>Daftar Mitra Afiliasi & Rekrutan Santri</span>
                </h4>

                <div className="space-y-4">
                  {users
                    .filter((u) => u.affiliateEnabled || referrals.some((r) => r.affiliateUserId === u.id))
                    .map((affiliate) => {
                      const affiliateRecords = referrals.filter(
                        (r) => r.affiliateUserId === affiliate.id || r.referralCode === affiliate.affiliateCode
                      );
                      const pendingComms = affiliateRecords
                        .filter((r) => r.status === 'ready_to_claim')
                        .reduce((a, b) => a + b.commissionEarnedIdr, 0);

                      return (
                        <div key={affiliate.id} className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-200/80 pb-3">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-800 font-black flex items-center justify-center">
                                {affiliate.parentName.charAt(0)}
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-black text-slate-900 text-sm">{affiliate.parentName}</span>
                                  <span className="font-mono text-[10px] font-black text-purple-700 bg-purple-100 px-2 py-0.5 rounded-md border border-purple-200">
                                    {affiliate.affiliateCode}
                                  </span>
                                </div>
                                <span className="text-xs text-slate-500">
                                  Rekening:{' '}
                                  {affiliate.affiliateBankDetails
                                    ? `${affiliate.affiliateBankDetails.bankName} - ${affiliate.affiliateBankDetails.accountNumber} an ${affiliate.affiliateBankDetails.accountHolder}`
                                    : 'Belum diisi oleh mitra'}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <div className="text-right mr-2">
                                <span className="text-[10px] text-slate-400 block font-bold">Pending Cair</span>
                                <span className="font-black text-purple-800 text-sm">
                                  Rp {pendingComms.toLocaleString('id-ID')}
                                </span>
                              </div>
                              {pendingComms > 0 && (
                                <button
                                  onClick={() => handlePayoutAffiliate(affiliate.id)}
                                  className="px-3.5 py-1.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-black text-xs cursor-pointer shadow-xs active:scale-95"
                                >
                                  Proses Transfer Komisi ➔
                                </button>
                              )}
                            </div>
                          </div>

                          <div>
                            <span className="text-[11px] font-bold text-slate-500 block mb-1">
                              Santri yang direkrut ({affiliateRecords.length} santri):
                            </span>
                            {affiliateRecords.length > 0 ? (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                {affiliateRecords.map((rec) => (
                                  <div key={rec.id} className="p-2.5 bg-white rounded-xl border border-slate-200 text-xs flex items-center justify-between">
                                    <div>
                                      <span className="font-bold text-slate-800 block">{rec.referredUserName}</span>
                                      <span className="text-[10px] text-slate-500">
                                        {rec.planName} • Rp {rec.transactionAmountIdr.toLocaleString('id-ID')}
                                      </span>
                                    </div>
                                    <div className="text-right">
                                      <span className="font-black text-emerald-700 block">
                                        +Rp {rec.commissionEarnedIdr.toLocaleString('id-ID')}
                                      </span>
                                      <span
                                        className={`text-[9px] font-black uppercase px-1.5 py-0.2 rounded-full ${
                                          rec.status === 'paid' ? 'bg-slate-100 text-slate-600' : 'bg-emerald-100 text-emerald-800'
                                        }`}
                                      >
                                        {rec.status === 'paid' ? 'Sudah Ditransfer' : 'Siap Cair'}
                                      </span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-xs text-slate-400 italic">Belum ada santri terdaftar via kode ini.</p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 7: ASSIGN PRO SUB MANUAL FORM                        */}
          {/* ======================================================== */}
          {activeTab === 'manual_assign' && (
            <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-200">
              <div className="bg-amber-50 border border-amber-300 rounded-3xl p-5 flex items-start gap-3.5 shadow-xs">
                <Crown size={28} className="text-amber-600 shrink-0 mt-0.5" />
                <div className="text-xs text-amber-950 space-y-1">
                  <h3 className="font-black text-sm text-amber-900">
                    Sistem Assign Langganan PRO Manual oleh Admin
                  </h3>
                  <p className="leading-relaxed">
                    Gunakan formulir ini untuk mengaktifkan status PRO santri/keluarga secara manual setelah menerima bukti transfer bank (BCA, Mandiri, BSI), beasiswa tahfiz, atau kerjasama lembaga/TPA. Akun akan langsung aktif instan dan masa aktif disesuaikan.
                  </p>
                </div>
              </div>

              <form onSubmit={handleSubmitManualAssign} className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
                {/* 1. Pilih User */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">
                    Pilih Pengguna Tujuan (Santri / Orang Tua):
                  </label>
                  <select
                    required
                    value={assignUserId}
                    onChange={(e) => setAssignUserId(e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-300 rounded-2xl text-xs font-bold text-slate-800 focus:outline-none focus:border-amber-500"
                  >
                    <option value="">-- Pilih Akun Pengguna --</option>
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.parentName} ({u.email}) - {u.planTier.toUpperCase()}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 2. Pilih Paket & Durasi */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 block">
                      Pilihan Paket:
                    </label>
                    <select
                      value={assignPlanId}
                      onChange={(e) => {
                        const val = e.target.value;
                        setAssignPlanId(val);
                        if (val === 'plan_lifetime') {
                          setAssignDurationMonths(999);
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
                      className="w-full p-3 bg-slate-50 border border-slate-300 rounded-2xl text-xs font-bold text-slate-800 focus:outline-none focus:border-amber-500"
                    >
                      <option value="plan_monthly">Cahaya Tahfiz Premium 1 Bulan</option>
                      <option value="plan_6month">Cahaya Tahfiz Premium 6 Bulan</option>
                      <option value="plan_yearly">Cahaya Tahfiz Premium 1 Tahun (Favorit)</option>
                      <option value="plan_lifetime">Wakaf Seumur Hidup (Lifetime)</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 block">
                      Nominal Pembayaran (IDR):
                    </label>
                    <input
                      type="number"
                      value={assignAmountIdr}
                      onChange={(e) => setAssignAmountIdr(Number(e.target.value))}
                      className="w-full p-3 bg-slate-50 border border-slate-300 rounded-2xl text-xs font-bold text-slate-800 focus:outline-none focus:border-amber-500"
                    />
                    <span className="text-[10px] text-slate-400">
                      Isi Rp 0 jika beasiswa tahfiz dhuafa / program khusus yayasan.
                    </span>
                  </div>
                </div>

                {/* 3. Sumber Pembayaran */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">
                    Sumber Pembayaran / Saluran Transfer:
                  </label>
                  <select
                    value={assignPaymentSource}
                    onChange={(e) => setAssignPaymentSource(e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-300 rounded-2xl text-xs font-bold text-slate-800 focus:outline-none focus:border-amber-500"
                  >
                    <option value="Transfer Bank BCA Manual (Rek Yayasan)">Transfer Bank BCA Manual (Yayasan 014-9988-234)</option>
                    <option value="Transfer Bank Mandiri (Rek Yayasan)">Transfer Bank Mandiri (Yayasan 137-00-88899-1)</option>
                    <option value="Transfer Bank Syariah Indonesia (BSI)">Transfer Bank BSI (Yayasan 718-2938-491)</option>
                    <option value="Beasiswa Tahfiz Dhuafa (Gratis Yayasan)">Beasiswa Tahfiz Dhuafa (Rp 0 - Program Yayasan)</option>
                    <option value="Kerjasama Pesantren / TPA">Kerjasama Lembaga Pesantren / TPA</option>
                    <option value="Tunai / Kasir Yayasan">Tunai / Kasir Yayasan</option>
                  </select>
                </div>

                {/* 4. Nomor Referensi Mutasi */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">
                    Nomor Referensi Bank / Bukti Resi:
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: BCA-998214 atau KWT-2026-001"
                    value={assignRefNumber}
                    onChange={(e) => setAssignRefNumber(e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-300 rounded-2xl text-xs font-medium text-slate-800 focus:outline-none focus:border-amber-500"
                  />
                </div>

                {/* 5. Catatan Admin */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">
                    Catatan Internal Admin (Opsional):
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Contoh: Mutasi bank terverifikasi masuk, akun langsung dinaikkan ke PRO"
                    value={assignNotes}
                    onChange={(e) => setAssignNotes(e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-300 rounded-2xl text-xs font-medium text-slate-800 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-sm shadow-md cursor-pointer transition-all active:scale-98 flex items-center justify-center gap-2"
                  >
                    <Crown size={18} />
                    <span>Aktifkan Status PRO Santri Sekarang 👑</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 8: LOG AUDIT ADMIN                                   */}
          {/* ======================================================== */}
          {activeTab === 'audit_logs' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="relative w-full sm:w-80">
                  <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Cari aksi, admin, target user, deskripsi..."
                    value={auditSearchQuery}
                    onChange={(e) => setAuditSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-2xl text-xs font-medium focus:outline-none focus:border-slate-800"
                  />
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
                  <span className="text-xs font-bold text-slate-500 shrink-0">Filter Aksi:</span>
                  <select
                    value={auditActionFilter}
                    onChange={(e) => setAuditActionFilter(e.target.value)}
                    className="p-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-700"
                  >
                    <option value="all">Semua Aksi</option>
                    <option value="assign_pro">👑 Assign PRO</option>
                    <option value="verify_payment">✅ Verifikasi Transfer</option>
                    <option value="flag_fake_transfer">🚨 Tandai Transfer Palsu</option>
                    <option value="change_password">🔑 Ganti Password/PIN User</option>
                    <option value="change_admin_pin">🔒 Ganti PIN Master Admin</option>
                    <option value="toggle_tier">🔄 Toggle Tier</option>
                    <option value="payout_commission">💸 Pencairan Komisi</option>
                  </select>
                </div>
              </div>

              {/* Audit Logs Table */}
              <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                        <th className="p-3 pl-4">Waktu</th>
                        <th className="p-3">Admin</th>
                        <th className="p-3">Jenis Aksi</th>
                        <th className="p-3">Target Pengguna</th>
                        <th className="p-3">Deskripsi & Perubahan</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredAuditLogs.length > 0 ? (
                        filteredAuditLogs.map((l) => (
                          <tr key={l.id} className="hover:bg-slate-50/70 transition-colors">
                            <td className="p-3 pl-4 text-slate-500 text-[11px] whitespace-nowrap">
                              {new Date(l.timestamp).toLocaleDateString('id-ID', {
                                day: 'numeric',
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </td>

                            <td className="p-3 font-black text-slate-800 whitespace-nowrap">
                              {l.adminName}
                            </td>

                            <td className="p-3">
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                                  l.action === 'flag_fake_transfer'
                                    ? 'bg-rose-100 text-rose-900 border border-rose-300'
                                    : l.action === 'change_password' || l.action === 'change_admin_pin'
                                    ? 'bg-indigo-100 text-indigo-900 border border-indigo-300'
                                    : l.action === 'verify_payment'
                                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                    : l.action === 'assign_pro'
                                    ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                    : 'bg-slate-100 text-slate-700'
                                }`}
                              >
                                {l.action.replace(/_/g, ' ')}
                              </span>
                            </td>

                            <td className="p-3">
                              <span className="font-bold text-slate-900 block">{l.targetUserName || '-'}</span>
                              {l.targetUserEmail && (
                                <span className="text-[10px] text-slate-400 block">{l.targetUserEmail}</span>
                              )}
                            </td>

                            <td className="p-3">
                              <span className="text-slate-800 block">{l.description}</span>
                              {l.previousValue && l.newValue && (
                                <div className="text-[10px] text-slate-500 mt-0.5">
                                  <span className="line-through text-slate-400">{l.previousValue}</span> ➔{' '}
                                  <strong className="text-emerald-700">{l.newValue}</strong>
                                </div>
                              )}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="p-8 text-center text-slate-400">
                            Belum ada riwayat audit log yang sesuai filter.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 9: RUBRIK TARTIL (ANTI-NGACO) PANDUAN RESMI          */}
          {/* ======================================================== */}
          {activeTab === 'rubric' && (
            <div className="space-y-6 max-w-3xl mx-auto animate-in fade-in duration-200">
              <div className="bg-emerald-950 text-white rounded-3xl p-6 shadow-md border border-emerald-800 space-y-2">
                <div className="flex items-center gap-2.5">
                  <BadgeCheck size={24} className="text-emerald-400" />
                  <h3 className="text-lg font-black font-heading text-white">
                    Standar Nilai Tartil & Rubrik Terbuka (Anti-Ngaco)
                  </h3>
                </div>
                <p className="text-xs text-emerald-200 leading-relaxed">
                  Penilaian hafalan santri di Cahaya Tahfiz dibangun dengan dua mesin teruji: <strong>1) Dewan Penguji Gemini AI Multimodal</strong> saat online, dan <strong>2) Mesin Tartil Audio-Acoustic</strong> saat offline atau kuota preview habis. Tidak ada nilai acak/ngaco!
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white border-2 border-emerald-200 rounded-3xl p-5 shadow-xs space-y-2">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-black text-sm">
                    40%
                  </div>
                  <h4 className="font-black text-slate-900 text-sm">
                    Akurasi Lafal & Kelengkapan
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Memastikan seluruh huruf dan kata ayat target terbaca tuntas tanpa terlewat, tertukar, atau tertinggal.
                  </p>
                </div>

                <div className="bg-white border-2 border-purple-200 rounded-3xl p-5 shadow-xs space-y-2">
                  <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-800 flex items-center justify-center font-black text-sm">
                    35%
                  </div>
                  <h4 className="font-black text-slate-900 text-sm">
                    Tajwid & Makharijul Huruf
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Memvalidasi makhraj (Halq, Lisan, Syafatain, Jauf), panjang mad 2 harakat, dengung ghunnah, dan pantulan qolqolah.
                  </p>
                </div>

                <div className="bg-white border-2 border-sky-200 rounded-3xl p-5 shadow-xs space-y-2">
                  <div className="w-10 h-10 rounded-2xl bg-sky-100 text-sky-800 flex items-center justify-center font-black text-sm">
                    25%
                  </div>
                  <h4 className="font-black text-slate-900 text-sm">
                    Kelancaran & Ritme Usia
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Ritme membaca tartil teratur disesuaikan dengan usia anak (4–7 thn tempo perlahan, 8–11 thn sedang).
                  </p>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-3 text-xs leading-relaxed text-slate-700">
                <h4 className="font-black text-[#164C68] text-sm flex items-center gap-2">
                  <ShieldCheck size={16} className="text-emerald-600" />
                  <span>Ambang Kelulusan Mutqin & Pengaman Suara Hening:</span>
                </h4>
                <ul className="space-y-2 list-disc list-inside">
                  <li>
                    <strong>Ambang Mutqin Minimal 70%:</strong> Kategori <em>Jayyid</em> (70–84%), dan <em>Mumtaz</em> (85–100%).
                  </li>
                  <li>
                    <strong>Deteksi Hening / Obrolan Santai:</strong> Rekaman tanpa lafal ayat Al-Qur'an otomatis dideteksi dan diberi skor rendah (15–35) serta berstatus <strong>Tidak Lulus</strong>.
                  </li>
                  <li>
                    <strong>Auditing Audio Santri:</strong> Setiap rekaman tersimpan di database lokal santri sehingga orang tua/guru dapat memverifikasi audio rekaman langsung.
                  </li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* FOOTER BAR */}
        <div className="bg-slate-100 border-t border-slate-200 px-6 py-3 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span className="font-bold text-slate-700">Portal Admin Aktif</span>
            <span>•</span>
            <span>Login: {currentUser.parentName} ({currentUser.email})</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('security_passwords')}
              className="px-3 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold cursor-pointer text-[11px] flex items-center gap-1"
            >
              <KeyRound size={12} />
              <span>Ganti PIN</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-xl bg-[#164C68] hover:bg-[#113a50] text-white font-bold transition-all cursor-pointer"
            >
              Tutup Panel
            </button>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* MODAL 1: INSPEKSI STRUK BUKTI TRANSFER & CEK MUTASI BANK */}
      {/* ======================================================== */}
      {inspectingPayment && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl border border-slate-300 max-w-2xl w-full p-6 space-y-4 shadow-2xl text-left max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-cyan-100 text-cyan-800 flex items-center justify-center font-bold">
                  🔍
                </div>
                <div>
                  <h3 className="font-black text-[#164C68] text-base font-heading">
                    Inspeksi Struk Bukti Transfer & Cek Mutasi Bank
                  </h3>
                  <p className="text-xs text-slate-500">
                    Invoice: <strong className="font-mono text-slate-800">{inspectingPayment.invoiceNumber}</strong>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setInspectingPayment(null)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700"
              >
                <X size={18} />
              </button>
            </div>

            {/* Visual Struk Transfer Simulasi Perbankan Asli */}
            <div className="bg-gradient-to-b from-slate-900 to-slate-950 text-white rounded-2xl p-5 border-2 border-slate-700 space-y-3 font-sans">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="font-black text-sm tracking-wider text-cyan-400">
                  BUKTI TRANSFER {inspectingPayment.transferBankName?.split(' ')[1] || 'BANK'}
                </span>
                <span className="font-mono text-[10px] text-slate-400">
                  {new Date(inspectingPayment.createdAt).toLocaleString('id-ID')}
                </span>
              </div>

              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Status Struk:</span>
                  <span className="text-emerald-400 font-bold">BERHASIL DITRANSFER</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Nominal Transfer:</span>
                  <span className="text-xl font-mono font-black text-white">
                    Rp {inspectingPayment.amountIdr.toLocaleString('id-ID')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Rekening Tujuan:</span>
                  <span className="font-mono font-bold text-slate-200">
                    Yayasan Cahaya Tahfiz ({inspectingPayment.transferBankName || 'Bank BCA'})
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Nama Pengirim:</span>
                  <span className="font-bold text-slate-200">
                    {inspectingPayment.senderAccountName || inspectingPayment.userName || 'PENGIRIM TIDAK TERTERA'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Nomor RRN / Referensi:</span>
                  <span className="font-mono text-cyan-300 font-bold">
                    {inspectingPayment.transferRrn || '889210492100'}
                  </span>
                </div>
              </div>
            </div>

            {/* HASIL ANALISA FRAUD / ANTI-PALSU */}
            {(() => {
              const fraud = inspectingPayment.fraudAnalysis || StorageService.analyzePaymentProofFraud(inspectingPayment.id);
              const isConfirmedFake = fraud.status === 'confirmed_fake';
              const isReal = fraud.status === 'verified_real';

              return (
                <div
                  className={`p-4 rounded-2xl border-2 space-y-2 text-xs ${
                    isConfirmedFake
                      ? 'bg-rose-50 border-rose-300 text-rose-950'
                      : isReal
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                      : 'bg-amber-50 border-amber-300 text-amber-950'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {isConfirmedFake ? <XCircle size={18} className="text-rose-600" /> : isReal ? <CheckCircle2 size={18} className="text-emerald-600" /> : <AlertTriangle size={18} className="text-amber-600" />}
                      <span className="font-black text-sm">
                        {isConfirmedFake
                          ? 'PERINGATAN: INDIKASI KUAT TRANSFER PALSU / FIKTIF'
                          : isReal
                          ? 'MUTASI COCOK & TERVERIFIKASI ASLI'
                          : 'PERHATIAN: BELUM DITEMUKAN MUTASI BANK COCOK'}
                      </span>
                    </div>
                    <span className="font-mono font-black text-sm px-2.5 py-0.5 rounded-full bg-white shadow-2xs">
                      Skor Keaslian: {fraud.authenticityScore}%
                    </span>
                  </div>

                  <div className="space-y-1 pt-1 border-t border-black/10">
                    <span className="font-bold block">Indikator Forensik Perbankan:</span>
                    <ul className="list-disc list-inside space-y-1 leading-relaxed">
                      {fraud.indicators.map((ind, i) => (
                        <li key={i}>{ind}</li>
                      ))}
                    </ul>
                  </div>

                  {fraud.matchedMutationTime && (
                    <div className="p-2 bg-white/80 rounded-xl font-mono text-[11px] text-emerald-800">
                      Waktu Mutasi Cocok: <strong>{fraud.matchedMutationTime}</strong> | Ref: {fraud.bankRefNumber}
                    </div>
                  )}
                </div>
              );
            })()}

            {/* ACTION BUTTONS */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-end gap-2 text-xs">
              <button
                type="button"
                onClick={() => setInspectingPayment(null)}
                className="w-full sm:w-auto px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
              >
                Tutup
              </button>

              {inspectingPayment.status === 'pending' && (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setRejectPromptPayment(inspectingPayment);
                      setRejectReasonInput('Struk terindikasi editan Canva/Photoshop. Tidak ditemukan mutasi masuk di rekening yayasan.');
                    }}
                    className="w-full sm:w-auto px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black shadow-xs"
                  >
                    🚨 Tolak & Tandai Transfer Palsu
                  </button>

                  <button
                    type="button"
                    onClick={() => handleVerifyPayment(inspectingPayment)}
                    className="w-full sm:w-auto px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black shadow-md"
                  >
                    ✅ Verifikasi Asli & Aktifkan PRO
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 2: KONFIRMASI PENOLAKAN TRANSFER PALSU             */}
      {/* ======================================================== */}
      {rejectPromptPayment && (
        <div className="fixed inset-0 z-70 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl border border-rose-300 max-w-md w-full p-6 space-y-4 shadow-2xl text-left">
            <div className="flex items-center gap-3 border-b border-rose-100 pb-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center font-bold">
                🚨
              </div>
              <div>
                <h3 className="font-black text-rose-950 text-base font-heading">
                  Tandai Sebagai Transfer Palsu / Fiktif
                </h3>
                <p className="text-xs text-slate-500">
                  Untuk Invoice: {rejectPromptPayment.invoiceNumber} ({rejectPromptPayment.userName})
                </p>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <label className="font-bold text-slate-700 block">
                Alasan Penolakan / Bukti Transfer Palsu:
              </label>
              <textarea
                rows={3}
                required
                value={rejectReasonInput}
                onChange={(e) => setRejectReasonInput(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-rose-300 rounded-2xl text-xs text-slate-800 focus:outline-none"
                placeholder="Contoh: Struk diedit, font tidak seragam, dana tidak masuk mutasi rekening BCA yayasan."
              />
              <span className="text-[11px] text-rose-600 block">
                Catatan ini akan tersimpan permanen di Log Audit Admin dan status transaksi berubah menjadi GAGAL.
              </span>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2 text-xs">
              <button
                type="button"
                onClick={() => setRejectPromptPayment(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => handleConfirmFlagFake(rejectPromptPayment, rejectReasonInput)}
                className="px-5 py-2 rounded-xl bg-rose-700 hover:bg-rose-800 text-white font-black shadow-md cursor-pointer active:scale-95"
              >
                Konfirmasi Tolak Transfer Palsu
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 3: DETAIL LENGKAP PENGGUNA                         */}
      {/* ======================================================== */}
      {selectedUserDetail && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl border border-slate-300 max-w-lg w-full p-6 space-y-4 shadow-2xl text-left max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-[#164C68] text-white flex items-center justify-center font-black text-lg">
                  {selectedUserDetail.parentName.charAt(0)}
                </div>
                <div>
                  <h3 className="font-black text-[#164C68] text-base font-heading">
                    {selectedUserDetail.parentName}
                  </h3>
                  <span className="font-mono text-xs text-slate-400">{selectedUserDetail.id}</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedUserDetail(null)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3.5 rounded-2xl">
                <div>
                  <span className="text-slate-400 block text-[10px]">Email:</span>
                  <strong className="text-slate-800 break-all">{selectedUserDetail.email}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">WhatsApp:</span>
                  <strong className="text-slate-800">{selectedUserDetail.whatsapp || '-'}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Status Langganan:</span>
                  <strong className="text-amber-800 uppercase">{selectedUserDetail.planTier} ({selectedUserDetail.entitlement})</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">PIN Akun:</span>
                  <strong className="font-mono text-indigo-700">{selectedUserDetail.pin || '2026'}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Masa Berlaku PRO:</span>
                  <strong className="text-slate-800">{selectedUserDetail.entitlementExpiry || '-'}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Tanggal Daftar:</span>
                  <strong className="text-slate-800">{selectedUserDetail.createdAt ? new Date(selectedUserDetail.createdAt).toLocaleDateString('id-ID') : '-'}</strong>
                </div>
              </div>

              {selectedUserDetail.affiliateEnabled && (
                <div className="p-3 bg-purple-50 rounded-2xl border border-purple-200 space-y-1">
                  <span className="font-black text-purple-900 block text-[11px]">Mitra Afiliasi Aktif:</span>
                  <div className="flex justify-between">
                    <span>Kode Referral: <strong className="font-mono">{selectedUserDetail.affiliateCode}</strong></span>
                    <span>Total Komisi: <strong>Rp {(selectedUserDetail.affiliateTotalEarnings || 0).toLocaleString('id-ID')}</strong></span>
                  </div>
                </div>
              )}
            </div>

            <div className="pt-2 flex flex-wrap items-center justify-end gap-2 text-xs">
              <button
                type="button"
                onClick={() => {
                  setPasswordModalUser(selectedUserDetail);
                  setNewPasswordInput('');
                  setPasswordNotesInput('');
                  setSelectedUserDetail(null);
                }}
                className="px-3.5 py-2 rounded-xl bg-indigo-100 hover:bg-indigo-200 text-indigo-900 font-bold flex items-center gap-1"
              >
                <KeyRound size={13} />
                <span>Ganti PIN / Password</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setAssignUserId(selectedUserDetail.id);
                  setActiveTab('manual_assign');
                  setSelectedUserDetail(null);
                }}
                className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black flex items-center gap-1"
              >
                <Crown size={13} />
                <span>Assign PRO Manual</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
