# MahiKosh — AI Carbon Footprint Tracker & Sustainability Gamification Platform

## Overview

MahiKosh is a full-stack AI-powered web application that helps individuals track, understand, and reduce their personal carbon footprint. It combines real-time data logging, Google Gemini AI analysis, gamification mechanics, and a rewards marketplace to make sustainable living measurable and motivating.

The app operates in two modes: **offline-first** (localStorage) with full functionality, and **cloud-synced** (Firebase Auth + Firestore) when configured.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, TypeScript, Vite 6 |
| Styling | Tailwind CSS v4 (custom bento/clay design system) |
| Icons | Lucide React |
| Data Visualization | Recharts (PieChart, BarChart) |
| Maps | Leaflet + React-Leaflet |
| Backend | Express.js (embedded in Vite dev server) |
| AI Engine | Google Gemini 2.0 Flash via `@google/genai` SDK |
| Auth & Database | Firebase Auth + Firestore (optional fallback) |
| Animation | Motion (formerly Framer Motion) |

---

## Core Features

### 1. Travel Tracker

- **Live GPS tracking** with real-time distance, duration, and CO₂ calculation
- **Manual entry** for trips (distance + mode selection)
- **Trip map visualization** using Leaflet with route polylines
- **4 transport modes** with distinct emission factors:
  - Walk/Bike: 0 kg CO₂/km (max EcoBucks reward)
  - Train: 0.04 kg CO₂/km
  - Bus: 0.08 kg CO₂/km
  - Car: 0.17 kg CO₂/km
- Trip history list with detail overlay

### 2. AI Meal Scanner

- Upload food photos or drag-and-drop
- **Gemini AI scans** the image to identify the dish, classify as veg/non-veg, estimate CO₂ footprint, and provide confidence score
- Structured JSON response via Gemini's `responseSchema`
- Manual quick-entry for meals (veg: 1.5 kg, non-veg: 4.5 kg CO₂)
- Fallback logic when API key is unavailable

### 3. Home Energy Logger

- Log monthly electricity and gas bills in INR
- Emission factors: 0.005 kg CO₂/₹ (electricity), 0.0025 kg CO₂/₹ (gas)
- Live preview of calculated CO₂ while typing
- Month/year selector with history table

### 4. Dashboard & Analytics

- **Metric Cards**: Total CO₂ logged, EcoBucks balance, total entries
- **Gemini AI Insights**: Personalized weekly summary + 3 actionable tips, context-aware based on actual user data
- **Carbon Source Pie Chart**: Proportional breakdown by Travel / Home Energy / Diet
- **Emissions Timeline Bar Chart**: Recent log history with CO₂ values

### 5. EcoBot AI Chat

- Conversational assistant powered by Gemini
- Context-aware replies using user's trip/meal/energy data and emission constants
- Structured JSON output with fallback response logic
- Chat history preserved during session

### 6. Rewards Marketplace

- Redeem EcoBucks for real-world sustainability rewards:
  - Tree Planting Initiative (1,000 bucks)
  - Eco-Store Discount Voucher (500 bucks)
  - Carbon Offset Certificate (2,000 bucks)
- Category filtering (transport, energy, lifestyle, food)
- Auto-generated coupon codes on redemption
- Redeemed voucher history

### 7. Eco Tips

- 6 sustainability tips across travel, food, and energy categories
- Each tip has an impact rating (high/medium/low) and EcoBucks reward
- Mark tips complete to earn bonus EcoBucks
- Category filter buttons

### 8. Gamification System

| Level | Title | EcoBucks Threshold |
|-------|-------|-------------------|
| 1 | EcoStarter | 0–499 |
| 2 | Green Hero | 500–1,499 |
| 3 | Sustainable Star | 1,500–4,999 |
| 4 | Earth Guardian | 5,000+ |

- EcoBucks earned from logging eco-friendly activities
- Walking/biking earns 10× more EcoBucks per km than driving
- Monthly CO₂ target with progress bar (color-coded: green → amber → red)
- Level badge displayed in navigation

---

## Responsive Design

The UI is fully responsive across all viewport sizes:

- **Desktop (lg+)**: Sidebar navigation with stacked nav buttons, carbon goal card, and level badge; main content in 3/4 grid
- **Tablet & Mobile (< lg)**: Horizontal scrollable pill-shaped nav strip replaces the sidebar; compact 2-column cards for carbon goal and level badge
- **Small mobile (< sm)**: Card-based layouts for history tables instead of wide scrollable tables
- **Chatbot**: Fluid height (`min-h-[350px] h-[75vh] max-h-[600px]`) adapts to viewport

---

## Design System

