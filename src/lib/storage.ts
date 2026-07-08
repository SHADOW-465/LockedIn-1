import { UserProfile, DailyEntry, UrgeEvent, Milestone, ChatMessage, OnboardingState } from "../types";

const KEYS = {
  USER_PROFILE: "lockedinx_user_profile",
  DAILY_ENTRIES: "lockedinx_daily_entries",
  URGES: "lockedinx_urges",
  MILESTONES: "lockedinx_milestones",
  CHAT_MESSAGES: "lockedinx_chat_messages",
  ONBOARDING: "lockedinx_onboarding",
};

// Default milestones to seed
const DEFAULT_MILESTONES: Milestone[] = [
  { id: "1", title: "First Week", description: "Maintain lock and daily check-ins for 7 days.", targetDays: 7, unlocked: true, unlockedAt: "2026-06-30T08:00:00Z" },
  { id: "2", title: "2 Weeks", description: "Maintain lock and daily check-ins for 14 days.", targetDays: 14, unlocked: true, unlockedAt: "2026-07-07T08:00:00Z" },
  { id: "3", title: "30 Days", description: "One month of uninterrupted commitment.", targetDays: 30, unlocked: false },
  { id: "4", title: "60 Days", description: "Two months of solid self-control and focus.", targetDays: 60, unlocked: false },
  { id: "5", title: "90 Days", description: "Three months. A quarter of a year in command.", targetDays: 90, unlocked: false },
  { id: "6", title: "180 Days", description: "Half a year. Becoming truly unshakable.", targetDays: 180, unlocked: false },
  { id: "7", title: "365 Days", description: "A full year of honoring your promise.", targetDays: 365, unlocked: false },
];

