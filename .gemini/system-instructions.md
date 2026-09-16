# Contexto Principal — Sulflux (Antigravity CLI)

> **IMPORTANTE:** O arquivo de contexto completo do projeto está em `GEMINI.md` na raiz.
> Leia-o para obter arquitetura completa, submódulos, stack e regras detalhadas.

---

## Referências Rápidas

### Contexto do Projeto
→ **`GEMINI.md`** (`/home/dorneles/projects/sulflux/GEMINI.md`) — Arquitetura, stack, submódulos, domínio do Sulflux e comandos Makefile.
→ **`docs/agent-bootstrap.md`** — Guia passo a passo para inicialização autônoma do projeto pelo agente Antigravity a partir do link do repositório.

### Contexto do Ecossistema
→ **`GEMINI.md`** (`/home/dorneles/projects/GEMINI.md`) — Mapa completo dos projetos, arquitetura compartilhada e projeto de referência (CSM).

### Regras de Desenvolvimento
→ **`.gemini/rules.md`** — Regras condensadas e inegociáveis do Sulflux.
→ **`projects/.gemini/rules.md`** — Regras globais do ecossistema.

### Templates Obrigatórios (`.gemini/templates/`)
- `shared-schema.ts.template` — Schemas Zod + OpenAPI Registry
- `shared-types.ts.template` — Tipos `z.infer<>` exportados
- `shared-enums.ts.template` — Enums `as const`
- `backend-controller.ts.template` — Controller com safeParse + RFC 7807
- `backend-service.ts.template` — Service com Prisma + AppError
- `backend-routes.ts.template` — Routes com registerPath + ensureAuthenticated
- `frontend-hooks.ts.template` — React Query hooks consumindo `@lib/shared`

---

## Identidade do Projeto

- **Nome:** Sulflux
- **Propósito:** Gestão ambiental — métricas de sustentabilidade, hidrologia e carbono
- **Org GitHub:** `rs-talentos-ufsm`
- **Status:** 🟡 Em desenvolvimento inicial

---

## Regras Críticas (Nunca Violar)

1. **PROIBIDO TAILWIND CSS e `cn()`:** Exclusivamente **CSS Modules (`.module.css`)** e variáveis CSS em `src/styles/global.css`.
2. **PROIBIDO DADOS MOCKADOS / HARDCODED:** Todos os dados via React Query → backend real → `@lib/shared`.
3. **TypeScript modo estrito** em todos os pacotes.
4. **Schemas Zod** SEMPRE em `packages/shared` — nunca duplicados ou inline.
5. **RFC 7807** em todas as respostas de erro HTTP do backend.
6. **`registry.registerPath()`** em todas as rotas (OpenAPI obrigatório).
7. **Conventional Commits** obrigatório.
8. Todo módulo criado/alterado DEVE ter testes **Vitest**.
