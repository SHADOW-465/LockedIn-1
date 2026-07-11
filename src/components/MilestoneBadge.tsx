import React from "react";
import { motion } from "motion/react";
import { Trophy, Shield, Zap, Flame, Award, Heart, CheckCircle2, Star, Eye } from "lucide-react";
import { UserProfile, DailyEntry, UrgeEvent } from "../types";

export interface BadgeDefinition {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  color: string; // Tailwind class text/border
  bgColor: string; // Tailwind class bg
  checkEarned: (profile: UserProfile, entries: DailyEntry[], urges: UrgeEvent[]) => boolean;
}

export const BADGES: BadgeDefinition[] = [
  {
    id: "streak_7",
    title: "Iron Will",
    description: "Maintained a streak of 7 or more consecutive days.",
    icon: Flame,
    color: "text-[#ccff00] border-[#ccff00]/30",
    bgColor: "bg-[#ccff00]/5",
    checkEarned: (profile) => profile.longestSession >= 7 || profile.currentStreak >= 7,
  },
  {
    id: "streak_14",
    title: "Sacred Sentry",
    description: "Maintained a streak of 14 or more consecutive days.",
    icon: Award,
    color: "text-amber-400 border-amber-450/30",
    bgColor: "bg-amber-450/5",
    checkEarned: (profile) => profile.longestSession >= 14 || profile.currentStreak >= 14,
  },
  {
    id: "streak_30",
    title: "Unshakable Soul",
    description: "Unbroken discipline for 30 consecutive days.",
    icon: Shield,
    color: "text-indigo-400 border-indigo-450/30",
    bgColor: "bg-indigo-450/5",
    checkEarned: (profile) => profile.longestSession >= 30 || profile.currentStreak >= 30,
  },
  {
    id: "integrity_high",
    title: "Absolute Alignment",
    description: "Achieved an overall integrity rating of 95% or higher.",
    icon: Zap,
    color: "text-emerald-400 border-emerald-450/30",
    bgColor: "bg-emerald-450/5",
    checkEarned: (profile) => profile.integrityPercent >= 95,
  },
  {
    id: "checks_10",
    title: "Vigilant Ritualist",
    description: "Completed 10 or more morning/evening lock verifications.",
    icon: CheckCircle2,
    color: "text-cyan-400 border-cyan-450/30",
    bgColor: "bg-cyan-450/5",
    checkEarned: (_, entries) => {
      const completedCount = entries.reduce((acc, curr) => {
        let count = 0;
        if (curr.morningCompleted) count++;
        if (curr.eveningCompleted) count++;
        return acc + count;
      }, 0);
      return completedCount >= 10;
    },
  },
  {
    id: "urge_overcome_3",
    title: "Sovereign Mind",
    description: "Faced down and successfully resolved 3 or more urges.",
    icon: Heart,
    color: "text-rose-400 border-rose-450/30",
    bgColor: "bg-rose-450/5",
    checkEarned: (_, __, urges) => urges.filter(u => u.resolved).length >= 3,
  },
  {
    id: "proof_master",
    title: "Unyielding Sincerity",
    description: "Provided at least 5 verification records or proof uploads.",
    icon: Trophy,
    color: "text-purple-400 border-purple-450/30",
    bgColor: "bg-purple-450/5",
    checkEarned: (profile) => profile.proofUploadsCount >= 5,
  },
];

interface MilestoneBadgeProps {
  profile: UserProfile;
  entries: DailyEntry[];
  urges: UrgeEvent[];
}

export function MilestoneBadgeList({ profile, entries, urges }: MilestoneBadgeProps) {
  const earnedBadges = BADGES.map((b) => ({
    ...b,
    isEarned: b.checkEarned(profile, entries, urges),
  }));

  const unlockedCount = earnedBadges.filter((b) => b.isEarned).length;

  return (
    <div className="space-y-3 bg-zinc-950 border border-zinc-900 rounded-[28px] p-5">
      <div className="flex items-center justify-between border-b border-zinc-900/60 pb-2">
        <h3 className="text-xs font-mono text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
          <Star className="w-3.5 h-3.5 text-[#ccff00]" /> Earned Achievements
        </h3>
        <span className="text-[10px] font-mono text-zinc-400 bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded-full">
          {unlockedCount} / {BADGES.length} Unlocked
        </span>
      </div>

      {/* Horizontal Scrollable Badge Row */}
      <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
        {earnedBadges.map((badge) => {
          const Icon = badge.icon;
          return (
            <motion.div
              key={badge.id}
              whileHover={{ scale: badge.isEarned ? 1.05 : 1 }}
              className={`flex-none w-28 p-3 rounded-2xl border flex flex-col items-center text-center transition-all duration-300 relative ${
                badge.isEarned
                  ? `${badge.color} ${badge.bgColor} shadow-sm shadow-[#ccff00]/2`
                  : "bg-zinc-900/10 border-zinc-950 text-zinc-700"
              }`}
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center border mb-2 transition-all duration-300 ${
                  badge.isEarned
                    ? `border-current ${badge.bgColor}`
                    : "border-zinc-900 bg-zinc-950"
                }`}
              >
                <Icon className={`w-5 h-5 ${badge.isEarned ? "" : "text-zinc-800"}`} />
              </div>

              <span className={`text-[10px] font-bold font-mono truncate w-full ${badge.isEarned ? "text-white" : "text-zinc-600"}`}>
                {badge.title}
              </span>
              
              <span className="text-[8px] leading-tight text-zinc-500 font-mono mt-1 h-8 line-clamp-2 overflow-hidden w-full">
                {badge.isEarned ? badge.description : "Locked"}
              </span>

              {!badge.isEarned && (
                <div className="absolute inset-0 bg-black/40 rounded-2xl flex items-center justify-center pointer-events-none">
                  <span className="text-[18px] text-zinc-800 font-mono">🔒</span>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
