import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

export interface BusinessCardProps {
  title: string;
  icon?: LucideIcon;
  iconColor?: string;
  children: React.ReactNode;
  className?: string;
  colSpan?: 1 | 2;
}

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: "easeOut" as const,
    },
  },
};

const BusinessCard = React.forwardRef<HTMLDivElement, BusinessCardProps>(
  ({ title, icon: Icon, iconColor = "text-primary", children, className, colSpan = 1 }, ref) => {
    return (
      <motion.div
        ref={ref}
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
        className={cn(
          "group relative overflow-hidden rounded-2xl",
          "bg-gradient-to-br from-[#1a2235] via-[#161e2a] to-[#0f1729]",
          "border border-white/10 backdrop-blur-sm",
          "shadow-lg shadow-black/20",
          "transition-all duration-300",
          "hover:border-white/20 hover:shadow-xl hover:shadow-primary/5",
          colSpan === 2 && "md:col-span-2",
          className
        )}
      >
        {/* Gradient overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Content */}
        <div className="relative p-5">
          {/* Header */}
          <div className="flex items-center gap-2.5 mb-4">
            {Icon && (
              <div className={cn(
                "flex items-center justify-center w-8 h-8 rounded-lg",
                "bg-white/5 border border-white/10",
                "group-hover:bg-white/10 transition-colors duration-300"
              )}>
                <Icon className={cn("w-4 h-4", iconColor)} />
              </div>
            )}
            <h3 className="text-base font-semibold text-white tracking-tight">
              {title}
            </h3>
          </div>
          
          {/* Body */}
          <div className="text-sm text-muted-foreground leading-relaxed">
            {children}
          </div>
        </div>
      </motion.div>
    );
  }
);

BusinessCard.displayName = "BusinessCard";

export { BusinessCard };
