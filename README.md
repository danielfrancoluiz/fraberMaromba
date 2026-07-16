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
| `GOOGLE_CLIENT_ID` | Login/cadastro com Google (OAuth) |
| `GOOGLE_CLIENT_SECRET` | Secret do OAuth Google |
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

### Novo projeto Supabase (do zero)

1. Acesse [supabase.com/dashboard](https://supabase.com/dashboard) e faça login (GitHub, Google ou e-mail).
2. **New project** → nome ex.: `fraber-maromba`, senha do banco (anote), região **South America (São Paulo)**.
3. Aguarde ~2 min até o projeto ficar **Active**.
4. **Project Settings → API**
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon` / publishable → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` / secret → `SUPABASE_SERVICE_ROLE_KEY`
5. **Project Settings → Database → Connection string**
   - Aba **ORM** ou **URI**
   - Método: **Session pooler**, porta **5432**
   - Copie a URL e substitua `[YOUR-PASSWORD]` pela senha do passo 2
   - Cole em `DATABASE_URL` e `DIRECT_URL` no `.env.local` (use o mesmo host que o painel mostrar, ex. `aws-0-sa-east-1.pooler.supabase.com`)
6. No terminal do projeto:

```bash
cp .env.example .env.local   # ou edite o .env.local existente
npm run db:check             # testa DNS e conexão
npx prisma db push           # cria tabelas
npx prisma db seed           # usuários de teste
npm run dev
```

7. Login: `/login` — professor `ricardo@fraber.com` / `123456`, aluno `carlos@fraber.com` / `123456`.

**Dica:** o host do pooler muda conforme região (`aws-0-sa-east-1`, `aws-1-sa-east-1`, etc.). Use sempre a string exata do painel, não copie de outro projeto.

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

### Google OAuth (conta pessoal funciona)

Sim — você pode usar Gmail pessoal. No [Google Cloud Console](https://console.cloud.google.com/):

1. Crie um projeto (ou use um existente).
2. **APIs e serviços → Tela de consentimento OAuth** → tipo **Externo**.
   - Em modo **Teste**, adicione seu Gmail em **Usuários de teste**.
3. **Credenciais → Criar credenciais → ID do cliente OAuth** → tipo **Aplicativo da Web**.
4. **URIs de redirecionamento autorizados**:
   - `http://localhost:3000/api/auth/callback/google`
   - `https://SEU-DOMINIO/api/auth/callback/google` (produção)
5. Copie Client ID e Client Secret para `.env.local`:
   - `GOOGLE_CLIENT_ID=...`
   - `GOOGLE_CLIENT_SECRET=...`

Com isso, **Entrar com Google** / **Continuar com Google** cria a conta automaticamente (professor sem convite; aluno se vier pelo link de convite).

### Stripe (checkout com preço do combo)

**Não é necessário cadastrar produtos/preços no Dashboard do Stripe.** O app envia o valor dinamicamente via Checkout Session (`price_data`) com base no plano escolhido no combo.

1. Em [Stripe → Developers → API keys](https://dashboard.stripe.com/test/apikeys), copie:
   - `STRIPE_SECRET_KEY` → `sk_test_...`
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` → `pk_test_...` (opcional; o fluxo atual redireciona para o Checkout hospedado)
2. Ajuste os valores em `src/lib/stripe.ts` (`PLANOS_STRIPE`, em centavos). O combo e o Stripe usam o mesmo preço.
3. Webhook (produção ou local):
   - Local: `stripe listen --forward-to localhost:3000/api/pagamentos/webhook`
   - Copie o **signing secret** (`whsec_...`) para `STRIPE_WEBHOOK_SECRET`
   - **Não use** `sk_test_` nem `rk_test_` aqui — só `whsec_`
4. Payment Links (`NEXT_PUBLIC_STRIPE_PAYMENT_LINK_*`) são **fallback** se `STRIPE_SECRET_KEY` estiver ausente. Com a secret key configurada, eles não são usados.

Fluxo: combo de plano → `POST /api/pagamentos/checkout` → redirect Stripe → página `/pagamento/sucesso` confirma a sessão → webhook também marca `pago` e ativa `Usuario` + `Aluno`.

Após pagar, **saia e entre de novo** para o JWT trazer `status` e `planoId` atualizados.

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
