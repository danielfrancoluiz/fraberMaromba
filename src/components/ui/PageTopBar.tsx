"use client";

import { ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";

interface PageTopBarProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  action?: ReactNode;
}

export function PageTopBar({ title, subtitle, onBack, action }: PageTopBarProps) {
  return (
    <header className="page-topbar">
      {onBack ? (
        <button
          type="button"
          className="page-topbar-back"
          onClick={onBack}
          aria-label="Voltar"
        >
          <ArrowLeft size={20} />
        </button>
      ) : (
        <span className="page-topbar-spacer" />
      )}
      <div className="page-topbar-center">
        <h1 className="page-topbar-title">{title}</h1>
        {subtitle ? <p className="page-topbar-subtitle">{subtitle}</p> : null}
      </div>
      <div className="page-topbar-action">{action ?? <span className="page-topbar-spacer" />}</div>
    </header>
  );
}
