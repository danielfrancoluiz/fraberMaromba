"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

interface LogoutButtonProps {
  className?: string;
  fullWidth?: boolean;
}

export function LogoutButton({ className = "", fullWidth = false }: LogoutButtonProps) {
  return (
    <button
      type="button"
      className={`${className} ${fullWidth ? "logout-btn-full" : ""}`.trim()}
      onClick={() => void signOut({ callbackUrl: "/login" })}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: fullWidth ? "center" : undefined,
        gap: "6px",
        minHeight: "48px",
        width: fullWidth ? "100%" : undefined,
        padding: "8px 14px",
        borderRadius: "var(--fraber-radius-sm)",
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
