# 🤖 Guia de Inicialização Automatizada para o Antigravity (AI Agent)

> **Objetivo:** Permitir que o **Antigravity CLI** ou qualquer agente autônomo receba **apenas o link do repositório orquestrador** (`sulflux`) e configure, instale, migre e suba toda a aplicação (Frontend, Backend, Shared e Banco de Dados) de ponta a ponta, sem exigir nenhuma configuração manual do usuário.

---

## 🎯 O Prompt de Entrada do Usuário

O usuário pode simplesmente colar o prompt abaixo no chat do Antigravity:

```markdown
Aqui está o repositório do projeto: https://github.com/rs-talentos-ufsm/sulflux.git (ou git@github.com:rs-talentos-ufsm/sulflux.git).
Por favor, clone o repositório com todos os submódulos, configure todos os arquivos de ambiente (.env.development e .env.test a partir dos .env.example), instale as dependências, suba os containers Docker e execute as migrações do banco de dados, deixando o Frontend e o Backend totalmente funcionais.
```

---

## 🧠 Instruções de Execução para o Agente Antigravity

Quando você (Agente Antigravity) receber a tarefa de inicializar o Sulflux a partir do link do repositório, execute **rigorosamente a sequência abaixo**:

### Passo 1: Clonar o Orquestrador com Submódulos

Execute o clone recursivo para já baixar o repositório orquestrador e todos os 3 submódulos (`packages/shared`, `apps/backend`, `apps/frontend`):

```bash
# Se o usuário passou HTTPS ou caso não haja chaves SSH configuradas:
git clone --recurse-submodules https://github.com/rs-talentos-ufsm/sulflux.git
cd sulflux

# OU caso utilize SSH:
git clone --recurse-submodules git@github.com:rs-talentos-ufsm/sulflux.git
cd sulflux
```

> [!TIP]
> **Dica de compatibilidade SSH/HTTPS para Submódulos:**
> Se o clone foi feito via HTTPS mas o `.gitmodules` apontar para URLs SSH (`git@github.com:`), configure o Git para reescrever para HTTPS automaticamente antes de sincronizar:
> ```bash
> git config --global url."https://github.com/".insteadOf "git@github.com:"
> git submodule sync --recursive
> git submodule update --init --recursive
> ```

---

### Passo 2: Executar a Inicialização Automatizada (`make init`)

Na raiz do projeto (`sulflux/`), execute:

```bash
make init
```

**O que o `make init` faz automaticamente:**
1. **Sincroniza os Submódulos:** Baixa e atualiza as versões remotas mais recentes de `packages/shared`, `apps/backend` e `apps/frontend`.
2. **Cria os Arquivos `.env`:**
   - Copia `apps/backend/.env.example` ➔ `apps/backend/.env.development` (já pré-configurado com portas, URLs, JWT_SECRET e credenciais seguras de dev).
   - Copia `apps/backend/.env.test.example` ➔ `apps/backend/.env.test` (configurado para testes automatizados).
   - Copia `apps/frontend/.env.example` ➔ `apps/frontend/.env.development` (configurado para apontar para o backend dev na porta `5001`).
3. **Cria a Rede Docker:** Verifica se a rede `sulflux_network` existe e a cria caso necessário (`docker network create sulflux_network`).

> [!IMPORTANT]
> **Por que o `.env.development` funciona de primeira?**
> Os arquivos `.env.example` do backend e frontend já contêm valores padrão de desenvolvimento funcionais:
> - `PROJECT_NAME=sulflux`
> - `BACKEND_PORT=5001`
> - `FRONTEND_PORT=5174`
> - `DB_PORT=5434` (porta externa) / `5432` (interna do container Docker)
> - `DATABASE_URL="postgresql://user:UmaSenhaSuperSegura123@db:5432/db?schema=public"`
> - `JWT_SECRET` válido para autenticação de sessão
> O agente **não precisa pedir nenhuma variável ao usuário**.

---

### Passo 3: Instalar as Dependências (`make install`)

Instale os pacotes npm em todos os módulos na ordem correta de acoplamento:

```bash
make install
```

Este comando entra em:
1. `packages/shared` ➔ executa `npm install`
2. `apps/backend` ➔ executa `npm install`
3. `apps/frontend` ➔ executa `npm install`

---

### Passo 4: Subir os Containers Docker (`make dev-upd`)

Inicie os contêineres de desenvolvimento em background (modo daemon com rebuild garantido):

```bash
make dev-upd
```

Este comando inicia via Docker Compose:
- **`sulflux_db_dev`** (PostgreSQL 16 na porta `5434`)
- **`sulflux_jaeger_dev`** (Jaeger Tracing / OpenTelemetry nas portas `16687`, `4319`, `4320`)
- **`sulflux-backend-dev`** (Node.js Express na porta `5001`)
- **`sulflux_frontend_dev`** (React 19 Vite na porta `5174`)

---

### Passo 5: Executar Migrações e Seed do Banco de Dados

Assim que o container do banco de dados estiver saudável (aguarde ~5 a 10 segundos após o `dev-upd`), execute as migrations do Prisma:

```bash
# Aplica as migrações do Prisma dentro do contêiner Docker
make migrate
```

Caso queira popular com dados iniciais de desenvolvimento:
```bash
cd apps/backend && npm run seed
```

---

### Passo 6: Verificar a Saúde da Aplicação

O agente deve validar se todos os serviços estão respondendo corretamente:

| Serviço | URL | Status Esperado |
|---|---|---|
| **Frontend SPA** | `http://localhost:5174` | HTTP 200 (HTML da SPA React) |
| **Backend API** | `http://localhost:5001/api` | HTTP 200 |
| **Swagger UI** | `http://localhost:5001/api-docs` | HTTP 200 (OpenAPI Docs) |
| **Jaeger UI** | `http://localhost:16687` | HTTP 200 (Interface de Rastreamento) |

Para testar via linha de comando:
```bash
curl -I http://localhost:5001/api
curl -I http://localhost:5174
```

---

### Passo 7: Rodar a Bateria de Testes (Opcional, mas Recomendado)

Para garantir que a integração entre contratos, backend e frontend está íntegra:

```bash
make test
```

---

## 🛠️ Resumo em Comando Único (One-Liner para Agentes)

Caso o agente queira rodar o fluxo completo em uma única instrução encadeada após o clone:

```bash
git submodule update --init --recursive && \
make init && \
make install && \
make dev-upd && \
sleep 8 && \
make migrate
```

---

## ⚠️ Diagnóstico e Tratamento de Erros Comuns

1. **Erro: `network sulflux_network declared as external, but could not be found`**
   - **Solução:** O `make init` já roda `make setup-network`. Caso suba manualmente, execute:
     ```bash
     docker network create sulflux_network
     ```

2. **Erro de permissão no Git ao baixar submódulos (`Permission denied (publickey)`)**
   - **Causa:** O ambiente não possui chave SSH cadastrada no GitHub.
   - **Solução:** Force o Git a usar HTTPS:
     ```bash
     git config --global url."https://github.com/".insteadOf "git@github.com:"
     git submodule sync --recursive
     git submodule update --init --recursive
     ```

3. **Porta em conflito (ex: `5001`, `5174` ou `5434` já em uso)**
   - **Solução:** Verifique o processo que está ocupando a porta (`lsof -i :5001`) ou altere as portas em `apps/backend/.env.development` e `apps/frontend/.env.development`.

4. **Necessidade de Reset Completo do Banco**
   - Execute:
     ```bash
     make dev-reset
     make dev-upd
     sleep 8
     make migrate
     ```
