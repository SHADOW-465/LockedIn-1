import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Award, Lock, CheckCircle2, User, Bell, Shield, Sliders, HardDriveDownload, RefreshCw, Trash2, HelpCircle, ChevronRight, Eye } from "lucide-react";
import { UserProfile, Milestone } from "../types";

interface ProfileProps {
  profile: UserProfile;
  milestones: Milestone[];
  onUpdateProfile: (updates: Partial<UserProfile>) => void;
  onResetAll: () => void;
  onExportData: () => void;
}

export default function Profile({
  profile,
  milestones,
  onUpdateProfile,
  onResetAll,
  onExportData,
}: ProfileProps) {
  const [activeSubTab, setActiveSubTab] = useState<"milestones" | "settings">("milestones");
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(profile.name);
  const [commitmentInput, setCommitmentInput] = useState(profile.commitment);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleSaveProfile = () => {
    onUpdateProfile({
      name: nameInput,
      commitment: commitmentInput,
    });
    setEditingName(false);
  };

  return (
    <div className="space-y-6 pb-20 animate-fade-in text-[#f1f1f1]">
      {/* Top Identity Portrait Card */}
      <div className="bg-zinc-950 border border-zinc-900 rounded-[32px] p-6 space-y-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-[#ccff00]">
            <User className="w-8 h-8" />
          </div>
          <div className="space-y-0.5">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              {profile.name}
            </h2>
            <p className="text-xs text-zinc-500 font-mono">
              Current Phase: <span className="text-[#ccff00] font-bold">{profile.disciplinePhase}</span>
            </p>
          </div>
        </div>

        {/* XP Level progress bar */}
        <div className="space-y-1.5 pt-2">
          <div className="flex justify-between text-xs font-mono text-zinc-500">
            <span>Discipline Progress</span>
            <span>{profile.xp} / {profile.xpTarget} XP</span>
          </div>
          <div className="w-full bg-zinc-900 h-2 rounded-full overflow-hidden">
            <div
              className="bg-[#ccff00] h-full rounded-full transition-all duration-1000"
              style={{ width: `${(profile.xp / profile.xpTarget) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Sub tabs: Milestones / Settings */}
      <div className="flex bg-zinc-950 p-1.5 border border-zinc-900 rounded-2xl">
        <button
          onClick={() => setActiveSubTab("milestones")}
          className={`flex-1 py-2 rounded-xl font-mono text-xs font-bold transition cursor-pointer ${
            activeSubTab === "milestones"
              ? "bg-[#ccff00] text-black"
              : "text-zinc-400 hover:text-white"
          }`}
        >
          My Milestones
        </button>
        <button
          onClick={() => setActiveSubTab("settings")}
          className={`flex-1 py-2 rounded-xl font-mono text-xs font-bold transition cursor-pointer ${
            activeSubTab === "settings"
              ? "bg-[#ccff00] text-black"
              : "text-zinc-400 hover:text-white"
          }`}
        >
          Settings & Identity
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeSubTab === "milestones" ? (
          <motion.div
            key="milestones-tab"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            <h3 className="text-xs font-mono text-zinc-500 uppercase tracking-widest pl-2">
              HONOR & ACHIEVEMENTS
            </h3>

            <div className="space-y-3">
              {milestones.map((ms) => (
                <div
                  key={ms.id}
                  className={`p-4 bg-zinc-950 border border-zinc-900 rounded-2xl flex items-center justify-between transition ${
                    ms.unlocked ? "border-[#ccff00]/20" : "opacity-60"
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        ms.unlocked ? "bg-[#ccff00]/10 text-[#ccff00]" : "bg-zinc-900 text-zinc-500"
                      }`}
                    >
                      {ms.unlocked ? <Award className="w-5.5 h-5.5" /> : <Lock className="w-5 h-5" />}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">{ms.title}</h4>
                      <p className="text-xs text-zinc-500 mt-0.5">{ms.description}</p>
                    </div>
                  </div>
                  {ms.unlocked ? (
                    <div className="w-6 h-6 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center text-emerald-400 shrink-0">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                  ) : (
                    <span className="text-[10px] font-mono text-zinc-600 uppercase font-bold shrink-0">Locked</span>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="settings-tab"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* Edit Identity Profile Info */}
            <div className="bg-zinc-950 border border-zinc-900 rounded-[24px] p-6 space-y-4">
              <h3 className="text-xs font-mono text-zinc-500 uppercase tracking-wider border-b border-zinc-900 pb-2">
                EDIT DISCIPLINE PROFILE
              </h3>

              {editingName ? (
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-zinc-500 uppercase">Profile Name</label>
                    <input
                      type="text"
                      value={nameInput}
                      onChange={(e) => setNameInput(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-2 px-3 text-sm text-white focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-zinc-500 uppercase">My Commitment Statement</label>
                    <textarea
                      value={commitmentInput}
                      onChange={(e) => setCommitmentInput(e.target.value)}
                      rows={3}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-2 px-3 text-sm text-white focus:outline-none resize-none"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleSaveProfile}
                      className="flex-1 bg-[#ccff00] text-black font-bold py-2 rounded-xl text-xs cursor-pointer"
                    >
                      Save Profile
                    </button>
                    <button
                      onClick={() => setEditingName(false)}
                      className="flex-1 bg-zinc-900 border border-zinc-800 text-zinc-400 py-2 rounded-xl text-xs cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="text-sm font-bold text-white">Identity Statement</h4>
                    <p className="text-xs text-zinc-400 mt-1 max-w-xs leading-relaxed italic">
                      "{profile.commitment}"
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setNameInput(profile.name);
                      setCommitmentInput(profile.commitment);
                      setEditingName(true);
                    }}
                    className="p-2 bg-zinc-900 border border-zinc-850 rounded-xl text-[#ccff00] shrink-0 hover:border-zinc-800 cursor-pointer"
                  >
                    Edit
                  </button>
                </div>
              )}
            </div>

            {/* General Toggles */}
            <div className="bg-zinc-950 border border-zinc-900 rounded-[24px] p-6 space-y-4">
              <h3 className="text-xs font-mono text-zinc-500 uppercase tracking-wider border-b border-zinc-900 pb-2">
                APP SETTINGS
              </h3>

              <div className="space-y-4">
                {/* Reminders Row */}
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-3">
                    <Bell className="w-4.5 h-4.5 text-[#ccff00]" />
                    <span>Daily Push Reminders</span>
                  </div>
                  <div className="px-2.5 py-0.5 bg-zinc-900 rounded-full text-[10px] font-mono text-zinc-500 uppercase">
                    Enabled
                  </div>
                </div>

                {/* Secure Lock Row */}
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-3">
                    <Shield className="w-4.5 h-4.5 text-emerald-500" />
                    <span>App Biometric Shield</span>
                  </div>
                  <div className="px-2.5 py-0.5 bg-zinc-900 rounded-full text-[10px] font-mono text-zinc-500 uppercase">
                    Active
                  </div>
                </div>

                {/* AI Model Provider Row */}
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-3">
                    <Sliders className="w-4.5 h-4.5 text-sky-500" />
                    <span>AI Model Provider</span>
                  </div>
                  <div className="text-[#ccff00] font-mono text-xs font-bold">
                    Gemini 3.5 Flash
                  </div>
                </div>
              </div>
            </div>

            {/* Export and Data controls */}
            <div className="bg-zinc-950 border border-zinc-900 rounded-[24px] p-6 space-y-4">
              <h3 className="text-xs font-mono text-zinc-500 uppercase tracking-wider border-b border-zinc-900 pb-2">
                DATA & BACKUPS
              </h3>

              <div className="space-y-3">
                <button
                  onClick={onExportData}
                  className="w-full p-3 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 rounded-xl flex items-center justify-between text-xs font-mono text-zinc-300 transition cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <HardDriveDownload className="w-4.5 h-4.5 text-[#ccff00]" /> Export Living Memoir PDF/JSON
                  </span>
                  <ChevronRight className="w-4 h-4 text-zinc-600" />
                </button>

                <button
                  onClick={() => setShowResetConfirm(true)}
                  className="w-full p-3 bg-rose-950/10 hover:bg-rose-950/20 border border-rose-950/30 rounded-xl flex items-center justify-between text-xs font-mono text-rose-400 transition cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <Trash2 className="w-4.5 h-4.5" /> Purge All Local Data & Restart
                  </span>
                  <ChevronRight className="w-4 h-4 text-rose-700" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reset Confirmation Dialog Popup */}
      <AnimatePresence>
        {showResetConfirm && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-zinc-950 border border-rose-950 rounded-[32px] p-6 max-w-sm w-full space-y-4 text-center"
            >
              <div className="w-12 h-12 bg-rose-500/10 border border-rose-500/20 rounded-full flex items-center justify-center mx-auto text-rose-400">
                <Trash2 className="w-6 h-6" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-lg font-bold text-white">Purge everything?</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  This action is permanent. All your written memoir pages, custom reflections, and lock streak progress will be deleted forever.
                </p>
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => {
                    onResetAll();
                    setShowResetConfirm(false);
                  }}
                  className="flex-1 bg-rose-500 text-white font-bold py-2.5 rounded-xl text-xs hover:bg-rose-600 cursor-pointer"
                >
                  Yes, Purge All
                </button>
                <button
                  onClick={() => setShowResetConfirm(false)}
                  className="flex-1 bg-zinc-900 border border-zinc-800 text-zinc-400 py-2.5 rounded-xl text-xs cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
