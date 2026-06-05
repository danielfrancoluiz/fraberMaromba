"use client";

import type { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  className?: string;
}

export function PageHeader({ title, subtitle, action, className = "" }: PageHeaderProps) {
  return (
    <header className={`page-header ${className}`.trim()}>
      <div className="page-header-text">
        <h1 className="page-header-title">{title}</h1>
        {subtitle ? <p className="page-header-subtitle">{subtitle}</p> : null}
      </div>
      {action ? <div className="page-header-action">{action}</div> : null}
    </header>
  );
}
