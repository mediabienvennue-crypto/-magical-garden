"use client";

interface SubjectTreeProps {
  subjectName: string;
  subjectSlug: string;
  vitality: number; // 1 (ذابلة) إلى 5 (ممتازة)
  xp: number;
  fruitColor: string;
}

const XP_CAP = 500;

const VITALITY_META: Record<number, { color: string; dark: string; label: string }> = {
  5: { color: "#14532D", dark: "#0D3A1F", label: "ممتازة" },
  4: { color: "#2E8B57", dark: "#1F6D42", label: "جيدة" },
  3: { color: "#D9C24E", dark: "#B8A23A", label: "تحتاج مراجعة" },
  2: { color: "#C9A227", dark: "#A8801C", label: "تحتاج اهتماماً" },
  1: { color: "#8B6F47", dark: "#6E5638", label: "ذابلة، راجعها الآن!" },
};

export default function SubjectTree({ subjectName, subjectSlug, vitality, xp, fruitColor }: SubjectTreeProps) {
  const progress = Math.min(100, Math.round((xp / XP_CAP) * 100));
  const v = VITALITY_META[Math.max(1, Math.min(5, vitality))] ?? VITALITY_META[3];
  const showFruit = vitality >= 4;

  return (
    <div className="flex flex-col items-center bg-white rounded-3xl p-3 sm:p-4 border border-[var(--forest-100)] shadow-sm">
      <svg viewBox="0 0 140 150" className="w-20 h-20 sm:w-24 sm:h-24 animate-leaf-sway" aria-hidden="true">
        <ellipse cx="70" cy="140" rx="34" ry="6" fill="#000" opacity="0.06" />
        {renderSpecies(subjectSlug, v.color, v.dark, fruitColor, showFruit)}
      </svg>

      <h3 className="font-display text-sm font-bold text-[var(--ink)] mt-2 text-center leading-tight">
        {subjectName}
      </h3>
      <span className="text-[9px] font-bold mt-0.5" style={{ color: v.color }}>
        {v.label}
      </span>

      <div className="w-full h-2 bg-slate-100 rounded-full mt-2 overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${progress}%`, backgroundColor: v.color }}
        />
      </div>
      <span className="text-[10px] text-slate-400 mt-1 font-bold">XP {xp}</span>
    </div>
  );
}

function renderSpecies(
  slug: string,
  color: string,
  dark: string,
  fruitColor: string,
  showFruit: boolean
) {
  switch (slug) {
    case "arabic":
      return <PalmTree color={color} dark={dark} fruitColor={fruitColor} showFruit={showFruit} />;
    case "science":
      return <AppleTree color={color} dark={dark} fruitColor={fruitColor} showFruit={showFruit} />;
    case "french":
      return <CherryTree color={color} dark={dark} fruitColor={fruitColor} showFruit={showFruit} />;
    case "islamic-education":
      return <OliveTree color={color} dark={dark} fruitColor={fruitColor} showFruit={showFruit} />;
    case "math":
    default:
      return <OakTree color={color} dark={dark} fruitColor={fruitColor} showFruit={showFruit} />;
  }
}

interface SpeciesProps {
  color: string;
  dark: string;
  fruitColor: string;
  showFruit: boolean;
}

// ---------------------------------------------------------------------------
// بلوط — الرياضيات: قمة كثيفة كروية كلاسيكية
// ---------------------------------------------------------------------------
function OakTree({ color, dark, fruitColor, showFruit }: SpeciesProps) {
  return (
    <>
      <path d="M64 148 C62 120 60 100 66 78 C68 70 72 70 74 78 C80 100 78 120 76 148 Z" fill="#8B5E3C" />
      <path d="M64 146 C56 148 50 150 44 152" stroke="#8B5E3C" strokeWidth="4" strokeLinecap="round" fill="none" />
      <path d="M76 146 C84 148 90 150 96 152" stroke="#8B5E3C" strokeWidth="4" strokeLinecap="round" fill="none" />
      <g>
        <circle cx="70" cy="55" r="34" fill={color} />
        <circle cx="42" cy="65" r="22" fill={color} />
        <circle cx="98" cy="65" r="22" fill={color} />
        <circle cx="50" cy="35" r="20" fill={color} />
        <circle cx="90" cy="35" r="20" fill={color} />
        <circle cx="70" cy="25" r="22" fill={color} />
        <circle cx="55" cy="72" r="14" fill={dark} opacity="0.35" />
        <circle cx="90" cy="70" r="12" fill={dark} opacity="0.3" />
      </g>
      {showFruit && (
        <>
          <circle cx="50" cy="50" r="5" fill={fruitColor} />
          <circle cx="88" cy="45" r="5" fill={fruitColor} />
          <circle cx="70" cy="65" r="5" fill={fruitColor} />
        </>
      )}
    </>
  );
}

