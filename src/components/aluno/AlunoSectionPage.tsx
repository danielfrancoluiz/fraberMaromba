import { ChevronRight, LucideIcon } from "lucide-react";
import { AlunoSectionItem } from "@/data/alunoSections";

interface AlunoSectionPageProps {
  title: string;
  subtitle: string;
  accentColor: string;
  items: AlunoSectionItem[];
}

export function AlunoSectionPage({
  title,
  subtitle,
  accentColor,
  items,
}: AlunoSectionPageProps) {
  return (
    <main className="page-main student-page-main">
      <div className="page-container page-stack">
        <div
          className="student-section-hero"
          style={{
            background: `linear-gradient(135deg, ${accentColor}18, ${accentColor}08)`,
            borderColor: `${accentColor}30`,
          }}
        >
          <h2 className="student-section-title">{title}</h2>
          <p className="student-section-subtitle">{subtitle}</p>
        </div>

        <div className="student-section-list">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.label}
                className="student-section-item"
                style={{
                  background: item.bg,
                  borderColor: `${item.color}22`,
                }}
              >
                <div
                  className="student-section-item-icon"
                  style={{ background: `${item.color}22` }}
                >
                  <Icon size={24} style={{ color: item.color }} />
                </div>
                <div className="student-section-item-body">
                  <p className="student-section-item-label">{item.label}</p>
                  <p className="student-section-item-desc">{item.desc}</p>
                </div>
                <ChevronRight size={16} style={{ color: item.color }} />
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
