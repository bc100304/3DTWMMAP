import React, { useState, useMemo } from 'react';
import { Spot, StampRecord, Region } from '../types';
import { getExplorerRank, RANKS } from '../utils/storage';
import {
  BookOpen,
  Award,
  Search,
  Filter,
  CheckCircle2,
  Lock,
  Calendar,
  Sparkles,
  MapPin,
  Compass,
  FileText,
  X,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';

interface PassportViewProps {
  spots: Spot[];
  stamps: Record<string, StampRecord>;
  onSelectSpot: (spot: Spot) => void;
  onOpenItinerary: () => void;
  onOpenCertificate: () => void;
  onClose: () => void;
}

export default function PassportView({
  spots,
  stamps,
  onSelectSpot,
  onOpenItinerary,
  onOpenCertificate,
  onClose,
}: PassportViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [regionFilter, setRegionFilter] = useState<Region>('全部');
  const [statusFilter, setStatusFilter] = useState<'all' | 'stamped' | 'unstamped'>('all');

  const stampedCount = Object.keys(stamps).length;
  const totalCount = spots.length;
  const percentage = Math.round((stampedCount / totalCount) * 100);
  const currentRank = getExplorerRank(stampedCount);

  // Regional breakdown
  const regionalStats = useMemo(() => {
    const regions: Region[] = ['北部', '中部', '南部', '東部', '離島'];
    return regions.map((r) => {
      const regSpots = spots.filter((s) => s.region === r);
      const regStamped = regSpots.filter((s) => stamps[s.id]).length;
      return {
        region: r,
        total: regSpots.length,
        stamped: regStamped,
        percent: Math.round((regStamped / regSpots.length) * 100),
      };
    });
  }, [spots, stamps]);

  // Filtered spots for grid
  const displayedSpots = useMemo(() => {
    return spots.filter((spot) => {
      const matchesSearch =
        spot.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        spot.englishName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        spot.id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRegion = regionFilter === '全部' || spot.region === regionFilter;
      const isStamped = Boolean(stamps[spot.id]);
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'stamped' && isStamped) ||
        (statusFilter === 'unstamped' && !isStamped);

      return matchesSearch && matchesRegion && matchesStatus;
    });
  }, [spots, stamps, searchTerm, regionFilter, statusFilter]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl h-[92vh] flex flex-col bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden text-slate-100">
        {/* Header Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-950/70 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black text-white">台灣觀光集章護照</h2>
                <span className="text-xs font-mono bg-sky-950 text-sky-400 px-2 py-0.5 rounded border border-sky-800">
                  PASSPORT
                </span>
              </div>
              <p className="text-xs text-slate-400">
                探索 100 個台灣必訪勝景，收集朱紅印記，解鎖探險宗師榮譽
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenItinerary}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-sky-950 hover:bg-sky-900 text-sky-300 border border-sky-800 rounded-lg transition-colors cursor-pointer"
            >
              <Compass className="w-3.5 h-3.5" />
              行程規劃
            </button>
            <button
              onClick={onOpenCertificate}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-amber-950 hover:bg-amber-900 text-amber-300 border border-amber-800 rounded-lg transition-colors cursor-pointer"
            >
              <Award className="w-3.5 h-3.5" />
              成就證書
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-full transition-colors ml-1 cursor-pointer"
              title="關閉護照"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Progress & Explorer Rank Summary Banner */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border-b border-slate-800 shrink-0">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
            {/* Rank Card */}
            <div className="flex items-center gap-3 bg-slate-950/60 border border-slate-800 p-3 rounded-xl">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[11px] text-slate-400">當前榮譽頭銜</span>
                <div className="text-base font-bold text-amber-300">{currentRank.title}</div>
                <div className="text-[11px] text-slate-400 font-mono">{currentRank.subtitle}</div>
              </div>
            </div>

            {/* Total Progress Bar */}
            <div className="md:col-span-2 bg-slate-950/60 border border-slate-800 p-3 rounded-xl">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-semibold text-slate-300">總收集進度</span>
                <span className="font-mono text-amber-400 font-bold">
                  {stampedCount} / {totalCount} 章 ({percentage}%)
                </span>
              </div>
              <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-rose-500 transition-all duration-500 rounded-full"
                  style={{ width: `${percentage}%` }}
                />
              </div>

              {/* Regional Mini Progress Tickers */}
              <div className="grid grid-cols-5 gap-2 mt-2 pt-2 border-t border-slate-800/80 text-[11px]">
                {regionalStats.map((rs) => (
                  <div key={rs.region} className="text-center">
                    <span className="text-slate-400">{rs.region}</span>
                    <div className="font-mono text-slate-200 font-medium">
                      {rs.stamped}/{rs.total}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Search & Filters Bar */}
        <div className="p-3 sm:p-4 border-b border-slate-800 bg-slate-950/40 flex flex-wrap items-center justify-between gap-3 shrink-0">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="搜尋景點名稱、編號..."
              className="w-full bg-slate-800/80 border border-slate-700/60 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-sky-500"
            />
          </div>

          {/* Region Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
            {(['全部', '北部', '中部', '南部', '東部', '離島'] as Region[]).map((r) => (
              <button
                key={r}
                onClick={() => setRegionFilter(r)}
                className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors whitespace-nowrap ${
                  regionFilter === r
                    ? 'bg-sky-600 text-white'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1 bg-slate-800/80 p-0.5 rounded-lg text-xs">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                statusFilter === 'all' ? 'bg-slate-700 text-white font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              全部 ({spots.length})
            </button>
            <button
              onClick={() => setStatusFilter('stamped')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                statusFilter === 'stamped' ? 'bg-rose-900 text-rose-200 font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              已蓋章 ({stampedCount})
            </button>
            <button
              onClick={() => setStatusFilter('unstamped')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                statusFilter === 'unstamped' ? 'bg-slate-700 text-white font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              待收集 ({totalCount - stampedCount})
            </button>
          </div>
        </div>

        {/* Spots Stamp Grid */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5">
            {displayedSpots.map((spot) => {
              const record = stamps[spot.id];
              const isStamped = Boolean(record);

              return (
                <div
                  key={spot.id}
                  onClick={() => onSelectSpot(spot)}
                  className={`group relative flex flex-col items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                    isStamped
                      ? 'bg-gradient-to-b from-red-950/20 via-slate-900 to-slate-900 border-red-500/40 shadow-sm hover:border-red-400 hover:shadow-red-950/30'
                      : 'bg-slate-800/30 border-slate-700/60 opacity-80 hover:opacity-100 hover:border-slate-500'
                  }`}
                >
                  {/* Top Badges */}
                  <div className="w-full flex items-center justify-between text-[10px] text-slate-400 mb-2">
                    <span className="font-mono font-bold text-sky-400">{spot.id}</span>
                    <span className="text-slate-400">{spot.region}</span>
                  </div>

                  {/* Stamp Graphic or Dotted Outline */}
                  <div className="w-24 h-24 my-1 flex items-center justify-center relative">
                    {isStamped ? (
                      // Unlocked Vermilion Stamp Icon
                      <div className="w-20 h-20 rounded-xl border-2 border-double border-red-500 bg-red-950/30 flex flex-col items-center justify-center text-red-500 p-1 transform rotate-[-3deg] group-hover:rotate-0 transition-transform">
                        <span className="text-[9px] font-serif tracking-widest text-red-400">
                          臺灣巡禮
                        </span>
                        <span className="text-xs font-black font-serif text-center line-clamp-1 text-red-500">
                          {spot.name}
                        </span>
                        <span className="text-[8px] font-mono mt-0.5 text-red-400/90">
                          {record.formattedDate.split(' ')[0]}
                        </span>
                      </div>
                    ) : (
                      // Locked / Unstamped Placeholder
                      <div className="w-20 h-20 rounded-xl border-2 border-dashed border-slate-700 flex flex-col items-center justify-center text-slate-500 group-hover:border-sky-500/60 group-hover:text-sky-400 transition-colors">
                        <Lock className="w-5 h-5 mb-1" />
                        <span className="text-[10px] font-medium">尚未蓋章</span>
                      </div>
                    )}
                  </div>

                  {/* Spot Title & Status */}
                  <div className="w-full text-center mt-2 pt-2 border-t border-slate-800/80">
                    <p className="text-xs font-bold text-slate-200 truncate group-hover:text-white">
                      {spot.name}
                    </p>
                    <p className="text-[10px] text-slate-400 truncate font-mono">
                      {spot.englishName}
                    </p>
                    {isStamped ? (
                      <span className="inline-block mt-1 text-[10px] font-semibold text-rose-400">
                        ✓ 已收集
                      </span>
                    ) : (
                      <span className="inline-block mt-1 text-[10px] text-slate-400 group-hover:text-sky-300">
                        點擊蓋章 →
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {displayedSpots.length === 0 && (
            <div className="text-center py-12 text-slate-400 text-xs">
              沒有找到符合條件的景點
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>本地即時儲存 (localStorage)，進度自動備份</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            返回地圖
          </button>
        </div>
      </div>
    </div>
  );
}
