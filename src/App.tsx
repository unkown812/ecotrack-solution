import React, { useState, useEffect } from "react";
import {
  Navigation,
  Camera,
  Home,
  Gift,
  Award,
  Sparkles,
  Leaf,
  User,
  Activity,
  Trash2,
  TrendingDown,
  Bot,
  Lightbulb,
} from "lucide-react";
import { UserProfile, TripLog, MealLog, EnergyLog, RewardItem, TravelMode } from "./types";
import {
  calculateTravelCo2,
  calculateEnergyCo2,
  calculateTripEcoBucks,
  determineEcoLevel,
  REWARDS_CATALOG,
  EMISSION_FACTORS,
} from "./utils";
import { useAuth } from "./hooks/useAuth";
import MetricCard from "./components/MetricCard";
import TravelTracker from "./components/TravelTracker";
import MealScanner from "./components/MealScanner";
import EnergyLogger from "./components/EnergyLogger";
import EcoInsights from "./components/EcoInsights";
import RewardsStore from "./components/RewardsStore";
import DashboardCharts from "./components/DashboardCharts";
import Chatbot from "./components/Chatbot";
import LoginScreen from "./components/LoginScreen";
import RecommendationsScreen from "./components/RecommendationsScreen";

const INITIAL_TRIPS: TripLog[] = [
  {
    id: "seed-t1",
    userId: "u123",
    date: new Date(Date.now() - 48 * 3600 * 1000).toISOString().split("T")[0],
    distance: 12.0,
    mode: "bus",
    duration: 2400,
    co2_emission: 0.96,
    routeCoordinates: [
      { lat: 19.076, lng: 72.877 },
      { lat: 19.096, lng: 72.867 },
    ],
    createdAt: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
  },
  {
    id: "seed-t2",
    userId: "u123",
    date: new Date(Date.now() - 12 * 3600 * 1000).toISOString().split("T")[0],
    distance: 4.5,
    mode: "walk-bike",
    duration: 1800,
    co2_emission: 0,
    routeCoordinates: [
      { lat: 19.076, lng: 72.877 },
      { lat: 19.086, lng: 72.887 },
    ],
    createdAt: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
  },
];

const INITIAL_MEALS: MealLog[] = [
  {
    id: "seed-m1",
    userId: "u123",
    date: new Date(Date.now() - 36 * 3600 * 1000).toISOString().split("T")[0],
    type: "veg",
    description: "Vegetable dumplings with rice — light plant-based meal",
    co2_emission: EMISSION_FACTORS.food.veg,
    image_url: null,
    createdAt: new Date(Date.now() - 36 * 3600 * 1000).toISOString(),
  },
];

const INITIAL_ENERGY: EnergyLog[] = [
  {
    id: "seed-e1",
    userId: "u123",
    month: new Date().toLocaleString("en-US", { month: "long" }),
    year: new Date().getFullYear(),
    electricity_bill: 1500,
    gas_bill: 700,
    co2_emission: (1500 * EMISSION_FACTORS.energy.electricity_per_inr) + (700 * EMISSION_FACTORS.energy.gas_per_inr),
    createdAt: new Date(Date.now() - 72 * 3600 * 1000).toISOString(),
  },
];

const LEVEL_LABELS: Record<number, string> = {
  1: "EcoStarter",
  2: "Green Hero",
  3: "Sustainable Star",
  4: "Earth Guardian",
};

type Tab = "dashboard" | "travel" | "food" | "energy" | "rewards" | "chatbot" | "tips";

const TAB_TITLES: Record<string, string> = {
  dashboard: "Dashboard — MahiKosh Carbon Footprint Tracker",
  travel: "Travel CO₂ Tracker — MahiKosh Carbon Footprint",
  food: "AI Meal Scanner — MahiKosh Carbon Footprint",
  energy: "Home Energy Logger — MahiKosh Carbon Footprint",
  rewards: "EcoBucks Rewards Marketplace — MahiKosh",
  chatbot: "EcoBot AI Sustainability Assistant — MahiKosh",
  tips: "Eco Tips & Sustainability Guide — MahiKosh",
};

