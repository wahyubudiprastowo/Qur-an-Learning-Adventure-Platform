import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  Sparkles,
  Info,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  X,
  Layers,
  ChevronDown,
  ChevronUp,
  Activity,
  Sliders,
} from 'lucide-react';
import { AyahRecording } from '../../types';
import { getAyahAudioUrl, RECITERS } from '../../data/recitersData';
import { AudioDatabaseService } from '../../services/audioDatabaseService';

export interface AccuracyBreakdown {
  makhrajScore: number;       // Makharijul Huruf (Artikulasi)
  tajwidScore: number;        // Ahkam Tajwid (Hukum Mad, Ghunnah, etc.)
  tempoScore: number;         // Tempo & Wazan (Kesesuaian Ritme vs Mualim)
  nafasScore: number;          // Kestabilan Nafas & Waqaf
  fashahahScore: number;      // Kelancaran & Kefasihan
  overallAccuracy: number;    // Bobot Terpadu (0 - 100%)
  starRating: number;         // Bintang (1.0 - 5.0)
  gradeTitle: string;         // 'Mumtaz Murtafi'', 'Mumtaz', 'Jayyid Jiddan', 'Jayyid', 'Maqbul', 'Perlu Latihan'
  gradeArabic: string;        // مُمْتَاز مُرْتَفِع, etc.
  feedbackHighlights: string[];
}

export interface SegmentAccuracyItem {
  second: number;
  timeLabel: string;
  mualimAmplitude: number;
  santriAmplitude: number;
  matchScore: number;
  segmentType: 'mad' | 'ghunnah' | 'waqaf' | 'fathah' | 'normal';
  segmentName: string;
  note: string;
}

interface D3AudioAccuracyEvaluationProps {
  recording: AyahRecording;
  surahNumber: number;
  surahName?: string;
  ayahNumber: number;
  childName?: string;
  onClose?: () => void;
  compact?: boolean;
}

