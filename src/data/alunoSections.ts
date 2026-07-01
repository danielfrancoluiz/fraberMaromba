import {
  Wind,
  Activity,
  Trophy,
  Salad,
  Flame,
  ClipboardList,
  LucideIcon,
} from "lucide-react";

export interface AlunoSectionItem {
  label: string;
  icon: LucideIcon;
  color: string;
  bg: string;
  desc: string;
}

export const CORRIDA_ITEMS: AlunoSectionItem[] = [
  {
    label: "Treino de Corrida",
    icon: Wind,
    color: "#2b7de9",
    bg: "rgba(43,125,233,0.12)",
    desc: "Planilhas de corrida",
  },
  {
    label: "Pace e Ritmo",
    icon: Activity,
    color: "#e02020",
    bg: "rgba(224,32,32,0.12)",
    desc: "Calcule seu ritmo",
  },
  {
    label: "Records de Corrida",
    icon: Trophy,
    color: "#f5a623",
    bg: "rgba(245,166,35,0.12)",
    desc: "Seus melhores tempos",
  },
];

export const NUTRICAO_ITEMS: AlunoSectionItem[] = [
  {
    label: "Plano Alimentar",
    icon: Salad,
    color: "#27ae60",
    bg: "rgba(39,174,96,0.12)",
    desc: "Sua dieta personalizada",
  },
  {
    label: "Calorias",
    icon: Flame,
    color: "#e02020",
    bg: "rgba(224,32,32,0.12)",
    desc: "Acompanhe o consumo",
  },
  {
    label: "Receitas Saudáveis",
    icon: ClipboardList,
    color: "#2b7de9",
    bg: "rgba(43,125,233,0.12)",
    desc: "Refeições nutritivas",
  },
];
