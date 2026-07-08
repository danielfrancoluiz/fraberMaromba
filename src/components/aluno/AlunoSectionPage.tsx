import type { ReactNode } from "react";

interface AlunoSectionPageProps {
  title: string;
  subtitle: string;
  children: ReactNode;
}

export function AlunoSectionPage({
  title,
  subtitle,
  children,
}: AlunoSectionPageProps) {
  return (
    <main className="page-main student-page-main">
      <div className="page-container page-stack">
        <div className="student-section-hero">
          <h2 className="student-section-title">{title}</h2>
          <p className="student-section-subtitle">{subtitle}</p>
        </div>
        {children}
      </div>
    </main>
  );
}
