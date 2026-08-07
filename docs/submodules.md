# Guia Prático: Vinculando Repositórios ao Monorepo (Submódulos)

Este monorepo funciona como um **Template Orquestrador**. Por padrão, ele é uma "casca" vazia (não contém as pastas de código final), pois cada novo projeto ou produto criado a partir dele terá seus próprios repositórios isolados no GitHub para o Frontend, Backend e Shared.

Este documento ensina como "plugar" os repositórios do seu novo projeto para dentro deste monorepo base.

---

## 🔗 O Comando Mágico: `git submodule add`

Para baixar um repositório externo e transformá-lo em um submódulo atrelado a uma pasta específica do seu monorepo, utilizamos o comando `git submodule add`.

A sintaxe base é:

```bash
git submodule add -b <branch> <url_ssh_do_repositorio> <caminho_da_pasta>

```

---

## 🛠️ Passo a Passo: Montando o seu Ecossistema

Siga a ordem abaixo para garantir que as ferramentas de orquestração (como o `Makefile` e o Docker) encontrem as pastas nos locais exatos que eles esperam.

> **Pré-requisito:** Certifique-se de já ter criado os três repositórios vazios (ou com o código inicial) no GitHub e tenha as URLs SSH deles em mãos.

### 1. Adicionando o Pacote Shared

O pacote compartilhado deve obrigatoriamente residir dentro da pasta `packages/`. No terminal, na raiz do monorepo, execute:

```bash
git submodule add -b main git@github.com:dorneles-laboratory/pgi-proa.shared.git packages/shared

```

### 2. Adicionando o Backend

O backend da aplicação deve residir dentro da pasta `apps/`. Execute:

```bash
git submodule add -b main git@github.com:dorneles-laboratory/pgi-proa.backend.git apps/backend

```

### 3. Adicionando o Frontend

O frontend da aplicação também deve residir dentro da pasta `apps/`. Execute:

```bash
git submodule add -b main git@github.com:dorneles-laboratory/pgi-proa.frontend.git apps/frontend

```

---

## ⚙️ O que acontece nos bastidores?

Ao executar os comandos acima, o Git faz duas coisas automaticamente:

1. Faz o `git clone` dos repositórios para dentro das pastas `packages/shared`, `apps/backend` e `apps/frontend`.
2. Cria (ou atualiza) um arquivo oculto chamado **`.gitmodules`** na raiz do monorepo. Ele é o "mapa" que diz ao orquestrador de onde vêm essas pastas.

Se você abrir o arquivo `.gitmodules`, ele estará assim:

```ini
[submodule "packages/shared"]
	path = packages/shared
	url = git@github.com:sua-organizacao/seu-projeto-shared.git
	branch = main
[submodule "apps/backend"]
	path = apps/backend
	url = git@github.com:sua-organizacao/seu-projeto-backend.git
	branch = main
[submodule "apps/frontend"]
	path = apps/frontend
	url = git@github.com:sua-organizacao/seu-projeto-frontend.git
	branch = main

```

---

## 💾 Salvando a Estrutura (Commit no Orquestrador)

Após adicionar os três submódulos, o seu repositório raiz (o template) agora tem alterações pendentes: o novo arquivo `.gitmodules` e as referências das pastas.

Você precisa "salvar" esse estado arquitetural no repositório principal:

```bash
# Na raiz do monorepo
git status

# Adicione as modificações (o arquivo .gitmodules e as pastas dos apps)
git add .

# Faça o commit da estrutura
git commit -m "build: acopla submódulos do projeto [Nome do Projeto]"

# Envie para o GitHub
git push

```

🎉 **Pronto!** A partir de agora, qualquer desenvolvedor da equipe que rodar `git clone` neste orquestrador e, em seguida, rodar `make init` (ou `git submodule update --init`), receberá o código exato do seu novo projeto.