# 🚀 Template Monorepo E2E

**Boilerplate de Alta Performance para Sistemas Escaláveis**

---

## 🎯 Sobre o Projeto

Este repositório é um **Template Base** desenhado com arquitetura de *Monorepo por Acoplamento* (via Git Submodules). Ele fornece uma infraestrutura E2E (End-to-End) fortemente tipada, unindo um Backend robusto, um Frontend reativo e um pacote Shared atuando como a "Fonte Única de Verdade" para contratos e validações.

Ideal para iniciar novos produtos sem gastar dias configurando linting, banco de dados, Docker e pipelines.

---

## 📚 Documentação Completa

Para um entendimento profundo da arquitetura e das regras do sistema, consulte nossos guias detalhados:

* [1. Visão Geral e Resultado Esperado](https://github.com/dornelesfernando/template/tree/main/docs/expected_outcome.md)
* [2. Arquitetura do Monorepo](https://github.com/dornelesfernando/template/tree/main/docs/architecture.md)
* [3. Pré-requisitos e Setup da Máquina](https://github.com/dornelesfernando/template/tree/main/docs/prerequisites.md)
* [4. Gerenciamento de Submódulos](https://github.com/dornelesfernando/template/tree/main/docs/submodules.md)
* [5. Gerenciamento com Makefile](https://github.com/dornelesfernando/template/tree/main/docs/makefile.md)

---

## 🚀 Quick Start (Clonagem e Submódulos)

Abaixo está o passo a passo resumido para baixar a infraestrutura completa para a sua máquina local (Ubuntu/WSL).

### 1. Clonando o Monorepo Base

> **⚠️ Atenção (Usuários Windows):** Clone o projeto sempre dentro do sistema de arquivos nativo do Linux (ex: `~/projects`), nunca no `/mnt/c/` para garantir performance.

```bash
# 1. Clone a "casca" do orquestrador
git clone git@github.com:dornelesfernando/template.git

# 2. Acesse a pasta
cd template

```

### 2. Trazendo os Submódulos para o Projeto
> **⚠️ Atenção:** Leia o arquivo `docs/submodules.md` para entender o funcionamento dos submódulos e como eles se encaixam na arquitetura do monorepo.

Execute os devidos comandos para baixar o código fonte real do Frontend, Backend e Shared e, após isso, prossiga para o próximo passo.

## 📦 Gerenciamento dos Submódulos

### 3. Inicializando os Submódulos (Obrigatório no 1º Acesso)

Como este projeto utiliza a arquitetura de Monorepo orquestrado, o comando `git clone` que você executou acima baixa apenas a "casca" do repositório principal. As pastas do Frontend, Backend e Shared estarão vazias.

Para baixar o código fonte real de cada aplicação, execute dentro da pasta `template`:

```bash
make init

```

*(O Git lerá o arquivo `.gitmodules` e fará o clone automático dos repositórios corretos para dentro de `apps/frontend`, `apps/backend` e `packages/shared`).*

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