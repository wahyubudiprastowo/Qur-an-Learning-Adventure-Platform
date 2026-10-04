import React, { useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import {
  BarChart3,
  TrendingUp,
  Clock,
  PieChart as PieIcon,
  CheckCircle2,
  Sparkles,
  Info,
} from 'lucide-react';
import { WeeklyReportData, DailyProgressPoint } from '../../types/weeklyReport';

interface WeeklyProgressChartsProps {
  report: WeeklyReportData;
}

type ChartViewType = 'activity' | 'score' | 'time' | 'distribution';

// Custom Tooltip for Daily Activity
const ActivityTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data: DailyProgressPoint = payload[0].payload;
    return (
      <div className="bg-white/95 backdrop-blur-xs p-3 rounded-2xl shadow-xl border border-[#C9E1ED] text-xs space-y-1.5 z-50 min-w-[160px]">
        <div className="flex items-center justify-between pb-1 border-b border-slate-100">
          <span className="font-black text-[#164C68] font-heading">{data.dayName}</span>
          <span className="text-[10px] text-[#8C9BA7] font-semibold">{data.shortDate}</span>
        </div>
        <div className="space-y-1">
          <div className="flex items-center justify-between gap-3 text-emerald-700">
            <span className="flex items-center gap-1 font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
              Ziadah Baru:
            </span>
            <strong className="font-black">{data.ayatHafal} Ayat</strong>
          </div>
          <div className="flex items-center justify-between gap-3 text-sky-700">
            <span className="flex items-center gap-1 font-semibold">
              <span className="w-2 h-2 rounded-full bg-[#08B9EF] inline-block" />
              Murojaah:
            </span>
            <strong className="font-black">{data.ayatMurojaah} Ayat</strong>
          </div>
          <div className="flex items-center justify-between gap-3 text-amber-700 pt-1 border-t border-slate-100">
            <span className="font-semibold">Bintang & Waktu:</span>
            <span className="font-bold">⭐ {data.bintang} • {data.menitBelajar}m</span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

// Custom Tooltip for Accuracy Scores
const ScoreTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data: DailyProgressPoint = payload[0].payload;
    return (
      <div className="bg-white/95 backdrop-blur-xs p-3 rounded-2xl shadow-xl border border-[#C9E1ED] text-xs space-y-1.5 z-50">
        <div className="flex items-center justify-between pb-1 border-b border-slate-100">
          <span className="font-black text-[#164C68] font-heading">{data.dayName} ({data.shortDate})</span>
        </div>
        <div className="flex items-center justify-between gap-4 text-purple-700">
          <span className="font-semibold">Skor Kelancaran:</span>
          <strong className="text-sm font-black">{data.skorKelancaran}%</strong>
        </div>
        <span className="text-[10px] text-[#8C9BA7] block">
          {data.skorKelancaran >= 90
            ? '💎 Kategori Mutqin (Sangat Lancar)'
            : data.skorKelancaran >= 80
            ? '✨ Kategori Lancar'
            : 'Perlu pengulangan terarah'}
        </span>
      </div>
    );
  }
  return null;
};

// Custom Tooltip for Time
const TimeTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data: DailyProgressPoint = payload[0].payload;
    return (
      <div className="bg-white/95 backdrop-blur-xs p-3 rounded-2xl shadow-xl border border-[#C9E1ED] text-xs space-y-1 z-50">
        <span className="font-black text-[#164C68] block">{data.dayName}</span>
        <div className="text-amber-800 font-bold">
          Durasi: <span className="text-sm font-black">{data.menitBelajar} Menit</span>
        </div>
        <span className="text-[10px] text-[#8C9BA7]">
          {data.totalAyat > 0 ? `${data.totalAyat} ayat dilatih` : 'Hari istirahat'}
        </span>
      </div>
    );
  }
  return null;
};