// Seed data for 13 days of history to make the Living Memoir look breathtaking on load!
const SEED_ENTRIES: DailyEntry[] = [
  {
    dayNumber: 1,
    date: "2026-06-24",
    morningCompleted: true,
    eveningCompleted: true,
    mood: 4,
    difficulty: 3,
    journalText: "Took the first step today. It feels symbolic and heavy. Locking the cage was a quiet ritual. I feel an overwhelming sense of relief that the choice is made, and the key is safe.",
    verified: true,
    story: "Every great autobiography begins with a single, weight-bearing sentence. Today, Arjun turned the key and closed the door on impulsive defaults. The visual proof captured was more than confirmation; it was a physical signature on a solemn contract with his own future self. The evening settled with a clean, novel silence.",
    quote: "The first step is always the quietest, but it echoes the longest.",
    insight: "The choice was made with absolute clarity. The boundary is secure.",
    chapterName: "The Beginning",
    timestamp: Date.parse("2026-06-24T08:00:00"),
  },
  {
    dayNumber: 3,
    date: "2026-06-26",
    morningCompleted: true,
    eveningCompleted: true,
    mood: 3,
    difficulty: 5,
    journalText: "A bit restless today. Kept reaching for old habits, then realized they are unavailable. The restriction is physical, but the adjustment is entirely mental. It forces me to sit with my thoughts.",
    verified: true,
    story: "Restlessness is not a failure of discipline; it is the friction of old defaults trying to spin in empty air. Today, you faced that friction head-on. The realization that restriction can be an invitation to calm focus is beginning to take root. A page of clean, stubborn progress.",
    quote: "Restriction is not confinement; it is the container in which clarity is distilled.",
    insight: "You allowed the restlessness to pass without breaking. A major victory.",
    chapterName: "The Beginning",
    timestamp: Date.parse("2026-06-26T08:00:00"),
  },
  {
    dayNumber: 5,
    date: "2026-06-28",
    morningCompleted: true,
    eveningCompleted: true,
    mood: 5,
    difficulty: 2,
    journalText: "Had a highly productive day. Amazing focus at work. This mental space is incredible when you stop wasting energy on micro-negotiations.",
    verified: true,
    story: "The energy of micro-negotiations is slowly returning to its rightful owner. No longer spending willpower debating split-second choices, Arjun directed that raw power into his work. The result was a light, highly creative atmosphere. The lock has truly become a tool of focus rather than restraint.",
    quote: "True freedom begins where micro-negotiations end.",
    insight: "Focus levels are reaching peak stability as the routine solidifies.",
    chapterName: "The Beginning",
    timestamp: Date.parse("2026-06-28T08:00:00"),
  },
  {
    dayNumber: 8,
    date: "2026-07-01",
    morningCompleted: true,
    eveningCompleted: true,
    mood: 4,
    difficulty: 4,
    journalText: "Week one complete. It feels like a lifetime and a second at the same time. Looking at the photo gallery, I see a pattern of promises kept. Unlocking isn't even a thought right now.",
    verified: true,
    story: "Entering a new phase. Seven consecutive check-ins have created a visual trail of integrity. Arjun is no longer fighting a daily battle; he is observing a new lifestyle. The first bookmark is placed in the memoir. The foundation is settled.",
    quote: "The fortnight begins with the confidence of a week well spent.",
    insight: "First major milestone reached. You have proven you can hold the line.",
    chapterName: "Finding Stability",
    timestamp: Date.parse("2026-07-01T08:00:00"),
  },
  {
    dayNumber: 10,
    date: "2026-07-03",
    morningCompleted: true,
    eveningCompleted: true,
    mood: 2,
    difficulty: 8,
    journalText: "Experienced incredibly strong urges in the evening. I sat in silence and went through the 4-7-8 breathing support tool. It was intensely physical but it passed. I feel exhausted but immensely proud that I held firm.",
    verified: true,
    story: "The storm arrived precisely at sunset, challenging the newly built walls. Today was not about passive ease; it was a live combat of willpower. Arjun selected the Breathing Ritual, anchoring himself to the rhythm of his own lungs until the impulse dissolved. He remains locked, holding the keys of self-mastery tighter than before.",
    quote: "You do not need to fight the wave; you only need to be the rock it breaks against.",
    insight: "You survived an 8/10 surge in Support Mode. This is where real armor is forged.",
    chapterName: "Finding Stability",
    timestamp: Date.parse("2026-07-03T08:00:00"),
  },
  {
    dayNumber: 12,
    date: "2026-07-05",
    morningCompleted: true,
    eveningCompleted: true,
    mood: 5,
    difficulty: 3,
    journalText: "Woke up with an immense feeling of stability. The urge from Day 10 made me stronger. I realize now that urges are just energy waiting to be redirected. Had a wonderful run.",
    verified: true,
    story: "There is a silent alchemy in discipline: yesterday's obstacle is today's runway. Waking up with a profound sense of light and clarity, Arjun converted the residual intensity of past challenges into physical movement. A quiet, golden day where being locked felt like the only natural default.",
    quote: "Stability is not the absence of the storm, but the peace of knowing you can weather it.",
    insight: "Urge-recovery loop completed. You redirected the energy beautifully.",
    chapterName: "Finding Stability",
    timestamp: Date.parse("2026-07-05T08:00:00"),
  },
  {
    dayNumber: 13,
    date: "2026-07-06",
    morningCompleted: true,
    eveningCompleted: true,
    mood: 4,
    difficulty: 2,
    journalText: "Another strong day. Completed my morning checklist early. The locked state is becoming my natural baseline. It is very comforting.",
    verified: true,
    story: "The transition is quietly occurring: restriction has ceased to be an active thought and has become an invisible, comforting frame. Arjuna spent the day fully present, without the background hum of divided attention. Each check-in has become a simple salute to consistency.",
    quote: "When discipline becomes ordinary, greatness becomes inevitable.",
    insight: "The lock is now home. Remaining locked is your default default state.",
    chapterName: "Finding Stability",
    timestamp: Date.parse("2026-07-06T08:00:00"),
  }
];

const DEFAULT_PROFILE: UserProfile = {
  name: "Arjun",
  commitment: "remain locked to master self-control, purge impulsive defaults, and build absolute mental clarity and focus",
  favoriteQuote: "Discipline is the slow, deliberate work of choosing what we want most over what we want now.",
  startDate: "2026-06-24T08:00:00Z",
  currentStreak: 14,
  integrityPercent: 96,
  complianceScore: 92,
  selfControlIndex: 87,
  longestSession: 18,
  proofUploadsCount: 42,
  disciplinePhase: "Momentum",
  xp: 425,
  xpTarget: 800,
  targetGoalDays: 30,
};

const DEFAULT_ONBOARDING: OnboardingState = {
  step: 0,
  name: "",
  commitment: "",
  morningReminder: "08:00",
  eveningReminder: "21:00",
  enableMorning: true,
  enableEvening: true,
  enableUrgeSupport: true,
  completed: false,
  targetGoalDays: 30,
};

