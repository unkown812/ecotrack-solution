export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  eco_bucks: number;
  level: 1 | 2 | 3 | 4;
  total_co2: number;
  goals: {
    monthly_co2_target: number;
  };
  completedTips?: string[];
}

export type TravelMode = "car" | "bus" | "train" | "walk-bike";

export interface TripLog {
  id: string;
  userId: string;
  date: string;
  mode: TravelMode;
  distance: number;
  duration: number;
  co2_emission: number;
  routeCoordinates: { lat: number; lng: number }[];
  createdAt: string;
}

export interface MealLog {
  id: string;
  userId: string;
  date: string;
  type: "veg" | "non-veg";
  description: string;
  co2_emission: number;
  image_url: string | null;
  createdAt: string;
}

export interface EnergyLog {
  id: string;
  userId: string;
  month: string;
  year: number;
  electricity_bill: number;
  gas_bill: number;
  co2_emission: number;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  suggestedTipId?: string;
}

export interface AIInsight {
  summary: string;
  tips: string[];
  generatedAt: string;
  isFallback?: boolean;
}

export interface RewardItem {
  id: string;
  title: string;
  cost: number;
  description: string;
  provider: string;
  category: "transport" | "energy" | "lifestyle" | "food";
  couponCode?: string;
  redeemedAt?: string;
}
