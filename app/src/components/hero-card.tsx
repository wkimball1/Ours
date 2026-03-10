"use client";

import { useTheme } from "./theme-provider";

const heroGradients: Record<string, string> = {
  stone: "linear-gradient(135deg, #0c0a09 0%, #1c1917 50%, #292524 100%)",
  rose: "linear-gradient(135deg, #4c0519 0%, #881337 50%, #be123c 100%)",
  lavender: "linear-gradient(135deg, #1e0a4a 0%, #3b0764 50%, #5b21b6 100%)",
  ocean: "linear-gradient(135deg, #082f49 0%, #0c4a6e 50%, #075985 100%)",
  sunset: "linear-gradient(135deg, #431407 0%, #7c2d12 50%, #9a3412 100%)",
  forest: "linear-gradient(135deg, #052e16 0%, #14532d 50%, #166534 100%)",
  berry: "linear-gradient(135deg, #2e0533 0%, #4a044e 50%, #86198f 100%)",
  midnight: "linear-gradient(135deg, #172554 0%, #1e3a5f 50%, #1e40af 100%)",
};

export function HeroCard({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme();
  const gradient = heroGradients[theme] || heroGradients.stone;

  return (
    <div
      className="rounded-3xl p-6 text-white md:col-span-2 sm:p-7"
      style={{
        background: gradient,
        boxShadow: "0 8px 32px rgba(0,0,0,0.25)",
        border: "1px solid rgba(255,255,255,0.1)",
      }}
    >
      {children}
    </div>
  );
}
