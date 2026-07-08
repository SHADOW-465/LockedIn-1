import React from "react";
import { motion } from "motion/react";
import { Lock, Sparkles, Trophy, Flame, TrendingUp, Calendar, Heart, ShieldAlert, ArrowRight, UserCheck } from "lucide-react";
import { UserProfile, DailyEntry, UrgeEvent } from "../types";

interface DashboardProps {
  profile: UserProfile;
  entries: DailyEntry[];
  urges: UrgeEvent[];
  todayEntry: DailyEntry | undefined;
  onStartRitual: (type: "morning" | "evening") => void;
  onTriggerSupport: () => void;
  onNavigateToTab: (tab: string) => void;
}

export default function Dashboard({
  profile,
  entries,
  urges,
  todayEntry,
  onStartRitual,
  onTriggerSupport,
  onNavigateToTab,
}: DashboardProps) {
  // Check completion states
  const morningDone = todayEntry?.morningCompleted || false;
  const eveningDone = todayEntry?.eveningCompleted || false;

  // 1. Dynamic Greeting
  const getGreeting = () => {
    const hr = new Date().getHours();
    if (hr < 12) return "Good Morning";
    if (hr < 17) return "Good Afternoon";
    return "Good Evening";
  };

  // 2. Dynamic Weekly Progress
  const getWeeklyProgress = () => {
    if (entries.length === 0) return 100;
    const oneDayMs = 24 * 60 * 60 * 1000;
    const nowMs = Date.now();
    const last7DaysEntries = entries.filter((e) => {
      const entryTime = e.timestamp || Date.parse(e.date);
      return nowMs - entryTime <= 7 * oneDayMs;
    });
    
    // Total completed slots in last 7 days (out of 14 maximum slots: morning + evening)
    const completedCount = last7DaysEntries.reduce((acc, curr) => {
      let count = 0;
      if (curr.morningCompleted) count++;
      if (curr.eveningCompleted) count++;
      return acc + count;
    }, 0);

    // If they have entries, calculate ratio, otherwise fallback to 100% (or dynamic streak indicator)
    const activeDays = Math.max(1, last7DaysEntries.length);
    const ratio = Math.round((completedCount / (activeDays * 2)) * 100);
    return Math.min(100, Math.max(20, ratio));
  };

  // 3. Dynamic Ritual Count
  const getRitualsDoneCount = () => {
    return entries.reduce((acc, curr) => {
      let count = 0;
      if (curr.morningCompleted) count++;
      if (curr.eveningCompleted) count++;
      return acc + count;
    }, 0);
  };

  // 4. Dynamic Urges Overcome
  const urgesOvercomeCount = urges.filter((u) => u.resolved).length;

  // 5. Dynamic Companion Reflection
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
      text: `"You showed up for yourself again today, ${profile.name}. That is what strength looks like. Your consistency shows a shift in your identity. You're not just trying, you are becoming."`,
      label: "COMPANION REFLECTION"
    };
  };

  const reflection = getLatestReflection();

  return (
    <div className="space-y-6 pb-20 animate-fade-in">
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
        <div className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-[#ccff00] cursor-pointer" onClick={() => onNavigateToTab("profile")}>
          <Sparkles className="w-5 h-5" />
        </div>
      </div>

      {/* Hero Lock Card - Breathes & Shift Colors */}
      <motion.div
        animate={{
          boxShadow: [
            "0 10px 30px -15px rgba(204,255,0,0.1)",
            "0 10px 35px -12px rgba(204,255,0,0.25)",
            "0 10px 30px -15px rgba(204,255,0,0.1)",
          ],
        }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="relative overflow-hidden bg-zinc-950 border border-[#ccff00]/20 rounded-[32px] p-6 flex flex-col items-center text-center"
      >
        <div className="absolute top-0 right-0 w-48 h-48 bg-[#ccff00]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-36 h-36 bg-[#ccff00]/3 rounded-full blur-2xl" />

        <div className="w-14 h-14 bg-[#ccff00]/10 border border-[#ccff00]/30 rounded-full flex items-center justify-center mb-4">
          <Lock className="w-6 h-6 text-[#ccff00]" />
        </div>

        <p className="text-xs tracking-widest text-zinc-500 uppercase font-mono mb-1">
          CURRENT LOCK
        </p>
        <h2 className="text-5xl font-black text-white tracking-tight flex items-baseline gap-1">
          {profile.currentStreak} <span className="text-[#ccff00] text-xl font-bold">Days</span>
        </h2>
        <p className="text-xs text-[#ccff00] font-semibold mt-2 flex items-center gap-1.5">
          <Flame className="w-3.5 h-3.5" /> Session Active & Fully Compliant
        </p>

        <div className="w-full bg-zinc-900/40 border border-zinc-900 rounded-2xl p-4 mt-6 space-y-3">
          <div className="flex justify-between items-center text-xs font-mono">
            <span className="text-zinc-500">Lock Target Progress:</span>
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

      {/* Main Grid: Bento Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Card 1: Today's Plan */}
        <div className="bg-zinc-950 border border-zinc-900 rounded-[28px] p-6 space-y-4">
          <h3 className="text-sm font-mono text-zinc-500 uppercase tracking-wider">
            TODAY'S RITUALS
          </h3>

          <div className="space-y-3">
            {/* Morning Ritual Row */}
            <div className="flex items-center justify-between p-3.5 bg-zinc-900/40 border border-zinc-900 rounded-2xl">
              <div>
                <p className="text-sm font-bold text-white">Morning Ritual</p>
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
            <div className="flex items-center justify-between p-3.5 bg-zinc-900/40 border border-zinc-900 rounded-2xl">
              <div>
                <p className="text-sm font-bold text-white">Evening Reflection</p>
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

        {/* Card 2: Your Progress */}
        <div className="bg-zinc-950 border border-zinc-900 rounded-[28px] p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-mono text-zinc-500 uppercase tracking-wider mb-4">
              SESSION PROGRESS
            </h3>
            <div className="flex items-center gap-6">
              {/* Radial Progress Ring */}
              <div className="relative w-24 h-24 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    stroke="#18181b"
                    strokeWidth="8"
                    fill="transparent"
                  />
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    stroke="#ccff00"
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray={2 * Math.PI * 40}
                    strokeDashoffset={2 * Math.PI * 40 * (1 - profile.currentStreak / 90)}
                    strokeLinecap="round"
                    className="transition-all duration-1000"
                  />
                </svg>
                <div className="absolute text-center">
                  <span className="text-lg font-black text-white">{Math.round((profile.currentStreak / 90) * 100)}%</span>
                  <p className="text-[9px] font-mono text-zinc-500">OF 90 DAYS</p>
                </div>
              </div>

              <div className="space-y-2 text-xs font-mono text-zinc-400">
                <p className="flex justify-between gap-4">
                  <span>Weekly Progress:</span>
                  <span className="text-white font-bold">{getWeeklyProgress()}%</span>
                </p>
                <p className="flex justify-between gap-4">
                  <span>Rituals Done:</span>
                  <span className="text-[#ccff00] font-bold">{getRitualsDoneCount()}</span>
                </p>
                <p className="flex justify-between gap-4">
                  <span>Urges Overcome:</span>
                  <span className="text-rose-400 font-bold">{urgesOvercomeCount}</span>
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-zinc-900 flex justify-between items-center text-xs font-mono text-zinc-500">
            <span>Current Chapter:</span>
            <span className="text-[#ccff00] font-bold cursor-pointer" onClick={() => onNavigateToTab("memoir")}>
              Finding Stability <ArrowRight className="w-3.5 h-3.5 inline ml-1" />
            </span>
          </div>
        </div>
      </div>

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
    </div>
  );
}

