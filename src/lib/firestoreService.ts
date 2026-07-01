import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  addDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
  arrayUnion,
  arrayRemove,
  updateDoc,
} from "firebase/firestore";
import { db } from "./firebase";
import { TripLog, MealLog, EnergyLog, ChatMessage, UserProfile, RewardItem } from "../types";

// ─── User Profile ────────────────────────────────────────────────────

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const snap = await getDoc(doc(db, "users", uid));
  if (!snap.exists()) return null;
  const data = snap.data();
  return {
    uid: data.uid || uid,
    email: data.email || "",
    displayName: data.displayName || "",
    eco_bucks: data.eco_bucks ?? 0,
    level: data.level ?? 1,
    total_co2: data.total_co2 ?? 0,
    goals: data.goals || { monthly_co2_target: 200 },
    completedTips: data.completedTips || [],
  } as UserProfile;
}

export async function setUserProfile(uid: string, profile: Partial<UserProfile>) {
  await setDoc(doc(db, "users", uid), profile, { merge: true });
}

export async function createUserProfile(uid: string, email: string, displayName: string) {
  const profile: UserProfile = {
    uid,
    email,
    displayName,
    eco_bucks: 100,
    level: 1,
    total_co2: 0,
    goals: { monthly_co2_target: 200 },
    completedTips: [],
  };
  await setDoc(doc(db, "users", uid), profile);
  return profile;
}

// ─── Completed Tips ──────────────────────────────────────────────────

export async function addCompletedTip(uid: string, tipId: string) {
  await updateDoc(doc(db, "users", uid), {
    completedTips: arrayUnion(tipId),
  });
}

// ─── Trips ───────────────────────────────────────────────────────────

export async function getTrips(uid: string): Promise<TripLog[]> {
  const q = query(
    collection(db, "trips"),
    where("userId", "==", uid),
    orderBy("createdAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      ...data,
      date: data.date?.toDate ? data.date.toDate().toISOString().split("T")[0] : data.date,
      createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt,
      routeCoordinates: data.routeCoordinates || [],
    } as TripLog;
  });
}

export async function addTrip(trip: Omit<TripLog, "id">) {
  const docRef = await addDoc(collection(db, "trips"), {
    ...trip,
    date: Timestamp.fromDate(new Date(trip.date)),
    createdAt: Timestamp.fromDate(new Date(trip.createdAt)),
    routeCoordinates: trip.routeCoordinates || [],
  });
  return docRef.id;
}

export async function deleteTrip(id: string) {
  await deleteDoc(doc(db, "trips", id));
}

// ─── Meals ───────────────────────────────────────────────────────────

export async function getMeals(uid: string): Promise<MealLog[]> {
  const q = query(
    collection(db, "meals"),
    where("userId", "==", uid),
    orderBy("createdAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      ...data,
      date: data.date?.toDate ? data.date.toDate().toISOString().split("T")[0] : data.date,
      createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt,
    } as MealLog;
  });
}

export async function addMeal(meal: Omit<MealLog, "id">) {
  const docRef = await addDoc(collection(db, "meals"), {
    ...meal,
    date: Timestamp.fromDate(new Date(meal.date)),
    createdAt: Timestamp.fromDate(new Date(meal.createdAt)),
  });
  return docRef.id;
}

export async function deleteMeal(id: string) {
  await deleteDoc(doc(db, "meals", id));
}

// ─── Energy Logs ─────────────────────────────────────────────────────

export async function getEnergyLogs(uid: string): Promise<EnergyLog[]> {
  const q = query(
    collection(db, "energy"),
    where("userId", "==", uid),
    orderBy("createdAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      ...data,
      createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt,
    } as EnergyLog;
  });
}

export async function addEnergyLog(log: Omit<EnergyLog, "id">) {
  const docRef = await addDoc(collection(db, "energy"), {
    ...log,
    createdAt: Timestamp.fromDate(new Date(log.createdAt)),
  });
  return docRef.id;
}

export async function deleteEnergyLog(id: string) {
  await deleteDoc(doc(db, "energy", id));
}

// ─── Rewards ─────────────────────────────────────────────────────────

export async function getRedeemedRewards(uid: string): Promise<RewardItem[]> {
  const q = query(
    collection(db, "users", uid, "rewards"),
    orderBy("redeemedAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      ...data,
      redeemedAt: data.redeemedAt?.toDate ? data.redeemedAt.toDate().toISOString() : data.redeemedAt,
    } as RewardItem;
  });
}

export async function addRedeemedReward(uid: string, reward: Omit<RewardItem, "id">) {
  const docRef = await addDoc(collection(db, "users", uid, "rewards"), {
    ...reward,
    redeemedAt: Timestamp.fromDate(new Date(reward.redeemedAt)),
  });
  return docRef.id;
}

// ─── Chat Messages ───────────────────────────────────────────────────

export async function getChatMessages(uid: string): Promise<ChatMessage[]> {
  const q = query(
    collection(db, "chats", uid, "messages"),
    orderBy("timestamp", "asc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      ...data,
      timestamp: data.timestamp?.toDate ? data.timestamp.toDate().toISOString() : data.timestamp,
    } as ChatMessage;
  });
}

export async function addChatMessage(uid: string, msg: Omit<ChatMessage, "id">) {
  const docRef = await addDoc(collection(db, "chats", uid, "messages"), {
    ...msg,
    timestamp: Timestamp.fromDate(new Date(msg.timestamp)),
  });
  return docRef.id;
}
