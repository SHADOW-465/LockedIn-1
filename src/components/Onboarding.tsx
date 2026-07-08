import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Lock, Shield, Sparkles, Bell, Camera, ArrowRight, BookOpen, Key, Check } from "lucide-react";
import { OnboardingState } from "../types";

interface OnboardingProps {
  onComplete: (state: OnboardingState) => void;
}

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [commitment, setCommitment] = useState("");
  const [signature, setSignature] = useState("");
  const [targetGoalDays, setTargetGoalDays] = useState(30);
  const [enableMorning, setEnableMorning] = useState(true);
  const [enableEvening, setEnableEvening] = useState(true);
  const [enableUrgeSupport, setEnableUrgeSupport] = useState(true);

  const handleNext = () => {
    if (step < 5) {
      setStep(step + 1);
    } else {
      const finalState: OnboardingState = {
        step: 5,
        name: name || "Arjun",
        commitment: commitment || "remain locked to master self-control, purge impulsive defaults, and build absolute mental clarity and focus",
        morningReminder: "08:00",
        eveningReminder: "21:00",
        enableMorning,
        enableEvening,
        enableUrgeSupport,
        completed: true,
        targetGoalDays,
      };
      onComplete(finalState);
    }
  };

  const stepVariants = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0, transition: { duration: 0.4 } },
    exit: { opacity: 0, x: -20, transition: { duration: 0.3 } },
  };

  return (
    <div className="min-h-screen bg-black text-[#f1f1f1] flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Premium Ambient Background Glows */}
      <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-[#ccff00]/5 blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-[#ccff00]/5 blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md bg-zinc-950 border border-zinc-900 rounded-[32px] p-8 shadow-2xl relative">
        {/* Step Progress Dots */}
        <div className="flex justify-center gap-2 mb-8">
          {[1, 2, 3, 4, 5].map((s) => (
            <div
              key={s}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                s === step ? "w-8 bg-[#ccff00]" : "w-1.5 bg-zinc-800"
              }`}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              variants={stepVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="flex flex-col items-center text-center"
            >
              <div className="w-20 h-20 bg-[#ccff00]/10 border border-[#ccff00]/20 rounded-full flex items-center justify-center mb-6">
                <Lock className="w-10 h-10 text-[#ccff00] animate-pulse" />
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight text-white mb-3">
                LOCKEDIN-X
              </h1>
              <p className="text-xs tracking-widest text-[#ccff00] uppercase font-mono mb-4">
                DISCIPLINE. IDENTITY. FREEDOM.
              </p>
              <p className="text-sm text-zinc-400 max-w-sm mb-8 leading-relaxed">
                A personal growth companion that helps you stay committed, track your journey, and build a life you're proud of.
              </p>
              <div className="w-full">
                <label className="block text-left text-xs text-zinc-500 uppercase font-mono mb-2">
                  What is your name?
                </label>
                <input
                  type="text"
                  placeholder="Arjun"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-zinc-900/50 border border-zinc-850 rounded-2xl py-3 px-4 text-white text-base focus:outline-none focus:border-[#ccff00] transition"
                />
              </div>
              <button
                onClick={handleNext}
                className="w-full bg-[#ccff00] text-black font-bold py-4 rounded-2xl mt-8 flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98] transition cursor-pointer"
              >
                Begin Journey <ArrowRight className="w-5 h-5" />
              </button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              variants={stepVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="flex flex-col"
            >
              <h2 className="text-2xl font-bold text-white mb-2">
                Your Commitment
              </h2>
              <p className="text-sm text-zinc-400 mb-5 leading-relaxed">
                Why are you beginning this journey? Declare your intention from your heart. This forms the anchor of your Support Mode.
              </p>
              <div className="bg-zinc-900/40 border border-zinc-850 rounded-2xl p-4 mb-4">
                <label className="block text-xs text-[#ccff00] uppercase font-mono mb-2">
                  Declaration of Intent
                </label>
                <textarea
                  value={commitment}
                  onChange={(e) => setCommitment(e.target.value)}
                  placeholder="I choose to remain locked because I want to become a man of self-control, build unshakeable discipline, and create the life I know I'm capable of."
                  rows={3}
                  className="w-full bg-transparent text-sm text-zinc-300 focus:outline-none resize-none leading-relaxed"
                />
              </div>

              {/* Target Days selection */}
              <div className="mb-4">
                <label className="block text-xs text-zinc-500 uppercase font-mono mb-2">
                  Target Lock Duration
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {[7, 14, 30, 90, 365].map((days) => (
                    <button
                      key={days}
                      type="button"
                      onClick={() => setTargetGoalDays(days)}
                      className={`py-2 px-1 rounded-xl text-xs font-mono font-bold border transition-all cursor-pointer flex flex-col items-center justify-center ${
                        targetGoalDays === days
                          ? "bg-[#ccff00] text-black border-[#ccff00] shadow-lg shadow-[#ccff00]/10"
                          : "bg-zinc-900/50 text-zinc-400 border-zinc-850 hover:border-zinc-700"
                      }`}
                    >
                      <span>{days}</span>
                      <span className="text-[9px] uppercase tracking-tighter opacity-80 font-sans font-medium">Days</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-xs text-zinc-500 uppercase font-mono mb-2">
                  Sign to seal commitment
                </label>
                <input
                  type="text"
                  placeholder="Type signature (e.g. Arjun)"
                  value={signature}
                  onChange={(e) => setSignature(e.target.value)}
                  className="w-full bg-zinc-900/50 border border-zinc-850 rounded-2xl py-3 px-4 text-white text-base font-serif italic focus:outline-none focus:border-[#ccff00] transition"
                />
              </div>
              <button
                onClick={handleNext}
                disabled={!signature}
                className="w-full bg-[#ccff00] text-black font-bold py-4 rounded-2xl flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98] disabled:opacity-50 transition cursor-pointer"
              >
                Continue <ArrowRight className="w-5 h-5" />
              </button>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              variants={stepVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="flex flex-col"
            >
              <h2 className="text-2xl font-bold text-white mb-2">
                Reminders & Check-Ins
              </h2>
              <p className="text-sm text-zinc-400 mb-6 leading-relaxed">
                Consistency requires structure. Set up your quiet reminder rituals.
              </p>

              <div className="space-y-4 mb-8">
                <div className="flex items-center justify-between p-4 bg-zinc-900/30 border border-zinc-900 rounded-2xl">
                  <div className="flex items-center gap-3">
                    <Bell className="w-5 h-5 text-[#ccff00]" />
                    <div>
                      <p className="text-sm font-semibold text-white">Morning Reminder</p>
                      <p className="text-xs text-zinc-500">8:00 AM - Intention & verification</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={enableMorning}
                    onChange={(e) => setEnableMorning(e.target.checked)}
                    className="w-5 h-5 accent-[#ccff00]"
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-zinc-900/30 border border-zinc-900 rounded-2xl">
                  <div className="flex items-center gap-3">
                    <Bell className="w-5 h-5 text-amber-500" />
                    <div>
                      <p className="text-sm font-semibold text-white">Evening Reflection</p>
                      <p className="text-xs text-zinc-500">9:00 PM - Journal & close day</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={enableEvening}
                    onChange={(e) => setEnableEvening(e.target.checked)}
                    className="w-5 h-5 accent-[#ccff00]"
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-zinc-900/30 border border-zinc-900 rounded-2xl">
                  <div className="flex items-center gap-3">
                    <Shield className="w-5 h-5 text-emerald-500" />
                    <div>
                      <p className="text-sm font-semibold text-white">Urge Support</p>
                      <p className="text-xs text-zinc-500">Enable floating help system</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={enableUrgeSupport}
                    onChange={(e) => setEnableUrgeSupport(e.target.checked)}
                    className="w-5 h-5 accent-[#ccff00]"
                  />
                </div>
              </div>

              <button
                onClick={handleNext}
                className="w-full bg-[#ccff00] text-black font-bold py-4 rounded-2xl flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98] transition cursor-pointer"
              >
                Continue <ArrowRight className="w-5 h-5" />
              </button>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div
              key="step4"
              variants={stepVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="flex flex-col"
            >
              <h2 className="text-2xl font-bold text-white mb-2">
                Enable Permissions
              </h2>
              <p className="text-sm text-zinc-400 mb-6 leading-relaxed">
                LOCKEDIN-X is entirely local and privacy-focused. We only use these permissions locally to support your journey.
              </p>

              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-4 p-4 bg-zinc-900/20 border border-zinc-900 rounded-2xl">
                  <div className="p-2 bg-zinc-900 rounded-xl text-[#ccff00]">
                    <Camera className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white">Camera Access</h3>
                    <p className="text-xs text-zinc-500 mt-0.5">Required for physical proof verification pictures.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-zinc-900/20 border border-zinc-900 rounded-2xl">
                  <div className="p-2 bg-zinc-900 rounded-xl text-emerald-500">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white">Local Storage</h3>
                    <p className="text-xs text-zinc-500 mt-0.5">Save your photos, daily stories, and memoir pages completely offline.</p>
                  </div>
                </div>
              </div>

              <button
                onClick={handleNext}
                className="w-full bg-[#ccff00] text-black font-bold py-4 rounded-2xl flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98] transition cursor-pointer"
              >
                Enable & Continue <ArrowRight className="w-5 h-5" />
              </button>
            </motion.div>
          )}

          {step === 5 && (
            <motion.div
              key="step5"
              variants={stepVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="flex flex-col items-center text-center"
            >
              <div className="w-20 h-20 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center mb-6">
                <Check className="w-10 h-10 text-emerald-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">
                All set, let's begin.
              </h2>
              <p className="text-sm text-zinc-400 max-w-sm mb-8 leading-relaxed">
                Your commitment has been recorded. Your Living Memoir and personal discipline journey starts right now. Welcome home, {name}.
              </p>

              <button
                onClick={handleNext}
                className="w-full bg-[#ccff00] text-black font-bold py-4 rounded-2xl flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98] transition cursor-pointer"
              >
                Enter LOCKEDIN-X <ArrowRight className="w-5 h-5" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
