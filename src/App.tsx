import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { getLocalStorage } from "./lib/storage";
import { UserProfile, DailyEntry, Milestone, ChatMessage, OnboardingState, UrgeEvent } from "./types";
import Onboarding from "./components/Onboarding";
import Dashboard from "./components/Dashboard";
import Timeline from "./components/Timeline";
import Ritual from "./components/Ritual";
import Memoir from "./components/Memoir";
import Support from "./components/Support";
import Companion from "./components/Companion";
import Profile from "./components/Profile";
import { Home as HomeIcon, BookOpen, Plus, MessageSquare, User, ShieldAlert } from "lucide-react";

export default function App() {
  // 1. Core State
  const [onboarding, setOnboarding] = useState<OnboardingState | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [entries, setEntries] = useState<DailyEntry[]>([]);
  const [urges, setUrges] = useState<UrgeEvent[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  
  // Navigation
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [activeRitual, setActiveRitual] = useState<"morning" | "evening" | null>(null);
  const [supportActive, setSupportActive] = useState<boolean>(false);

  // 2. Load stored state
  useEffect(() => {
    const ob = getLocalStorage.getOnboardingState();
    setOnboarding(ob);

    if (ob.completed) {
      setProfile(getLocalStorage.getUserProfile());
      setEntries(getLocalStorage.getDailyEntries());
      setUrges(getLocalStorage.getUrges());
      setMilestones(getLocalStorage.getMilestones());
      setMessages(getLocalStorage.getChatMessages());
    }
  }, []);

  // 2.5 Dynamic Recalculation of stats to make everything functional and real
  useEffect(() => {
    if (!profile) return;

    const sortedAsc = [...entries].sort((a, b) => Date.parse(a.date) - Date.parse(b.date));

    // Calculate current streak of continuous active days
    let currentStreak = 0;
    let maxStreak = profile.longestSession || 0;
    let activeStreak = 0;

    for (const entry of sortedAsc) {
      if (entry.morningCompleted || entry.eveningCompleted) {
        activeStreak++;
        if (activeStreak > maxStreak) {
          maxStreak = activeStreak;
        }
      } else {
        activeStreak = 0;
      }
    }
    currentStreak = activeStreak;

    // Total slots (2 per day)
    const totalSlots = entries.length * 2;
    const completedSlots = entries.reduce((acc, e) => {
      let count = 0;
      if (e.morningCompleted) count++;
      if (e.eveningCompleted) count++;
      return acc + count;
    }, 0);

    const integrityPercent = totalSlots > 0 ? Math.min(100, Math.round((completedSlots / totalSlots) * 100)) : 100;

    // Compliance Score: verified days / total days * 100
    const verifiedDays = entries.filter(e => e.verified).length;
    const complianceScore = entries.length > 0 ? Math.min(100, Math.round((verifiedDays / entries.length) * 100)) : 100;

    // Self Control Index: starts at 100, drops for unresolved urges & intensity
    const totalUrges = urges.length;
    const resolvedUrges = urges.filter(u => u.resolved).length;
    const avgIntensity = totalUrges > 0 ? (urges.reduce((acc, u) => acc + u.intensity, 0) / totalUrges) : 0;
    let selfControlIndex = 100;
    if (totalUrges > 0) {
      const unresolvedPenalty = (totalUrges - resolvedUrges) * 20;
      const intensityPenalty = avgIntensity * 4;
      selfControlIndex = Math.max(10, Math.round(100 - unresolvedPenalty - intensityPenalty));
    }

    const proofUploadsCount = entries.filter(e => e.verificationPhoto).length;

    // XP calculation: 50 XP per entry, 25 XP per resolved urge
    const xp = (entries.length * 50) + (resolvedUrges * 25);
    const xpTarget = 1000;

    let disciplinePhase = "Foundation";
    if (currentStreak >= 30) {
      disciplinePhase = "Unshakable";
    } else if (currentStreak >= 14) {
      disciplinePhase = "Momentum";
    }

    const updatedProfile: UserProfile = {
      ...profile,
      currentStreak: currentStreak || 1,
      longestSession: Math.max(maxStreak, currentStreak, 1),
      integrityPercent,
      complianceScore,
      selfControlIndex,
      proofUploadsCount,
      disciplinePhase,
      xp,
      xpTarget,
    };

    // Only update if there are physical changes
    if (
      profile.currentStreak !== updatedProfile.currentStreak ||
      profile.longestSession !== updatedProfile.longestSession ||
      profile.integrityPercent !== updatedProfile.integrityPercent ||
      profile.complianceScore !== updatedProfile.complianceScore ||
      profile.selfControlIndex !== updatedProfile.selfControlIndex ||
      profile.proofUploadsCount !== updatedProfile.proofUploadsCount ||
      profile.xp !== updatedProfile.xp ||
      profile.disciplinePhase !== updatedProfile.disciplinePhase
    ) {
      getLocalStorage.saveUserProfile(updatedProfile);
      setProfile(updatedProfile);
    }
  }, [entries, urges]);

  // 3. Handlers
  const handleOnboardingComplete = (obState: OnboardingState) => {
    getLocalStorage.saveOnboardingState(obState);
    setOnboarding(obState);

    // Bootstrap user profile and seed data
    const initialProfile: UserProfile = {
      name: obState.name,
      commitment: obState.commitment,
      favoriteQuote: "Discipline is the slow, deliberate work of choosing what we want most over what we want now.",
      startDate: new Date().toISOString(),
      currentStreak: 14, // Bootstrapped with seeded history days 1-13, making today Day 14!
      integrityPercent: 96,
      complianceScore: 92,
      selfControlIndex: 87,
      longestSession: 18,
      proofUploadsCount: 42,
      disciplinePhase: "Momentum",
      xp: 425,
      xpTarget: 800,
      targetGoalDays: obState.targetGoalDays || 30,
    };
    getLocalStorage.saveUserProfile(initialProfile);
    setProfile(initialProfile);

    const seededEntries = getLocalStorage.getDailyEntries();
    setEntries(seededEntries);

    const seededUrges = getLocalStorage.getUrges();
    setUrges(seededUrges);

    const seededMilestones = getLocalStorage.getMilestones();
    setMilestones(seededMilestones);

    const seededMessages = getLocalStorage.getChatMessages();
    setMessages(seededMessages);
  };

  const handleUpdateProfile = (updates: Partial<UserProfile>) => {
    if (!profile) return;
    const newProfile = { ...profile, ...updates };
    getLocalStorage.saveUserProfile(newProfile);
    setProfile(newProfile);
  };

  const handleAddUrgeLog = (intensity: number, trigger: string, notes: string) => {
    if (!profile) return;
    const newUrge: UrgeEvent = {
      id: "u-" + Date.now(),
      timestamp: new Date().toISOString(),
      intensity,
      trigger,
      journal: notes,
      resolved: true,
      durationMinutes: 10,
    };
    const updatedUrges = [...urges, newUrge];
    getLocalStorage.saveUrges(updatedUrges);
    setUrges(updatedUrges);
  };

  const handleCompleteRitual = (completedEntry: Partial<DailyEntry>) => {
    if (!profile) return;

    const todayDate = new Date().toISOString().split("T")[0];
    let existingEntry = entries.find((e) => e.date === todayDate);

    let updatedEntries: DailyEntry[];

    if (existingEntry) {
      const merged: DailyEntry = {
        ...existingEntry,
        ...completedEntry,
        morningCompleted: completedEntry.morningCompleted ?? existingEntry.morningCompleted,
        eveningCompleted: completedEntry.eveningCompleted ?? existingEntry.eveningCompleted,
      };
      updatedEntries = entries.map((e) => (e.date === todayDate ? merged : e));
    } else {
      const newDayNum = profile.currentStreak + 1;
      const newEntry: DailyEntry = {
        dayNumber: newDayNum,
        date: todayDate,
        morningCompleted: completedEntry.morningCompleted ?? false,
        eveningCompleted: completedEntry.eveningCompleted ?? false,
        mood: completedEntry.mood ?? 4,
        difficulty: completedEntry.difficulty ?? 3,
        journalText: completedEntry.journalText ?? "",
        verified: completedEntry.verified ?? true,
        verificationPhoto: completedEntry.verificationPhoto,
        verificationResult: completedEntry.verificationResult,
        story: completedEntry.story,
        quote: completedEntry.quote,
        insight: completedEntry.insight,
        chapterName: completedEntry.chapterName,
        timestamp: Date.now(),
      };
      updatedEntries = [...entries, newEntry];
      
      // Update streak and XP on new Day
      handleUpdateProfile({
        currentStreak: newDayNum,
        xp: profile.xp + 50 >= profile.xpTarget ? 100 : profile.xp + 50,
        disciplinePhase: newDayNum > 30 ? "Unshakable" : "Momentum",
        proofUploadsCount: profile.proofUploadsCount + 1,
      });
    }

    getLocalStorage.saveDailyEntries(updatedEntries);
    setEntries(updatedEntries);
    setActiveRitual(null);
  };

  const handleSendMessage = async (text: string) => {
    if (!profile) return;
    const userMsg: ChatMessage = {
      id: "u-" + Date.now(),
      role: "user",
      content: text,
      timestamp: new Date().toISOString(),
    };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    getLocalStorage.saveChatMessages(updatedMessages);

    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updatedMessages.map((m) => ({
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
      const assistantMsg: ChatMessage = {
        id: "assistant-" + Date.now(),
        role: "assistant",
        content: data.reply || "I am with you. Let's make today another strong chapter.",
        timestamp: new Date().toISOString(),
      };
      const finalMessages = [...updatedMessages, assistantMsg];
      setMessages(finalMessages);
      getLocalStorage.saveChatMessages(finalMessages);
    } catch (err) {
      console.error("Companion chat failed:", err);
      const errMsg: ChatMessage = {
        id: "err-" + Date.now(),
        role: "assistant",
        content: "I am always matching your stride, Arjun. Your records indicate beautiful consistency. Focus on your breathing, and let's remain loyal to the commitment you signed on Day 1.",
        timestamp: new Date().toISOString(),
      };
      const finalMessages = [...updatedMessages, errMsg];
      setMessages(finalMessages);
      getLocalStorage.saveChatMessages(finalMessages);
    }
  };

  const handleResetAll = () => {
    getLocalStorage.resetAll();
    setOnboarding({
      step: 0,
      name: "",
      commitment: "",
      morningReminder: "08:00",
      eveningReminder: "21:00",
      enableMorning: true,
      enableEvening: true,
      enableUrgeSupport: true,
      completed: false,
    });
    setProfile(null);
    setEntries([]);
    setUrges([]);
    setMilestones([]);
    setMessages([]);
    setActiveTab("dashboard");
  };

  const handleExportData = () => {
    if (!profile) return;
    // Generate autobiography markdown
    let memoirMarkdown = `# LOCKEDIN-X : AUTOBIOGRAPHY OF ${profile.name.toUpperCase()}\n`;
    memoirMarkdown += `**Commitment Statement:** "${profile.commitment}"\n`;
    memoirMarkdown += `*Streak Record: ${profile.currentStreak} Days Locked*\n\n`;
    
    entries.forEach((e) => {
      memoirMarkdown += `## Chapter Page: Day ${e.dayNumber} (${e.date})\n`;
      memoirMarkdown += `*Mood: ${e.mood}/5 | Difficulty: ${e.difficulty}/10 | Verified: ${e.verified ? "Yes" : "No"}*\n\n`;
      memoirMarkdown += `> "${e.journalText}"\n\n`;
      if (e.story) {
        memoirMarkdown += `### AI Narrative Reflection:\n${e.story}\n\n`;
      }
      if (e.quote) {
        memoirMarkdown += `*Custom Quote: "${e.quote}"*\n\n`;
      }
      memoirMarkdown += `---\n\n`;
    });

    const blob = new Blob([memoirMarkdown], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `LOCKEDIN-X_Memoir_Autobiography.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // 4. Return Loading or Onboarding
  if (!onboarding) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-zinc-500 font-mono text-xs">
        Loading personal operating system...
      </div>
    );
  }

  if (!onboarding.completed) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  const todayDateStr = new Date().toISOString().split("T")[0];
  const todayEntry = entries.find((e) => e.date === todayDateStr);

  return (
    <div className="min-h-screen bg-black text-[#f1f1f1] flex flex-col relative font-sans">
      {/* Background Gradient Orbs */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-[#ccff00]/3 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-[#ccff00]/2 rounded-full blur-[120px] pointer-events-none" />

      {/* Main Container */}
      <main className="flex-1 w-full max-w-lg mx-auto px-4 pt-6 pb-24 z-10 overflow-y-auto">
        {activeTab === "dashboard" && (
          <Dashboard
            profile={profile!}
            entries={entries}
            urges={urges}
            todayEntry={todayEntry}
            onStartRitual={(type) => setActiveRitual(type)}
            onTriggerSupport={() => setSupportActive(true)}
            onNavigateToTab={(tab) => setActiveTab(tab)}
          />
        )}
        {activeTab === "timeline" && (
          <Timeline entries={entries} urges={urges} profile={profile!} />
        )}
        {activeTab === "memoir" && (
          <Memoir entries={entries} profile={profile!} />
        )}
        {activeTab === "companion" && (
          <Companion
            profile={profile!}
            messages={messages}
            onSendMessage={handleSendMessage}
          />
        )}
        {activeTab === "profile" && (
          <Profile
            profile={profile!}
            milestones={milestones}
            onUpdateProfile={handleUpdateProfile}
            onResetAll={handleResetAll}
            onExportData={handleExportData}
          />
        )}
      </main>

      {/* Bottom Sticky Tab Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-zinc-950/85 backdrop-blur-xl border-t border-zinc-900/80 py-3 px-6 z-40">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`flex flex-col items-center gap-1 transition cursor-pointer ${
              activeTab === "dashboard" ? "text-[#ccff00]" : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            <HomeIcon className="w-5 h-5" />
            <span className="text-[10px] font-mono font-medium">Dashboard</span>
          </button>

          <button
            onClick={() => setActiveTab("timeline")}
            className={`flex flex-col items-center gap-1 transition cursor-pointer ${
              activeTab === "timeline" ? "text-[#ccff00]" : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            <ShieldAlert className="w-5 h-5" />
            <span className="text-[10px] font-mono font-medium">Timeline</span>
          </button>

          {/* Special Center Check-In Action button */}
          <button
            onClick={() => {
              if (todayEntry?.morningCompleted && todayEntry?.eveningCompleted) {
                alert("Both rituals completed for today! Return tomorrow for the next chapter.");
              } else {
                setActiveRitual(todayEntry?.morningCompleted ? "evening" : "morning");
              }
            }}
            className="w-12 h-12 rounded-full bg-[#ccff00] hover:scale-105 active:scale-95 text-black flex items-center justify-center shadow-[0_4px_20px_rgba(204,255,0,0.35)] transition -translate-y-4 cursor-pointer"
          >
            <Plus className="w-6 h-6 stroke-[3px]" />
          </button>

          <button
            onClick={() => setActiveTab("memoir")}
            className={`flex flex-col items-center gap-1 transition cursor-pointer ${
              activeTab === "memoir" ? "text-[#ccff00]" : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            <BookOpen className="w-5 h-5" />
            <span className="text-[10px] font-mono font-medium">Memoir</span>
          </button>

          <button
            onClick={() => setActiveTab("companion")}
            className={`flex flex-col items-center gap-1 transition cursor-pointer ${
              activeTab === "companion" ? "text-[#ccff00]" : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            <MessageSquare className="w-5 h-5" />
            <span className="text-[10px] font-mono font-medium">Reflections</span>
          </button>
        </div>
      </nav>

      {/* Interactive Overlays */}
      <AnimatePresence>
        {activeRitual && (
          <Ritual
            ritualType={activeRitual}
            profile={profile!}
            onCompleteRitual={handleCompleteRitual}
            onCancel={() => setActiveRitual(null)}
          />
        )}

        {supportActive && (
          <Support
            profile={profile!}
            onExit={() => setSupportActive(false)}
            onAddUrgeLog={handleAddUrgeLog}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
