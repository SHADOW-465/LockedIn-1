import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Lock, Sparkles, Trophy, Flame, TrendingUp, Calendar, Heart, ShieldAlert, ArrowRight, 
  UserCheck, Clock, Fingerprint, Activity, ShieldCheck, RefreshCw, AlertCircle, Plus, Trash2, X, ChevronLeft, ChevronRight, CheckCircle2, Sparkle
} from "lucide-react";
import { UserProfile, DailyEntry, UrgeEvent, OnboardingState, PhysicalTracking, RemovalRecord } from "../types";
import { MilestoneBadgeList } from "./MilestoneBadge";

// Premium badass discipline affirmations
const AFFIRMATIONS = [
  "True freedom is found within boundaries, not in impulsive defaults.",
  "Your mind rules your body. Honor your promise and stand firm today.",
  "Every urge is just undirected fuel. Convert it into focus and raw creative power.",
  "The restriction is physical, but the masterclass is entirely mental.",
  "You are not a slave to split-second chemicals. You are a sovereign, locked-in mind.",
  "The key is silent, but your daily consistency speaks with absolute authority.",
  "Discipline is simply choosing what you want most over what you want now.",
  "The storm of desire will break. The rock of your promise will remain.",
  "By choosing constraint, you conquer the exhausting chaos of endless choices.",
  "Your streak is the concrete foundation of a powerful new identity.",
  "Strength does not come from passive ease, but from the friction of resistance.",
  "Every second locked is a second you choose self-mastery over temporary release.",
  "Commitment is doing what you said you would do, long after the emotion has faded.",
  "The lock is not confinement; it is the container where true character is distilled.",
  "Focus on building the ultimate version of yourself. Convenience is the enemy."
];

interface DashboardProps {
  profile: UserProfile;
  entries: DailyEntry[];
  urges: UrgeEvent[];
  todayEntry: DailyEntry | undefined;
  onStartRitual: (type: "morning" | "evening") => void;
  onTriggerSupport: () => void;
  onNavigateToTab: (tab: string) => void;
  onboarding: OnboardingState;
  physicalTracking: PhysicalTracking;
  onUpdatePhysicalTracking: (tracking: PhysicalTracking) => void;
}

