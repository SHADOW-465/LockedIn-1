import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { BookOpen, Star, ChevronLeft, ChevronRight, Share2, Calendar, FileText, Compass } from "lucide-react";
import { DailyEntry, UserProfile } from "../types";

interface MemoirProps {
  entries: DailyEntry[];
  profile: UserProfile;
}

interface Chapter {
  id: string;
  name: string;
  description: string;
  daysRange: string;
  coverUrl: string;
}

const CHAPTERS: Chapter[] = [
  {
    id: "ch1",
    name: "The Beginning",
    description: "The initial threshold. Turning the key and making a quiet pact with future identity.",
    daysRange: "Days 1 - 7",
    coverUrl: "https://images.unsplash.com/photo-1516979187457-637abb4f9353?q=80&w=600&auto=format&fit=crop",
  },
  {
    id: "ch2",
    name: "Finding Stability",
    description: "Restriction ceases to be an active thought and becomes a silent baseline of comfort.",
    daysRange: "Days 8 - 14",
    coverUrl: "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?q=80&w=600&auto=format&fit=crop",
  },
  {
    id: "ch3",
    name: "Building Momentum",
    description: "Converting high-frequency willpower into physical runs, productivity, and clarity.",
    daysRange: "Days 15 - 30",
    coverUrl: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=600&auto=format&fit=crop",
  },
];