- **Bento/Clay aesthetic**: Rounded cards with subtle borders and shadows, accent-colored elements, soft warm palette
- **Colors**: Sage green accents (`#2d5a27`) on warm cream background (`#f2f4f1`)
- **Typography**: Inter (body), Space Grotesk (display), JetBrains Mono (data) via Google Fonts
- **Shadows**: Clay (`0 1px 3px rgba(0,0,0,0.05)`) and hard-offset for active states
- **Border radius**: 12px (small), 18px (medium), 24px (large), 9999px (pill)

---

## Architecture

### Frontend Structure

```
src/
├── App.tsx                  # Root component, state management, layout
├── main.tsx                 # Entry point with AuthProvider
├── index.css                # Tailwind v4 imports + custom theme
├── types.ts                 # TypeScript interfaces
├── utils.ts                 # Emission factors, calculations, tips, rewards
├── vite-env.d.ts
├── hooks/
│   └── useAuth.tsx          # Firebase Auth context provider
├── lib/
│   ├── firebase.ts          # Firebase initialization (conditional)
│   └── firestoreService.ts  # Firestore CRUD operations
└── components/
    ├── LoginScreen.tsx      # Auth UI (sign in/sign up/Google)
    ├── MetricCard.tsx       # Dashboard stat card
    ├── DashboardCharts.tsx  # Pie chart + bar chart (Recharts)
    ├── EcoInsights.tsx      # Gemini AI weekly insights
    ├── TravelTracker.tsx    # GPS + manual trip logging
    ├── TripMap.tsx          # Leaflet map with route polylines
    ├── MealScanner.tsx      # AI food photo scanner
    ├── EnergyLogger.tsx     # Home energy bill logging
    ├── RewardsStore.tsx     # EcoBucks marketplace
    ├── RecommendationsScreen.tsx  # Eco tips hub
    └── Chatbot.tsx          # EcoBot AI conversational chat
```

### Backend (server.ts)

Three Gemini AI API endpoints, all with robust fallback logic when `GEMINI_API_KEY` is not configured:

| Endpoint | Purpose | Gemini Model |
|----------|---------|-------------|
| `POST /api/gemini/scan-meal` | Analyze food image → veg/non-veg + CO₂ estimate | gemini-2.0-flash (structured JSON) |
| `POST /api/gemini/insights` | Generate personalized weekly summary + 3 tips | gemini-2.0-flash (structured JSON) |
| `POST /api/gemini/chat` | Conversational EcoBot response | gemini-2.0-flash (structured JSON) |

All endpoints use Gemini's `responseSchema` for guaranteed structured JSON output. Fallback responses are context-aware (e.g., using actual user data to tailor recommendations).

### Data Flow

```
User Action → React State → localStorage (auto-sync)
                                ↓
                        Gemini API (via Express)
                                ↓
                        Parse response → Update UI
```

Firebase Firestore can optionally replace localStorage for persistent cloud storage across devices.

---

## Emission Factors (Indian Context)

| Category | Factor | Source |
|----------|--------|--------|
| Car travel | 0.17 kg CO₂/km | Indian grid average |
| Bus travel | 0.08 kg CO₂/km | Urban transit estimate |
| Train travel | 0.04 kg CO₂/km | Rail network average |
| Walk/Bike | 0 kg CO₂/km | Zero-emission |
| Electricity | 0.005 kg CO₂/₹ | Indian electricity grid |
| Natural gas | 0.0025 kg CO₂/₹ | Domestic gas estimate |
| Veg meal | 1.5 kg CO₂/serving | Plant-based diet |
| Non-veg meal | 4.5 kg CO₂/serving | Meat-inclusive diet |

---

## Configuration

Create a `.env` file with:

```env
GEMINI_API_KEY=your_gemini_api_key
VITE_FIREBASE_API_KEY=optional
VITE_FIREBASE_AUTH_DOMAIN=optional
VITE_FIREBASE_PROJECT_ID=optional
VITE_FIREBASE_STORAGE_BUCKET=optional
VITE_FIREBASE_MESSAGING_SENDER_ID=optional
VITE_FIREBASE_APP_ID=optional
VITE_USE_FIREBASE_EMULATORS=false
```

Without Firebase, the app runs fully offline using localStorage.

---

## Running Locally

```bash
npm install
# Set GEMINI_API_KEY in .env
npm run dev    # → http://localhost:3000
npm run build  # Production build
npm run start  # Serve production build
```

---

## Development Notes

- **Typing**: Full TypeScript coverage with explicit interfaces for all data models
- **Linting**: TypeScript strict mode via `tsc --noEmit`
- **Build**: Vite bundling + esbuild for server-side compilation
- **Responsiveness**: Tailwind breakpoints (`sm`, `md`, `lg`, `xl`) with mobile-first cards, horizontal nav strips, and fluid chatbot heights
- **Error handling**: Every Gemini API endpoint has graceful fallback responses — the app never crashes when AI features are unavailable
