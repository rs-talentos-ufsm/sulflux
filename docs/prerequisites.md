# Guia de Instalação e Configuração: Pré-requisitos e Setup

Este guia detalha os requisitos de sistema e o passo a passo exato para configurar sua máquina local para o desenvolvimento deste monorepo. O projeto foi arquitetado com base em contêineres e o uso de ambiente Linux é recomendado para garantir performance, compatibilidade de scripts e caminhos de diretório.

## 🚀 Pré-requisitos Globais

Antes de iniciar qualquer configuração, certifique-se de que sua máquina atende aos seguintes requisitos:

* **Sistema Operacional:** Linux nativo, macOS, ou **Windows 10/11 com WSL 2**.
* **Git:** Instalado e configurado com suas credenciais.
* **Docker e Docker Compose:** Essenciais para rodar os serviços isolados (Postgres, Frontend, Backend).
* **Node.js (LTS):** Necessário para rodar scripts do monorepo fora dos contêineres.

---

## 🔧 Configuração do Ambiente (Windows + WSL 2)

Se você utiliza Linux nativamente ou macOS, pode pular diretamente para o **Passo 3**.
Para usuários Windows, é recomendado o uso do WSL 2 (Windows Subsystem for Linux). Siga o roteiro abaixo.

### 1. Instalando o WSL 2 (O Sistema Operacional)

No Windows 11, o WSL é um recurso nativo e sua instalação é feita com um único comando. O WSL permite rodar um kernel Linux (Ubuntu) diretamente no seu sistema.

1. Abra o **PowerShell** ou **Terminal do Windows** como **Administrador**.
2. Execute o comando de instalação:
```bash
wsl --install

```

*(Este comando ativa os recursos necessários do Windows e baixa o Ubuntu automaticamente).*
3. **Reinicie o seu computador** (se o terminal solicitar).
4. Após reiniciar, procure por "Ubuntu" no menu Iniciar. Ao abrir pela primeira vez, a instalação será concluída e solicitará que você crie seu **username** (usuário) e **password** (senha) para o ambiente Linux. *(Nota: Ao digitar a senha no terminal, os caracteres não aparecerão na tela. Isso é padrão no Linux. Apenas digite e pressione Enter).*

### 2. Instalando o Docker Desktop (O Motor de Contêineres)

O Docker precisa estar integrado ao WSL que acabamos de instalar.

1. Baixe e instale o [Docker Desktop para Windows](https://www.docker.com/products/docker-desktop/).
2. Durante o processo de instalação, certifique-se de marcar a opção: **✅ Use WSL 2 instead of Hyper-V** (Recomendado).
3. Após a instalação, o Docker pedirá para reiniciar ou deslogar ("Close and log out"). Confirme.
4. Ao abrir o Docker Desktop pela primeira vez, aceite os termos. Você pode pular (skip) o login se desejar.
5. Vá em **Settings (ícone de engrenagem no topo direito)**:
* Na aba `General`, certifique-se de que a opção **"Use the WSL 2 based engine"** esteja marcada.
* Navegue até **`Resources` > `WSL Integration**`.
* Ative a chave ao lado da sua distribuição instalada (geralmente `Ubuntu`).

6. Clique em **Apply & Restart**.

---

## ⚙️ Configuração de Dependências Locais

### 3. Instalando o Node.js via NVM (Node Version Manager)

Você precisa de uma instalação limpa do Node.js rodando *dentro* do seu Linux.

1. Instale o NVM executando o script oficial:
```bash
wget -qO- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash

```

2. Carregue as variáveis de ambiente do NVM no terminal atual (ou reinicie o terminal):
```bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"

```

3. Instale a versão LTS mais recente do Node.js:
```bash
nvm install --lts

```

4. Defina essa versão como a padrão para o sistema:
```bash
nvm use --lts

```

5. Verifique se a instalação foi bem-sucedida e se o comando aponta para o Linux:
```bash
which npm

```

> ✅ **Correto:** Algo como `/home/seu-usuario/.nvm/versions/node/v.../bin/npm`
> ❌ **Errado:** `/mnt/c/Program Files/nodejs/npm` (Se aparecer isso, você está usando o Node do Windows. Revise os passos do NVM).

### 4. Instalando o Make (Gerenciador de Tarefas)
O Make é uma ferramenta de automação que usamos para simplificar comandos complexos. Ele é nativo em sistemas Linux, mas no Windows via WSL, pode ser necessário instalá-lo manualmente.

1. No terminal do WSL, execute:
```bash
sudo apt update
sudo apt install build-essential -y
```

2. O orquestrador make
```bash
sudo apt install make -y
```

3. Verifique a instalação:
```bash
make --version
```

> ✅ **Correto:** Deverá exibir a versão do Make instalada.
> ❌ **Errado:** Comando não encontrado ou erro de permissão.
