import React, { useState } from 'react';
import { Spot, StampRecord } from '../types';
import { getExplorerRank } from '../utils/storage';
import { Award, Printer, Download, X, Check, Edit2, Share2, Sparkles } from 'lucide-react';

interface CertificateViewProps {
  stamps: Record<string, StampRecord>;
  totalSpots: number;
  onClose: () => void;
}

export default function CertificateView({
  stamps,
  totalSpots,
  onClose,
}: CertificateViewProps) {
  const [travelerName, setTravelerName] = useState('探索旅人');
  const [isEditingName, setIsEditingName] = useState(false);
  const [copied, setCopied] = useState(false);

  const stampedCount = Object.keys(stamps).length;
  const percentage = Math.round((stampedCount / totalSpots) * 100);
  const rank = getExplorerRank(stampedCount);

  const today = new Date();
  const pad = (n: number) => n.toString().padStart(2, '0');
  const dateStr = `${today.getFullYear()} 年 ${pad(today.getMonth() + 1)} 月 ${pad(today.getDate())} 日`;
  const certNumber = `TW-CERT-${today.getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    const text = `我在「台灣 3D 旅遊導覽與觀光集章冊」中榮獲【${rank.title}】頭銜！已踏訪並收集了 ${stampedCount} / ${totalSpots} 個台灣必訪景點紀念印記！`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl max-h-[92vh] flex flex-col bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden text-slate-100">
        {/* Header Bar */}
        <div className="p-4 border-b border-slate-800 bg-slate-950/70 flex items-center justify-between no-print">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-400" />
            <h2 className="text-base font-bold text-white">台灣巡禮探索成就證書</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
              <span>{copied ? '已複製成就' : '分享榮譽'}</span>
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-amber-600 hover:bg-amber-500 text-white rounded-lg transition-colors cursor-pointer shadow-md"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>列印 / 存為PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-full transition-colors cursor-pointer ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Certificate Sheet Display Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 flex items-center justify-center bg-slate-950">
          <div
            id="printable-certificate"
            className="w-full max-w-2xl bg-amber-50 text-slate-900 p-6 sm:p-10 rounded-xl shadow-2xl border-8 border-double border-amber-600/80 relative overflow-hidden select-text"
          >
            {/* Corner Decorative Ornaments */}
            <div className="absolute top-2 left-2 text-amber-700/60 font-serif text-sm">✦</div>
            <div className="absolute top-2 right-2 text-amber-700/60 font-serif text-sm">✦</div>
            <div className="absolute bottom-2 left-2 text-amber-700/60 font-serif text-sm">✦</div>
            <div className="absolute bottom-2 right-2 text-amber-700/60 font-serif text-sm">✦</div>

            {/* Inner Border */}
            <div className="border border-amber-500/40 p-4 sm:p-6 rounded-lg text-center relative flex flex-col items-center">
              {/* Certificate Top Emblem */}
              <div className="w-14 h-14 rounded-full border-2 border-amber-700/80 bg-amber-100/50 flex items-center justify-center text-amber-800 mb-3 shadow-inner">
                <Award className="w-7 h-7" />
              </div>

              {/* Title */}
              <span className="text-[11px] font-serif font-black tracking-widest text-amber-900 uppercase">
                TAIWAN TRAVEL & EXPLORATION PASSPORT
              </span>
              <h1 className="text-2xl sm:text-3xl font-serif font-black text-amber-950 tracking-wider my-1">
                臺灣巡禮探索成就證書
              </h1>
              <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-amber-700 to-transparent my-2" />

              {/* Recipient Name Field */}
              <div className="my-3 flex items-center justify-center gap-2">
                {isEditingName ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={travelerName}
                      onChange={(e) => setTravelerName(e.target.value)}
                      className="text-center font-serif text-xl font-bold border-b-2 border-amber-800 bg-amber-100/80 px-2 py-0.5 text-amber-950 focus:outline-none"
                      autoFocus
                    />
                    <button
                      onClick={() => setIsEditingName(false)}
                      className="p-1 text-xs bg-amber-800 text-amber-100 rounded"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => setIsEditingName(true)}
                    className="flex items-center gap-1.5 cursor-pointer group"
                    title="點擊修改旅人姓名"
                  >
                    <span className="text-xl sm:text-2xl font-serif font-bold text-amber-950 border-b-2 border-amber-700/50 px-3 py-0.5 group-hover:border-amber-800">
                      {travelerName}
                    </span>
                    <Edit2 className="w-3.5 h-3.5 text-amber-700/60 group-hover:text-amber-900" />
                  </div>
                )}
                <span className="text-sm font-serif font-medium text-amber-900">閣下：</span>
              </div>

              {/* Certificate Prose */}
              <p className="text-xs sm:text-sm font-serif text-amber-900/90 leading-relaxed max-w-lg mx-auto text-justify sm:text-center my-3">
                閣下以無比之熱情親履福爾摩沙之山海名勝，自北海奇岬歷經中央高嶺，至南疆國境與離島海韻，親自探訪並於觀光護照內累計獲頒{' '}
                <strong className="text-amber-950 font-bold underline decoration-amber-700/60 decoration-2">
                  {stampedCount}
                </strong>{' '}
                枚專屬紀念印記（收集達成度 {percentage}%），特頒發本證書，以表彰其探勝歷覽之壯舉，並正式授封尊榮頭銜：
              </p>

              {/* Honor Rank Crest */}
              <div className="my-3 p-3 bg-gradient-to-r from-amber-100 via-amber-200/50 to-amber-100 border border-amber-600/40 rounded-xl w-full max-w-xs shadow-sm">
                <span className="text-[10px] font-mono tracking-wider text-amber-800 uppercase">
                  HONORARY EXPLORER RANK
                </span>
                <div className="text-xl sm:text-2xl font-black font-serif text-amber-950 tracking-wider">
                  {rank.title}
                </div>
                <div className="text-xs font-serif text-amber-800">{rank.subtitle}</div>
              </div>

              {/* Official Seal and Sign-off */}
              <div className="w-full flex items-end justify-between mt-6 pt-4 border-t border-amber-600/30 text-left">
                <div>
                  <div className="text-[11px] font-serif text-amber-900 font-bold">
                    證書編號：<span className="font-mono">{certNumber}</span>
                  </div>
                  <div className="text-[11px] font-serif text-amber-800">
                    頒授日期：{dateStr}
                  </div>
                  <div className="text-[10px] font-serif text-amber-700/80 mt-1">
                    臺灣觀光百大景點巡禮認證委員會
                  </div>
                </div>

                {/* Vermilion Stamp Seal Graphic */}
                <div className="w-20 h-20 sm:w-22 sm:h-22 rounded-xl border-4 border-double border-red-700 bg-red-100/30 flex flex-col items-center justify-center text-red-700 p-1 transform rotate-[-4deg] shadow-sm">
                  <span className="text-[8px] font-serif tracking-widest text-red-800">臺灣觀光局</span>
                  <span className="text-xs font-black font-serif tracking-wider text-red-700">
                    巡禮認證
                  </span>
                  <span className="text-[8px] font-serif text-red-800">之印</span>
                  <span className="text-[7px] font-mono text-red-600/80">FORMOSA</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-xs text-slate-400 no-print">
          <span>提示：點擊旅人姓名可進行自定義編輯</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            返回
          </button>
        </div>
      </div>
    </div>
  );
}
