import React, { useState, useEffect, useCallback } from "react";
import {
  Navigation, Camera, Home, Gift, Award, Sparkles, Leaf, User,
  Activity, Trash2, TrendingDown, Bot, Lightbulb,
} from "lucide-react";
import { UserProfile, TripLog, MealLog, EnergyLog, RewardItem, TravelMode } from "./types";
import {
  calculateTravelCo2, calculateEnergyCo2, calculateTripEcoBucks,
  determineEcoLevel, REWARDS_CATALOG, EMISSION_FACTORS,
} from "./utils";
import { useAuth } from "./hooks/useAuth";
import {
  getUserProfile, createUserProfile, setUserProfile, addCompletedTip,
  getTrips, addTrip, deleteTrip,
  getMeals, addMeal, deleteMeal,
  getEnergyLogs, addEnergyLog, deleteEnergyLog,
  getRedeemedRewards, addRedeemedReward,
} from "./lib/firestoreService";
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

const LEVEL_LABELS: Record<number, string> = {
  1: "EcoStarter", 2: "Green Hero", 3: "Sustainable Star", 4: "Earth Guardian",
};

type Tab = "dashboard" | "travel" | "food" | "energy" | "rewards" | "chatbot" | "tips";

const TAB_TITLES: Record<string, string> = {
  dashboard: "Dashboard — EcoTrack Carbon Footprint Tracker",
  travel: "Travel CO₂ Tracker — EcoTrack",
  food: "AI Meal Scanner — EcoTrack",
  energy: "Home Energy Logger — EcoTrack",
  rewards: "EcoBucks Rewards Marketplace — EcoTrack",
  chatbot: "EcoBot AI Sustainability Assistant — EcoTrack",
  tips: "Eco Tips & Sustainability Guide — EcoTrack",
};

const defaultProfile = (uid: string, email: string, name: string): UserProfile => ({
  uid, email, displayName: name,
  eco_bucks: 100, level: 1, total_co2: 0,
  goals: { monthly_co2_target: 200 },
  completedTips: [],
});

