import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  CheckCircle2,
  Clock,
  Award,
  BookOpen,
  Target,
  Trophy,
  Heart,
  PlusCircle,
  X,
  Smartphone,
  Bell,
  Check,
  Star,
  Download,
  Share2,
  Edit3,
  Trash2,
  AlertCircle,
  FileText,
  Volume2,
  ShieldCheck,
  Flame,
  User,
  Users,
  Play,
  Sliders,
  Zap,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  ChildProfile,
  DailyAdabTask,
  DailyAdabLog,
  CustomLearningTarget,
  TahfizExamSchedule,
  DailyChronologicalActivity,
  DailyBreakdownPortion,
  SmartWeeklyGoal,
  LearningGraph,
  LearningNode,
  LearningNodeKind,
} from '../../types';
import { StorageService } from '../../services/storageService';
import { NotificationService } from '../../services/notificationService';
import { SoundEffects } from '../../services/soundEffects';
import { SURAHS_METADATA } from '../../data/surahsMetadata';

interface SantriProgressCalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeChild: ChildProfile;
  childrenList?: ChildProfile[];
  onSwitchChild?: (childId: string) => void;
  onNavigateToMurojaah?: () => void;
  onNavigateToZiadah?: (surahNumber?: number) => void;
  initialTab?: 'smart_goal' | 'rekap' | 'adab' | 'target' | 'ujian' | 'learning_graph';
  initialOpenWizard?: boolean;
}

const INDONESIAN_MONTHS = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
];

const WEEKDAY_NAMES = ['Ahad', 'Senin', 'Selasa', 'Rabu', 'Kamis', "Jum'at", 'Sabtu'];

