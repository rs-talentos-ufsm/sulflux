# GEMINI.md — Contexto do Projeto para o Antigravity CLI

> Este arquivo é lido automaticamente pelo Antigravity (AGY) a cada sessão.
> Ele fornece toda a inteligência contextual necessária para o agente trabalhar
> no projeto **Sulflux** com precisão e autonomia.
>
> Para a visão do ecossistema completo de projetos, consulte também:
> 👉 `/home/dorneles/projects/GEMINI.md`

---

## 📋 Visão Geral do Projeto

**Sulflux** é uma ferramenta de gestão ambiental avançada focada em métricas de sustentabilidade, análises hidrológicas e monitoramento estratégico de carbono. A plataforma centraliza dados ambientais, permite rastreamento de indicadores de sustentabilidade e viabiliza análises e relatórios para tomada de decisão ambiental.

- **Tipo:** Environmental Management Platform / Sustainability Analytics
- **Licença:** AGPLv3
- **Organização GitHub:** `rs-talentos-ufsm`
- **Repositório Orquestrador:** `rs-talentos-ufsm/sulflux`
- **Status:** 🟡 Em desenvolvimento — fase inicial de construção do domínio

> [!NOTE]
> Este projeto compartilha a mesma arquitetura base de todo o ecossistema Dorneles Laboratory.
> O projeto de referência arquitetural é o **CSM** (`csm/`). Padrões técnicos evoluídos
> no CSM serão propagados ao Sulflux para manter o alinhamento arquitetural do ecossistema.

---

## 🏗️ Arquitetura: Monorepo por Acoplamento (Git Submodules)

O repositório raiz é o **orquestrador**. Ele não contém código de aplicação — gerencia submódulos, arquivos de ambiente e scripts Docker:

```
sulflux/                          ← Raiz orquestradora
├── apps/
│   ├── backend/                  ← Submódulo: sulflux.backend (Node.js/Express 5/Prisma 7)
│   └── frontend/                 ← Submódulo: sulflux.frontend (React 19/Vite 7)
├── packages/
│   └── shared/                   ← Submódulo: sulflux.shared (Contratos Zod/TS)
├── docs/                         ← Documentação arquitetural e de infraestrutura
├── .gemini/                      ← Configurações e diretrizes do Antigravity CLI
│   ├── rules.md                  ← Regras inegociáveis de desenvolvimento
│   ├── system-instructions.md    ← Instruções de sistema para o agente
│   └── templates/                ← Templates de código obrigatórios
├── Makefile                      ← Orquestrador principal de comandos
└── GEMINI.md                     ← Este arquivo ← você está aqui
```

### Submódulos e Repositórios

| Pasta | Repositório SSH | Descrição |
|---|---|---|
| `packages/shared` | `git@github.com:rs-talentos-ufsm/sulflux.shared.git` | Contratos Zod, DTOs e OpenAPI Registry |
| `apps/backend` | `git@github.com:rs-talentos-ufsm/sulflux.backend.git` | API RESTful Express 5 + Prisma + PostgreSQL |
| `apps/frontend` | `git@github.com:rs-talentos-ufsm/sulflux.frontend.git` | SPA React 19 (CSS Modules) |

---

## ⚙️ Stack Tecnológica

### `packages/shared` — Fonte Única de Verdade
- **TypeScript** (modo estrito)
- **Zod 4.x** — validação robusta e estruturação de schemas
- **`@asteasolutions/zod-to-openapi`** — registro declarativo de schemas e endpoints para geração de contratos OpenAPI/Swagger
- Compilação contínua via `tsc --watch`; saída estática em `dist/`
- Todos os schemas, tipos inferidos (`z.infer<>`) e enums residem **obrigatoriamente** aqui

### `apps/backend` — API RESTful
- **Node.js + Express 5** — servidor HTTP assíncrono de alta performance
- **Prisma ORM 7** + **PostgreSQL** — persistência de dados relacional fortemente tipada
- **Zod** — validação de entrada nos controllers via `safeParse`
- **JWT** (`jsonwebtoken`) + **argon2** + **cookie-parser** — autenticação segura via Cookies HTTP-Only
- **Helmet** + **express-rate-limit** + **CORS** — segurança e sanitização HTTP
- **Pino** + **pino-http** — logs estruturados
- **OpenTelemetry** — observabilidade e rastreamento distribuído
- **Swagger UI** (`/api-docs`) — documentação viva gerada a partir do registry Zod
- **Vitest** — suíte de testes unitários e de integração
- **Clean Architecture:** `Controller (safeParse) → Service (regras de negócio/Prisma) → Database`

