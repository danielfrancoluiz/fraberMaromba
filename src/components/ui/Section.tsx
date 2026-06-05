"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { ChevronRight } from "lucide-react";

interface SectionProps {
  title: string;
  children: ReactNode;
  href?: string;
  linkLabel?: string;
  className?: string;
}

export function Section({
  title,
  children,
  href,
  linkLabel = "Ver todos",
  className = "",
}: SectionProps) {
  return (
    <section className={`page-section ${className}`.trim()}>
      <div className="section-head">
        <h2 className="section-title">{title}</h2>
        {href ? (
          <Link href={href} className="section-link">
            {linkLabel}
            <ChevronRight size={16} aria-hidden />
          </Link>
        ) : null}
      </div>
      {children}
    </section>
  );
}
