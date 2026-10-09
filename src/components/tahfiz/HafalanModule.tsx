import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Mic,
  Square,
  Play,
  Pause,
  Eye,
  EyeOff,
  RotateCcw,
  CheckCircle,
  HelpCircle,
  Volume2,
  Sparkles,
  ArrowRight,
  X,
  Award,
  MessageSquare,
  Clock,
  Check,
  Search,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Bot,
  AlertCircle,
  Layers,
  BookOpen,
  Download,
  Trash2,
  Activity,
} from 'lucide-react';
import { SURAHS_METADATA } from '../../data/surahsMetadata';
import { getSurahAyahs } from '../../data/quranData';
import { getAyahAudioUrl } from '../../data/recitersData';
import { AudioRecordingService, RecordingState } from '../../services/recordingService';
import { analyzeAyahRecitation, ScoreAnalysisResult } from '../../services/scoringEngine';
import { StorageService } from '../../services/storageService';
import { AudioDatabaseService } from '../../services/audioDatabaseService';
import { AyahData, SurahMetadata, AyahRecording, AiCorrectionResult } from '../../types';
import { ArabicText } from '../common/ArabicText';
import { Button } from '../common/Button';
import { SetoranResultModal, RecordedAyahItem } from './SetoranResultModal';
import { RiwayatEvaluasiModal } from './RiwayatEvaluasiModal';
import { D3AudioAccuracyEvaluation } from './D3AudioAccuracyEvaluation';
import { GlobalAudioManager } from '../../services/audioService';
import { CompanionService } from '../../services/companionService';
import { SubtleCompanionReaction } from '../companion/SubtleCompanionReaction';

interface HafalanModuleProps {
  childId: string;
  initialSurahNumber?: number;
  onFinishHafalan: () => void;
  onBack: () => void;
}

export type AyahDisplayMode = 'awalan' | 'sebagian' | 'tertutup' | 'lengkap';

// List of popular short Surahs commonly practiced by children
const POPULAR_SHORT_SURAHS = [
  1, 114, 113, 112, 111, 110, 109, 108, 107, 106, 105, 104, 103, 102, 101, 100, 99, 98, 97, 96, 95, 94, 93,
];

