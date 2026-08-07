# Visão Geral: O Resultado Final Esperado

## 🎯 O Propósito do Projeto
Este repositório não é um sistema final de prateleira, mas sim um **Template/Boilerplate de Alta Performance baseado em Monorepo com Git Submodules**. Ele fornece uma infraestrutura base completa, extremamente moderna e totalmente orquestrada, projetada para servir como o alicerce de qualquer novo sistema ou produto de nível empresarial.

Ao invés de gastar dias ou semanas configurando bancos de dados, padrões de linting, pipelines de testes, barramentos de autenticação e comunicação entre cliente e servidor, o desenvolvedor clona este monorepo e, no primeiro dia de trabalho, já foca exclusivamente na implementação das regras de negócio.

---

## 🚀 O Que Acontece ao Rodar o Sistema?
Quando a orquestração global (via Docker e Makefile) é executada com sucesso, um ecossistema de microsserviços/aplicações passa a rodar em perfeita harmonia na máquina local:

1. **Frontend Interativo (Vite + React 19)**
   * Uma Single Page Application (SPA) ultra-rápida, operando com suporte total a *Hot Module Replacement* (HMR).
   * Estruturada nativamente com gerenciamento de rotas (`react-router-dom`), estado global unificado e limpo (`zustand`) e sincronização assíncrona inteligente com cache automático (`@tanstack/react-query`).

2. **Backend Robusto e Seguro (Express 5 + Node.js)**
   * Uma API RESTful de alta escalabilidade rodando sob a nova versão do Express 5.
   * Totalmente protegida por mecanismos de segurança como `helmet`, `express-rate-limit`, CORS customizado, senhas criptografadas com `argon2` e autenticação baseada em tokens JWT (`jsonwebtoken`) com suporte a cookies seguros (`cookie-parser`).
   * Documentação viva, interativa e padronizada gerada automaticamente na rota `/api-docs` via Swagger UI (`swagger-ui-express`) utilizando contratos Zod.
   * Sistema de observabilidade nativo com logs estruturados de alta performance (`pino`, `pino-http`) e rastreabilidade distribuída pronta para produção (`@opentelemetry/api`, `sdk-node`).

3. **Banco de Dados Relacional Orquestrado (PostgreSQL + Prisma 7)**
   * Uma instância isolada do PostgreSQL rodando em um container Docker, com todo o ciclo de vida gerenciado pelo Prisma ORM (versão 7).
   * Migrações de banco de dados (`prisma migrate dev`), geração automatizada de clientes de tipagem e acesso visual aos dados em tempo real através do Prisma Studio.

4. **O Coração do Monorepo: O Pacote Compartilhado (`@lib/shared`)**
   * Funciona como a **Fonte Única de Verdade (Single Source of Truth)** do projeto.
   * Contratos de API, tipos do TypeScript e schemas de validação com Zod são compilados e compartilhados em tempo real entre o Frontend e o Backend. 
   * Se um campo ou tipo mudar no banco de dados ou no contrato de negócio, o compilador do Frontend acusará o erro de tipagem imediatamente, prevenindo quebras em produção.

---

## ⚙️ Stack Tecnológica Detalhada

Abaixo estão listadas as ferramentas core pré-configuradas no ecossistema, extraídas diretamente da configuração estrita de dependências:

| Camada | Tecnologia | Versão Base | Papel no Ecossistema |
| :--- | :--- | :--- | :--- |
| **Monorepo** | Git Submodules | — | Isolamento de repositórios independentes com gerenciamento unificado. |
| **Shared** | Zod | 4.3.6 | Validação estrita de esquemas e geração de contratos OpenAPI. |
| **Backend** | Express | ^5.2.1 | Roteamento HTTP de última geração e middleware de aplicação. |
| **Backend** | Prisma Client & CLI | 7.8.0 | ORM de última geração para mapeamento e consultas tipadas ao banco. |
| **Backend** | OpenTelemetry | ^1.9 / ^0.218 | Coleta de métricas e rastreamento distribuído (Traces). |
| **Frontend** | React | ^19.1.1 | Construção de interfaces declarativas baseadas em componentes. |
| **Frontend** | Vite | ^7.1.7 | Ferramental de build e servidor de desenvolvimento em tempo recorde. |
| **Frontend** | React Query | ^5.90.8 | Gerenciamento de estado assíncrono e cache de requisições HTTP. |
| **Qualidade** | Vitest | ^4.0 / ^4.1 | Framework de testes unitários e de integração extremamente veloz. |
| **Qualidade** | ESLint & Prettier | v8/v9/v10 | Garantia de padronização estética e estática de todo o código fonte. |

---

## ✅ Critérios de Sucesso (O Onboarding Check)
O ambiente do desenvolvedor estará perfeitamente configurado e funcional quando os seguintes critérios forem atingidos:

* [ ] **Orquestração:** O comando global do Makefile inicializar todos os containers Docker (Frontend, Backend, PostgreSQL) sem erros de porta ou permissão.
* [ ] **Banco de Dados:** O Prisma conseguir rodar as migrations de desenvolvimento e o Prisma Studio abrir localmente exibindo as tabelas do sistema.
* [ ] **API & Contratos:** A rota `http://localhost:<porta_backend>/api-docs` expuser com sucesso a interface do Swagger UI renderizando os schemas compartilhados do Zod.
* [ ] **Integração Ponta a Ponta:** O Frontend carregar no navegador, disparar uma query via React Query para o Backend, o Backend buscar a informação no PostgreSQL e responder de forma tipada, exibindo os dados na tela de forma reativa.
* [ ] **Qualidade:** A execução dos comandos globais de teste (`test` e `test-watch`) e análise estática (`lint` e `format-check`) retornarem sucesso em todos os subdiretórios (`apps/backend`, `apps/frontend` e `packages/shared`).