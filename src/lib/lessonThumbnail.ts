import {
  BookOpen,
  PlayCircle,
  Hammer,
  Megaphone,
  Palette,
  Code2,
  Rocket,
  FlaskConical,
  DollarSign,
  Map,
  PenLine,
  type LucideIcon,
} from "lucide-react";

const STOP_WORDS = new Set([
  "the", "a", "an", "of", "to", "and", "or", "for", "in", "on", "with", "your", "you",
]);

const KEYWORD_MAP: Array<{ keywords: string[]; Icon: LucideIcon }> = [
  { keywords: ["video", "watch", "intro", "introduction", "welcome"], Icon: PlayCircle },
  { keywords: ["build", "create", "make", "construct"], Icon: Hammer },
  { keywords: ["market", "audience", "customer", "growth", "acquisition"], Icon: Megaphone },
  { keywords: ["design", "ui", "ux", "brand", "visual", "style"], Icon: Palette },
  { keywords: ["code", "dev", "api", "tech", "develop", "engineering"], Icon: Code2 },
  { keywords: ["launch", "ship", "release", "deploy"], Icon: Rocket },
  { keywords: ["validate", "validation", "test", "research", "experiment"], Icon: FlaskConical },
  { keywords: ["money", "price", "pricing", "revenue", "model", "monetize", "monetization"], Icon: DollarSign },
  { keywords: ["plan", "strategy", "roadmap", "blueprint"], Icon: Map },
  { keywords: ["write", "copy", "content", "story", "messaging"], Icon: PenLine },
];

// djb2 hash → deterministic non-negative integer
function hash(str: string): number {
  let h = 5381;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) + h) + str.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

function getInitials(title: string): string {
  const words = title
    .split(/\s+/)
    .map((w) => w.replace(/[^a-zA-Z0-9]/g, ""))
    .filter((w) => w.length > 0 && !STOP_WORDS.has(w.toLowerCase()));
  if (words.length === 0) return title.slice(0, 2).toUpperCase() || "?";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

function getIcon(title: string): LucideIcon {
  const lower = title.toLowerCase();
  for (const { keywords, Icon } of KEYWORD_MAP) {
    if (keywords.some((kw) => lower.includes(kw))) return Icon;
  }
  return BookOpen;
}

export function getLessonThumbnail(title: string) {
  const safeTitle = title?.trim() || "Lesson";
  const h = hash(safeTitle) % 360;
  const h2 = (h + 45) % 360;
  const gradient = `linear-gradient(135deg, hsl(${h}, 55%, 28%), hsl(${h2}, 55%, 18%))`;
  return {
    gradient,
    initials: getInitials(safeTitle),
    Icon: getIcon(safeTitle),
  };
}
