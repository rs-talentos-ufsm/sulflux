# 🚀 Template Monorepo E2E

**Boilerplate de Alta Performance para Sistemas Escaláveis**

---

## 🎯 Sobre o Projeto

Este repositório é um **Template Base** desenhado com arquitetura de *Monorepo por Acoplamento* (via Git Submodules). Ele fornece uma infraestrutura E2E (End-to-End) fortemente tipada, unindo um Backend robusto, um Frontend reativo e um pacote Shared atuando como a "Fonte Única de Verdade" para contratos e validações.

Ideal para iniciar novos produtos sem gastar dias configurando linting, banco de dados, Docker e pipelines.

---

## 📚 Documentação Completa

Para um entendimento profundo da arquitetura e das regras do sistema, consulte nossos guias detalhados:

* [1. Visão Geral e Resultado Esperado](docs/expected_outcome.md)
* [2. Arquitetura do Monorepo](docs/architecture.md)
* [3. Pré-requisitos e Setup da Máquina](docs/prerequisites.md)
* [4. Gerenciamento de Submódulos](docs/submodules.md)
* [5. Gerenciamento com Makefile](docs/makefile.md)
* [6. Inicialização Automatizada via Antigravity / AI Agent](docs/agent-bootstrap.md)

---

## 🤖 Inicialização Rápida com o Antigravity (AI Agent)

Se você estiver utilizando o **Antigravity CLI** ou outro agente de IA, basta fornecer o link deste repositório com a seguinte instrução:

```text
Clone o repositório https://github.com/rs-talentos-ufsm/sulflux.git com todos os submódulos, configure os arquivos de ambiente a partir dos .env.example, instale as dependências, suba os containers Docker e aplique as migrations, deixando o Frontend e Backend funcionais.
```

O agente seguirá o passo a passo descrito em [`docs/agent-bootstrap.md`](docs/agent-bootstrap.md).

---

## 🚀 Quick Start Manual (Clonagem e Submódulos)

Abaixo está o passo a passo resumido para baixar a infraestrutura completa para a sua máquina local (Ubuntu/WSL).

### 1. Clonando o Monorepo com Submódulos

> **⚠️ Atenção (Usuários Windows):** Clone o projeto sempre dentro do sistema de arquivos nativo do Linux (ex: `~/projects`), nunca no `/mnt/c/` para garantir performance.

```bash
# Clone o orquestrador e todos os submódulos de uma só vez
git clone --recurse-submodules git@github.com:rs-talentos-ufsm/sulflux.git
cd sulflux
```

### 2. Inicializando os Ambientes (.env) e Rede Docker

Execute o comando de inicialização automática:

```bash
make init
```

*(O `make init` sincroniza os submódulos, copia os `.env.example` diretamente para `.env.development` com credenciais prontas para dev e cria a rede Docker `sulflux_network`).*

### 4. Boas Práticas: Atualização Diária

No dia a dia de desenvolvimento, quando a equipe atualizar o repositório, você deve garantir que a "casca" e os submódulos sejam atualizados juntos.

Sempre que fizer um pull na raiz do projeto, atualize as referências dos submódulos em seguida:

```bash
make update

```

> **Dica:** Para evitar que o Git crie commits de "detachment" acidentais, nunca faça commits diretamente na raiz do monorepo se você alterou apenas arquivos dentro dos submódulos. Faça o commit dentro da pasta do submódulo primeiro.

---

## 🐳 Infraestrutura Base

### 5. Criando a Rede Docker do Projeto

Os contêineres do ecossistema precisam se comunicar através de uma rede interna nomeada. Para criá-la, insira no terminal:

```bash
docker network create sulflux_network

```

*(Este comando é necessário apenas na primeira configuração. Depois disso, os contêineres se conectarão automaticamente a esta rede).*