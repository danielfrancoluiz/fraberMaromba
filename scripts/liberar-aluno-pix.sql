-- =============================================================================
-- Fraber 360 — liberar aluno após PIX (controle manual)
-- Rode no SQL Editor do Supabase (DEV ou PRD).
-- =============================================================================
-- Ofertas comunsais (ajuste o id se tiver outros no banco):
--   treino_musculacao          → musculacao          (30 dias)
--   treino_corrida             → corrida             (30 dias)
--   treino_combo_musc_corrida  → musculacao+corrida  (30 dias)
--   nutricao_individualizada   → nutricao            (30 dias)
-- =============================================================================

-- 1) Ache o aluno
SELECT a.id AS aluno_id,
       a."nomeCompleto",
       a.email,
       a.status,
       a."planoId",
       a."modulosAtivos",
       a."planoVenceEm",
       u.id AS usuario_id,
       u.email AS usuario_email
FROM "Aluno" a
LEFT JOIN "Usuario" u ON u.id = a."usuarioId"
WHERE a.email ILIKE '%EMAIL_DO_ALUNO%'
   OR a."nomeCompleto" ILIKE '%NOME_DO_ALUNO%';

-- 2) Liberar 30 dias — musculação (exemplo PIX)
-- Troque :aluno_id pelo UUID retornado acima.
-- Para combo: use ARRAY['musculacao','corrida'] e planoId 'treino_combo_musc_corrida'
-- Para corrida: ARRAY['corrida'] e 'treino_corrida'
-- Para nutrição: ARRAY['nutricao'] e 'nutricao_individualizada'

BEGIN;

UPDATE "Aluno"
SET
  status = 'ativo_plataforma',
  "planoId" = 'treino_musculacao',
  "modulosAtivos" = ARRAY['musculacao']::text[],
  "planoVenceEm" = NOW() + INTERVAL '30 days',
  "modulosVencimentos" = jsonb_build_object(
    'musculacao', to_char((NOW() + INTERVAL '30 days') AT TIMESTAMPTZ, 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')
  ),
  "atualizadoEm" = NOW()
WHERE id = 'COLE_AQUI_O_ALUNO_ID';

-- Espelha status no usuário vinculado (login)
UPDATE "Usuario" u
SET
  status = 'ativo_plataforma',
  "atualizadoEm" = NOW()
FROM "Aluno" a
WHERE a.id = 'COLE_AQUI_O_ALUNO_ID'
  AND u.id = a."usuarioId";

COMMIT;

-- 3) Conferir
SELECT a.id, a."nomeCompleto", a.status, a."planoId",
       a."modulosAtivos", a."planoVenceEm", a."modulosVencimentos",
       u.status AS usuario_status
FROM "Aluno" a
LEFT JOIN "Usuario" u ON u.id = a."usuarioId"
WHERE a.id = 'COLE_AQUI_O_ALUNO_ID';

-- Alternativa SEM SQL: NÃO usar o painel do professor enquanto
-- NEXT_PUBLIC_PAGAMENTOS_MANUAIS=1 — a oferta só grava a referência do plano.
-- Liberação só por este script, ou via Stripe quando a env for desligada.
-- =============================================================================
