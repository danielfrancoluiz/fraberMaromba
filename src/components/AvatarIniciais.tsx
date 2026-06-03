import { getIniciais } from "@/lib/greeting";

interface AvatarIniciaisProps {
  nome: string;
  size?: "md" | "lg";
}

const sizes = {
  md: { box: 44, font: "0.95rem" },
  lg: { box: 52, font: "1.1rem" },
};

export function AvatarIniciais({ nome, size = "lg" }: AvatarIniciaisProps) {
  const dim = sizes[size];

  return (
    <div
      className="avatar-iniciais"
      style={{
        width: dim.box,
        height: dim.box,
        fontSize: dim.font,
      }}
      aria-hidden
    >
      {getIniciais(nome)}
    </div>
  );
}
