import React, { useState, useMemo } from 'react';
import { Spot, StampRecord } from '../types';
import {
  Compass,
  Calendar,
  MapPin,
  Clock,
  Sparkles,
  ArrowRight,
  ChevronRight,
  Utensils,
  X,
  Car,
  CheckCircle2,
  BookmarkCheck,
} from 'lucide-react';

interface ItineraryModalProps {
  spots: Spot[];
  stamps: Record<string, StampRecord>;
  onSelectSpot: (spot: Spot) => void;
  onClose: () => void;
}

interface DayRoute {
  day: number;
  title: string;
  region: string;
  description: string;
  spots: Spot[];
  diningTip: string;
  driveTime: string;
}

export default function ItineraryModal({
  spots,
  stamps,
  onSelectSpot,
  onClose,
}: ItineraryModalProps) {
  const [activeTab, setActiveTab] = useState<'personalized' | 'classic'>('personalized');

  // Stamped spots
  const collectedSpots = useMemo(() => {
    return spots.filter((s) => Boolean(stamps[s.id]));
  }, [spots, stamps]);

  // Personalized Itinerary generated from user's collected stamps
  const personalizedDays: DayRoute[] = useMemo(() => {
    if (collectedSpots.length === 0) return [];

    // Group collected spots by region in a natural circular travel order:
    // 北部 -> 東部 -> 南部 -> 中部 -> 離島
    const order = ['北部', '東部', '南部', '中部', '離島'];
    const days: DayRoute[] = [];
    let dayCount = 1;

    order.forEach((region) => {
      const regSpots = collectedSpots.filter((s) => s.region === region);
      if (regSpots.length > 0) {
        // Chunk into groups of 3-4 spots per day
        for (let i = 0; i < regSpots.length; i += 3) {
          const daySpots = regSpots.slice(i, i + 3);
          days.push({
            day: dayCount++,
            title: `${region}探索巡禮 ${daySpots.map((s) => s.name).join(' · ')}`,
            region: region,
            description: `連結您在${region}親自踏訪收集的 ${daySpots.length} 處精選勝景，享受順遊慢活節奏。`,
            spots: daySpots,
            diningTip: daySpots[0]?.food?.[0] || '在地老街特色美饌',
            driveTime: `約 ${1.5 + daySpots.length * 0.5} 小時風景車程`,
          });
        }
      }
    });

    return days;
  }, [collectedSpots]);

  // Classic Master 7-Day Taiwan Circular Slow Travel Route
  const classicDays: DayRoute[] = useMemo(() => {
    const findSpot = (id: string) => spots.find((s) => s.id === id);

    return [
      {
        day: 1,
        title: '台北都會與山城黃金傳奇',
        region: '北部',
        description: '從世界高樓俯瞰台北天際線，午後登上九份石階茶樓，入夜漫步百年大稻埕迪化街。',
        spots: [findSpot('TW-NOR-01'), findSpot('TW-NOR-02'), findSpot('TW-NOR-07')].filter(Boolean) as Spot[],
        diningTip: '鼎泰豐小籠包、九份賴阿婆手作芋圓、大稻埕百年林合發油飯',
        driveTime: '約 1.5 小時捷運與公車',
      },
      {
        day: 2,
        title: '東北角奇岩海岬與蘭陽溫泉',
        region: '北部',
        description: '讚嘆野柳女王頭地質奇景，跨越蘭陽平原登上單面山博物館，夜晚浸泡礁溪美人湯足浴。',
        spots: [findSpot('TW-NOR-03'), findSpot('TW-NOR-19'), findSpot('TW-NOR-08')].filter(Boolean) as Spot[],
        diningTip: '野柳現蒸清甜萬里蟹、宜蘭柯氏蔥油餅、魏姐包心粉圓',
        driveTime: '約 2 小時濱海公路',
      },
      {
        day: 3,
        title: '大理石神鬼奇峽與蘇花太平洋',
        region: '東部',
        description: '穿越清水斷崖垂直峭壁，走入太魯閣燕子口壯麗壺穴峽谷，黃昏在七星潭疊石聽浪。',
        spots: [findSpot('TW-EAS-03'), findSpot('TW-EAS-01'), findSpot('TW-EAS-02')].filter(Boolean) as Spot[],
        diningTip: '新城佳興檸檬汁、東大門夜市烤玉米、原野牧場海景咖啡',
        driveTime: '約 2.5 小時蘇花改景觀公路',
      },
      {
        day: 4,
        title: '縱谷翠綠天堂路與太平洋曙光',
        region: '東部',
        description: '騎行池上伯朗大道黃金稻浪，登上鹿野高台俯瞰花東縱谷，跨越三仙台八拱橋迎浪。',
        spots: [findSpot('TW-EAS-04'), findSpot('TW-EAS-07'), findSpot('TW-EAS-05')].filter(Boolean) as Spot[],
        diningTip: '池上全美行鐵路木盒便當、大池現煎香酥豆包、成功旗魚生魚片',
        driveTime: '約 2 小時台9線與台11線',
      },
      {
        day: 5,
        title: '國境之南鵝鑾鼻與海生館奇境',
        region: '南部',
        description: '探訪台灣最南端武裝白色燈塔，漫步龍磐崩崖草原，走入全景海底隧道與白鯨同游。',
        spots: [findSpot('TW-SOU-04'), findSpot('TW-SOU-06'), findSpot('TW-SOU-10')].filter(Boolean) as Spot[],
        diningTip: '後壁湖厚切鮮甜生魚片、車城福安宮古早味綠豆蒜、旗津炭烤小卷',
        driveTime: '約 2.5 小時南迴公路',
      },
      {
        day: 6,
        title: '府城三百年文化古都與大港藝術',
        region: '南部',
        description: '登臨荷蘭安平古堡與神話純白奇美博物館，造訪高雄駁二文創倉庫與大港橋旋轉秀。',
        spots: [findSpot('TW-SOU-03'), findSpot('TW-SOU-02'), findSpot('TW-SOU-05')].filter(Boolean) as Spot[],
        diningTip: '安平周氏現炸蝦捲、保安路溫體牛肉湯、鹽埕區鴨肉珍肉燥飯',
        driveTime: '約 1.5 小時國道一號',
      },
      {
        day: 7,
        title: '日月潭湖光山色與鹿港古意老街',
        region: '中部',
        description: '清晨騎行全球十大最美向山水上自行車道，午後漫步鹿港九曲巷與古蹟天后宮品味糕餅。',
        spots: [findSpot('TW-CEN-01'), findSpot('TW-CEN-05'), findSpot('TW-CEN-06')].filter(Boolean) as Spot[],
        diningTip: '玄光寺金盆阿婆茶葉蛋、鹿港老龍師現蒸肉包、逢甲明倫蛋餅',
        driveTime: '約 2 小時中投公路',
      },
    ];
  }, [spots]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden text-slate-100">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-950/70 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/20 border border-sky-500/30 flex items-center justify-center text-sky-400">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-white">智慧環島行程規劃</h2>
              <p className="text-xs text-slate-400">
                串聯台灣必訪勝景，規劃最佳動線、行車時長與必吃名饌
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-full transition-colors cursor-pointer"
            title="關閉"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="p-3 bg-slate-950/40 border-b border-slate-800 flex items-center gap-2">
          <button
            onClick={() => setActiveTab('personalized')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
              activeTab === 'personalized'
                ? 'bg-sky-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <BookmarkCheck className="w-4 h-4" />
            個人已收集專屬路線 ({collectedSpots.length} 景點)
          </button>
          <button
            onClick={() => setActiveTab('classic')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
              activeTab === 'classic'
                ? 'bg-sky-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            2026 寶島環島慢活經典 7 日行
          </button>
        </div>

        {/* Itinerary Body Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {activeTab === 'personalized' ? (
            collectedSpots.length === 0 ? (
              <div className="py-16 text-center">
                <Compass className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <h3 className="text-base font-bold text-slate-300">尚未收集任何紀念章</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
                  在地圖上點擊任何地標並按下「立即蓋上紀念章」，系統將為您自動智慧串聯個人化環島旅遊路線！
                </p>
                <button
                  onClick={() => setActiveTab('classic')}
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded-lg cursor-pointer transition-colors"
                >
                  先參考經典 7 日行程 →
                </button>
              </div>
            ) : (
              personalizedDays.map((dayRoute) => (
                <div
                  key={dayRoute.day}
                  className="bg-slate-800/40 border border-slate-700/60 rounded-xl p-4 sm:p-5 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold bg-sky-950 text-sky-400 px-2.5 py-0.5 rounded border border-sky-800">
                        DAY {dayRoute.day}
                      </span>
                      <span className="text-xs text-slate-400">·</span>
                      <span className="text-xs font-semibold text-slate-300">
                        {dayRoute.region}地區
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
                      <Car className="w-3.5 h-3.5 text-sky-400" />
                      <span>{dayRoute.driveTime}</span>
                    </div>
                  </div>

                  <h3 className="text-sm sm:text-base font-bold text-white tracking-wide">
                    {dayRoute.title}
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">{dayRoute.description}</p>

                  {/* Spot Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                    {dayRoute.spots.map((spot, i) => (
                      <div
                        key={spot.id}
                        onClick={() => onSelectSpot(spot)}
                        className="flex items-center gap-2.5 p-2 rounded-lg bg-slate-900/80 border border-slate-700/70 hover:border-sky-500 transition-colors cursor-pointer group"
                      >
                        <div className="w-6 h-6 rounded-md bg-rose-950/60 border border-rose-500/40 flex items-center justify-center text-rose-400 shrink-0 text-xs font-mono font-bold">
                          {i + 1}
                        </div>
                        <div className="overflow-hidden">
                          <p className="text-xs font-bold text-white group-hover:text-sky-300 truncate">
                            {spot.name}
                          </p>
                          <p className="text-[10px] text-slate-400 truncate">{spot.elevation}</p>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-500 ml-auto group-hover:text-sky-400 shrink-0" />
                      </div>
                    ))}
                  </div>

                  {/* Dining Note */}
                  <div className="flex items-center gap-2 text-xs text-amber-300/90 pt-2 border-t border-slate-700/40">
                    <Utensils className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>推薦在地美饌：{dayRoute.diningTip}</span>
                  </div>
                </div>
              ))
            )
          ) : (
            classicDays.map((dayRoute) => (
              <div
                key={dayRoute.day}
                className="bg-slate-800/40 border border-slate-700/60 rounded-xl p-4 sm:p-5 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold bg-amber-950 text-amber-400 px-2.5 py-0.5 rounded border border-amber-800">
                      DAY {dayRoute.day}
                    </span>
                    <span className="text-xs text-slate-400">·</span>
                    <span className="text-xs font-semibold text-slate-300">{dayRoute.region}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
                    <Car className="w-3.5 h-3.5 text-amber-400" />
                    <span>{dayRoute.driveTime}</span>
                  </div>
                </div>

                <h3 className="text-sm sm:text-base font-bold text-white tracking-wide">
                  {dayRoute.title}
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">{dayRoute.description}</p>

                {/* Spot Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                  {dayRoute.spots.map((spot, i) => {
                    const isStamped = Boolean(stamps[spot.id]);
                    return (
                      <div
                        key={spot.id}
                        onClick={() => onSelectSpot(spot)}
                        className="flex items-center gap-2.5 p-2 rounded-lg bg-slate-900/80 border border-slate-700/70 hover:border-amber-400 transition-colors cursor-pointer group"
                      >
                        <div
                          className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-mono font-bold shrink-0 ${
                            isStamped
                              ? 'bg-rose-950 text-rose-400 border border-rose-500'
                              : 'bg-slate-800 text-slate-400 border border-slate-700'
                          }`}
                        >
                          {i + 1}
                        </div>
                        <div className="overflow-hidden">
                          <p className="text-xs font-bold text-white group-hover:text-amber-300 truncate">
                            {spot.name}
                          </p>
                          <p className="text-[10px] text-slate-400 truncate">
                            {isStamped ? '✓ 已蓋紀念章' : '待造訪蓋章'}
                          </p>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-500 ml-auto group-hover:text-amber-400 shrink-0" />
                      </div>
                    );
                  })}
                </div>

                {/* Dining Note */}
                <div className="flex items-center gap-2 text-xs text-amber-300/90 pt-2 border-t border-slate-700/40">
                  <Utensils className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>行家必吃美味：{dayRoute.diningTip}</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-xs text-slate-400">
          <span>共收錄 100 處觀光署評選熱門勝景，可自由調配天數</span>
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
