"use client";

import { Logo } from "@/components/Logo";

interface AppTopBarProps {
  title: string;
  subtitle?: string;
  logoSize?: number;
}

export function AppTopBar({ title, subtitle, logoSize = 48 }: AppTopBarProps) {
  return (
    <header className="app-topbar">
      <Logo size={logoSize} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <h1 className="app-topbar-title">{title}</h1>
        {subtitle ? <p className="app-topbar-subtitle">{subtitle}</p> : null}
      </div>
    </header>
  );
}
