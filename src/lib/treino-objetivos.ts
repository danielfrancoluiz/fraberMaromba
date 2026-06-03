export const OBJETIVOS_TREINO = [
  { value: "", label: "Selecione (opcional)" },
  { value: "hipertrofia", label: "Hipertrofia" },
  { value: "forca", label: "Força" },
  { value: "resistencia", label: "Resistência" },
  { value: "emagrecimento", label: "Emagrecimento" },
  { value: "manutencao", label: "Manutenção" },
  { value: "condicionamento", label: "Condicionamento" },
  { value: "outro", label: "Outro" },
] as const;

export function labelObjetivoTreino(value: string | undefined): string {
  if (!value) return "";
  const item = OBJETIVOS_TREINO.find((o) => o.value === value);
  return item?.label ?? value;
}