### `apps/frontend` — Interface Reativa
- **React 19** + **Vite 7** — framework reativo e build tool ultra-rápida
- **React Query** (`@tanstack/react-query`) — sincronização de estado de servidor, mutations e cache
- **Zustand** — gerenciamento de estado local da sessão de autenticação
- **React Router DOM 7** — roteamento declarativo e guardas de rota por permissão
- **React Hook Form** + **@hookform/resolvers** — manipulação e validação de formulários integrados ao Zod
- **Sonner** — toasts modernos e elegantes
- **Recharts** — gráficos e visualizações analíticas de dados ambientais
- **Lucide Icons** — iconografia moderna e consistente
- **Vitest** + **React Testing Library** — testes de componentes e hooks

---

## 🎨 A Regra de Ouro da UI (CSS Modules Exclusivo)

> [!CAUTION]
> **Tailwind CSS e qualquer utilitário derivado (como funções `cn()`, `clsx` atrelado a Tailwind ou `tailwind-merge`) são TERMINANTEMENTE PROIBIDOS neste projeto.**

- Toda a estilização de componentes, páginas e layouts deve ser feita **exclusivamente via CSS Modules (`.module.css`)**.
- As classes CSS devem ser acessadas de forma tipada e modular (`styles.container`, `styles.cardHeader`, etc.).
- A consistência visual é mantida através dos **tokens CSS nativos e variáveis semânticas** declaradas em `src/styles/global.css`.

---

## 🗄️ Domínio do Projeto (Em Construção)

> [!NOTE]
> O Sulflux está em fase inicial de desenvolvimento. O modelo de dados e os módulos serão
> definidos e documentados aqui à medida que forem implementados.

### Domínio Principal (Planejado)
O Sulflux trabalhará com entidades relacionadas à **gestão ambiental**:
- Métricas de sustentabilidade e indicadores ambientais
- Análises hidrológicas (bacias, recursos hídricos)
- Monitoramento estratégico de emissões de carbono
- Relatórios e dashboards analíticos ambientais

---

## 📐 Regras de Código — OBRIGATÓRIAS

### Regras Globais
1. **PROIBIDO DADOS MOCKADOS:** Em hipótese alguma use dados mockados, constantes fictícias ou fallbacks estáticos no frontend. Todos os dados devem vir **100% dos hooks do React Query**, consumindo endpoints reais do backend e contratos do `@lib/shared`. Se a API, schema ou modelo Prisma ainda não existir, **crie-o de ponta a ponta** obrigatoriamente.
2. **REGRA DE OURO DA UI — PROIBIDO TAILWIND CSS & CN():** É **terminantemente proibido** utilizar Tailwind CSS, classes utilitárias ou funções auxiliares como `cn()`. Todo o frontend utiliza **exclusivamente CSS Modules (`.module.css`)** e variáveis CSS em `src/styles/global.css`.
3. **TypeScript modo estrito** em todos os pacotes (sem `any` implícito).
4. **Schemas Zod únicos:** Todos os schemas Zod e tipos `z.infer<>` **devem** residir em `packages/shared`.
5. **Nunca duplicar validações** entre Frontend e Backend — use sempre os contratos do `@lib/shared`.
6. **Conventional Commits:** Padrão semântico obrigatório (`feat:`, `fix:`, `docs:`, `refactor:`, `chore:`).
7. **Vitest:** Testes unitários e de integração obrigatórios para novos módulos.
8. **AGPLv3:** Licença obrigatória em todos os submódulos.

### Padrão de Arquitetura Backend
```
Controller (valida body/params via safeParse → delega ao Service)
  ↓
Service (regras de negócio → executa operações via Prisma Client → lança AppError em falhas)
  ↓
Prisma ORM (PostgreSQL)
```

