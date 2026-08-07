# Arquitetura do Sistema: Visão Técnica e Integração

Este documento detalha a arquitetura de alto nível do ecossistema. Ele explica conceitualmente como as camadas de **Backend**, **Frontend** e **Shared** operam individualmente e como se unem para formar um sistema coeso, fortemente tipado e escalável.

## 🏗️ Padrão do Projeto: Monorepo por Acoplamento (Git Submodules)

A infraestrutura utiliza o padrão de **Monorepo**, mas ao invés de um único repositório massivo, adota a estratégia de **Git Submodules**. Isso significa que o repositório principal atua como um "orquestrador", vinculando repositórios independentes em uma única árvore de diretórios lógica.

### A Estrutura Lógica

* **Raiz (`/`)**: Contém os arquivos de orquestração global (`Makefile`, `.gitmodules`, `package-lock.json`). É o controle mestre da infraestrutura.
* **`apps/`**: Onde residem as aplicações que rodam ativamente (possuem portas e processos em execução).
* `backend/`: A API do sistema.
* `frontend/`: A interface do usuário.


* **`packages/`**: Onde residem as bibliotecas internas que não rodam sozinhas, mas fornecem a fundação para os `apps`.
* `shared/`: O pacote de contratos globais.

* **Isolamento Total:** Cada submódulo é um repositório Git independente. Eles possuem seus próprios arquivos de configuração, histórico de commits e dependências. O repositório principal apenas referencia um commit específico de cada submódulo, garantindo que as mudanças em um módulo não afetem os outros sem controle explícito.
---

## 🔗 O Elo de Ligação: O Pacote `Shared`

O diretório `@lib/shared` é a **Fonte Única de Verdade (Single Source of Truth)** do sistema. Ele existe para eliminar completamente a dessincronização entre o que o Backend espera receber e o que o Frontend envia.

* **O que ele contém?** Contratos de API, tipos literais do TypeScript, e schemas de validação usando **Zod**.
* **Como ele funciona?** Ele roda um processo de compilação contínua (`tsc --watch`). Sempre que um desenvolvedor altera uma regra de negócio ou um tipo no `shared`, os arquivos são transpilados para a pasta `dist/`.
* **A Mágica da Tipagem E2E (End-to-End):** O `package.json` tanto do Frontend quanto do Backend importam o shared localmente (`"@lib/shared": "*"`). Isso significa que as duas pontas consomem exatamente a mesma pasta `dist/`. Se um campo como `telefone` se tornar obrigatório no banco de dados, o TypeScript acusará erro imediato no formulário do Frontend antes mesmo de rodar o código.

---

## ⚙️ Backend: O Núcleo de Processamento

O Backend (`apps/backend`) é desenhado para ser uma API RESTful de altíssima performance, isolada em seu próprio container Docker.

* **Stack Principal:** Node.js, Express 5, Prisma ORM 7, PostgreSQL.
* **Fluxo de Integração com o Shared:**
1. A requisição HTTP chega na rota.
2. Um middleware de validação intercepta a requisição e aplica o Schema do Zod (importado do `shared`).
3. Se a requisição for inválida, é rejeitada na porta. Se for válida, o TypeScript herda os tipos inferidos pelo Zod (`z.infer`), garantindo que o Controller trabalhe com dados 100% seguros.
4. O Prisma salva os dados no PostgreSQL de forma tipada.


* **Documentação Viva:** Através do `@asteasolutions/zod-to-openapi`, o Backend lê os schemas do `shared` e gera o **Swagger UI** (`/api-docs`) automaticamente. A documentação nunca fica defasada em relação ao código.

---

## 💻 Frontend: A Interface Reativa

O Frontend (`apps/frontend`) consome o Backend, mas não confia cegamente nele. Ele espelha as regras de negócio usando os mesmos contratos.

* **Stack Principal:** React 19, Vite, Zustand, React Query.
* **Fluxo de Integração com o Shared e Backend:**
1. O usuário preenche um formulário. O Frontend usa o Schema do Zod (do `shared`) para validar os campos *antes* de enviar para a rede (Client-side Validation).
2. O React Query dispara a requisição. O tipo de retorno esperado (`Response`) e o corpo enviado (`Payload`) são tipados usando as interfaces do `shared`.
3. O estado global (Zustand) armazena os dados processados para consumo da interface.
4. O Frontend exibe os dados de forma reativa, sabendo que eles estão 100% alinhados com o que o Backend espera e retorna.
* **Desacoplamento Visual:** O Frontend não tem acesso direto ao código do Backend, apenas aos contratos do `shared`. Ele é forçado a seguir as regras de negócio definidas ali, mas não pode acessar a implementação interna do servidor.

---

## 🔄 Como Tudo se Junta e Funciona (Runtime vs. Compile Time)

É fundamental entender a diferença de como esses três módulos conversam durante o desenvolvimento versus quando a aplicação está rodando:

### 1. Tempo de Desenvolvimento (Compile Time)

Eles são **fortemente acoplados**. O TypeScript une as três pastas através das configurações de referências (aliases/exports). O Editor (VS Code) lê as pastas como um único ecossistema. Modificar o `shared` quebra intencionalmente o `front` e o `back` caso haja incompatibilidade.

### 2. Tempo de Execução (Runtime)

Eles são **totalmente isolados**.

* O **Frontend** roda em um servidor Vite (ou é servido estaticamente em produção).
* O **Backend** roda em um processo Node/Express dentro de um container Docker.
* O **Shared** *não roda*. Ele já foi compilado e suas regras já foram absorvidas pelo Front e Back durante o processo de build.
* A comunicação real entre a tela e o banco de dados ocorre exclusivamente através de chamadas HTTP/REST passando pela rede.

A orquestração visual e de inicialização de todos esses processos simultâneos é gerenciada pelo **Makefile** presente na raiz do monorepo, subindo o banco, a API e o servidor de desenvolvimento com um único comando.