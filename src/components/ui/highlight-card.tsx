"use client";

import { FC, ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface HighlightCardProps {
  title: string;
  description: string | string[];
  icon?: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}

const HighlightCard: FC<HighlightCardProps> = ({ title, description, icon, onClick, disabled, className }) => {
  const descriptionArray = Array.isArray(description) ? description : [description];
  
  return (
    <Card
      onClick={disabled ? undefined : onClick}
      className={cn(
        "group relative overflow-hidden border-0 bg-transparent",
        !disabled && onClick && "cursor-pointer",
        disabled && "opacity-60",
        className
      )}
    >
      {/* Background layers */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#1a2235] via-[#161e2a] to-[#0f1729]" />
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="absolute inset-[1px] rounded-2xl bg-gradient-to-br from-[#1a2235] via-[#161e2a] to-[#0f1729]" />
      
      {/* Animated border gradient */}
      <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary/50 via-blue-500/50 to-primary/50 blur-sm" />
        <div className="absolute inset-[1px] rounded-2xl bg-gradient-to-br from-[#1a2235] via-[#161e2a] to-[#0f1729]" />
      </div>

      {/* Corner decorations */}
      <div className="absolute top-3 left-3 flex gap-1.5 z-10">
        <div className="w-2 h-2 rounded-full bg-red-500/60" />
        <div className="w-2 h-2 rounded-full bg-yellow-500/60" />
        <div className="w-2 h-2 rounded-full bg-green-500/60" />
      </div>

      {/* Content */}
      <div className="relative p-6 pt-10 min-h-[200px] flex flex-col">
        {/* Icon with glow effect */}
        <div className="mb-4">
          <div className="relative inline-flex">
            <div className="absolute inset-0 bg-primary/20 rounded-xl blur-xl group-hover:bg-primary/30 transition-colors duration-300" />
            <div className="relative flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 group-hover:border-primary/40 transition-colors duration-300">
              {icon}
            </div>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-primary transition-colors duration-300">
          {title}
        </h3>

        {/* Description */}
        <div className="flex-1 space-y-1">
          {descriptionArray.map((line, idx) => (
            <p key={idx} className="text-sm text-muted-foreground leading-relaxed">
              {line}
            </p>
          ))}
        </div>

        {/* Decorative lines */}
        <div className="absolute bottom-4 right-4 flex gap-1">
          <div className="w-8 h-0.5 rounded-full bg-primary/20 group-hover:bg-primary/40 transition-colors duration-300" />
          <div className="w-4 h-0.5 rounded-full bg-primary/10 group-hover:bg-primary/30 transition-colors duration-300" />
          <div className="w-2 h-0.5 rounded-full bg-primary/5 group-hover:bg-primary/20 transition-colors duration-300" />
        </div>
      </div>

      {/* Shine effect on hover */}
      <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -skew-x-12 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
      </div>
    </Card>
  );
};

export { HighlightCard };
export type { HighlightCardProps };