export default function Memoir({ entries, profile }: MemoirProps) {
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);
  const [readingPageIndex, setReadingPageIndex] = useState<number>(-1);

  // Filter entries based on selected chapter
  const getChapterEntries = (chapterName: string) => {
    return entries.filter((e) => {
      if (chapterName === "The Beginning") return e.dayNumber <= 7;
      if (chapterName === "Finding Stability") return e.dayNumber > 7 && e.dayNumber <= 14;
      return e.dayNumber > 14;
    });
  };

  const handleStartReading = (chapter: Chapter) => {
    const chEntries = getChapterEntries(chapter.name);
    if (chEntries.length > 0) {
      setSelectedChapter(chapter);
      setReadingPageIndex(0);
    } else {
      alert("This chapter is still locked. Complete daily rituals to begin writing its pages!");
    }
  };

  const currentChapterEntries = selectedChapter ? getChapterEntries(selectedChapter.name) : [];
  const activeEntry = currentChapterEntries[readingPageIndex];

  return (
    <div className="space-y-6 pb-20 animate-fade-in text-[#f1f1f1]">
      <AnimatePresence mode="wait">
        {/* Memoir Main Bookshelf View */}
        {!selectedChapter && (
          <motion.div
            key="bookshelf"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-6"
          >
            {/* Header Block */}
            <div className="flex justify-between items-center">
              <div>
                <span className="text-xs font-mono text-[#ccff00] uppercase tracking-widest">
                  LIVING MEMOIR
                </span>
                <h1 className="text-2xl font-black text-white mt-1">Autobiography</h1>
              </div>
              <BookOpen className="w-6 h-6 text-[#ccff00]" />
            </div>

            {/* Current Chapter Hero */}
            <div className="relative overflow-hidden bg-zinc-950 border border-zinc-900 rounded-[32px] p-6 flex flex-col justify-between aspect-[16/10]">
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent z-10" />
              <img
                src="https://images.unsplash.com/photo-1518495973542-4542c06a5843?q=80&w=600&auto=format&fit=crop"
                alt="Memoir cover"
                className="absolute inset-0 w-full h-full object-cover opacity-35"
              />
              <div className="relative z-20 self-start">
                <span className="px-3 py-1 bg-[#ccff00]/10 border border-[#ccff00]/20 text-[#ccff00] text-[10px] font-mono rounded-full">
                  CURRENT CHAPTER
                </span>
              </div>
              <div className="relative z-20 space-y-2 mt-auto">
                <h3 className="text-2xl font-bold text-white tracking-tight">Chapter 2: Finding Stability</h3>
                <p className="text-xs text-zinc-400 max-w-xs">
                  Remaining locked is becoming normal. Discipline is no longer effort; it is identity.
                </p>
                <div className="flex gap-4 pt-2 text-[10px] font-mono text-zinc-500">
                  <span>{entries.length} pages written</span>
                  <span>14 days lock streak</span>
                </div>
              </div>
            </div>

            {/* Bookshelf Chapters */}
            <div className="space-y-4">
              <h3 className="text-xs font-mono text-zinc-500 uppercase tracking-widest pl-2">
                YOUR AUTOBIOGRAPHY CHAPTERS
              </h3>

              <div className="grid grid-cols-1 gap-4">
                {CHAPTERS.map((chapter) => {
                  const chEntries = getChapterEntries(chapter.name);
                  const isLocked = chEntries.length === 0;

                  return (
                    <div
                      key={chapter.id}
                      className={`group relative overflow-hidden bg-zinc-950 border border-zinc-900 rounded-[28px] p-6 flex items-center gap-6 transition ${
                        isLocked ? "opacity-50" : "hover:border-zinc-800"
                      }`}
                    >
                      <div className="w-20 h-28 rounded-xl bg-zinc-900 border border-zinc-800 overflow-hidden relative shrink-0">
                        <img
                          src={chapter.coverUrl}
                          alt={chapter.name}
                          className="w-full h-full object-cover grayscale"
                        />
                        {isLocked && (
                          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest font-bold">Locked</span>
                          </div>
                        )}
                      </div>

                      <div className="space-y-1.5 flex-1 min-w-0">
                        <span className="text-[10px] font-mono text-zinc-500">
                          {chapter.daysRange}
                        </span>
                        <h4 className="text-base font-bold text-white truncate">{chapter.name}</h4>
                        <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                          {chapter.description}
                        </p>
                        {!isLocked && (
                          <button
                            onClick={() => handleStartReading(chapter)}
                            className="text-xs font-mono font-bold text-[#ccff00] hover:underline flex items-center gap-1 pt-1 cursor-pointer"
                          >
                            Open Book <ChevronRight className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}

        {/* Full Screen Reading Mode */}
        {selectedChapter && activeEntry && (
          <motion.div
            key="reading-mode"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="fixed inset-0 bg-black z-50 flex flex-col p-6 overflow-y-auto"
          >
            {/* Reading Mode Top Header */}
            <div className="flex justify-between items-center border-b border-zinc-900 pb-4 shrink-0">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[#ccff00]" />
                <span className="text-xs font-mono text-zinc-500 truncate">
                  {selectedChapter.name} • Page {readingPageIndex + 1} of {currentChapterEntries.length}
                </span>
              </div>
              <button
                onClick={() => setSelectedChapter(null)}
                className="text-xs font-mono text-zinc-500 hover:text-white border border-zinc-900 rounded-lg px-2.5 py-1 cursor-pointer"
              >
                Close Book
              </button>
            </div>

            {/* Main Daily Page Scrapbook Layout */}
            <div className="flex-1 flex flex-col justify-center items-center py-8">
              <div className="w-full max-w-md bg-zinc-950 border border-zinc-900/50 rounded-[32px] p-8 shadow-2xl space-y-6 relative overflow-hidden">
                {/* Visual Accent */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#ccff00]/3 rounded-full blur-2xl" />

                {/* Day Header */}
                <div className="flex justify-between items-start">
                  <div className="space-y-0.5">
                    <span className="text-xs font-mono text-[#ccff00] font-bold">
                      DAY {activeEntry.dayNumber}
                    </span>
                    <h2 className="text-2xl font-serif text-white tracking-tight">
                      {activeEntry.title || "The Quiet Flow of Discipline"}
                    </h2>
                  </div>
                  <span className="text-[10px] font-mono text-zinc-500">{activeEntry.date}</span>
                </div>

                {/* Optional Verification Photo layout */}
                {activeEntry.verificationPhoto ? (
                  <div className="w-full aspect-[16/10] rounded-2xl overflow-hidden border border-zinc-900 relative">
                    <img
                      src={activeEntry.verificationPhoto}
                      alt="Verification proof thumbnail"
                      className="w-full h-full object-cover grayscale"
                    />
                    <div className="absolute bottom-2 left-2 px-2.5 py-0.5 bg-black/60 backdrop-blur-md rounded-full text-[9px] font-mono text-[#ccff00]">
                      🔒 Compliance Proof Saved
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-2 bg-gradient-to-r from-zinc-900 via-[#ccff00]/20 to-zinc-900 rounded-full" />
                )}

                {/* User's Original Journal Text */}
                <div className="space-y-1">
                  <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest block">
                    Your Evening Journal
                  </span>
                  <p className="text-sm text-zinc-300 italic leading-relaxed">
                    "{activeEntry.journalText}"
                  </p>
                </div>

                {/* Custom AI Narration Memoir segment */}
                {activeEntry.story && (
                  <div className="space-y-2 pt-4 border-t border-zinc-900">
                    <span className="text-[9px] font-mono text-[#ccff00] uppercase tracking-widest flex items-center gap-1">
                      <Star className="w-3 h-3 fill-[#ccff00]" /> AI Memoir Narration
                    </span>
                    <p className="text-sm font-serif text-zinc-200 leading-relaxed">
                      {activeEntry.story}
                    </p>
                  </div>
                )}

                {/* Customized day quote */}
                {activeEntry.quote && (
                  <div className="bg-[#ccff00]/5 border border-[#ccff00]/10 rounded-2xl p-4 text-center italic text-xs text-zinc-300">
                    "{activeEntry.quote}"
                  </div>
                )}
              </div>
            </div>

            {/* Navigation page-turn buttons */}
            <div className="flex justify-between items-center border-t border-zinc-900 pt-4 shrink-0 font-mono text-xs text-zinc-500">
              <button
                disabled={readingPageIndex === 0}
                onClick={() => setReadingPageIndex(readingPageIndex - 1)}
                className="flex items-center gap-1 text-zinc-400 hover:text-white disabled:opacity-30 disabled:hover:text-zinc-400 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" /> Previous
              </button>
              <span>
                {readingPageIndex + 1} / {currentChapterEntries.length}
              </span>
              <button
                disabled={readingPageIndex === currentChapterEntries.length - 1}
                onClick={() => setReadingPageIndex(readingPageIndex + 1)}
                className="flex items-center gap-1 text-zinc-400 hover:text-white disabled:opacity-30 disabled:hover:text-zinc-400 cursor-pointer"
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