export default function Dashboard({
  profile,
  entries,
  urges,
  todayEntry,
  onStartRitual,
  onTriggerSupport,
  onNavigateToTab,
  onboarding,
  physicalTracking,
  onUpdatePhysicalTracking,
}: DashboardProps) {
  // Completion states
  const morningDone = todayEntry?.morningCompleted || false;
  const eveningDone = todayEntry?.eveningCompleted || false;

  // --- 1. Live Chastity Timer State ---
  const [elapsed, setElapsed] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState<"june" | "july">("july");
  const [selectedCalendarDay, setSelectedCalendarDay] = useState<string | null>(null);

  useEffect(() => {
    const start = new Date(profile.startDate || "2026-06-24T08:00:00Z").getTime();
    
    const updateTimer = () => {
      const now = Date.now();
      const diffMs = now - start;
      if (diffMs <= 0) {
        setElapsed({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }
      const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);
      setElapsed({ days, hours, minutes, seconds });
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [profile.startDate]);

  // --- 2. Live Ritual Window Ticker ---
  const [liveTimeStr, setLiveTimeStr] = useState("");
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setLiveTimeStr(now.toTimeString().substring(0, 5)); // e.g. "08:34"
    };
    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  // Helper: check if within reminder window (+/- 1 hr)
  const checkWithinWindow = (reminderTime: string): boolean => {
    if (!reminderTime) return false;
    const [remH, remM] = reminderTime.split(":").map(Number);
    const now = new Date();
    const nowH = now.getHours();
    const nowM = now.getMinutes();
    
    const reminderMinutes = remH * 60 + remM;
    const currentMinutes = nowH * 60 + nowM;
    const diff = Math.abs(currentMinutes - reminderMinutes);
    return diff <= 60; // 1 Hour window
  };

  const isMorningWindowActive = onboarding.enableMorning && checkWithinWindow(onboarding.morningReminder) && !morningDone;
  const isEveningWindowActive = onboarding.enableEvening && checkWithinWindow(onboarding.eveningReminder) && morningDone && !eveningDone;

  // --- 3. Daily Affirmation logic ---
  const [affirmationIdx, setAffirmationIdx] = useState(0);
  useEffect(() => {
    // Generate day-stable index
    const todayStr = new Date().toISOString().split("T")[0];
    let hash = 0;
    for (let i = 0; i < todayStr.length; i++) {
      hash += todayStr.charCodeAt(i);
    }
    setAffirmationIdx(hash % AFFIRMATIONS.length);
  }, []);

  const handleRotateAffirmation = () => {
    setAffirmationIdx((prev) => (prev + 1) % AFFIRMATIONS.length);
  };

  // --- 4. Physical Telemetry updates ---
  const handleIncTouch = () => {
    onUpdatePhysicalTracking({
      ...physicalTracking,
      cageTouches: physicalTracking.cageTouches + 1,
    });
  };

  const handleIncUrge = () => {
    onUpdatePhysicalTracking({
      ...physicalTracking,
      unlockUrges: physicalTracking.unlockUrges + 1,
    });
  };

  const handleIncTingle = () => {
    onUpdatePhysicalTracking({
      ...physicalTracking,
      tingleStrokes: physicalTracking.tingleStrokes + 1,
    });
  };

  // Log cage removal with purpose
  const [removalPurpose, setRemovalPurpose] = useState("");
  const [showRemovalForm, setShowRemovalForm] = useState(false);

  const handleAddRemoval = (e: React.FormEvent) => {
    e.preventDefault();
    if (!removalPurpose.trim()) return;

    const newRecord: RemovalRecord = {
      id: "rem-" + Date.now(),
      timestamp: new Date().toISOString(),
      purpose: removalPurpose.trim(),
    };

    onUpdatePhysicalTracking({
      ...physicalTracking,
      cageRemovals: [newRecord, ...physicalTracking.cageRemovals],
    });

    setRemovalPurpose("");
    setShowRemovalForm(false);
  };

  const handleDeleteRemoval = (id: string) => {
    onUpdatePhysicalTracking({
      ...physicalTracking,
      cageRemovals: physicalTracking.cageRemovals.filter((r) => r.id !== id),
    });
  };

  // --- 5. Sparkline computation ---
  const getSparklineData = () => {
    const dataPoints = [];
    const oneDayMs = 24 * 60 * 60 * 1000;
    const now = new Date();
    
    // Calculate past 7 days (6 days ago to today)
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getTime() - i * oneDayMs);
      const dateStr = d.toISOString().split("T")[0];
      const entry = entries.find((e) => e.date === dateStr);
      
      let score = 0;
      if (entry) {
        if (entry.morningCompleted) score += 50;
        if (entry.eveningCompleted) score += 50;
      }
      dataPoints.push({
        date: dateStr,
        dayLabel: d.toLocaleDateString(undefined, { weekday: "narrow" }),
        score: score,
      });
    }
    return dataPoints;
  };

  const sparkPoints = getSparklineData();
  
  // Construct coordinates for SVGs (200x50 box)
  // x goes from 10 to 190. y goes from 45 (score 0) to 5 (score 100).
  const coordinates = sparkPoints.map((p, i) => {
    const x = 10 + i * (180 / 6);
    const y = 45 - (p.score / 100) * 35;
    return { x, y, ...p };
  });

  const pathD = coordinates.reduce((acc, curr, i) => {
    return i === 0 ? `M ${curr.x} ${curr.y}` : `${acc} L ${curr.x} ${curr.y}`;
  }, "");

  const fillD = pathD ? `${pathD} L 190 48 L 10 48 Z` : "";

  // Dynamic greeting
  const getGreeting = () => {
    const hr = new Date().getHours();
    if (hr < 12) return "Good Morning";
    if (hr < 17) return "Good Afternoon";
    return "Good Evening";
  };

  const getWeeklyProgress = () => {
    if (entries.length === 0) return 100;
    const oneDayMs = 24 * 60 * 60 * 1000;
    const nowMs = Date.now();
    const last7DaysEntries = entries.filter((e) => {
      const entryTime = e.timestamp || Date.parse(e.date);
      return nowMs - entryTime <= 7 * oneDayMs;
    });
    
    const completedCount = last7DaysEntries.reduce((acc, curr) => {
      let count = 0;
      if (curr.morningCompleted) count++;
      if (curr.eveningCompleted) count++;
      return acc + count;
    }, 0);

    const activeDays = Math.max(1, last7DaysEntries.length);
    const ratio = Math.round((completedCount / (activeDays * 2)) * 100);
    return Math.min(100, Math.max(20, ratio));
  };

  const getRitualsDoneCount = () => {
    return entries.reduce((acc, curr) => {
      let count = 0;
      if (curr.morningCompleted) count++;
      if (curr.eveningCompleted) count++;
      return acc + count;
    }, 0);
  };

  const urgesOvercomeCount = urges.filter((u) => u.resolved).length;

  const getLatestReflection = () => {
    const entriesWithStory = [...entries]
      .filter((e) => e.story || e.quote)
      .sort((a, b) => b.dayNumber - a.dayNumber);

    if (entriesWithStory.length > 0) {
      const latest = entriesWithStory[0];
      return {
        text: latest.story ? `"${latest.story.substring(0, 180)}..."` : `"${latest.journalText}"`,
        label: `REFLECTING ON DAY ${latest.dayNumber}`
      };
    }
    return {
      text: `"You showed up for yourself again today, ${profile.name}. That is what strength looks like. Your consistency shows a shift in your identity."`,
      label: "COMPANION REFLECTION"
    };
  };

  const reflection = getLatestReflection();

  // Selected calendar day detail inspection
  const selectedDayEntry = entries.find((e) => e.date === selectedCalendarDay);

  // Calendar render cells helper
  const renderCalendarDays = () => {
    const isJuly = calendarMonth === "july";
    const daysInMonth = isJuly ? 31 : 30;
    const offset = isJuly ? 3 : 1; // July 1 2026 is Wed(3), June 1 2026 is Mon(1)
    const monthPrefix = isJuly ? "2026-07" : "2026-06";
    const cells = [];
    
    // Padding
    for (let i = 0; i < offset; i++) {
      cells.push(<div key={`empty-${i}`} className="h-11 bg-zinc-950/20 rounded-xl opacity-25" />);
    }
    
    const startDateMs = new Date(profile.startDate || "2026-06-24T08:00:00Z").getTime();
    const todayDateStr = new Date().toISOString().split("T")[0];

    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${monthPrefix}-${day.toString().padStart(2, '0')}`;
      const entry = entries.find((e) => e.date === dateStr);
      
      const thisDateMs = new Date(dateStr).getTime();
      const isPastOrToday = thisDateMs <= Date.parse(todayDateStr);
      const isLocked = isPastOrToday && (thisDateMs >= startDateMs || entry !== undefined);
      
      const isSelected = selectedCalendarDay === dateStr;
      
      cells.push(
        <button
          key={`day-${day}`}
          type="button"
          onClick={() => {
            if (isLocked) {
              setSelectedCalendarDay(dateStr);
            } else {
              alert(`Day ${day} has no historical check-in data yet.`);
            }
          }}
          className={`h-11 rounded-xl text-[11px] font-mono font-bold flex flex-col items-center justify-between p-1 transition border cursor-pointer relative ${
            isSelected
              ? "bg-[#ccff00] text-black border-[#ccff00] shadow-[0_0_12px_rgba(204,255,0,0.4)]"
              : isLocked
                ? entry?.morningCompleted && entry?.eveningCompleted
                  ? "bg-[#ccff00]/10 border-[#ccff00]/40 text-[#ccff00] hover:bg-[#ccff00]/20"
                  : "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20"
                : "bg-zinc-900/30 border-zinc-900/40 text-zinc-600 hover:bg-zinc-900/50 hover:text-zinc-400"
          }`}
        >
          <span className="self-start">{day}</span>
          {isLocked && !isSelected && (
            <span className="text-[10px] text-emerald-400/80 leading-none">🔒</span>
          )}
        </button>
      );
    }
    return cells;
  };

  return (
    <div className="space-y-6 pb-20 animate-fade-in relative">
      {/* --- RITUAL WINDOW DETECTED NOTIFICATION UI --- */}
      <AnimatePresence>
        {(isMorningWindowActive || isEveningWindowActive) && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="p-4 rounded-[20px] bg-emerald-500/10 border-2 border-emerald-500/30 flex items-start gap-3 shadow-[0_4px_20px_rgba(16,185,129,0.15)]"
          >
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5 animate-pulse">
              <Clock className="w-4.5 h-4.5" />
            </div>
            <div className="space-y-1 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 rounded uppercase tracking-wider animate-pulse">
                  Active Ritual Window
                </span>
                <span className="text-[10px] font-mono text-zinc-500">Live: {liveTimeStr}</span>
              </div>
              <h4 className="text-xs font-bold text-white font-mono">
                {isMorningWindowActive 
                  ? `Morning check-in is PENDING (Window: ${onboarding.morningReminder})` 
                  : `Evening reflection is PENDING (Window: ${onboarding.eveningReminder})`
                }
              </h4>
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                You are currently inside your configured check-in frame. Lock verify and save your daily autobiography logs now.
              </p>
              <button
                type="button"
                onClick={() => onStartRitual(isMorningWindowActive ? "morning" : "evening")}
                className="mt-2 px-3 py-1 bg-[#ccff00] text-black hover:opacity-90 active:scale-[0.98] font-bold text-[10px] font-mono rounded-lg transition cursor-pointer flex items-center gap-1"
              >
                Launch Checklist <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Welcome Bar */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            {getGreeting()}, <span className="text-[#ccff00]">{profile.name}</span>
          </h1>
          <p className="text-xs text-zinc-500 font-mono mt-0.5">
            Discipline builds absolute freedom.
          </p>
        </div>
        <button
          type="button"
          onClick={() => onNavigateToTab("profile")}
          className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-[#ccff00] cursor-pointer"
        >
          <Sparkles className="w-5 h-5" />
        </button>
      </div>

      {/* Hero Lock Card - Ticking Live Timer inside. Clicking opens Calendar */}
      <motion.div
        animate={{
          boxShadow: [
            "0 10px 30px -15px rgba(204,255,0,0.1)",
            "0 10px 35px -12px rgba(204,255,0,0.25)",
            "0 10px 30px -15px rgba(204,255,0,0.1)",
          ],
        }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="relative overflow-hidden bg-zinc-950 border border-[#ccff00]/25 rounded-[32px] p-6 flex flex-col items-center text-center"
      >
        <div className="absolute top-0 right-0 w-48 h-48 bg-[#ccff00]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-36 h-36 bg-[#ccff00]/3 rounded-full blur-2xl pointer-events-none" />

        <div className="w-14 h-14 bg-[#ccff00]/10 border border-[#ccff00]/30 rounded-full flex items-center justify-center mb-3">
          <Lock className="w-6 h-6 text-[#ccff00]" />
        </div>

        <p className="text-[10px] tracking-widest text-zinc-500 uppercase font-mono mb-1">
          CHASTITY LOCK TIMELINE (CLICK TIMER FOR FULL CALENDAR)
        </p>

        {/* Live Elapsed Time Ticker (Interactive Button to trigger Calendar) */}
        <button
          type="button"
          onClick={() => {
            setIsCalendarOpen(true);
            setSelectedCalendarDay(new Date().toISOString().split("T")[0]);
          }}
          className="my-1.5 focus:outline-none hover:opacity-80 transition cursor-pointer group"
          title="Open chastity calendar"
        >
          <div className="text-4xl font-black text-white tracking-tight flex items-center justify-center gap-1.5 font-mono">
            <span>{elapsed.days}d</span>
            <span className="text-zinc-600 group-hover:text-[#ccff00]">:</span>
            <span>{elapsed.hours.toString().padStart(2, "0")}h</span>
            <span className="text-zinc-600 group-hover:text-[#ccff00]">:</span>
            <span>{elapsed.minutes.toString().padStart(2, "0")}m</span>
            <span className="text-zinc-600 group-hover:text-[#ccff00]">:</span>
            <span className="text-[#ccff00]">{elapsed.seconds.toString().padStart(2, "0")}s</span>
          </div>
          <div className="text-[10px] text-[#ccff00]/75 font-mono mt-2 flex items-center justify-center gap-1">
            <Calendar className="w-3.5 h-3.5" /> View Autobiography Calendar Grid
          </div>
        </button>

        <p className="text-[11px] text-zinc-400 font-mono flex items-center gap-1.5 mt-2">
          <Flame className="w-3.5 h-3.5 text-[#ccff00]" /> Started on {new Date(profile.startDate || "2026-06-24T08:00:00Z").toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
        </p>

        <div className="w-full bg-zinc-900/40 border border-zinc-900 rounded-2xl p-4 mt-5 space-y-3">
          <div className="flex justify-between items-center text-xs font-mono">
            <span className="text-zinc-500">Target Session progress:</span>
            <span className="text-[#ccff00] font-bold">
              {profile.currentStreak} / {profile.targetGoalDays || 30} Days
            </span>
          </div>
          <div className="w-full h-2 bg-zinc-900 rounded-full overflow-hidden border border-zinc-850">
            <div 
              className="h-full bg-gradient-to-r from-emerald-500 to-[#ccff00] rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, Math.round((profile.currentStreak / (profile.targetGoalDays || 30)) * 100))}%` }}
            />
          </div>
          <div className="flex justify-between items-center text-[10px] font-mono text-zinc-600">
            <span>Day 1</span>
            <span>Day {profile.targetGoalDays || 30} Target</span>
          </div>
        </div>
      </motion.div>

      {/* --- DAILY DISCIPLINE AFFIRMATION CARD --- */}
      <div className="bg-zinc-950 border border-zinc-900 rounded-[28px] p-5 relative overflow-hidden">
        <div className="absolute right-4 top-4">
          <button
            type="button"
            onClick={handleRotateAffirmation}
            className="p-1.5 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-[#ccff00] rounded-lg transition cursor-pointer"
            title="Next Affirmation"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-zinc-500 uppercase tracking-wider mb-2">
          <Sparkle className="w-4 h-4 text-[#ccff00]" /> Daily Discipline Affirmation
        </div>

        <p className="text-sm text-zinc-200 font-sans italic leading-relaxed pl-3 border-l-2 border-[#ccff00]/60 py-1">
          "{AFFIRMATIONS[affirmationIdx]}"
        </p>
      </div>

      {/* Main Grid: Bento Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Card 1: Today's Plan */}
        <div className="bg-zinc-950 border border-zinc-900 rounded-[28px] p-6 space-y-4">
          <h3 className="text-sm font-mono text-zinc-500 uppercase tracking-wider">
            TODAY'S RITUALS
          </h3>

          <div className="space-y-3">
            {/* Morning Ritual Row */}
            <div className={`flex items-center justify-between p-3.5 rounded-2xl border ${isMorningWindowActive ? "bg-emerald-500/5 border-emerald-500/30" : "bg-zinc-900/40 border-zinc-900"}`}>
              <div>
                <p className="text-sm font-bold text-white flex items-center gap-1.5">
                  Morning Ritual
                  {isMorningWindowActive && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />}
                </p>
                <p className="text-xs text-zinc-500 mt-0.5">Start day with intent & verify</p>
              </div>
              {morningDone ? (
                <div className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full text-xs font-mono font-bold">
                  Completed
                </div>
              ) : (
                <button
                  onClick={() => onStartRitual("morning")}
                  className="px-4 py-2 bg-[#ccff00] text-black hover:opacity-90 active:scale-[0.97] transition font-bold text-xs rounded-xl cursor-pointer"
                >
                  Start
                </button>
              )}
            </div>

            {/* Evening Reflection Row */}
            <div className={`flex items-center justify-between p-3.5 rounded-2xl border ${isEveningWindowActive ? "bg-emerald-500/5 border-emerald-500/30" : "bg-zinc-900/40 border-zinc-900"}`}>
              <div>
                <p className="text-sm font-bold text-white flex items-center gap-1.5">
                  Evening Reflection
                  {isEveningWindowActive && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />}
                </p>
                <p className="text-xs text-zinc-500 mt-0.5">End day with clarity & journal</p>
              </div>
              {!morningDone ? (
                <span className="text-zinc-600 text-xs font-mono">Locks in Evening</span>
              ) : eveningDone ? (
                <div className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full text-xs font-mono font-bold">
                  Completed
                </div>
              ) : (
                <button
                  onClick={() => onStartRitual("evening")}
                  className="px-4 py-2 bg-[#ccff00] text-black hover:opacity-90 active:scale-[0.97] transition font-bold text-xs rounded-xl cursor-pointer"
                >
                  Reflect
                </button>
              )}
            </div>

            {/* Urge Support Row */}
            <div className="flex items-center justify-between p-3.5 bg-rose-500/5 border border-rose-500/10 rounded-2xl">
              <div>
                <p className="text-sm font-bold text-rose-400 flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4" /> Urge Support
                </p>
                <p className="text-xs text-zinc-500 mt-0.5">Feeling restless? I'm here</p>
              </div>
              <button
                onClick={onTriggerSupport}
                className="px-4 py-2 bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20 text-rose-400 font-bold text-xs rounded-xl transition cursor-pointer"
              >
                Help
              </button>
            </div>
          </div>
        </div>

        {/* Card 2: Your Progress & MINI SPARKLINE INTEGRITY TREND */}
        <div className="bg-zinc-950 border border-zinc-900 rounded-[28px] p-6 flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-sm font-mono text-zinc-500 uppercase tracking-wider">
              SESSION PROGRESS
            </h3>
            
            <div className="flex items-center gap-5">
              {/* Radial Progress Ring */}
              <div className="relative w-20 h-20 flex items-center justify-center shrink-0">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="40"
                    cy="40"
                    r="34"
                    stroke="#18181b"
                    strokeWidth="6"
                    fill="transparent"
                  />
                  <circle
                    cx="40"
                    cy="40"
                    r="34"
                    stroke="#ccff00"
                    strokeWidth="6"
                    fill="transparent"
                    strokeDasharray={2 * Math.PI * 34}
                    strokeDashoffset={2 * Math.PI * 34 * (1 - Math.min(1, profile.currentStreak / 90))}
                    strokeLinecap="round"
                    className="transition-all duration-1000"
                  />
                </svg>
                <div className="absolute text-center">
                  <span className="text-sm font-black text-white">{Math.round((profile.currentStreak / 90) * 100)}%</span>
                  <p className="text-[7px] font-mono text-zinc-500">OF 90 DAYS</p>
                </div>
              </div>

              <div className="space-y-1.5 text-[11px] font-mono text-zinc-400 flex-1">
                <p className="flex justify-between">
                  <span>Weekly Progress:</span>
                  <span className="text-white font-bold">{getWeeklyProgress()}%</span>
                </p>
                <p className="flex justify-between">
                  <span>Rituals Done:</span>
                  <span className="text-[#ccff00] font-bold">{getRitualsDoneCount()}</span>
                </p>
                <p className="flex justify-between">
                  <span>Urges Overcome:</span>
                  <span className="text-rose-400 font-bold">{urgesOvercomeCount}</span>
                </p>
              </div>
            </div>

            {/* --- MINI SPARKLINE GRAPH --- */}
            <div className="bg-zinc-900/20 border border-zinc-900 p-3 rounded-2xl space-y-1">
              <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500">
                <span className="flex items-center gap-1"><TrendingUp className="w-3 h-3 text-[#ccff00]" /> 7d Integrity trend</span>
                <span className="text-[#ccff00] font-bold">score index</span>
              </div>

              <div className="relative h-14 w-full bg-zinc-950/40 rounded-lg overflow-hidden flex items-end">
                {/* SVG sparkline graph */}
                <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 200 50">
                  <defs>
                    <linearGradient id="sparklineGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#ccff00" stopOpacity="0.18" />
                      <stop offset="100%" stopColor="#ccff00" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  
                  {/* Fill path */}
                  {fillD && <path d={fillD} fill="url(#sparklineGrad)" />}
                  
                  {/* Neon Line Path */}
                  {pathD && (
                    <path
                      d={pathD}
                      fill="none"
                      stroke="#ccff00"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="drop-shadow-[0_0_4px_rgba(204,255,0,0.6)]"
                    />
                  )}

                  {/* Scatter dots */}
                  {coordinates.map((pt, idx) => (
                    <circle
                      key={idx}
                      cx={pt.x}
                      cy={pt.y}
                      r="2.5"
                      fill={pt.score > 0 ? "#ccff00" : "#ef4444"}
                      stroke="#09090b"
                      strokeWidth="1"
                    />
                  ))}
                </svg>
              </div>

              {/* Day Labels */}
              <div className="flex justify-between px-2 text-[9px] font-mono text-zinc-600">
                {coordinates.map((pt, idx) => (
                  <span key={idx} className={pt.score > 0 ? "text-[#ccff00]" : "text-zinc-600"}>{pt.dayLabel}</span>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-zinc-900 flex justify-between items-center text-xs font-mono text-zinc-500">
            <span>Current Chapter:</span>
            <span className="text-[#ccff00] font-bold cursor-pointer flex items-center" onClick={() => onNavigateToTab("memoir")}>
              Finding Stability <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </span>
          </div>
        </div>
      </div>

      {/* --- CAGE PHYSICAL TELEMETRY CARD & TRACKING BUTTONS --- */}
      <div className="bg-zinc-950 border border-zinc-900 rounded-[28px] p-6 space-y-5">
        <div className="flex items-center justify-between border-b border-zinc-900/60 pb-2">
          <h3 className="text-xs font-mono text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
            <Fingerprint className="w-4 h-4 text-[#ccff00]" /> Hardware & Sensation Logs
          </h3>
          <span className="text-[10px] font-mono text-zinc-400 bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded-full">
            Local Telemetry
          </span>
        </div>

        <p className="text-xs text-zinc-400 font-mono leading-normal">
          Track physical occurrences, sensory stimulations, and cage removals immediately below to synchronize with your secure offline memory.
        </p>

        {/* Counter grid */}
        <div className="grid grid-cols-3 gap-3">
          {/* Cage Touches counter */}
          <div className="bg-zinc-900/30 border border-zinc-900 p-3 rounded-2xl flex flex-col justify-between items-center text-center">
            <span className="text-[9px] font-mono text-zinc-500 uppercase">Cage Touches</span>
            <span className="text-xl font-bold font-mono text-white my-1">{physicalTracking.cageTouches}</span>
            <button
              onClick={handleIncTouch}
              className="px-2.5 py-1 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-lg text-[10px] font-mono text-[#ccff00] font-bold w-full active:scale-95 transition cursor-pointer"
            >
              + Touch
            </button>
          </div>

          {/* Sensation/Stroke urges */}
          <div className="bg-zinc-900/30 border border-zinc-900 p-3 rounded-2xl flex flex-col justify-between items-center text-center">
            <span className="text-[9px] font-mono text-zinc-500 uppercase">Stroke Tingles</span>
            <span className="text-xl font-bold font-mono text-white my-1">{physicalTracking.tingleStrokes}</span>
            <button
              onClick={handleIncTingle}
              className="px-2.5 py-1 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-lg text-[10px] font-mono text-[#ccff00] font-bold w-full active:scale-95 transition cursor-pointer"
            >
              + Sensation
            </button>
          </div>

          {/* Urges to unlock */}
          <div className="bg-zinc-900/30 border border-zinc-900 p-3 rounded-2xl flex flex-col justify-between items-center text-center">
            <span className="text-[9px] font-mono text-zinc-500 uppercase">Unlock Urges</span>
            <span className="text-xl font-bold font-mono text-white my-1">{physicalTracking.unlockUrges}</span>
            <button
              onClick={handleIncUrge}
              className="px-2.5 py-1 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-lg text-[10px] font-mono text-[#ccff00] font-bold w-full active:scale-95 transition cursor-pointer"
            >
              + Unlock
            </button>
          </div>
        </div>

        {/* Removals logging */}
        <div className="pt-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-white flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-[#ccff00]" /> Cage Removal Events ({physicalTracking.cageRemovals.length})
            </span>
            <button
              onClick={() => setShowRemovalForm(!showRemovalForm)}
              className="px-3 py-1 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 rounded-lg text-[10px] font-mono font-bold text-[#ccff00] cursor-pointer"
            >
              {showRemovalForm ? "Cancel" : "Log Removal"}
            </button>
          </div>

          <AnimatePresence>
            {showRemovalForm && (
              <motion.form
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                onSubmit={handleAddRemoval}
                className="overflow-hidden mt-3 p-3 bg-zinc-900/50 border border-zinc-900 rounded-2xl space-y-3"
              >
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono text-zinc-500 uppercase">Purpose / Reason for Removal:</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. hygiene/shaving, medical examination, security adjustment"
                    value={removalPurpose}
                    onChange={(e) => setRemovalPurpose(e.target.value)}
                    className="w-full bg-black border border-zinc-800 focus:border-[#ccff00] focus:outline-none px-3 py-2 rounded-xl text-xs font-mono text-zinc-200 placeholder-zinc-700"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2 bg-[#ccff00] text-black font-bold font-mono text-xs rounded-xl hover:opacity-90 active:scale-95 transition cursor-pointer"
                >
                  Save Removal Event
                </button>
              </motion.form>
            )}
          </AnimatePresence>

          {/* Removals list */}
          <div className="mt-3 space-y-2 max-h-[160px] overflow-auto pr-1">
            {physicalTracking.cageRemovals.length === 0 ? (
              <p className="text-[10px] text-zinc-600 font-mono italic">No hardware removal logs captured in this session.</p>
            ) : (
              physicalTracking.cageRemovals.map((record) => (
                <div key={record.id} className="flex justify-between items-center bg-zinc-900/20 border border-zinc-900/60 p-2.5 rounded-xl text-[11px] font-mono">
                  <div>
                    <span className="text-zinc-500 block text-[9px]">{new Date(record.timestamp).toLocaleString()}</span>
                    <span className="text-zinc-200 font-bold">{record.purpose}</span>
                  </div>
                  <button
                    onClick={() => handleDeleteRemoval(record.id)}
                    className="p-1 bg-zinc-900 hover:bg-rose-500/10 border border-zinc-800 hover:border-rose-500/20 text-zinc-600 hover:text-rose-400 rounded-lg cursor-pointer"
                    title="Delete log"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* --- INTEGRATED MILESTONE BADGE BOARD --- */}
      <MilestoneBadgeList profile={profile} entries={entries} urges={urges} />

      {/* Bento Row 2: Your Identity & Custom AI Reflection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Your Identity */}
        <div className="bg-zinc-950 border border-zinc-900 rounded-[28px] p-6 space-y-4">
          <h3 className="text-sm font-mono text-zinc-500 uppercase tracking-wider">
            YOUR DISCIPLINE IDENTITY
          </h3>
          <div className="flex flex-wrap gap-2">
            {["Disciplined", "Focused", "Unstoppable", "Sacred Promises"].map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 bg-zinc-900 border border-zinc-800 text-xs font-mono font-bold text-zinc-300 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
          <div className="bg-zinc-900/30 border border-zinc-900/50 rounded-2xl p-4 italic text-xs leading-relaxed text-zinc-400">
            <span className="text-[#ccff00] font-serif text-lg font-bold">"</span>
            {profile.commitment}
            <span className="text-[#ccff00] font-serif text-lg font-bold">"</span>
          </div>
        </div>

        {/* AI Companion Reflection Card */}
        <div className="bg-zinc-950 border border-zinc-900 rounded-[28px] p-6 space-y-4 relative overflow-hidden">
          <div className="absolute top-2 right-2 px-2.5 py-0.5 bg-[#ccff00]/10 text-[#ccff00] text-[9px] font-mono uppercase tracking-widest rounded-full">
            Companion
          </div>
          <h3 className="text-sm font-mono text-zinc-500 uppercase tracking-wider">
            {reflection.label}
          </h3>
          <p className="text-xs text-zinc-400 leading-relaxed italic">
            {reflection.text}
          </p>
          <div className="pt-2">
            <button
              onClick={() => onNavigateToTab("companion")}
              className="text-xs font-mono font-bold text-[#ccff00] flex items-center gap-1 hover:underline cursor-pointer"
            >
              Write to Companion <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Next Milestone */}
      <div className="bg-zinc-950 border border-[#ccff00]/10 rounded-[28px] p-6 flex justify-between items-center relative overflow-hidden">
        <div className="absolute right-0 top-0 w-24 h-24 bg-[#ccff00]/5 rounded-full blur-2xl pointer-events-none" />
        <div className="space-y-1">
          <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
            NEXT MILESTONE
          </p>
          <h4 className="text-base font-bold text-white flex items-center gap-1.5">
            <Trophy className="w-4.5 h-4.5 text-[#ccff00]" /> 50 Days of Commitment
          </h4>
          <p className="text-xs text-zinc-400">Consistency is built one day at a time.</p>
        </div>
        <div className="text-right">
          <span className="text-sm font-mono text-[#ccff00] font-bold">13 days to go</span>
          <div className="w-24 bg-zinc-900 h-1.5 rounded-full overflow-hidden mt-1.5">
            <div className="bg-[#ccff00] h-full" style={{ width: "74%" }} />
          </div>
        </div>
      </div>

      {/* --- 6. FULL OVERVIEW AUTOBIOGRAPHY CALENDAR MODAL OVERLAY --- */}
      <AnimatePresence>
        {isCalendarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 z-50 overflow-y-auto p-4 flex items-center justify-center backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="w-full max-w-md bg-zinc-950 border-2 border-[#ccff00]/30 rounded-[32px] p-6 space-y-5 shadow-[0_0_50px_rgba(204,255,0,0.15)] my-8"
            >
              {/* Modal Title Bar */}
              <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-[#ccff00]" />
                  <div>
                    <h3 className="text-sm font-bold text-white font-mono">Chastity Autobiography Calendar</h3>
                    <p className="text-[10px] text-zinc-500 font-mono">Real-time locks & verification states</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsCalendarOpen(false)}
                  className="p-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-full transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Statistics Panel */}
              <div className="grid grid-cols-2 gap-3 bg-zinc-900/30 border border-zinc-900 p-4 rounded-2xl font-mono text-xs">
                <div className="space-y-0.5">
                  <span className="text-zinc-500 text-[10px]">TOTAL DAYS LOCKED</span>
                  <p className="text-lg font-bold text-[#ccff00]">{profile.currentStreak} Days</p>
                </div>
                <div className="space-y-0.5 text-right">
                  <span className="text-zinc-500 text-[10px]">RECORD SESSION</span>
                  <p className="text-lg font-bold text-white">{profile.longestSession} Days</p>
                </div>
              </div>

              {/* Calendar Month Switcher */}
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setCalendarMonth("june")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold border transition cursor-pointer ${
                    calendarMonth === "june"
                      ? "bg-[#ccff00] text-black border-[#ccff00]"
                      : "bg-zinc-900/40 border-zinc-900 text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  June 2026
                </button>
                <div className="text-xs font-bold text-white font-mono uppercase">
                  {calendarMonth} 2026
                </div>
                <button
                  type="button"
                  onClick={() => setCalendarMonth("july")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold border transition cursor-pointer ${
                    calendarMonth === "july"
                      ? "bg-[#ccff00] text-black border-[#ccff00]"
                      : "bg-zinc-900/40 border-zinc-900 text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  July 2026
                </button>
              </div>

              {/* Weekday Labels */}
              <div className="grid grid-cols-7 text-center text-[10px] font-mono text-zinc-600 font-bold">
                {["S", "M", "T", "W", "T", "F", "S"].map((day, idx) => (
                  <span key={idx}>{day}</span>
                ))}
              </div>

              {/* Calendar Days Grid */}
              <div className="grid grid-cols-7 gap-1.5">
                {renderCalendarDays()}
              </div>

              {/* Legend */}
              <div className="flex items-center justify-center gap-4 text-[10px] font-mono text-zinc-500">
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded bg-[#ccff00]/25 border border-[#ccff00]/50" /> Locked & Fully Verified
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded bg-zinc-900/30 border border-zinc-900/40" /> Non-lock Day
                </span>
              </div>

              {/* Inspect Daily Autobiography Details */}
              <div className="border-t border-zinc-900 pt-4">
                {selectedCalendarDay ? (
                  <div className="bg-zinc-900/40 border border-zinc-900 rounded-2xl p-4 space-y-3 font-mono text-xs">
                    <div className="flex items-center justify-between border-b border-zinc-900/80 pb-2">
                      <span className="text-[#ccff00] font-bold">Autobiography Page: {selectedCalendarDay}</span>
                      <span className="text-zinc-500 text-[10px]">
                        {selectedDayEntry ? `Day ${selectedDayEntry.dayNumber}` : "Pending Check-In"}
                      </span>
                    </div>

                    {selectedDayEntry ? (
                      <div className="space-y-3.5">
                        <div className="flex items-center justify-between text-[11px] text-zinc-400">
                          <span className="flex items-center gap-1">
                            Morning: {selectedDayEntry.morningCompleted ? "✅ Done" : "❌ Pending"}
                          </span>
                          <span className="flex items-center gap-1">
                            Evening: {selectedDayEntry.eveningCompleted ? "✅ Done" : "❌ Pending"}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2 text-[11px] border-y border-zinc-900/60 py-2">
                          <span className="text-zinc-400">Mood score: <strong className="text-white">{selectedDayEntry.mood}/5</strong></span>
                          <span className="text-zinc-400 text-right">Difficulty level: <strong className="text-white">{selectedDayEntry.difficulty}/10</strong></span>
                        </div>

                        {selectedDayEntry.journalText && (
                          <div className="space-y-1">
                            <span className="text-[10px] text-zinc-500 uppercase">Journal entry:</span>
                            <p className="text-zinc-300 font-sans italic leading-relaxed text-xs">
                              "{selectedDayEntry.journalText}"
                            </p>
                          </div>
                        )}

                        {selectedDayEntry.story && (
                          <div className="space-y-1 p-2.5 bg-zinc-950/60 border border-zinc-900 rounded-xl">
                            <span className="text-[9px] text-[#ccff00] uppercase font-bold tracking-wider">AI Narrative Reflection:</span>
                            <p className="text-zinc-400 leading-normal text-[11px]">
                              {selectedDayEntry.story}
                            </p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-4 text-zinc-500 italic text-[11px]">
                        No check-in recorded for this date.
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-center text-xs text-zinc-600 italic">Click on a highlighted locked day to view memoir logs.</p>
                )}
              </div>

              {/* Close Button */}
              <button
                type="button"
                onClick={() => setIsCalendarOpen(false)}
                className="w-full py-2.5 bg-zinc-900 hover:bg-zinc-850 text-white font-bold font-mono text-xs rounded-2xl transition cursor-pointer"
              >
                Back to Dashboard
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
