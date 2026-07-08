/**
 * LOCKEDIN-X TypeScript Shared Types & Interfaces
 */

export interface UserProfile {
  name: string;
  commitment: string;
  favoriteQuote: string;
  startDate: string; // ISO date string
  currentStreak: number;
  integrityPercent: number; // e.g. 96
  complianceScore: number; // e.g. 92
  selfControlIndex: number; // e.g. 87
  longestSession: number; // e.g. 18
  proofUploadsCount: number; // e.g. 42
  disciplinePhase: string; // e.g. "Momentum", "Foundation", "Unshakable"
  xp: number; // e.g. 425
  xpTarget: number; // e.g. 800
  targetGoalDays: number; // user specified goal in onboarding
}

export interface DailyEntry {
  dayNumber: number;
  date: string; // YYYY-MM-DD
  morningCompleted: boolean;
  eveningCompleted: boolean;
  mood: number; // 1 to 5
  difficulty: number; // 1 to 10
  journalText: string;
  verified: boolean;
  verificationPhoto?: string; // base64 or placeholder URL
  verificationResult?: {
    imageQuality: string;
    lockDetected: boolean;
    positionValid: boolean;
    timeValid: boolean;
    confidence: number;
    explanation: string;
  };
  story?: string; // AI generated memoir story
  title?: string; // AI generated narrative title
  quote?: string; // AI generated customized quote
  insight?: string; // AI generated inline insight annotation
  chapterName?: string; // e.g., "The Beginning", "Finding Stability"
  timestamp: number;
}

export interface UrgeEvent {
  id: string;
  timestamp: string; // ISO string
  intensity: number; // 1 to 10
  trigger: string;
  journal: string;
  resolved: boolean;
  durationMinutes: number;
}

export interface Milestone {
  id: string;
  title: string;
  description: string;
  targetDays: number;
  unlocked: boolean;
  unlockedAt?: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export interface OnboardingState {
  step: number; // 0 to 5
  name: string;
  commitment: string;
  morningReminder: string; // e.g. "08:00"
  eveningReminder: string; // e.g. "21:00"
  enableMorning: boolean;
  enableEvening: boolean;
  enableUrgeSupport: boolean;
  completed: boolean;
  targetGoalDays: number;
}
