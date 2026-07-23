"use client";

interface SubjectTreeProps {
  subjectName: string;
  health: "healthy" | "withering" | "withered";
  xp: number;
  fruitColor: string;
}

// أقصى XP لملء الشريط بالكامل — سيُستبدل لاحقاً بمنحنى مستويات حقيقي
const XP_CAP = 500;

export default function SubjectTree({ subjectName, health, xp, fruitColor }: SubjectTreeProps) {
  const progress = Math.min(100, Math.round((xp / XP_CAP) * 100));

  const canopyColor =
    health === "healthy" ? "#2E8B57" : health === "withering" ? "#C9A227" : "#8B6F47";
  const canopyDark =
    health === "healthy" ? "#1F6D42" : health === "withering" ? "#A8801C" : "#6E5638";

  return (
    <div className="flex flex-col items-center bg-white rounded-3xl p-3 sm:p-4 border border-[var(--forest-100)] shadow-sm">
      <svg viewBox="0 0 140 150" className="w-20 h-20 sm:w-24 sm:h-24 animate-leaf-sway" aria-hidden="true">
        <ellipse cx="70" cy="140" rx="34" ry="6" fill="#000" opacity="0.06" />

        <path
          d="M64 148 C62 120 60 100 66 78 C68 70 72 70 74 78 C80 100 78 120 76 148 Z"
          fill="#8B5E3C"
        />
        <path d="M67 148 C66 125 65 105 68 85" stroke="#6E4A2E" strokeWidth="2" fill="none" opacity="0.5" />

        <path d="M64 146 C56 148 50 150 44 152" stroke="#8B5E3C" strokeWidth="4" strokeLinecap="round" fill="none" />
        <path d="M76 146 C84 148 90 150 96 152" stroke="#8B5E3C" strokeWidth="4" strokeLinecap="round" fill="none" />

        <g>
          <circle cx="70" cy="55" r="34" fill={canopyColor} />
          <circle cx="42" cy="65" r="22" fill={canopyColor} />
          <circle cx="98" cy="65" r="22" fill={canopyColor} />
          <circle cx="50" cy="35" r="20" fill={canopyColor} />
          <circle cx="90" cy="35" r="20" fill={canopyColor} />
          <circle cx="70" cy="25" r="22" fill={canopyColor} />

          <circle cx="55" cy="72" r="14" fill={canopyDark} opacity="0.35" />
          <circle cx="90" cy="70" r="12" fill={canopyDark} opacity="0.3" />
          <circle cx="70" cy="40" r="10" fill="#fff" opacity="0.12" />
        </g>

        {health === "healthy" && (
          <>
            <circle cx="50" cy="50" r="5" fill={fruitColor} />
            <circle cx="88" cy="45" r="5" fill={fruitColor} />
            <circle cx="70" cy="65" r="5" fill={fruitColor} />
            <circle cx="95" cy="60" r="4" fill={fruitColor} />
          </>
        )}

        {health !== "healthy" && (
          <path
            d="M100 90 q4 8 -2 14 q-6 -2 -4 -10 q2 -4 6 -4Z"
            fill={canopyColor}
            opacity="0.7"
          />
        )}
      </svg>

      <h3 className="font-display text-sm font-bold text-[var(--ink)] mt-2">{subjectName}</h3>

      <div className="w-full h-2 bg-slate-100 rounded-full mt-2 overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${progress}%`, backgroundColor: canopyColor }}
        />
      </div>
      <span className="text-[10px] text-slate-400 mt-1 font-bold">XP {xp}</span>
    </div>
  );
}