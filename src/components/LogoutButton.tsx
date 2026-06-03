"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

interface LogoutButtonProps {
  className?: string;
}

export function LogoutButton({ className = "" }: LogoutButtonProps) {
  return (
    <button
      type="button"
      className={className}
      onClick={() => void signOut({ callbackUrl: "/login" })}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        minHeight: "40px",
        padding: "8px 14px",
        borderRadius: "999px",
        border: "1px solid var(--fraber-border)",
        background: "var(--fraber-bg-soft)",
        color: "var(--fraber-text-muted)",
        fontSize: "0.875rem",
        fontWeight: 600,
        cursor: "pointer",
        fontFamily: "inherit",
      }}
    >
      <LogOut size={16} />
      Sair
    </button>
  );
}
