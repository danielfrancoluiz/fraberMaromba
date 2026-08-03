"use client";

import { useMemo } from "react";
import {
  labelGrupoOferta,
  labelOpcaoOferta,
  type OfertaGrupo,
  type OfertaPlano,
} from "@/lib/ofertas-planos";
import { useOfertasPlanos } from "@/hooks/useOfertasPlanos";

interface SelectOfertaPlanoProps {
  value: string;
  onChange: (ofertaId: string) => void;
  id?: string;
  className?: string;
  disabled?: boolean;
  /** Filtra por grupo; se omitido, lista treino + nutrição. */
  grupo?: OfertaGrupo;
  placeholder?: string;
}

export function SelectOfertaPlano({
  value,
  onChange,
  id,
  className = "input-field",
  disabled,
  grupo,
  placeholder = "Selecione um plano",
}: SelectOfertaPlanoProps) {
  const { ofertas, loading, erro } = useOfertasPlanos({ grupo });

  const porGrupo = useMemo(() => {
    const mapa = new Map<OfertaGrupo, OfertaPlano[]>();
    for (const oferta of ofertas) {
      const lista = mapa.get(oferta.grupo) ?? [];
      lista.push(oferta);
      mapa.set(oferta.grupo, lista);
    }
    return mapa;
  }, [ofertas]);

  const valorAusenteNaLista =
    value.trim() && !ofertas.some((o) => o.id === value) ? value : null;

  return (
    <>
      <select
        id={id}
        className={className}
        value={value}
        disabled={disabled || loading}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">
          {loading ? "Carregando planos..." : placeholder}
        </option>
        {valorAusenteNaLista ? (
          <option value={valorAusenteNaLista}>
            Plano atual ({valorAusenteNaLista})
          </option>
        ) : null}
        {!grupo ? (
          Array.from(porGrupo.entries()).map(([g, lista]) => (
            <optgroup key={g} label={labelGrupoOferta(g)}>
              {lista.map((oferta) => (
                <option key={oferta.id} value={oferta.id}>
                  {labelOpcaoOferta(oferta)}
                </option>
              ))}
            </optgroup>
          ))
        ) : (
          ofertas.map((oferta) => (
            <option key={oferta.id} value={oferta.id}>
              {labelOpcaoOferta(oferta)}
            </option>
          ))
        )}
      </select>
      {erro ? <p className="field-error">{erro}</p> : null}
    </>
  );
}
