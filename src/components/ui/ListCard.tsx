"use client";

import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { ChevronRight } from "lucide-react";

interface ListCardProps {
  title: string;
  meta?: ReactNode;
  badge?: ReactNode;
  icon?: LucideIcon;
  onClick?: () => void;
  href?: string;
  trailing?: ReactNode;
  accent?: "primary" | "accent" | "success";
  children?: ReactNode;
  className?: string;
}

export function ListCard({
  title,
  meta,
  badge,
  icon: Icon,
  onClick,
  trailing,
  accent = "primary",
  children,
  className = "",
}: ListCardProps) {
  const showChevron = onClick && !trailing;

  const content = (
    <>
      <div className={`list-card-accent list-card-accent--${accent}`} aria-hidden />
      <div className="list-card-body">
        {Icon ? (
          <div className="list-card-icon-wrap">
            <Icon size={18} className="list-card-icon" />
          </div>
        ) : null}
        <div className="list-card-content">
          <div className="list-card-top">
            <h3 className="list-card-title">{title}</h3>
            {badge ? <div className="list-card-badge">{badge}</div> : null}
          </div>
          {meta ? <div className="list-card-meta">{meta}</div> : null}
          {children}
        </div>
        {trailing ?? (showChevron ? <ChevronRight size={18} className="list-card-chevron" /> : null)}
      </div>
    </>
  );

  if (onClick) {
    return (
      <button
        type="button"
        className={`list-card ${className}`.trim()}
        onClick={onClick}
      >
        {content}
      </button>
    );
  }

  return <article className={`list-card list-card--static ${className}`.trim()}>{content}</article>;
}
