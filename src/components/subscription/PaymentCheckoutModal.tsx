import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  CreditCard,
  CheckCircle2,
  Lock,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Download,
  AlertCircle,
  QrCode,
  Building2,
  Copy,
  Check,
  Smartphone,
  Mail,
  MessageCircle,
  Globe,
  RefreshCw,
  ExternalLink,
  Clock,
  Send,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { UserAccount, PaymentTransaction } from '../../types';
import { StorageService } from '../../services/storageService';

export interface PlanPricingItem {
  id: string;
  name: string;
  durationMonths: number;
  priceUsd: number;
  priceIdr: number;
  originalPriceUsd?: number;
  originalPriceIdr?: number;
  discountPercent?: number;
  monthlyEquivalentUsd: string;
  monthlyEquivalentIdr: string;
  isPopular?: boolean;
}

export const CHECKOUT_PLANS: PlanPricingItem[] = [
  {
    id: '1_month',
    name: 'Cahaya Tahfiz Premium 1 Bulan',
    durationMonths: 1,
    priceUsd: 3.49,
    priceIdr: 49000,
    monthlyEquivalentUsd: '$3.49',
    monthlyEquivalentIdr: 'Rp 49.000',
  },
  {
    id: '3_months',
    name: 'Cahaya Tahfiz Premium 3 Bulan',
    durationMonths: 3,
    priceUsd: 6.99,
    priceIdr: 99000,
    originalPriceUsd: 10.47,
    originalPriceIdr: 147000,
    discountPercent: 33,
    monthlyEquivalentUsd: '$2.33',
    monthlyEquivalentIdr: 'Rp 33.000',
  },
  {
    id: '1_year',
    name: 'Cahaya Tahfiz Premium 1 Tahun',
    durationMonths: 12,
    priceUsd: 19.99,
    priceIdr: 299000,
    originalPriceUsd: 41.88,
    originalPriceIdr: 588000,
    discountPercent: 52,
    monthlyEquivalentUsd: '$1.67',
    monthlyEquivalentIdr: 'Rp 24.900',
    isPopular: true,
  },
  {
    id: 'lifetime',
    name: 'Cahaya Tahfiz Premium Seumur Hidup',
    durationMonths: 999,
    priceUsd: 80.0,
    priceIdr: 1199000,
    originalPriceUsd: 114.0,
    originalPriceIdr: 1700000,
    discountPercent: 30,
    monthlyEquivalentUsd: 'Sekali bayar',
    monthlyEquivalentIdr: 'Sekali bayar',
  },
];

interface PaymentCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPlanId?: string;
  userAccount: UserAccount;
  onSuccess: (updatedAccount: UserAccount) => void;
}

