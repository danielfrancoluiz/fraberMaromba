import { AlunoSectionPage } from "@/components/aluno/AlunoSectionPage";
import { CORRIDA_ITEMS } from "@/data/alunoSections";

export default function Page() {
  return (
    <AlunoSectionPage
      title="Corrida"
      subtitle="Planilhas, pace e seus melhores tempos"
      accentColor="#2b7de9"
      items={CORRIDA_ITEMS}
    />
  );
}
