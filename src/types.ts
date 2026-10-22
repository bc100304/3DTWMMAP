export type Region = '全部' | '北部' | '中部' | '南部' | '東部' | '離島';

export type Category = 'nature' | 'coast' | 'culture' | 'landmark' | 'food';

export interface Spot {
  id: string; // e.g. TW-NOR-01
  name: string;
  englishName: string;
  region: '北部' | '中部' | '南部' | '東部' | '離島';
  category: Category;
  lat: number;
  lng: number;
  elevation: string;
  rating: number;
  reviews: number;
  description: string;
  highlights: string[];
  bestTime: string;
  food: string[];
  aiTips: string;
  imageUrl: string;
}

export interface StampRecord {
  spotId: string;
  stampedAt: string; // ISO date string
  formattedDate: string;
  stampNumber: string;
}

export type LightingMode = 'day' | 'sunset' | 'night';

export type ViewMode = '3d' | '2d';

export interface ExplorerRank {
  title: string;
  subtitle: string;
  min: number;
  max: number;
  badgeColor: string;
  nextThreshold: number;
}
