import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Calendar as CalendarIcon, CheckCircle2, Clock, BookOpen, ChevronLeft, ChevronRight, Eye, Star, ShieldAlert, Activity } from "lucide-react";
import { DailyEntry, UserProfile, UrgeEvent } from "../types";

export interface HeatmapDay {
  dateStr: string;
  dayOfWeek: number;
  monthLabel: string;
  urges: UrgeEvent[];
  urgeScore: number;
  maxIntensity: number;
  entry?: DailyEntry;
}

interface TimelineProps {
  entries: DailyEntry[];
  urges: UrgeEvent[];
  profile: UserProfile;
}

export default function Timeline({ entries, urges, profile }: TimelineProps) {
  const [activeTab, setActiveTab] = useState<"today" | "history">("today");
  const [selectedEntry, setSelectedEntry] = useState<DailyEntry | null>(null);

  // Generate 12-week heatmap data ending today
  const heatmapWeeks = useMemo(() => {
    const weeks: HeatmapDay[][] = [];
    const now = new Date();
    const currentDayOfWeek = now.getDay();
    
    // Sunday of 11 weeks ago
    const currentSunday = new Date(now);
    currentSunday.setDate(now.getDate() - currentDayOfWeek);
    
    const startDate = new Date(currentSunday);
    startDate.setDate(currentSunday.getDate() - 11 * 7);
    
    let iterDate = new Date(startDate);
    for (let w = 0; w < 12; w++) {
      const weekDays: HeatmapDay[] = [];
      for (let d = 0; d < 7; d++) {
        const dateStr = iterDate.toISOString().split("T")[0];
        const dayOfWeek = iterDate.getDay();
        const monthLabel = iterDate.toLocaleDateString("en-US", { month: "short" });
        
        const dayUrges = urges.filter((u) => {
          const uDate = u.timestamp.split("T")[0];
          return uDate === dateStr;
        });
        
        const urgeScore = dayUrges.reduce((sum, u) => sum + u.intensity, 0);
        const maxIntensity = dayUrges.length > 0 ? Math.max(...dayUrges.map(u => u.intensity)) : 0;
        const entry = entries.find((e) => e.date === dateStr);
        
        weekDays.push({
          dateStr,
          dayOfWeek,
          monthLabel,
          urges: dayUrges,
          urgeScore,
          maxIntensity,
          entry
        });
        
        iterDate.setDate(iterDate.getDate() + 1);
      }
      weeks.push(weekDays);
    }
    return weeks;
  }, [urges, entries]);

  const todayStr = useMemo(() => new Date().toISOString().split("T")[0], []);
  const defaultSelectedDay = useMemo(() => {
    const flat = heatmapWeeks.flat();
    return flat.find(d => d.dateStr === todayStr) || flat[flat.length - 1];
  }, [heatmapWeeks, todayStr]);

  const [selectedHeatmapDay, setSelectedHeatmapDay] = useState<HeatmapDay | null>(defaultSelectedDay || null);

  // Sorted entries desc
  const sortedEntries = [...entries].sort((a, b) => b.dayNumber - a.dayNumber);

  // Get today's entry based on active date
  const todayEntry = entries.find((e) => {
    const todayStr = new Date().toLocaleDateString();
    return e.date === todayStr;
  }) || entries.find(e => e.dayNumber === profile.currentStreak) || entries[0];

  // Filter urges logged today
  const getTodayUrges = () => {
    const todayStr = new Date().toLocaleDateString();
    return urges.filter((u) => {
      const uDate = new Date(u.timestamp).toLocaleDateString();
      return uDate === todayStr;
    });
  };

  const todayUrges = getTodayUrges();

  return (
    <div className="space-y-6 pb-20 animate-fade-in">
      {/* Top Toggle */}
      <div className="flex bg-zinc-950 p-1.5 border border-zinc-900 rounded-2xl">
        <button
          onClick={() => setActiveTab("today")}
          className={`flex-1 py-2.5 rounded-xl font-mono text-xs font-bold transition cursor-pointer ${
            activeTab === "today"
              ? "bg-[#ccff00] text-black"
              : "text-zinc-400 hover:text-white"
          }`}
        >
          Today's Timeline
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={`flex-1 py-2.5 rounded-xl font-mono text-xs font-bold transition cursor-pointer ${
            activeTab === "history"
              ? "bg-[#ccff00] text-black"
              : "text-zinc-400 hover:text-white"
          }`}
        >
          History & Calendar
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === "today" ? (
          <motion.div
            key="today-timeline"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <div className="bg-zinc-950 border border-zinc-900 rounded-[28px] p-6">
              <h2 className="text-sm font-mono text-zinc-500 uppercase tracking-wider mb-6">
                TODAY'S CHRONOLOGY (DAY {todayEntry?.dayNumber || profile.currentStreak})
              </h2>

              {/* Vertical timeline steps */}
              <div className="space-y-6 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-[1px] before:bg-zinc-800">
                {/* Step 1: Morning Check-In */}
                <div className="flex gap-4 relative">
                  {todayEntry?.morningCompleted ? (
                    <div className="w-6 h-6 bg-emerald-500/20 border border-emerald-500/30 rounded-full flex items-center justify-center text-emerald-400 z-10 shrink-0">
                      <CheckCircle2 className="w-4.5 h-4.5" />
                    </div>
                  ) : (
                    <div className="w-6 h-6 bg-zinc-900 border border-zinc-800 rounded-full flex items-center justify-center text-zinc-600 z-10 shrink-0">
                      <Clock className="w-4 h-4" />
                    </div>
                  )}
                  <div>
                    <h3 className={`text-sm font-bold ${todayEntry?.morningCompleted ? "text-white" : "text-zinc-400"}`}>
                      Morning Check-In & Physical Verification
                    </h3>
                    <p className="text-xs text-zinc-500 font-mono">
                      {todayEntry?.morningCompleted 
                        ? "Morning checklist complete. Photographic proof approved." 
                        : "Pending morning checklist and verification photo upload"}
                    </p>
                    {todayEntry?.morningCompleted && todayEntry?.verificationPhoto && (
                      <div className="mt-2 text-xs bg-zinc-900/50 border border-zinc-900 px-3 py-1.5 rounded-xl text-zinc-400 inline-block font-mono">
                        🔒 Device Secure • Verified Lock Detection
                      </div>
                    )}
                  </div>
                </div>

                {/* Step 2: Morning Journal & Intent Formulation */}
                <div className="flex gap-4 relative">
                  {todayEntry?.morningCompleted ? (
                    <div className="w-6 h-6 bg-emerald-500/20 border border-emerald-500/30 rounded-full flex items-center justify-center text-emerald-400 z-10 shrink-0">
                      <CheckCircle2 className="w-4.5 h-4.5" />
                    </div>
                  ) : (
                    <div className="w-6 h-6 bg-zinc-900 border border-zinc-800 rounded-full flex items-center justify-center text-zinc-600 z-10 shrink-0">
                      <Clock className="w-4 h-4" />
                    </div>
                  )}
                  <div>
                    <h3 className={`text-sm font-bold ${todayEntry?.morningCompleted ? "text-white" : "text-zinc-400"}`}>
                      Morning Intent & Commitment Setup
                    </h3>
                    <p className="text-xs text-zinc-500 font-mono">
                      {todayEntry?.morningCompleted
                        ? `Sacred commitment signed for the day: "${profile.commitment}"`
                        : "Pending day formulation & intent setup"}
                    </p>
                  </div>
                </div>

                {/* Step 3: Urge & Integrity Live Tracking */}
                {todayUrges.length > 0 ? (
                  todayUrges.map((urge, idx) => (
                    <div key={urge.id || idx} className="flex gap-4 relative">
                      <div className="w-6 h-6 bg-rose-500/10 border border-rose-500/20 rounded-full flex items-center justify-center text-rose-400 z-10 shrink-0">
                        <ShieldAlert className="w-4 h-4 text-rose-400" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-rose-400">
                          Urge Logged & Overcome
                        </h3>
                        <p className="text-xs text-zinc-500 font-mono">
                          Intensity: {urge.intensity}/10 • {new Date(urge.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                        <div className="mt-1.5 text-xs text-zinc-400 italic">
                          "{urge.journal || "Overcame restless moment using breathing stabilizer tools."}"
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex gap-4 relative">
                    <div className="w-6 h-6 bg-emerald-500/20 border border-emerald-500/30 rounded-full flex items-center justify-center text-emerald-400 z-10 shrink-0">
                      <CheckCircle2 className="w-4.5 h-4.5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white">Focus Integrity Status</h3>
                      <p className="text-xs text-zinc-500 font-mono">No active urges logged today • Focus baseline stable</p>
                    </div>
                  </div>
                )}

                {/* Step 4: Evening Reflection */}
                <div className="flex gap-4 relative">
                  {todayEntry?.eveningCompleted ? (
                    <div className="w-6 h-6 bg-emerald-500/20 border border-emerald-500/30 rounded-full flex items-center justify-center text-[#ccff00] z-10 shrink-0">
                      <CheckCircle2 className="w-4.5 h-4.5" />
                    </div>
                  ) : (
                    <div className="w-6 h-6 bg-zinc-900 border border-zinc-800 rounded-full flex items-center justify-center text-zinc-600 z-10 shrink-0">
                      <Clock className="w-4 h-4" />
                    </div>
                  )}
                  <div>
                    <h3 className={`text-sm font-bold ${todayEntry?.eveningCompleted ? "text-white" : "text-zinc-400"}`}>
                      Evening Reflection Journal
                    </h3>
                    <p className="text-xs text-zinc-500 font-mono">
                      {todayEntry?.eveningCompleted
                        ? "Clarity review captured successfully."
                        : "Available in evening to review successes"}
                    </p>
                    {todayEntry?.eveningCompleted && todayEntry?.journalText && (
                      <div className="mt-2 text-xs bg-zinc-900/40 p-3 rounded-2xl italic text-zinc-300">
                        "{todayEntry.journalText}"
                      </div>
                    )}
                  </div>
                </div>

                {/* Step 5: Memoir Page Generation */}
                <div className="flex gap-4 relative">
                  {todayEntry?.eveningCompleted && todayEntry?.story ? (
                    <div className="w-6 h-6 bg-[#ccff00]/10 border border-[#ccff00]/20 rounded-full flex items-center justify-center text-[#ccff00] z-10 shrink-0">
                      <Star className="w-4 h-4 fill-[#ccff00]" />
                    </div>
                  ) : (
                    <div className="w-6 h-6 bg-zinc-900 border border-zinc-800 rounded-full flex items-center justify-center text-zinc-600 z-10 shrink-0">
                      <Clock className="w-4 h-4" />
                    </div>
                  )}
                  <div>
                    <h3 className={`text-sm font-bold ${todayEntry?.eveningCompleted && todayEntry?.story ? "text-[#ccff00]" : "text-zinc-400"}`}>
                      Living Memoir Page Written
                    </h3>
                    <p className="text-xs text-zinc-500 font-mono">
                      {todayEntry?.eveningCompleted && todayEntry?.story
                        ? `Title: "${todayEntry.title || "The Flow of Choice"}"`
                        : "Composes automatically after evening reflection completes"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="history-timeline"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* Daily Urge Heatmap Calendar */}
            <div className="bg-zinc-950 border border-zinc-900 rounded-[28px] p-6 space-y-6">
              <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
                <div className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-rose-500 animate-pulse" />
                  <div>
                    <h2 className="text-sm font-bold text-white font-mono">Daily Urge Heatmap Calendar</h2>
                    <p className="text-[10px] text-zinc-500 font-mono">Intensity & frequency of urge encounters</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] font-mono text-zinc-400 bg-zinc-900 border border-zinc-800 px-2.5 py-0.5 rounded-full">
                  <span>90-Day Reboot Range</span>
                </div>
              </div>

              <div className="space-y-4">
                {/* Month Labels */}
                <div className="grid grid-cols-12 gap-1 mb-1 pl-6 select-none">
                  {heatmapWeeks.map((week, idx) => {
                    const showLabel = idx === 0 || heatmapWeeks[idx - 1][0].monthLabel !== week[0].monthLabel;
                    return (
                      <div key={`month-lbl-${idx}`} className="text-[9px] font-mono text-zinc-500 text-left h-3 truncate">
                        {showLabel ? week[0].monthLabel : ""}
                      </div>
                    );
                  })}
                </div>

                <div className="flex gap-2">
                  {/* Day of week labels */}
                  <div className="flex flex-col justify-between text-[9px] font-mono text-zinc-600 h-[104px] pt-1 select-none pr-1 w-4">
                    <span>Su</span>
                    <span>Tu</span>
                    <span>Th</span>
                    <span>Sa</span>
                  </div>

                  {/* Grid cells */}
                  <div className="grid grid-flow-col grid-rows-7 gap-1 flex-1">
                    {heatmapWeeks.flatMap((week, wIdx) => 
                      week.map((day, dIdx) => {
                        const isSelected = selectedHeatmapDay?.dateStr === day.dateStr;
                        const score = day.urgeScore;
                        
                        // Pick background color based on score
                        let bgClass = "bg-zinc-900 border-zinc-950 hover:bg-zinc-850 hover:border-zinc-700";
                        if (score > 0) {
                          if (score <= 4) bgClass = "bg-rose-950/40 border-rose-900/30 text-rose-300 hover:border-rose-500/50 hover:bg-rose-950/60";
                          else if (score <= 8) bgClass = "bg-rose-900/40 border-rose-800/40 text-rose-200 hover:border-rose-500/70 hover:bg-rose-900/60";
                          else if (score <= 14) bgClass = "bg-rose-700 border-rose-600/60 text-rose-100 hover:border-rose-400 hover:bg-rose-700";
                          else bgClass = "bg-rose-500 border-rose-400 text-white shadow-[0_0_8px_rgba(244,63,94,0.5)] hover:bg-rose-400 hover:border-rose-300";
                        }
                        
                        if (isSelected) {
                          bgClass = "bg-rose-500 border-2 border-white ring-2 ring-rose-500/40 scale-110 z-10 shadow-[0_0_12px_rgba(244,63,94,0.8)] text-white";
                        }

                        return (
                          <button
                            key={`${wIdx}-${dIdx}`}
                            onClick={() => setSelectedHeatmapDay(day)}
                            className={`aspect-square rounded-[3px] md:rounded-md border transition cursor-pointer flex items-center justify-center relative ${bgClass}`}
                            title={`${day.dateStr}: ${day.urges.length} urges (Total Intensity: ${score})`}
                          >
                            {/* Minor indication dot if today */}
                            {day.dateStr === todayStr && !isSelected && (
                              <span className="absolute -top-[1.5px] -right-[1.5px] w-1.5 h-1.5 rounded-full bg-[#ccff00] ring-1 ring-black" />
                            )}
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Legend and Info Row */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-[10px] font-mono border-t border-zinc-900/60">
                  <div className="flex items-center gap-1.5 text-zinc-500">
                    <span>Calm</span>
                    <span className="w-2.5 h-2.5 rounded-[2px] bg-zinc-900 border border-zinc-850" />
                    <span className="w-2.5 h-2.5 rounded-[2px] bg-rose-950/40 border border-rose-900/30" />
                    <span className="w-2.5 h-2.5 rounded-[2px] bg-rose-900/40 border border-rose-800/40" />
                    <span className="w-2.5 h-2.5 rounded-[2px] bg-rose-700 border border-rose-600/60" />
                    <span className="w-2.5 h-2.5 rounded-[2px] bg-rose-500 border border-rose-400" />
                    <span>Severe</span>
                  </div>
                  <span className="text-zinc-500 italic">Select any cell to inspect logs</span>
                </div>
              </div>

              {/* Heatmap Selected Day Details Inspector */}
              <AnimatePresence mode="wait">
                {selectedHeatmapDay && (
                  <motion.div
                    key={selectedHeatmapDay.dateStr}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="p-4 bg-zinc-900/30 border border-zinc-900 rounded-2xl space-y-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-900/60 pb-2.5">
                      <div>
                        <span className="text-[10px] font-mono text-[#ccff00] font-bold block uppercase tracking-wider">
                          Heatmap Inspector
                        </span>
                        <h4 className="text-sm font-bold text-white font-mono flex items-center gap-1.5">
                          {new Date(selectedHeatmapDay.dateStr).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </h4>
                      </div>
                      
                      {/* Check-in verification indicator */}
                      <div className="flex items-center gap-1.5 text-[10px] font-mono">
                        {selectedHeatmapDay.entry ? (
                          <span className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-md flex items-center gap-1 font-bold">
                            🔒 Locked & Verified (Day {selectedHeatmapDay.entry.dayNumber})
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 bg-zinc-900 border border-zinc-850 text-zinc-500 rounded-md">
                            No verification entry
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Stats metrics */}
                    <div className="grid grid-cols-3 gap-2.5">
                      <div className="bg-zinc-950/60 border border-zinc-900 p-2.5 rounded-xl text-center">
                        <span className="text-[9px] font-mono text-zinc-500 uppercase block">Total Urges</span>
                        <span className="text-lg font-bold font-mono text-white block mt-0.5">
                          {selectedHeatmapDay.urges.length}
                        </span>
                      </div>
                      <div className="bg-zinc-950/60 border border-zinc-900 p-2.5 rounded-xl text-center">
                        <span className="text-[9px] font-mono text-zinc-500 uppercase block">Max Intensity</span>
                        <span className="text-lg font-bold font-mono text-rose-400 block mt-0.5">
                          {selectedHeatmapDay.maxIntensity > 0 ? `${selectedHeatmapDay.maxIntensity}/10` : "0/10"}
                        </span>
                      </div>
                      <div className="bg-zinc-950/60 border border-zinc-900 p-2.5 rounded-xl text-center">
                        <span className="text-[9px] font-mono text-zinc-500 uppercase block">Total Score</span>
                        <span className="text-lg font-bold font-mono text-[#ccff00] block mt-0.5">
                          {selectedHeatmapDay.urgeScore}
                        </span>
                      </div>
                    </div>

                    {/* Urges chronology for selected day */}
                    <div className="space-y-3">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block">
                        Chronology Logs
                      </span>

                      {selectedHeatmapDay.urges.length === 0 ? (
                        <div className="text-center py-4 px-3 bg-zinc-950/20 border border-zinc-900/40 rounded-xl space-y-1">
                          <CheckCircle2 className="w-5 h-5 text-[#ccff00] mx-auto opacity-70" />
                          <p className="text-xs text-zinc-300 font-bold font-mono">No urge events recorded</p>
                          <p className="text-[10px] text-zinc-500 font-mono leading-normal max-w-xs mx-auto">
                            The mind remained completely stable, clear, and in absolute discipline. Focus baseline secure!
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                          {selectedHeatmapDay.urges.map((urge: any, idx: number) => (
                            <div
                              key={urge.id || idx}
                              className="p-3 bg-zinc-950 border border-zinc-900/80 rounded-xl space-y-2 hover:border-zinc-800 transition"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <ShieldAlert className="w-4 h-4 text-rose-400" />
                                  <span className="text-xs font-bold text-white font-mono">
                                    Urge Event #{idx + 1}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <span className="text-[10px] font-mono text-zinc-500">
                                    {new Date(urge.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold font-mono border ${
                                    urge.intensity >= 7 
                                      ? "bg-rose-500/10 border-rose-500/30 text-rose-400" 
                                      : "bg-amber-500/10 border-amber-500/30 text-amber-400"
                                  }`}>
                                    Intensity {urge.intensity}/10
                                  </span>
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-zinc-400 bg-zinc-900/30 px-2 py-1.5 rounded-lg border border-zinc-900/40">
                                <span>Trigger: <strong className="text-white">{urge.trigger}</strong></span>
                                <span className="text-right">Duration: <strong className="text-white">{urge.durationMinutes} min</strong></span>
                              </div>

                              {urge.journal && (
                                <p className="text-xs text-zinc-300 font-sans italic leading-relaxed pl-2 border-l border-zinc-800">
                                  "{urge.journal}"
                                </p>
                              )}

                              <div className="flex items-center justify-between pt-1 border-t border-zinc-900/50 text-[10px] font-mono text-zinc-500">
                                <span>Status: <strong className={urge.resolved ? "text-emerald-400" : "text-amber-400"}>
                                  {urge.resolved ? "✓ Resolved Securely" : "Active / Restless"}
                                </strong></span>
                                <span>Support: <strong className="text-zinc-400">Breathing Anchor</strong></span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Display daily reflection journal if present */}
                      {selectedHeatmapDay.entry?.journalText && (
                        <div className="p-3 bg-[#ccff00]/5 border border-[#ccff00]/10 rounded-xl space-y-1">
                          <span className="text-[9px] font-mono font-bold text-[#ccff00] uppercase tracking-wider block">
                            Daily Reflection Memoir Journal
                          </span>
                          <p className="text-xs text-zinc-300 italic font-sans leading-relaxed">
                            "{selectedHeatmapDay.entry.journalText}"
                          </p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* History Calendar Grid */}
            <div className="bg-zinc-950 border border-zinc-900 rounded-[28px] p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-sm font-mono text-zinc-500 uppercase tracking-wider">
                  JULY 2026
                </h2>
                <div className="flex gap-1.5">
                  <button className="p-1.5 bg-zinc-900 border border-zinc-850 rounded-lg text-zinc-400 hover:text-white cursor-pointer">
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button className="p-1.5 bg-zinc-900 border border-zinc-850 rounded-lg text-zinc-400 hover:text-white cursor-pointer">
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Day numbers grid */}
              <div className="grid grid-cols-7 gap-2 text-center font-mono text-xs">
                {/* Day headers */}
                {["S", "M", "T", "W", "T", "F", "S"].map((d) => (
                  <div key={d} className="text-zinc-600 font-bold py-1">
                    {d}
                  </div>
                ))}

                {/* Blank slots for calendar offset */}
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={`empty-${i}`} />
                ))}

                {/* Seeded and active days */}
                {Array.from({ length: 15 }).map((_, i) => {
                  const dayNum = i + 1;
                  const isVerified = dayNum <= 13 && dayNum !== 2 && dayNum !== 4 && dayNum !== 6 && dayNum !== 7 && dayNum !== 9 && dayNum !== 11; // Matches seeded entries
                  return (
                    <div
                      key={`day-${dayNum}`}
                      onClick={() => {
                        const entry = entries.find((e) => e.dayNumber === dayNum);
                        if (entry) setSelectedEntry(entry);
                      }}
                      className={`relative aspect-square rounded-xl flex flex-col items-center justify-center border transition cursor-pointer ${
                        isVerified
                          ? "bg-zinc-900 border-[#ccff00]/20 hover:border-[#ccff00]/40"
                          : dayNum === 14
                          ? "bg-[#ccff00]/10 border-[#ccff00]/30 font-bold"
                          : "bg-zinc-950 border-zinc-900 hover:border-zinc-800"
                      }`}
                    >
                      <span className={dayNum === 14 ? "text-[#ccff00]" : "text-zinc-400"}>{dayNum}</span>
                      {isVerified && (
                        <div className="w-1.5 h-1.5 rounded-full bg-[#ccff00] absolute bottom-1.5" />
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 flex justify-center gap-6 text-[10px] font-mono">
                <div className="flex items-center gap-1.5 text-zinc-400">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#ccff00]" /> Verified Lock
                </div>
                <div className="flex items-center gap-1.5 text-zinc-400">
                  <div className="w-2.5 h-2.5 rounded-full bg-zinc-800" /> Pending / Rest
                </div>
              </div>
            </div>

            {/* List of Previous Memoir Chapters/Entries */}
            <div className="space-y-4">
              <h3 className="text-xs font-mono text-zinc-500 uppercase tracking-widest pl-2">
                PREVIOUS WRITTEN STORIES
              </h3>

              {sortedEntries.map((entry) => (
                <div
                  key={entry.dayNumber}
                  onClick={() => setSelectedEntry(entry)}
                  className="bg-zinc-950 border border-zinc-900 hover:border-zinc-800 rounded-2xl p-4 flex justify-between items-center transition cursor-pointer"
                >
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono text-[#ccff00]">
                      DAY {entry.dayNumber} • {entry.date}
                    </span>
                    <h4 className="text-sm font-bold text-white">
                      {entry.story ? entry.story.substring(0, 40) + "..." : "Continuing the Rhythm"}
                    </h4>
                  </div>
                  <button className="p-2 bg-zinc-900 border border-zinc-850 rounded-xl text-[#ccff00]">
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Memoir Story Popup Modal */}
      <AnimatePresence>
        {selectedEntry && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-zinc-950 border border-zinc-900 rounded-[32px] p-6 max-w-md w-full relative space-y-4"
            >
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-xs font-mono text-[#ccff00]">
                    DAY {selectedEntry.dayNumber} • Living Memoir
                  </span>
                  <h3 className="text-xl font-bold text-white mt-1">
                    {selectedEntry.story ? "Chapter Story" : "Daily Progression"}
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedEntry(null)}
                  className="text-xs font-mono text-zinc-500 hover:text-white border border-zinc-900 rounded-lg px-2.5 py-1 cursor-pointer"
                >
                  Close
                </button>
              </div>

              <div className="bg-zinc-900/40 p-4 border border-zinc-900 rounded-2xl space-y-3 font-mono text-xs text-zinc-300">
                <div className="flex justify-between">
                  <span>Mood Score:</span>
                  <span className="text-[#ccff00]">{"★".repeat(selectedEntry.mood)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Difficulty:</span>
                  <span className="text-amber-500">{selectedEntry.difficulty}/10</span>
                </div>
                <div className="flex justify-between">
                  <span>Physical Verification:</span>
                  <span className={selectedEntry.verified ? "text-emerald-400" : "text-zinc-500"}>
                    {selectedEntry.verified ? "Verified Secure" : "Not captured"}
                  </span>
                </div>
              </div>

              <div className="space-y-1 pt-2">
                <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
                  YOUR REFLECTION
                </span>
                <p className="text-sm text-zinc-300 leading-relaxed italic">
                  "{selectedEntry.journalText}"
                </p>
              </div>

              {selectedEntry.story && (
                <div className="space-y-1 pt-4 border-t border-zinc-900">
                  <span className="text-[10px] font-mono text-[#ccff00] uppercase tracking-widest flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-[#ccff00]" /> AI Memoir Narration
                  </span>
                  <p className="text-sm text-zinc-300 leading-relaxed font-serif">
                    {selectedEntry.story}
                  </p>
                </div>
              )}

              {selectedEntry.quote && (
                <div className="bg-[#ccff00]/5 border border-[#ccff00]/10 rounded-2xl p-3 text-center italic text-xs text-zinc-300">
                  "{selectedEntry.quote}"
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
