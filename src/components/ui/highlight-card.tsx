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
        "group relative overflow-hidden rounded-2xl bg-[#161e2a] border border-slate-700/50",
        !disabled && onClick && "cursor-pointer hover:border-slate-600/70",
        disabled && "opacity-60",
        className
      )}
    >
      {/* Content */}
      <div className="relative p-6 pt-10 min-h-[200px] flex flex-col">
        {/* Icon */}
        <div className="mb-4">
          <div className="relative inline-flex">
            <div className="relative flex items-center justify-center w-14 h-14 rounded-xl bg-primary/10 border border-primary/20 group-hover:border-primary/40 transition-colors duration-300">
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
      </div>
    </Card>
  );
};

export { HighlightCard };
export type { HighlightCardProps };
