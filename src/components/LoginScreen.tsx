import React, { useState } from "react";
import { Leaf, Mail, Lock, User, Chrome, LogIn, AlertCircle, Sparkles, Navigation, Camera, Home, Gift, Award, TrendingDown, BarChart3, ChevronRight, Check } from "lucide-react";
import { useAuth } from "../hooks/useAuth";

interface LoginScreenProps {
  onAuthSuccess?: () => void;
}

const FEATURES = [
  {
    icon: Navigation,
    title: "Travel CO₂ Tracker",
    description: "Log car, bus, train, or bike trips via GPS or manual entry. Real-time carbon emission calculations for every kilometer.",
    color: "text-green-600",
    bg: "bg-green-50 border-green-200",
  },
  {
    icon: Camera,
    title: "AI Meal Scanner",
    description: "Snap a photo of your food and Gemini AI instantly estimates its carbon footprint. Know the environmental impact of what you eat.",
    color: "text-amber-600",
    bg: "bg-amber-50 border-amber-200",
  },
  {
    icon: Home,
    title: "Home Energy Logger",
    description: "Track monthly electricity and gas bills. See how your home energy use contributes to your overall carbon footprint.",
    color: "text-orange-600",
    bg: "bg-orange-50 border-orange-200",
  },
  {
    icon: BarChart3,
    title: "Dashboard & Analytics",
    description: "Visualize your emissions with interactive pie charts and timelines. Track your progress toward monthly carbon goals.",
    color: "text-blue-600",
    bg: "bg-blue-50 border-blue-200",
  },
  {
    icon: Sparkles,
    title: "AI-Powered Insights",
    description: "Get personalized weekly summaries and actionable tips from Google Gemini AI, tailored to your actual lifestyle data.",
    color: "text-purple-600",
    bg: "bg-purple-50 border-purple-200",
  },
  {
    icon: Gift,
    title: "Rewards Marketplace",
    description: "Earn EcoBucks for eco-friendly actions and redeem them for tree planting, discount vouchers, and carbon offset certificates.",
    color: "text-indigo-600",
    bg: "bg-indigo-50 border-indigo-200",
  },
];

const HOW_IT_WORKS = [
  { step: "1", title: "Sign Up Free", description: "Create your account in seconds. No credit card needed." },
  { step: "2", title: "Log Your Activities", description: "Track travel, meals, and home energy using GPS, AI scanning, or manual entry." },
  { step: "3", title: "Get AI Insights", description: "Receive personalized recommendations to reduce your carbon footprint." },
  { step: "4", title: "Earn & Redeem", description: "Collect EcoBucks and redeem them for real-world sustainability rewards." },
];

const STATS = [
  { value: "4+", label: "Transport Modes Tracked" },
  { value: "AI", label: "Gemini-Powered Insights" },
  { value: "4", label: "Gamification Levels" },
  { value: "Free", label: "100% Free to Use" },
];

const BLOG_POSTS = [
  { title: "How to Calculate Your Carbon Footprint: A Complete Guide", url: "/blog/how-to-calculate-carbon-footprint.html", date: "July 2, 2026" },
  { title: "Sustainable Living for Beginners: Where to Start", url: "/blog/sustainable-living-for-beginners.html", date: "July 2, 2026" },
  { title: "Carbon Footprint Calculator India: Track Your Impact", url: "/blog/carbon-footprint-calculator-india.html", date: "July 2, 2026" },
  { title: "10 Easy Ways to Reduce Your Carbon Footprint at Home", url: "/blog/10-ways-to-reduce-carbon-footprint-at-home.html", date: "July 1, 2026" },
];

