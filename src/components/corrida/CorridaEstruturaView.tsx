"use client";

import {
  labelAcao,
  resumoPassoLinha,
  type EstruturaCorrida,
  type PassoCorrida,
} from "@/lib/treino-corrida";

interface CorridaEstruturaViewProps {
  estrutura: EstruturaCorrida;
  compact?: boolean;
}

function PassoLinha({
  passo,
  indice,
}: {
  passo: PassoCorrida;
  indice?: string;
}) {
  return (
    <li className="corrida-passo">
      <div className="corrida-passo-main">
        {indice ? <span className="corrida-passo-num">{indice}</span> : null}
        <div>
          <p className="corrida-passo-titulo">{resumoPassoLinha(passo)}</p>
          {passo.nota ? (
            <p className="corrida-passo-nota">{passo.nota.toUpperCase()}</p>
          ) : null}
          {passo.observacao ? (
            <p className="corrida-passo-obs">{passo.observacao}</p>
          ) : null}
        </div>
      </div>
    </li>
  );
}

export function CorridaEstruturaView({
  estrutura,
  compact = false,
}: CorridaEstruturaViewProps) {
  let contador = 0;

  return (
    <ol className={`corrida-estrutura${compact ? " corrida-estrutura--compact" : ""}`}>
      {estrutura.map((item) => {
        if (item.tipo === "passo") {
          contador += 1;
          return (
            <PassoLinha key={item.id} passo={item} indice={`${contador}.`} />
          );
        }

        contador += 1;
        const blocoNum = contador;
        return (
          <li key={item.id} className="corrida-bloco-repetir">
            <p className="corrida-bloco-titulo">
              {blocoNum}. Repetir {item.vezes}×
            </p>
            <ul className="corrida-bloco-lista">
              {item.passos.map((passo) => (
                <li key={passo.id} className="corrida-passo corrida-passo--filho">
                  <p className="corrida-passo-titulo">
                    — {resumoPassoLinha(passo)}
                  </p>
                  {passo.nota ? (
                    <p className="corrida-passo-nota">{passo.nota.toUpperCase()}</p>
                  ) : null}
                  {passo.observacao ? (
                    <p className="corrida-passo-obs">{passo.observacao}</p>
                  ) : null}
                </li>
              ))}
            </ul>
            {item.passos.length === 0 ? (
              <p className="text-muted" style={{ margin: "4px 0 0", fontSize: "0.85rem" }}>
                Sem passos em {labelAcao("correr")}…
              </p>
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}