export const HafalanModule: React.FC<HafalanModuleProps> = ({
  childId,
  initialSurahNumber = 1,
  onFinishHafalan,
  onBack,
}) => {
  // Surah selection state - initialized with provided surah or defaults safely
  const [selectedSurahNumber, setSelectedSurahNumber] = useState<number>(() => {
    // If initial is provided and valid, use it; otherwise check last session or default to 1 (Al-Fatihah)
    if (initialSurahNumber && initialSurahNumber >= 1 && initialSurahNumber <= 114) {
      return initialSurahNumber;
    }
    const last = StorageService.getLastSession(childId);
    return last?.surahNumber || 1;
  });

  // Surah Picker modal state
  const [isSurahPickerOpen, setIsSurahPickerOpen] = useState<boolean>(false);
  const [surahSearchQuery, setSurahSearchQuery] = useState<string>('');
  const [surahPickerTab, setSurahPickerTab] = useState<'juz30' | 'favorit' | 'all'>('juz30');

  // Ayah navigation and data
  const [ayahs, setAyahs] = useState<AyahData[]>([]);
  const [currentAyahIndex, setCurrentAyahIndex] = useState<number>(0);

  // Default display mode for verses: 'awalan' by default as requested!
  const [ayahDisplayMode, setAyahDisplayMode] = useState<AyahDisplayMode>('awalan');
  const [temporaryPeek, setTemporaryPeek] = useState<boolean>(false);

  // Recorded audio results mapping: ayahNumber -> RecordedAyahItem
  const [recordedAyahs, setRecordedAyahs] = useState<Map<number, RecordedAyahItem>>(new Map());

  // Assistance tracked per ayah
  const [assistanceUsedMap, setAssistanceUsedMap] = useState<Map<number, string[]>>(new Map());

  // Voice recording state
  const [recordingState, setRecordingState] = useState<RecordingState>('IDLE');
  const [recordingDuration, setRecordingDuration] = useState<number>(0);
  const [audioVolume, setAudioVolume] = useState<number>(0);
  const [previewBlobUrl, setPreviewBlobUrl] = useState<string | null>(null);
  const [micErrorMessage, setMicErrorMessage] = useState<string | null>(null);

  // AI Automatic Correction states
  const [isAiAnalyzing, setIsAiAnalyzing] = useState<boolean>(false);
  const [latestAiCorrection, setLatestAiCorrection] = useState<AiCorrectionResult | null>(null);

  // Rekam Suara Database & Evaluation states
  const [studentNote, setStudentNote] = useState<string>('');
  const [isSavedToDb, setIsSavedToDb] = useState<boolean>(false);
  const [saveToast, setSaveToast] = useState<string | null>(null);
  const [showHistoryModal, setShowHistoryModal] = useState<boolean>(false);
  const [showD3Visualizer, setShowD3Visualizer] = useState<boolean>(false);
  const [deleteConfirmRec, setDeleteConfirmRec] = useState<AyahRecording | null>(null);
  const [isPlayingSavedAudio, setIsPlayingSavedAudio] = useState<boolean>(false);
  const savedAudioRef = useRef<HTMLAudioElement | null>(null);

  // Result modal state
  const [showResultModal, setShowResultModal] = useState<boolean>(false);
  const [companionPulseTrigger, setCompanionPulseTrigger] = useState<number>(0);
  const companion = CompanionService.getCompanionData(childId);

  const recorderRef = useRef<AudioRecordingService | null>(null);
  const timerRef = useRef<any>(null);
  const audioAssistRef = useRef<HTMLAudioElement | null>(null);

  const surahMeta = SURAHS_METADATA.find((s) => s.number === selectedSurahNumber) || SURAHS_METADATA[0];
  const currentAyah = ayahs[currentAyahIndex];

  const [refreshVersion, setRefreshVersion] = useState(0);

  // Existing saved recording from database for active ayah (reactive with refreshVersion)
  const existingSavedRecording = useMemo(() => {
    return currentAyah
      ? StorageService.getRecordingByAyah(childId, selectedSurahNumber, currentAyah.ayahNumber)
      : undefined;
  }, [childId, selectedSurahNumber, currentAyah?.ayahNumber, refreshVersion]);

  const totalSavedCount = useMemo(() => {
    return StorageService.getRecordings(childId).filter(
      (r) => r.surahNumber === selectedSurahNumber
    ).length;
  }, [childId, selectedSurahNumber, refreshVersion]);

  // Sync existing recording & AI correction when changing ayah or surah
  useEffect(() => {
    if (savedAudioRef.current) {
      savedAudioRef.current.pause();
    }
    setIsPlayingSavedAudio(false);
    setIsSavedToDb(false);
    setSaveToast(null);
    setTemporaryPeek(false);
    setMicErrorMessage(null);

    const existing = currentAyah
      ? StorageService.getRecordingByAyah(childId, selectedSurahNumber, currentAyah.ayahNumber)
      : undefined;

    setStudentNote(existing?.studentNote || '');
    setLatestAiCorrection(existing?.aiCorrection || null);
  }, [currentAyahIndex, selectedSurahNumber]);

  // Initialize Recorder & Audio Stop Listeners
  useEffect(() => {
    const recorder = new AudioRecordingService();
    recorderRef.current = recorder;

    recorder.onStateChange = (state) => {
      setRecordingState(state);
      if (state === 'ERROR' && recorder.errorMessage) {
        setMicErrorMessage(recorder.errorMessage);
      }
    };
    recorder.onVolumeChange = (vol) => setAudioVolume(vol);

    const unsubStop = GlobalAudioManager.addStopListener((source) => {
      if (source && audioAssistRef.current && source === audioAssistRef.current) {
        return;
      }
      if (audioAssistRef.current) {
        audioAssistRef.current.onended = null;
        audioAssistRef.current.onerror = null;
        GlobalAudioManager.unregisterRawAudio(audioAssistRef.current);
        try {
          audioAssistRef.current.pause();
          audioAssistRef.current.currentTime = 0;
        } catch (e) {}
        audioAssistRef.current = null;
      }
    });

    return () => {
      unsubStop();
      recorder.cleanup();
      if (timerRef.current) clearInterval(timerRef.current);
      if (audioAssistRef.current) {
        audioAssistRef.current.onended = null;
        audioAssistRef.current.onerror = null;
        GlobalAudioManager.unregisterRawAudio(audioAssistRef.current);
        try {
          audioAssistRef.current.pause();
          audioAssistRef.current.src = '';
        } catch (e) {}
        audioAssistRef.current = null;
      }
      if (savedAudioRef.current) {
        savedAudioRef.current.pause();
      }
    };
  }, []);

  // Load Surah Ayahs & Sync existing recordings
  useEffect(() => {
    let isMounted = true;
    getSurahAyahs(selectedSurahNumber).then((data) => {
      if (!isMounted) return;
      setAyahs(data);
      setCurrentAyahIndex(0);
      setAssistanceUsedMap(new Map());
      setPreviewBlobUrl(null);
      setLatestAiCorrection(null);

      // Populate recordedAyahs map from existing StorageService records
      const existingRecords = StorageService.getRecordings(childId).filter(
        (r) => r.surahNumber === selectedSurahNumber
      );
      const recMap = new Map<number, RecordedAyahItem>();
      for (const r of existingRecords) {
        recMap.set(r.ayahNumber, {
          ayahNumber: r.ayahNumber,
          audioBlobUrl: r.audioBlobUrl,
          durationSeconds: r.durationSeconds,
          scoreResult: {
            overallScore: r.score,
            timingScore: r.timingScore,
            wordCoverageScore: r.wordCoverageScore,
            fluencyScore: r.fluencyScore,
            referenceDurationSeconds: r.referenceDurationSeconds,
            missingWords: r.missingWords || [],
            extraWords: r.extraWords || [],
            needsReview: r.needsReview,
            feedback: '',
          },
        });
      }
      setRecordedAyahs(recMap);
    });

    // Update last session so user's choice is saved
    StorageService.setLastSession(childId, {
      surahNumber: selectedSurahNumber,
      surahName: surahMeta.nameLatin,
      blockNumber: 1,
      startAyah: 1,
      endAyah: Math.min(7, surahMeta.ayahCount),
      mode: 'hafalan',
    });

    return () => {
      isMounted = false;
    };
  }, [selectedSurahNumber, childId, surahMeta.nameLatin, surahMeta.ayahCount]);

  // Keep recordedAyahs map in sync with StorageService whenever refreshVersion triggers
  useEffect(() => {
    const existingRecords = StorageService.getRecordings(childId).filter(
      (r) => r.surahNumber === selectedSurahNumber
    );
    const recMap = new Map<number, RecordedAyahItem>();
    for (const r of existingRecords) {
      recMap.set(r.ayahNumber, {
        ayahNumber: r.ayahNumber,
        audioBlobUrl: r.audioBlobUrl,
        durationSeconds: r.durationSeconds,
        scoreResult: {
          overallScore: r.score,
          timingScore: r.timingScore,
          wordCoverageScore: r.wordCoverageScore,
          fluencyScore: r.fluencyScore,
          referenceDurationSeconds: r.referenceDurationSeconds,
          missingWords: r.missingWords || [],
          extraWords: r.extraWords || [],
          needsReview: r.needsReview,
          feedback: '',
        },
      });
    }
    setRecordedAyahs(recMap);
  }, [refreshVersion, selectedSurahNumber, childId]);

  // Record assistance used
  const addAssistance = (type: string) => {
    if (!currentAyah) return;
    setAssistanceUsedMap((prev) => {
      const next = new Map(prev);
      const list = next.get(currentAyah.ayahNumber) || [];
      if (!list.includes(type)) {
        list.push(type);
      }
      next.set(currentAyah.ayahNumber, list);
      return next;
    });
  };

  // --- Automatic AI Recitation Correction API Call ---
  const evaluateRecitationWithAi = async (
    blob: Blob,
    durationSecs: number,
    ayahItem: AyahData,
    recId: string,
    audioLevel?: { peak?: number; avg?: number },
    spokenTranscript?: string
  ): Promise<AiCorrectionResult | null> => {
    setIsAiAnalyzing(true);
    try {
      let audioBase64: string | undefined = undefined;
      try {
        audioBase64 = await AudioDatabaseService.blobToDataUrl(blob);
      } catch (e) {}

      const payload = {
        surahNumber: selectedSurahNumber,
        surahName: surahMeta.nameLatin,
        ayahNumber: ayahItem.ayahNumber,
        targetArabicText: ayahItem.arabicText,
        targetTranslation: ayahItem.translationId,
        audioBase64,
        mimeType: blob.type || 'audio/webm',
        durationSeconds: durationSecs,
        assistanceUsed: assistanceUsedMap.get(ayahItem.ayahNumber) || [],
        audioLevel: audioLevel || { peak: 50, avg: 35 },
        spokenTranscript: spokenTranscript || '',
      };

      const response = await fetch('/api/ai-correction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      const aiResult: AiCorrectionResult = await response.json();
      setLatestAiCorrection(aiResult);

      // Update the stored recording in StorageService with the AI result
      const storedRec = StorageService.getRecordingByAyah(childId, selectedSurahNumber, ayahItem.ayahNumber);
      if (storedRec) {
        storedRec.aiCorrection = aiResult;
        if (aiResult.overallScore) {
          storedRec.score = aiResult.overallScore;
        }
        StorageService.saveRecording(storedRec);
        setRefreshVersion((prev) => prev + 1);
      }

      return aiResult;
    } catch (err) {
      console.warn('AI evaluation error, fallback local evaluation remains active:', err);
      return null;
    } finally {
      setIsAiAnalyzing(false);
    }
  };

  // --- Voice Recording Handlers ---
  const handleStartRecording = async (forceSim: boolean = false) => {
    if (!recorderRef.current) return;
    setMicErrorMessage(null);

    if (savedAudioRef.current) {
      savedAudioRef.current.pause();
      setIsPlayingSavedAudio(false);
    }
    setPreviewBlobUrl(null);
    setRecordingDuration(0);
    setIsSavedToDb(false);
    setSaveToast(null);

    try {
      const started = await recorderRef.current.startRecording(forceSim);
      if (started) {
        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = setInterval(() => {
          setRecordingDuration((prev) => prev + 1);
        }, 1000);
      } else {
        if (recorderRef.current.errorMessage) {
          setMicErrorMessage(recorderRef.current.errorMessage);
        }
      }
    } catch (err: any) {
      console.error('Failed to start recording:', err);
      setMicErrorMessage(err?.message || 'Gagal memulai perekaman audio.');
    }
  };

  const handleStopRecording = async () => {
    if (!recorderRef.current) return;
    if (timerRef.current) clearInterval(timerRef.current);

    try {
      const res = await recorderRef.current.stopRecording();
      setPreviewBlobUrl(res.blobUrl);

      // 1. Local child scoring heuristic
      const assistance = assistanceUsedMap.get(currentAyah.ayahNumber) || [];
      const score = analyzeAyahRecitation(res.durationSeconds, currentAyah, assistance);

      const recId = `rec-${Date.now()}-${currentAyah.ayahNumber}`;

      // 2. Save audio to permanent database (IndexedDB + DataURL fallback)
      const { objectUrl, dataUrl } = await AudioDatabaseService.saveAudioBlob(recId, res.blob);

      const recordedItem: RecordedAyahItem = {
        ayahNumber: currentAyah.ayahNumber,
        audioBlobUrl: objectUrl || res.blobUrl,
        durationSeconds: res.durationSeconds,
        scoreResult: score,
      };

      // Save to map
      setRecordedAyahs((prev) => {
        const next = new Map(prev);
        next.set(currentAyah.ayahNumber, recordedItem);
        return next;
      });

      // Save initial record to StorageService
      StorageService.saveRecording({
        id: recId,
        childId,
        surahNumber: selectedSurahNumber,
        surahName: surahMeta.nameLatin,
        ayahNumber: currentAyah.ayahNumber,
        audioBlobUrl: objectUrl || res.blobUrl,
        audioDataUrl: dataUrl,
        durationSeconds: res.durationSeconds,
        referenceDurationSeconds: score.referenceDurationSeconds,
        score: score.overallScore,
        timingScore: score.timingScore,
        wordCoverageScore: score.wordCoverageScore,
        fluencyScore: score.fluencyScore,
        missingWords: score.missingWords,
        extraWords: score.extraWords,
        assistanceUsed: assistance as any,
        createdAt: new Date().toISOString(),
        needsReview: score.needsReview,
        studentNote: studentNote.trim() || undefined,
        evaluation: {
          status: 'pending',
          evaluatorRole: 'parent',
          evaluatorName: 'Orang Tua / Guru',
          notes: '',
          evaluatedAt: '',
        },
      });

      StorageService.saveAyahScore(
        childId,
        selectedSurahNumber,
        currentAyah.ayahNumber,
        score.overallScore,
        !score.needsReview
      );

      setIsSavedToDb(true);
      setSaveToast(`Alhamdulillah! Rekaman Suara Ayat ${currentAyah.ayahNumber} berhasil disimpan ke Database!`);
      setRefreshVersion((prev) => prev + 1);

      // 3. Trigger Automatic AI Correction in real-time with real audio level & transcript
      evaluateRecitationWithAi(
        res.blob,
        res.durationSeconds,
        currentAyah,
        recId,
        {
          peak: res.peakVolume,
          avg: res.avgVolume,
        },
        res.spokenTranscript
      );

      // Record activity in Companion service
      CompanionService.recordActivity(childId, 'hafalan', 35, 5);
      CompanionService.onSurahCompleted(childId, surahMeta.nameLatin);
      setCompanionPulseTrigger((prev) => prev + 1);
    } catch (err) {
      console.error('Error stopping recording:', err);
    }
  };

  const handleDeleteExistingRecording = (rec: AyahRecording) => {
    setDeleteConfirmRec(rec);
  };

  const executeDeleteRecording = () => {
    if (!deleteConfirmRec) return;
    if (savedAudioRef.current) {
      savedAudioRef.current.pause();
      savedAudioRef.current = null;
    }
    setIsPlayingSavedAudio(false);

    // 1. Delete from StorageService & IndexedDB
    StorageService.deleteRecording(childId, deleteConfirmRec.id);
    StorageService.deleteRecordingByAyah(childId, selectedSurahNumber, deleteConfirmRec.ayahNumber);
    AudioDatabaseService.deleteAudio(deleteConfirmRec.id).catch(() => {});

    // 2. Remove immediately from local state
    setRecordedAyahs((prev) => {
      const next = new Map(prev);
      next.delete(deleteConfirmRec.ayahNumber);
      return next;
    });
    setPreviewBlobUrl(null);
    setLatestAiCorrection(null);
    setShowD3Visualizer(false);
    setIsSavedToDb(false);

    // 3. Bump refresh version
    setRefreshVersion((prev) => prev + 1);
    setSaveToast(`Rekaman Ayat ${deleteConfirmRec.ayahNumber} berhasil dihapus.`);
    setDeleteConfirmRec(null);
    setTimeout(() => setSaveToast(null), 3000);
  };

  const handleCancelRecording = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    recorderRef.current?.cancelRecording();
    setPreviewBlobUrl(null);
    setRecordingDuration(0);
    setIsSavedToDb(false);
  };

  const handlePlaySavedAudio = async (recording: AyahRecording) => {
    if (savedAudioRef.current) {
      savedAudioRef.current.pause();
    }
    if (isPlayingSavedAudio) {
      setIsPlayingSavedAudio(false);
      return;
    }

    const audioUrl = await AudioDatabaseService.getAudioUrl(
      recording.id,
      recording.audioDataUrl || recording.audioBlobUrl
    );
    if (!audioUrl) return;

    const audio = new Audio(audioUrl);
    savedAudioRef.current = audio;
    setIsPlayingSavedAudio(true);
    audio.play().catch(() => {});
    audio.onended = () => setIsPlayingSavedAudio(false);
    audio.onerror = () => setIsPlayingSavedAudio(false);
  };

  const handleUpdateStudentNote = (newNote: string) => {
    setStudentNote(newNote);
    if (!currentAyah) return;
    const existing = StorageService.getRecordingByAyah(childId, selectedSurahNumber, currentAyah.ayahNumber);
    if (existing) {
      existing.studentNote = newNote.trim();
      StorageService.saveRecording(existing);
      setSaveToast('Catatan santri berhasil disimpan ke database!');
      setTimeout(() => setSaveToast(null), 3000);
    }
  };

  // Assistance handlers
  const handlePlayAyah = () => {
    addAssistance('play_ayah');
    if (audioAssistRef.current) {
      GlobalAudioManager.unregisterRawAudio(audioAssistRef.current);
      audioAssistRef.current.pause();
    }
    const audioUrl = getAyahAudioUrl('alafasy', selectedSurahNumber, currentAyah.ayahNumber);
    const audio = new Audio(audioUrl);
    audioAssistRef.current = audio;
    GlobalAudioManager.registerRawAudio(audio);
    GlobalAudioManager.notifyPlayStarted(audio);
    audio.play().catch(() => {});
    audio.onended = () => {
      GlobalAudioManager.unregisterRawAudio(audio);
    };
  };

  const handlePlayAwalan = () => {
    addAssistance('play_awalan');
    if (audioAssistRef.current) {
      GlobalAudioManager.unregisterRawAudio(audioAssistRef.current);
      audioAssistRef.current.pause();
    }
    const audioUrl = getAyahAudioUrl('alafasy', selectedSurahNumber, currentAyah.ayahNumber);
    const audio = new Audio(audioUrl);
    audioAssistRef.current = audio;
    GlobalAudioManager.registerRawAudio(audio);
    GlobalAudioManager.notifyPlayStarted(audio);
    audio.play().catch(() => {});
    setTimeout(() => {
      audio.pause();
      GlobalAudioManager.unregisterRawAudio(audio);
    }, 1800);
  };

  const handleNextAyah = () => {
    setPreviewBlobUrl(null);
    setTemporaryPeek(false);

    if (currentAyahIndex < ayahs.length - 1) {
      setCurrentAyahIndex((prev) => prev + 1);
    } else {
      handleCompleteSetoran();
    }
  };

  const handlePrevAyah = () => {
    if (currentAyahIndex > 0) {
      setPreviewBlobUrl(null);
      setTemporaryPeek(false);
      setCurrentAyahIndex((prev) => prev - 1);
    }
  };

  const handleCompleteSetoran = () => {
    StorageService.recordPoints(
      childId,
      'HAFALAN_TEST',
      30,
      10,
      `Setoran Hafalan Surah ${surahMeta.nameLatin}`,
      'surah',
      String(selectedSurahNumber)
    );
    setShowResultModal(true);
  };

  // Filtered surahs for the Surah Picker modal
  const filteredSurahs = useMemo(() => {
    let list = SURAHS_METADATA;

    if (surahPickerTab === 'juz30') {
      list = list.filter((s) => s.juzNumber === 30);
    } else if (surahPickerTab === 'favorit') {
      list = list.filter((s) => POPULAR_SHORT_SURAHS.includes(s.number));
    }

    if (!surahSearchQuery.trim()) return list;

    const query = surahSearchQuery.toLowerCase().trim();
    return list.filter(
      (s) =>
        s.nameLatin.toLowerCase().includes(query) ||
        s.nameArabic.includes(query) ||
        s.translation.toLowerCase().includes(query) ||
        String(s.number).includes(query)
    );
  }, [surahPickerTab, surahSearchQuery]);

  const recordedCount = recordedAyahs.size;
  const totalCount = ayahs.length;

  return (
    <div className="space-y-4 pb-28 animate-in fade-in duration-200">
      {/* Top Header Card with Quick Surah Switcher */}
      <div className="bg-white border border-[#C9E1ED] rounded-3xl p-4 shadow-xs flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="w-10 h-10 rounded-2xl bg-[#EEF8FF] hover:bg-[#d8eefc] text-[#164C68] flex items-center justify-center transition-colors cursor-pointer shrink-0"
            title="Kembali ke Beranda Tahfiz"
          >
            <ChevronLeft size={20} />
          </button>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl font-black text-[#164C68] font-heading">
                {surahMeta.nameLatin}
              </h2>
              <span className="font-quran text-lg text-[#08B9EF]">
                {surahMeta.nameArabic}
              </span>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-cyan-50 text-[#08B9EF] border border-cyan-200">
                Surat ke-{surahMeta.number}
              </span>
            </div>
            <p className="text-xs text-[#8C9BA7] font-semibold mt-0.5">
              Hafalan Mandiri • {surahMeta.translation} ({totalCount} ayat)
            </p>
          </div>
        </div>

        {/* Action Buttons: Choose Surah & View Evaluations */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setIsSurahPickerOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-[#08B9EF] hover:bg-[#07a6d7] active:scale-95 text-white rounded-2xl text-xs font-bold transition-all cursor-pointer shadow-xs"
            title="Pilih dan ganti surat Al-Qur'an"
          >
            <BookOpen size={15} />
            <span>Pilih Surat</span>
            <ChevronDown size={14} className="opacity-80" />
          </button>

          <button
            onClick={() => setShowHistoryModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-[#EEF8FF] hover:bg-[#d8eefc] border border-[#C9E1ED] text-[#164C68] rounded-2xl text-xs font-bold transition-all cursor-pointer shadow-2xs"
            title="Lihat riwayat rekaman dan evaluasi ustadz/orang tua"
          >
            <Award size={15} className="text-amber-500" />
            <span className="hidden sm:inline">Evaluasi Guru</span>
            <span className="sm:hidden">({totalSavedCount})</span>
            <span className="hidden sm:inline font-black text-amber-600">({totalSavedCount})</span>
          </button>
        </div>
      </div>

      {/* Surah Stepper bar (Quick Jump to Prev/Next Surah) */}
      <div className="flex items-center justify-between px-2 text-xs font-bold text-[#8C9BA7]">
        <button
          disabled={selectedSurahNumber <= 1}
          onClick={() => {
            if (selectedSurahNumber > 1) setSelectedSurahNumber((prev) => prev - 1);
          }}
          className="flex items-center gap-1 hover:text-[#08B9EF] disabled:opacity-30 disabled:hover:text-[#8C9BA7] cursor-pointer"
        >
          <ChevronLeft size={16} />
          <span>Surat Sebelumnya</span>
        </button>

        <span className="text-[#164C68]">
          Juz {surahMeta.juzNumber} • {surahMeta.revelationType}
        </span>

        <button
          disabled={selectedSurahNumber >= 114}
          onClick={() => {
            if (selectedSurahNumber < 114) setSelectedSurahNumber((prev) => prev + 1);
          }}
          className="flex items-center gap-1 hover:text-[#08B9EF] disabled:opacity-30 disabled:hover:text-[#8C9BA7] cursor-pointer"
        >
          <span>Surat Berikutnya</span>
          <ChevronRight size={16} />
        </button>
      </div>

      {/* NOMOR AYAT Grid Selector */}
      <div className="bg-white border border-[#C9E1ED] rounded-3xl p-4 shadow-xs space-y-2.5">
        <div className="flex items-center justify-between text-xs font-bold">
          <span className="text-[#8C9BA7] uppercase tracking-wider">NOMOR AYAT</span>
          <span className="text-[#08B9EF]">
            {recordedCount}/{totalCount} ayat direkam
          </span>
        </div>

        <div className="flex items-center gap-3 text-[11px] text-[#8C9BA7] font-semibold pb-1">
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-slate-200 inline-block" /> Belum
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-amber-400 inline-block" /> Sekarang
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" /> Sudah direkam
          </span>
        </div>

        {/* Ayah Number Buttons Grid */}
        <div className="grid grid-cols-5 sm:grid-cols-7 md:grid-cols-10 gap-2 pt-1 max-h-48 overflow-y-auto pr-1">
          {ayahs.map((a, idx) => {
            const isRecorded = recordedAyahs.has(a.ayahNumber);
            const isCurrent = idx === currentAyahIndex;

            return (
              <button
                key={a.ayahNumber}
                onClick={() => {
                  if (recordingState === 'RECORDING') return;
                  setCurrentAyahIndex(idx);
                  setPreviewBlobUrl(null);
                  setShowD3Visualizer(false);
                }}
                className={`h-11 rounded-2xl font-black text-sm transition-all duration-150 flex items-center justify-center cursor-pointer ${
                  isCurrent
                    ? 'border-2 border-amber-400 bg-amber-50 text-amber-900 shadow-sm scale-105'
                    : isRecorded
                    ? 'bg-emerald-500 text-white shadow-xs'
                    : 'bg-[#EEF8FF] text-[#164C68] hover:bg-[#d8eefc]'
                }`}
              >
                {a.ayahNumber}
              </button>
            );
          })}
        </div>
      </div>

      {/* CORE FEATURE: CARD TAMPILAN AYAT HAFALAN (Default Awalan / Sebagian) */}
      {currentAyah && (
        <div className="bg-white border-2 border-[#C9E1ED] rounded-3xl p-5 shadow-sm space-y-3.5">
          {/* Header & Display Mode Switcher */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-amber-100 text-amber-900 border border-amber-300 rounded-full font-black text-xs">
                Ayat {currentAyah.ayahNumber}
              </span>
              <span className="text-xs text-[#8C9BA7] font-semibold">
                Tampilan hafalan santri:
              </span>
            </div>

            {/* Mode Selector Chips */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                onClick={() => {
                  setAyahDisplayMode('awalan');
                  setTemporaryPeek(false);
                }}
                className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  ayahDisplayMode === 'awalan'
                    ? 'bg-[#08B9EF] text-white shadow-xs'
                    : 'bg-[#EEF8FF] text-[#164C68] hover:bg-[#d8eefc]'
                }`}
                title="Lihat 2-3 kata awal ayat sebagai pemicu hafalan"
              >
                🌱 Awalan Saja (Default)
              </button>

              <button
                onClick={() => {
                  setAyahDisplayMode('sebagian');
                  setTemporaryPeek(false);
                }}
                className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  ayahDisplayMode === 'sebagian'
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'bg-[#EEF8FF] text-[#164C68] hover:bg-[#d8eefc]'
                }`}
                title="Lihat kata awal dan waqaf akhir ayat"
              >
                🌓 Sebagian
              </button>

              <button
                onClick={() => {
                  setAyahDisplayMode('tertutup');
                  setTemporaryPeek(false);
                }}
                className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  ayahDisplayMode === 'tertutup'
                    ? 'bg-slate-700 text-white shadow-xs'
                    : 'bg-[#EEF8FF] text-[#164C68] hover:bg-[#d8eefc]'
                }`}
                title="Tutup ayat penuh untuk ujian mandiri"
              >
                🔒 Tertutup
              </button>

              <button
                onClick={() => {
                  setAyahDisplayMode('lengkap');
                  setTemporaryPeek(false);
                }}
                className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  ayahDisplayMode === 'lengkap'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-[#EEF8FF] text-[#164C68] hover:bg-[#d8eefc]'
                }`}
                title="Lihat teks ayat lengkap"
              >
                📖 Lengkap
              </button>
            </div>
          </div>

          {/* Verses Content Rendering Based On Mode */}
          <div className="py-2 min-h-24 flex flex-col justify-center items-center text-center">
            {/* Mode 1: AWALAN (Default Tahfiz Anak) */}
            {ayahDisplayMode === 'awalan' && !temporaryPeek && (
              <div className="space-y-2 animate-in fade-in duration-150 w-full">
                <span className="text-[11px] font-bold text-[#08B9EF] bg-cyan-50 px-3 py-0.5 rounded-full border border-cyan-200 inline-block mb-1">
                  🌱 Pemicu Hafalan: Awalan Ayat
                </span>
                <p dir="rtl" className="text-3xl md:text-4xl font-quran text-[#164C68] leading-loose text-center">
                  {currentAyah.arabicText.split(' ').slice(0, 3).join(' ')} ...
                </p>
                <p className="text-xs text-[#8C9BA7] italic">
                  Lafalkan kelanjutan ayat dari ingatan hafalanmu ya!
                </p>
              </div>
            )}

            {/* Mode 2: SEBAGIAN (Awalan + Waqaf Akhir) */}
            {ayahDisplayMode === 'sebagian' && !temporaryPeek && (
              <div className="space-y-2 animate-in fade-in duration-150 w-full">
                <span className="text-[11px] font-bold text-purple-700 bg-purple-50 px-3 py-0.5 rounded-full border border-purple-200 inline-block mb-1">
                  🌓 Sebagian: Awalan & Akhir Ayat
                </span>
                <p dir="rtl" className="text-2xl md:text-3xl font-quran text-[#164C68] leading-loose text-center">
                  {currentAyah.arabicText.split(' ').slice(0, 2).join(' ')}{' '}
                  <span className="text-slate-400 font-sans tracking-widest text-lg">...</span>{' '}
                  {currentAyah.arabicText.split(' ').slice(-1).join(' ')}
                </p>
                <p className="text-xs text-[#8C9BA7] italic">
                  Hubungkan awalan dengan akhir ayat dalam hafalanmu.
                </p>
              </div>
            )}

            {/* Mode 3: TERTUTUP (Uji Mandiri) */}
            {ayahDisplayMode === 'tertutup' && !temporaryPeek && (
              <div className="py-4 space-y-2 animate-in fade-in duration-150 text-center">
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 mx-auto">
                  <EyeOff size={24} />
                </div>
                <h4 className="text-sm font-black text-[#164C68]">
                  Teks Ditutup Penuh
                </h4>
                <p className="text-xs text-[#8C9BA7] max-w-xs mx-auto">
                  Uji hafalan murni tanpa teks. Lafalkan langsung ke rekaman suara!
                </p>
                <button
                  onClick={() => {
                    addAssistance('lihat_ayah');
                    setTemporaryPeek(true);
                  }}
                  className="mt-1 px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 text-xs font-bold inline-flex items-center gap-1 cursor-pointer"
                >
                  <Eye size={14} />
                  <span>Intip Teks Sebentar</span>
                </button>
              </div>
            )}

            {/* Mode 4 / Temporary Peek: TEKS LENGKAP */}
            {(ayahDisplayMode === 'lengkap' || temporaryPeek) && (
              <div className="w-full space-y-3 animate-in fade-in duration-150">
                {temporaryPeek && (
                  <div className="flex items-center justify-between bg-amber-50 border border-amber-200 rounded-xl px-3 py-1.5 text-xs text-amber-900">
                    <span className="font-bold">Mode Intip Sementara</span>
                    <button
                      onClick={() => setTemporaryPeek(false)}
                      className="text-amber-800 hover:text-amber-950 font-black text-xs cursor-pointer"
                    >
                      Tutup Intip ✕
                    </button>
                  </div>
                )}
                <div className="my-2">
                  <ArabicText arabicText={currentAyah.arabicText} fontSize="normal" />
                </div>
                <p className="text-xs text-slate-600 font-medium italic">
                  "{currentAyah.translationId}"
                </p>
              </div>
            )}
          </div>

          {/* Quick Audio Assistance Controls */}
          <div className="flex items-center justify-center gap-2 pt-1 border-t border-slate-100">
            <button
              onClick={handlePlayAwalan}
              className="px-3 py-1.5 rounded-xl bg-[#EEF8FF] hover:bg-[#d8eefc] text-[#164C68] font-bold text-xs border border-[#C9E1ED] flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all"
              title="Dengarkan bunyi qari untuk awalan ayat saja"
            >
              <Volume2 size={14} className="text-amber-500" />
              <span>Dengar Awalan</span>
            </button>

            <button
              onClick={handlePlayAyah}
              className="px-3 py-1.5 rounded-xl bg-[#EEF8FF] hover:bg-[#d8eefc] text-[#164C68] font-bold text-xs border border-[#C9E1ED] flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all"
              title="Dengarkan qari membaca ayat penuh"
            >
              <Play size={14} className="text-[#08B9EF] fill-current" />
              <span>Dengar Ayat Penuh</span>
            </button>
          </div>
        </div>
      )}

      {/* Mic Permission / Error Alert Banner */}
      {micErrorMessage && (
        <div className="bg-rose-50 border border-rose-200 rounded-3xl p-4 text-left space-y-2.5 animate-in fade-in duration-150">
          <div className="flex items-start gap-2.5 text-rose-900 text-xs">
            <AlertCircle size={18} className="text-rose-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold text-rose-950">Kendala Akses Mikrofon Browser:</p>
              <p className="leading-relaxed">{micErrorMessage}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={() => handleStartRecording(false)}
              className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold cursor-pointer transition-colors"
            >
              Coba Lagi Izin Mikrofon
            </button>

            <button
              onClick={() => handleStartRecording(true)}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer transition-colors"
            >
              Gunakan Mode Latihan Mandiri (Simulasi Rekaman)
            </button>
          </div>
        </div>
      )}

      {/* Existing Saved Recording Card from Database */}
      {existingSavedRecording && !previewBlobUrl && recordingState !== 'RECORDING' && (
        <div className="bg-gradient-to-r from-teal-50/80 to-emerald-50/80 border border-emerald-200 rounded-3xl p-4 space-y-3 text-left shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-emerald-950 flex items-center gap-1.5">
              <CheckCircle className="text-emerald-600" size={16} />
              Rekaman Ayat {currentAyah?.ayahNumber} Tersimpan di Database
            </span>

            {existingSavedRecording.evaluation?.status === 'evaluated' ? (
              <span className="text-[11px] font-black px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                {existingSavedRecording.evaluation.grade === 'mumtaz'
                  ? '🌟 Mumtaz'
                  : existingSavedRecording.evaluation.grade === 'jayyid'
                  ? '👍 Jayyid'
                  : '⚠️ Perlu Latihan'}
              </span>
            ) : (
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200 flex items-center gap-1">
                <Clock size={12} />
                Menunggu Evaluasi Guru / Ortu
              </span>
            )}
          </div>

          {existingSavedRecording.evaluation?.status === 'evaluated' && existingSavedRecording.evaluation.notes && (
            <div className="p-2.5 bg-white/90 rounded-2xl border border-emerald-200 space-y-1">
              <div className="flex items-center justify-between text-[10px] font-bold text-emerald-700">
                <span>Catatan {existingSavedRecording.evaluation.evaluatorRole === 'teacher' ? 'Ustadz / Guru' : 'Orang Tua'}:</span>
                <span>{existingSavedRecording.evaluation.evaluatorName}</span>
              </div>
              <p className="text-xs text-emerald-900 italic">
                "{existingSavedRecording.evaluation.notes}"
              </p>
            </div>
          )}

          {existingSavedRecording.studentNote && (
            <p className="text-[11px] text-[#164C68] bg-white/70 px-2.5 py-1.5 rounded-xl border border-teal-100">
              <strong>Catatan Santri:</strong> "{existingSavedRecording.studentNote}"
            </p>
          )}

          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={() => handlePlaySavedAudio(existingSavedRecording)}
              className="flex-1 py-2 px-3 rounded-2xl bg-white border border-[#C9E1ED] hover:bg-slate-50 text-xs font-bold text-[#164C68] flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
            >
              {isPlayingSavedAudio ? <Pause size={14} /> : <Play size={14} className="fill-current text-[#08B9EF]" />}
              <span>{isPlayingSavedAudio ? 'Jeda Audio' : `Putar Suara (${existingSavedRecording.durationSeconds}s)`}</span>
            </button>

            <button
              onClick={() => AudioDatabaseService.downloadAudioFile(existingSavedRecording)}
              className="p-2 rounded-2xl bg-white border border-[#C9E1ED] hover:bg-slate-50 text-[#164C68] cursor-pointer shadow-2xs"
              title="Unduh file rekaman audio ke perangkat lokal"
            >
              <Download size={15} />
            </button>

            <button
              onClick={() => handleDeleteExistingRecording(existingSavedRecording)}
              className="p-2 rounded-2xl bg-white border border-rose-200 hover:bg-rose-50 text-rose-500 hover:text-rose-700 cursor-pointer shadow-2xs"
              title="Hapus rekaman ayat ini dari perangkat"
            >
              <Trash2 size={15} />
            </button>

            <button
              onClick={() => setShowHistoryModal(true)}
              className="px-3.5 py-2 rounded-2xl bg-[#08B9EF] hover:bg-[#07a6d7] text-white text-xs font-bold flex items-center gap-1 cursor-pointer shadow-2xs"
            >
              <Award size={14} />
              <span>Evaluasi</span>
            </button>
          </div>

          {/* D3.js Tartil Accuracy Visualization Button */}
          <button
            onClick={() => setShowD3Visualizer((prev) => !prev)}
            className={`w-full py-2.5 px-3.5 rounded-2xl text-xs font-bold transition-all flex items-center justify-between cursor-pointer border shadow-2xs ${
              showD3Visualizer
                ? 'bg-gradient-to-r from-purple-700 to-indigo-800 text-white border-purple-900 shadow-md'
                : 'bg-gradient-to-r from-purple-50 via-indigo-50 to-sky-50 text-purple-950 border-purple-200 hover:border-purple-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${showD3Visualizer ? 'bg-white/20 text-white' : 'bg-purple-200 text-purple-800'}`}>
                <Activity size={14} />
              </div>
              <div className="text-left">
                <span className="block font-black text-xs">
                  {showD3Visualizer ? 'Tutup Visualisasi D3 Tartil' : 'Visualisasi Akurasi D3.js vs Mualim'}
                </span>
                <span className={`text-[10px] block ${showD3Visualizer ? 'text-purple-200' : 'text-purple-700'}`}>
                  Perbandingan gelombang, radar 5 dimensi & skor bintang
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1 font-black text-xs">
              <span>⭐ Skor Bintang</span>
              <ChevronDown size={14} className={`transition-transform duration-200 ${showD3Visualizer ? 'rotate-180' : ''}`} />
            </div>
          </button>

          {/* D3 Visualization Interactive Module */}
          {showD3Visualizer && existingSavedRecording && (
            <div className="pt-1 animate-in fade-in duration-200">
              <D3AudioAccuracyEvaluation
                recording={existingSavedRecording}
                surahNumber={selectedSurahNumber}
                surahName={surahMeta.nameLatin}
                ayahNumber={currentAyah.ayahNumber}
                childName="Santri"
                onClose={() => setShowD3Visualizer(false)}
              />
            </div>
          )}
        </div>
      )}

      {/* AI AUTOMATIC CORRECTION RESULT CARD */}
      {(isAiAnalyzing || latestAiCorrection) && (
        <div className="bg-gradient-to-r from-cyan-50/90 via-sky-50/90 to-blue-50/90 border-2 border-[#08B9EF]/40 rounded-3xl p-4.5 space-y-3 text-left shadow-sm animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#08B9EF] text-white flex items-center justify-center shadow-xs">
                <Bot size={18} />
              </div>
              <div>
                <h4 className="text-xs font-black text-[#164C68] uppercase tracking-wider flex items-center gap-1.5">
                  <span>Koreksi Otomatis AI (Tahfiz Smart Engine)</span>
                  <Sparkles size={13} className="text-amber-500 fill-amber-500" />
                </h4>
                <p className="text-[11px] text-[#8C9BA7]">
                  Analisis ketepatan lafal, tajwid, dan kelancaran
                </p>
              </div>
            </div>

            {latestAiCorrection && (
              <span
                className={`text-xs font-black px-3 py-1 rounded-full border ${
                  latestAiCorrection.grade === 'mumtaz'
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                    : latestAiCorrection.grade === 'jayyid'
                    ? 'bg-blue-100 text-blue-800 border-blue-300'
                    : 'bg-amber-100 text-amber-900 border-amber-300'
                }`}
              >
                {latestAiCorrection.grade === 'mumtaz'
                  ? '🌟 Mumtaz'
                  : latestAiCorrection.grade === 'jayyid'
                  ? '👍 Jayyid'
                  : '⚠️ Perlu Latihan'}
              </span>
            )}
          </div>

          {isAiAnalyzing ? (
            <div className="py-4 flex flex-col items-center justify-center gap-2 text-center">
              <div className="w-7 h-7 border-3 border-[#08B9EF] border-t-transparent rounded-full animate-spin" />
              <p className="text-xs font-bold text-[#164C68]">
                Ustadz AI sedang mendengarkan & menganalisis rekaman hafalanmu...
              </p>
            </div>
          ) : latestAiCorrection ? (
            <div className="space-y-3">
              {/* Score Bar Breakdown */}
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-white/90 p-2.5 rounded-2xl border border-[#C9E1ED] text-center">
                  <span className="text-[10px] font-bold text-[#8C9BA7] uppercase block">Skor Total</span>
                  <span className="text-lg font-black text-[#08B9EF]">{latestAiCorrection.overallScore}%</span>
                </div>
                <div className="bg-white/90 p-2.5 rounded-2xl border border-[#C9E1ED] text-center">
                  <span className="text-[10px] font-bold text-[#8C9BA7] uppercase block">Akurasi Lafal</span>
                  <span className="text-lg font-black text-emerald-600">{latestAiCorrection.accuracyScore}%</span>
                </div>
                <div className="bg-white/90 p-2.5 rounded-2xl border border-[#C9E1ED] text-center">
                  <span className="text-[10px] font-bold text-[#8C9BA7] uppercase block">Nilai Tajwid</span>
                  <span className="text-lg font-black text-purple-600">{latestAiCorrection.tajwidScore}%</span>
                </div>
              </div>

              {/* Feedback Text */}
              <div className="bg-white/95 rounded-2xl p-3 border border-[#C9E1ED]/80 space-y-1">
                <span className="text-[11px] font-bold text-[#164C68] flex items-center gap-1">
                  <span>Ulasan Guru AI:</span>
                </span>
                <p className="text-xs text-[#164C68] leading-relaxed">
                  "{latestAiCorrection.feedback}"
                </p>
              </div>

              {/* Tajwid Notes */}
              {latestAiCorrection.tajwidNotes && latestAiCorrection.tajwidNotes.length > 0 && (
                <div className="bg-white/95 rounded-2xl p-3 border border-[#C9E1ED]/80 space-y-1">
                  <span className="text-[11px] font-bold text-[#164C68]">Catatan Tajwid Otomatis:</span>
                  <ul className="text-xs text-slate-700 space-y-1 list-disc list-inside">
                    {latestAiCorrection.tajwidNotes.map((note, nIdx) => (
                      <li key={nIdx}>{note}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* D3 Accuracy & Star Rating Trigger from AI Card */}
              <button
                type="button"
                onClick={() => setShowD3Visualizer((prev) => !prev)}
                className={`w-full py-2.5 px-3 rounded-2xl border text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs transition-all ${
                  showD3Visualizer
                    ? 'bg-gradient-to-r from-purple-700 to-indigo-800 text-white border-purple-900 shadow-md'
                    : 'bg-white border-[#08B9EF]/50 hover:bg-sky-50 text-[#164C68]'
                }`}
              >
                <Activity size={14} className={showD3Visualizer ? 'text-white' : 'text-[#08B9EF]'} />
                <span>{showD3Visualizer ? 'Tutup Visualisasi D3 Tartil' : 'Lihat Visualisasi Akurasi D3.js & Skor Bintang vs Mualim ⭐'}</span>
              </button>

              {/* D3 Visualization Interactive Module Inside AI Card */}
              {showD3Visualizer && (
                <div className="pt-2 animate-in fade-in duration-200">
                  <D3AudioAccuracyEvaluation
                    recording={
                      existingSavedRecording || {
                        id: `rec-preview-${currentAyah?.ayahNumber || 1}`,
                        childId,
                        surahNumber: selectedSurahNumber,
                        surahName: surahMeta.nameLatin,
                        ayahNumber: currentAyah?.ayahNumber || 1,
                        audioBlobUrl: previewBlobUrl || '',
                        durationSeconds: recordingDuration || 4,
                        referenceDurationSeconds: 5,
                        score: latestAiCorrection.overallScore,
                        timingScore: 85,
                        wordCoverageScore: latestAiCorrection.accuracyScore,
                        fluencyScore: latestAiCorrection.fluencyScore,
                        missingWords: [],
                        extraWords: [],
                        assistanceUsed: [],
                        createdAt: new Date().toISOString(),
                        needsReview: false,
                        aiCorrection: latestAiCorrection,
                      }
                    }
                    surahNumber={selectedSurahNumber}
                    surahName={surahMeta.nameLatin}
                    ayahNumber={currentAyah?.ayahNumber || 1}
                    childName="Santri"
                    onClose={() => setShowD3Visualizer(false)}
                  />
                </div>
              )}
            </div>
          ) : null}
        </div>
      )}

      {/* VOICE RECORDING CONTROL AREA */}
      <div className="bg-white border-2 border-[#C9E1ED] rounded-3xl p-5 shadow-sm text-center space-y-4">
        {/* State Display: Idle vs Recording vs Recorded */}
        {recordingState === 'RECORDING' ? (
          <div className="space-y-3 py-2 animate-in fade-in duration-150">
            <div className="flex items-center justify-center gap-2 text-rose-600 font-extrabold text-sm">
              <span className="w-3.5 h-3.5 rounded-full bg-rose-600 animate-ping inline-block" />
              <span>Merekam Hafalan Ayat {currentAyah?.ayahNumber}...</span>
            </div>

            {/* Timer */}
            <div className="text-3xl font-black font-mono text-[#164C68]">
              00:{recordingDuration.toString().padStart(2, '0')}
            </div>

            {/* Live Audio Visualizer Bar */}
            <div className="w-52 mx-auto bg-slate-100 h-3 rounded-full overflow-hidden p-0.5 border border-slate-200">
              <div
                className="bg-rose-500 h-full rounded-full transition-all duration-75"
                style={{ width: `${Math.max(10, audioVolume)}%` }}
              />
            </div>

            {/* Stop Recording Button */}
            <Button
              variant="coral"
              size="lg"
              fullWidth
              onClick={handleStopRecording}
              icon={<Square size={20} className="fill-white" />}
            >
              Hentikan & Simpan Rekaman
            </Button>
          </div>
        ) : previewBlobUrl ? (
          /* Child preview & actions */
          <div className="space-y-3 py-2 animate-in fade-in duration-150 text-left">
            <div className="flex items-center justify-center gap-2 text-emerald-600 font-bold text-sm text-center">
              <CheckCircle size={18} />
              <span>Ayat {currentAyah?.ayahNumber} Berhasil Direkam & Tersimpan di Database!</span>
            </div>

            {/* Audio Playback of Child's Voice */}
            <audio controls src={previewBlobUrl} className="w-full h-10 mt-2" />

            {/* Persistence & Evaluation Badge */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-2.5 text-xs text-emerald-900 flex items-center gap-2">
              <Check size={14} className="text-emerald-600 shrink-0" />
              <span>Tersimpan permanen di database • Siap dievaluasi oleh Ustadz atau Orang Tua</span>
            </div>

            {/* Optional Student Note */}
            <div className="space-y-1 pt-1">
              <label className="text-[11px] font-bold text-[#8C9BA7] flex items-center gap-1">
                <MessageSquare size={13} />
                <span>Pesan / Catatan untuk Guru atau Orang Tua (Opsional):</span>
              </label>
              <div className="flex gap-1.5">
                <input
                  type="text"
                  value={studentNote}
                  onChange={(e) => setStudentNote(e.target.value)}
                  placeholder="Misal: Sudah lancar tanpa melihat teks, mohon koreksi..."
                  className="flex-1 bg-[#EEF8FF] border border-[#C9E1ED] rounded-xl px-3 py-2 text-xs font-semibold text-[#164C68] focus:outline-none focus:border-[#08B9EF]"
                />
                <button
                  onClick={() => handleUpdateStudentNote(studentNote)}
                  className="px-3 py-2 bg-[#164C68] hover:bg-[#113d54] text-white text-xs font-bold rounded-xl cursor-pointer shadow-2xs"
                >
                  Simpan
                </button>
              </div>
            </div>

            {saveToast && (
              <div className="text-xs font-bold text-emerald-700 bg-emerald-50 p-2 rounded-xl border border-emerald-200 text-center">
                {saveToast}
              </div>
            )}

            <div className="flex gap-2 pt-2 items-center">
              <button
                type="button"
                onClick={() => {
                  const rec = StorageService.getRecordingByAyah(childId, selectedSurahNumber, currentAyah.ayahNumber);
                  if (rec) {
                    setDeleteConfirmRec(rec);
                  } else {
                    setPreviewBlobUrl(null);
                    setLatestAiCorrection(null);
                    setShowD3Visualizer(false);
                  }
                }}
                className="px-3.5 py-2.5 rounded-2xl bg-white border border-rose-200 hover:bg-rose-50 text-rose-600 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs transition-colors shrink-0"
                title="Hapus rekaman ayat ini"
              >
                <Trash2 size={16} />
                <span className="hidden sm:inline">Hapus</span>
              </button>

              <Button
                variant="outline"
                size="md"
                fullWidth
                onClick={() => handleStartRecording(false)}
                icon={<RotateCcw size={16} />}
              >
                Rekam Ulang
              </Button>

              <Button
                variant="green"
                size="md"
                fullWidth
                onClick={handleNextAyah}
                icon={<ArrowRight size={18} />}
              >
                {currentAyahIndex < ayahs.length - 1 ? 'Ayat Berikutnya' : 'Lihat Hasil Setoran'}
              </Button>
            </div>
          </div>
        ) : (
          /* Ready to Record State */
          <div className="space-y-3 py-1">
            <div>
              <h4 className="font-heading font-black text-sm text-[#164C68] flex items-center justify-center gap-1.5">
                <Mic size={18} className="text-[#08B9EF]" />
                <span>Fitur Rekam Suara Hafalan</span>
              </h4>
              <p className="text-xs text-[#8C9BA7] font-semibold mt-0.5">
                Mulai lafalkan dari <strong className="text-[#164C68]">Ayat {currentAyah?.ayahNumber}</strong> • rekaman tersimpan permanen di database & dievaluasi AI
              </p>
            </div>

            <Button
              variant="green"
              size="lg"
              fullWidth
              onClick={() => handleStartRecording(false)}
              icon={<Mic size={22} />}
            >
              Mulai Rekam Suara
            </Button>
          </div>
        )}
      </div>

      {/* SURAH PICKER MODAL (Full 114 Surahs, Juz 30, and Popular Short Surahs) */}
      {isSurahPickerOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-lg max-h-[85vh] flex flex-col shadow-2xl overflow-hidden border border-[#C9E1ED]">
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-2xl bg-cyan-50 border border-cyan-200 flex items-center justify-center text-[#08B9EF]">
                  <BookOpen size={18} />
                </div>
                <div>
                  <h3 className="text-base font-black text-[#164C68] font-heading">
                    Pilih Surat untuk Hafalan
                  </h3>
                  <p className="text-xs text-[#8C9BA7] font-medium">
                    Pilih surat yang ingin kamu hafal & setorkan
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsSurahPickerOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Search Input */}
            <div className="p-3 border-b border-slate-100 space-y-2.5 bg-slate-50/50">
              <div className="relative">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={surahSearchQuery}
                  onChange={(e) => setSurahSearchQuery(e.target.value)}
                  placeholder="Cari surat... (cth: An-Nas, Al-Fatihah, 114)"
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#C9E1ED] rounded-2xl text-xs font-semibold text-[#164C68] focus:outline-none focus:border-[#08B9EF]"
                />
              </div>

              {/* Filter Tabs */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setSurahPickerTab('juz30')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    surahPickerTab === 'juz30'
                      ? 'bg-[#08B9EF] text-white shadow-xs'
                      : 'bg-white border border-slate-200 text-[#164C68] hover:bg-slate-50'
                  }`}
                >
                  ⭐ Juz 'Amma (Juz 30)
                </button>

                <button
                  onClick={() => setSurahPickerTab('favorit')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    surahPickerTab === 'favorit'
                      ? 'bg-[#08B9EF] text-white shadow-xs'
                      : 'bg-white border border-slate-200 text-[#164C68] hover:bg-slate-50'
                  }`}
                >
                  🔥 Surat Pendek Favorit
                </button>

                <button
                  onClick={() => setSurahPickerTab('all')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    surahPickerTab === 'all'
                      ? 'bg-[#08B9EF] text-white shadow-xs'
                      : 'bg-white border border-slate-200 text-[#164C68] hover:bg-slate-50'
                  }`}
                >
                  📖 Semua Surat (114)
                </button>
              </div>
            </div>

            {/* Surah List */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {filteredSurahs.length === 0 ? (
                <div className="py-12 text-center text-xs text-[#8C9BA7]">
                  Surat tidak ditemukan dengan kata kunci "{surahSearchQuery}".
                </div>
              ) : (
                filteredSurahs.map((surah) => {
                  const isSelected = surah.number === selectedSurahNumber;
                  const recordingsCount = StorageService.getRecordings(childId).filter(
                    (r) => r.surahNumber === surah.number
                  ).length;

                  return (
                    <button
                      key={surah.number}
                      onClick={() => {
                        setSelectedSurahNumber(surah.number);
                        setIsSurahPickerOpen(false);
                      }}
                      className={`w-full p-3 rounded-2xl border transition-all text-left flex items-center justify-between cursor-pointer ${
                        isSelected
                          ? 'border-[#08B9EF] bg-cyan-50/70 shadow-xs ring-2 ring-[#08B9EF]/20'
                          : 'border-[#C9E1ED] bg-white hover:bg-[#EEF8FF]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-xl font-black text-xs flex items-center justify-center shrink-0 ${
                            isSelected
                              ? 'bg-[#08B9EF] text-white'
                              : 'bg-[#EEF8FF] text-[#164C68]'
                          }`}
                        >
                          {surah.number}
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-sm text-[#164C68] font-heading">
                              {surah.nameLatin}
                            </span>
                            {recordingsCount > 0 && (
                              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                                {recordingsCount} rekaman
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-[#8C9BA7]">
                            {surah.translation} • {surah.ayahCount} ayat • Juz {surah.juzNumber}
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="font-quran text-lg text-[#164C68] block">
                          {surah.nameArabic}
                        </span>
                        {isSelected && (
                          <span className="text-[10px] font-bold text-[#08B9EF] flex items-center justify-end gap-0.5">
                            <Check size={12} /> Terpilih
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* Setoran Results Modal */}
      <SetoranResultModal
        isOpen={showResultModal}
        onClose={() => {
          setShowResultModal(false);
          onFinishHafalan();
        }}
        surahNumber={selectedSurahNumber}
        surahName={surahMeta.nameLatin}
        reciterId="alafasy"
        results={Array.from(recordedAyahs.values())}
        onRetry={() => {
          setShowResultModal(false);
          setRecordedAyahs(new Map());
          setCurrentAyahIndex(0);
          setPreviewBlobUrl(null);
        }}
        onMurojaahWeakAyahs={(weakNums) => {
          setShowResultModal(false);
          onFinishHafalan();
        }}
      />

      {/* Riwayat Rekaman & Evaluasi Guru/Orang Tua Modal */}
      <RiwayatEvaluasiModal
        isOpen={showHistoryModal}
        onClose={() => setShowHistoryModal(false)}
        childId={childId}
        surahNumber={selectedSurahNumber}
        surahName={surahMeta.nameLatin}
        onRefreshParent={() => setRefreshVersion((prev) => prev + 1)}
      />

      {/* Delete Confirmation In-App Modal (Safe in Iframes) */}
      {deleteConfirmRec && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl border border-rose-200 max-w-sm w-full p-5 space-y-4 shadow-2xl text-left">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <Trash2 size={20} />
              </div>
              <div>
                <h4 className="font-heading font-black text-sm text-[#164C68]">
                  Hapus Rekaman Ayat {deleteConfirmRec.ayahNumber}?
                </h4>
                <p className="text-xs text-[#8C9BA7]">
                  File rekaman suara akan dihapus dari memori perangkat ini.
                </p>
              </div>
            </div>

            <div className="p-3 bg-rose-50 border border-rose-100 rounded-2xl text-xs text-rose-950">
              Apakah Anda yakin ingin menghapus rekaman suara untuk Surah {surahMeta.nameLatin} Ayat {deleteConfirmRec.ayahNumber} ({deleteConfirmRec.durationSeconds} Detik)?
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => setDeleteConfirmRec(null)}
                className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={executeDeleteRecording}
                className="flex-1 py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold cursor-pointer shadow-sm"
              >
                Ya, Hapus Sekarang
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Subtle Companion Reaction in corner */}
      <SubtleCompanionReaction
        companion={companion}
        pulseTrigger={companionPulseTrigger}
        message="Lumi mendengarkan hafalanmu! Tetap semangat ✨"
      />
    </div>
  );
};
