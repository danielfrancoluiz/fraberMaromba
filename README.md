# Fraber Maromba

Plataforma de treinos Fraber (Next.js, Prisma, NextAuth, tema dark).

## Ambiente local

Variáveis em `.env.local`:

| Variável | Uso |
|----------|-----|
| `DATABASE_URL` | App em runtime (pooler 6543 recomendado) |
| `DIRECT_URL` | `prisma db push` / migrations (session pooler 5432) |
| `NEXTAUTH_SECRET` | JWT NextAuth |
| `NEXTAUTH_URL` | URL base (`http://localhost:3000`) |
| `STRIPE_SECRET_KEY` | Checkout Session (recomendado) |
| `STRIPE_WEBHOOK_SECRET` | Webhook `checkout.session.completed` |
| `NEXT_PUBLIC_STRIPE_PAYMENT_LINK_MENSAL` | Fallback Payment Link |
| `NEXT_PUBLIC_STRIPE_PAYMENT_LINK_SEMESTRAL` | Fallback Payment Link |
| `NEXT_PUBLIC_STRIPE_PAYMENT_LINK_ANUAL` | Fallback Payment Link |
| `NEXT_PUBLIC_STRIPE_PAYMENT_LINK_AVULSO` | Fallback Payment Link (opcional) |

```bash
npm install
npx prisma db push
npm run dev
```

### Erro P1001 (`Can't reach database server` no `db push`)

O host direto `db.<ref>.supabase.co` costuma resolver **só em IPv6**. Redes/Windows sem IPv6 estável falham com P1001.

1. Rode `npm run db:check` para ver DNS (IPv4 vs IPv6) e teste de TCP.
2. No [Supabase](https://supabase.com/dashboard) → **Project Settings → Database → Connection string**.
3. Escolha **Session pooler** (porta **5432**), região do projeto.
4. Usuário no formato `postgres.<project-ref>`.
5. Cole a URL em **`DIRECT_URL`** no `.env.local`.
6. `npx prisma db push` e `npm run db:seed-catalogo`.

### Seed e usuários de teste

- Professor: `ricardo@fraber.com` / `123456`
- Aluno: `carlos@fraber.com` / `123456`

```powershell
$env:TS_NODE_COMPILER_OPTIONS='{"module":"CommonJS"}'
npx ts-node prisma/seed.ts
```

Login unificado: `/login` (não use `/aluno/login` — redireciona automaticamente).

### Stripe em desenvolvimento

1. Crie produtos/preços ou use Checkout dinâmico (já suportado com `STRIPE_SECRET_KEY`).
2. Webhook local: `stripe listen --forward-to localhost:3000/api/pagamentos/webhook`
3. Copie o signing secret para `STRIPE_WEBHOOK_SECRET`.
4. Fluxo: Perfil ou professor → pagamento → registro `Pagamento` pendente → redirect Stripe → webhook marca `pago` e ativa `Usuario` + `Aluno`.

Após pagar, se o dashboard ainda bloquear: **Sair e entrar de novo** (JWT traz `status` e `planoId` no login).

## Testes manuais

Marque cada item após validar em `npm run dev`.

### Autenticação

- [ ] Login professor (`ricardo@fraber.com`) → `/professor/dashboard`
- [ ] Login aluno ativo (`carlos@fraber.com`) → `/aluno/dashboard`
- [ ] Aluno inativo → `/aluno/inativo` e botão “Pagar ou renovar” → `/aluno/perfil`
- [ ] Logout em `/aluno/perfil` e `/professor/perfil` volta para `/login`
- [ ] `/acesso-negado` ao acessar rota da outra role

### Professor

- [ ] Dashboard lista alunos
- [ ] Cadastrar aluno, editar, ver treinos e estatísticas de sessão
- [ ] Montar treino (`/professor/treinos/montar`) e editar (`/montar/[id]`)
- [ ] Templates + treinos atribuídos em `/professor/treinos` (abas)
- [ ] Pagamento do aluno: escolher plano, histórico, iniciar checkout
- [ ] Perfil: nome, e-mail, badge professor, sair

### Aluno

- [ ] Dashboard com stats e últimos treinos
- [ ] Lista de treinos por dia da semana
- [ ] Executar treino: séries, descanso, trocar exercício, concluir (sessão no banco)
- [ ] Histórico de sessões
- [ ] Perfil: plano, status, histórico de pagamentos
- [ ] Conta inativa: CTA pagar no perfil

### Pagamentos (com Stripe configurado)

- [ ] `POST /api/pagamentos/checkout` cria linha `Pagamento` pendente
- [ ] Redirect para Stripe (Checkout Session ou Payment Link por plano)
- [ ] Webhook `checkout.session.completed` → status `pago`, aluno `ativo_plataforma`
- [ ] Página `/pagamento/sucesso` e acesso liberado após novo login

### PWA e acessibilidade

- [ ] `manifest.json` e theme-color no mobile (instalar atalho)
- [ ] Bottom nav com leitores de tela (`aria-label` em cada item)
- [ ] Execução de treino: botões Sair, pular descanso, trocar, série concluída com `aria-label`

### Legado removido

- [ ] `/dev/seed` redireciona para `/login`
- [ ] Sem mock `sessionStorage` / `localStorage` de progresso de treino

## Scripts úteis

```bash
npm run build
npm run db:check
npm run db:seed-catalogo
```
