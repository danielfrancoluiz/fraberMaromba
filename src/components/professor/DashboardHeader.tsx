"use client";

import { AppTopBar } from "@/components/AppTopBar";

interface DashboardHeaderProps {
  nome: string;
}

export function DashboardHeader({ nome }: DashboardHeaderProps) {
  return <AppTopBar title={nome} subtitle="Painel do Professor" logoSize={52} />;
}