// ---------------------------------------------------------------------------
// نخلة — العربية: جذع نحيل طويل + سعف مشع من الأعلى
// ---------------------------------------------------------------------------
function PalmTree({ color, dark, fruitColor, showFruit }: SpeciesProps) {
  return (
    <>
      <path d="M67 148 C65 110 66 75 70 45 C71 40 73 40 74 45 C76 75 77 110 75 148 Z" fill="#8B5E3C" />
      <g stroke={color} strokeWidth="9" strokeLinecap="round" fill="none">
        <path d="M71 45 C50 35 30 38 18 55" />
        <path d="M71 45 C55 25 40 15 25 12" />
        <path d="M72 45 C68 20 65 8 60 0" />
        <path d="M73 45 C82 22 92 10 100 3" />
        <path d="M74 45 C92 30 108 28 122 40" />
        <path d="M72 46 C78 30 85 22 92 18" />
      </g>
      <g stroke={dark} strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.5">
        <path d="M71 45 C55 38 40 40 28 52" />
        <path d="M72 45 C66 24 62 14 58 4" />
      </g>
      {showFruit && (
        <>
          <circle cx="66" cy="48" r="4" fill={fruitColor} />
          <circle cx="76" cy="50" r="4" fill={fruitColor} />
          <circle cx="71" cy="53" r="4" fill={fruitColor} />
        </>
      )}
    </>
  );
}

// ---------------------------------------------------------------------------
// تفاح — النشاط العلمي: قمة مدورة واحدة مدمجة وثمار بارزة
// ---------------------------------------------------------------------------
function AppleTree({ color, dark, fruitColor, showFruit }: SpeciesProps) {
  return (
    <>
      <path d="M65 148 C63 122 62 105 67 85 C69 78 71 78 73 85 C78 105 77 122 75 148 Z" fill="#8B5E3C" />
      <circle cx="70" cy="60" r="38" fill={color} />
      <circle cx="70" cy="60" r="38" fill={dark} opacity="0.15" />
      <circle cx="55" cy="45" r="8" fill="#fff" opacity="0.15" />
      {showFruit && (
        <>
          <circle cx="48" cy="55" r="6" fill={fruitColor} />
          <circle cx="92" cy="50" r="6" fill={fruitColor} />
          <circle cx="70" cy="35" r="6" fill={fruitColor} />
          <circle cx="60" cy="78" r="6" fill={fruitColor} />
          <circle cx="88" cy="75" r="6" fill={fruitColor} />
        </>
      )}
    </>
  );
}

// ---------------------------------------------------------------------------
// كرز — الفرنسية: قمة رشيقة وثمار مزدوجة معلّقة
// ---------------------------------------------------------------------------
function CherryTree({ color, dark, fruitColor, showFruit }: SpeciesProps) {
  return (
    <>
      <path d="M66 148 C64 118 63 98 68 76 C69.5 70 70.5 70 72 76 C77 98 76 118 74 148 Z" fill="#8B5E3C" />
      <circle cx="55" cy="55" r="24" fill={color} />
      <circle cx="85" cy="55" r="24" fill={color} />
      <circle cx="70" cy="38" r="24" fill={color} />
      <circle cx="70" cy="60" r="18" fill={dark} opacity="0.25" />
      {showFruit && (
        <>
          <g>
            <path d="M50 68 L48 78 M50 68 L54 76" stroke="#6E4A2E" strokeWidth="1.5" fill="none" />
            <circle cx="48" cy="80" r="4" fill={fruitColor} />
            <circle cx="54" cy="78" r="4" fill={fruitColor} />
          </g>
          <g>
            <path d="M90 65 L88 75 M90 65 L94 73" stroke="#6E4A2E" strokeWidth="1.5" fill="none" />
            <circle cx="88" cy="77" r="4" fill={fruitColor} />
            <circle cx="94" cy="75" r="4" fill={fruitColor} />
          </g>
        </>
      )}
    </>
  );
}

// ---------------------------------------------------------------------------
// زيتون — التربية الإسلامية: جذع معقد وقمة فضية-خضراء ممتدة
// ---------------------------------------------------------------------------
function OliveTree({ color, dark, fruitColor, showFruit }: SpeciesProps) {
  return (
    <>
      <path
        d="M62 148 C58 130 66 118 60 100 C56 88 66 82 70 70 C74 82 84 88 80 100 C74 118 82 130 78 148 Z"
        fill="#9C7A52"
      />
      <ellipse cx="45" cy="55" rx="26" ry="16" fill={color} />
      <ellipse cx="95" cy="55" rx="26" ry="16" fill={color} />
      <ellipse cx="70" cy="40" rx="28" ry="17" fill={color} />
      <ellipse cx="70" cy="55" rx="20" ry="12" fill={dark} opacity="0.25" />
      {showFruit && (
        <>
          <circle cx="55" cy="50" r="3.5" fill={fruitColor} />
          <circle cx="82" cy="48" r="3.5" fill={fruitColor} />
          <circle cx="68" cy="35" r="3.5" fill={fruitColor} />
          <circle cx="95" cy="58" r="3.5" fill={fruitColor} />
        </>
      )}
    </>
  );
}