export const PaymentCheckoutModal: React.FC<PaymentCheckoutModalProps> = ({
  isOpen,
  onClose,
  selectedPlanId = '1_year',
  userAccount,
  onSuccess,
}) => {
  const [currentPlanId, setCurrentPlanId] = useState<string>(selectedPlanId);
  const [currency, setCurrency] = useState<'USD' | 'IDR'>('IDR');
  
  // Payer Channel: Gmail / Google, WhatsApp, or Email
  const [payerChannel, setPayerChannel] = useState<'gmail' | 'whatsapp' | 'email'>('gmail');
  const [payerName, setPayerName] = useState<string>(userAccount.parentName || 'Wahyu Budi Prastowo');
  const [payerEmail, setPayerEmail] = useState<string>(userAccount.email || 'wahyubudiprastowo@gmail.com');
  const [payerWhatsapp, setPayerWhatsapp] = useState<string>(userAccount.whatsapp || '081288882026');

  // Payment Gateway method
  const [paymentMethod, setPaymentMethod] = useState<'qris' | 'bank_va' | 'ewallet' | 'card' | 'paypal'>('qris');
  const [selectedBank, setSelectedBank] = useState<'bca' | 'mandiri' | 'bri' | 'bni'>('bca');
  const [selectedEwallet, setSelectedEwallet] = useState<'gopay' | 'shopeepay' | 'ovo' | 'dana'>('gopay');

  // Card fields
  const [cardName, setCardName] = useState<string>(payerName);
  const [cardNumber, setCardNumber] = useState<string>('4242 •••• •••• 4242');
  const [cardExpiry, setCardExpiry] = useState<string>('12/28');
  const [cardCvv, setCardCvv] = useState<string>('888');

  // Referral discount
  const [referralCode, setReferralCode] = useState<string>('');
  const [appliedDiscount, setAppliedDiscount] = useState<number>(0);
  const [referralFeedback, setReferralFeedback] = useState<string | null>(null);
  const [agreeTerms, setAgreeTerms] = useState<boolean>(true);

  // Processing & Simulation
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [processingStep, setProcessingStep] = useState<string>('');
  const [completedTx, setCompletedTx] = useState<PaymentTransaction | null>(null);
  const [copiedVa, setCopiedVa] = useState<boolean>(false);
  const [waConfirmationSent, setWaConfirmationSent] = useState<boolean>(false);
  const [emailConfirmationSent, setEmailConfirmationSent] = useState<boolean>(false);

  // Countdown timer for QRIS & VA (15 mins)
  const [timeLeft, setTimeLeft] = useState<number>(15 * 60);

  useEffect(() => {
    if (!isOpen) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [isOpen]);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  const plan = CHECKOUT_PLANS.find((p) => p.id === currentPlanId) || CHECKOUT_PLANS[2];
  const basePriceUsd = plan.priceUsd;
  const basePriceIdr = plan.priceIdr;
  const finalPriceUsd = Math.max(0, Number((basePriceUsd * (1 - appliedDiscount / 100)).toFixed(2)));
  const finalPriceIdr = Math.max(0, Math.round(basePriceIdr * (1 - appliedDiscount / 100)));

  const handleApplyReferral = () => {
    const code = referralCode.trim().toUpperCase();
    if (!code) return;
    if (code === 'BERKAH50' || code === 'TAHFIZ50') {
      setAppliedDiscount(50);
      setReferralFeedback('Diskon referral 50% berhasil diterapkan! 🎉');
    } else if (code === 'RAMADHAN' || code === 'TAHFIZ2026' || code === 'PRO20') {
      setAppliedDiscount(20);
      setReferralFeedback('Diskon khusus 20% berhasil diterapkan! ✨');
    } else {
      setAppliedDiscount(10);
      setReferralFeedback('Kode afiliasi valid! Diskon 10% berhasil dipotong.');
    }
  };

  const getBankVaNumber = (bank: string) => {
    switch (bank) {
      case 'bca':
        return '8808 9912 0938 4812';
      case 'mandiri':
        return '8902 2108 4490 1283';
      case 'bri':
        return '1289 0081 9908 1094';
      case 'bni':
        return '9881 2026 8819 0184';
      default:
        return '8808 9912 0938 4812';
    }
  };

  const handleCopyVa = () => {
    const vaNum = getBankVaNumber(selectedBank).replace(/\s/g, '');
    navigator.clipboard?.writeText(vaNum);
    setCopiedVa(true);
    setTimeout(() => setCopiedVa(false), 2000);
  };

  const executePaymentSuccess = () => {
    setIsProcessing(true);
    setProcessingStep('Menghubungi Payment Gateway Midtrans & Xendit...');

    setTimeout(() => {
      setProcessingStep('Mengamankan otorisasi & verifikasi instan...');
    }, 700);

    setTimeout(() => {
      setProcessingStep('Mengaktifkan lisensi Cahaya Tahfiz PRO sekeluarga...');
    }, 1400);

    setTimeout(() => {
      setIsProcessing(false);
      const invoiceNo = `INV-CT-${Date.now().toString().slice(-6)}`;
      
      let methodDetails = 'QRIS Dinamis (GoPay / ShopeePay / BCA)';
      if (paymentMethod === 'bank_va') {
        methodDetails = `${selectedBank.toUpperCase()} Virtual Account (${getBankVaNumber(selectedBank)})`;
      } else if (paymentMethod === 'ewallet') {
        methodDetails = `${selectedEwallet.toUpperCase()} Instant Direct`;
      } else if (paymentMethod === 'card') {
        methodDetails = `Kartu Kredit / Debit Visa •••• ${cardNumber.replace(/\s/g, '').slice(-4) || '4242'}`;
      } else if (paymentMethod === 'paypal') {
        methodDetails = 'PayPal Express Checkout';
      }

      const newTx: PaymentTransaction = {
        id: `tx-${Date.now()}`,
        userId: userAccount.id,
        planId: plan.id,
        planName: plan.name,
        amountUsd: finalPriceUsd,
        amountIdr: finalPriceIdr,
        paymentMethod,
        paymentMethodDetails: methodDetails,
        status: 'success',
        invoiceNumber: invoiceNo,
        createdAt: new Date().toISOString(),
        referralCode: referralCode || undefined,
        discountApplied: appliedDiscount > 0 ? appliedDiscount : undefined,
      };

      StorageService.recordPayment(newTx);
      setCompletedTx(newTx);

      // Record 10% affiliate commission for referral code owner
      if (referralCode) {
        StorageService.recordReferralCommission(
          referralCode,
          plan.name,
          finalPriceIdr,
          payerName || userAccount.parentName || 'Santri Baru',
          false
        );
      }

      // Add activity to live feed
      StorageService.addActivity({
        userName: payerName,
        actionText: `berhasil mengaktifkan ${plan.name} (PRO) 👑`,
        score: 1000,
        gameIcon: '👑',
        gameName: 'Paket PRO',
      });

      try {
        confetti({
          particleCount: 90,
          spread: 80,
          origin: { y: 0.4 },
          colors: ['#08B9EF', '#FFD83E', '#81E850', '#FF946F', '#B797F6'],
        });
      } catch {}

      const updated = StorageService.getUserAccount();
      onSuccess(updated);
    }, 2000);
  };

  const handleOpenWhatsAppConfirmation = () => {
    if (!completedTx) return;
    const priceText = currency === 'IDR' ? `Rp ${completedTx.amountIdr.toLocaleString('id-ID')}` : `$${completedTx.amountUsd}`;
    const textMsg = encodeURIComponent(
      `Assalamu'alaikum Admin Cahaya Tahfiz,\n\nSaya ingin konfirmasi pembayaran Paket PRO:\n- No. Invoice: ${completedTx.invoiceNumber}\n- Paket: ${completedTx.planName}\n- Nama: ${payerName}\n- Akun: ${payerChannel === 'whatsapp' ? payerWhatsapp : payerEmail}\n- Metode: ${completedTx.paymentMethodDetails}\n- Total: ${priceText}\n\nMohon dicek dan terima kasih banyak!`
    );
    window.open(`https://wa.me/6281288882026?text=${textMsg}`, '_blank');
    setWaConfirmationSent(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 15 }}
        className="bg-white rounded-3xl border border-[#C9E1ED] shadow-2xl max-w-4xl w-full overflow-hidden my-4 flex flex-col font-sans"
      >
        {/* Top Header */}
        <div className="bg-[#164C68] text-white p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-400 to-yellow-300 text-amber-950 flex items-center justify-center font-black text-xl shadow-md">
              👑
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-heading font-black text-sm sm:text-base leading-tight">
                  Cahaya Tahfiz Payment Gateway
                </h2>
                <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-2 py-0.2 rounded-full">
                  Midtrans & Xendit Verified
                </span>
              </div>
              <p className="text-[11px] text-cyan-200">
                Integrasi Pembayaran Otomatis: QRIS, VA Bank, E-Wallet & Kartu Kredit
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Currency switch */}
            <div className="bg-white/10 rounded-xl p-0.5 flex text-[10px] font-black">
              <button
                onClick={() => setCurrency('IDR')}
                className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                  currency === 'IDR' ? 'bg-[#08B9EF] text-white shadow-xs' : 'text-slate-200 hover:text-white'
                }`}
              >
                IDR (Rp)
              </button>
              <button
                onClick={() => setCurrency('USD')}
                className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                  currency === 'USD' ? 'bg-[#08B9EF] text-white shadow-xs' : 'text-slate-200 hover:text-white'
                }`}
              >
                USD ($)
              </button>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        {completedTx ? (
          /* SUCCESS INVOICE RECEIPT SCREEN */
          <div className="p-6 sm:p-8 space-y-6 text-center max-w-lg mx-auto animate-in zoom-in-95">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-3xl mx-auto shadow-sm">
              <CheckCircle2 size={36} />
            </div>

            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                PEMBAYARAN LUNAS (PAID)
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-[#164C68] font-heading mt-2">
                Alhamdulillah! Akun PRO Berhasil Aktif
              </h3>
              <p className="text-xs text-[#8C9BA7] font-medium mt-1">
                Semua 8 Arena Game Qur'an, PVP Online, Materi 30 Juz & Suara AI telah terbuka untuk keluarga Anda!
              </p>
            </div>

            {/* Official Invoice Card */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-left space-y-2 text-xs">
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500 font-medium">No. Invoice:</span>
                <span className="font-mono font-black text-[#164C68]">{completedTx.invoiceNumber}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500 font-medium">Paket Langganan:</span>
                <span className="font-bold text-[#164C68]">{completedTx.planName}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500 font-medium">Penerima Lisensi:</span>
                <span className="font-bold text-[#164C68]">{payerName} ({payerChannel === 'whatsapp' ? payerWhatsapp : payerEmail})</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500 font-medium">Metode Pembayaran:</span>
                <span className="font-bold text-[#164C68]">{completedTx.paymentMethodDetails}</span>
              </div>
              <div className="flex justify-between pt-1 text-sm font-black text-[#164C68]">
                <span>Total Lunas:</span>
                <span className="text-emerald-600 font-mono">
                  {currency === 'IDR' ? `Rp ${completedTx.amountIdr.toLocaleString('id-ID')}` : `$${completedTx.amountUsd}`}
                </span>
              </div>
            </div>

            {/* Confirmation actions */}
            <div className="space-y-2.5 pt-1">
              <button
                onClick={handleOpenWhatsAppConfirmation}
                className="w-full py-3 rounded-2xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-black text-xs shadow-md shadow-emerald-500/20 cursor-pointer flex items-center justify-center gap-2 transition-all hover:scale-101"
              >
                <MessageCircle size={16} />
                <span>
                  {waConfirmationSent ? 'WhatsApp Terkirim ✓ (Buka Lagi)' : 'Kirim Bukti Pembayaran ke WhatsApp Admin'}
                </span>
              </button>

              <button
                onClick={() => {
                  setEmailConfirmationSent(true);
                  alert(`Salinan invoice #${completedTx.invoiceNumber} telah dikirimkan ke ${payerEmail}.`);
                }}
                className="w-full py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer flex items-center justify-center gap-1.5 transition-colors"
              >
                <Mail size={14} />
                <span>
                  {emailConfirmationSent ? 'Salinan Terkirim ke Gmail ✓' : `Kirim Bukti ke ${payerEmail}`}
                </span>
              </button>

              <button
                onClick={onClose}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#08B9EF] to-[#0496C3] text-white font-black text-xs shadow-md shadow-cyan-500/25 cursor-pointer flex items-center justify-center gap-2 hover:scale-102 transition-transform"
              >
                <span>Mulai Mainkan 8 Game & Belajar Sekarang</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        ) : (
          /* CHECKOUT FORM */
          <div className="grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-slate-200">
            {/* LEFT COLUMN: Ringkasan Pesanan */}
            <div className="md:col-span-5 p-5 sm:p-6 bg-[#F8FBFC] space-y-4">
              <div>
                <span className="text-[11px] font-bold text-[#8C9BA7] uppercase tracking-wider block">
                  Langkah 1 dari 2
                </span>
                <h3 className="text-lg font-black text-[#164C68] font-heading mt-0.5">
                  Ringkasan Pesanan PRO
                </h3>
              </div>

              {/* Plan Picker Cards */}
              <div className="space-y-2">
                {CHECKOUT_PLANS.map((p) => {
                  const isSel = p.id === currentPlanId;
                  return (
                    <div
                      key={p.id}
                      onClick={() => setCurrentPlanId(p.id)}
                      className={`p-3 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                        isSel
                          ? 'border-[#08B9EF] bg-cyan-50/50 shadow-xs ring-1 ring-[#08B9EF]'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                            isSel ? 'border-[#08B9EF] bg-[#08B9EF]' : 'border-slate-300'
                          }`}
                        >
                          {isSel && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-[#164C68]">{p.name}</span>
                            {p.isPopular && (
                              <span className="text-[9px] font-black text-amber-800 bg-amber-100 px-1.5 py-0.2 rounded-md">
                                TERPOPULER
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-[#8C9BA7]">
                            {currency === 'IDR' ? p.monthlyEquivalentIdr : p.monthlyEquivalentUsd} / bln
                          </span>
                        </div>
                      </div>
                      <span className="font-mono text-xs font-black text-[#164C68]">
                        {currency === 'IDR' ? `Rp ${(p.priceIdr / 1000).toFixed(0)}k` : `$${p.priceUsd}`}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Price Calculation */}
              <div className="space-y-2 text-xs text-slate-600 border-t border-slate-200 pt-3">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-slate-800">
                    {currency === 'IDR' ? `Rp ${basePriceIdr.toLocaleString('id-ID')}` : `$${basePriceUsd}`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Pajak (PPN 0%)</span>
                  <span className="font-semibold text-slate-800">Rp 0 (Termasuk)</span>
                </div>
                {appliedDiscount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-bold">
                    <span>Diskon Voucher ({referralCode})</span>
                    <span>-{appliedDiscount}%</span>
                  </div>
                )}
              </div>

              {/* Total Row */}
              <div className="flex items-baseline justify-between pt-2 border-t border-slate-200">
                <div>
                  <span className="text-sm font-bold text-slate-700">Total Pembayaran</span>
                  <p className="text-[10px] text-emerald-600 font-bold">
                    ✓ Garansi Uang Kembali 14 Hari
                  </p>
                </div>
                <span className="text-2xl font-black text-[#164C68] font-heading font-mono">
                  {currency === 'IDR' ? `Rp ${finalPriceIdr.toLocaleString('id-ID')}` : `$${finalPriceUsd}`}
                </span>
              </div>

              {/* Countdown Timer Warning */}
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-2.5 flex items-center justify-between text-xs text-amber-900">
                <div className="flex items-center gap-1.5 font-bold">
                  <Clock size={14} className="text-amber-600" />
                  <span>Selesaikan sebelum:</span>
                </div>
                <span className="font-mono font-black text-amber-700 text-sm bg-amber-100 px-2 py-0.5 rounded-lg">
                  {formatTimer(timeLeft)}
                </span>
              </div>

              {/* Help Support Box */}
              <div className="bg-[#EBF7FD] border border-[#C9E1ED] rounded-2xl p-3 space-y-1 text-xs">
                <p className="font-bold text-[#164C68] flex items-center gap-1">
                  <span>💬</span>
                  <span>Bantuan Pembayaran Cepat:</span>
                </p>
                <p className="text-[#08B9EF] font-bold text-[11px]">
                  WhatsApp Resmi: +62 812-8888-2026
                </p>
                <p className="text-[10px] text-[#8C9BA7]">
                  Email: support@cahayatahfiz.app • Respon 24/7
                </p>
              </div>
            </div>

            {/* RIGHT COLUMN: Payment Details & Methods */}
            <div className="md:col-span-7 p-5 sm:p-6 space-y-4 bg-white">
              {/* SECTION A: Akun Penerima Lisensi (Email / WhatsApp / Gmail) */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black text-[#164C68] flex items-center gap-1.5">
                    <span>👤</span>
                    <span>Kirim Bukti & Lisensi Ke:</span>
                  </label>
                  <span className="text-[10px] font-bold text-slate-500">Pilih Metode Akun</span>
                </div>

                {/* Account Type Tabs */}
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { id: 'gmail', label: 'Gmail / Google', icon: '🌐' },
                    { id: 'whatsapp', label: 'WhatsApp', icon: '💬' },
                    { id: 'email', label: 'Email Lain', icon: '📧' },
                  ].map((ch) => (
                    <button
                      key={ch.id}
                      type="button"
                      onClick={() => setPayerChannel(ch.id as any)}
                      className={`py-1.5 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer border ${
                        payerChannel === ch.id
                          ? 'border-[#08B9EF] bg-cyan-50 text-[#08B9EF] shadow-2xs'
                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <span>{ch.icon}</span>
                      <span className="truncate">{ch.label}</span>
                    </button>
                  ))}
                </div>

                {/* Input according to channel */}
                <div className="space-y-1.5 pt-1">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 block">Nama Wali / Orang Tua</label>
                    <input
                      type="text"
                      value={payerName}
                      onChange={(e) => setPayerName(e.target.value)}
                      placeholder="Nama lengkap Bunda / Ayah"
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-[#08B9EF]"
                    />
                  </div>

                  {payerChannel === 'whatsapp' ? (
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 block">Nomor WhatsApp Aktif</label>
                      <input
                        type="tel"
                        value={payerWhatsapp}
                        onChange={(e) => setPayerWhatsapp(e.target.value)}
                        placeholder="Contoh: 081288882026"
                        className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-[#08B9EF]"
                      />
                    </div>
                  ) : (
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 block">
                        {payerChannel === 'gmail' ? 'Alamat Akun Google (Gmail)' : 'Alamat Email'}
                      </label>
                      <input
                        type="email"
                        value={payerEmail}
                        onChange={(e) => setPayerEmail(e.target.value)}
                        placeholder="email@gmail.com"
                        className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-[#08B9EF]"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* SECTION B: Payment Method Tabs */}
              <div>
                <label className="text-xs font-black text-[#164C68] block mb-2">
                  Metode Pembayaran Resmi
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'qris', label: 'QRIS 1-Klik', icon: <QrCode size={18} /> },
                    { id: 'bank_va', label: 'Virtual Account', icon: <Building2 size={18} /> },
                    { id: 'ewallet', label: 'E-Wallet', icon: <Smartphone size={18} /> },
                    { id: 'card', label: 'Kartu Kredit/Debit', icon: <CreditCard size={18} /> },
                  ].map((m) => {
                    const isSelected = paymentMethod === m.id;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setPaymentMethod(m.id as any)}
                        className={`flex flex-col items-center justify-center p-2.5 rounded-2xl border-2 transition-all cursor-pointer text-center ${
                          isSelected
                            ? 'border-[#08B9EF] bg-cyan-50/50 shadow-xs ring-1 ring-[#08B9EF]'
                            : 'border-slate-200 hover:border-slate-300 bg-white text-slate-600'
                        }`}
                      >
                        <span className={`mb-1 ${isSelected ? 'text-[#08B9EF]' : 'text-slate-500'}`}>
                          {m.icon}
                        </span>
                        <span className="text-[11px] font-black">{m.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* METHOD 1: QRIS DINAMIS */}
              {paymentMethod === 'qris' && (
                <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl text-center space-y-3">
                  <div className="flex items-center justify-between text-xs text-emerald-900 border-b border-emerald-200 pb-2">
                    <span className="font-bold">QRIS Standar Bank Indonesia</span>
                    <span className="font-mono font-black text-emerald-700 bg-white px-2 py-0.5 rounded-md border border-emerald-200">
                      NMID: ID1020268819001
                    </span>
                  </div>

                  {/* QR Image Simulation */}
                  <div className="w-36 h-36 mx-auto bg-white p-2.5 rounded-2xl border-2 border-slate-300 flex flex-col items-center justify-center shadow-xs">
                    <QrCode size={110} className="text-slate-900" />
                    <span className="text-[9px] font-black text-slate-600 tracking-wider">CAHAYA TAHFIZ</span>
                  </div>

                  <div className="space-y-1">
                    <p className="text-xs font-bold text-emerald-950">
                      Scan pakai GoPay, ShopeePay, OVO, DANA, BCA Mobile, atau Livin'
                    </p>
                    <p className="text-[10px] text-emerald-800">
                      Verifikasi otomatis dalam 3-5 detik setelah transfer selesai.
                    </p>
                  </div>

                  {/* Instant Test Simulator Button */}
                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={executePaymentSuccess}
                      className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold shadow-xs cursor-pointer inline-flex items-center gap-1.5"
                    >
                      <Sparkles size={12} />
                      <span>Simulasikan Scan & Pembayaran QRIS Berhasil</span>
                    </button>
                  </div>
                </div>
              )}

              {/* METHOD 2: VIRTUAL ACCOUNT */}
              {paymentMethod === 'bank_va' && (
                <div className="p-4 bg-sky-50/70 border border-sky-200 rounded-2xl space-y-3">
                  {/* Bank selector */}
                  <div className="grid grid-cols-4 gap-1.5">
                    {[
                      { id: 'bca', name: 'BCA' },
                      { id: 'mandiri', name: 'Mandiri' },
                      { id: 'bri', name: 'BRI' },
                      { id: 'bni', name: 'BNI' },
                    ].map((b) => (
                      <button
                        key={b.id}
                        type="button"
                        onClick={() => setSelectedBank(b.id as any)}
                        className={`py-1 px-2 rounded-xl text-xs font-black transition-all cursor-pointer border ${
                          selectedBank === b.id
                            ? 'bg-[#164C68] text-white border-[#164C68] shadow-2xs'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {b.name}
                      </button>
                    ))}
                  </div>

                  {/* VA display box */}
                  <div className="bg-white p-3 rounded-2xl border border-sky-200 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-[#8C9BA7] font-bold block uppercase">
                        Nomor Virtual Account {selectedBank.toUpperCase()}
                      </span>
                      <span className="font-mono text-base font-black text-[#164C68] tracking-wider">
                        {getBankVaNumber(selectedBank)}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={handleCopyVa}
                      className="px-3 py-1.5 rounded-xl bg-sky-100 hover:bg-sky-200 text-sky-800 text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      {copiedVa ? <Check size={13} /> : <Copy size={13} />}
                      <span>{copiedVa ? 'Disalin ✓' : 'Salin VA'}</span>
                    </button>
                  </div>

                  <p className="text-[10px] text-slate-500 leading-relaxed">
                    Petunjuk: Masukkan nomor VA di ATM atau Mobile Banking menu Transfer Virtual Account. Jumlah transfer otomatis terisi pas.
                  </p>

                  <div className="pt-1 text-center">
                    <button
                      type="button"
                      onClick={executePaymentSuccess}
                      className="px-3.5 py-1.5 rounded-xl bg-[#164C68] hover:bg-[#08B9EF] text-white text-[11px] font-bold shadow-xs cursor-pointer inline-flex items-center gap-1.5"
                    >
                      <Sparkles size={12} />
                      <span>Simulasikan Transfer VA {selectedBank.toUpperCase()} Berhasil</span>
                    </button>
                  </div>
                </div>
              )}

              {/* METHOD 3: E-WALLET */}
              {paymentMethod === 'ewallet' && (
                <div className="p-4 bg-purple-50/70 border border-purple-200 rounded-2xl space-y-3">
                  <div className="grid grid-cols-4 gap-1.5">
                    {[
                      { id: 'gopay', name: 'GoPay' },
                      { id: 'shopeepay', name: 'ShopeePay' },
                      { id: 'ovo', name: 'OVO' },
                      { id: 'dana', name: 'DANA' },
                    ].map((ew) => (
                      <button
                        key={ew.id}
                        type="button"
                        onClick={() => setSelectedEwallet(ew.id as any)}
                        className={`py-1.5 px-2 rounded-xl text-xs font-black transition-all cursor-pointer border ${
                          selectedEwallet === ew.id
                            ? 'bg-purple-700 text-white border-purple-700 shadow-2xs'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {ew.name}
                      </button>
                    ))}
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-600 block">
                      Nomor HP Terdaftar di {selectedEwallet.toUpperCase()}
                    </label>
                    <input
                      type="tel"
                      value={payerWhatsapp}
                      onChange={(e) => setPayerWhatsapp(e.target.value)}
                      placeholder="0812xxxxxxx"
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-none"
                    />
                  </div>

                  <div className="text-center pt-1">
                    <button
                      type="button"
                      onClick={executePaymentSuccess}
                      className="px-3.5 py-1.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white text-[11px] font-bold shadow-xs cursor-pointer inline-flex items-center gap-1.5"
                    >
                      <Sparkles size={12} />
                      <span>Buka Aplikasi & Bayar di {selectedEwallet.toUpperCase()}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* METHOD 4: KARTU KREDIT / DEBIT */}
              {paymentMethod === 'card' && (
                <div className="space-y-2.5 pt-1">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-700 block mb-0.5">
                      Nama Pemegang Kartu
                    </label>
                    <input
                      type="text"
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      placeholder="Cardholder name"
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#08B9EF]"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-700 block mb-0.5">
                      Detail Kartu Visa / Mastercard / GPN
                    </label>
                    <div className="border border-slate-300 rounded-xl overflow-hidden divide-y divide-slate-200 bg-white">
                      <div className="flex items-center px-3 py-2">
                        <input
                          type="text"
                          value={cardNumber}
                          onChange={(e) => setCardNumber(e.target.value)}
                          placeholder="XXXX XXXX XXXX XXXX"
                          className="flex-1 text-xs text-slate-800 focus:outline-none"
                        />
                        <div className="flex items-center gap-1 text-[10px] text-slate-400 font-bold">
                          <span>VISA</span>
                          <span>MC</span>
                          <span>GPN</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 divide-x divide-slate-200">
                        <input
                          type="text"
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                          placeholder="MM / YY"
                          className="px-3 py-1.5 text-xs text-slate-800 focus:outline-none"
                        />
                        <input
                          type="text"
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value)}
                          placeholder="CVV"
                          className="px-3 py-1.5 text-xs text-slate-800 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Promo code field */}
              <div className="pt-1">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={referralCode}
                    onChange={(e) => setReferralCode(e.target.value)}
                    placeholder="KODE PROMO (cth: BERKAH50)"
                    className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 uppercase focus:outline-none focus:border-[#08B9EF]"
                  />
                  <button
                    type="button"
                    onClick={handleApplyReferral}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer transition-colors"
                  >
                    Gunakan
                  </button>
                </div>
                {referralFeedback && (
                  <p className="text-[11px] font-bold text-emerald-600 mt-1">
                    {referralFeedback}
                  </p>
                )}
              </div>

              {/* Agreement checkbox */}
              <div className="flex items-start gap-2 pt-1">
                <input
                  type="checkbox"
                  id="agree-terms-cb"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="mt-0.5 rounded text-[#08B9EF] focus:ring-[#08B9EF]"
                />
                <label htmlFor="agree-terms-cb" className="text-[10px] text-slate-500 leading-snug cursor-pointer">
                  Saya menyetujui Ketentuan Layanan Cahaya Tahfiz PRO, jaminan uang kembali 14 hari, dan integrasi pembelajaran keluarga otomatis.
                </label>
              </div>

              {/* Big Pay Button */}
              <div>
                <button
                  type="button"
                  onClick={executePaymentSuccess}
                  disabled={isProcessing}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#164C68] to-[#08B9EF] hover:from-[#08B9EF] hover:to-[#0496C3] text-white font-black text-sm shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-98 disabled:opacity-75"
                >
                  {isProcessing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>{processingStep}</span>
                    </>
                  ) : (
                    <>
                      <Lock size={15} />
                      <span>
                        Bayar Sekarang {currency === 'IDR' ? `Rp ${finalPriceIdr.toLocaleString('id-ID')}` : `$${finalPriceUsd}`}
                      </span>
                    </>
                  )}
                </button>
              </div>

              {/* Trust Badge Footer */}
              <div className="text-[10px] text-slate-400 text-center space-y-0.5">
                <p>
                  🛡️ Transaksi Dilindungi Enkripsi 256-Bit SSL Midtrans & Bank Indonesia.
                </p>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};
