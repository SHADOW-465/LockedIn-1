import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ShieldAlert, Wind, MessageSquare, BookOpen, Clock, RefreshCw, Send, X, AlertTriangle, Shield } from "lucide-react";
import { UserProfile, ChatMessage } from "../types";

interface SupportProps {
  profile: UserProfile;
  onExit: () => void;
  onAddUrgeLog: (intensity: number, trigger: string, notes: string) => void;
}

export default function Support({ profile, onExit, onAddUrgeLog }: SupportProps) {
  const [activeTool, setActiveTool] = useState<"menu" | "breathe" | "reason" | "chat" | "timer">("menu");
  
  // Breathing state
  const [breathPhase, setBreathPhase] = useState<"Inhale" | "Hold" | "Exhale">("Inhale");
  const [breathCount, setBreathCount] = useState(4);
  const [breathCycle, setBreathCycle] = useState(1);

  // Timer state
  const [timerLeft, setTimerLeft] = useState(300); // 5 mins
  const [timerRunning, setTimerRunning] = useState(false);

  // Chat state
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: "s1",
      role: "assistant",
      content: "I am here with you, Arjun. Breathe. Urges are simply raw power waiting to be redirected. Tell me what triggered this restlessness, or let's start a breathing cycle together.",
      timestamp: new Date().toISOString(),
    },
  ]);
  const [chatSending, setChatSending] = useState(false);

  // Urge log logging
  const [urgeIntensity, setUrgeIntensity] = useState(7);
  const [urgeTrigger, setUrgeTrigger] = useState("");
  const [urgeNotes, setUrgeNotes] = useState("");
  const [loggedUrge, setLoggedUrge] = useState(false);

  // Breathing loop timer
  useEffect(() => {
    if (activeTool !== "breathe") return;
    const interval = setInterval(() => {
      setBreathCount((prev) => {
        if (prev === 1) {
          if (breathPhase === "Inhale") {
            setBreathPhase("Hold");
            return 7;
          } else if (breathPhase === "Hold") {
            setBreathPhase("Exhale");
            return 8;
          } else {
            setBreathPhase("Inhale");
            setBreathCycle((c) => c + 1);
            return 4;
          }
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [activeTool, breathPhase]);

  // Countdown timer loop
  useEffect(() => {
    if (!timerRunning || timerLeft <= 0) return;
    const interval = setInterval(() => {
      setTimerLeft((t) => t - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timerRunning, timerLeft]);

  // Submit chat message to the Express AI Chat API
  const handleSendChat = async () => {
    if (!chatInput.trim()) return;
    const userMsg: ChatMessage = {
      id: "u-" + Date.now(),
      role: "user",
      content: chatInput,
      timestamp: new Date().toISOString(),
    };
    setChatMessages((prev) => [...prev, userMsg]);
    setChatInput("");
    setChatSending(true);

    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...chatMessages, userMsg].map((m) => ({
            role: m.role,
            content: m.content,
          })),
          userProfile: {
            name: profile.name,
            commitment: profile.commitment,
            currentStreak: profile.currentStreak,
          },
        }),
      });
      const data = await response.json();
      setChatMessages((prev) => [
        ...prev,
        {
          id: "assistant-" + Date.now(),
          role: "assistant",
          content: data.reply || "Breathe. You have the power to let this urge pass.",
          timestamp: new Date().toISOString(),
        },
      ]);
    } catch (err) {
      console.error("Support Chat failed:", err);
      setChatMessages((prev) => [
        ...prev,
        {
          id: "err-" + Date.now(),
          role: "assistant",
          content: "I am always here. Stand firm. This physical tension will peak and then steadily dissolve over the next ten minutes. Do not negotiate with impulse.",
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setChatSending(false);
    }
  };

  // Log Urge event
  const handleLogUrge = () => {
    onAddUrgeLog(urgeIntensity, urgeTrigger || "Boredom", urgeNotes || "Overcame via Support tools");
    setLoggedUrge(true);
  };

  // Exit support mode
  const handleSurvided = () => {
    if (!loggedUrge) {
      handleLogUrge();
    }
    onExit();
  };

  return (
    <div className="fixed inset-0 bg-black/95 backdrop-blur-md z-50 overflow-y-auto p-4 flex flex-col items-center justify-center">
      {/* Visual background rings */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full border border-rose-500/5 animate-pulse" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border border-rose-500/3" />

      <div className="w-full max-w-md bg-zinc-950 border border-rose-950/40 rounded-[32px] p-6 shadow-2xl relative space-y-6 z-10">
        {/* Support Header */}
        <div className="flex justify-between items-center border-b border-zinc-900 pb-4">
          <div className="flex items-center gap-2 text-rose-400">
            <ShieldAlert className="w-5 h-5 animate-pulse" />
            <div>
              <h2 className="text-sm font-mono uppercase tracking-widest">Support Mode</h2>
              <p className="text-[10px] text-zinc-500 font-mono">STABILIZATION ACTIVE</p>
            </div>
          </div>
          <button
            onClick={onExit}
            className="p-1.5 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 rounded-xl text-zinc-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <AnimatePresence mode="wait">
          {/* Menu Tool Selector */}
          {activeTool === "menu" && (
            <motion.div
              key="menu"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="text-center space-y-1">
                <h3 className="text-xl font-bold text-white">"Stay with me."</h3>
                <p className="text-xs text-zinc-400">Distractions are choices. Select a quiet anchor.</p>
              </div>

              {/* Bento Tools List */}
              <div className="grid grid-cols-2 gap-3">
                {/* Breathe */}
                <button
                  onClick={() => setActiveTool("breathe")}
                  className="p-4 bg-zinc-900/40 border border-zinc-900 hover:border-zinc-800 rounded-2xl text-center space-y-2 transition cursor-pointer"
                >
                  <Wind className="w-6 h-6 text-[#ccff00] mx-auto" />
                  <p className="text-xs font-bold text-white">4-7-8 Breathing</p>
                  <p className="text-[9px] text-zinc-500">Calm your nervous system</p>
                </button>

                {/* Read Commitment */}
                <button
                  onClick={() => setActiveTool("reason")}
                  className="p-4 bg-zinc-900/40 border border-zinc-900 hover:border-zinc-800 rounded-2xl text-center space-y-2 transition cursor-pointer"
                >
                  <BookOpen className="w-6 h-6 text-emerald-400" />
                  <p className="text-xs font-bold text-white">Read Commitment</p>
                  <p className="text-[9px] text-zinc-500">Remember why you locked</p>
                </button>

                {/* AI Companion Dialogue */}
                <button
                  onClick={() => setActiveTool("chat")}
                  className="p-4 bg-zinc-900/40 border border-zinc-900 hover:border-zinc-800 rounded-2xl text-center space-y-2 transition cursor-pointer"
                >
                  <MessageSquare className="w-6 h-6 text-sky-400" />
                  <p className="text-xs font-bold text-white">AI Companion</p>
                  <p className="text-[9px] text-zinc-500">Discuss without judgement</p>
                </button>

                {/* Recovery Countdown */}
                <button
                  onClick={() => {
                    setActiveTool("timer");
                    setTimerLeft(300);
                    setTimerRunning(true);
                  }}
                  className="p-4 bg-zinc-900/40 border border-zinc-900 hover:border-zinc-800 rounded-2xl text-center space-y-2 transition cursor-pointer"
                >
                  <Clock className="w-6 h-6 text-amber-500" />
                  <p className="text-xs font-bold text-white">Walk Countdown</p>
                  <p className="text-[9px] text-zinc-500">Start 5-minute timer</p>
                </button>
              </div>

              {/* Log Urge Section */}
              {!loggedUrge ? (
                <div className="bg-zinc-900/30 border border-zinc-900 rounded-2xl p-4 space-y-4">
                  <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block">
                    LOG ACTIVE URGE LEVEL
                  </span>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-mono text-zinc-400">
                      <span>Intensity:</span>
                      <span className="text-rose-400 font-bold">{urgeIntensity}/10</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={urgeIntensity}
                      onChange={(e) => setUrgeIntensity(parseInt(e.target.value))}
                      className="w-full accent-rose-500"
                    />
                  </div>
                  <input
                    type="text"
                    placeholder="Urge trigger (e.g. fatigue, being alone)"
                    value={urgeTrigger}
                    onChange={(e) => setUrgeTrigger(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-900 rounded-xl py-2 px-3 text-xs text-white placeholder-zinc-700 focus:outline-none"
                  />
                  <button
                    onClick={handleLogUrge}
                    className="w-full bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20 text-rose-400 font-bold py-2.5 rounded-xl text-xs transition cursor-pointer"
                  >
                    Save Urge Log
                  </button>
                </div>
              ) : (
                <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-2xl p-4 text-center">
                  <p className="text-xs text-emerald-400 font-semibold flex items-center justify-center gap-1.5">
                    <Shield className="w-4 h-4" /> Urge incident recorded securely. Keep holding.
                  </p>
                </div>
              )}

              {/* Action Button */}
              <button
                onClick={handleSurvided}
                className="w-full bg-[#ccff00] text-black font-bold py-4 rounded-2xl hover:opacity-95 active:scale-[0.98] transition cursor-pointer"
              >
                I Survived the Urge
              </button>
            </motion.div>
          )}

          {/* Breathe Tool */}
          {activeTool === "breathe" && (
            <motion.div
              key="breathe"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="space-y-6 text-center"
            >
              <div className="space-y-1">
                <span className="text-xs font-mono text-[#ccff00] uppercase tracking-widest">
                  4-7-8 Breathing Circle
                </span>
                <p className="text-xs text-zinc-500">Settle your autonomic nervous system.</p>
              </div>

              {/* Dynamic Breathing Visual Circle */}
              <div className="relative w-48 h-48 mx-auto flex items-center justify-center">
                <motion.div
                  animate={{
                    scale: breathPhase === "Inhale" ? [1, 1.3] : breathPhase === "Hold" ? 1.3 : [1.3, 1],
                  }}
                  transition={{
                    duration: breathPhase === "Inhale" ? 4 : breathPhase === "Hold" ? 7 : 8,
                    ease: "easeInOut",
                  }}
                  className="w-32 h-32 rounded-full bg-[#ccff00]/10 border-2 border-[#ccff00]/30 absolute flex flex-col items-center justify-center"
                />
                <div className="relative z-10 text-center">
                  <span className="text-2xl font-black text-white">{breathPhase}</span>
                  <p className="text-sm font-mono text-[#ccff00] font-bold mt-1">{breathCount}s</p>
                </div>
              </div>

              <p className="text-xs text-zinc-400 font-mono">
                Cycle: {breathCycle} • Inhale 4s, Hold 7s, Exhale 8s
              </p>

              <button
                onClick={() => setActiveTool("menu")}
                className="w-full bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white py-3.5 rounded-xl text-xs font-bold cursor-pointer"
              >
                Return to Menu
              </button>
            </motion.div>
          )}

          {/* Reason Card Tool */}
          {activeTool === "reason" && (
            <motion.div
              key="reason"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="space-y-6"
            >
              <div className="text-center space-y-1">
                <span className="text-xs font-mono text-[#ccff00] uppercase tracking-widest">
                  Declaration of intent
                </span>
                <h3 className="text-lg font-bold text-white">Remember Your Oath</h3>
              </div>

              <div className="bg-zinc-900/40 p-6 border border-zinc-900 rounded-[24px] space-y-4">
                <p className="text-sm text-zinc-300 leading-relaxed font-serif italic text-center">
                  "{profile.commitment}"
                </p>
                <div className="text-center pt-2 border-t border-zinc-900">
                  <span className="text-xs font-mono text-[#ccff00]">Signed & Committed by {profile.name}</span>
                </div>
              </div>

              <button
                onClick={() => setActiveTool("menu")}
                className="w-full bg-[#ccff00] text-black font-bold py-3.5 rounded-xl text-xs cursor-pointer"
              >
                Return to Menu
              </button>
            </motion.div>
          )}

          {/* Walk Timer Countdown Tool */}
          {activeTool === "timer" && (
            <motion.div
              key="timer"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="space-y-6 text-center"
            >
              <div className="space-y-1">
                <span className="text-xs font-mono text-amber-500 uppercase tracking-widest">
                  Walk & Reset Timer
                </span>
                <p className="text-xs text-zinc-500">Step away from your current environment.</p>
              </div>

              <div className="text-6xl font-mono font-black text-white py-8">
                {Math.floor(timerLeft / 60)}:{(timerLeft % 60).toString().padStart(2, "0")}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setTimerRunning(!timerRunning)}
                  className="flex-1 bg-[#ccff00] text-black font-bold py-3 rounded-xl text-xs cursor-pointer"
                >
                  {timerRunning ? "Pause" : "Resume"}
                </button>
                <button
                  onClick={() => {
                    setTimerLeft(300);
                    setTimerRunning(false);
                  }}
                  className="flex-1 bg-zinc-900 border border-zinc-800 text-zinc-400 py-3 rounded-xl text-xs font-mono cursor-pointer"
                >
                  Reset
                </button>
              </div>

              <button
                onClick={() => setActiveTool("menu")}
                className="w-full bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white py-3.5 rounded-xl text-xs font-bold cursor-pointer"
              >
                Return to Menu
              </button>
            </motion.div>
          )}

          {/* Live Chat Companion Tool */}
          {activeTool === "chat" && (
            <motion.div
              key="chat"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4 flex flex-col h-[380px]"
            >
              {/* Chat messages viewport */}
              <div className="flex-1 overflow-y-auto space-y-3 pr-1 text-xs">
                {chatMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${
                      msg.role === "user" ? "items-end" : "items-start"
                    }`}
                  >
                    <div
                      className={`max-w-[85%] p-3.5 rounded-2xl leading-relaxed ${
                        msg.role === "user"
                          ? "bg-[#ccff00] text-black font-semibold"
                          : "bg-zinc-900/60 border border-zinc-900 text-zinc-200"
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))}
              </div>

              {/* Chat Input Bar */}
              <div className="flex gap-2 pt-2 border-t border-zinc-900">
                <input
                  type="text"
                  placeholder="Ask for support or express urge triggers..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendChat()}
                  className="flex-1 bg-zinc-900 border border-zinc-850 rounded-xl py-3 px-4 text-xs text-white focus:outline-none focus:border-[#ccff00]"
                />
                <button
                  onClick={handleSendChat}
                  disabled={chatSending}
                  className="p-3 bg-[#ccff00] text-black rounded-xl hover:opacity-90 disabled:opacity-40 transition cursor-pointer"
                >
                  {chatSending ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </button>
              </div>

              <button
                onClick={() => setActiveTool("menu")}
                className="w-full bg-zinc-900 border border-zinc-800 text-zinc-500 hover:text-white py-2 rounded-xl text-[10px] font-mono cursor-pointer"
              >
                Return to Menu
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
