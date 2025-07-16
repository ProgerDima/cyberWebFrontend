
import React from "react";
import { cn } from "@/lib/utils";

interface BlurCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  glowEffect?: "none" | "sm" | "md" | "lg";
}

const BlurCard = ({ 
  children, 
  className, 
  glowEffect = "none", 
  ...props 
}: BlurCardProps) => {
  return (
    <div
      className={cn(
        "glass-card rounded-xl p-6 transition-all duration-300 ease-in-out",
        glowEffect === "sm" && "glow-sm",
        glowEffect === "md" && "glow-md",
        glowEffect === "lg" && "glow-lg",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export default BlurCard;
