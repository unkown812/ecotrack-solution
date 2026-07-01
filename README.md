<div align="center">
  <br />
  <img src="public/favicon.svg" width="80" alt="EcoTrack Logo" />
  <h1 align="center">EcoTrack</h1>
  <p align="center">
    <strong>AI-Powered Carbon Footprint Tracker & Sustainability Gamification Platform</strong>
  </p>
  <p align="center">
    Track your carbon emissions from travel, food, and home energy — powered by Google Gemini AI.
    Earn EcoBucks, level up, and redeem rewards for real-world sustainability impact.
  </p>
  <p align="center">
    <a href="#-features">Features</a> •
    <a href="#-tech-stack">Tech Stack</a> •
    <a href="#-getting-started">Getting Started</a> •
    <a href="#-seo-optimization">SEO</a> •
    <a href="#-deployment">Deployment</a>
  </p>
  <br />
  <p align="center">
    <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white" alt="React 19" />
    <img src="https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript&logoColor=white" alt="TypeScript" />
    <img src="https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=white" alt="Vite 6" />
    <img src="https://img.shields.io/badge/Tailwind-4-06B6D4?logo=tailwindcss&logoColor=white" alt="Tailwind CSS v4" />
    <img src="https://img.shields.io/badge/Gemini_AI-8E75B2?logo=google&logoColor=white" alt="Google Gemini AI" />
    <img src="https://img.shields.io/badge/Firebase-FFCA28?logo=firebase&logoColor=black" alt="Firebase" />
    <img src="https://img.shields.io/badge/Netlify-00C7B7?logo=netlify&logoColor=white" alt="Netlify Ready" />
  </p>
  <br />
</div>

---

## Features

| Feature | Description |
|---------|-------------|
| **Travel CO₂ Tracker** | GPS trip tracking + manual entry. Calculates emissions for car, bus, train, walk/bike with Indian-context factors |
| **AI Meal Scanner** | Snap a food photo — Google Gemini AI identifies the dish and estimates its carbon footprint instantly |
| **Home Energy Logger** | Log monthly electricity & gas bills in INR. Real-time CO₂ preview while typing |
| **Dashboard & Analytics** | Interactive pie charts + timeline bar charts. Track your carbon goals with color-coded progress |
| **Gemini AI Insights** | Personalized weekly summaries + 3 actionable tips based on your actual activity data |
| **EcoBot Chat** | Conversational AI sustainability assistant. Ask anything about your carbon footprint |
| **Gamification** | Earn EcoBucks for green choices. Level up: EcoStarter → Green Hero → Sustainable Star → Earth Guardian |
| **Rewards Marketplace** | Redeem EcoBucks for tree planting, eco-store discounts, and carbon offset certificates |
| **Eco Tips Hub** | Actionable sustainability tips across travel, food, and energy categories with bonus rewards |
| **Offline-First** | Fully functional with localStorage. Optional Firebase sync for cross-device cloud storage |

## Tech Stack

```
Frontend:  React 19, TypeScript, Vite 6, Tailwind CSS v4
AI:        Google Gemini 2.0 Flash (meal scan, insights, chatbot)
Data Viz:  Recharts (PieChart, BarChart)
Maps:      Leaflet + React-Leaflet (GPS route visualization)
Backend:   Express.js (embedded Gemini API proxy)
Auth/DB:   Firebase Auth + Firestore (optional, fallback to localStorage)
Icons:     Lucide React
Animation: Motion (Framer Motion)
Fonts:     Inter, Space Grotesk, JetBrains Mono
```

## Project Structure

```
ecotrack/
├── public/                  # Static files (SEO-optimized)
│   ├── blog/               # 12 SEO blog articles
│   ├── _redirects          # Netlify config
│   ├── robots.txt          # Crawler directives
│   ├── sitemap.xml         # 12 URL sitemap
│   └── favicon.svg         # Branded icon
├── src/
│   ├── components/         # 12 React components
│   ├── hooks/              # Firebase auth hook
│   ├── lib/                # Firebase init & services
│   ├── App.tsx             # Root component with tab routing
│   ├── main.tsx            # Entry point
│   ├── index.css           # Tailwind v4 + custom theme
│   ├── types.ts            # TypeScript interfaces
│   └── utils.ts            # Emission factors, calculations
├── server.ts               # Express + Gemini API proxy
├── vite.config.ts          # Build optimization (code splitting)
├── index.html              # Full meta tags + JSON-LD schema
├── ProductDescription.md   # Detailed product spec
└── package.json
```

## Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Set your Gemini API key
#    Create a .env file with:
#    GEMINI_API_KEY=your_key_here
#    (Optional Firebase vars for cloud sync)

# 3. Start dev server
npm run dev        # → http://localhost:3000

# 4. Production build
npm run build      # → dist/

# 5. Serve production build
npm run start
```

## SEO Optimization

EcoTrack is fully SEO-optimized for maximum search engine visibility:

| Optimization | Details |
|---|---|
| **Meta Tags** | Keyword-rich title (57 chars), compelling description (158 chars), keywords |
| **Open Graph** | og:title, og:description, og:image, og:url for rich social sharing |
| **Twitter Cards** | summary_large_image card format |
| **Structured Data** | 3 JSON-LD schemas: WebApplication, Organization, FAQPage |
| **Sitemap** | 12 URLs with priorities, changefreq, lastmod |
| **Robots.txt** | Allow all, disallow /api/, sitemap reference |
| **Canonical URLs** | Prevents duplicate content issues |
| **Blog Content** | 12 SEO-optimized articles targeting long-tail keywords |
| **Schema FAQ** | 4 Q&A pairs targeting Google featured snippets |
| **Performance** | Code splitting, asset caching, preconnect hints |
| **Accessibility** | Focus-visible styles, semantic HTML, alt text, sr-only |
| **Analytics** | Google Analytics + Search Console placeholders |

### Keyword Targets

- **Primary:** carbon footprint tracker, AI carbon calculator, sustainability app
- **Secondary:** CO2 emissions calculator, personal carbon footprint, eco-friendly lifestyle app
- **Long-tail:** "how to calculate my carbon footprint", "best free carbon footprint tracker app", "carbon footprint calculator India"
- **Blog:** 12 articles each targeting a specific long-tail keyword with full SEO metadata

## Deployment

### Netlify (Recommended)

1. Connect your GitHub repo to Netlify
2. Build command: `npm run build`
3. Publish directory: `dist`
4. The `public/_redirects` file handles SPA routing automatically

### Environment Variables

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

## Gamification Levels

| Level | Title | EcoBucks Required |
|-------|-------|------------------|
| 1 | EcoStarter | 0 – 499 |
| 2 | Green Hero | 500 – 1,499 |
| 3 | Sustainable Star | 1,500 – 4,999 |
| 4 | Earth Guardian | 5,000+ |

## Linting

```bash
npm run lint    # TypeScript strict mode type checking
```

## License

Built with ❤️ for a sustainable future. Powered by Google Gemini AI.