export default function App() {
  const { user, loading: authLoading, isAvailable: authAvailable } = useAuth();
  const uid = user?.uid || "local";
  const email = user?.email || "mrunaljogane@gmail.com";
  const displayName = user?.displayName || user?.email?.split("@")[0] || "Mrunal Jogane";

  const [profile, setProfile] = useState<UserProfile>(defaultProfile(uid, email, displayName));
  const [trips, setTrips] = useState<TripLog[]>([]);
  const [meals, setMeals] = useState<MealLog[]>([]);
  const [energyLogs, setEnergyLogs] = useState<EnergyLog[]>([]);
  const [redeemedRewards, setRedeemedRewards] = useState<RewardItem[]>([]);
  const [completedTips, setCompletedTips] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [editName, setEditName] = useState("");
  const [editGoal, setEditGoal] = useState("");
  const [initialLoading, setInitialLoading] = useState(true);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    document.title = TAB_TITLES[activeTab] || "EcoTrack — AI Carbon Footprint Tracker";
  }, [activeTab]);

  // ─── Initial data load: Firestore if authed, else localStorage ─────
  useEffect(() => {
    if (authLoading) return;
    setAuthReady(true);

    async function loadData() {
      setInitialLoading(true);
      try {
        if (user) {
          // ── Firestore path ──
          let fbProfile = await getUserProfile(uid);
          if (!fbProfile) {
            fbProfile = await createUserProfile(uid, email, displayName);
          }
          setProfile(fbProfile);
          setCompletedTips(fbProfile.completedTips || []);

          const [fbTrips, fbMeals, fbEnergy, fbRewards] = await Promise.all([
            getTrips(uid), getMeals(uid), getEnergyLogs(uid), getRedeemedRewards(uid),
          ]);
          setTrips(fbTrips);
          setMeals(fbMeals);
          setEnergyLogs(fbEnergy);
          setRedeemedRewards(fbRewards);
        } else {
          // ── localStorage path ──
          const savedProfile = localStorage.getItem("ecotrack_profile");
          const savedTrips = localStorage.getItem("ecotrack_trips");
          const savedMeals = localStorage.getItem("ecotrack_meals");
          const savedEnergy = localStorage.getItem("ecotrack_energy");
          const savedRewards = localStorage.getItem("ecotrack_rewards");
          const savedTips = localStorage.getItem("ecotrack_completed_tips");

          if (savedProfile) setProfile(JSON.parse(savedProfile));
          if (savedTrips) setTrips(JSON.parse(savedTrips));
          if (savedMeals) setMeals(JSON.parse(savedMeals));
          if (savedEnergy) setEnergyLogs(JSON.parse(savedEnergy));
          if (savedRewards) setRedeemedRewards(JSON.parse(savedRewards));
          if (savedTips) setCompletedTips(JSON.parse(savedTips));
        }
      } catch (e) {
        console.error("Failed to load data:", e);
      } finally {
        setInitialLoading(false);
      }
    }

    loadData();
  }, [user, authLoading]);

  // ─── Sync helpers ──────────────────────────────────────────────────

  const saveToLocalStorage = useCallback((p: UserProfile, t: TripLog[], m: MealLog[], e: EnergyLog[], r: RewardItem[], tips: string[]) => {
    localStorage.setItem("ecotrack_profile", JSON.stringify(p));
    localStorage.setItem("ecotrack_trips", JSON.stringify(t));
    localStorage.setItem("ecotrack_meals", JSON.stringify(m));
    localStorage.setItem("ecotrack_energy", JSON.stringify(e));
    localStorage.setItem("ecotrack_rewards", JSON.stringify(r));
    localStorage.setItem("ecotrack_completed_tips", JSON.stringify(tips));
  }, []);

  const computeProfile = useCallback((
    p: UserProfile, t: TripLog[], m: MealLog[], e: EnergyLog[],
    ecoBucksModifier = 0, directOverrideBucks?: number
  ): UserProfile => {
    const tripSum = t.reduce((s, v) => s + v.co2_emission, 0);
    const mealSum = m.reduce((s, v) => s + v.co2_emission, 0);
    const energySum = e.reduce((s, v) => s + v.co2_emission, 0);
    const totalCarbon = tripSum + mealSum + energySum;
    let finalBucks = directOverrideBucks !== undefined ? directOverrideBucks : p.eco_bucks + ecoBucksModifier;
    if (finalBucks < 0) finalBucks = 0;
    return {
      ...p,
      total_co2: Number(totalCarbon.toFixed(2)),
      eco_bucks: finalBucks,
      level: determineEcoLevel(finalBucks),
    };
  }, []);

  const updateAll = useCallback(async (
    newTrips: TripLog[], newMeals: MealLog[], newEnergy: EnergyLog[],
    newRewards: RewardItem[], tips: string[],
    ecoBucksModifier = 0, directOverrideBucks?: number
  ) => {
    const updatedProfile = computeProfile(profile, newTrips, newMeals, newEnergy, ecoBucksModifier, directOverrideBucks);

    setProfile(updatedProfile);
    setTrips(newTrips);
    setMeals(newMeals);
    setEnergyLogs(newEnergy);
    setRedeemedRewards(newRewards);
    setCompletedTips(tips);

    saveToLocalStorage(updatedProfile, newTrips, newMeals, newEnergy, newRewards, tips);

    // Firestore sync (fire-and-forget)
    if (user) {
      try {
        await setUserProfile(uid, {
          uid, email: email, displayName: updatedProfile.displayName,
          eco_bucks: updatedProfile.eco_bucks, level: updatedProfile.level,
          total_co2: updatedProfile.total_co2, goals: updatedProfile.goals,
          completedTips: tips,
        });
      } catch (e) {
        console.error("Firestore sync error:", e);
      }
    }
  }, [profile, user, uid, email, computeProfile, saveToLocalStorage]);

  // ─── Handlers ──────────────────────────────────────────────────────

  const handleAddTrip = async (distance: number, mode: TravelMode, duration: number, routeCoordinates: { lat: number; lng: number }[]) => {
    const emission = calculateTravelCo2(mode, distance);
    const ecoBucksAwarded = calculateTripEcoBucks(mode, distance);
    const newTrip: TripLog = {
      id: `t-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      userId: uid, date: new Date().toISOString().split("T")[0],
      distance, mode, duration,
      co2_emission: Number(emission.toFixed(2)),
      routeCoordinates, createdAt: new Date().toISOString(),
    };
    const next = [newTrip, ...trips];
    await updateAll(next, meals, energyLogs, redeemedRewards, completedTips, ecoBucksAwarded);

    if (user) {
      const { id: _tid, ...tripData } = newTrip;
      addTrip(tripData).catch(e => console.error("Firestore addTrip error:", e));
    }
  };

  const handleDeleteTrip = async (id: string) => {
    const target = trips.find(t => t.id === id);
    if (!target) return;
    const points = -calculateTripEcoBucks(target.mode, target.distance);
    const next = trips.filter(t => t.id !== id);
    await updateAll(next, meals, energyLogs, redeemedRewards, completedTips, points);
    if (user) deleteTrip(id).catch(e => console.error("Firestore deleteTrip error:", e));
  };

  const handleAddMeal = async (type: "veg" | "non-veg", description: string, co2: number) => {
    const points = type === "veg" ? 10 : 2;
    const newMeal: MealLog = {
      id: `m-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      userId: uid, date: new Date().toISOString().split("T")[0],
      type, description, co2_emission: Number(co2.toFixed(2)),
      image_url: null, createdAt: new Date().toISOString(),
    };
    const next = [newMeal, ...meals];
    await updateAll(trips, next, energyLogs, redeemedRewards, completedTips, points);
    if (user) addMeal({ ...newMeal, id: undefined! }).catch(e => console.error("Firestore addMeal error:", e));
  };

  const handleDeleteMeal = async (id: string) => {
    const target = meals.find(m => m.id === id);
    if (!target) return;
    const points = target.type === "veg" ? -10 : -2;
    const next = meals.filter(m => m.id !== id);
    await updateAll(trips, next, energyLogs, redeemedRewards, completedTips, points);
    if (user) deleteMeal(id).catch(e => console.error("Firestore deleteMeal error:", e));
  };

  const handleAddEnergyLog = async (month: string, year: number, electricity: number, gas: number) => {
    const emission = calculateEnergyCo2(electricity, gas);
    const newLog: EnergyLog = {
      id: `e-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      userId: uid, month, year,
      electricity_bill: electricity, gas_bill: gas,
      co2_emission: Number(emission.toFixed(2)),
      createdAt: new Date().toISOString(),
    };
    const next = [newLog, ...energyLogs];
    await updateAll(trips, meals, next, redeemedRewards, completedTips, 25);
    if (user) addEnergyLog({ ...newLog, id: undefined! }).catch(e => console.error("Firestore addEnergy error:", e));
  };

  const handleDeleteEnergy = async (id: string) => {
    const next = energyLogs.filter(e => e.id !== id);
    await updateAll(trips, meals, next, redeemedRewards, completedTips, -25);
    if (user) deleteEnergyLog(id).catch(e => console.error("Firestore deleteEnergy error:", e));
  };

  const handleClaimBucks = async (tipId: string, bucks: number) => {
    if (completedTips.includes(tipId)) return;
    const nextTips = [...completedTips, tipId];
    const newBucks = profile.eco_bucks + bucks;
    const updatedProfile = { ...profile, eco_bucks: newBucks, level: determineEcoLevel(newBucks), completedTips: nextTips };
    setProfile(updatedProfile);
    setCompletedTips(nextTips);
    saveToLocalStorage(updatedProfile, trips, meals, energyLogs, redeemedRewards, nextTips);
    if (user) {
      addCompletedTip(uid, tipId).catch(e => console.error("Firestore addTip error:", e));
      setUserProfile(uid, { eco_bucks: newBucks, level: updatedProfile.level, completedTips: nextTips }).catch(e => console.error("Firestore profile error:", e));
    }
  };

  const handleRedeemReward = async (rewardId: string, cost: number) => {
    const catalogItem = REWARDS_CATALOG.find(r => r.id === rewardId);
    if (!catalogItem || profile.eco_bucks < cost) return;
    const alpha = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const num = "0123456789";
    const rand = (src: string, len: number) => Array.from({ length: len }, () => src[Math.floor(Math.random() * src.length)]).join("");
    const couponCode = `ECO-${rand(alpha, 4)}-${rand(num, 4)}`;
    const redeemedItem: RewardItem = {
      ...catalogItem, couponCode, redeemedAt: new Date().toISOString(),
    };
    const nextRewards = [...redeemedRewards, redeemedItem];
    await updateAll(trips, meals, energyLogs, nextRewards, completedTips, -cost);
    if (user) {
      addRedeemedReward(uid, { ...catalogItem, couponCode, redeemedAt: redeemedItem.redeemedAt! }).catch(e => console.error("Firestore addReward error:", e));
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const updated = {
      ...profile,
      displayName: editName.trim() || profile.displayName,
      goals: { monthly_co2_target: parseInt(editGoal) || profile.goals.monthly_co2_target },
    };
    setIsEditProfileOpen(false);
    setProfile(updated);
    saveToLocalStorage(updated, trips, meals, energyLogs, redeemedRewards, completedTips);
    if (user) {
      setUserProfile(uid, { displayName: updated.displayName, goals: updated.goals }).catch(e => console.error("Firestore profile error:", e));
    }
  };

  const handleOpenEditProfile = () => {
    setEditName(profile.displayName);
    setEditGoal(String(profile.goals.monthly_co2_target));
    setIsEditProfileOpen(true);
  };

  const handleResetApp = () => {
    if (!confirm("Are you sure you want to delete all data? This cannot be undone.")) return;
    localStorage.clear();
    setTrips([]);
    setMeals([]);
    setEnergyLogs([]);
    setRedeemedRewards([]);
    setCompletedTips([]);
    const reset: UserProfile = defaultProfile(uid, email, displayName);
    setProfile(reset);
    localStorage.setItem("ecotrack_profile", JSON.stringify(reset));
    setActiveTab("dashboard");
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

  if (authLoading || !authReady || initialLoading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-muted font-medium">Loading your data...</p>
        </div>
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
              <span className="font-display font-bold text-lg sm:text-xl tracking-tight text-fg">EcoTrack</span>
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
              {user ? "Cloud-synced. Every action counts." : "Offline mode. Sign in to sync across devices."}
            </p>
          </div>

          <div className="flex gap-2">
            <button onClick={handleOpenEditProfile} className="clay-btn-secondary px-4 py-2 text-xs font-bold">
              Profile Settings
            </button>
            <button onClick={handleResetApp}
              className="px-3 py-2 bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all">
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
                  <MetricCard id="metric-total-co2" title="Total Carbon Logged" value={profile.total_co2} unit="kg CO₂" icon={Leaf} colorClass="text-danger" bgAccentStyle="bg-red-50" description={`Monthly target: ${profile.goals.monthly_co2_target} kg`} />
                  <MetricCard id="metric-points-earned" title="EcoBucks Balance" value={profile.eco_bucks} unit="Points" icon={Sparkles} colorClass="text-[#d08a11]" bgAccentStyle="bg-yellow-50" description={`Level ${profile.level} — ${LEVEL_LABELS[profile.level]}`} />
                  <MetricCard id="metric-tracked-entries" title="Total Entries" value={trips.length + meals.length + energyLogs.length} unit="Items" icon={Activity} colorClass="text-success" bgAccentStyle="bg-green-50" description="Trips + Meals + Energy" />
                </div>
                <EcoInsights trips={trips} energyLogs={energyLogs} meals={meals} />
                <DashboardCharts trips={trips} energyLogs={energyLogs} meals={meals} />
              </div>
            )}
            {activeTab === "travel" && <TravelTracker onAddTrip={handleAddTrip} trips={trips} onDeleteTrip={handleDeleteTrip} />}
            {activeTab === "food" && <MealScanner onAddMeal={handleAddMeal} meals={meals} onDeleteMeal={handleDeleteMeal} />}
            {activeTab === "energy" && <EnergyLogger onAddEnergyLog={handleAddEnergyLog} logs={energyLogs} onDeleteLog={handleDeleteEnergy} />}
            {activeTab === "rewards" && <RewardsStore ecoBucks={profile.eco_bucks} onRedeemReward={handleRedeemReward} redeemedRewards={redeemedRewards} />}
            {activeTab === "tips" && <RecommendationsScreen onClaimBucks={handleClaimBucks} completedTips={completedTips} />}
            {activeTab === "chatbot" && <Chatbot trips={trips} energyLogs={energyLogs} meals={meals} userName={profile.displayName} />}
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