export default function LoginScreen({ onAuthSuccess }: LoginScreenProps) {
  const { signIn, signUp, signInWithGoogle, isAvailable } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (isSignUp) {
        await signUp(email, password);
      } else {
        await signIn(email, password);
      }
      onAuthSuccess?.();
    } catch (err: any) {
      setError(err.message || "Authentication failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError("");
    setLoading(true);
    try {
      await signInWithGoogle();
      onAuthSuccess?.();
    } catch (err: any) {
      setError(err.message || "Google sign-in failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg">
      {/* SEO-focused Hero Section */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-accent/5 to-transparent pointer-events-none" />
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-accent rounded-xl border border-black flex items-center justify-center text-white">
              <Leaf className="w-5 h-5 fill-white/20" />
            </div>
            <span className="font-display font-bold text-lg sm:text-xl tracking-tight text-fg">MahiKosh</span>
          </div>
          <a href="#auth-section" className="clay-btn-interactive px-4 py-2 text-xs font-bold">Get Started Free</a>
        </nav>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-accent/10 border border-accent/20 rounded-full text-accent text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5" />
                AI-Powered Sustainability
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-display text-fg leading-tight">
                Track Your{" "}
                <span className="text-accent">Carbon Footprint</span>
                {" "}with AI
              </h1>
              <p className="text-lg text-muted leading-relaxed max-w-lg">
                MahiKosh is the intelligent carbon footprint tracker that measures your CO₂ emissions from travel, food, and home energy. Get personalized AI insights, earn EcoBucks rewards, and build a sustainable lifestyle — all in one app.
              </p>
              <div className="flex flex-wrap gap-3">
                <a href="#auth-section" className="clay-btn-interactive px-6 py-3 text-sm font-bold flex items-center gap-2">
                  Start Tracking Free <ChevronRight className="w-4 h-4" />
                </a>
                <a href="#features" className="px-6 py-3 bg-surface border border-border rounded-xl text-sm font-bold text-fg hover:border-accent transition-all flex items-center gap-2">
                  Explore Features
                </a>
              </div>
              <div className="flex flex-wrap gap-6 pt-4">
                {STATS.map((stat) => (
                  <div key={stat.label}>
                    <p className="text-xl font-bold font-display text-accent">{stat.value}</p>
                    <p className="text-xs text-muted">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Auth Section - integrated into hero */}
            <div id="auth-section" className="clay-card p-6 md:p-8 max-w-md mx-auto w-full bg-[#fff8f1]">
              <div className="text-center mb-6">
                <div className="w-12 h-12 bg-accent rounded-2xl flex items-center justify-center mx-auto mb-3 border border-black">
                  <Leaf className="w-6 h-6 text-white fill-white/20" />
                </div>
                <h2 className="text-xl font-bold font-display text-fg">{isSignUp ? "Create Your Account" : "Welcome Back"}</h2>
                <p className="text-sm text-muted mt-1">
                  {isSignUp ? "Start tracking your carbon footprint today" : "Track your carbon footprint"}
                </p>
              </div>

              <div className="flex mb-5 bg-surface-warm/30 rounded-xl p-1 border border-border">
                <button
                  onClick={() => setIsSignUp(false)}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                    !isSignUp ? "bg-accent text-white shadow-clay" : "text-fg-2 hover:text-fg"
                  }`}
                >
                  Sign In
                </button>
                <button
                  onClick={() => setIsSignUp(true)}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                    isSignUp ? "bg-accent text-white shadow-clay" : "text-fg-2 hover:text-fg"
                  }`}
                >
                  Sign Up
                </button>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs text-red-700">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {isSignUp && (
                  <div className="space-y-1">
                    <label htmlFor="signup-name" className="text-xs font-bold text-fg-2 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5" /> Name
                    </label>
                    <input id="signup-name" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name"
                      className="w-full px-4 py-2.5 border border-border rounded-xl bg-surface focus:outline-none focus:ring-2 focus:ring-accent/10 focus:border-accent text-sm" />
                  </div>
                )}
                <div className="space-y-1">
                  <label htmlFor="auth-email" className="text-xs font-bold text-fg-2 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5" /> Email
                  </label>
                  <input id="auth-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com"
                    className="w-full px-4 py-2.5 border border-border rounded-xl bg-surface focus:outline-none focus:ring-2 focus:ring-accent/10 focus:border-accent text-sm" />
                </div>
                <div className="space-y-1">
                  <label htmlFor="auth-password" className="text-xs font-bold text-fg-2 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5" /> Password
                  </label>
                  <input id="auth-password" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min 6 characters"
                    className="w-full px-4 py-2.5 border border-border rounded-xl bg-surface focus:outline-none focus:ring-2 focus:ring-accent/10 focus:border-accent text-sm" />
                </div>
                <button type="submit" disabled={loading}
                  className="clay-btn-interactive w-full py-2.5 flex items-center justify-center gap-2 disabled:opacity-50">
                  <LogIn className="w-4 h-4" />
                  <span>{loading ? "Loading..." : isSignUp ? "Create Account" : "Sign In"}</span>
                </button>
              </form>

              <div className="relative my-5">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-3 bg-surface text-muted font-medium">or</span>
                </div>
              </div>

              <button onClick={handleGoogle} disabled={loading}
                className="w-full py-2.5 bg-surface border border-border hover:bg-surface-warm/20 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50">
                <Chrome className="w-4 h-4" />
                <span>Continue with Google</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="text-center mb-12 space-y-3">
          <h2 className="text-3xl md:text-4xl font-bold font-display text-fg">
            Everything You Need to{" "}
            <span className="text-accent">Track & Reduce</span>{" "}
            Your Carbon Footprint
          </h2>
          <p className="text-muted max-w-2xl mx-auto">
            MahiKosh combines AI technology with gamification to make sustainable living measurable, motivating, and rewarding.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((feature) => (
            <article key={feature.title} className="clay-card p-6 bg-surface hover:scale-[1.02] transition-all duration-200">
              <div className={`w-12 h-12 rounded-xl border flex items-center justify-center mb-4 ${feature.bg}`}>
                <feature.icon className={`w-6 h-6 ${feature.color}`} />
              </div>
              <h3 className="text-lg font-bold font-display text-fg mb-2">{feature.title}</h3>
              <p className="text-sm text-muted leading-relaxed">{feature.description}</p>
            </article>
          ))}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="bg-surface-warm/20 border-t border-border py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 space-y-3">
            <h2 className="text-3xl md:text-4xl font-bold font-display text-fg">
              How <span className="text-accent">MahiKosh</span> Works
            </h2>
            <p className="text-muted max-w-xl mx-auto">
              Getting started takes less than 2 minutes. Here's how to begin your sustainability journey.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {HOW_IT_WORKS.map((item) => (
              <div key={item.step} className="text-center space-y-3">
                <div className="w-14 h-14 bg-accent rounded-2xl flex items-center justify-center mx-auto border border-black shadow-hard-offset">
                  <span className="text-2xl font-bold font-display text-white">{item.step}</span>
                </div>
                <div>
                  <h3 className="text-base font-bold font-display text-fg">{item.title}</h3>
                  <p className="text-xs text-muted mt-1">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Gamification Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="clay-card p-8 md:p-12 bg-gradient-to-br from-[#ead6c7]/20 to-[#2d5a27]/5 border border-border overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-3xl pointer-events-none" />
          <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-amber-100 border border-amber-200 rounded-full text-amber-700 text-xs font-bold">
                <Award className="w-3.5 h-3.5" />
                Gamification System
              </div>
              <h2 className="text-3xl md:text-4xl font-bold font-display text-fg">
                Earn <span className="text-amber-600">EcoBucks</span> for Green Choices
              </h2>
              <p className="text-muted leading-relaxed">
                Every eco-friendly action earns you EcoBucks. Walk or bike to work? Earn 10x more points than driving. Level up from EcoStarter to Earth Guardian and unlock rewards like tree planting, eco-store discounts, and carbon offset certificates.
              </p>
              <div className="grid grid-cols-2 gap-4 pt-2">
                {[
                  { level: "EcoStarter", threshold: "0–499 EcoBucks", color: "text-[#dac8b9]" },
                  { level: "Green Hero", threshold: "500–1,499 EcoBucks", color: "text-[#078a52]" },
                  { level: "Sustainable Star", threshold: "1,500–4,999 EcoBucks", color: "text-[#0089ad]" },
                  { level: "Earth Guardian", threshold: "5,000+ EcoBucks", color: "text-[#43089f]" },
                ].map((level) => (
                  <div key={level.level} className="flex items-center gap-2 p-3 bg-surface border border-border-soft rounded-xl">
                    <Award className={`w-5 h-5 ${level.color}`} />
                    <div>
                      <p className="text-xs font-bold text-fg">{level.level}</p>
                      <p className="text-[9px] text-muted">{level.threshold}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex flex-col items-center justify-center space-y-4 p-8 bg-surface/60 border border-border-soft rounded-3xl">
              <div className="text-center">
                <p className="text-5xl font-bold font-display text-accent">4</p>
                <p className="text-sm font-bold text-fg mt-1">Gamification Levels</p>
              </div>
              <div className="w-full h-2 bg-stone-200 rounded-full overflow-hidden">
                <div className="w-1/4 h-full bg-accent rounded-full" />
              </div>
              <p className="text-xs text-muted text-center">Progress from EcoStarter to Earth Guardian as you log sustainable activities</p>
            </div>
          </div>
        </div>
      </section>

      {/* Emission Factors Section */}
      <section className="bg-surface border-t border-border py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 space-y-3">
            <h2 className="text-3xl md:text-4xl font-bold font-display text-fg">
              Science-Backed <span className="text-accent">Emission Factors</span>
            </h2>
            <p className="text-muted max-w-xl mx-auto">
              Accurate CO₂ calculations using Indian-context emission factors. Transparent and verifiable.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
            {[
              { label: "Car Travel", value: "0.17 kg CO₂/km" },
              { label: "Bus Travel", value: "0.08 kg CO₂/km" },
              { label: "Train Travel", value: "0.04 kg CO₂/km" },
              { label: "Walk / Bike", value: "0 kg CO₂/km" },
              { label: "Electricity", value: "0.005 kg CO₂/₹" },
              { label: "Natural Gas", value: "0.0025 kg CO₂/₹" },
              { label: "Veg Meal", value: "1.5 kg CO₂/serving" },
              { label: "Non-Veg Meal", value: "4.5 kg CO₂/serving" },
            ].map((item) => (
              <div key={item.label} className="p-4 bg-surface-warm/20 border border-border-soft rounded-xl text-center">
                <p className="text-xs font-bold text-fg">{item.label}</p>
                <p className="text-sm font-mono font-bold text-accent mt-1">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Blog Preview Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="text-center mb-10 space-y-3">
          <h2 className="text-3xl md:text-4xl font-bold font-display text-fg">
            Latest from the <span className="text-accent">MahiKosh Blog</span>
          </h2>
          <p className="text-muted max-w-xl mx-auto">
            Learn how to reduce your carbon footprint with actionable guides, tips, and research.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {BLOG_POSTS.map((post) => (
            <a key={post.title} href={post.url}
              className="clay-card p-5 bg-surface hover:scale-[1.01] transition-all duration-200 flex items-start gap-3 group">
              <div className="p-2 bg-accent/10 rounded-lg shrink-0">
                <Leaf className="w-5 h-5 text-accent" />
              </div>
              <div>
                <h3 className="text-sm font-bold font-display text-fg group-hover:text-accent transition-colors">{post.title}</h3>
                <p className="text-[10px] text-muted mt-1">{post.date}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-muted group-hover:text-accent ml-auto shrink-0 transition-colors" />
            </a>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-accent py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <h2 className="text-3xl md:text-4xl font-bold font-display text-white">
            Start Your Sustainability Journey Today
          </h2>
          <p className="text-white/80 max-w-xl mx-auto">
            Join thousands of users tracking their carbon footprint with AI. It's free, takes 2 minutes, and every action counts.
          </p>
          <a href="#auth-section"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-white text-accent font-bold rounded-xl border border-black shadow-hard-offset hover:bg-stone-100 transition-all text-sm">
            Create Free Account <ChevronRight className="w-4 h-4" />
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-fg text-white/70 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-2 space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
                  <Leaf className="w-4 h-4 text-white fill-white/20" />
                </div>
                <span className="font-display font-bold text-white text-lg">MahiKosh</span>
              </div>
              <p className="text-sm text-white/50 max-w-sm">
                AI-powered carbon footprint tracker making sustainable living measurable, motivating, and rewarding for everyone.
              </p>
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-white/60 mb-4">Product</h4>
              <ul className="space-y-2">
                <li><a href="#features" className="text-sm hover:text-white transition-colors">Features</a></li>
                <li><a href="#auth-section" className="text-sm hover:text-white transition-colors">Sign Up</a></li>
                <li><a href="https://MahiKosh-solution.netlify.app/blog/sustainable-living-for-beginners.html" className="text-sm hover:text-white transition-colors">Blog</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-white/60 mb-4">Resources</h4>
              <ul className="space-y-2">
                <li><a href="/blog/carbon-footprint-calculator-india.html" className="text-sm hover:text-white transition-colors">Carbon Calculator India</a></li>
                <li><a href="/blog/how-to-calculate-carbon-footprint.html" className="text-sm hover:text-white transition-colors">Calculate Your Footprint</a></li>
                <li><a href="/blog/10-ways-to-reduce-carbon-footprint-at-home.html" className="text-sm hover:text-white transition-colors">Reduce Emissions</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-10 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs text-white/40">&copy; 2026 MahiKosh. Built for a sustainable future.</p>
            <div className="flex gap-4 text-xs text-white/40">
              <span>AI-Powered Carbon Footprint Tracker</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
