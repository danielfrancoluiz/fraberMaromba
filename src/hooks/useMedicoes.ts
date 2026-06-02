import { useCallback, useEffect, useRef, useState } from "react";

export interface MedicaoFisica {
  id: string;
  alunoId: string;
  professorId: string;
  peso: number | null;
  cintura: number | null;
  quadril: number | null;
  bracoDireito: number | null;
  bracoEsquerdo: number | null;
  coxaDireita: number | null;
  coxaEsquerda: number | null;
  observacao: string | null;
  dataMedicao: string;
  criadoEm: string;
}

interface MedicaoForm {
  peso: string;
  cintura: string;
  quadril: string;
  bracoDireito: string;
  bracoEsquerdo: string;
  coxaDireita: string;
  coxaEsquerda: string;
  observacao: string;
}

interface ApiErrorBody {
  error?: string;
}

interface UseMedicoesReturn {
  medicoes: MedicaoFisica[];
  loading: boolean;
  feedbackSucesso: boolean;
  feedbackErro: string | null;
  form: MedicaoForm;
  handleChange: (campo: string, valor: string) => void;
  handleSubmit: () => Promise<void>;
}

const FORM_INICIAL: MedicaoForm = {
  peso: "",
  cintura: "",
  quadril: "",
  bracoDireito: "",
  bracoEsquerdo: "",
  coxaDireita: "",
  coxaEsquerda: "",
  observacao: "",
};

const CAMPOS_NUMERICOS: (keyof Omit<MedicaoForm, "observacao">)[] = [
  "peso",
  "cintura",
  "quadril",
  "bracoDireito",
  "bracoEsquerdo",
  "coxaDireita",
  "coxaEsquerda",
];

async function extrairErro(res: Response): Promise<string> {
  const body: unknown = await res.json().catch(() => null);
  if (
    typeof body === "object" &&
    body !== null &&
    "error" in body &&
    typeof (body as ApiErrorBody).error === "string"
  ) {
    return (body as ApiErrorBody).error!;
  }
  return "Erro na requisição";
}

function isMedicaoFisica(value: unknown): value is MedicaoFisica {
  if (typeof value !== "object" || value === null) return false;

  const dados = value as Record<string, unknown>;

  return (
    typeof dados.id === "string" &&
    typeof dados.alunoId === "string" &&
    typeof dados.professorId === "string" &&
    typeof dados.dataMedicao === "string" &&
    typeof dados.criadoEm === "string"
  );
}

function parseNumeroOpcional(valor: string): number | undefined {
  const trimmed = valor.trim();
  if (!trimmed) return undefined;

  const numero = Number.parseFloat(trimmed.replace(",", "."));
  return Number.isNaN(numero) ? undefined : numero;
}

function isCampoForm(campo: string): campo is keyof MedicaoForm {
  return campo in FORM_INICIAL;
}

export function useMedicoes(
  alunoId: string,
  options?: { onSalvo?: () => void }
): UseMedicoesReturn {
  const onSalvo = options?.onSalvo;
  const [medicoes, setMedicoes] = useState<MedicaoFisica[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedbackSucesso, setFeedbackSucesso] = useState(false);
  const [feedbackErro, setFeedbackErro] = useState<string | null>(null);
  const [form, setForm] = useState<MedicaoForm>(FORM_INICIAL);
  const sucessoTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const carregarMedicoes = useCallback(async (): Promise<void> => {
    setLoading(true);
    setFeedbackErro(null);

    try {
      const res = await fetch(
        `/api/professor/medicoes?alunoId=${encodeURIComponent(alunoId)}`
      );

      if (!res.ok) {
        throw new Error(await extrairErro(res));
      }

      const dados: unknown = await res.json();
      if (!Array.isArray(dados)) {
        throw new Error("Resposta inválida");
      }

      setMedicoes(dados.filter(isMedicaoFisica));
    } catch (error) {
      const mensagem =
        error instanceof Error ? error.message : "Erro ao carregar medições";
      setFeedbackErro(mensagem);
    } finally {
      setLoading(false);
    }
  }, [alunoId]);

  useEffect(() => {
    void carregarMedicoes();
  }, [carregarMedicoes]);

  const handleChange = useCallback((campo: string, valor: string): void => {
    if (!isCampoForm(campo)) return;

    setForm((prev) => ({ ...prev, [campo]: valor }));
    setFeedbackErro(null);
  }, []);

  const handleSubmit = useCallback(async (): Promise<void> => {
    setFeedbackErro(null);

    const payload: Record<string, string | number> = { alunoId };

    for (const campo of CAMPOS_NUMERICOS) {
      const valor = parseNumeroOpcional(form[campo]);
      if (valor !== undefined) {
        payload[campo] = valor;
      }
    }

    if (form.observacao.trim()) {
      payload.observacao = form.observacao.trim();
    }

    try {
      const res = await fetch("/api/professor/medicoes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error(await extrairErro(res));
      }

      setForm(FORM_INICIAL);
      setFeedbackSucesso(true);

      if (sucessoTimeoutRef.current) {
        clearTimeout(sucessoTimeoutRef.current);
      }

      sucessoTimeoutRef.current = setTimeout(() => {
        setFeedbackSucesso(false);
      }, 2000);

      await carregarMedicoes();
      onSalvo?.();
    } catch (error) {
      const mensagem =
        error instanceof Error ? error.message : "Erro ao registrar medição";
      setFeedbackErro(mensagem);
    }
  }, [alunoId, form, carregarMedicoes, onSalvo]);

  useEffect(() => {
    return () => {
      if (sucessoTimeoutRef.current) {
        clearTimeout(sucessoTimeoutRef.current);
      }
    };
  }, []);

  return {
    medicoes,
    loading,
    feedbackSucesso,
    feedbackErro,
    form,
    handleChange,
    handleSubmit,
  };
}
