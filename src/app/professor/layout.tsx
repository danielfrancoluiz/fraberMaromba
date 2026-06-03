import { AppShell } from "@/components/AppShell";

export default function ProfessorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppShell role="professor">{children}</AppShell>;
}
