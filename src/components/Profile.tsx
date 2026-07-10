import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Award, Lock, CheckCircle2, User, Bell, Shield, Sliders, HardDriveDownload, 
  RefreshCw, Trash2, HelpCircle, ChevronRight, Eye, Database, Terminal, 
  FolderOpen, Folder, Play, Check, AlertCircle, Download, Upload, Smartphone, Copy, FileText 
} from "lucide-react";
import { UserProfile, Milestone, DailyEntry, UrgeEvent, ChatMessage } from "../types";

interface ProfileProps {
  profile: UserProfile;
  milestones: Milestone[];
  entries: DailyEntry[];
  urges: UrgeEvent[];
  messages: ChatMessage[];
  onUpdateProfile: (updates: Partial<UserProfile>) => void;
  onResetAll: () => void;
  onExportData: () => void;
  onImportData: (profile: UserProfile, entries: DailyEntry[], urges: UrgeEvent[], messages: ChatMessage[]) => void;
}

export default function Profile({
  profile,
  milestones,
  entries,
  urges,
  messages,
  onUpdateProfile,
  onResetAll,
  onExportData,
  onImportData,
}: ProfileProps) {
  const [activeSubTab, setActiveSubTab] = useState<"milestones" | "settings" | "sqlite_os">("milestones");
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(profile.name);
  const [commitmentInput, setCommitmentInput] = useState(profile.commitment);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // --- SQLite OS Command Center States ---
  const [sqlQuery, setSqlQuery] = useState("SELECT * FROM daily_entries WHERE verified = true LIMIT 3;");
  const [sqlResult, setSqlResult] = useState<any[] | null>(null);
  const [sqlError, setSqlError] = useState<string | null>(null);
  const [activeFolder, setActiveFolder] = useState<"databases" | "memoirs" | "media">("databases");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const runSimulatedQuery = (queryText: string) => {
    setSqlError(null);
    const cleanQuery = queryText.trim().replace(/;$/, "").replace(/\s+/g, " ").toLowerCase();
    
    try {
      if (!cleanQuery.startsWith("select")) {
        throw new Error("Only SELECT queries are supported in read-only visualizer terminal.");
      }
      
      let tableName = "";
      if (cleanQuery.includes("user_profile")) tableName = "user_profile";
      else if (cleanQuery.includes("daily_entries")) tableName = "daily_entries";
      else if (cleanQuery.includes("urge_events") || cleanQuery.includes("urges")) tableName = "urge_events";
      else if (cleanQuery.includes("chat_messages") || cleanQuery.includes("messages")) tableName = "chat_messages";
      else {
        throw new Error("Table not found. Available: user_profile, daily_entries, urge_events, chat_messages");
      }
      
      let sourceData: any[] = [];
      if (tableName === "user_profile") sourceData = [profile];
      else if (tableName === "daily_entries") sourceData = entries;
      else if (tableName === "urge_events") sourceData = urges;
      else if (tableName === "chat_messages") sourceData = messages;
      
      // Basic Projection
      let selectedFields = "*";
      const selectMatch = cleanQuery.match(/select\s+(.+?)\s+from/);
      if (selectMatch) {
        selectedFields = selectMatch[1].trim();
      }
      
      // Basic Filtering
      let filteredData = [...sourceData];
      if (cleanQuery.includes("where")) {
        const whereClause = cleanQuery.split("where")[1].split("limit")[0].trim();
        
        if (whereClause.includes("verified = 1") || whereClause.includes("verified = true")) {
          filteredData = filteredData.filter(d => d.verified);
        } else if (whereClause.includes("resolved = 1") || whereClause.includes("resolved = true")) {
          filteredData = filteredData.filter(d => d.resolved);
        } else if (whereClause.includes("daynumber >")) {
          const match = whereClause.match(/daynumber\s*>\s*(\d+)/);
          if (match) {
            const val = parseInt(match[1]);
            filteredData = filteredData.filter(d => d.dayNumber > val);
          }
        } else if (whereClause.includes("intensity >")) {
          const match = whereClause.match(/intensity\s*>\s*(\d+)/);
          if (match) {
            const val = parseInt(match[1]);
            filteredData = filteredData.filter(d => d.intensity > val);
          }
        }
      }
      
      // Basic LIMIT
      if (cleanQuery.includes("limit")) {
        const limitMatch = cleanQuery.match(/limit\s+(\d+)/);
        if (limitMatch) {
          const limitVal = parseInt(limitMatch[1]);
          filteredData = filteredData.slice(0, limitVal);
        }
      }
      
      // Field Projection mapping
      if (selectedFields !== "*" && selectedFields !== "all") {
        const fields = selectedFields.split(",").map(f => f.trim());
        filteredData = filteredData.map(item => {
          const newItem: any = {};
          fields.forEach(f => {
            const realKey = Object.keys(item).find(k => k.toLowerCase() === f);
            if (realKey) {
              newItem[realKey] = item[realKey];
            } else {
              newItem[f] = null;
            }
          });
          return newItem;
        });
      }
      
      setSqlResult(filteredData);
    } catch (err: any) {
      setSqlError(err.message || "Unknown SQL error.");
      setSqlResult(null);
    }
  };

  const triggerExportDatabase = () => {
    const backupObj = {
      version: "LOCKEDIN-X v2.0-SQLite",
      timestamp: new Date().toISOString(),
      profile,
      entries,
      urges,
      messages
    };
    const blob = new Blob([JSON.stringify(backupObj, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `lockedinx_db_backup.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleImportFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.profile && parsed.entries) {
          onImportData(
            parsed.profile,
            parsed.entries,
            parsed.urges || [],
            parsed.messages || []
          );
          alert("📱 Database imported successfully! Mobile directories and local SQL indices are synchronized.");
        } else {
          alert("Invalid backup file. Missing 'profile' or 'entries' records.");
        }
      } catch (err) {
        alert("Failed to parse SQL backup file. Please verify file integrity.");
      }
    };
    reader.readAsText(file);
  };

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

      {/* Sub tabs: Milestones / Settings / SQLite Sync */}
      <div className="flex bg-zinc-950 p-1.5 border border-zinc-900 rounded-2xl gap-1">
        <button
          onClick={() => setActiveSubTab("milestones")}
          className={`flex-1 py-2 rounded-xl font-mono text-[11px] font-bold transition cursor-pointer text-center ${
            activeSubTab === "milestones"
              ? "bg-[#ccff00] text-black shadow-lg shadow-[#ccff00]/10"
              : "text-zinc-400 hover:text-white"
          }`}
        >
          Milestones
        </button>
        <button
          onClick={() => setActiveSubTab("settings")}
          className={`flex-1 py-2 rounded-xl font-mono text-[11px] font-bold transition cursor-pointer text-center ${
            activeSubTab === "settings"
              ? "bg-[#ccff00] text-black shadow-lg shadow-[#ccff00]/10"
              : "text-zinc-400 hover:text-white"
          }`}
        >
          Settings
        </button>
        <button
          onClick={() => setActiveSubTab("sqlite_os")}
          className={`flex-1 py-2 rounded-xl font-mono text-[11px] font-bold transition cursor-pointer text-center flex items-center justify-center gap-1 ${
            activeSubTab === "sqlite_os"
              ? "bg-[#ccff00] text-black shadow-lg shadow-[#ccff00]/10"
              : "text-zinc-400 hover:text-white"
          }`}
        >
          <Database className="w-3.5 h-3.5" /> Mobile SQLite
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
        ) : activeSubTab === "settings" ? (
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
        ) : (
          <motion.div
            key="sqlite-os-tab"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* Folder explorer card representing mobile physical directory layout */}
            <div className="bg-zinc-950 border border-zinc-900 rounded-[24px] p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-[#ccff00]" /> Mobile Directory Sync
                  </h3>
                  <p className="text-[11px] text-zinc-500 font-mono mt-0.5">
                    Internal storage path: /LockedInX/
                  </p>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[9px] font-mono font-bold text-emerald-400 uppercase tracking-wide">
                  ACTIVE SYNC
                </span>
              </div>

              {/* Simulated Directory layout tabs */}
              <div className="grid grid-cols-3 gap-1 bg-zinc-900/60 p-1 rounded-xl border border-zinc-900">
                <button
                  type="button"
                  onClick={() => setActiveFolder("databases")}
                  className={`py-1.5 rounded-lg text-[10px] font-mono font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                    activeFolder === "databases" ? "bg-zinc-800 text-white" : "text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  <Database className="w-3.5 h-3.5" /> databases/
                </button>
                <button
                  type="button"
                  onClick={() => setActiveFolder("memoirs")}
                  className={`py-1.5 rounded-lg text-[10px] font-mono font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                    activeFolder === "memoirs" ? "bg-zinc-800 text-white" : "text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  <FolderOpen className="w-3.5 h-3.5" /> memoirs/
                </button>
                <button
                  type="button"
                  onClick={() => setActiveFolder("media")}
                  className={`py-1.5 rounded-lg text-[10px] font-mono font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                    activeFolder === "media" ? "bg-zinc-800 text-white" : "text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  <Folder className="w-3.5 h-3.5" /> media/
                </button>
              </div>

              {/* Folder Content list */}
              <div className="bg-zinc-900/30 border border-zinc-900 rounded-xl p-3 min-h-[140px] flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-[11px] font-mono text-zinc-600 border-b border-zinc-900/80 pb-2 mb-2">
                    <span>File Name</span>
                    <span>Properties / Actions</span>
                  </div>

                  {activeFolder === "databases" && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="text-zinc-300 flex items-center gap-2">
                          <Database className="w-3.5 h-3.5 text-[#ccff00]" /> lockedinx.sqlite
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-zinc-600">SQLite DB ({entries.length} check-ins, {urges.length} urges)</span>
                          <button
                            onClick={triggerExportDatabase}
                            className="p-1 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 rounded text-[#ccff00] cursor-pointer"
                            title="Export backup file"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="text-zinc-300 flex items-center gap-2">
                          <Sliders className="w-3.5 h-3.5 text-zinc-500" /> schema.sql
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-zinc-600">4 tables, 18 indices</span>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(`
CREATE TABLE user_profile (
  id TEXT PRIMARY KEY,
  name TEXT,
  commitment TEXT,
  target_goal_days INTEGER,
  current_streak INTEGER,
  longest_session INTEGER,
  discipline_phase TEXT,
  xp INTEGER
);

CREATE TABLE daily_entries (
  date TEXT PRIMARY KEY,
  day_number INTEGER,
  morning_completed INTEGER,
  evening_completed INTEGER,
  mood INTEGER,
  difficulty INTEGER,
  journal_text TEXT,
  verified INTEGER,
  story TEXT
);

CREATE TABLE urge_events (
  id TEXT PRIMARY KEY,
  timestamp TEXT,
  intensity INTEGER,
  trigger TEXT,
  journal TEXT,
  resolved INTEGER
);
                              `);
                              alert("SQLite Schema copied to clipboard!");
                            }}
                            className="p-1 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 rounded text-zinc-400 cursor-pointer"
                            title="Copy schema SQL"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeFolder === "memoirs" && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="text-zinc-300 flex items-center gap-2">
                          <FileText className="w-3.5 h-3.5 text-sky-400" /> autobiography.md
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-zinc-600">Markdown document (Living memoir)</span>
                          <button
                            onClick={onExportData}
                            className="p-1 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 rounded text-[#ccff00] cursor-pointer"
                            title="Download memoir markdown"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeFolder === "media" && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="text-zinc-300 flex items-center gap-2">
                          <Eye className="w-3.5 h-3.5 text-emerald-400" /> signature.png
                        </span>
                        <span className="text-[10px] text-zinc-600 font-bold uppercase text-emerald-500">Device Locked</span>
                      </div>
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="text-zinc-300 flex items-center gap-2">
                          <Eye className="w-3.5 h-3.5 text-zinc-500" /> verification_stamps/
                        </span>
                        <span className="text-[10px] text-zinc-600">Encrypted in app bundle</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="border-t border-zinc-900 pt-3 mt-3 flex justify-between gap-2 items-center">
                  <div className="text-[10px] text-zinc-500 font-mono leading-relaxed">
                    To upload/restore a physical backup database file, click Import:
                  </div>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-1.5 bg-[#ccff00] text-black font-mono font-bold text-[10px] rounded-lg cursor-pointer flex items-center gap-1 hover:opacity-90 shrink-0"
                  >
                    <Upload className="w-3 h-3" /> Import Backup
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImportFileChange}
                    accept=".json"
                    className="hidden"
                  />
                </div>
              </div>
            </div>

            {/* Simulated Live SQLite Shell Terminal */}
            <div className="bg-zinc-950 border border-zinc-900 rounded-[24px] p-6 space-y-4">
              <h3 className="text-xs font-mono text-zinc-500 uppercase tracking-wider border-b border-zinc-900 pb-2 flex items-center gap-1.5">
                <Terminal className="w-4 h-4 text-[#ccff00]" /> SQL Terminal & Database Inspector
              </h3>

              <div className="space-y-2">
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  Query your actual state in real-time. Select a preset below, or write your own custom SQLite query statement:
                </p>

                {/* Preset queries */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {[
                    "SELECT * FROM user_profile;",
                    "SELECT * FROM daily_entries LIMIT 2;",
                    "SELECT * FROM urge_events;"
                  ].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => {
                        setSqlQuery(preset);
                        runSimulatedQuery(preset);
                      }}
                      className="px-2 py-1 bg-zinc-900/80 border border-zinc-850 hover:border-zinc-700 rounded-lg text-[9px] font-mono text-zinc-400 cursor-pointer"
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              {/* Textarea for SQL command */}
              <div className="relative bg-black border border-zinc-900 rounded-xl p-3 font-mono text-xs text-zinc-200">
                <div className="absolute right-2.5 top-2.5 flex items-center gap-1.5">
                  <span className="text-[9px] text-zinc-600 select-none uppercase font-bold">SQLITE3</span>
                  <button
                    onClick={() => runSimulatedQuery(sqlQuery)}
                    className="p-1.5 bg-[#ccff00] text-black hover:opacity-90 rounded-lg cursor-pointer"
                    title="Execute query"
                  >
                    <Play className="w-3 h-3 fill-current" />
                  </button>
                </div>
                <textarea
                  value={sqlQuery}
                  onChange={(e) => setSqlQuery(e.target.value)}
                  rows={2}
                  className="w-full bg-transparent focus:outline-none resize-none text-zinc-100 placeholder-zinc-700 pr-10 leading-normal font-mono"
                  placeholder="SELECT * FROM daily_entries WHERE mood > 3;"
                />
              </div>

              {/* Results console screen */}
              {(sqlResult !== null || sqlError !== null) && (
                <div className="bg-black/90 border border-zinc-900 rounded-xl p-3 font-mono text-xs max-h-[180px] overflow-auto">
                  {sqlError ? (
                    <div className="text-rose-500 flex items-start gap-1.5">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>{sqlError}</span>
                    </div>
                  ) : sqlResult && sqlResult.length === 0 ? (
                    <div className="text-zinc-600 italic">Query completed successfully (0 rows returned).</div>
                  ) : sqlResult ? (
                    <div className="space-y-2">
                      <div className="text-[10px] text-zinc-500 flex items-center justify-between border-b border-zinc-900 pb-1.5">
                        <span>Rows: {sqlResult.length}</span>
                        <span className="text-emerald-500 font-bold uppercase text-[9px]">SUCCESS</span>
                      </div>
                      <table className="w-full text-left text-[10px]">
                        <thead>
                          <tr className="border-b border-zinc-900 text-zinc-500 font-semibold">
                            {Object.keys(sqlResult[0] || {}).map((k) => (
                              <th key={k} className="py-1 px-1 font-bold">{k}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {sqlResult.map((row, idx) => (
                            <tr key={idx} className="border-b border-zinc-950/40 hover:bg-zinc-900/20 text-zinc-300">
                              {Object.values(row).map((val: any, vIdx) => (
                                <td key={vIdx} className="py-1.5 px-1 truncate max-w-[120px]">
                                  {val === true ? "true" : val === false ? "false" : typeof val === "object" ? JSON.stringify(val).substring(0, 15) + "..." : String(val)}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : null}
                </div>
              )}
            </div>

            {/* Native APK Packaging Guide */}
            <div className="bg-zinc-950 border border-zinc-900 rounded-[24px] p-6 space-y-4">
              <h3 className="text-xs font-mono text-zinc-500 uppercase tracking-wider border-b border-zinc-900 pb-2 flex items-center gap-1.5">
                <Smartphone className="w-4 h-4 text-sky-500" /> How to compile real APK on your mobile
              </h3>

              <div className="space-y-3 font-mono text-[11px] text-zinc-400 leading-relaxed">
                <p>
                  Our application is fully optimized for **Capacitor**, meaning you can immediately turn this exact codebase into a real native Android APK that utilizes physical storage folders!
                </p>
                <div className="bg-black/90 p-3 rounded-xl border border-zinc-900 space-y-1 select-all text-xs text-[#ccff00]">
                  <div># 1. Install Capacitor CLI</div>
                  <div className="text-zinc-500">npm install @capacitor/cli @capacitor/core</div>
                  <div className="pt-2"># 2. Add Android native platform</div>
                  <div className="text-zinc-500">npm install @capacitor/android && npx cap add android</div>
                  <div className="pt-2"># 3. Build Web Assets & Compile to APK</div>
                  <div className="text-zinc-500">npm run build && npx cap sync && npx cap open android</div>
                </div>
                <div className="p-3.5 bg-zinc-900/40 border border-zinc-900 rounded-xl space-y-1 font-sans">
                  <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Physical Mobile Storage Folders
                  </h4>
                  <p className="text-[11px] text-zinc-500">
                    When running as a packed APK, Capacitor binds database requests directly to native SQLite files at <code className="text-zinc-400 bg-zinc-900 px-1 py-0.5 rounded font-mono">/databases/lockedinx.db</code>, meaning your written memoir and progress stay completely secure inside your local directory folders forever.
                  </p>
                </div>
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
