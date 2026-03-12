"use client";

import { useState } from "react";

const moodLevels = [
  { max: 20,  emoji: "😞", label: "Struggling" },
  { max: 40,  emoji: "😔", label: "Low" },
  { max: 60,  emoji: "😐", label: "Okay" },
  { max: 80,  emoji: "😊", label: "Good" },
  { max: 100, emoji: "😄", label: "Great" },
];

function getMood(value: number) {
  return moodLevels.find((m) => value <= m.max) ?? moodLevels[moodLevels.length - 1];
}

export function MoodSlider() {
  const [value, setValue] = useState(50);
  const mood = getMood(value);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label htmlFor="mood-level" className="text-sm font-semibold text-stone-800 dark:text-stone-100">
          How are you feeling right now?
        </label>
        <span className="text-sm font-medium text-stone-600 dark:text-stone-300">
          {mood.emoji} {mood.label}
        </span>
      </div>

      <input
        id="mood-level"
        name="mood_level"
        type="range"
        min={0}
        max={100}
        value={value}
        onChange={(e) => setValue(Number(e.target.value))}
        className="w-full accent-stone-900 dark:accent-stone-100"
      />

      <div className="flex justify-between text-xs text-stone-400 dark:text-stone-500">
        <span>😞 Struggling</span>
        <span>😐 Okay</span>
        <span>😄 Great</span>
      </div>
    </div>
  );
}
