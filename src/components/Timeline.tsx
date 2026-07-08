import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Calendar as CalendarIcon, CheckCircle2, Clock, BookOpen, ChevronLeft, ChevronRight, Eye, Star, ShieldAlert } from "lucide-react";
import { DailyEntry, UserProfile, UrgeEvent } from "../types";

interface TimelineProps {
  entries: DailyEntry[];
  urges: UrgeEvent[];
  profile: UserProfile;
}

export default function Timeline({ entries, urges, profile }: TimelineProps) {
  const [activeTab, setActiveTab] = useState<"today" | "history">("today");
  const [selectedEntry, setSelectedEntry] = useState<DailyEntry | null>(null);

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
