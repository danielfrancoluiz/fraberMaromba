"use client";

import type { ReactNode } from "react";

type BadgeVariant = "default" | "primary" | "success" | "warning" | "danger" | "muted";

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

export function Badge({ children, variant = "default", className = "" }: BadgeProps) {
  return (
    <span className={`ui-badge ui-badge--${variant} ${className}`.trim()}>{children}</span>
  );
}