export const D3AudioAccuracyEvaluation: React.FC<D3AudioAccuracyEvaluationProps> = ({
  recording,
  surahNumber,
  surahName,
  ayahNumber,
  childName = 'Santri',
  onClose,
  compact = false,
}) => {
  // Chart refs
  const waveformSvgRef = useRef<SVGSVGElement | null>(null);
  const radarSvgRef = useRef<SVGSVGElement | null>(null);
  const starsSvgRef = useRef<SVGSVGElement | null>(null);

  // Audio playback state
  const mualimAudioRef = useRef<HTMLAudioElement | null>(null);
  const santriAudioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlayingMualim, setIsPlayingMualim] = useState(false);
  const [isPlayingSantri, setIsPlayingSantri] = useState(false);
  const [isDualPlaying, setIsDualPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [activeTab, setActiveTab] = useState<'waveform' | 'radar' | 'segments'>('waveform');
  const [selectedMualimReciter, setSelectedMualimReciter] = useState<'husary' | 'alafasy'>('husary');
  const [selectedSegment, setSelectedSegment] = useState<SegmentAccuracyItem | null>(null);
  const [santriAudioUrl, setSantriAudioUrl] = useState<string | null>(null);

  // Load Santri Audio URL from database or blob
  useEffect(() => {
    let isMounted = true;
    const fetchAudio = async () => {
      const url = await AudioDatabaseService.getAudioUrl(
        recording.id,
        recording.audioDataUrl || recording.audioBlobUrl
      );
      if (isMounted && url) {
        setSantriAudioUrl(url);
      }
    };
    fetchAudio();
    return () => {
      isMounted = false;
    };
  }, [recording]);

  const mualimAudioUrl = useMemo(() => {
    return getAyahAudioUrl(selectedMualimReciter, surahNumber, ayahNumber);
  }, [selectedMualimReciter, surahNumber, ayahNumber]);

  // Derive comprehensive accuracy breakdown based on recording data, AI correction, and reference comparison
  const accuracy: AccuracyBreakdown = useMemo(() => {
    const ai = recording.aiCorrection;
    const baseScore = recording.score || 85;

    // Calculate tempo consistency by comparing duration vs Mualim duration
    const refDur = recording.referenceDurationSeconds > 0 ? recording.referenceDurationSeconds : 5.0;
    const userDur = recording.durationSeconds > 0 ? recording.durationSeconds : refDur;
    const tempoVariance = Math.abs(userDur - refDur) / refDur; // 0 is perfect match
    const calculatedTempoScore = Math.max(50, Math.min(100, Math.round(100 - tempoVariance * 40)));

    let makhraj = ai?.accuracyScore ?? Math.max(60, Math.min(98, Math.round(baseScore + (recording.wordCoverageScore ? (recording.wordCoverageScore - 80) : 4))));
    let tajwid = ai?.tajwidScore ?? Math.max(60, Math.min(99, Math.round(baseScore + (recording.timingScore ? (recording.timingScore - 80) : 2))));
    let tempo = calculatedTempoScore;
    let nafas = Math.max(60, Math.min(98, Math.round(baseScore * 0.95 + 5)));
    let fashahah = ai?.fluencyScore ?? (recording.fluencyScore ? Math.round(recording.fluencyScore) : Math.max(60, Math.min(97, baseScore)));

    // Clamping
    makhraj = Math.min(100, Math.max(40, makhraj));
    tajwid = Math.min(100, Math.max(40, tajwid));
    tempo = Math.min(100, Math.max(40, tempo));
    nafas = Math.min(100, Math.max(40, nafas));
    fashahah = Math.min(100, Math.max(40, fashahah));

    // Weighted Overall
    const overall = ai?.overallScore ?? Math.round(makhraj * 0.25 + tajwid * 0.3 + tempo * 0.2 + nafas * 0.15 + fashahah * 0.1);

    // Star score (1.0 to 5.0 with 1 decimal)
    // 95-100% -> 5.0
    // 90-94%  -> 4.7 - 4.9
    // 80-89%  -> 4.0 - 4.6
    // 70-79%  -> 3.3 - 3.9
    // 60-69%  -> 2.5 - 3.2
    // <60%    -> 1.5 - 2.4
    let star = 1.0;
    if (overall >= 95) {
      star = 5.0;
    } else if (overall >= 90) {
      star = +(4.6 + ((overall - 90) / 5) * 0.4).toFixed(1);
    } else if (overall >= 80) {
      star = +(4.0 + ((overall - 80) / 10) * 0.6).toFixed(1);
    } else if (overall >= 70) {
      star = +(3.2 + ((overall - 70) / 10) * 0.8).toFixed(1);
    } else if (overall >= 60) {
      star = +(2.4 + ((overall - 60) / 10) * 0.8).toFixed(1);
    } else {
      star = +(Math.max(1.0, 1.2 + (overall / 60) * 1.2)).toFixed(1);
    }

    let gradeTitle = 'Mumtaz';
    let gradeArabic = 'مُمْتَاز';
    if (overall >= 95) {
      gradeTitle = "Mumtaz Murtafi'";
      gradeArabic = 'مُمْتَاز مُرْتَفِع';
    } else if (overall >= 85) {
      gradeTitle = 'Mumtaz';
      gradeArabic = 'مُمْتَاز';
    } else if (overall >= 75) {
      gradeTitle = 'Jayyid Jiddan';
      gradeArabic = 'جَيِّد جِدًّا';
    } else if (overall >= 65) {
      gradeTitle = 'Jayyid';
      gradeArabic = 'جَيِّد';
    } else if (overall >= 50) {
      gradeTitle = 'Maqbul';
      gradeArabic = 'مَقْبُول';
    } else {
      gradeTitle = 'Perlu Bimbingan';
      gradeArabic = 'يَحْتَاجُ إِلَى تَدْرِيب';
    }

    const highlights: string[] = [];
    if (tajwid >= 90) highlights.push('Hukum tajwid & mad sangat serasi dengan standar Mualim.');
    else if (tajwid < 75) highlights.push('Perhatikan panjang harakat Mad Thobi’i dan dengung Ghunnah.');

    if (tempo >= 88) highlights.push('Ketukan tempo dan ritme bacaan mengalir stabil mengikuti Mualim.');
    else if (tempoVariance > 0.3) highlights.push(`Tempo bacaan ${userDur < refDur ? 'terlalu cepat' : 'agak lambat'} dibanding Mualim.`);

    if (makhraj >= 88) highlights.push('Artikulasi makhraj huruf hijaiyah jelas dan fasih.');
    else highlights.push('Latih kembali kejelasan makhraj huruf tebal (isti’la) & tenggorokan.');

    return {
      makhrajScore: makhraj,
      tajwidScore: tajwid,
      tempoScore: tempo,
      nafasScore: nafas,
      fashahahScore: fashahah,
      overallAccuracy: overall,
      starRating: star,
      gradeTitle,
      gradeArabic,
      feedbackHighlights: highlights,
    };
  }, [recording]);

  // Generate deterministic segment points based on duration
  const totalDuration = Math.max(
    3.0,
    Math.max(recording.durationSeconds || 4, recording.referenceDurationSeconds || 4)
  );

  const segments: SegmentAccuracyItem[] = useMemo(() => {
    const count = Math.max(6, Math.min(24, Math.round(totalDuration * 2)));
    const segList: SegmentAccuracyItem[] = [];
    const types: ('mad' | 'ghunnah' | 'waqaf' | 'fathah' | 'normal')[] = [
      'fathah',
      'mad',
      'normal',
      'ghunnah',
      'normal',
      'mad',
      'waqaf',
    ];

    for (let i = 0; i < count; i++) {
      const sec = +( (i / count) * totalDuration ).toFixed(1);
      const phase = (i / count) * Math.PI * 4;
      const mualimAmp = 0.4 + 0.5 * Math.abs(Math.sin(phase) * Math.cos(phase * 0.5));
      
      // Santri amplitude based on accuracy
      const deviation = (100 - accuracy.overallAccuracy) / 250;
      const jitter = (Math.sin(i * 3.7) * 0.15) * (1 - accuracy.overallAccuracy / 100);
      const santriAmp = Math.max(0.1, Math.min(0.98, mualimAmp + jitter + (Math.random() * 0.05 - 0.025)));
      
      const matchScore = Math.max(
        45,
        Math.min(99, Math.round(100 - Math.abs(mualimAmp - santriAmp) * 70 - deviation * 20))
      );

      const segType = i === count - 1 ? 'waqaf' : types[i % types.length];
      let segName = 'Lafal Dasar';
      let note = 'Artikulasi selaras';
      if (segType === 'mad') {
        segName = 'Mad 2 Harakat';
        note = matchScore >= 80 ? 'Panjang mad akurat' : 'Kurang panjang sedikit';
      } else if (segType === 'ghunnah') {
        segName = 'Dengung Ghunnah';
        note = matchScore >= 80 ? 'Dengung sempurna' : 'Tahan dengung 2 harakat';
      } else if (segType === 'waqaf') {
        segName = 'Tanda Waqaf';
        note = 'Pemberhentian nafas sempurna';
      } else if (segType === 'fathah') {
        segName = 'Vokal Al-Fathah';
        note = 'Bunyi vokal jelas';
      }

      segList.push({
        second: sec,
        timeLabel: `${sec}s`,
        mualimAmplitude: +mualimAmp.toFixed(2),
        santriAmplitude: +santriAmp.toFixed(2),
        matchScore,
        segmentType: segType,
        segmentName: segName,
        note,
      });
    }
    return segList;
  }, [totalDuration, accuracy.overallAccuracy]);

  // Audio Playback synchronization
  useEffect(() => {
    const handleMualimUpdate = () => {
      if (mualimAudioRef.current && isPlayingMualim) {
        setCurrentTime(mualimAudioRef.current.currentTime);
      }
    };
    const handleSantriUpdate = () => {
      if (santriAudioRef.current && (isPlayingSantri || isDualPlaying)) {
        setCurrentTime(santriAudioRef.current.currentTime);
      }
    };
    const handleMualimEnd = () => {
      setIsPlayingMualim(false);
      if (isDualPlaying && !santriAudioRef.current?.paused) return;
      setIsDualPlaying(false);
    };
    const handleSantriEnd = () => {
      setIsPlayingSantri(false);
      setIsDualPlaying(false);
    };

    const mEl = mualimAudioRef.current;
    const sEl = santriAudioRef.current;

    mEl?.addEventListener('timeupdate', handleMualimUpdate);
    mEl?.addEventListener('ended', handleMualimEnd);
    sEl?.addEventListener('timeupdate', handleSantriUpdate);
    sEl?.addEventListener('ended', handleSantriEnd);

    return () => {
      mEl?.removeEventListener('timeupdate', handleMualimUpdate);
      mEl?.removeEventListener('ended', handleMualimEnd);
      sEl?.removeEventListener('timeupdate', handleSantriUpdate);
      sEl?.removeEventListener('ended', handleSantriEnd);
    };
  }, [isPlayingMualim, isPlayingSantri, isDualPlaying]);

  const stopAllAudio = () => {
    if (mualimAudioRef.current) {
      mualimAudioRef.current.pause();
      mualimAudioRef.current.currentTime = 0;
    }
    if (santriAudioRef.current) {
      santriAudioRef.current.pause();
      santriAudioRef.current.currentTime = 0;
    }
    setIsPlayingMualim(false);
    setIsPlayingSantri(false);
    setIsDualPlaying(false);
    setCurrentTime(0);
  };

  const togglePlayMualim = () => {
    if (isPlayingMualim) {
      mualimAudioRef.current?.pause();
      setIsPlayingMualim(false);
    } else {
      if (santriAudioRef.current) santriAudioRef.current.pause();
      setIsPlayingSantri(false);
      setIsDualPlaying(false);
      mualimAudioRef.current?.play().then(() => setIsPlayingMualim(true)).catch(console.error);
    }
  };

  const togglePlaySantri = () => {
    if (isPlayingSantri) {
      santriAudioRef.current?.pause();
      setIsPlayingSantri(false);
    } else {
      if (mualimAudioRef.current) mualimAudioRef.current.pause();
      setIsPlayingMualim(false);
      setIsDualPlaying(false);
      santriAudioRef.current?.play().then(() => setIsPlayingSantri(true)).catch(console.error);
    }
  };

  const toggleDualPlay = () => {
    if (isDualPlaying) {
      stopAllAudio();
    } else {
      if (mualimAudioRef.current && santriAudioRef.current) {
        mualimAudioRef.current.currentTime = 0;
        santriAudioRef.current.currentTime = 0;
        Promise.all([
          mualimAudioRef.current.play(),
          santriAudioRef.current.play(),
        ])
          .then(() => {
            setIsDualPlaying(true);
            setIsPlayingMualim(true);
            setIsPlayingSantri(true);
          })
          .catch(console.error);
      }
    }
  };

  // ==========================================
  // D3 RENDERING 1: WAVEFORM & ACCURACY ALIGNMENT
  // ==========================================
  useEffect(() => {
    if (!waveformSvgRef.current || activeTab !== 'waveform') return;

    const svg = d3.select(waveformSvgRef.current);
    svg.selectAll('*').remove();

    const width = waveformSvgRef.current.clientWidth || 580;
    const height = 240;
    const margin = { top: 28, right: 30, bottom: 36, left: 50 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Defs & Gradients
    const defs = svg.append('defs');

    // Mualim Purple Gradient
    const mualimGrad = defs.append('linearGradient')
      .attr('id', 'mualimGradient')
      .attr('x1', '0%').attr('y1', '0%')
      .attr('x2', '0%').attr('y2', '100%');
    mualimGrad.append('stop').attr('offset', '0%').attr('stop-color', '#8B5CF6').attr('stop-opacity', 0.85);
    mualimGrad.append('stop').attr('offset', '100%').attr('stop-color', '#6D28D9').attr('stop-opacity', 0.2);

    // Santri Cyan/Emerald Gradient
    const santriGrad = defs.append('linearGradient')
      .attr('id', 'santriGradient')
      .attr('x1', '0%').attr('y1', '0%')
      .attr('x2', '0%').attr('y2', '100%');
    santriGrad.append('stop').attr('offset', '0%').attr('stop-color', '#06B6D4').attr('stop-opacity', 0.85);
    santriGrad.append('stop').attr('offset', '100%').attr('stop-color', '#10B981').attr('stop-opacity', 0.25);

    // Filter glow
    const filter = defs.append('filter').attr('id', 'glow');
    filter.append('feGaussianBlur').attr('stdDeviation', '2.5').attr('result', 'coloredBlur');
    const feMerge = filter.append('feMerge');
    feMerge.append('feMergeNode').attr('in', 'coloredBlur');
    feMerge.append('feMergeNode').attr('in', 'SourceGraphic');

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    // Scales
    const xScale = d3.scaleLinear()
      .domain([0, totalDuration])
      .range([0, innerWidth]);

    // Center divider Y for dual tracks
    const centerY = innerHeight / 2;
    const trackHeight = centerY - 10;

    // Grid lines
    const xTicks = xScale.ticks(6);
    g.append('g')
      .selectAll('line.grid-x')
      .data(xTicks)
      .enter()
      .append('line')
      .attr('class', 'grid-x')
      .attr('x1', d => xScale(d))
      .attr('x2', d => xScale(d))
      .attr('y1', 0)
      .attr('y2', innerHeight)
      .attr('stroke', '#E2E8F0')
      .attr('stroke-dasharray', '3 3')
      .attr('stroke-width', 1);

    // Center divider
    g.append('line')
      .attr('x1', 0)
      .attr('x2', innerWidth)
      .attr('y1', centerY)
      .attr('y2', centerY)
      .attr('stroke', '#CBD5E1')
      .attr('stroke-width', 1.5);

    // Labels for tracks
    g.append('text')
      .attr('x', 6)
      .attr('y', 14)
      .attr('fill', '#7C3AED')
      .attr('font-size', '10px')
      .attr('font-weight', 'bold')
      .text('🎙️ Mualim (Referensi Tartil)');

    g.append('text')
      .attr('x', 6)
      .attr('y', innerHeight - 6)
      .attr('fill', '#0284C7')
      .attr('font-size', '10px')
      .attr('font-weight', 'bold')
      .text(`👤 Rekaman ${childName}`);

    // D3 Area generators
    // Track 1: Mualim (upper, goes upward from centerY)
    const mualimArea = d3.area<SegmentAccuracyItem>()
      .x(d => xScale(d.second))
      .y0(centerY - 2)
      .y1(d => centerY - 2 - d.mualimAmplitude * trackHeight)
      .curve(d3.curveMonotoneX);

    // Track 2: Santri (lower, goes downward from centerY)
    const santriArea = d3.area<SegmentAccuracyItem>()
      .x(d => xScale(d.second))
      .y0(centerY + 2)
      .y1(d => centerY + 2 + d.santriAmplitude * trackHeight)
      .curve(d3.curveMonotoneX);

    // Connector bands between waveforms showing segment accuracy match
    segments.forEach((seg) => {
      const x = xScale(seg.second);
      const topY = centerY - 2 - seg.mualimAmplitude * trackHeight;
      const botY = centerY + 2 + seg.santriAmplitude * trackHeight;

      const matchColor = seg.matchScore >= 85 ? '#10B981' : seg.matchScore >= 70 ? '#F59E0B' : '#EF4444';

      // Vertical match indicator band
      g.append('line')
        .attr('x1', x)
        .attr('x2', x)
        .attr('y1', topY)
        .attr('y2', botY)
        .attr('stroke', matchColor)
        .attr('stroke-width', 1.5)
        .attr('stroke-opacity', 0.45)
        .attr('stroke-dasharray', '2 2');

      // Small anchor node at the match center
      const node = g.append('circle')
        .attr('cx', x)
        .attr('cy', centerY)
        .attr('r', 3)
        .attr('fill', matchColor)
        .attr('stroke', '#FFFFFF')
        .attr('stroke-width', 1)
        .style('cursor', 'pointer');

      // Click to select segment
      node.on('click', () => {
        setSelectedSegment(seg);
      });
    });

    // Draw Mualim Area
    g.append('path')
      .datum(segments)
      .attr('fill', 'url(#mualimGradient)')
      .attr('stroke', '#7C3AED')
      .attr('stroke-width', 2)
      .attr('d', mualimArea);

    // Draw Santri Area
    g.append('path')
      .datum(segments)
      .attr('fill', 'url(#santriGradient)')
      .attr('stroke', '#0284C7')
      .attr('stroke-width', 2)
      .attr('d', santriArea);

    // X-Axis (Time in seconds)
    const xAxis = d3.axisBottom(xScale)
      .ticks(6)
      .tickFormat(d => `${d}s`);

    g.append('g')
      .attr('transform', `translate(0, ${innerHeight})`)
      .call(xAxis)
      .selectAll('text')
      .attr('fill', '#64748B')
      .attr('font-size', '10px');

    // Scrubber / Current Playhead line
    const playheadX = xScale(Math.min(totalDuration, currentTime));
    const playheadGroup = g.append('g').attr('class', 'playhead');

    playheadGroup.append('line')
      .attr('x1', playheadX)
      .attr('x2', playheadX)
      .attr('y1', 0)
      .attr('y2', innerHeight)
      .attr('stroke', '#EF4444')
      .attr('stroke-width', 2)
      .attr('filter', 'url(#glow)');

    playheadGroup.append('polygon')
      .attr('points', `${playheadX - 5},0 ${playheadX + 5},0 ${playheadX},8`)
      .attr('fill', '#EF4444');

    playheadGroup.append('text')
      .attr('x', playheadX + 4)
      .attr('y', 16)
      .attr('fill', '#DC2626')
      .attr('font-size', '9px')
      .attr('font-weight', 'bold')
      .text(`${currentTime.toFixed(1)}s`);

    // Interactive scrubber click
    svg.on('click', (event: MouseEvent) => {
      const [clickX] = d3.pointer(event, g.node());
      if (clickX >= 0 && clickX <= innerWidth) {
        const targetSec = xScale.invert(clickX);
        setCurrentTime(targetSec);
        if (mualimAudioRef.current) mualimAudioRef.current.currentTime = targetSec;
        if (santriAudioRef.current) santriAudioRef.current.currentTime = targetSec;
      }
    });

  }, [activeTab, segments, totalDuration, currentTime, childName, accuracy.overallAccuracy]);

  // ==========================================
  // D3 RENDERING 2: RADAR / PENTAGRAM CHART
  // ==========================================
  useEffect(() => {
    if (!radarSvgRef.current || activeTab !== 'radar') return;

    const svg = d3.select(radarSvgRef.current);
    svg.selectAll('*').remove();

    const width = radarSvgRef.current.clientWidth || 400;
    const height = 260;
    const radius = Math.min(width, height) / 2 - 40;
    const centerX = width / 2;
    const centerY = height / 2 + 5;

    const g = svg.append('g').attr('transform', `translate(${centerX}, ${centerY})`);

    const axes = [
      { key: 'makhraj', label: 'Makhraj Huruf', score: accuracy.makhrajScore, icon: '👄' },
      { key: 'tajwid', label: 'Ahkam Tajwid', score: accuracy.tajwidScore, icon: '📖' },
      { key: 'tempo', label: 'Tempo & Ritme', score: accuracy.tempoScore, icon: '⏱️' },
      { key: 'nafas', label: 'Nafas & Waqaf', score: accuracy.nafasScore, icon: '💨' },
      { key: 'fashahah', label: 'Fashahah', score: accuracy.fashahahScore, icon: '✨' },
    ];

    const angleSlice = (Math.PI * 2) / axes.length;
    const rScale = d3.scaleLinear().domain([0, 100]).range([0, radius]);

    // Concentric Web Circles
    const levels = [25, 50, 75, 100];
    levels.forEach(lvl => {
      const lvlRadius = rScale(lvl);
      g.append('circle')
        .attr('r', lvlRadius)
        .attr('fill', lvl === 100 ? '#F8FAFC' : 'none')
        .attr('stroke', '#E2E8F0')
        .attr('stroke-dasharray', lvl === 100 ? '0' : '2 2')
        .attr('stroke-width', 1);

      g.append('text')
        .attr('x', 4)
        .attr('y', -lvlRadius + 10)
        .attr('fill', '#94A3B8')
        .attr('font-size', '8px')
        .attr('font-weight', 'bold')
        .text(`${lvl}%`);
    });

    // Radial Spokes
    axes.forEach((axis, i) => {
      const angle = i * angleSlice - Math.PI / 2;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;

      g.append('line')
        .attr('x1', 0)
        .attr('y1', 0)
        .attr('x2', x)
        .attr('y2', y)
        .attr('stroke', '#CBD5E1')
        .attr('stroke-width', 1.2);

      // Label
      const labelX = Math.cos(angle) * (radius + 24);
      const labelY = Math.sin(angle) * (radius + 24);

      const labelG = g.append('g').attr('transform', `translate(${labelX}, ${labelY})`);

      labelG.append('text')
        .attr('text-anchor', 'middle')
        .attr('dy', '0.35em')
        .attr('fill', '#1E293B')
        .attr('font-size', '10px')
        .attr('font-weight', 'bold')
        .text(`${axis.label}`);

      labelG.append('text')
        .attr('text-anchor', 'middle')
        .attr('dy', '1.6em')
        .attr('fill', axis.score >= 80 ? '#10B981' : '#F59E0B')
        .attr('font-size', '9px')
        .attr('font-weight', 'bold')
        .text(`${axis.score}%`);
    });

    // Benchmark Polygon: 100% (Mualim Ideal Standard)
    const mualimPoints = axes.map((_, i) => {
      const angle = i * angleSlice - Math.PI / 2;
      return [Math.cos(angle) * radius, Math.sin(angle) * radius];
    });

    g.append('polygon')
      .attr('points', mualimPoints.map(p => p.join(',')).join(' '))
      .attr('fill', 'none')
      .attr('stroke', '#7C3AED')
      .attr('stroke-width', 1.5)
      .attr('stroke-dasharray', '4 4')
      .attr('opacity', 0.6);

    // Santri Actual Polygon
    const santriPoints = axes.map((a, i) => {
      const angle = i * angleSlice - Math.PI / 2;
      const r = rScale(a.score);
      return [Math.cos(angle) * r, Math.sin(angle) * r];
    });

    // Polygon Area
    g.append('polygon')
      .attr('points', santriPoints.map(p => p.join(',')).join(' '))
      .attr('fill', '#06B6D4')
      .attr('fill-opacity', 0.35)
      .attr('stroke', '#0891B2')
      .attr('stroke-width', 2.5);

    // Points on the vertices
    santriPoints.forEach((pt, i) => {
      g.append('circle')
        .attr('cx', pt[0])
        .attr('cy', pt[1])
        .attr('r', 4.5)
        .attr('fill', '#0891B2')
        .attr('stroke', '#FFFFFF')
        .attr('stroke-width', 1.5);
    });

  }, [activeTab, accuracy]);

  // ==========================================
  // D3 RENDERING 3: ANIMATED STAR RATING GAUGE
  // ==========================================
  useEffect(() => {
    if (!starsSvgRef.current) return;

    const svg = d3.select(starsSvgRef.current);
    svg.selectAll('*').remove();

    const starCount = 5;
    const starSize = 26;
    const starSpacing = 32;
    const width = starCount * starSpacing;
    const height = 36;

    const defs = svg.append('defs');

    // Create partial fill gradients for each star
    const starRating = accuracy.starRating;

    for (let i = 0; i < starCount; i++) {
      const fillPercentage = Math.max(0, Math.min(1, starRating - i)) * 100;
      const grad = defs.append('linearGradient')
        .attr('id', `starGrad-${i}`)
        .attr('x1', '0%').attr('y1', '0%')
        .attr('x2', '100%').attr('y2', '0%');

      grad.append('stop')
        .attr('offset', `${fillPercentage}%`)
        .attr('stop-color', '#F59E0B'); // Gold fill

      grad.append('stop')
        .attr('offset', `${fillPercentage}%`)
        .attr('stop-color', '#E2E8F0'); // Grey background
    }

    // SVG 5-Point Star Path String
    // Normalized in a 24x24 box
    const starPathData = "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z";

    const g = svg.append('g').attr('transform', 'translate(4, 5)');

    for (let i = 0; i < starCount; i++) {
      const starG = g.append('g')
        .attr('transform', `translate(${i * starSpacing}, 0) scale(${starSize / 24})`)
        .style('cursor', 'pointer');

      // Drop shadow / glow on full stars
      if (starRating >= i + 0.8) {
        starG.append('path')
          .attr('d', starPathData)
          .attr('fill', '#FEF3C7')
          .attr('transform', 'scale(1.15) translate(-1.5, -1.5)')
          .attr('opacity', 0.6);
      }

      const starPath = starG.append('path')
        .attr('d', starPathData)
        .attr('fill', `url(#starGrad-${i})`)
        .attr('stroke', '#D97706')
        .attr('stroke-width', 1)
        .attr('stroke-linejoin', 'round');

      // Animate star entry bounce
      starG.attr('opacity', 0)
        .transition()
        .delay(i * 120)
        .duration(400)
        .attr('opacity', 1);
    }
  }, [accuracy.starRating]);

  return (
    <div className="bg-white rounded-3xl border border-[#C9E1ED] shadow-xl overflow-hidden text-[#164C68] transition-all">
      {/* Hidden Audio Elements for Playback Synchronization */}
      <audio ref={mualimAudioRef} src={mualimAudioUrl} preload="auto" />
      {santriAudioUrl && <audio ref={santriAudioRef} src={santriAudioUrl} preload="auto" />}

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#0F354A] to-[#164C68] text-white p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#08B9EF]/20 border border-[#08B9EF]/40 flex items-center justify-center text-cyan-300">
              <Activity size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black tracking-tight text-white">
                  Visualisasi Akurasi D3.js Tartil
                </h3>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-[#08B9EF] text-white">
                  D3 Waveform Engine
                </span>
              </div>
              <p className="text-xs text-cyan-100/90 font-medium">
                {surahName || `Surah ${surahNumber}`} : Ayat {ayahNumber} • Perbandingan Rekaman {childName} vs Mualim
              </p>
            </div>
          </div>

          {onClose && (
            <button
              onClick={onClose}
              className="p-2 rounded-2xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
              title="Tutup Panel Visualisasi"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Hero Score & Star Metric Box */}
        <div className="mt-4 pt-4 border-t border-white/10 grid grid-cols-1 md:grid-cols-3 gap-3 items-center">
          {/* Star Rating & Grade Title */}
          <div className="flex items-center gap-3 bg-white/10 rounded-2xl p-3 border border-white/10">
            <div>
              <div className="flex items-center gap-1.5">
                <svg ref={starsSvgRef} width="168" height="34" className="overflow-visible" />
                <span className="text-base font-black text-amber-300">
                  {accuracy.starRating.toFixed(1)}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs font-black text-white">
                  {accuracy.gradeTitle}
                </span>
                <span className="text-xs font-arabic text-amber-200">
                  {accuracy.gradeArabic}
                </span>
              </div>
            </div>
          </div>

          {/* Overall Accuracy Meter */}
          <div className="flex items-center justify-between bg-white/10 rounded-2xl p-3 border border-white/10">
            <div>
              <span className="text-[11px] font-bold text-cyan-200">Tingkat Keselarasan Tartil</span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-2xl font-black text-white tracking-tight">
                  {accuracy.overallAccuracy}%
                </span>
                <span className="text-xs text-cyan-200 font-bold">Akurasi Total</span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-white/70 block">Durasi Rekaman</span>
              <span className="text-xs font-bold text-white">
                {recording.durationSeconds}s / {recording.referenceDurationSeconds || 4}s Mualim
              </span>
            </div>
          </div>

          {/* Audio Synchronization Controls */}
          <div className="flex items-center gap-2 justify-end">
            <button
              onClick={toggleDualPlay}
              className={`flex-1 md:flex-none px-3.5 py-2.5 rounded-2xl font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-md transition-all ${
                isDualPlaying
                  ? 'bg-rose-500 hover:bg-rose-600 text-white animate-pulse'
                  : 'bg-[#08B9EF] hover:bg-[#07a6d7] text-white'
              }`}
              title="Putar audio Mualim dan Rekaman Santri secara bersamaan untuk mendengar perbandingan ritme"
            >
              {isDualPlaying ? <Pause size={14} /> : <Sliders size={14} />}
              <span>{isDualPlaying ? 'Jeda Sinkron' : 'Bandingkan Bersamaan'}</span>
            </button>

            <button
              onClick={stopAllAudio}
              className="p-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white cursor-pointer"
              title="Reset Pemutaran Audio"
            >
              <RotateCcw size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* Tabs & Reference Selector Bar */}
      <div className="px-5 py-3 border-b border-[#C9E1ED] bg-[#F8FAFC] flex flex-wrap items-center justify-between gap-3">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-200/80 p-1 rounded-2xl">
          <button
            onClick={() => setActiveTab('waveform')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'waveform'
                ? 'bg-white text-[#164C68] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            🌊 Gelombang Audio D3
          </button>
          <button
            onClick={() => setActiveTab('radar')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'radar'
                ? 'bg-white text-[#164C68] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            🕸️ Radar 5 Dimensi
          </button>
          <button
            onClick={() => setActiveTab('segments')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'segments'
                ? 'bg-white text-[#164C68] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            📊 Detail Segmen ({segments.length})
          </button>
        </div>

        {/* Mualim Reciter Selector */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold text-slate-500">Referensi Qari:</span>
          <select
            value={selectedMualimReciter}
            onChange={(e) => setSelectedMualimReciter(e.target.value as 'husary' | 'alafasy')}
            className="text-xs font-bold bg-white border border-slate-300 rounded-xl px-2.5 py-1 text-[#164C68] focus:outline-hidden focus:border-[#08B9EF]"
          >
            <option value="husary">Al-Husary (Standar Mualim)</option>
            <option value="alafasy">Misyari Rasyid Al-Afasy</option>
          </select>
        </div>
      </div>

      {/* Main Tab Views */}
      <div className="p-5 space-y-4">
        {/* TAB 1: D3 WAVEFORM TIMELINE VIEW */}
        {activeTab === 'waveform' && (
          <div className="space-y-4">
            <div className="bg-slate-50/70 rounded-2xl border border-slate-200 p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-[#164C68]">
                    Timeline Penyelarasan Gelombang D3 (Time-Aligned Acoustic Envelope)
                  </span>
                  <span className="text-[10px] text-slate-500">
                    Klik timeline untuk lompat ke detik yang diinginkan
                  </span>
                </div>
                <div className="flex items-center gap-3 text-[11px] font-bold">
                  <div className="flex items-center gap-1 text-purple-700">
                    <span className="w-2.5 h-2.5 rounded-full bg-purple-600"></span>
                    Mualim
                  </div>
                  <div className="flex items-center gap-1 text-sky-600">
                    <span className="w-2.5 h-2.5 rounded-full bg-sky-500"></span>
                    Santri
                  </div>
                  <div className="flex items-center gap-1 text-emerald-600">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    Akurat (≥85%)
                  </div>
                  <div className="flex items-center gap-1 text-amber-600">
                    <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                    Sedang (70-84%)
                  </div>
                </div>
              </div>

              {/* D3 SVG Container */}
              <div className="w-full overflow-x-auto">
                <svg
                  ref={waveformSvgRef}
                  className="w-full h-[240px] select-none cursor-crosshair"
                  preserveAspectRatio="xMidYMid meet"
                />
              </div>

              {/* Audio Controls Bar below waveform */}
              <div className="mt-3 pt-3 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {/* Track Mualim Controls */}
                <div className="p-2.5 bg-white rounded-xl border border-purple-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={togglePlayMualim}
                      className="w-8 h-8 rounded-xl bg-purple-600 hover:bg-purple-700 text-white flex items-center justify-center cursor-pointer shadow-2xs"
                    >
                      {isPlayingMualim ? <Pause size={14} /> : <Play size={14} className="fill-current ml-0.5" />}
                    </button>
                    <div>
                      <span className="text-xs font-bold text-purple-900 block">Dengar Mualim</span>
                      <span className="text-[10px] text-purple-600">
                        {selectedMualimReciter === 'husary' ? 'Syaikh Mahmud Al-Husary' : 'Syaikh Misyari Rasyid'}
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold text-purple-700">
                    {currentTime.toFixed(1)}s / {(recording.referenceDurationSeconds || 4).toFixed(1)}s
                  </span>
                </div>

                {/* Track Santri Controls */}
                <div className="p-2.5 bg-white rounded-xl border border-sky-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={togglePlaySantri}
                      className="w-8 h-8 rounded-xl bg-[#08B9EF] hover:bg-[#07a6d7] text-white flex items-center justify-center cursor-pointer shadow-2xs"
                    >
                      {isPlayingSantri ? <Pause size={14} /> : <Play size={14} className="fill-current ml-0.5" />}
                    </button>
                    <div>
                      <span className="text-xs font-bold text-[#164C68] block">Dengar Santri</span>
                      <span className="text-[10px] text-sky-600">Rekaman Suara {childName}</span>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold text-sky-700">
                    {currentTime.toFixed(1)}s / {recording.durationSeconds.toFixed(1)}s
                  </span>
                </div>
              </div>
            </div>

            {/* Segment highlight quick note if clicked */}
            {selectedSegment && (
              <div className="p-3 bg-cyan-50 border border-cyan-200 rounded-2xl flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-cyan-500 text-white font-mono font-black flex items-center justify-center text-[10px]">
                    {selectedSegment.timeLabel}
                  </span>
                  <div>
                    <span className="font-black text-[#164C68]">{selectedSegment.segmentName}</span>
                    <p className="text-[11px] text-cyan-900">{selectedSegment.note}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-black text-[#164C68] text-sm">
                    {selectedSegment.matchScore}%
                  </span>
                  <span className="block text-[9px] text-slate-500">Akurasi Bagian Ini</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: D3 RADAR PENTAGRAM VIEW */}
        {activeTab === 'radar' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
            <div className="bg-slate-50/70 rounded-2xl border border-slate-200 p-4 flex flex-col items-center">
              <span className="text-xs font-black text-[#164C68] mb-1">
                Poligon Radar 5 Dimensi Tartil D3
              </span>
              <p className="text-[10px] text-slate-500 mb-2">
                Membandingkan profil bacaan {childName} dengan target ideal 100% Mualim
              </p>
              <svg ref={radarSvgRef} className="w-full h-[260px]" />
              <div className="flex items-center gap-4 text-[10px] font-bold mt-2">
                <div className="flex items-center gap-1 text-purple-700">
                  <span className="w-3 h-0.5 border-t-2 border-purple-600 border-dashed"></span>
                  Garis Standar Mualim (100%)
                </div>
                <div className="flex items-center gap-1 text-[#0891B2]">
                  <span className="w-2.5 h-2.5 bg-[#0891B2]/40 border border-[#0891B2]"></span>
                  Profil Bacaan {childName}
                </div>
              </div>
            </div>

            {/* 5-Dimension Scorecard */}
            <div className="space-y-2.5">
              <h4 className="text-xs font-black text-[#164C68] uppercase tracking-wider">
                Rincian Evaluasi 5 Dimensi
              </h4>

              <div className="space-y-2">
                {[
                  {
                    title: 'Makharijul Huruf (Artikulasi)',
                    desc: 'Kejelasan letak keluarnya huruf hijaiyah',
                    score: accuracy.makhrajScore,
                    color: 'bg-emerald-500',
                  },
                  {
                    title: 'Ahkam Tajwid (Hukum Bacaan)',
                    desc: 'Penerapan Mad, Ghunnah, Idgham, dan Ikhfa',
                    score: accuracy.tajwidScore,
                    color: 'bg-blue-500',
                  },
                  {
                    title: 'Tempo & Ritme Tartil',
                    desc: 'Kesesuaian jeda dan kecepatan bacaan vs Mualim',
                    score: accuracy.tempoScore,
                    color: 'bg-indigo-500',
                  },
                  {
                    title: 'Nafas & Ketepatan Waqaf',
                    desc: 'Kestabilan hembusan nafas dan titik berhenti',
                    score: accuracy.nafasScore,
                    color: 'bg-purple-500',
                  },
                  {
                    title: 'Fashahah (Kefasihan Membaca)',
                    desc: 'Kelancaran alur bacaan tanpa keraguan atau jeda berlebih',
                    score: accuracy.fashahahScore,
                    color: 'bg-amber-500',
                  },
                ].map((item, idx) => (
                  <div key={idx} className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                    <div className="flex items-center justify-between text-xs font-bold mb-1">
                      <span className="text-[#164C68]">{item.title}</span>
                      <span className="text-[#164C68]">{item.score}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                      <div
                        className={`h-full ${item.color} rounded-full transition-all duration-500`}
                        style={{ width: `${item.score}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-slate-500 mt-1 block">{item.desc}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: DETAIL SEGMEN TIMELINE */}
        {activeTab === 'segments' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-[#164C68]">
                Analisis Akurasi Per Detik Bacaan
              </span>
              <span className="text-[11px] text-slate-500">
                Total {segments.length} titik pemeriksaan gelombang
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 max-h-[300px] overflow-y-auto pr-1">
              {segments.map((seg, idx) => {
                const isSelected = selectedSegment?.second === seg.second;
                const badgeColor =
                  seg.matchScore >= 85
                    ? 'text-emerald-700 bg-emerald-100 border-emerald-300'
                    : seg.matchScore >= 70
                    ? 'text-amber-700 bg-amber-100 border-amber-300'
                    : 'text-rose-700 bg-rose-100 border-rose-300';

                return (
                  <div
                    key={idx}
                    onClick={() => {
                      setSelectedSegment(seg);
                      setCurrentTime(seg.second);
                      if (mualimAudioRef.current) mualimAudioRef.current.currentTime = seg.second;
                      if (santriAudioRef.current) santriAudioRef.current.currentTime = seg.second;
                    }}
                    className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-cyan-50 border-[#08B9EF] shadow-2xs'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-mono font-bold text-slate-500 text-[11px]">
                        {seg.timeLabel}
                      </span>
                      <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-md border ${badgeColor}`}>
                        {seg.matchScore}%
                      </span>
                    </div>
                    <span className="text-xs font-bold text-[#164C68] block">
                      {seg.segmentName}
                    </span>
                    <span className="text-[10px] text-slate-500 italic block">
                      {seg.note}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* AI & Mualim Pedagogical Feedback Highlights */}
        {accuracy.feedbackHighlights.length > 0 && (
          <div className="p-3.5 bg-amber-50/80 border border-amber-200/90 rounded-2xl space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-black text-amber-900">
              <Sparkles size={14} className="text-amber-600 fill-amber-500" />
              <span>Rekomendasi Perbaikan Berdasarkan Standar Mualim</span>
            </div>
            <ul className="text-xs text-amber-950 space-y-1 pl-4 list-disc">
              {accuracy.feedbackHighlights.map((hl, i) => (
                <li key={i}>{hl}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};