export const WeeklyProgressCharts: React.FC<WeeklyProgressChartsProps> = ({ report }) => {
  const [activeChart, setActiveChart] = useState<ChartViewType>('activity');

  return (
    <div className="space-y-4">
      {/* Chart View Switcher Tabs */}
      <div className="grid grid-cols-4 gap-1 p-1 bg-[#EEF8FF] rounded-2xl border border-[#C9E1ED]">
        <button
          onClick={() => setActiveChart('activity')}
          className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeChart === 'activity'
              ? 'bg-white text-[#164C68] shadow-xs'
              : 'text-[#8C9BA7] hover:text-[#164C68]'
          }`}
        >
          <BarChart3 size={14} className="text-[#08B9EF]" />
          <span className="hidden sm:inline">Aktivitas</span>
          <span className="sm:hidden">Ayat</span>
        </button>

        <button
          onClick={() => setActiveChart('score')}
          className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeChart === 'score'
              ? 'bg-white text-[#164C68] shadow-xs'
              : 'text-[#8C9BA7] hover:text-[#164C68]'
          }`}
        >
          <TrendingUp size={14} className="text-purple-500" />
          <span className="hidden sm:inline">Kelancaran</span>
          <span className="sm:hidden">Skor</span>
        </button>

        <button
          onClick={() => setActiveChart('time')}
          className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeChart === 'time'
              ? 'bg-white text-[#164C68] shadow-xs'
              : 'text-[#8C9BA7] hover:text-[#164C68]'
          }`}
        >
          <Clock size={14} className="text-amber-500" />
          <span className="hidden sm:inline">Durasi</span>
          <span className="sm:hidden">Waktu</span>
        </button>

        <button
          onClick={() => setActiveChart('distribution')}
          className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeChart === 'distribution'
              ? 'bg-white text-[#164C68] shadow-xs'
              : 'text-[#8C9BA7] hover:text-[#164C68]'
          }`}
        >
          <PieIcon size={14} className="text-emerald-500" />
          <span className="hidden sm:inline">Status</span>
          <span className="sm:hidden">Porsi</span>
        </button>
      </div>

      {/* Main Chart Canvas Box */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-[#C9E1ED] shadow-xs space-y-3">
        {/* CHART 1: ACTIVITY BAR CHART */}
        {activeChart === 'activity' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-black text-[#164C68] uppercase tracking-wider">
                  Grafik Ayat Dihafal & Dimurojaah
                </h4>
                <p className="text-[11px] text-[#8C9BA7]">
                  Pencapaian harian Ziadah (ayat baru) dan Murojaah (pengulangan)
                </p>
              </div>
              <div className="flex items-center gap-2 text-[10px] font-bold">
                <span className="flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  Ziadah
                </span>
                <span className="flex items-center gap-1 text-sky-700 bg-sky-50 px-2 py-0.5 rounded-full border border-sky-200">
                  <span className="w-2 h-2 rounded-full bg-[#08B9EF]" />
                  Murojaah
                </span>
              </div>
            </div>

            <div className="h-60 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={report.dailyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis
                    dataKey="dayName"
                    tick={{ fill: '#64748B', fontSize: 11, fontWeight: 600 }}
                    axisLine={{ stroke: '#CBD5E1' }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: '#94A3B8', fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip content={<ActivityTooltip />} />
                  <Bar
                    dataKey="ayatHafal"
                    name="Ayat Ziadah"
                    fill="#10B981"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={22}
                  />
                  <Bar
                    dataKey="ayatMurojaah"
                    name="Ayat Murojaah"
                    fill="#08B9EF"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={22}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100 text-xs">
              <div className="bg-[#EEF8FF]/60 p-2.5 rounded-xl border border-[#C9E1ED]/50 flex items-center justify-between">
                <span className="text-[#8C9BA7] font-semibold">Total Ziadah Baru:</span>
                <strong className="text-emerald-600 font-heading text-sm">+{report.totalAyatHafalBaru} Ayat</strong>
              </div>
              <div className="bg-[#EEF8FF]/60 p-2.5 rounded-xl border border-[#C9E1ED]/50 flex items-center justify-between">
                <span className="text-[#8C9BA7] font-semibold">Total Murojaah:</span>
                <strong className="text-[#08B9EF] font-heading text-sm">{report.totalAyatMurojaah} Ayat</strong>
              </div>
            </div>
          </div>
        )}

        {/* CHART 2: ACCURACY & FLUENCY TREND LINE */}
        {activeChart === 'score' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-black text-[#164C68] uppercase tracking-wider">
                  Tren Akurasi & Kelancaran
                </h4>
                <p className="text-[11px] text-[#8C9BA7]">
                  Tingkat kemutqinan pelafalan, tajwid, dan kelancaran setoran
                </p>
              </div>
              <span className="text-xs font-black text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-200">
                Rata-rata: {report.rataRataSkor}%
              </span>
            </div>

            <div className="h-60 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={report.dailyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis
                    dataKey="dayName"
                    tick={{ fill: '#64748B', fontSize: 11, fontWeight: 600 }}
                    axisLine={{ stroke: '#CBD5E1' }}
                    tickLine={false}
                  />
                  <YAxis
                    domain={[60, 100]}
                    tick={{ fill: '#94A3B8', fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                    unit="%"
                  />
                  <Tooltip content={<ScoreTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="skorKelancaran"
                    stroke="#8B5CF6"
                    strokeWidth={3}
                    dot={{ fill: '#8B5CF6', r: 4, strokeWidth: 2, stroke: '#FFFFFF' }}
                    activeDot={{ r: 7, fill: '#7C3AED', stroke: '#DDD6FE', strokeWidth: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="p-3 bg-purple-50/70 border border-purple-200 rounded-2xl flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-purple-600 shrink-0" />
                <span className="text-purple-900 font-semibold">
                  Ambang batas status Mutqin: <strong>90%</strong>
                </span>
              </div>
              <span className="text-[11px] font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                {report.rataRataSkor >= 90 ? 'Tercapai 🏆' : 'Mendekati 🚀'}
              </span>
            </div>
          </div>
        )}

        {/* CHART 3: DURATION AREA CHART */}
        {activeChart === 'time' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-black text-[#164C68] uppercase tracking-wider">
                  Durasi Belajar Harian (Menit)
                </h4>
                <p className="text-[11px] text-[#8C9BA7]">
                  Waktu anak berinteraksi dengan audio ayat, ziadah, & evaluasi
                </p>
              </div>
              <span className="text-xs font-black text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                Total: {report.totalMenitBelajar} Menit
              </span>
            </div>

            <div className="h-60 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={report.dailyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="timeGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis
                    dataKey="dayName"
                    tick={{ fill: '#64748B', fontSize: 11, fontWeight: 600 }}
                    axisLine={{ stroke: '#CBD5E1' }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: '#94A3B8', fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                    unit="m"
                  />
                  <Tooltip content={<TimeTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="menitBelajar"
                    stroke="#F59E0B"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#timeGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 bg-amber-50/60 rounded-xl border border-amber-200/60 flex items-center justify-between">
                <span className="text-amber-800 font-semibold">Rata-rata Harian:</span>
                <strong className="text-amber-900 font-bold">
                  {Math.round(report.totalMenitBelajar / (report.hariAktif || 1))} Menit/Hari
                </strong>
              </div>
              <div className="p-2.5 bg-cyan-50/60 rounded-xl border border-cyan-200/60 flex items-center justify-between">
                <span className="text-cyan-800 font-semibold">Hari Aktif:</span>
                <strong className="text-cyan-900 font-bold">{report.hariAktif} dari 7 Hari</strong>
              </div>
            </div>
          </div>
        )}

        {/* CHART 4: STATUS DISTRIBUTION DONUT */}
        {activeChart === 'distribution' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-black text-[#164C68] uppercase tracking-wider">
                  Distribusi Status Hafalan
                </h4>
                <p className="text-[11px] text-[#8C9BA7]">
                  Proporsi ayat berdasarkan tingkat penguasaan hafalan
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
              <div className="h-52 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={report.distributionData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={75}
                      paddingAngle={4}
                    >
                      {report.distributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: any, name: any) => [`${value} Ayat`, name]}
                      contentStyle={{
                        borderRadius: '16px',
                        border: '1px solid #C9E1ED',
                        fontSize: '12px',
                        fontWeight: '600',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-2">
                {report.distributionData.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-2 bg-[#EEF8FF]/50 border border-[#C9E1ED]/50 rounded-xl flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{ backgroundColor: item.color }}
                      />
                      <div>
                        <span className="font-bold text-[#164C68] block">{item.name}</span>
                        <span className="text-[10px] text-[#8C9BA7] line-clamp-1">{item.description}</span>
                      </div>
                    </div>
                    <span className="font-black text-[#164C68] shrink-0 ml-2">
                      {item.value} Ayat
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
