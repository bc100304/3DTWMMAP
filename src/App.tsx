import React, { useState, useEffect } from 'react';
import TaiwanMap3D from './components/TaiwanMap3D';
import StampModal from './components/StampModal';
import PassportView from './components/PassportView';
import ItineraryModal from './components/ItineraryModal';
import CertificateView from './components/CertificateView';
import { ALL_SPOTS } from './data/spotsData';
import { Spot, Region, Category, LightingMode, ViewMode, StampRecord } from './types';
import { getStoredStamps, saveStamp, removeStamp, getExplorerRank } from './utils/storage';
import { playUiClick } from './utils/audio';
import {
  BookOpen,
  Award,
  Compass,
  Search,
  Sparkles,
  MapPin,
  ChevronDown,
  ChevronUp,
  Layers,
  Trees,
  Palmtree,
  Landmark as LandmarkIcon,
  Tent,
  Coffee,
  CheckCircle2,
  Shuffle,
} from 'lucide-react';

export default function App() {
  const [spots] = useState<Spot[]>(ALL_SPOTS);
  const [stamps, setStamps] = useState<Record<string, StampRecord>>({});
  const [selectedSpot, setSelectedSpot] = useState<Spot | null>(null);

  // Filters & View States
  const [selectedRegion, setSelectedRegion] = useState<Region>('全部');
  const [selectedCategory, setSelectedCategory] = useState<Category | 'all'>('all');
  const [lightingMode, setLightingMode] = useState<LightingMode>('day');
  const [viewMode, setViewMode] = useState<ViewMode>('3d');

  // Modals & Drawers
  const [isPassportOpen, setIsPassportOpen] = useState(false);
  const [isItineraryOpen, setIsItineraryOpen] = useState(false);
  const [isCertificateOpen, setIsCertificateOpen] = useState(false);
  const [isDockCollapsed, setIsDockCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  // Load stamps on mount; if completely empty, pre-seed Taipei 101 as a welcoming first stamp!
  useEffect(() => {
    let saved = getStoredStamps();
    if (Object.keys(saved).length === 0) {
      // Welcome seed stamp: Taipei 101
      const initial = saveStamp('TW-NOR-01');
      saved = { 'TW-NOR-01': initial };
    }
    setStamps(saved);
  }, []);

  const handlePerformStamp = (spotId: string) => {
    const record = saveStamp(spotId);
    setStamps((prev) => ({
      ...prev,
      [spotId]: record,
    }));
  };

  const handleResetStamp = (spotId: string) => {
    removeStamp(spotId);
    setStamps((prev) => {
      const next = { ...prev };
      delete next[spotId];
      return next;
    });
  };

  const stampedCount = Object.keys(stamps).length;
  const currentRank = getExplorerRank(stampedCount);

  // Quick Random Spot Discovery
  const handleRandomSpot = () => {
    playUiClick();
    const randomIndex = Math.floor(Math.random() * spots.length);
    const chosen = spots[randomIndex];
    setSelectedSpot(chosen);
  };

  // Search Results
  const searchResults = searchQuery.trim()
    ? spots
        .filter(
          (s) =>
            s.name.includes(searchQuery.trim()) ||
            s.englishName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            s.id.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .slice(0, 6)
    : [];

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* ======================================================== */}
      {/* TOP BAR CONTRACT: Brand, Nav links, 1 Primary Action */}
      {/* ======================================================== */}
      <header className="h-14 sm:h-16 px-4 sm:px-6 border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md flex items-center justify-between gap-4 z-20 shrink-0">
        {/* Zone 1: Single text wordmark */}
        <div className="flex items-center gap-2.5 whitespace-nowrap shrink-0">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-rose-600 via-amber-500 to-sky-500 p-0.5 flex items-center justify-center shadow-md">
            <div className="w-full h-full bg-slate-950 rounded-[7px] flex items-center justify-center text-amber-400 font-serif font-black text-xs">
              臺
            </div>
          </div>
          <div>
            <h1 className="text-sm sm:text-base font-black tracking-wide text-white">
              台灣 3D 旅遊導覽與觀光集章冊
            </h1>
            <p className="text-[10px] text-slate-400 font-mono hidden md:block">
              TAIWAN 3D TRAVEL GUIDE & STAMP PASSPORT
            </p>
          </div>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-300">
          <button
            onClick={() => {
              playUiClick();
              setIsPassportOpen(false);
              setIsItineraryOpen(false);
              setIsCertificateOpen(false);
            }}
            className="hover:text-white transition-colors cursor-pointer whitespace-nowrap"
          >
            3D 互動地圖
          </button>
          <button
            onClick={() => {
              playUiClick();
              setIsPassportOpen(true);
            }}
            className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer whitespace-nowrap"
          >
            <BookOpen className="w-3.5 h-3.5 text-amber-400" />
            <span>集章護照</span>
            <span className="font-mono text-[10px] bg-slate-800 text-amber-300 px-1.5 py-0.2 rounded font-bold">
              {stampedCount}/100
            </span>
          </button>
          <button
            onClick={() => {
              playUiClick();
              setIsItineraryOpen(true);
            }}
            className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer whitespace-nowrap"
          >
            <Compass className="w-3.5 h-3.5 text-sky-400" />
            <span>行程規劃</span>
          </button>
          <button
            onClick={() => {
              playUiClick();
              setIsCertificateOpen(true);
            }}
            className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer whitespace-nowrap"
          >
            <Award className="w-3.5 h-3.5 text-amber-400" />
            <span>成就證書</span>
            <span className="text-[10px] text-amber-400/90 hidden lg:inline">
              ({currentRank.title})
            </span>
          </button>
        </nav>

        {/* Zone 3: 1 Primary CTA Button + Quick Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleRandomSpot}
            title="隨選探索一個台灣秘境"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-slate-850 hover:bg-slate-800 text-slate-200 border border-slate-700/60 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
          >
            <Shuffle className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">隨選探索</span>
          </button>

          <button
            onClick={() => {
              playUiClick();
              setIsPassportOpen(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 rounded-lg shadow-md transition-all cursor-pointer whitespace-nowrap"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>開啟集章冊 ({stampedCount})</span>
          </button>
        </div>
      </header>

      {/* ======================================================== */}
      {/* MAIN 3D SCENE VIEWPORT (100% Full Immersion) */}
      {/* ======================================================== */}
      <main className="relative flex-1 w-full h-full overflow-hidden">
        <TaiwanMap3D
          spots={spots}
          selectedSpot={selectedSpot}
          selectedRegion={selectedRegion}
          selectedCategory={selectedCategory}
          stamps={stamps}
          onSelectSpot={(spot) => {
            playUiClick();
            setSelectedSpot(spot);
          }}
          lightingMode={lightingMode}
          onLightingChange={(mode) => {
            playUiClick();
            setLightingMode(mode);
          }}
          viewMode={viewMode}
          onViewModeChange={(mode) => {
            playUiClick();
            setViewMode(mode);
          }}
        />

        {/* Quick Search Floater (Top Center) */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 w-72 sm:w-80">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
              placeholder="搜尋百大景點（如：阿里山、101）..."
              className="w-full bg-slate-900/85 backdrop-blur-md border border-slate-700/60 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-400 shadow-xl focus:outline-none focus:border-sky-500 transition-all"
            />
          </div>

          {/* Search Dropdown Results */}
          {isSearchFocused && searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-slate-900/95 border border-slate-700 rounded-xl shadow-2xl overflow-hidden py-1 z-30">
              {searchResults.map((res) => (
                <div
                  key={res.id}
                  onMouseDown={() => {
                    setSelectedSpot(res);
                    setSearchQuery('');
                  }}
                  className="px-3 py-2 hover:bg-slate-800/80 cursor-pointer flex items-center justify-between text-xs transition-colors"
                >
                  <div>
                    <span className="font-bold text-white">{res.name}</span>
                    <span className="text-[10px] text-slate-400 ml-2 font-mono">{res.id}</span>
                  </div>
                  {stamps[res.id] ? (
                    <span className="text-[10px] text-rose-400 flex items-center gap-1 font-semibold">
                      <CheckCircle2 className="w-3 h-3" /> 已蓋章
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-500">{res.region}</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ======================================================== */}
        {/* COLLAPSIBLE UNIFIED BOTTOM CONTROL DOCK */}
        {/* Anti-Slop: Pinned Bottom-Center, Zero Viewport Occlusion */}
        {/* ======================================================== */}
        <div
          className={`absolute bottom-4 left-1/2 -translate-x-1/2 z-20 w-[94vw] max-w-[860px] transition-transform duration-300 ${
            isDockCollapsed ? 'translate-y-[calc(100%-28px)]' : 'translate-y-0'
          }`}
        >
          {/* Collapse / Expand Tab Toggle */}
          <div className="flex justify-center -mb-px">
            <button
              onClick={() => setIsDockCollapsed(!isDockCollapsed)}
              className="flex items-center gap-1 px-3 py-1 bg-slate-900/90 hover:bg-slate-800 text-slate-300 text-[11px] font-semibold rounded-t-lg border-t border-x border-slate-700/70 shadow-lg cursor-pointer transition-colors"
            >
              {isDockCollapsed ? (
                <>
                  <ChevronUp className="w-3.5 h-3.5" />
                  <span>展開控制選單</span>
                </>
              ) : (
                <>
                  <ChevronDown className="w-3.5 h-3.5" />
                  <span>隱藏控制列（沈浸全景）</span>
                </>
              )}
            </button>
          </div>

          {/* Main Glass Dock */}
          <div className="bg-slate-900/90 border border-slate-700/70 rounded-2xl p-3 sm:p-4 shadow-2xl backdrop-blur-md flex flex-col gap-2.5">
            {/* Row 1: Region Filters */}
            <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 sm:pb-0">
              <span className="text-[11px] font-bold text-slate-400 shrink-0 uppercase tracking-wider">
                區域篩選
              </span>
              <div className="flex items-center gap-1.5 overflow-x-auto">
                {(['全部', '北部', '中部', '南部', '東部', '離島'] as Region[]).map((reg) => (
                  <button
                    key={reg}
                    onClick={() => {
                      playUiClick();
                      setSelectedRegion(reg);
                    }}
                    className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                      selectedRegion === reg
                        ? 'bg-sky-600 text-white shadow-sm'
                        : 'bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-750'
                    }`}
                  >
                    {reg}
                  </button>
                ))}
              </div>
            </div>

            {/* Row 2: Category 3D Landmark Shape Filters */}
            <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-800/80 overflow-x-auto">
              <span className="text-[11px] font-bold text-slate-400 shrink-0 uppercase tracking-wider">
                3D 地標造型
              </span>
              <div className="flex items-center gap-1.5 overflow-x-auto">
                <button
                  onClick={() => {
                    playUiClick();
                    setSelectedCategory('all');
                  }}
                  className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                    selectedCategory === 'all'
                      ? 'bg-slate-700 text-white font-bold'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  全部造型
                </button>
                <button
                  onClick={() => {
                    playUiClick();
                    setSelectedCategory('landmark');
                  }}
                  title="休閒樂園：彩色摩天輪"
                  className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                    selectedCategory === 'landmark'
                      ? 'bg-amber-600 text-white font-bold'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <LandmarkIcon className="w-3.5 h-3.5 text-amber-400" />
                  <span>休閒樂園（摩天輪）</span>
                </button>
                <button
                  onClick={() => {
                    playUiClick();
                    setSelectedCategory('nature');
                  }}
                  title="壯麗自然：三角錐山"
                  className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                    selectedCategory === 'nature'
                      ? 'bg-emerald-600 text-white font-bold'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <Trees className="w-3.5 h-3.5 text-emerald-400" />
                  <span>壯麗自然（雙色錐山）</span>
                </button>
                <button
                  onClick={() => {
                    playUiClick();
                    setSelectedCategory('culture');
                  }}
                  title="人文古蹟：美濃紙傘"
                  className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                    selectedCategory === 'culture'
                      ? 'bg-rose-600 text-white font-bold'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <Tent className="w-3.5 h-3.5 text-rose-400" />
                  <span>人文古蹟（美濃紙傘）</span>
                </button>
                <button
                  onClick={() => {
                    playUiClick();
                    setSelectedCategory('food');
                  }}
                  title="夜市美食：黃色玉米"
                  className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                    selectedCategory === 'food'
                      ? 'bg-yellow-600 text-white font-bold'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <Coffee className="w-3.5 h-3.5 text-yellow-400" />
                  <span>夜市美食（黃金玉米）</span>
                </button>
                <button
                  onClick={() => {
                    playUiClick();
                    setSelectedCategory('coast');
                  }}
                  title="海岸海島：椰子樹"
                  className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                    selectedCategory === 'coast'
                      ? 'bg-teal-600 text-white font-bold'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <Palmtree className="w-3.5 h-3.5 text-teal-400" />
                  <span>海岸海島（椰子樹）</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* ======================================================== */}
      {/* MODALS */}
      {/* ======================================================== */}
      {/* Spot Detail & Heavy Stamp Modal */}
      {selectedSpot && (
        <StampModal
          spot={selectedSpot}
          stampRecord={stamps[selectedSpot.id]}
          onClose={() => setSelectedSpot(null)}
          onStamp={handlePerformStamp}
          onResetStamp={handleResetStamp}
        />
      )}

      {/* Full Passport View */}
      {isPassportOpen && (
        <PassportView
          spots={spots}
          stamps={stamps}
          onSelectSpot={(spot) => {
            playUiClick();
            setSelectedSpot(spot);
          }}
          onOpenItinerary={() => {
            playUiClick();
            setIsPassportOpen(false);
            setIsItineraryOpen(true);
          }}
          onOpenCertificate={() => {
            playUiClick();
            setIsPassportOpen(false);
            setIsCertificateOpen(true);
          }}
          onClose={() => setIsPassportOpen(false)}
        />
      )}

      {/* Itinerary Planner Modal */}
      {isItineraryOpen && (
        <ItineraryModal
          spots={spots}
          stamps={stamps}
          onSelectSpot={(spot) => {
            playUiClick();
            setSelectedSpot(spot);
          }}
          onClose={() => setIsItineraryOpen(false)}
        />
      )}

      {/* Achievement Certificate Modal */}
      {isCertificateOpen && (
        <CertificateView
          stamps={stamps}
          totalSpots={spots.length}
          onClose={() => setIsCertificateOpen(false)}
        />
      )}
    </div>
  );
}
