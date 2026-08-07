# Orquestrador Central: Como usar o Makefile do Monorepo

Este projeto utiliza um `Makefile` na raiz do repositório para centralizar e abstrair a complexidade de gerenciar múltiplos submódulos e contêineres Docker.

Ao invés de navegar entre as pastas `apps/backend` e `apps/frontend` para rodar scripts individuais, você utilizará comandos globais `make` para orquestrar todo o ecossistema de uma só vez.

---

## 🚀 1. Setup Inicial (Obrigatório no 1º Acesso)

Se você acabou de clonar o repositório, você precisa inicializar a arquitetura nesta exata ordem:

### Passo 1: Inicialização e Variáveis

No terminal, na raiz do projeto, execute:

```bash
make init

```

**O que este comando faz?**

1. Baixa todo o código fonte dos submódulos (Frontend, Backend e Shared) e os atualiza com a versão remota mais recente.
2. Cria automaticamente as cópias seguras dos arquivos de ambiente (`.env.development`) a partir dos `.env.example` dentro das pastas do back e do front.

> **⚠️ IMPORTANTE:** Antes de prosseguir, abra os arquivos `apps/backend/.env.development` e `apps/frontend/.env.development` e preencha as senhas e chaves secretas necessárias.

### Passo 2: Instalação de Dependências

Após configurar as suas variáveis `.env`, instale as dependências (node_modules) de todo o monorepo com um único comando:

```bash
make install

```

**O que este comando faz?**
Ele entra sequencialmente no `shared`, no `backend` e no `frontend` e roda o comando de instalação para garantir que o TypeScript possa linkar o ecossistema corretamente.

---

## 💻 2. Fluxo de Desenvolvimento Diário (Docker)

Estes são os comandos que você utilizará no seu dia a dia para codar. Eles gerenciam os contêineres de desenvolvimento e o Hot Module Replacement (HMR).

| Comando | Descrição | Comportamento |
| --- | --- | --- |
| `make dev-up` | **Sobe tudo no terminal atual** | Inicia a stack e **trava o terminal**, exibindo os logs combinados em tempo real do Front e Back. Para sair, use `Ctrl+C`. |
| `make dev-upd` | **Sobe tudo em Background (Detached)** | Inicia a stack silenciosamente em segundo plano e força o rebuild das imagens Docker. O terminal fica livre. |
| `make dev-down` | **Desliga o ambiente** | Para e remove os contêineres em execução, mas **preserva** os dados do banco de dados (Volumes). |
| `make dev-reset` | **Destruição e Limpeza (Hard Reset)** | Para a stack, remove os contêineres e **apaga os volumes do Banco de Dados**. Ideal para quando os dados estiverem corrompidos e você precisar rodar as migrations do zero. |

---

## 🧪 3. Qualidade e Testes

Para garantir que nenhuma alteração quebrou os contratos entre o front e o back, rode a bateria global:

```bash
make test

```

**O que este comando faz?**
Ele viaja por todos os pacotes (`shared` ➔ `backend` ➔ `frontend`) rodando os testes automatizados (Vitest). No backend e frontend, o script se encarrega de subir instâncias temporárias de banco de dados no Docker, rodar as rotinas e destruí-las logo em seguida de forma isolada.

---

## 🏭 4. Simulação de Produção

Se você precisar validar o build de produção (arquivos minificados, sem ferramentas de dev) na sua máquina local:

| Comando | Descrição |
| --- | --- |
| `make prod-up` | Faz o build otimizado e sobe a stack simulando exatamente o ambiente de produção em background. |
| `make prod-down` | Desliga e remove a stack de produção. |

---

## 🔍 5. Utilitários e Monitoramento

Caso você tenha subido o projeto em background (`make dev-upd`) e precise investigar algum erro, use os atalhos de monitoramento:

| Comando | Descrição |
| --- | --- |
| `make logs-back` | Abre e acompanha os logs em tempo real do contêiner do **Backend**. |
| `make logs-front` | Abre e acompanha os logs em tempo real do contêiner do **Frontend**. |
| `make status` | Exibe o status atual de modificações (`git status`) de todos os submódulos, útil para verificar se há commits pendentes no repo raiz. |