### Respostas de Erro — Padrão RFC 7807
```typescript
// Respostas de erro HTTP (400, 401, 403, 404, 500) utilizam o formato padronizado:
{
  type: '/errors/validation-error',
  title: 'Erro de validação nos dados enviados',
  status: 400,
  detail: 'Um ou mais campos falharam na validação.',
  errors: validation.error.flatten().fieldErrors
}
```

### Documentação OpenAPI Viva
Todo endpoint novo deve ser registrado no `registry.registerPath()` antes da inicialização das rotas do Express.

---

## 📄 Templates de Código Obrigatórios

Ao criar recursos novos, **SEMPRE** consulte e siga os templates em `.gemini/templates/`:

| Template | Uso |
|---|---|
| `shared-schema.ts.template` | Schemas Zod com anotações e registro OpenAPI |
| `shared-types.ts.template` | Tipos TypeScript inferidos (`z.infer<>`) exportados |
| `shared-enums.ts.template` | Enums `as const` exportados |
| `backend-controller.ts.template` | Controller com `safeParse`, RFC 7807 e `next(error)` |
| `backend-service.ts.template` | Service com Prisma Client e `AppError` |
| `backend-routes.ts.template` | Rotas Express com `registry.registerPath` e middlewares |
| `frontend-hooks.ts.template` | React Query hooks consumindo `@lib/shared` |

---

## 🔄 Fluxo de Adição de Novo Recurso

Ao criar uma nova entidade ou funcionalidade, siga **esta ordem obrigatoriamente**:

1. **`packages/shared`** → Criar `<recurso>.schemas.ts`, `<recurso>.types.ts`, `<recurso>.enums.ts` (se necessário), e exportar em `index.ts`.
2. **`apps/backend/prisma/schema.prisma`** → Adicionar models e enums necessários e rodar migrations.
3. **`apps/backend`** → Criar `<recurso>.controller.ts`, `<recurso>.service.ts`, `<recurso>.routes.ts` com registro OpenAPI.
4. **`apps/frontend`** → Criar hook React Query em `src/hooks/` e componentes/páginas necessários com **CSS Modules**.
5. **Testes** → Criar e rodar testes Vitest em todos os módulos alterados.

---

## 🐳 Comandos de Orquestração (Makefile)

| Comando | Descrição |
|---|---|
| `make init` | Baixa submódulos e prepara arquivos `.env` |
| `make install` | Instala dependências npm em todos os pacotes |
| `make dev-up` | Sobe Frontend + Backend em modo dev (logs combinados) |
| `make dev-upd` | Sobe em background (modo daemon) |
| `make dev-down` | Derruba containers de desenvolvimento |
| `make dev-reset` | Limpa containers e volumes Docker (zera banco de dados) |
| `make test` | Executa a suíte de testes em shared, backend e frontend |
| `make migrate` | Executa migrations do Prisma no Docker |
| `make migrate-local` | Executa migrations na máquina local |
| `make generate` | Atualiza Prisma Client no Docker |
| `make shared-update` | Atualiza `@lib/shared` no backend e frontend |
| `make status` | Exibe o status dos submódulos git |
| `make logs-back` | Tail dos logs do container backend |
| `make logs-front` | Tail dos logs do container frontend |

---

- **Backend API (Dev):** `http://localhost:<BACKEND_PORT>/api` (definido em `.env.development`)
- **Swagger UI (Dev):** `http://localhost:<BACKEND_PORT>/api-docs`
- **Frontend (Dev):** `http://localhost:<FRONTEND_PORT>` (definido em `.env.development`)
- **PostgreSQL:** Container Docker dedicado
- **Rede Docker:** `sulflux_network`

---

## 🤖 Inicialização Automatizada para Agentes (Antigravity)

Para que o Antigravity configure e suba o projeto a partir apenas do link do repositório, consulte o passo a passo completo em:
👉 **[`docs/agent-bootstrap.md`](docs/agent-bootstrap.md)**

**Resumo da Sequência de Comandos:**
```bash
git clone --recurse-submodules <REPO_URL>
cd sulflux
make init     # Baixa submódulos, cria .env.development/.env.test e garante a rede Docker
make install  # Instala dependências em shared, backend e frontend
make dev-upd  # Sobe Frontend + Backend + PostgreSQL em background
make migrate  # Aplica migrations do Prisma
```
