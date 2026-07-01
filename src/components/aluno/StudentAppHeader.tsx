"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, User } from "lucide-react";

export function StudentAppHeader() {
  const pathname = usePathname();
  const onProfile = pathname.startsWith("/aluno/perfil");

  return (
    <header className="student-header">
      <div className="student-header-brand">
        <img
          src="/logo.jpeg"
          alt="FRABER 360"
          className="student-header-logo"
        />
        <div>
          <p className="student-header-title">FRABER</p>
          <p className="student-header-subtitle">360°</p>
        </div>
      </div>

      <div className="student-header-actions">
        <button type="button" className="student-header-icon-btn" aria-label="Notificações">
          <Bell size={16} />
          <span className="student-header-dot" />
        </button>
        <Link
          href="/aluno/perfil"
          className={`student-header-avatar ${onProfile ? "student-header-avatar--active" : ""}`}
          aria-label="Perfil"
        >
          <User size={18} />
        </Link>
      </div>
    </header>
  );
}