export default function App() {
  const { user, loading: authLoading, isAvailable: authAvailable } = useAuth();

  const [profile, setProfile] = useState<UserProfile>({
    uid: "u123",
    email: "mrunaljogane@gmail.com",
    displayName: "Mrunal Jogane",
    eco_bucks: 110,
    level: 1,
    total_co2: (0.96 + 0 + EMISSION_FACTORS.food.veg + (1500 * 0.005 + 700 * 0.0025)),
    goals: {
      monthly_co2_target: 200,
    },
  });

  const [trips, setTrips] = useState<TripLog[]>([]);
  const [meals, setMeals] = useState<MealLog[]>([]);
  const [energyLogs, setEnergyLogs] = useState<EnergyLog[]>([]);
  const [redeemedRewards, setRedeemedRewards] = useState<RewardItem[]>([]);
  const [completedTips, setCompletedTips] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [editName, setEditName] = useState("");
  const [editGoal, setEditGoal] = useState("");

  useEffect(() => {
    document.title = TAB_TITLES[activeTab] || "MahiKosh — AI Carbon Footprint Tracker";
  }, [activeTab]);

  useEffect(() => {
    try {
      const savedProfile = localStorage.getItem("MahiKosh_profile");
      const savedTrips = localStorage.getItem("MahiKosh_trips");
      const savedMeals = localStorage.getItem("MahiKosh_meals");
      const savedEnergy = localStorage.getItem("MahiKosh_energy");
      const savedRewards = localStorage.getItem("MahiKosh_rewards");

      if (savedProfile) setProfile(JSON.parse(savedProfile));
      if (savedTrips) setTrips(JSON.parse(savedTrips));
      else { setTrips(INITIAL_TRIPS); localStorage.setItem("MahiKosh_trips", JSON.stringify(INITIAL_TRIPS)); }
      if (savedMeals) setMeals(JSON.parse(savedMeals));
      else { setMeals(INITIAL_MEALS); localStorage.setItem("MahiKosh_meals", JSON.stringify(INITIAL_MEALS)); }
      if (savedEnergy) setEnergyLogs(JSON.parse(savedEnergy));
      else { setEnergyLogs(INITIAL_ENERGY); localStorage.setItem("MahiKosh_energy", JSON.stringify(INITIAL_ENERGY)); }
      if (savedRewards) setRedeemedRewards(JSON.parse(savedRewards));
      const savedTips = localStorage.getItem("MahiKosh_completed_tips");
      if (savedTips) setCompletedTips(JSON.parse(savedTips));
    } catch (e) {
      console.error("Failed to load saved state:", e);
    }
  }, []);

  const updateLocalStorageAndState = (
    newTrips: TripLog[],
    newMeals: MealLog[],
    newEnergy: EnergyLog[],
    newRewards: RewardItem[],
    ecoBucksModifier = 0,
    directOverrideBucks?: number
  ) => {
    const tripSum = newTrips.reduce((sum, t) => sum + t.co2_emission, 0);
    const mealSum = newMeals.reduce((sum, m) => sum + m.co2_emission, 0);
    const energySum = newEnergy.reduce((sum, e) => sum + e.co2_emission, 0);
    const totalCarbon = tripSum + mealSum + energySum;

    let finalEcoBucks = directOverrideBucks !== undefined ? directOverrideBucks : profile.eco_bucks + ecoBucksModifier;
    if (finalEcoBucks < 0) finalEcoBucks = 0;

    const finalLevel = determineEcoLevel(finalEcoBucks);

    const updatedProfile = {
      ...profile,
      total_co2: Number(totalCarbon.toFixed(2)),
      eco_bucks: finalEcoBucks,
      level: finalLevel,
    };

    setProfile(updatedProfile);
    setTrips(newTrips);
    setMeals(newMeals);
    setEnergyLogs(newEnergy);
    setRedeemedRewards(newRewards);

    localStorage.setItem("MahiKosh_profile", JSON.stringify(updatedProfile));
    localStorage.setItem("MahiKosh_trips", JSON.stringify(newTrips));
    localStorage.setItem("MahiKosh_meals", JSON.stringify(newMeals));
    localStorage.setItem("MahiKosh_energy", JSON.stringify(newEnergy));
    localStorage.setItem("MahiKosh_rewards", JSON.stringify(newRewards));
  };

  const handleAddTrip = (distance: number, mode: TravelMode, duration: number, routeCoordinates: { lat: number; lng: number }[]) => {
    const emission = calculateTravelCo2(mode, distance);
    const ecoBucksAwarded = calculateTripEcoBucks(mode, distance);

    const newTrip: TripLog = {
      id: `t-${Date.now()}`,
      userId: profile.uid,
      date: new Date().toISOString().split("T")[0],
      distance,
      mode,
      duration,
      co2_emission: Number(emission.toFixed(2)),
      routeCoordinates,
      createdAt: new Date().toISOString(),
    };

    updateLocalStorageAndState([newTrip, ...trips], meals, energyLogs, redeemedRewards, ecoBucksAwarded);
  };

  const handleDeleteTrip = (id: string) => {
    const target = trips.find(t => t.id === id);
    if (!target) return;
    const pointsToDeduct = -calculateTripEcoBucks(target.mode, target.distance);
    updateLocalStorageAndState(trips.filter(t => t.id !== id), meals, energyLogs, redeemedRewards, pointsToDeduct);
  };

  const handleAddMeal = (type: "veg" | "non-veg", description: string, co2: number) => {
    const pointsAwarded = type === "veg" ? 10 : 2;

    const newMeal: MealLog = {
      id: `m-${Date.now()}`,
      userId: profile.uid,
      date: new Date().toISOString().split("T")[0],
      type,
      description,
      co2_emission: Number(co2.toFixed(2)),
      image_url: null,
      createdAt: new Date().toISOString(),
    };

    updateLocalStorageAndState(trips, [newMeal, ...meals], energyLogs, redeemedRewards, pointsAwarded);
  };

  const handleDeleteMeal = (id: string) => {
    const target = meals.find(m => m.id === id);
    if (!target) return;
    const pointsToDeduct = target.type === "veg" ? -10 : -2;
    updateLocalStorageAndState(trips, meals.filter(m => m.id !== id), energyLogs, redeemedRewards, pointsToDeduct);
  };

  const handleAddEnergyLog = (month: string, year: number, electricity: number, gas: number) => {
    const emission = calculateEnergyCo2(electricity, gas);
    const pointsAwarded = 25;

    const newLog: EnergyLog = {
      id: `e-${Date.now()}`,
      userId: profile.uid,
      month,
      year,
      electricity_bill: electricity,
      gas_bill: gas,
      co2_emission: Number(emission.toFixed(2)),
      createdAt: new Date().toISOString(),
    };

    updateLocalStorageAndState(trips, meals, [newLog, ...energyLogs], redeemedRewards, pointsAwarded);
  };

  const handleDeleteEnergy = (id: string) => {
    updateLocalStorageAndState(trips, meals, energyLogs.filter(e => e.id !== id), redeemedRewards, -25);
  };

  const handleClaimBucks = (tipId: string, bucks: number) => {
    if (completedTips.includes(tipId)) return;
    const nextTips = [...completedTips, tipId];
    setCompletedTips(nextTips);
    localStorage.setItem("MahiKosh_completed_tips", JSON.stringify(nextTips));
    const updatedProfile = { ...profile, eco_bucks: profile.eco_bucks + bucks };
    setProfile(updatedProfile);
    localStorage.setItem("MahiKosh_profile", JSON.stringify(updatedProfile));
  };

  const handleRedeemReward = (rewardId: string, cost: number) => {
    const catalogItem = REWARDS_CATALOG.find(r => r.id === rewardId);
    if (!catalogItem || profile.eco_bucks < cost) return;

    const alpha = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const num = "0123456789";
    const getRandomStr = (src: string, len: number) => Array.from({ length: len }, () => src[Math.floor(Math.random() * src.length)]).join("");
    const couponCode = `ECO-${getRandomStr(alpha, 4)}-${getRandomStr(num, 4)}`;

    const redeemedItem: RewardItem = {
      ...catalogItem,
      couponCode,
      redeemedAt: new Date().toISOString(),
    };

    updateLocalStorageAndState(trips, meals, energyLogs, [...redeemedRewards, redeemedItem], -cost);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = {
      ...profile,
      displayName: editName.trim() || profile.displayName,
      goals: { monthly_co2_target: parseInt(editGoal) || profile.goals.monthly_co2_target },
    };
    setProfile(updated);
    localStorage.setItem("MahiKosh_profile", JSON.stringify(updated));
    setIsEditProfileOpen(false);
  };

  const handleOpenEditProfile = () => {
    setEditName(profile.displayName);
    setEditGoal(String(profile.goals.monthly_co2_target));
    setIsEditProfileOpen(true);
  };

  const handleResetApp = () => {
    if (confirm("Are you sure you want to delete all data? This cannot be undone.")) {
      localStorage.clear();
      setTrips([]);
      setMeals([]);
      setEnergyLogs([]);
      setRedeemedRewards([]);
      const defaultProfile: UserProfile = {
        uid: "u123",
        email: "mrunaljogane@gmail.com",
        displayName: "Mrunal Jogane",
        eco_bucks: 100,
        level: 1,
        total_co2: 0,
        goals: { monthly_co2_target: 200 },
      };
      setProfile(defaultProfile);
      localStorage.setItem("MahiKosh_profile", JSON.stringify(defaultProfile));
      setActiveTab("dashboard");
    }
  };

  const getLevelColor = (lvl: number) => {
    switch (lvl) {
      case 1: return "text-[#dac8b9] bg-stone-100 border-[#eaded4]";
      case 2: return "text-[#078a52] bg-[#84e7a5]/10 border-[#078a52]/30";
      case 3: return "text-[#0089ad] bg-[#3bd3fd]/10 border-[#0089ad]/30";
      case 4: return "text-[#43089f] bg-[#c1b0ff]/10 border-[#43089f]/30";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  const progressRatio = Math.min(100, (profile.total_co2 / profile.goals.monthly_co2_target) * 100);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (authAvailable && !user) {
    return <LoginScreen onAuthSuccess={() => {}} />;
  }

  return (
    <div className="min-h-screen bg-bg text-fg font-sans pb-16">
      <nav className="sticky top-0 z-50 bg-[#fff8f1]/95 backdrop-blur border-b border-border shadow-clay">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => setActiveTab("dashboard")}>
              <div className="w-9 h-9 bg-accent border-1.5 border-black rounded-xl shadow-hard-offset flex items-center justify-center text-white scale-90 sm:scale-100">
                <Leaf className="w-5 h-5 fill-white/20" />
              </div>
              <span className="font-display font-bold text-lg sm:text-xl tracking-tight text-fg">MahiKosh</span>
            </div>

            <div className="flex items-center gap-3 sm:gap-4">
              <div className={`hidden md:flex items-center gap-1.5 px-3 py-1 border rounded-full text-xs font-bold leading-none ${getLevelColor(profile.level)}`}>
                <Award className="w-3.5 h-3.5" />
                <span>Level {profile.level} — {LEVEL_LABELS[profile.level]}</span>
              </div>

              <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#fbbd41]/10 border border-[#fbbd41]/30 text-[#9d6a09] font-display font-bold text-xs sm:text-sm rounded-xl">
                <Sparkles className="w-4 h-4 fill-amber-300" />
                <span className="font-mono">{profile.eco_bucks}</span>
                <span className="hidden xs:inline text-[10px]">EcoBucks</span>
              </div>

              <button
                onClick={handleOpenEditProfile}
                className="flex items-center gap-2 p-1 bg-surface-warm/30 hover:bg-surface-warm/50 rounded-xl border border-border-soft transition-all"
                title="Edit profile"
              >
                <div className="w-8 h-8 rounded-lg bg-accent text-white font-display font-bold flex items-center justify-center text-xs">
                  {profile.displayName.charAt(0)}
                </div>
                <span className="hidden lg:inline text-xs font-bold text-fg pr-1">{profile.displayName}</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[#fff8f1] border border-border rounded-3xl p-6 shadow-clay relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-accent" />
          <div className="space-y-1">
            <h1 className="text-xl md:text-2xl font-bold font-display text-fg leading-tight">
              Hello, {profile.displayName}
            </h1>
            <p className="text-xs text-muted font-medium">
              Tracking your carbon footprint with precision. Every action counts.
            </p>
          </div>

          <div className="flex gap-2">
            <button onClick={handleOpenEditProfile} className="clay-btn-secondary px-4 py-2 text-xs font-bold">
              Profile Settings
            </button>
            <button
              onClick={handleResetApp}
              className="px-3 py-2 bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset</span>
            </button>
          </div>
        </div>

        {/* Mobile nav strip */}
        <div className="lg:hidden -mx-4 sm:-mx-6 px-4 sm:px-6 overflow-x-auto no-scrollbar mb-6">
          <div className="flex gap-2 pb-1">
            {([
              { id: "dashboard" as Tab, icon: <Activity className="w-3.5 h-3.5" />, label: "Dashboard" },
              { id: "travel" as Tab, icon: <Navigation className="w-3.5 h-3.5" />, label: "Travel" },
              { id: "food" as Tab, icon: <Camera className="w-3.5 h-3.5" />, label: "Meals" },
              { id: "energy" as Tab, icon: <Home className="w-3.5 h-3.5" />, label: "Energy" },
              { id: "rewards" as Tab, icon: <Gift className="w-3.5 h-3.5" />, label: "Rewards" },
              { id: "tips" as Tab, icon: <Lightbulb className="w-3.5 h-3.5" />, label: "Tips" },
              { id: "chatbot" as Tab, icon: <Bot className="w-3.5 h-3.5" />, label: "Chat" },
            ] as const).map(item => (
              <button key={item.id} onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all shrink-0 ${
                  activeTab === item.id
                    ? "bg-accent text-white border border-black shadow-hard-offset"
                    : "bg-surface text-fg-2 border border-border hover:bg-surface-warm/20"
                }`}
              >
                {item.icon} {item.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar - desktop only */}
          <div className="hidden lg:block col-span-1 space-y-6">
            <div className="clay-card p-4 space-y-1.5 bg-[#fff8f1]">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted font-display px-2 mb-2">Navigation</p>

              <button onClick={() => setActiveTab("dashboard")} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-left ${activeTab === "dashboard" ? "bg-accent text-white border border-black shadow-hard-offset" : "text-fg-2 hover:bg-surface-warm/20"}`}>
                <Activity className="w-4 h-4" /> Dashboard
              </button>
              <button onClick={() => setActiveTab("travel")} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-left ${activeTab === "travel" ? "bg-accent text-white border border-black shadow-hard-offset" : "text-fg-2 hover:bg-surface-warm/20"}`}>
                <Navigation className="w-4 h-4" /> Travel
              </button>
              <button onClick={() => setActiveTab("food")} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-left ${activeTab === "food" ? "bg-accent text-white border border-black shadow-hard-offset" : "text-fg-2 hover:bg-surface-warm/20"}`}>
                <Camera className="w-4 h-4" /> Meals
              </button>
              <button onClick={() => setActiveTab("energy")} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-left ${activeTab === "energy" ? "bg-accent text-white border border-black shadow-hard-offset" : "text-fg-2 hover:bg-surface-warm/20"}`}>
                <Home className="w-4 h-4" /> Energy
              </button>
              <button onClick={() => setActiveTab("rewards")} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-left ${activeTab === "rewards" ? "bg-accent text-white border border-black shadow-hard-offset" : "text-fg-2 hover:bg-surface-warm/20"}`}>
                <Gift className="w-4 h-4" /> Rewards
              </button>
              <button onClick={() => setActiveTab("tips")} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-left ${activeTab === "tips" ? "bg-accent text-white border border-black shadow-hard-offset" : "text-fg-2 hover:bg-surface-warm/20"}`}>
                <Lightbulb className="w-4 h-4" /> Eco Tips
              </button>
              <button onClick={() => setActiveTab("chatbot")} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-left ${activeTab === "chatbot" ? "bg-accent text-white border border-black shadow-hard-offset" : "text-fg-2 hover:bg-surface-warm/20"}`}>
                <Bot className="w-4 h-4" /> EcoBot Chat
              </button>
            </div>

            <div className="clay-card p-5 bg-[#fff8f1]">
              <div className="flex items-center gap-2 mb-3">
                <Leaf className="w-4 h-4 text-success" />
                <span className="text-xs font-bold font-display uppercase tracking-wider text-fg-2">Carbon Goal</span>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-baseline">
                  <span className="text-[11px] text-muted font-medium">Total Emission</span>
                  <span className="text-xs font-bold text-fg">{profile.total_co2.toFixed(1)} / {profile.goals.monthly_co2_target} kg</span>
                </div>
                <div className="w-full bg-stone-200 border border-border-soft h-3 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all duration-500 ${progressRatio < 50 ? "bg-green-500" : progressRatio < 85 ? "bg-amber-500" : "bg-red-500"}`}
                    style={{ width: `${progressRatio}%` }} />
                </div>
                <div className="pt-1.5 flex items-start gap-1 text-[10px] text-muted font-medium">
                  <TrendingDown className="w-3.5 h-3.5 text-success shrink-0" />
                  <span>{progressRatio < 100 ? `${progressRatio.toFixed(0)}% of target. Keep it low!` : "Target exceeded!"}</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-gradient-to-b from-[#ead6c7]/30 to-[#ead6c7]/10 border border-border rounded-2xl flex items-center gap-3 text-fg-2">
              <Award className="w-8 h-8 text-amber-700 shrink-0" />
              <div>
                <p className="text-[10px] uppercase font-bold tracking-widest text-[#b46a46] font-display">Level {profile.level}</p>
                <p className="text-xs font-bold text-fg leading-none mt-0.5">{LEVEL_LABELS[profile.level]}</p>
                <p className="text-[9px] text-muted mt-1">Log eco-friendly activities to level up!</p>
              </div>
            </div>
          </div>

          <div className="col-span-1 lg:col-span-3 space-y-6">
            {/* Mobile compact cards */}
            <div className="lg:hidden grid grid-cols-2 gap-4">
              <div className="clay-card p-3 bg-[#fff8f1]">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <Leaf className="w-3.5 h-3.5 text-success" />
                  <span className="text-[10px] font-bold font-display uppercase tracking-wider text-fg-2">Carbon Goal</span>
                </div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] text-muted">{profile.total_co2.toFixed(1)} / {profile.goals.monthly_co2_target} kg</span>
                  <span className={`text-[10px] font-mono font-bold ${progressRatio < 50 ? "text-green-600" : progressRatio < 85 ? "text-amber-600" : "text-red-600"}`}>
                    {progressRatio.toFixed(0)}%
                  </span>
                </div>
                <div className="w-full bg-stone-200 h-2 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-500" style={{ width: `${progressRatio}%`, backgroundColor: progressRatio < 50 ? "#22c55e" : progressRatio < 85 ? "#f59e0b" : "#ef4444" }} />
                </div>
              </div>
              <div className="p-3 bg-gradient-to-b from-[#ead6c7]/30 to-[#ead6c7]/10 border border-border rounded-2xl flex items-center gap-2.5">
                <Award className="w-6 h-6 text-amber-700 shrink-0" />
                <div>
                  <p className="text-[9px] uppercase font-bold tracking-widest text-[#b46a46] font-display">Level {profile.level}</p>
                  <p className="text-[11px] font-bold text-fg leading-none">{LEVEL_LABELS[profile.level]}</p>
                </div>
              </div>
            </div>
            {activeTab === "dashboard" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <MetricCard
                    id="metric-total-co2"
                    title="Total Carbon Logged"
                    value={profile.total_co2}
                    unit="kg CO₂"
                    icon={Leaf}
                    colorClass="text-danger"
                    bgAccentStyle="bg-red-50"
                    description={`Monthly target: ${profile.goals.monthly_co2_target} kg`}
                  />
                  <MetricCard
                    id="metric-points-earned"
                    title="EcoBucks Balance"
                    value={profile.eco_bucks}
                    unit="Points"
                    icon={Sparkles}
                    colorClass="text-[#d08a11]"
                    bgAccentStyle="bg-yellow-50"
                    description={`Level ${profile.level} — ${LEVEL_LABELS[profile.level]}`}
                  />
                  <MetricCard
                    id="metric-tracked-entries"
                    title="Total Entries"
                    value={trips.length + meals.length + energyLogs.length}
                    unit="Items"
                    icon={Activity}
                    colorClass="text-success"
                    bgAccentStyle="bg-green-50"
                    description="Trips + Meals + Energy"
                  />
                </div>

                <EcoInsights trips={trips} energyLogs={energyLogs} meals={meals} />
                <DashboardCharts trips={trips} energyLogs={energyLogs} meals={meals} />
              </div>
            )}

            {activeTab === "travel" && (
              <TravelTracker onAddTrip={handleAddTrip} trips={trips} onDeleteTrip={handleDeleteTrip} />
            )}

            {activeTab === "food" && (
              <MealScanner onAddMeal={handleAddMeal} meals={meals} onDeleteMeal={handleDeleteMeal} />
            )}

            {activeTab === "energy" && (
              <EnergyLogger onAddEnergyLog={handleAddEnergyLog} logs={energyLogs} onDeleteLog={handleDeleteEnergy} />
            )}

            {activeTab === "rewards" && (
              <RewardsStore ecoBucks={profile.eco_bucks} onRedeemReward={handleRedeemReward} redeemedRewards={redeemedRewards} />
            )}

            {activeTab === "tips" && (
              <RecommendationsScreen onClaimBucks={handleClaimBucks} completedTips={completedTips} />
            )}
            {activeTab === "chatbot" && (
              <Chatbot trips={trips} energyLogs={energyLogs} meals={meals} userName={profile.displayName} />
            )}
          </div>
        </div>
      </main>

      {isEditProfileOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="relative clay-card p-6 md:p-8 max-w-md w-full bg-[#fff8f1] animate-fade-in">
            <div className="flex justify-between items-start border-b border-border-soft pb-3.5 mb-5">
              <div>
                <h3 className="text-lg font-bold font-display text-fg flex items-center gap-1.5">
                  <User className="w-5 h-5 text-accent" />
                  <span>Profile Settings</span>
                </h3>
                <p className="text-[11px] text-muted">Update your display name and carbon goals.</p>
              </div>
              <button type="button" onClick={() => setIsEditProfileOpen(false)} className="text-muted hover:text-fg font-bold">✕</button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="space-y-1">
                <label htmlFor="modal-name-input" className="block text-xs font-bold text-fg-2">Display Name</label>
                <input id="modal-name-input" type="text" required value={editName} onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3.5 py-2 border border-border rounded-xl bg-surface focus:outline-none focus:ring-2 focus:ring-accent/10 focus:border-accent text-sm" />
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-bold text-fg-2">Email</label>
                <input type="text" disabled value={profile.email}
                  className="w-full px-3.5 py-2 border border-border rounded-xl bg-stone-100 text-muted text-sm cursor-not-allowed" />
              </div>
              <div className="space-y-1">
                <label htmlFor="modal-goal-input" className="block text-xs font-bold text-fg-2">Monthly CO₂ Target (kg)</label>
                <input id="modal-goal-input" type="number" min="20" max="1500" required value={editGoal} onChange={(e) => setEditGoal(e.target.value)}
                  className="w-full px-3.5 py-2 border border-border rounded-xl bg-surface focus:outline-none focus:ring-2 focus:ring-accent/10 focus:border-accent text-sm font-mono" />
              </div>
              <div className="pt-4 flex justify-end gap-2 text-xs">
                <button type="button" onClick={() => setIsEditProfileOpen(false)}
                  className="px-4 py-2 bg-stone-100 hover:bg-stone-200 border border-border-soft text-fg-2 font-bold rounded-xl transition-all">Cancel</button>
                <button type="submit"
                  className="px-5 py-2 bg-accent hover:bg-accent-hover text-white border border-black font-bold shadow-hard-offset rounded-xl transition-all">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
