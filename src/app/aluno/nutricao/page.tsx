import { AlunoSectionPage } from "@/components/aluno/AlunoSectionPage";
import { NUTRICAO_ITEMS } from "@/data/alunoSections";

export default function Page() {
  return (
    <AlunoSectionPage
      title="Nutrição"
      subtitle="Plano alimentar e acompanhamento"
      accentColor="#27ae60"
      items={NUTRICAO_ITEMS}
    />
  );
}