export const SantriProgressCalendarModal: React.FC<SantriProgressCalendarModalProps> = ({
  isOpen,
  onClose,
  activeChild,
  childrenList = [],
  onSwitchChild,
  onNavigateToMurojaah,
  onNavigateToZiadah,
  initialTab,
  initialOpenWizard,
}) => {
  // Calendar Navigation
  const today = useMemo(() => new Date(), []);
  const [currentYear, setCurrentYear] = useState<number>(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState<number>(today.getMonth() + 1); // 1-12
  const [selectedDate, setSelectedDate] = useState<string>(
    today.toISOString().split('T')[0]
  );

  // Active Tab inside Day Drawer: 'smart_goal' | 'rekap' | 'adab' | 'target' | 'ujian' | 'learning_graph'
  const [activeTab, setActiveTab] = useState<'smart_goal' | 'rekap' | 'adab' | 'target' | 'ujian' | 'learning_graph'>('smart_goal');

  // Real-time Learning Graph State
  const [learningGraph, setLearningGraph] = useState<LearningGraph>(() =>
    activeChild?.id ? StorageService.getLearningGraph(activeChild.id) : StorageService.getLearningGraph()
  );
  const [graphFilterKind, setGraphFilterKind] = useState<'all' | LearningNodeKind>('all');
  const [graphSearchQuery, setGraphSearchQuery] = useState('');

  useEffect(() => {
    if (activeChild?.id) {
      setLearningGraph(StorageService.getLearningGraph(activeChild.id));
    }
    const handleGraphUpdate = () => {
      if (activeChild?.id) {
        setLearningGraph(StorageService.getLearningGraph(activeChild.id));
      }
    };
    window.addEventListener('cahaya_tahfiz_graph_updated', handleGraphUpdate);
    return () => window.removeEventListener('cahaya_tahfiz_graph_updated', handleGraphUpdate);
  }, [activeChild?.id]);

  // Live Data State
  const [smartGoal, setSmartGoal] = useState<SmartWeeklyGoal | null>(() =>
    activeChild?.id ? StorageService.getActiveSmartGoal(activeChild.id) : null
  );
  const [adabTasks, setAdabTasks] = useState<DailyAdabTask[]>(() =>
    activeChild?.id ? StorageService.getAdabTasks(activeChild.id) : []
  );
  const [dailyAdabLog, setDailyAdabLog] = useState<DailyAdabLog>(() =>
    activeChild?.id
      ? StorageService.getDailyAdabLog(activeChild.id, selectedDate)
      : { childId: activeChild?.id || '', date: selectedDate, completedTaskIds: [] }
  );
  const [customTargets, setCustomTargets] = useState<CustomLearningTarget[]>(() =>
    activeChild?.id ? StorageService.getCustomTargets(activeChild.id) : []
  );
  const [examSchedules, setExamSchedules] = useState<TahfizExamSchedule[]>(() =>
    activeChild?.id ? StorageService.getExamSchedules(activeChild.id) : []
  );
  const [chronologicalActivities, setChronologicalActivities] = useState<
    DailyChronologicalActivity[]
  >(() => (activeChild?.id ? StorageService.getDailyChronologicalRecap(activeChild.id, selectedDate) : []));

  // Calendar Overview Cache for the current month
  const [monthOverview, setMonthOverview] = useState<Record<string, any>>(() =>
    activeChild?.id ? StorageService.getMonthCalendarOverview(activeChild.id, currentYear, currentMonth) : {}
  );

  // Smart Goal Wizard Form State
  const [showSmartGoalWizard, setShowSmartGoalWizard] = useState<boolean>(false);
  const [wizardSurahNum, setWizardSurahNum] = useState<number>(78);
  const [wizardStartAyah, setWizardStartAyah] = useState<number>(1);
  const [wizardEndAyah, setWizardEndAyah] = useState<number>(40);
  const [wizardActiveDays, setWizardActiveDays] = useState<number>(6);
  const [wizardRestDay, setWizardRestDay] = useState<'jumat' | 'ahad' | 'sabtu' | 'none'>('jumat');
  const [wizardIntensity, setWizardIntensity] = useState<'santai' | 'moderat' | 'intensif'>('moderat');
  const [wizardReward, setWizardReward] = useState<string>(
    'Hadiah Spesial: Buku Cerita Sahabat Nabi & Es Krim Favorit 🍦'
  );
  const [wizardStartDate, setWizardStartDate] = useState<string>(
    today.toISOString().split('T')[0]
  );

  // New Custom Task Modal State
  const [showAddTaskModal, setShowAddTaskModal] = useState<boolean>(false);
  const [customTaskTitle, setCustomTaskTitle] = useState<string>('');
  const [customTaskDesc, setCustomTaskDesc] = useState<string>('');
  const [customTaskCategory, setCustomTaskCategory] = useState<DailyAdabTask['category']>('akhlak');
  const [customTaskIcon, setCustomTaskIcon] = useState<string>('⭐');
  const [customTaskReward, setCustomTaskReward] = useState<number>(5);

  // New Target Form State
  const [showAddTargetModal, setShowAddTargetModal] = useState<boolean>(false);
  const [targetTitle, setTargetTitle] = useState<string>('');
  const [targetCategory, setTargetCategory] = useState<CustomLearningTarget['category']>('mingguan_surah');
  const [targetQty, setTargetQty] = useState<number>(10);
  const [targetUnit, setTargetUnit] = useState<string>('Ayat');
  const [targetDeadline, setTargetDeadline] = useState<string>(
    new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]
  );
  const [targetReward, setTargetReward] = useState<string>('Hadiah dari Abi & Bunda');

  // New Exam Form State
  const [showAddExamModal, setShowAddExamModal] = useState<boolean>(false);
  const [examTitle, setExamTitle] = useState<string>('');
  const [examDate, setExamDate] = useState<string>(selectedDate);
  const [examTime, setExamTime] = useState<string>('16:00');
  const [examSurahRange, setExamSurahRange] = useState<string>('Surah An-Naba - An-Nas');
  const [examEvaluator, setExamEvaluator] = useState<string>('Ustadz Pembina Tahfiz');
  const [examEvaluatorType, setExamEvaluatorType] = useState<TahfizExamSchedule['evaluatorType']>('ustadz');

  // Grade Exam Modal State
  const [gradingExam, setGradingExam] = useState<TahfizExamSchedule | null>(null);
  const [gradeScore, setGradeScore] = useState<number>(95);
  const [gradeLabel, setGradeLabel] = useState<TahfizExamSchedule['grade']>('Mumtaz (Istimewa)');
  const [gradeTajwidNote, setGradeTajwidNote] = useState<string>('Makhraj dan tajwid sangat tartil.');

  // Toast Feedback State
  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);
  const [isPushingTest, setIsPushingTest] = useState<boolean>(false);

  // Helper for current surah in wizard
  const currentSurahMeta = useMemo(() => {
    return (
      SURAHS_METADATA.find((s) => s.number === wizardSurahNum) ||
      SURAHS_METADATA.find((s) => s.number === 78)!
    );
  }, [wizardSurahNum]);

  // When wizard surah changes, auto update end ayah
  const handleSelectWizardSurah = (surahNum: number) => {
    setWizardSurahNum(surahNum);
    const meta = SURAHS_METADATA.find((s) => s.number === surahNum);
    if (meta) {
      setWizardStartAyah(1);
      setWizardEndAyah(meta.ayahCount);
    }
  };

  // Live preview portions in wizard
  const wizardPreviewPortions = useMemo(() => {
    return StorageService.generateSmartGoalBreakdown({
      surahNumber: wizardSurahNum,
      surahName: currentSurahMeta.nameLatin,
      startAyah: wizardStartAyah,
      endAyah: wizardEndAyah,
      activeDaysPerWeek: wizardActiveDays,
      restDay: wizardRestDay,
      intensityLevel: wizardIntensity,
      startDate: wizardStartDate,
    });
  }, [
    wizardSurahNum,
    currentSurahMeta.nameLatin,
    wizardStartAyah,
    wizardEndAyah,
    wizardActiveDays,
    wizardRestDay,
    wizardIntensity,
    wizardStartDate,
  ]);

  // Refresh data when child or selected date changes, or when modal opens
  useEffect(() => {
    if (isOpen) {
      if (initialTab) {
        setActiveTab(initialTab);
      }
      if (initialOpenWizard) {
        setShowSmartGoalWizard(true);
        setActiveTab('smart_goal');
      }
    }
    if (activeChild?.id) {
      setSmartGoal(StorageService.getActiveSmartGoal(activeChild.id));
      setAdabTasks(StorageService.getAdabTasks(activeChild.id));
      setDailyAdabLog(StorageService.getDailyAdabLog(activeChild.id, selectedDate));
      setCustomTargets(StorageService.getCustomTargets(activeChild.id));
      setExamSchedules(StorageService.getExamSchedules(activeChild.id));
      setChronologicalActivities(
        StorageService.getDailyChronologicalRecap(activeChild.id, selectedDate)
      );
      setMonthOverview(
        StorageService.getMonthCalendarOverview(activeChild.id, currentYear, currentMonth) || {}
      );
    }
  }, [isOpen, initialTab, initialOpenWizard, activeChild?.id, selectedDate, currentYear, currentMonth]);

  // Month navigation helpers
  const handlePrevMonth = () => {
    if (currentMonth === 1) {
      setCurrentYear((y) => y - 1);
      setCurrentMonth(12);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 12) {
      setCurrentYear((y) => y + 1);
      setCurrentMonth(1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const handleJumpToToday = () => {
    const now = new Date();
    setCurrentYear(now.getFullYear());
    setCurrentMonth(now.getMonth() + 1);
    setSelectedDate(now.toISOString().split('T')[0]);
  };

  // Generate calendar days matrix
  const daysMatrix = useMemo(() => {
    const firstDayOfWeek = new Date(currentYear, currentMonth - 1, 1).getDay(); // 0 = Ahad
    const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
    const prevMonthDays = new Date(currentYear, currentMonth - 1, 0).getDate();

    const matrix: {
      dateStr: string;
      dayNumber: number;
      isCurrentMonth: boolean;
      isToday: boolean;
      isSelected: boolean;
    }[] = [];

    // Prepend days from previous month
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const dayNum = prevMonthDays - i;
      const prevMonth = currentMonth === 1 ? 12 : currentMonth - 1;
      const prevYear = currentMonth === 1 ? currentYear - 1 : currentYear;
      const dateStr = `${prevYear}-${String(prevMonth).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
      matrix.push({
        dateStr,
        dayNumber: dayNum,
        isCurrentMonth: false,
        isToday: dateStr === today.toISOString().split('T')[0],
        isSelected: dateStr === selectedDate,
      });
    }

    // Days of current month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      matrix.push({
        dateStr,
        dayNumber: day,
        isCurrentMonth: true,
        isToday: dateStr === today.toISOString().split('T')[0],
        isSelected: dateStr === selectedDate,
      });
    }

    // Append days from next month to fill 42 cells (6 rows)
    const remaining = 42 - matrix.length;
    for (let day = 1; day <= remaining; day++) {
      const nextMonth = currentMonth === 12 ? 1 : currentMonth + 1;
      const nextYear = currentMonth === 12 ? currentYear + 1 : currentYear;
      const dateStr = `${nextYear}-${String(nextMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      matrix.push({
        dateStr,
        dayNumber: day,
        isCurrentMonth: false,
        isToday: dateStr === today.toISOString().split('T')[0],
        isSelected: dateStr === selectedDate,
      });
    }

    return matrix;
  }, [currentYear, currentMonth, selectedDate, today]);

  // Handle toggle daily adab task
  const handleToggleAdabTask = (taskId: string) => {
    NotificationService.playChimeSound();
    const updatedLog = StorageService.toggleAdabTask(activeChild.id, selectedDate, taskId);
    setDailyAdabLog({ ...updatedLog });
    setMonthOverview(
      StorageService.getMonthCalendarOverview(activeChild.id, currentYear, currentMonth)
    );
    setChronologicalActivities(
      StorageService.getDailyChronologicalRecap(activeChild.id, selectedDate)
    );

    const task = adabTasks.find((t) => t.id === taskId);
    if (updatedLog.completedTaskIds.includes(taskId)) {
      setFeedbackToast(`Alhamdulillah! +${task?.starsReward || 5} Bintang untuk ${task?.title}`);
      setTimeout(() => setFeedbackToast(null), 3500);
    }
  };

  // Handle parent verification
  const handleVerifyAdabLog = (verified: boolean) => {
    const updated = StorageService.verifyAdabLogByParent(
      activeChild.id,
      selectedDate,
      verified,
      'Diverifikasi penuh oleh Orang Tua dengan penuh kasih sayang ❤️'
    );
    setDailyAdabLog({ ...updated });
    setFeedbackToast('Catatan adab harian berhasil diverifikasi oleh Ayah/Bunda! ✅');
    setTimeout(() => setFeedbackToast(null), 3000);
  };

  // Save new Smart Weekly Goal
  const handleSaveSmartGoal = (e: React.FormEvent) => {
    e.preventDefault();
    const newGoal = StorageService.saveSmartWeeklyGoal(activeChild.id, {
      surahNumber: wizardSurahNum,
      surahName: currentSurahMeta.nameLatin,
      startAyah: wizardStartAyah,
      endAyah: wizardEndAyah,
      activeDaysPerWeek: wizardActiveDays,
      restDay: wizardRestDay,
      intensityLevel: wizardIntensity,
      startDate: wizardStartDate,
      rewardDescription: wizardReward,
    });

    setSmartGoal(newGoal);
    setMonthOverview(
      StorageService.getMonthCalendarOverview(activeChild.id, currentYear, currentMonth)
    );
    setChronologicalActivities(
      StorageService.getDailyChronologicalRecap(activeChild.id, selectedDate)
    );
    setShowSmartGoalWizard(false);
    confetti({ particleCount: 75, spread: 65, origin: { y: 0.6 } });
    NotificationService.playChimeSound();
    setFeedbackToast(`Alhamdulillah! Smart Goal sepekan Surah ${currentSurahMeta.nameLatin} aktif & terpecah ke kalender 🎯`);
    setTimeout(() => setFeedbackToast(null), 3500);
  };

  // Toggle Daily Portion Completed
  const handleTogglePortion = (portionId: string) => {
    SoundEffects.playClickSound();
    const res = StorageService.toggleDailyPortionCompleted(activeChild.id, portionId);
    if (!res) return;

    setSmartGoal({ ...res.goal });
    setMonthOverview(
      StorageService.getMonthCalendarOverview(activeChild.id, currentYear, currentMonth)
    );
    setChronologicalActivities(
      StorageService.getDailyChronologicalRecap(activeChild.id, selectedDate)
    );

    if (res.portion.isCompleted) {
      SoundEffects.playCorrectSound();
      SoundEffects.playRewardSound();
      setFeedbackToast(`Barakallah! +${res.portion.starsReward} ⭐ Bintang: ${res.portion.title} tuntas!`);
      if (res.goal.status === 'completed') {
        SoundEffects.playFanfareSound();
        confetti({ particleCount: 120, spread: 80, origin: { y: 0.5 } });
        setFeedbackToast('MASYA ALLAH! SELURUH TARGET SEPEKAN TUNTAS TERCAPAI! +100 Bintang Bonus 🏆🎉');
      }
      setTimeout(() => setFeedbackToast(null), 4000);
    }
  };

  // Start practicing the portion immediately
  const handleStartPortionPractice = (portion: DailyBreakdownPortion) => {
    onClose();
    if (portion.type === 'murojaah' && onNavigateToMurojaah) {
      onNavigateToMurojaah();
    } else if (onNavigateToZiadah) {
      onNavigateToZiadah(portion.surahNumber);
    } else if (onNavigateToMurojaah) {
      onNavigateToMurojaah();
    }
  };

  // Add custom adab task
  const handleCreateCustomTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTaskTitle.trim()) return;

    StorageService.addCustomAdabTask(
      {
        title: customTaskTitle,
        description: customTaskDesc || 'Tugas pembiasaan adab dari orang tua',
        category: customTaskCategory,
        icon: customTaskIcon,
        starsReward: customTaskReward,
        xpReward: customTaskReward * 5,
        timeRecommendation: 'Harian',
      },
      activeChild.id
    );

    setAdabTasks(StorageService.getAdabTasks(activeChild.id));
    setShowAddTaskModal(false);
    setCustomTaskTitle('');
    setCustomTaskDesc('');
    setFeedbackToast('Tugas adab baru berhasil ditambahkan! 🌟');
    setTimeout(() => setFeedbackToast(null), 3000);
  };

  // Add custom target
  const handleCreateTarget = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetTitle.trim()) return;

    StorageService.saveCustomTarget(activeChild.id, {
      title: targetTitle,
      category: targetCategory,
      targetQuantity: Number(targetQty),
      unit: targetUnit,
      deadlineDate: targetDeadline,
      rewardDescription: targetReward,
    });

    setCustomTargets(StorageService.getCustomTargets(activeChild.id));
    setShowAddTargetModal(false);
    setTargetTitle('');
    setFeedbackToast('Target baru berhasil dibuat! Bismillah semangat mencapainya 🎯');
    setTimeout(() => setFeedbackToast(null), 3000);
  };

  // Add exam schedule
  const handleCreateExam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!examTitle.trim()) return;

    StorageService.saveExamSchedule(activeChild.id, {
      title: examTitle,
      date: examDate,
      time: examTime,
      surahRange: examSurahRange,
      evaluatorName: examEvaluator,
      evaluatorType: examEvaluatorType,
      status: 'scheduled',
    });

    setExamSchedules(StorageService.getExamSchedules(activeChild.id));
    setMonthOverview(
      StorageService.getMonthCalendarOverview(activeChild.id, currentYear, currentMonth)
    );
    setShowAddExamModal(false);
    setExamTitle('');
    setFeedbackToast('Jadwal ujian hafalan baru berhasil diagendakan! 📅');
    setTimeout(() => setFeedbackToast(null), 3000);
  };

  // Submit grading for exam
  const handleSaveExamGrading = () => {
    if (!gradingExam) return;

    StorageService.saveExamSchedule(activeChild.id, {
      id: gradingExam.id,
      status: 'passed',
      score: gradeScore,
      grade: gradeLabel,
      tajwidNotes: gradeTajwidNote,
    });

    setExamSchedules(StorageService.getExamSchedules(activeChild.id));
    setGradingExam(null);
    setMonthOverview(
      StorageService.getMonthCalendarOverview(activeChild.id, currentYear, currentMonth)
    );
    setChronologicalActivities(
      StorageService.getDailyChronologicalRecap(activeChild.id, selectedDate)
    );
    setFeedbackToast(`Alhamdulillah! Hasil ujian tersimpan dengan nilai ${gradeScore} (${gradeLabel}) 🏆`);
    setTimeout(() => setFeedbackToast(null), 4000);
  };

  // Test push notification trigger (Android launcher & browser)
  const handleTestAndroidPush = async () => {
    setIsPushingTest(true);
    try {
      await NotificationService.triggerAndroidPushNotification(
        `⭐ Agenda Santri: Waktu Murojaah ${activeChild.name}!`,
        `Assalamu'alaikum! Yuk temani ${activeChild.name} murojaah, cek daily task adab, dan pantau progres hafalan hari ini ✨`,
        '/#calendar'
      );
      setFeedbackToast('Push notification berhasil dikirim ke Android Launcher / Mobile Status Bar! 📲');
    } catch {
      setFeedbackToast('Notifikasi telah dipicu melalui browser / sistem.');
    } finally {
      setIsPushingTest(false);
      setTimeout(() => setFeedbackToast(null), 4000);
    }
  };

  // Selected date statistics
  const selectedDateOverview = (monthOverview && monthOverview[selectedDate]) || {
    hasMurojaah: false,
    hasZiadah: false,
    adabCompleted: 0,
    adabTotal: adabTasks?.length || 0,
    hasExam: false,
    totalStars: 0,
  };

  const adabCompletionPercent = Math.round(
    ((dailyAdabLog?.completedTaskIds?.length || 0) / (adabTasks?.length || 1)) * 100
  );

  if (!isOpen || !activeChild) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-hidden">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 15 }}
        className="relative w-full max-w-6xl max-h-[94vh] bg-white rounded-3xl sm:rounded-[36px] shadow-2xl overflow-hidden border border-slate-100 flex flex-col"
      >
        {/* HEADER TOP BAR */}
        <div className="bg-gradient-to-r from-[#164C68] via-[#1D5E80] to-[#0E354A] p-4 sm:p-6 text-white shrink-0 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-teal-500/20">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-400 to-amber-300 text-slate-950 flex items-center justify-center font-black shadow-md shrink-0">
              <CalendarIcon size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-lg sm:text-xl font-black tracking-tight text-white">
                  Kalender Progres & Agenda Santri
                </h3>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black uppercase tracking-wide">
                  Evaluasi Kronologis
                </span>
              </div>
              <p className="text-xs text-teal-100/90 font-medium mt-0.5">
                Rekap murojaah harian, daily task adab islami, target custom, dan jadwal ujian hafalan
              </p>
            </div>
          </div>

          {/* RIGHT ACTION: CHILD PICKER & ANDROID PUSH STATUS */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Child Profile Switcher */}
            {childrenList.length > 1 && onSwitchChild && (
              <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-2xl border border-white/20">
                <span className="text-xs font-medium text-teal-200">Santri:</span>
                <select
                  value={activeChild.id}
                  onChange={(e) => onSwitchChild(e.target.value)}
                  className="bg-transparent text-white font-black text-xs cursor-pointer focus:outline-hidden"
                >
                  {childrenList.map((c) => (
                    <option key={c.id} value={c.id} className="text-slate-900 font-bold">
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Android Push Notification Button */}
            <button
              onClick={handleTestAndroidPush}
              disabled={isPushingTest}
              className="px-3.5 py-2 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer disabled:opacity-50"
              title="Notifikasi aktif di browser & saat dipasang ke Android Launcher"
            >
              <Smartphone size={14} />
              <span>{isPushingTest ? 'Mengirim...' : 'Tes Push Android 📲'}</span>
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-2xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* FEEDBACK TOAST */}
        <AnimatePresence>
          {feedbackToast && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-emerald-600 text-white px-4 py-2.5 text-xs font-black flex items-center justify-between gap-3 shadow-inner"
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} />
                <span>{feedbackToast}</span>
              </div>
              <button
                onClick={() => setFeedbackToast(null)}
                className="text-white hover:text-emerald-100 text-xs font-bold"
              >
                ✕
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* MAIN BODY: 2 COLUMN SPLIT */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-slate-200">
          {/* ========================================================================= */}
          {/* LEFT COLUMN: INTERACTIVE MONTHLY CALENDAR GRID                            */}
          {/* ========================================================================= */}
          <div className="lg:col-span-5 xl:col-span-5 p-4 sm:p-6 space-y-5 bg-slate-50/50 flex flex-col justify-between">
            <div className="space-y-4">
              {/* MONTH CONTROLS */}
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-base sm:text-lg font-black text-slate-900">
                    {INDONESIAN_MONTHS[currentMonth - 1]} {currentYear}
                  </h4>
                  <span className="text-xs text-slate-500 font-medium">
                    Pilih tanggal untuk melihat detail aktivitas
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={handleJumpToToday}
                    className="px-2.5 py-1 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-[11px] font-bold text-slate-700 cursor-pointer shadow-2xs"
                  >
                    Hari Ini
                  </button>
                  <button
                    onClick={handlePrevMonth}
                    className="p-1.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 cursor-pointer shadow-2xs"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    onClick={handleNextMonth}
                    className="p-1.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 cursor-pointer shadow-2xs"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>

              {/* WEEKDAY HEADER */}
              <div className="grid grid-cols-7 gap-1 text-center font-black text-[11px] text-slate-400 py-1">
                {WEEKDAY_NAMES.map((name, i) => (
                  <div key={i} className={i === 0 || i === 5 ? 'text-teal-700 font-black' : ''}>
                    {name}
                  </div>
                ))}
              </div>

              {/* DAYS MATRIX */}
              <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
                {daysMatrix.map((item, idx) => {
                  const ov = monthOverview[item.dateStr];
                  const hasMurojaah = ov?.hasMurojaah;
                  const hasZiadah = ov?.hasZiadah;
                  const hasExam = ov?.hasExam;
                  const hasSmartGoal = ov?.hasSmartGoal;
                  const smartPortion = ov?.smartGoalPortion;
                  const adabCount = ov?.adabCompleted || 0;

                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedDate(item.dateStr)}
                      className={`relative min-h-[52px] sm:min-h-[58px] p-1.5 rounded-2xl flex flex-col justify-between items-center transition-all cursor-pointer text-left ${
                        item.isSelected
                          ? 'bg-[#164C68] text-white shadow-md ring-2 ring-[#164C68]/30 scale-[1.02]'
                          : item.isToday
                          ? 'bg-amber-100/70 border border-amber-300 text-slate-900 font-black'
                          : item.isCurrentMonth
                          ? 'bg-white hover:bg-teal-50/70 text-slate-800 border border-slate-200/80 shadow-2xs'
                          : 'bg-slate-100/60 text-slate-400 opacity-60'
                      }`}
                    >
                      {/* Day Number */}
                      <div className="w-full flex items-center justify-between text-[11px] font-black">
                        <span>{item.dayNumber}</span>
                        {item.isToday && (
                          <span className={`w-1.5 h-1.5 rounded-full ${item.isSelected ? 'bg-amber-300' : 'bg-amber-500'}`} />
                        )}
                      </div>

                      {/* Badges / Dots on this day */}
                      <div className="flex items-center justify-center gap-0.5 sm:gap-1 w-full pt-1 flex-wrap">
                        {hasSmartGoal && (
                          <span
                            title={`Target Smart Goal: ${smartPortion?.title || 'Porsi Harian'}`}
                            className="text-[10px] drop-shadow-xs"
                          >
                            🎯
                          </span>
                        )}
                        {hasExam && (
                          <span
                            title="Jadwal Ujian Hafalan"
                            className="text-[10px] drop-shadow-xs"
                          >
                            🏆
                          </span>
                        )}
                        {hasMurojaah && (
                          <span
                            title="Murojaah Aktif"
                            className={`w-2 h-2 rounded-full ${
                              item.isSelected ? 'bg-amber-300' : 'bg-emerald-500'
                            }`}
                          />
                        )}
                        {adabCount > 0 && (
                          <span
                            title={`${adabCount} Adab Selesai`}
                            className={`w-2 h-2 rounded-full ${
                              item.isSelected ? 'bg-teal-200' : 'bg-indigo-500'
                            }`}
                          />
                        )}
                        {hasZiadah && (
                          <span
                            title="Ziadah Hafalan Baru"
                            className={`w-2 h-2 rounded-full ${
                              item.isSelected ? 'bg-amber-400' : 'bg-amber-500'
                            }`}
                          />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* CALENDAR LEGEND */}
              <div className="p-3 bg-white rounded-2xl border border-slate-200 grid grid-cols-2 sm:grid-cols-5 gap-2 text-[10px] font-bold text-slate-600">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span>Murojaah</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                  <span>Daily Adab</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  <span>Ziadah Baru</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span>🎯</span>
                  <span>Smart Goal</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span>🏆</span>
                  <span>Ujian</span>
                </div>
              </div>
            </div>

            {/* ANDROID PWA LAUNCHER INFO CARD */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-teal-900 to-[#164C68] text-white space-y-2 mt-4 shadow-sm border border-teal-500/30">
              <div className="flex items-center gap-2">
                <Smartphone size={16} className="text-amber-300 shrink-0" />
                <span className="text-xs font-black text-amber-300">
                  Didukung Android Launcher & WebAPK
                </span>
              </div>
              <p className="text-[11px] text-teal-100 leading-relaxed">
                Tambahkan Cahaya Tahfiz ke Layar Utama Android (PWA) agar push notifikasi pengingat murojaah & jadwal ujian tetap berdering otomatis di ponsel orang tua.
              </p>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* RIGHT COLUMN: KRONOLOGIS DETAIL, ADAB, TARGET CUSTOM & JADWAL UJIAN        */}
          {/* ========================================================================= */}
          <div className="lg:col-span-7 xl:col-span-7 p-4 sm:p-6 space-y-5 bg-white flex flex-col justify-between">
            {/* DATE TITLE STRIP & SUB-TAB CONTROLS */}
            <div className="space-y-3 border-b border-slate-100 pb-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-black text-slate-900">
                      Agenda & Evaluasi:
                    </span>
                    <span className="text-xs font-bold text-[#164C68] bg-teal-50 px-2.5 py-0.5 rounded-lg border border-teal-200">
                      {new Date(selectedDate).toLocaleDateString('id-ID', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                  <span className="text-xs text-slate-500 font-medium">
                    Santri: <strong className="text-slate-800">{activeChild.name}</strong> • Level {activeChild.learningLevel}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200 flex items-center gap-1">
                    <Star size={12} className="fill-amber-500 text-amber-500" />
                    <span>+{selectedDateOverview.totalStars || 0} Bintang</span>
                  </span>
                </div>
              </div>

              {/* SELECTED DATE SMART GOAL PORTION BANNER */}
              {monthOverview[selectedDate]?.smartGoalPortion && (() => {
                const portion = monthOverview[selectedDate]?.smartGoalPortion as DailyBreakdownPortion;
                return (
                  <div
                    className={`p-3.5 sm:p-4 rounded-2xl sm:rounded-3xl border-2 transition-all shadow-xs ${
                      portion.isCompleted
                        ? 'bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-100/50 border-emerald-300'
                        : 'bg-gradient-to-r from-amber-50 via-orange-50/60 to-yellow-50 border-amber-300'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-base">🎯</span>
                          <span className="text-[11px] font-black uppercase tracking-wider text-amber-950 bg-amber-100/90 px-2 py-0.5 rounded-md border border-amber-200">
                            Porsi Smart Goal Hari Ini
                          </span>
                          {portion.isCompleted ? (
                            <span className="text-[10px] font-black bg-emerald-600 text-white px-2 py-0.5 rounded-full flex items-center gap-1">
                              <Check size={11} /> Tuntas (+{portion.starsReward} ⭐)
                            </span>
                          ) : (
                            <span className="text-[10px] font-black bg-amber-500 text-slate-950 px-2 py-0.5 rounded-full">
                              ⏳ Target Menghafal (+{portion.starsReward} ⭐)
                            </span>
                          )}
                        </div>
                        <h5 className="text-xs sm:text-sm font-black text-slate-900 truncate">
                          {portion.title}
                        </h5>
                        <p className="text-[11px] text-slate-600 font-medium">
                          {portion.notes} • Estimasi: <strong>{portion.estimatedMinutes} Menit</strong>
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => handleTogglePortion(portion.id)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs ${
                            portion.isCompleted
                              ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                              : 'bg-white hover:bg-amber-100 text-slate-900 border border-amber-300'
                          }`}
                        >
                          <CheckCircle2 size={14} />
                          <span>{portion.isCompleted ? 'Tuntas ✓' : 'Tandai Selesai'}</span>
                        </button>

                        {portion.type !== 'istirahat' && (
                          <button
                            onClick={() => handleStartPortionPractice(portion)}
                            className="px-3.5 py-1.5 rounded-xl bg-[#164C68] hover:bg-[#1D5E80] text-white text-xs font-black flex items-center gap-1.5 shadow-2xs cursor-pointer active:scale-95"
                          >
                            <BookOpen size={14} />
                            <span>Hafal Sekarang ➔</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* 6 SUB TABS */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-1.5 pt-1">
                <button
                  onClick={() => setActiveTab('smart_goal')}
                  className={`py-2 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    activeTab === 'smart_goal'
                      ? 'bg-amber-400 text-slate-950 shadow-md ring-2 ring-amber-300'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <Target size={13} className="text-amber-800" />
                  <span>Smart Goal</span>
                </button>

                <button
                  onClick={() => setActiveTab('learning_graph')}
                  className={`py-2 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    activeTab === 'learning_graph'
                      ? 'bg-gradient-to-r from-cyan-600 to-[#164C68] text-white shadow-md ring-2 ring-cyan-300'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <Sparkles size={13} className="text-cyan-400" />
                  <span>Graph (SR)</span>
                </button>

                <button
                  onClick={() => setActiveTab('rekap')}
                  className={`py-2 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    activeTab === 'rekap'
                      ? 'bg-[#164C68] text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <Clock size={13} />
                  <span>Kronologis ({chronologicalActivities.length})</span>
                </button>

                <button
                  onClick={() => setActiveTab('adab')}
                  className={`py-2 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    activeTab === 'adab'
                      ? 'bg-indigo-700 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <CheckCircle2 size={13} />
                  <span>Daily Adab ({dailyAdabLog.completedTaskIds?.length || 0}/{adabTasks.length})</span>
                </button>

                <button
                  onClick={() => setActiveTab('target')}
                  className={`py-2 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    activeTab === 'target'
                      ? 'bg-amber-500 text-slate-950 shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <Target size={13} />
                  <span>Target Custom ({customTargets.length})</span>
                </button>

                <button
                  onClick={() => setActiveTab('ujian')}
                  className={`py-2 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    activeTab === 'ujian'
                      ? 'bg-rose-700 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <Trophy size={13} />
                  <span>Ujian ({examSchedules.length})</span>
                </button>
              </div>
            </div>

            {/* ===================================================================== */}
            {/* TAB SMART GOAL: TARGET SEPEKAN & PEMBAGIAN PORSI HARIAN OTOMATIS      */}
            {/* ===================================================================== */}
            {activeTab === 'smart_goal' && (
              <div className="space-y-4 flex-1">
                {/* LUMI SMART PLANNER BANNER */}
                <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white shadow-sm flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-xl shrink-0">
                      ⭐
                    </div>
                    <div>
                      <h5 className="text-xs sm:text-sm font-black flex items-center gap-1.5 text-white">
                        <span>Smart Goal Planner Santri</span>
                        <span className="text-[10px] bg-white text-slate-950 px-2 py-0.2 rounded-full font-black uppercase">
                          Otomatis
                        </span>
                      </h5>
                      <p className="text-[11px] text-amber-100 font-medium leading-relaxed">
                        Tetapkan target 1 surah sepekan, sistem otomatis memecah porsi harian santri agar hafalan mutqin dan tidak melelahkan.
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => setShowSmartGoalWizard(true)}
                    className="px-3.5 py-2 rounded-xl bg-white hover:bg-amber-100 text-slate-950 text-xs font-black flex items-center gap-1.5 shrink-0 shadow-xs cursor-pointer active:scale-95 transition-all"
                  >
                    <PlusCircle size={14} className="text-amber-600" />
                    <span>Buat Target Baru</span>
                  </button>
                </div>

                {/* ACTIVE SMART GOAL OVERVIEW CARD */}
                {smartGoal ? (
                  <div className="p-4 rounded-3xl bg-slate-50 border-2 border-amber-200 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/80 pb-2.5">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black uppercase text-amber-900 bg-amber-100 px-2 py-0.5 rounded-md">
                            Target Pekan Ini
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase ${
                              smartGoal.status === 'completed'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {smartGoal.status === 'completed' ? '🏆 Tuntas 100%' : 'Sedang Berjalan'}
                          </span>
                        </div>
                        <h4 className="text-sm sm:text-base font-black text-slate-900 mt-1">
                          {smartGoal.title}
                        </h4>
                      </div>

                      <div className="text-right flex sm:flex-col items-center sm:items-end justify-between gap-1 text-[11px] font-bold text-slate-600">
                        <span>
                          📅 {smartGoal.startDate} s/d {smartGoal.endDate}
                        </span>
                        <span className="text-amber-600">+{smartGoal.totalStarsReward} ⭐ Bonus</span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                        <span>Capaian Ayat Tuntas:</span>
                        <span className="text-amber-600 font-black">
                          {smartGoal.completedAyatCount} dari {smartGoal.totalAyat} Ayat (
                          {Math.round((smartGoal.completedAyatCount / smartGoal.totalAyat) * 100)}%)
                        </span>
                      </div>
                      <div className="w-full h-2.5 rounded-full bg-slate-200 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-amber-400 via-orange-500 to-emerald-500 rounded-full transition-all duration-500"
                          style={{
                            width: `${Math.min(
                              100,
                              Math.round((smartGoal.completedAyatCount / smartGoal.totalAyat) * 100)
                            )}%`,
                          }}
                        />
                      </div>
                    </div>

                    {/* Meta Tags: Reward & Intensity */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
                      <div className="p-2.5 rounded-2xl bg-white border border-amber-200/80 text-[11px] font-bold text-amber-950 flex items-center gap-2">
                        <Award size={15} className="text-amber-500 shrink-0" />
                        <span className="truncate">
                          <strong>Hadiah:</strong> {smartGoal.rewardDescription}
                        </span>
                      </div>
                      <div className="p-2.5 rounded-2xl bg-white border border-slate-200 text-[11px] font-bold text-slate-700 flex items-center gap-2">
                        <Zap size={14} className="text-indigo-500 shrink-0" />
                        <span>
                          Intensitas: <strong className="uppercase">{smartGoal.intensityLevel}</strong> • {smartGoal.activeDaysPerWeek} Hari Belajar
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-6 text-center rounded-3xl bg-slate-50 border-2 border-dashed border-slate-200 space-y-2">
                    <p className="text-xs text-slate-500 font-medium">
                      Belum ada target sepekan yang aktif untuk santri.
                    </p>
                    <button
                      onClick={() => setShowSmartGoalWizard(true)}
                      className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs cursor-pointer shadow-xs"
                    >
                      + Buat Smart Goal Sekarang
                    </button>
                  </div>
                )}

                {/* 7-DAY PORTIONS BREAKDOWN TIMELINE */}
                {smartGoal && (
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <h5 className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                        <CalendarIcon size={14} className="text-amber-500" />
                        <span>Jadwal Porsi Harian Pekan Ini (Senin - Ahad)</span>
                      </h5>
                      <span className="text-[11px] text-slate-500 font-medium">
                        Klik centang untuk verifikasi harian
                      </span>
                    </div>

                    <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                      {smartGoal.dailyPortions.map((portion) => {
                        const isSelectedDate = portion.date === selectedDate;
                        const isToday = portion.date === today.toISOString().split('T')[0];

                        return (
                          <div
                            key={portion.id}
                            className={`p-3 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                              portion.isCompleted
                                ? 'bg-emerald-50/70 border-emerald-300 text-slate-900'
                                : isSelectedDate
                                ? 'bg-amber-50/80 border-amber-300 ring-1 ring-amber-300'
                                : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                            }`}
                          >
                            <div className="flex items-start sm:items-center gap-3">
                              {/* Toggle Checkbox Button */}
                              <button
                                onClick={() => handleTogglePortion(portion.id)}
                                className={`w-6 h-6 rounded-lg flex items-center justify-center font-black transition-all cursor-pointer shrink-0 mt-0.5 sm:mt-0 ${
                                  portion.isCompleted
                                    ? 'bg-emerald-600 text-white shadow-xs'
                                    : 'border-2 border-slate-300 bg-white hover:border-amber-400'
                                }`}
                              >
                                {portion.isCompleted && <Check size={14} />}
                              </button>

                              <div>
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className="px-1.5 py-0.2 rounded-md bg-slate-100 text-slate-700 text-[10px] font-black font-mono">
                                    Hari {portion.dayIndex} • {portion.dayName} ({portion.date})
                                  </span>
                                  {isToday && (
                                    <span className="px-1.5 py-0.2 rounded-md bg-amber-400 text-slate-950 text-[9px] font-black uppercase">
                                      Hari Ini
                                    </span>
                                  )}
                                  <span
                                    className={`px-1.5 py-0.2 rounded-md text-[9px] font-black uppercase ${
                                      portion.type === 'ziadah'
                                        ? 'bg-amber-100 text-amber-800'
                                        : portion.type === 'murojaah'
                                        ? 'bg-teal-100 text-teal-800'
                                        : portion.type === 'tasmi_evaluasi'
                                        ? 'bg-rose-100 text-rose-800'
                                        : 'bg-slate-100 text-slate-600'
                                    }`}
                                  >
                                    {portion.type === 'ziadah'
                                      ? 'Hafalan Baru'
                                      : portion.type === 'murojaah'
                                      ? 'Murojaah'
                                      : portion.type === 'tasmi_evaluasi'
                                      ? "Tasmi' Ujian"
                                      : 'Istirahat'}
                                  </span>
                                </div>

                                <h6
                                  className={`text-xs font-black mt-1 ${
                                    portion.isCompleted ? 'line-through text-slate-500' : 'text-slate-900'
                                  }`}
                                >
                                  {portion.title}
                                </h6>
                                <p className="text-[11px] text-slate-500 font-medium">
                                  {portion.notes} • Estimasi: {portion.estimatedMinutes} Menit
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0">
                              <span className="text-xs font-black text-amber-600 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200">
                                +{portion.starsReward} ⭐
                              </span>

                              {portion.type !== 'istirahat' && (
                                <button
                                  onClick={() => handleStartPortionPractice(portion)}
                                  className="px-3 py-1.5 rounded-xl bg-[#164C68] hover:bg-[#1D5E80] text-white text-[11px] font-black cursor-pointer shadow-2xs active:scale-95"
                                >
                                  Hafal ➔
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ===================================================================== */}
            {/* TAB 1: REKAP KRONOLOGIS HARIAN (TIMELINE DARI PAGI KE MALAM)          */}
            {/* ===================================================================== */}
            {activeTab === 'rekap' && (
              <div className="space-y-4 flex-1">
                <div className="flex items-center justify-between">
                  <h5 className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <Clock size={14} className="text-[#164C68]" />
                    <span>Rekaman Kronologis Waktu Belajar & Ibadah</span>
                  </h5>
                  <span className="text-[11px] text-slate-500 font-medium">
                    {chronologicalActivities.length} Catatan Aktivitas
                  </span>
                </div>

                {/* CHRONOLOGICAL TIMELINE LIST */}
                <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
                  {chronologicalActivities.map((act, i) => (
                    <div
                      key={act.id || i}
                      className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3 hover:bg-teal-50/40 transition-all"
                    >
                      <div className="px-2 py-1 rounded-xl bg-white text-[#164C68] font-mono text-xs font-bold border border-slate-200 shrink-0">
                        {act.timeFormatted}
                      </div>

                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between gap-2">
                          <h6 className="text-xs font-black text-slate-900">
                            {act.title}
                          </h6>
                          <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-[10px] font-black text-slate-700 shrink-0">
                            {act.badge || 'Aktivitas'}
                          </span>
                        </div>

                        <p className="text-xs text-slate-600 leading-relaxed font-medium">
                          {act.description}
                        </p>

                        <div className="pt-1 flex items-center justify-between text-[11px] text-slate-500 font-bold">
                          {act.score !== undefined && (
                            <span className="text-emerald-700">Skor: {act.score}%</span>
                          )}
                          <span className="text-amber-600 flex items-center gap-1">
                            <Star size={11} className="fill-amber-500 text-amber-500" />
                            <span>+{act.starsEarned} Bintang</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* BOTTOM ACTION FOR PARENTS */}
                <div className="p-3 bg-teal-50 rounded-2xl border border-teal-200 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-teal-700 shrink-0" />
                    <span className="text-teal-900 font-medium">
                      Orang tua dapat mencetak rekap atau memulai murojaah hari ini
                    </span>
                  </div>
                  {onNavigateToMurojaah && (
                    <button
                      onClick={() => {
                        onClose();
                        onNavigateToMurojaah();
                      }}
                      className="px-3.5 py-1.5 rounded-xl bg-[#164C68] hover:bg-[#1D5E80] text-white font-black text-xs cursor-pointer shrink-0 shadow-2xs"
                    >
                      Mulai Murojaah Sekarang →
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* ===================================================================== */}
            {/* TAB 2: DAILY TASK ADAB (CHECKLIST ADAB HARIAN & VERIFIKASI WALI)      */}
            {/* ===================================================================== */}
            {activeTab === 'adab' && (
              <div className="space-y-4 flex-1">
                {/* ADAB PROGRESS BAR */}
                <div className="p-3.5 rounded-2xl bg-indigo-50 border border-indigo-200 space-y-2">
                  <div className="flex items-center justify-between text-xs font-black">
                    <span className="text-indigo-950 flex items-center gap-1.5">
                      <Sparkles size={14} className="text-indigo-600" />
                      <span>Pembiasaan Adab Harian Santri ({adabCompletionPercent}%)</span>
                    </span>
                    <span className="text-indigo-700">
                      {dailyAdabLog.completedTaskIds?.length || 0} dari {adabTasks.length} Tuntas
                    </span>
                  </div>

                  <div className="w-full h-2.5 rounded-full bg-indigo-200/60 overflow-hidden">
                    <div
                      className="h-full bg-linear-to-r from-indigo-600 to-teal-500 rounded-full transition-all duration-500"
                      style={{ width: `${adabCompletionPercent}%` }}
                    />
                  </div>

                  {/* Parent Verification Status */}
                  <div className="pt-1 flex items-center justify-between text-xs">
                    <span className="text-slate-600 font-medium">
                      Status Verifikasi Ayah/Bunda:
                    </span>
                    {dailyAdabLog.parentVerified ? (
                      <span className="px-2.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-black flex items-center gap-1">
                        <Check size={12} /> Diverifikasi Orang Tua
                      </span>
                    ) : (
                      <button
                        onClick={() => handleVerifyAdabLog(true)}
                        className="px-2.5 py-0.5 rounded-md bg-amber-400 hover:bg-amber-300 text-slate-950 font-black cursor-pointer shadow-2xs"
                      >
                        ✓ Beri Verifikasi Hari Ini
                      </button>
                    )}
                  </div>
                </div>

                {/* ADAB TASKS LIST */}
                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                  {adabTasks.map((task) => {
                    const isDone = dailyAdabLog.completedTaskIds?.includes(task.id);
                    return (
                      <div
                        key={task.id}
                        onClick={() => handleToggleAdabTask(task.id)}
                        className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                          isDone
                            ? 'bg-emerald-50/70 border-emerald-300 text-slate-900'
                            : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-6 h-6 rounded-lg flex items-center justify-center font-black transition-all ${
                              isDone
                                ? 'bg-emerald-600 text-white'
                                : 'border-2 border-slate-300 bg-white'
                            }`}
                          >
                            {isDone && <Check size={14} />}
                          </div>

                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-sm">{task.icon}</span>
                              <h6 className={`text-xs font-black ${isDone ? 'line-through text-slate-500' : 'text-slate-900'}`}>
                                {task.title}
                              </h6>
                              {task.isCustom && (
                                <span className="px-1.5 py-0.2 rounded-md bg-amber-100 text-amber-800 text-[9px] font-bold">
                                  Custom Orang Tua
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-500 font-medium">
                              {task.description} • Rekomendasi: {task.timeRecommendation}
                            </p>
                          </div>
                        </div>

                        <span className="text-xs font-black text-amber-600 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200 shrink-0">
                          +{task.starsReward} ⭐
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* ADD CUSTOM TASK BUTTON */}
                <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                  <span className="text-xs text-slate-500">
                    Ingin menambahkan tugas adab khusus keluarga Anda?
                  </span>
                  <button
                    onClick={() => setShowAddTaskModal(true)}
                    className="px-3 py-1.5 rounded-xl bg-indigo-700 hover:bg-indigo-600 text-white text-xs font-black flex items-center gap-1 cursor-pointer shadow-2xs"
                  >
                    <PlusCircle size={14} />
                    <span>Tambah Adab Baru</span>
                  </button>
                </div>
              </div>
            )}

            {/* ===================================================================== */}
            {/* TAB 3: TARGET-TARGET HAFALAN & EVALUASI CUSTOM                       */}
            {/* ===================================================================== */}
            {activeTab === 'target' && (
              <div className="space-y-4 flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                      <Target size={14} className="text-amber-500" />
                      <span>Target Hafalan & Milestone Santri</span>
                    </h5>
                    <p className="text-[11px] text-slate-500">
                      Target yang dirancang bersama orang tua lengkap dengan reward apresiasi
                    </p>
                  </div>

                  <button
                    onClick={() => setShowAddTargetModal(true)}
                    className="px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs flex items-center gap-1 cursor-pointer shadow-2xs"
                  >
                    <PlusCircle size={14} />
                    <span>Buat Target</span>
                  </button>
                </div>

                {/* TARGETS LIST */}
                <div className="space-y-3 max-h-[340px] overflow-y-auto pr-1">
                  {customTargets.map((target) => {
                    const percent = Math.min(
                      100,
                      Math.round((target.currentProgress / target.targetQuantity) * 100)
                    );
                    return (
                      <div
                        key={target.id}
                        className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 hover:bg-amber-50/40 transition-all"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <h6 className="text-xs font-black text-slate-900">
                            {target.title}
                          </h6>
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase ${
                              target.isAchieved
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {target.isAchieved ? '✓ Tercapai' : `${percent}%`}
                          </span>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                          <div
                            className="h-full bg-linear-to-r from-amber-400 to-amber-600 rounded-full"
                            style={{ width: `${percent}%` }}
                          />
                        </div>

                        <div className="flex items-center justify-between text-[11px] text-slate-600 font-medium">
                          <span>
                            Progress: <strong>{target.currentProgress}</strong> dari{' '}
                            <strong>{target.targetQuantity}</strong> {target.unit}
                          </span>
                          <span>Tenggat: {target.deadlineDate}</span>
                        </div>

                        {target.rewardDescription && (
                          <div className="p-2 rounded-xl bg-white border border-amber-200/80 text-[11px] font-bold text-amber-900 flex items-center gap-1.5">
                            <Award size={13} className="text-amber-600 shrink-0" />
                            <span>{target.rewardDescription}</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ===================================================================== */}
            {/* TAB 4: JADWAL UJIAN HAFALAN & TASMI' KELULUSAN                        */}
            {/* ===================================================================== */}
            {activeTab === 'ujian' && (
              <div className="space-y-4 flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                      <Trophy size={14} className="text-rose-600" />
                      <span>Jadwal Ujian Hafalan & Hasil Tasmi'</span>
                    </h5>
                    <p className="text-[11px] text-slate-500">
                      Jadwal ujian berkala, penilaian tajwid, makhraj, dan sertifikat kelulusan
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      setExamDate(selectedDate);
                      setShowAddExamModal(true);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-rose-700 hover:bg-rose-600 text-white font-black text-xs flex items-center gap-1 cursor-pointer shadow-2xs"
                  >
                    <PlusCircle size={14} />
                    <span>Jadwalkan Ujian</span>
                  </button>
                </div>

                {/* EXAM LIST */}
                <div className="space-y-3 max-h-[340px] overflow-y-auto pr-1">
                  {examSchedules.map((exam) => (
                    <div
                      key={exam.id}
                      className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <h6 className="text-xs font-black text-slate-900">
                              {exam.title}
                            </h6>
                            <span
                              className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase ${
                                exam.status === 'passed'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {exam.status === 'passed' ? 'LULUS 🏆' : 'TERJADWAL 📅'}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-600 mt-0.5 font-medium">
                            Materi: <strong>{exam.surahRange}</strong> • Penguji: {exam.evaluatorName}
                          </p>
                        </div>

                        <div className="text-right text-[11px] font-mono font-bold text-slate-500">
                          {exam.date} • {exam.time} WIB
                        </div>
                      </div>

                      {/* Result details if passed */}
                      {exam.status === 'passed' && (
                        <div className="p-3 rounded-xl bg-emerald-50/80 border border-emerald-200 text-xs space-y-1">
                          <div className="flex items-center justify-between font-black text-emerald-950">
                            <span>Nilai: {exam.score}/100 ({exam.grade})</span>
                            <span className="text-[10px] text-emerald-700 bg-white px-2 py-0.5 rounded-md border border-emerald-200">
                              Terverifikasi
                            </span>
                          </div>
                          {exam.tajwidNotes && (
                            <p className="text-[11px] text-emerald-900 italic">
                              Catatan: "{exam.tajwidNotes}"
                            </p>
                          )}
                        </div>
                      )}

                      {/* If scheduled, allow parents or teacher to input grading */}
                      {exam.status !== 'passed' && (
                        <button
                          onClick={() => {
                            setGradingExam(exam);
                            setGradeScore(95);
                          }}
                          className="w-full py-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-xs font-black text-slate-800 transition-all cursor-pointer shadow-2xs"
                        >
                          📝 Masukkan Nilai & Catatan Hasil Ujian
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ===================================================================== */}
            {/* TAB 5: LEARNING GRAPH & SPACED REPETITION (URUTAN 1)                  */}
            {/* ===================================================================== */}
            {activeTab === 'learning_graph' && (
              <div className="space-y-4 flex-1">
                {/* Header Banner */}
                <div className="p-4 rounded-3xl bg-gradient-to-r from-cyan-600 via-[#164C68] to-indigo-900 text-white shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-white/20 text-cyan-200 uppercase tracking-wider inline-flex items-center gap-1">
                      <Sparkles size={11} /> Universal Learning Graph
                    </span>
                    <h4 className="text-base font-black font-heading">
                      Kurikulum Graf & Spaced Repetition (SR)
                    </h4>
                    <p className="text-xs text-cyan-100 font-medium">
                      Satu model data kurikulum utuh yang menghubungkan materi, game, dan kalender santri.
                    </p>
                  </div>

                  <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md p-2.5 rounded-2xl border border-white/10 shrink-0">
                    <div className="text-center px-2">
                      <span className="text-[10px] text-cyan-200 block font-bold">Total Mastery</span>
                      <span className="text-lg font-black text-white font-heading">
                        {learningGraph.stats.overallMasteryPct}%
                      </span>
                    </div>
                    <div className="w-px h-8 bg-white/20" />
                    <div className="text-center px-2">
                      <span className="text-[10px] text-cyan-200 block font-bold">Node Tuntas</span>
                      <span className="text-lg font-black text-emerald-300 font-heading">
                        {learningGraph.stats.masteredNodes}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 4 KPI Summary Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <div className="p-3 bg-white border border-slate-200 rounded-2xl shadow-2xs">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block">
                      Total Node
                    </span>
                    <span className="text-xl font-black text-[#164C68] font-heading mt-0.5 block">
                      {learningGraph.stats.totalNodes}
                    </span>
                    <span className="text-[10px] text-slate-500">Iqra, Tajwid, Vocab, Blok</span>
                  </div>

                  <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-2xl shadow-2xs">
                    <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 block">
                      Mastered (≥70%)
                    </span>
                    <span className="text-xl font-black text-emerald-700 font-heading mt-0.5 block">
                      {learningGraph.stats.masteredNodes}
                    </span>
                    <span className="text-[10px] text-emerald-600 font-bold">
                      {Math.round((learningGraph.stats.masteredNodes / Math.max(1, learningGraph.stats.totalNodes)) * 100)}% dari Kurikulum
                    </span>
                  </div>

                  <div className="p-3 bg-cyan-50/70 border border-cyan-200 rounded-2xl shadow-2xs">
                    <span className="text-[10px] font-black uppercase tracking-wider text-cyan-700 block">
                      Sedang Aktif
                    </span>
                    <span className="text-xl font-black text-cyan-700 font-heading mt-0.5 block">
                      {learningGraph.stats.inProgressNodes}
                    </span>
                    <span className="text-[10px] text-cyan-600 font-bold">
                      {learningGraph.stats.availableNodes} Node Siap Dibuka
                    </span>
                  </div>

                  <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-2xl shadow-2xs">
                    <span className="text-[10px] font-black uppercase tracking-wider text-amber-800 block">
                      Jadwal Review (SR)
                    </span>
                    <span className="text-xl font-black text-amber-800 font-heading mt-0.5 block">
                      {learningGraph.stats.dueForReviewCount}
                    </span>
                    <span className="text-[10px] text-amber-700 font-bold">Perlu Murojaah Hari Ini</span>
                  </div>
                </div>

                {/* Spaced Repetition Due Review Banner */}
                {learningGraph.stats.dueForReviewCount > 0 && (
                  <div className="p-3.5 bg-amber-50 border border-amber-300 rounded-2xl shadow-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-amber-900 flex items-center gap-1.5">
                        <Flame size={14} className="text-amber-600 animate-pulse" />
                        Antrean Spaced Repetition Hari Ini ({learningGraph.stats.dueForReviewCount} Node)
                      </span>
                      <span className="text-[10px] font-bold text-amber-700">Mencegah Hafalan Luntur</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {Object.values(learningGraph.nodes)
                        .filter((n) => {
                          const s = learningGraph.userProgress[n.nodeId];
                          const todayStr = new Date().toISOString().split('T')[0];
                          return s && s.nextReviewDate && s.nextReviewDate <= todayStr && s.mastery > 0;
                        })
                        .slice(0, 4)
                        .map((node) => (
                          <div
                            key={node.nodeId}
                            className="p-2.5 bg-white rounded-xl border border-amber-200 flex items-center justify-between gap-2 shadow-2xs"
                          >
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-slate-900 truncate">{node.title}</p>
                              <p className="text-[10px] text-amber-700 font-medium truncate">{node.subtitle || node.category}</p>
                            </div>
                            <button
                              onClick={() => {
                                StorageService.updateNodeMastery(activeChild.id, node.nodeId, {
                                  score: 95,
                                  completed: true,
                                });
                                confetti({ particleCount: 25, spread: 60 });
                              }}
                              className="px-2.5 py-1 text-[10px] font-black bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-lg transition-all cursor-pointer active:scale-95 shrink-0"
                            >
                              Review 🔁
                            </button>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {/* Filter and Search Bar */}
                <div className="space-y-2 pt-1">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    {/* Kind Pills */}
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                      {[
                        { id: 'all', label: 'Semua Node' },
                        { id: 'hafalan_block', label: 'Hafalan Blok' },
                        { id: 'iqra_page', label: 'Iqra (182 Hal)' },
                        { id: 'tajwid_topic', label: 'Tajwid (12 Topik)' },
                        { id: 'vocab_word', label: 'Mufrodat (424 Kata)' },
                        { id: 'tafsir_ayah', label: 'Tafsir' },
                      ].map((item) => (
                        <button
                          key={item.id}
                          onClick={() => setGraphFilterKind(item.id as any)}
                          className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer text-xs ${
                            graphFilterKind === item.id
                              ? 'bg-[#164C68] text-white shadow-xs'
                              : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>

                    {/* Search Input */}
                    <input
                      type="text"
                      placeholder="Cari materi / surah / topik..."
                      value={graphSearchQuery}
                      onChange={(e) => setGraphSearchQuery(e.target.value)}
                      className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-cyan-500 sm:w-48"
                    />
                  </div>
                </div>

                {/* Node Grid */}
                {(() => {
                  const filteredNodes = Object.values(learningGraph.nodes).filter((node) => {
                    if (graphFilterKind !== 'all' && node.kind !== graphFilterKind) return false;
                    if (graphSearchQuery.trim()) {
                      const q = graphSearchQuery.toLowerCase();
                      const matchTitle = node.title.toLowerCase().includes(q);
                      const matchSub = node.subtitle?.toLowerCase().includes(q);
                      const matchCat = node.category?.toLowerCase().includes(q);
                      const matchArab = node.arabic?.toLowerCase().includes(q);
                      if (!matchTitle && !matchSub && !matchCat && !matchArab) return false;
                    }
                    return true;
                  });

                  if (filteredNodes.length === 0) {
                    return (
                      <div className="p-8 text-center bg-slate-50 border border-slate-200 rounded-3xl space-y-1">
                        <span className="text-3xl">🔍</span>
                        <p className="text-xs font-bold text-slate-700">Tidak ada node kurikulum yang cocok</p>
                        <p className="text-[11px] text-slate-500">Coba ubah kata kunci atau kategori filter</p>
                      </div>
                    );
                  }

                  return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 max-h-[460px] overflow-y-auto pr-1">
                      {filteredNodes.slice(0, 40).map((node) => {
                        const state = learningGraph.userProgress[node.nodeId];
                        const isMastered = state?.status === 'mastered';
                        const isAvailable = state?.status === 'available' || state?.status === 'in_progress';
                        const isLocked = state?.status === 'locked';

                        return (
                          <div
                            key={node.nodeId}
                            className={`p-3.5 rounded-2xl border transition-all ${
                              isMastered
                                ? 'bg-white border-emerald-200 shadow-2xs hover:border-emerald-300'
                                : isAvailable
                                ? 'bg-white border-cyan-200 shadow-2xs hover:border-cyan-300'
                                : 'bg-slate-50/70 border-slate-200 opacity-75'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span
                                    className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                                      node.kind === 'hafalan_block'
                                        ? 'bg-amber-100 text-amber-800'
                                        : node.kind === 'iqra_page'
                                        ? 'bg-cyan-100 text-cyan-800'
                                        : node.kind === 'tajwid_topic'
                                        ? 'bg-emerald-100 text-emerald-800'
                                        : node.kind === 'vocab_word'
                                        ? 'bg-indigo-100 text-indigo-800'
                                        : 'bg-rose-100 text-rose-800'
                                    }`}
                                  >
                                    {node.kind.replace('_', ' ')}
                                  </span>
                                  <span className="text-[10px] text-amber-500 font-bold">
                                    {'⭐'.repeat(node.difficulty)}
                                  </span>
                                  {node.category && (
                                    <span className="text-[10px] text-slate-500 font-medium">
                                      • {node.category}
                                    </span>
                                  )}
                                </div>

                                <h6 className="text-xs font-black text-slate-900 mt-1 truncate">
                                  {node.title}
                                </h6>
                                <p className="text-[11px] text-slate-500 truncate">
                                  {node.subtitle || node.description}
                                </p>
                              </div>

                              {/* Arabic text snippet if exists */}
                              {node.arabic && (
                                <span className="font-quran text-base font-bold text-[#164C68] shrink-0 bg-slate-50 px-2 py-0.5 rounded-lg border border-slate-100">
                                  {node.arabic.slice(0, 15)}
                                </span>
                              )}
                            </div>

                            {/* Prerequisites Display */}
                            {node.prereq && node.prereq.length > 0 && (
                              <div className="mt-2 pt-2 border-t border-slate-100 flex items-center gap-1 text-[10px] text-slate-500 flex-wrap">
                                <span className="font-bold text-slate-600">Prasyarat:</span>
                                {node.prereq.map((pid) => {
                                  const pState = learningGraph.userProgress[pid];
                                  const pNode = learningGraph.nodes[pid];
                                  const pDone = pState && (pState.mastery >= 70 || pState.status === 'mastered');
                                  return (
                                    <span
                                      key={pid}
                                      className={`px-1.5 py-0.5 rounded-md font-semibold ${
                                        pDone ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'
                                      }`}
                                    >
                                      {pNode?.title?.split(' : ')[0] || pid} {pDone ? '✓' : '🔒'}
                                    </span>
                                  );
                                })}
                              </div>
                            )}

                            {/* Mastery & Spaced Repetition Details */}
                            <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between gap-2 text-xs">
                              <div className="space-y-1 flex-1">
                                <div className="flex items-center justify-between text-[10px]">
                                  <span className="font-bold text-slate-600">Mastery:</span>
                                  <span className="font-black text-slate-900">{state?.mastery || 0}%</span>
                                </div>
                                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                  <div
                                    className={`h-full rounded-full transition-all ${
                                      isMastered
                                        ? 'bg-emerald-500'
                                        : isAvailable
                                        ? 'bg-cyan-500'
                                        : 'bg-slate-300'
                                    }`}
                                    style={{ width: `${state?.mastery || 0}%` }}
                                  />
                                </div>
                                {state?.nextReviewDate && (
                                  <span className="text-[9px] text-slate-500 block">
                                    Next SR: {state.nextReviewDate} (Interval: {state.srIntervalDays || 1}d)
                                  </span>
                                )}
                              </div>

                              {/* Drill Action */}
                              <button
                                onClick={() => {
                                  if (isLocked) {
                                    alert(`Materi ini terkunci. Tuntaskan materi prasyarat terlebih dahulu.`);
                                    return;
                                  }
                                  StorageService.updateNodeMastery(activeChild.id, node.nodeId, {
                                    score: 95,
                                    completed: true,
                                  });
                                  confetti({ particleCount: 30, spread: 70 });
                                }}
                                disabled={isLocked}
                                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer shrink-0 ${
                                  isLocked
                                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                    : 'bg-[#164C68] hover:bg-slate-800 text-white shadow-2xs active:scale-95'
                                }`}
                              >
                                {isMastered ? 'Latih Ulang ⚡' : 'Drill Mastery ⚡'}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* MODAL SUB-FORM 1: TAMBAH TUGAS ADAB KELUARGA BARU                        */}
        {/* ========================================================================= */}
        <AnimatePresence>
          {showAddTaskModal && (
            <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 space-y-4"
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
                    <span>✨ Tambah Pembiasaan Adab Harian Baru</span>
                  </h4>
                  <button
                    onClick={() => setShowAddTaskModal(false)}
                    className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
                  >
                    ✕
                  </button>
                </div>

                <form onSubmit={handleCreateCustomTask} className="space-y-3.5">
                  <div className="space-y-1">
                    <label className="text-xs font-black text-slate-700">Nama Tugas Adab *</label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Membantu Ibu Merapikan Meja Makan"
                      value={customTaskTitle}
                      onChange={(e) => setCustomTaskTitle(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-black text-slate-700">Penjelasan Singkat</label>
                    <input
                      type="text"
                      placeholder="Contoh: Belajar mandiri dan meringankan tugas keluarga"
                      value={customTaskDesc}
                      onChange={(e) => setCustomTaskDesc(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-black text-slate-700">Ikon Emotikon</label>
                      <select
                        value={customTaskIcon}
                        onChange={(e) => setCustomTaskIcon(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold"
                      >
                        <option value="⭐">⭐ Bintang</option>
                        <option value="🤝">🤝 Santun</option>
                        <option value="🧹">🧹 Kebersihan</option>
                        <option value="🍽️">🍽️ Adab Makan</option>
                        <option value="📖">📖 Membaca</option>
                        <option value="🤲">🤲 Sedekah</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-black text-slate-700">Reward Bintang</label>
                      <input
                        type="number"
                        min={1}
                        max={50}
                        value={customTaskReward}
                        onChange={(e) => setCustomTaskReward(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setShowAddTaskModal(false)}
                      className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl bg-indigo-700 hover:bg-indigo-600 text-white text-xs font-black"
                    >
                      Simpan Adab Baru
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* ========================================================================= */}
        {/* MODAL SUB-FORM 2: BUAT TARGET BARU                                        */}
        {/* ========================================================================= */}
        <AnimatePresence>
          {showAddTargetModal && (
            <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 space-y-4"
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
                    <span>🎯 Buat Target Hafalan & Milestone Santri</span>
                  </h4>
                  <button
                    onClick={() => setShowAddTargetModal(false)}
                    className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
                  >
                    ✕
                  </button>
                </div>

                <form onSubmit={handleCreateTarget} className="space-y-3.5">
                  <div className="space-y-1">
                    <label className="text-xs font-black text-slate-700">Judul Target *</label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Hafal Surah Al-A'la dalam 1 Pekan"
                      value={targetTitle}
                      onChange={(e) => setTargetTitle(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-black text-slate-700">Jumlah Kuota</label>
                      <input
                        type="number"
                        min={1}
                        value={targetQty}
                        onChange={(e) => setTargetQty(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-black text-slate-700">Satuan</label>
                      <select
                        value={targetUnit}
                        onChange={(e) => setTargetUnit(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold"
                      >
                        <option value="Ayat">Ayat</option>
                        <option value="Surah">Surah</option>
                        <option value="Halaman">Halaman</option>
                        <option value="Juz">Juz</option>
                        <option value="Bintang">Bintang</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-black text-slate-700">Tanggal Tenggat (Deadline)</label>
                    <input
                      type="date"
                      value={targetDeadline}
                      onChange={(e) => setTargetDeadline(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-black text-slate-700">Hadiah / Apresiasi dari Orang Tua</label>
                    <input
                      type="text"
                      placeholder="Contoh: Es krim spesial & jalan-jalan ke taman"
                      value={targetReward}
                      onChange={(e) => setTargetReward(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setShowAddTargetModal(false)}
                      className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black"
                    >
                      Tetapkan Target
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* ========================================================================= */}
        {/* MODAL SUB-FORM 3: JADWALKAN UJIAN HAFALAN BARU                             */}
        {/* ========================================================================= */}
        <AnimatePresence>
          {showAddExamModal && (
            <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 space-y-4"
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
                    <span>🏆 Agendakan Ujian Hafalan / Tasmi'</span>
                  </h4>
                  <button
                    onClick={() => setShowAddExamModal(false)}
                    className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
                  >
                    ✕
                  </button>
                </div>

                <form onSubmit={handleCreateExam} className="space-y-3.5">
                  <div className="space-y-1">
                    <label className="text-xs font-black text-slate-700">Nama / Judul Ujian *</label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Ujian Kelulusan Surah An-Naba & An-Nazi'at"
                      value={examTitle}
                      onChange={(e) => setExamTitle(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-black text-slate-700">Tanggal Ujian</label>
                      <input
                        type="date"
                        value={examDate}
                        onChange={(e) => setExamDate(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-black text-slate-700">Jam (WIB)</label>
                      <input
                        type="time"
                        value={examTime}
                        onChange={(e) => setExamTime(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-black text-slate-700">Cakupan Materi Surah</label>
                    <input
                      type="text"
                      placeholder="Contoh: Surah 78 s/d 80 (Juz 30)"
                      value={examSurahRange}
                      onChange={(e) => setExamSurahRange(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-black text-slate-700">Nama Penguji (Evaluator)</label>
                    <input
                      type="text"
                      placeholder="Contoh: Ustadz Ahmad / Abi Sarah"
                      value={examEvaluator}
                      onChange={(e) => setExamEvaluator(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setShowAddExamModal(false)}
                      className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl bg-rose-700 hover:bg-rose-600 text-white text-xs font-black"
                    >
                      Simpan Jadwal Ujian
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* ========================================================================= */}
        {/* MODAL SUB-FORM 4: MASUKKAN NILAI & EVALUASI UJIAN                         */}
        {/* ========================================================================= */}
        <AnimatePresence>
          {gradingExam && (
            <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 space-y-4"
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h4 className="text-sm font-black text-slate-900">
                      📝 Penilaian Hasil Ujian Hafalan
                    </h4>
                    <p className="text-xs text-slate-500">{gradingExam.title}</p>
                  </div>
                  <button
                    onClick={() => setGradingExam(null)}
                    className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-3.5">
                  <div className="space-y-1">
                    <label className="text-xs font-black text-slate-700">Skor Nilai (0 - 100) *</label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={gradeScore}
                      onChange={(e) => setGradeScore(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-black text-[#164C68]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-black text-slate-700">Predikat Kelulusan</label>
                    <select
                      value={gradeLabel}
                      onChange={(e) => setGradeLabel(e.target.value as any)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800"
                    >
                      <option value="Mumtaz (Istimewa)">🌟 Mumtaz (Istimewa - 95-100)</option>
                      <option value="Jayyid Jiddan (Sangat Baik)">⭐ Jayyid Jiddan (Sangat Baik - 85-94)</option>
                      <option value="Jayyid (Baik)">✅ Jayyid (Baik - 75-84)</option>
                      <option value="Maqbul (Cukup)">📖 Maqbul (Cukup - 65-74)</option>
                      <option value="Perlu Murojaah">🔄 Perlu Murojaah Ulang (&lt; 65)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-black text-slate-700">Catatan Tajwid & Makhraj</label>
                    <textarea
                      rows={3}
                      value={gradeTajwidNote}
                      onChange={(e) => setGradeTajwidNote(e.target.value)}
                      placeholder="Tuliskan catatan kelancaran bacaan santri..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium resize-none"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setGradingExam(null)}
                      className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100"
                    >
                      Batal
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveExamGrading}
                      className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-black shadow-xs cursor-pointer"
                    >
                      Simpan Nilai Ujian 🏆
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* ========================================================================= */}
        {/* MODAL SUB-FORM 5: SMART GOAL WIZARD (RANCANG TARGET PEKANAN OTOMATIS)    */}
        {/* ========================================================================= */}
        <AnimatePresence>
          {showSmartGoalWizard && (
            <div className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-xs overflow-y-auto">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                className="w-full max-w-2xl bg-white rounded-3xl p-5 sm:p-6 shadow-2xl border border-amber-200 space-y-4 my-8 max-h-[90vh] overflow-y-auto"
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-black text-lg">
                      🎯
                    </div>
                    <div>
                      <h4 className="text-sm sm:text-base font-black text-slate-900">
                        Smart Goal Planner: Target Sepekan Santri
                      </h4>
                      <p className="text-xs text-slate-500">
                        Sistem otomatis membagi surah target ke porsi harian yang terukur dan seimbang
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowSmartGoalWizard(false)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
                  >
                    ✕
                  </button>
                </div>

                <form onSubmit={handleSaveSmartGoal} className="space-y-4">
                  {/* Step 1: Pilih Surah */}
                  <div className="space-y-1">
                    <label className="text-xs font-black text-slate-800 flex items-center justify-between">
                      <span>1. Pilih Surah Target (Juz 30) *</span>
                      <span className="text-[11px] text-amber-700 font-bold">
                        {currentSurahMeta.revelationType} • {currentSurahMeta.ayahCount} Ayat
                      </span>
                    </label>
                    <select
                      value={wizardSurahNum}
                      onChange={(e) => handleSelectWizardSurah(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-400"
                    >
                      {SURAHS_METADATA.filter((s) => s.number >= 78).map((surah) => (
                        <option key={surah.number} value={surah.number}>
                          {surah.number}. Surah {surah.nameLatin} ({surah.nameArabic}) — {surah.ayahCount} Ayat
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Step 2: Rentang Ayat */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-black text-slate-800">Ayat Awal</label>
                      <input
                        type="number"
                        min={1}
                        max={wizardEndAyah}
                        value={wizardStartAyah}
                        onChange={(e) => setWizardStartAyah(Math.max(1, Number(e.target.value)))}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-900"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-black text-slate-800">Ayat Akhir</label>
                      <input
                        type="number"
                        min={wizardStartAyah}
                        max={currentSurahMeta.ayahCount}
                        value={wizardEndAyah}
                        onChange={(e) =>
                          setWizardEndAyah(
                            Math.min(currentSurahMeta.ayahCount, Math.max(wizardStartAyah, Number(e.target.value)))
                          )
                        }
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-900"
                      />
                    </div>
                  </div>

                  {/* Step 3: Hari Belajar & Istirahat */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-black text-slate-800">Hari Aktif Belajar Per Pekan</label>
                      <select
                        value={wizardActiveDays}
                        onChange={(e) => setWizardActiveDays(Number(e.target.value))}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-900"
                      >
                        <option value={5}>5 Hari Belajar (Santai)</option>
                        <option value={6}>6 Hari Belajar (Rekomendasi ⭐)</option>
                        <option value={7}>7 Hari Penuh (Intensif)</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-black text-slate-800">Hari Jeda / Istirahat</label>
                      <select
                        value={wizardRestDay}
                        onChange={(e) => setWizardRestDay(e.target.value as any)}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-900"
                      >
                        <option value="jumat">Hari Jum'at (Sayyidul Ayyam)</option>
                        <option value="ahad">Hari Ahad (Akhir Pekan)</option>
                        <option value="sabtu">Hari Sabtu</option>
                        <option value="none">Tanpa Hari Libur</option>
                      </select>
                    </div>
                  </div>

                  {/* Step 4: Intensitas & Tanggal Mulai */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-black text-slate-800">Tingkat Intensitas</label>
                      <select
                        value={wizardIntensity}
                        onChange={(e) => setWizardIntensity(e.target.value as any)}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-900"
                      >
                        <option value="santai">Santai (~2-3 ayat/hari • TK/Pemula)</option>
                        <option value="moderat">Moderat (~4-6 ayat/hari • Standar)</option>
                        <option value="intensif">Intensif (~7-10 ayat/hari • Mahir)</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-black text-slate-800">Tanggal Mulai Target</label>
                      <input
                        type="date"
                        value={wizardStartDate}
                        onChange={(e) => setWizardStartDate(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-900"
                      />
                    </div>
                  </div>

                  {/* Step 5: Janji Hadiah Apresiasi */}
                  <div className="space-y-1">
                    <label className="text-xs font-black text-slate-800 flex items-center justify-between">
                      <span>Hadiah / Apresiasi dari Orang Tua *</span>
                      <span className="text-[11px] text-amber-700 font-bold">Pemicu Semangat Santri</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Es krim spesial & buku kisah 25 Nabi 🍦"
                      value={wizardReward}
                      onChange={(e) => setWizardReward(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-900"
                    />
                  </div>

                  {/* LIVE PREVIEW OF GENERATED PORTIONS */}
                  <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-amber-950 flex items-center gap-1.5">
                        <Sparkles size={14} className="text-amber-600" />
                        <span>Pratinjau Pembagian Porsi Harian Otomatis:</span>
                      </span>
                      <span className="text-[10px] font-black text-amber-800 bg-amber-200/80 px-2 py-0.5 rounded-full">
                        7 Hari Terjadwal
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-[170px] overflow-y-auto pr-1">
                      {wizardPreviewPortions.map((p) => (
                        <div
                          key={p.dayIndex}
                          className="p-2 rounded-xl bg-white border border-amber-200/60 text-[11px] flex items-center justify-between gap-2"
                        >
                          <div className="min-w-0">
                            <span className="font-bold text-slate-900 block truncate">
                              H-{p.dayIndex} ({p.dayName}): {p.title}
                            </span>
                            <span className="text-[10px] text-slate-500 block truncate">
                              {p.notes} • ~{p.estimatedMinutes} mnt
                            </span>
                          </div>
                          <span className="text-[10px] font-black text-amber-600 shrink-0">
                            +{p.starsReward} ⭐
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setShowSmartGoalWizard(false)}
                      className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 cursor-pointer"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs shadow-md cursor-pointer active:scale-95 transition-all"
                    >
                      Bismillah, Aktifkan Target Ini! 🚀
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
