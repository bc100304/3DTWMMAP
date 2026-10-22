import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { Spot, StampRecord } from '../types';
import { playStampSound, playUiClick } from '../utils/audio';
import {
  X,
  Sparkles,
  MapPin,
  Clock,
  Mountain,
  Utensils,
  Star,
  CheckCircle2,
  RotateCcw,
  Bot,
  Compass,
  BookmarkCheck,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';

interface StampModalProps {
  spot: Spot | null;
  stampRecord?: StampRecord;
  onClose: () => void;
  onStamp: (spotId: string) => void;
  onResetStamp: (spotId: string) => void;
}

export default function StampModal({
  spot,
  stampRecord,
  onClose,
  onStamp,
  onResetStamp,
}: StampModalProps) {
  const [isStampingAnimation, setIsStampingAnimation] = useState(false);
  const [showConfirmReset, setShowConfirmReset] = useState(false);

  if (!spot) return null;

  const isStamped = Boolean(stampRecord);

  const handlePerformStamp = () => {
    if (isStampingAnimation) return;
    setIsStampingAnimation(true);

    // Play synthesized wooden mallet impact sound at precise timing
    setTimeout(() => {
      playStampSound();
      // Confetti burst
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#dc2626', '#f59e0b', '#10b981', '#38bdf8', '#8b5cf6'],
      });
    }, 280);

    // Finish animation and commit stamp state
    setTimeout(() => {
      onStamp(spot.id);
      setIsStampingAnimation(false);
    }, 600);
  };

  const handleReset = () => {
    playUiClick();
    onResetStamp(spot.id);
    setShowConfirmReset(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl text-slate-100 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-20 p-2 text-slate-300 hover:text-white bg-slate-950/60 hover:bg-slate-950/90 rounded-full transition-colors"
          title="關閉"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Hero Image & Title */}
        <div className="relative h-48 sm:h-56 w-full shrink-0 overflow-hidden rounded-t-2xl bg-slate-950">
          <img
            src={spot.imageUrl}
            alt={spot.name}
            className="w-full h-full object-cover brightness-90"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />

          {/* Title and Badges over Image */}
          <div className="absolute bottom-3 left-4 right-4">
            <div className="flex items-center gap-2 text-xs mb-1.5 font-medium text-slate-300">
              <span className="font-mono text-sky-400 font-bold bg-slate-950/80 px-2 py-0.5 rounded">
                {spot.id}
              </span>
              <span>·</span>
              <span className="bg-slate-950/80 px-2 py-0.5 rounded">{spot.region}地區</span>
              <span>·</span>
              <span className="bg-slate-950/80 px-2 py-0.5 rounded flex items-center gap-1">
                <Mountain className="w-3 h-3 text-emerald-400" />
                {spot.elevation}
              </span>
              <div className="ml-auto flex items-center gap-1 text-amber-400 bg-slate-950/80 px-2 py-0.5 rounded">
                <Star className="w-3.5 h-3.5 fill-amber-400" />
                <span className="font-semibold">{spot.rating.toFixed(1)}</span>
                <span className="text-[11px] text-slate-400">({(spot.reviews / 1000).toFixed(1)}k)</span>
              </div>
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-white tracking-wide drop-shadow">
              {spot.name}
            </h2>
            <p className="text-xs text-slate-300 font-mono line-clamp-1">{spot.englishName}</p>
          </div>
        </div>

        {/* Body Content */}
        <div className="p-4 sm:p-6 space-y-5">
          {/* ========================================= */}
          {/* STAMP INTERACTIVE SECTION (沈浸式重磅蓋章) */}
          {/* ========================================= */}
          <div className="relative overflow-hidden rounded-xl border-2 border-dashed border-rose-500/40 bg-gradient-to-b from-rose-950/20 via-slate-900 to-slate-900/90 p-4 sm:p-5 flex flex-col items-center justify-center text-center">
            {/* Wooden Mallet Stamp Downward Animation Overlay */}
            {isStampingAnimation && (
              <div className="absolute inset-0 z-30 flex items-center justify-center bg-slate-950/60 pointer-events-none">
                <div className="animate-[bounce_0.5s_cubic-bezier(0.25,1,0.5,1)] transform scale-125">
                  <div className="w-24 h-24 rounded-2xl bg-amber-800 border-4 border-amber-950 shadow-2xl flex flex-col items-center justify-center text-amber-100 font-serif font-black">
                    <div className="w-10 h-10 rounded-full bg-amber-700 border-2 border-amber-900 mb-1" />
                    <span className="text-xs tracking-widest">臺灣印記</span>
                  </div>
                </div>
              </div>
            )}

            {stampRecord ? (
              // STAMPED STATE: Authentic Vermilion Red Seal (朱紅印泥印記)
              <div className="flex flex-col items-center w-full space-y-3">
                <div className="flex items-center gap-1.5 text-xs font-bold text-rose-400 tracking-wider">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>【 已收集此章 】</span>
                </div>

                {/* The Traditional Vermilion Commemorative Stamp */}
                <div className="relative p-1">
                  <div className="w-44 h-44 sm:w-48 sm:h-48 rounded-2xl border-4 border-double border-red-600 bg-red-950/20 p-2.5 flex flex-col items-center justify-between text-red-500 select-none shadow-[inset_0_0_15px_rgba(220,38,38,0.25)] relative transform rotate-[-2deg] transition-transform hover:rotate-0">
                    {/* Seal Header Arc */}
                    <div className="w-full text-center border-b border-red-600/40 pb-1">
                      <span className="text-[11px] font-black tracking-widest text-red-500 uppercase">
                        ★ 臺灣觀光百大景點印記 ★
                      </span>
                    </div>

                    {/* Seal Center Name */}
                    <div className="my-auto text-center py-1">
                      <div className="text-xs font-serif text-red-400/90 tracking-widest">
                        {spot.region}·寶島行腳
                      </div>
                      <div className="text-xl sm:text-2xl font-black font-serif tracking-wider text-red-500 drop-shadow-sm my-0.5">
                        {spot.name}
                      </div>
                      <div className="text-[10px] font-mono tracking-widest text-red-400/80">
                        {spot.id}
                      </div>
                    </div>

                    {/* Seal Bottom Stamped Timestamp */}
                    <div className="w-full text-center border-t border-red-600/40 pt-1 flex flex-col items-center">
                      <span className="text-[10px] font-mono text-red-400 tracking-wider">
                        {stampRecord.formattedDate}
                      </span>
                      <span className="text-[9px] text-red-500/70 font-mono">
                        {stampRecord.stampNumber}
                      </span>
                    </div>

                    {/* Vintage ink distress overlay effects */}
                    <div className="absolute inset-0 pointer-events-none rounded-xl border border-red-500/20 mix-blend-screen opacity-60" />
                  </div>
                </div>

                {/* Stamp Details & Reset Action */}
                <div className="flex items-center gap-3 pt-1">
                  <span className="text-xs text-slate-400">
                    集章編號：<span className="font-mono text-slate-200">{stampRecord.stampNumber}</span>
                  </span>
                  <span className="text-slate-600">·</span>
                  {!showConfirmReset ? (
                    <button
                      onClick={() => setShowConfirmReset(true)}
                      className="text-xs text-slate-400 hover:text-rose-400 flex items-center gap-1 transition-colors"
                    >
                      <RotateCcw className="w-3 h-3" />
                      重置此印章
                    </button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-rose-400">確定清除？</span>
                      <button
                        onClick={handleReset}
                        className="px-2 py-0.5 text-xs bg-rose-600 hover:bg-rose-700 text-white rounded font-medium transition-colors"
                      >
                        確認重置
                      </button>
                      <button
                        onClick={() => setShowConfirmReset(false)}
                        className="px-2 py-0.5 text-xs text-slate-400 hover:text-white"
                      >
                        取消
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              // UNSTAMPED STATE: Big Stamp Action Button
              <div className="flex flex-col items-center space-y-3 py-3">
                <div className="w-16 h-16 rounded-full bg-rose-950/40 border border-rose-500/30 flex items-center justify-center text-rose-400 shadow-inner">
                  <BookmarkCheck className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">親臨寶島，留下足跡</h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    點擊按鈕蓋上專屬朱紅紀念章，獲得專屬印記編號並記入集章護照！
                  </p>
                </div>

                <button
                  onClick={handlePerformStamp}
                  disabled={isStampingAnimation}
                  className="px-6 py-2.5 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white text-sm font-bold rounded-xl shadow-lg shadow-rose-950/50 flex items-center gap-2 transition-all transform active:scale-95 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  立即蓋上紀念章
                </button>
              </div>
            )}
          </div>

          {/* ========================================= */}
          {/* TOUR INFORMATION SECTIONS */}
          {/* ========================================= */}
          <div className="space-y-4">
            {/* Description & History */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-sky-400" />
                景點導覽與歷史由來
              </h4>
              <p className="text-sm text-slate-300 leading-relaxed text-justify">
                {spot.description}
              </p>
            </div>

            {/* Must-See Highlights */}
            <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-3.5">
              <h4 className="text-xs font-semibold text-sky-400 mb-2 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                必訪亮點推薦
              </h4>
              <ul className="space-y-1.5">
                {spot.highlights.map((highlight, i) => (
                  <li key={i} className="text-xs text-slate-200 flex items-start gap-2">
                    <span className="text-sky-400 shrink-0 mt-0.5">▪</span>
                    <span>{highlight}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Travel Guide Specs Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Best Season */}
              <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-3">
                <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <span>最佳參觀時機</span>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed">{spot.bestTime}</p>
              </div>

              {/* Local Food Tips */}
              <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-3">
                <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
                  <Utensils className="w-3.5 h-3.5 text-orange-400" />
                  <span>在地內行推薦美食</span>
                </div>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {spot.food.map((f, i) => (
                    <span
                      key={i}
                      className="text-[11px] bg-slate-900/80 text-orange-200 px-2 py-0.5 rounded border border-orange-500/20"
                    >
                      {f}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Gemini AI Local Guide Card (介面展示，未接 API) */}
            <div className="bg-gradient-to-r from-sky-950/40 via-indigo-950/40 to-slate-900 border border-sky-500/30 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center">
                    <Bot className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-sky-300">Gemini AI 在地導遊秘境快報</span>
                </div>
                <span className="text-[10px] text-slate-400 bg-slate-950/80 px-2 py-0.5 rounded border border-slate-800">
                  介面展示，未接 API
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">{spot.aiTips}</p>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <span className="text-xs text-slate-400">
            座標：{spot.lat.toFixed(4)}°N, {spot.lng.toFixed(4)}°E
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
          >
            返回地圖探索
          </button>
        </div>
      </div>
    </div>
  );
}
