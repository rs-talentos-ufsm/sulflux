# ==============================================================================
# ORQUESTRADOR CENTRAL - MAKEFILE
# ==============================================================================

.PHONY: init dev-up dev-upd dev-down dev-reset prod-up prod-down test status logs-back logs-front

# ------------------------------------------------------------------------------
# 1. Inicialização do Ecossistema
# ------------------------------------------------------------------------------

# PASSO 1: Baixa os códigos e prepara as cópias dos arquivos .env
init: submodule-download setup-env-files
	@echo ""
	@echo "===================================================================="
	@echo " 🚀 SUBMÓDULOS SINCRONIZADOS E ARQUIVOS .ENV PREPARADOS!"
	@echo "===================================================================="
	@echo " Próximos passos obrigatórios antes de rodar o projeto:"
	@echo " 1. Configure as variáveis de ambiente locais que foram criadas em:"
	@echo "    -> apps/backend/.env.development"
	@echo "    -> apps/backend/.env.test"
	@echo "    -> apps/frontend/.env.development"
	@echo " 2. Após ajustar os arquivos, execute o comando para instalar tudo:"
	@echo "    make install"
	@echo "===================================================================="

# PASSO 2: Instala as dependências (Só deve ser rodado APÓS configurar os .env)
install:
	@echo "-> Instalando dependências do Shared..."
	cd packages/shared && npm install
	@echo "-> Instalando dependências do Backend..."
	cd apps/backend && npm install
	@echo "-> Instalando dependências do Frontend..."
	cd apps/frontend && npm install
	@echo "🎉 Tudo pronto! Agora você pode rodar 'make dev-up' ou 'make test'."

# --- Tarefas Auxiliares Internas ---

submodule-download:
	git submodule update --init --recursive
	@echo "-> Códigos dos submódulos sincronizados."
	git submodule update --remote --merge
	@echo "-> Códigos dos submódulos atualizados com o remoto."

update:
	@echo "-> Atualizando o orquestrador (raiz)..."
	git pull
	@echo "-> Puxando os commits mais recentes dos submódulos..."
	git submodule update --remote --merge
	@echo "🎉 Ecossistema atualizado com sucesso!"

setup-env-files:
	@echo "-> Preparando arquivos de ambiente..."
	@if [ -f apps/backend/.env.example ]; then \
		if [ ! -f apps/backend/.env.development ]; then \
			cp apps/backend/.env.example apps/backend/.env.development && echo "   [✓] apps/backend/.env.development criado."; \
		else \
			echo "   [i] apps/backend/.env.development já existe."; \
		fi \
	else \
		echo "   [!] Alerta: apps/backend/.env.example não encontrado!"; \
	fi
	@if [ -f apps/backend/.env.example ]; then \
		if [ ! -f apps/backend/.env.test ]; then \
			cp apps/backend/.env.example apps/backend/.env.test && echo "   [✓] apps/backend/.env.test criado."; \
		else \
			echo "   [i] apps/backend/.env.test já existe."; \
		fi \
	else \
		echo "   [!] Alerta: apps/backend/.env.test não encontrado!"; \
	fi
	@if [ -f apps/frontend/.env.example ]; then \
		if [ ! -f apps/frontend/.env.development ]; then \
			cp apps/frontend/.env.example apps/frontend/.env.development && echo "   [✓] apps/frontend/.env.development criado."; \
		else \
			echo "   [i] apps/frontend/.env.development já existe."; \
		fi \
	else \
		echo "   [!] Alerta: apps/frontend/.env.example não encontrado!"; \
	fi
	
# ------------------------------------------------------------------------------
# 2. Ambiente de Desenvolvimento (Docker)
# ------------------------------------------------------------------------------

# Sobe o Frontend e Backend em modo anexo (mostrando logs combinados no terminal)
dev-up:
	cd apps/backend && npm run dev-up & \
	cd apps/frontend && npm run dev-up

# Sobe o Frontend e Backend em modo daemon (background) com força de build
dev-upd:
	cd apps/backend && npm run dev-upd
	cd apps/frontend && npm run dev-upd
	@echo "Ambiente de desenvolvimento rodando em background!"

# Derruba os containers de desenvolvimento de ambos os projetos
dev-down:
	cd apps/backend && npm run dev-down
	cd apps/frontend && npm run dev-down

# Limpa os containers de dev e apaga os volumes do banco de dados (Zera o estado)
dev-reset:
	cd apps/backend && npm run dev-reset
	cd apps/frontend && npm run dev-reset
	@echo "Ambiente de desenvolvimento limpo e volumes apagados!"

# ------------------------------------------------------------------------------
# 3. Ambiente de Produção (Docker)
# ------------------------------------------------------------------------------

# Sobe a stack completa simulando ambiente de produção
prod-up:
	cd apps/backend && npm run prod-up
	cd apps/frontend && npm run prod-up
	@echo "Stack de produção rodando em background!"

# Derruba a stack de produção
prod-down:
	cd apps/backend && npm run prod-down
	cd apps/frontend && npm run prod-down

# ------------------------------------------------------------------------------
# 4. Qualidade e Testes
# ------------------------------------------------------------------------------

# Dispara as baterias de testes isoladas de cada repositório sequencialmente
# Ambos sobem seus bancos de teste dedicados, rodam os testes e derrubam o banco no final
test:
	@echo "Iniciando testes do Shared..."
	cd packages/shared && npm run test
	@echo "Iniciando testes do Backend..."
	cd apps/backend && npm run test
	@echo "Iniciando testes do Frontend..."
	cd apps/frontend && npm run test
	@echo "Todas as baterias de testes foram finalizadas!"

# ------------------------------------------------------------------------------
# 5. Utilitários e Logs
# ------------------------------------------------------------------------------

# Monitora em tempo real os logs do container do Backend
logs-back:
	cd apps/backend && npm run log

# Monitora em tempo real os logs do container do Frontend
logs-front:
	cd apps/frontend && npm run log

# Monitora em tempo real os logs combinados do Backend e Frontend (modo anexo)
watch-front:
	docker compose -f apps/frontend/docker-compose.yml -f apps/frontend/docker-compose.dev.yml --env-file apps/frontend/.env.development watch

# Verifica o status atual de modificações e commits de cada submódulo
status:
	git submodule status

# ------------------------------------------------------------------------------
# 6. Migrações de Banco de Dados
# ------------------------------------------------------------------------------
# Roda a migration dentro do container Docker (ideal se o banco roda via Docker)
migrate:
	cd apps/backend && npm run docker-migrate

# Roda a migration na sua máquina local apontando para o banco de desenvolvimento
migrate-local:
	cd apps/backend && npm run db-migrate-dev

# Atualiza o Prisma Client no Docker caso mude algo no schema
generate:
	cd apps/backend && npm run docker-generate

# Cria a migration no Docker sem aplicar no banco 
# (útil para gerar o arquivo de migration)
migrate-create-only:
	cd apps/backend && npm run docker-migrate-create-only

migrate-reset:
	cd apps/backend && npm run docker-migrate-reset

# ------------------------------------------------------------------------------
# 7. Shared Library
# ------------------------------------------------------------------------------
# Atualiza a lib compartilhada (Shared) e gera os tipos
shared-update:
	cd apps/backend && npm update @lib/shared
	cd apps/frontend && npm update @lib/shared