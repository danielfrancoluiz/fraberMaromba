"use client";

import { Salad, Wind, type LucideIcon } from "lucide-react";
import { AlunoSectionPage } from "@/components/aluno/AlunoSectionPage";
import { EmptyState } from "@/components/ui/EmptyState";

const ICONS = {
  wind: Wind,
  salad: Salad,
} as const;

type ComingSoonIcon = keyof typeof ICONS;

interface AlunoComingSoonProps {
  title: string;
  subtitle: string;
  icon: ComingSoonIcon;
  description: string;
}

export function AlunoComingSoon({
  title,
  subtitle,
  icon,
  description,
}: AlunoComingSoonProps) {
  const Icon: LucideIcon = ICONS[icon];

  return (
    <AlunoSectionPage title={title} subtitle={subtitle}>
      <EmptyState icon={Icon} title="Em breve" description={description} />
    </AlunoSectionPage>
  );
}
