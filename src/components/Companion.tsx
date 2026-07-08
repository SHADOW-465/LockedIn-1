import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { MessageSquare, Sparkles, Send, RefreshCw, Compass, Clock, Star, HelpCircle } from "lucide-react";
import { UserProfile, ChatMessage } from "../types";

interface CompanionProps {
  profile: UserProfile;
  messages: ChatMessage[];
  onSendMessage: (text: string) => Promise<void>;
}

const PRESET_QUERIES = [
  "How did I handle my Day 10 surge?",
  "Analyze my discipline patterns this week.",
  "Give me a calm reflection for today.",
  "What triggers my restlessness most?",
];

export default function Companion({
  profile,
  messages,
  onSendMessage,
}: CompanionProps) {
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim() || loading) return;
    setLoading(true);
    setInputText("");
    try {
      await onSendMessage(textToSend);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="space-y-6 pb-20 animate-fade-in text-[#f1f1f1] flex flex-col min-h-[calc(100vh-140px)]">
      {/* Top Welcome Title */}
      <div className="flex justify-between items-center shrink-0">
        <div>
          <span className="text-xs font-mono text-[#ccff00] uppercase tracking-widest">
            AI COMPANION
          </span>
          <h1 className="text-2xl font-black text-white mt-1">Reflections</h1>
        </div>
        <div className="p-2 bg-zinc-900 border border-zinc-850 rounded-xl text-[#ccff00]">
          <Sparkles className="w-5 h-5 animate-pulse" />
        </div>
      </div>

      {/* Preset Journey Helper Queries */}
      <div className="shrink-0 space-y-2">
        <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest pl-1">
          Ask about your journey
        </p>
        <div className="flex flex-wrap gap-2">
          {PRESET_QUERIES.map((query) => (
            <button
              key={query}
              onClick={() => handleSend(query)}
              disabled={loading}
              className="px-3 py-1.5 bg-zinc-950 border border-zinc-900 hover:border-zinc-800 disabled:opacity-40 rounded-xl text-xs text-zinc-300 hover:text-white transition font-mono cursor-pointer"
            >
              {query}
            </button>
          ))}
        </div>
      </div>

      {/* Dialogue Message Board */}
      <div className="flex-1 bg-zinc-950/40 border border-zinc-900/60 rounded-[32px] p-6 overflow-y-auto space-y-6 min-h-[300px]">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
            <HelpCircle className="w-12 h-12 text-[#ccff00] animate-pulse" />
            <div className="space-y-1.5">
              <h3 className="text-base font-bold text-white">Your story begins here.</h3>
              <p className="text-xs text-zinc-500 max-w-xs leading-relaxed">
                The Companion is waiting to reflect on your goals, journals, and daily lock milestones.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${
                  msg.role === "user" ? "items-end" : "items-start"
                }`}
              >
                {/* Time Indicator */}
                <span className="text-[9px] font-mono text-zinc-600 mb-1">
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>

                <div
                  className={`max-w-[90%] p-4 rounded-[24px] leading-relaxed shadow-md ${
                    msg.role === "user"
                      ? "bg-[#ccff00] text-black font-semibold rounded-tr-none text-sm"
                      : "bg-zinc-950 border border-zinc-900 text-zinc-200 rounded-tl-none text-sm font-serif relative overflow-hidden"
                  }`}
                >
                  {msg.role === "assistant" && (
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-[#ccff00]" />
                  )}
                  {msg.content}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Message Box */}
      <div className="shrink-0 flex gap-2 pt-2 border-t border-zinc-900">
        <input
          type="text"
          placeholder="Ask Companion about your discipline records, urges, or milestones..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend(inputText)}
          className="flex-1 bg-zinc-950 border border-zinc-900 rounded-2xl py-4 px-5 text-sm text-white focus:outline-none focus:border-[#ccff00] transition"
        />
        <button
          onClick={() => handleSend(inputText)}
          disabled={loading || !inputText.trim()}
          className="p-4 bg-[#ccff00] text-black rounded-2xl hover:opacity-90 disabled:opacity-40 transition flex items-center justify-center cursor-pointer"
        >
          {loading ? (
            <RefreshCw className="w-5 h-5 animate-spin" />
          ) : (
            <Send className="w-5 h-5" />
          )}
        </button>
      </div>
    </div>
  );
}
