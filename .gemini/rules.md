# Regras do Agente — Sulflux

> Regras globais do ecossistema também se aplicam: `/home/dorneles/projects/.gemini/rules.md`

## 1. Regras de Código (NUNCA VIOLAR)

- **PROIBIDO TAILWIND CSS e `cn()`:** O projeto usa **exclusivamente CSS Modules (`.module.css`)** com variáveis CSS nativas em `src/styles/global.css`.
- **PROIBIDO DADOS MOCKADOS / HARDCODED:** Todos os dados vêm 100% dos hooks do React Query consumindo endpoints reais do backend e schemas do `@lib/shared`. Se um endpoint, contrato ou modelo não existir, crie-o de ponta a ponta.
- **TypeScript Estrito:** Modo estrito ativado em todos os pacotes — nunca use `any` implícito.
- **Schemas Zod Únicos:** Todos os schemas Zod, tipos inferidos (`z.infer<>`) e enums devem residir **obrigatoriamente em `packages/shared`**.
- **RFC 7807:** Todas as respostas de erro HTTP da API backend (400, 401, 403, 404, 500) seguem rigorosamente a especificação RFC 7807.
- **OpenAPI Registry:** Toda rota do backend deve ser registrada no `registry.registerPath()` do `@asteasolutions/zod-to-openapi`.
- **Tratamento de Erros no Backend:** Sempre repassar erros para o middleware com `next(error)`. Nunca engolir erros.
- **Clean Architecture no Backend:** `Controller (safeParse e resposta HTTP) → Service (regras de negócio e Prisma) → Database`.

## 2. Fluxo de Trabalho para Novos Recursos

Ordem obrigatória de implementação:
1. `packages/shared` → Criar `<recurso>.schemas.ts`, `<recurso>.types.ts`, `<recurso>.enums.ts` e exportar em `index.ts`.
2. `apps/backend/prisma/schema.prisma` → Atualizar models/enums e executar migrações.
3. `apps/backend` → Implementar `<recurso>.service.ts`, `<recurso>.controller.ts`, `<recurso>.routes.ts` com registro OpenAPI.
4. `apps/frontend` → Criar hook React Query em `src/hooks/` e componentes/páginas com **CSS Modules**.
5. Testes Vitest em todos os módulos alterados.

## 3. Commits e Branches

- Padrão Conventional Commits obrigatório (`feat:`, `fix:`, `docs:`, `refactor:`, `chore:`).
- Nunca commitar diretamente na branch `main`.
- Trabalho isolado em branches temáticas (`feat/`, `fix/`, `docs/`, `refactor/`).
- Submódulos Git: commitar e enviar commits **DENTRO da pasta do submódulo primeiro** antes de atualizar o ponteiro na raiz.

## 4. Templates Obrigatórios

Ao criar qualquer arquivo novo de módulo ou entidade, consulte e siga os templates em `.gemini/templates/`:
- `shared-schema.ts.template` — Schemas Zod com registro OpenAPI
- `shared-types.ts.template` — Tipos TypeScript inferidos e exportados
- `shared-enums.ts.template` — Enums `as const`
- `backend-controller.ts.template` — Controller Express com safeParse e RFC 7807
- `backend-service.ts.template` — Service com Prisma Client e AppError
- `backend-routes.ts.template` — Rotas Express com registro OpenAPI e middlewares
- `frontend-hooks.ts.template` — Hooks React Query consumindo endpoints reais e `@lib/shared`

## 5. Arquivo de Contexto Principal

Para detalhes completos de arquitetura, submódulos, stack tecnológica e regras do projeto, consulte:
👉 **`GEMINI.md`** na raiz do projeto (`/home/dorneles/projects/sulflux/GEMINI.md`)

Para contexto do ecossistema completo:
👉 **`GEMINI.md`** na raiz de projects (`/home/dorneles/projects/GEMINI.md`)