export const getLocalStorage = {
  getUserProfile: (): UserProfile => {
    const data = localStorage.getItem(KEYS.USER_PROFILE);
    if (!data) {
      localStorage.setItem(KEYS.USER_PROFILE, JSON.stringify(DEFAULT_PROFILE));
      return DEFAULT_PROFILE;
    }
    return JSON.parse(data);
  },

  saveUserProfile: (profile: UserProfile) => {
    localStorage.setItem(KEYS.USER_PROFILE, JSON.stringify(profile));
  },

  getDailyEntries: (): DailyEntry[] => {
    const data = localStorage.getItem(KEYS.DAILY_ENTRIES);
    if (!data) {
      localStorage.setItem(KEYS.DAILY_ENTRIES, JSON.stringify(SEED_ENTRIES));
      return SEED_ENTRIES;
    }
    return JSON.parse(data);
  },

  saveDailyEntries: (entries: DailyEntry[]) => {
    localStorage.setItem(KEYS.DAILY_ENTRIES, JSON.stringify(entries));
  },

  getUrges: (): UrgeEvent[] => {
    const data = localStorage.getItem(KEYS.URGES);
    if (!data) {
      // Return a couple of seeded urges to make the Urge Graph beautifully populated
      const seededUrges: UrgeEvent[] = [
        { id: "u1", timestamp: "2026-06-26T19:30:00Z", intensity: 5, trigger: "Boredom", journal: "Bored at home alone, felt a pull.", resolved: true, durationMinutes: 10 },
        { id: "u2", timestamp: "2026-06-29T21:45:00Z", intensity: 6, trigger: "Late Night Browsing", journal: "Late night fatigue made me weak.", resolved: true, durationMinutes: 15 },
        { id: "u3", timestamp: "2026-07-03T20:15:00Z", intensity: 8, trigger: "Evening Routine", journal: "Surfaced after intense day, overcame via breathing.", resolved: true, durationMinutes: 12 },
        { id: "u4", timestamp: "2026-07-05T18:00:00Z", intensity: 4, trigger: "Stress", journal: "Stress from work, held line.", resolved: true, durationMinutes: 5 },
      ];
      localStorage.setItem(KEYS.URGES, JSON.stringify(seededUrges));
      return seededUrges;
    }
    return JSON.parse(data);
  },

  saveUrges: (urges: UrgeEvent[]) => {
    localStorage.setItem(KEYS.URGES, JSON.stringify(urges));
  },

  getMilestones: (): Milestone[] => {
    const data = localStorage.getItem(KEYS.MILESTONES);
    if (!data) {
      localStorage.setItem(KEYS.MILESTONES, JSON.stringify(DEFAULT_MILESTONES));
      return DEFAULT_MILESTONES;
    }
    return JSON.parse(data);
  },

  saveMilestones: (milestones: Milestone[]) => {
    localStorage.setItem(KEYS.MILESTONES, JSON.stringify(milestones));
  },

  getChatMessages: (): ChatMessage[] => {
    const data = localStorage.getItem(KEYS.CHAT_MESSAGES);
    if (!data) {
      const seededMessages: ChatMessage[] = [
        {
          id: "m1",
          role: "assistant",
          content: "Welcome to your personal sanctuary, Arjun. I am here to witness, remember, and chronicle your path to absolute self-command. Speak to me whenever you require quiet clarity or wish to review your progress.",
          timestamp: "2026-06-24T08:05:00Z",
        },
      ];
      localStorage.setItem(KEYS.CHAT_MESSAGES, JSON.stringify(seededMessages));
      return seededMessages;
    }
    return JSON.parse(data);
  },

  saveChatMessages: (messages: ChatMessage[]) => {
    localStorage.setItem(KEYS.CHAT_MESSAGES, JSON.stringify(messages));
  },

  getOnboardingState: (): OnboardingState => {
    const data = localStorage.getItem(KEYS.ONBOARDING);
    if (!data) {
      localStorage.setItem(KEYS.ONBOARDING, JSON.stringify(DEFAULT_ONBOARDING));
      return DEFAULT_ONBOARDING;
    }
    return JSON.parse(data);
  },

  saveOnboardingState: (state: OnboardingState) => {
    localStorage.setItem(KEYS.ONBOARDING, JSON.stringify(state));
  },

  resetAll: () => {
    localStorage.clear();
  }
};
