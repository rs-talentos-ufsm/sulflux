# ==============================================================================
# 🚀 ORQUESTRADOR CENTRAL - Sulflux (Gestão Ambiental & Sustentabilidade)
# Esteira de CI/CD 100% Local, Produção & Orquestração Docker Polyrepo
# ==============================================================================

-include .env
export

SHELL := /bin/bash
PROJECT_NAME ?= sulflux
DOCKER_BUILDKIT ?= 1
export DOCKER_BUILDKIT

.PHONY: help init install sync-dev sync-main sync-status ci-local cd-local build-shared build-all \
        dev-network dev-up dev-upd dev-down dev-reset prod-prep prod-prep-force prod-up prod-down prod-reset \
        test logs logs-back logs-front logs-minio logs-db minio-up minio-down minio-logs \
        migrate migrate-local migrate-prod seed generate prune clean-all status \
        shared-update

# ------------------------------------------------------------------------------
# 0. Menu de Ajuda & Mapeamento de Portas
# ------------------------------------------------------------------------------
help:
	@echo "====================================================================="
	@echo " 🚀 Sulflux - Plataforma de Gestão Ambiental (CI/CD Local & Produção)"
	@echo "====================================================================="
	@echo "  [MAPEAMENTO DE PORTAS LOCAIS]"
	@echo "   • Frontend:      http://localhost:5174"
	@echo "   • Backend API:   http://localhost:5001/api"
	@echo "   • Swagger UI:    http://localhost:5001/api-docs"
	@echo "   • MinIO API:     http://localhost:9005"
	@echo "   • MinIO Console: http://localhost:9021"
	@echo "   • Jaeger UI:     http://localhost:16687"
	@echo "   • PostgreSQL:    localhost:5434"
	@echo "   • OTLP gRPC:     localhost:4319"
	@echo "   • OTLP HTTP:     localhost:4320"
	@echo "  -------------------------------------------------------------------"
	@echo "  [DESENVOLVIMENTO]"
	@echo "  make sync-dev      -> Sincroniza branch 'dev' na raiz e submódulos"
	@echo "  make ci-local      -> Executa lint, typecheck e testes em toda a stack"
	@echo "  make cd-local      -> Pipeline dev: pull dev + CI + build + up + migrate"
	@echo "  make dev-upd       -> Sobe o ambiente de desenvolvimento em background"
	@echo "  make dev-up        -> Sobe em modo anexo com logs interativos"
	@echo "  make dev-down      -> Derruba os containers de desenvolvimento"
	@echo "  make dev-reset     -> Derruba containers e apaga volumes (zera o banco)"
	@echo "  -------------------------------------------------------------------"
	@echo "  [MINIO OBJECT STORAGE]"
	@echo "  make minio-up      -> Sobe apenas o container do MinIO (S3)"
	@echo "  make minio-down    -> Para o container do MinIO"
	@echo "  make minio-logs    -> Acompanha os logs do MinIO em tempo real"
	@echo "  -------------------------------------------------------------------"
	@echo "  [PRODUÇÃO]"
	@echo "  make sync-main     -> Sincroniza branch 'main' na raiz e submódulos"
	@echo "  make sync-status   -> Compara commits entre 'main' e 'dev' em toda a stack"
	@echo "  make prod-prep     -> Empacota @lib/shared para build de produção"
	@echo "  make prod-up       -> Sobe a stack unificada de produção"
	@echo "  make prod-down     -> Derruba a stack de produção"
	@echo "  make prod-reset    -> Derruba produção e remove volumes"
	@echo "  -------------------------------------------------------------------"
	@echo "  [UTILITÁRIOS]"
	@echo "  make test          -> Roda as suítes de teste Vitest em todos os módulos"
	@echo "  make logs          -> Acompanha logs de backend e frontend combinados"
	@echo "  make logs-back     -> Acompanha logs do backend"
	@echo "  make logs-front    -> Acompanha logs do frontend"
	@echo "  make logs-minio    -> Acompanha logs do MinIO"
	@echo "  make logs-db       -> Acompanha logs do PostgreSQL"
	@echo "  make migrate       -> Executa migrations do Prisma dentro do Docker"
	@echo "  make seed          -> Executa o seed do banco de dados"
	@echo "  make shared-update -> Atualiza e recompila a lib compartilhada"
	@echo "  make clean-all     -> Limpeza profunda de containers, volumes e imagens órfãs"
	@echo "====================================================================="

# ------------------------------------------------------------------------------
# 1. Inicialização e Sincronização do Ecossistema
# ------------------------------------------------------------------------------

# Sincroniza a branch 'dev' em todos os submódulos e na raiz (Ambiente Dev)
sync-dev:
	@echo "-> [Git] Atualizando orquestrador raiz na branch 'dev'..."
	@git checkout dev 2>/dev/null || git checkout -b dev
	@git pull origin dev
	@echo "-> [Git] Sincronizando e atualizando todos os submódulos na branch 'dev'..."
	@git submodule sync --recursive
	@git submodule update --init --recursive
	@git submodule foreach '(git checkout dev 2>/dev/null || git checkout -b dev) && git pull origin dev || true'
	@echo "✅ [Git] Todos os repositórios sincronizados com a branch 'dev'!"

# Sincroniza a branch 'main' em todos os submódulos e na raiz (Ambiente Produção)
sync-main:
	@echo "-> [Git] Atualizando orquestrador raiz na branch 'main'..."
	@git checkout main 2>/dev/null || git checkout -b main
	@git pull origin main
	@echo "-> [Git] Sincronizando e atualizando todos os submódulos na branch 'main'..."
	@git submodule sync --recursive
	@git submodule update --init --recursive
	@git submodule foreach 'git checkout main 2>/dev/null || git checkout -b main && git pull origin main || true'
	@echo "✅ [Git] Todos os repositórios de produção sincronizados com a branch 'main'!"

# Exibe o comparativo de commits entre a branch 'main' e 'dev' em toda a stack
sync-status:
	@echo "===================================================================="
	@echo " 📊 COMPARATIVO DE SINCRONIZAÇÃO: main (Prod) vs dev (Local/Dev)"
	@echo "===================================================================="
	@echo ">>> 1. Orquestrador Raiz (sulflux) [main..dev]:"
	@git log --oneline main..dev || echo "Sem diferenças ou branch main não mapeada."
	@echo ""
	@echo ">>> 2. Submódulo Shared (packages/shared) [main..dev]:"
	@cd packages/shared && (git log --oneline main..dev || echo "Sem diferenças.")
	@echo ""
	@echo ">>> 3. Submódulo Backend (apps/backend) [main..dev]:"
	@cd apps/backend && (git log --oneline main..dev || echo "Sem diferenças.")
	@echo ""
	@echo ">>> 4. Submódulo Frontend (apps/frontend) [main..dev]:"
	@cd apps/frontend && (git log --oneline main..dev || echo "Sem diferenças.")
	@echo ""
	@echo "===================================================================="

# PASSO 1: Baixa os códigos e prepara as cópias dos arquivos .env
init: submodule-download setup-env-files dev-network
	@echo ""
	@echo "===================================================================="
	@echo " 🚀 SUBMÓDULOS SINCRONIZADOS E ARQUIVOS .ENV PREPARADOS!"
	@echo "===================================================================="
	@echo " Próximos passos obrigatórios:"
	@echo " 1. Ajuste os arquivos .env (.env.development ou .env.production)."
	@echo " 2. Execute: make install"
	@echo " 3. Inicie o fluxo com: make dev-upd (ou make dev-up)"
	@echo "===================================================================="

# PASSO 2: Instala as dependências e prepara o pacote compartilhado
install:
	@echo "-> Instalando dependências do Shared..."
	cd packages/shared && npm install
	@echo "-> Instalando dependências do Backend..."
	cd apps/backend && npm install
	@echo "-> Instalando dependências do Frontend..."
	cd apps/frontend && npm install
	@$(MAKE) build-shared
	@echo "🎉 Dependências instaladas e Shared compilado com sucesso!"

submodule-download:
	@echo "-> Sincronizando URLs dos submódulos..."
	git submodule sync --recursive
	@echo "-> Inicializando e atualizando o código base..."
	git submodule update --init --recursive --force

setup-env-files:
	@echo "-> Preparando arquivos de ambiente..."
	@if [ -f apps/backend/.env.example ]; then \
		if [ ! -f apps/backend/.env.development ]; then \
			cp apps/backend/.env.example apps/backend/.env.development && echo "   [✓] apps/backend/.env.development criado."; \
		else \
			echo "   [i] apps/backend/.env.development já existe."; \
		fi; \
		if [ ! -f apps/backend/.env.test ]; then \
			cp apps/backend/.env.example apps/backend/.env.test && echo "   [✓] apps/backend/.env.test criado."; \
		else \
			echo "   [i] apps/backend/.env.test já existe."; \
		fi; \
	fi
	@if [ -f apps/frontend/.env.example ]; then \
		if [ ! -f apps/frontend/.env.development ]; then \
			cp apps/frontend/.env.example apps/frontend/.env.development && echo "   [✓] apps/frontend/.env.development criado."; \
		else \
			echo "   [i] apps/frontend/.env.development já existe."; \
		fi; \
	fi

# ------------------------------------------------------------------------------
# 2. CI Local (Integração Contínua: Lint, Typecheck, Testes)
# ------------------------------------------------------------------------------

# Valida shared, backend e frontend com linters, tipagem e testes
ci-local:
	@echo "===================================================================="
	@echo " 🔍 INICIANDO PIPELINE DE CI LOCAL"
	@echo "===================================================================="
	@echo "-> 1/3. Validando @lib/shared..."
	cd packages/shared && npm run lint-check && npm run build && npm run test
	@echo "-> 2/3. Validando apps/backend..."
	cd apps/backend && npm run lint-check && npm run test
	@echo "-> 3/3. Validando apps/frontend..."
	cd apps/frontend && npm run lint-check && npm run build && npm run test
	@echo "===================================================================="
	@echo " ✅ PIPELINE DE CI LOCAL: 100% APROVADA!"
	@echo "===================================================================="

# Roda apenas a suíte de testes Vitest de cada pacote
test:
	@echo "-> Testando Shared..."
	cd packages/shared && npm run test
	@echo "-> Testando Backend (com banco efêmero)..."
	cd apps/backend && npm run test
	@echo "-> Testando Frontend..."
	cd apps/frontend && npm run test
	@echo "✅ Todas as baterias de testes foram finalizadas com sucesso!"

# ------------------------------------------------------------------------------
# 3. CD Local & Orquestração Docker Dev (Docker Compose V2 + BuildKit)
# ------------------------------------------------------------------------------

# Garante que a rede central do projeto exista
dev-network:
	@docker network inspect $(PROJECT_NAME)_network >/dev/null 2>&1 || \
		(docker network create $(PROJECT_NAME)_network && echo "🌐 Rede '$(PROJECT_NAME)_network' criada com sucesso.")

# Compila os contratos do pacote compartilhado
build-shared:
	@echo "-> [Shared] Verificando contratos TypeScript..."
	@if [ -f packages/shared/node_modules/.bin/tsup ]; then \
		(cd packages/shared && npm run build); \
	elif [ -f packages/shared/dist/index.js ]; then \
		echo "ℹ️  [Shared] Artefatos compilados encontrados em packages/shared/dist. Prosseguindo..."; \
	else \
		echo "⚠️  [Shared] Compilando pacote compartilhado..."; \
		(cd packages/shared && npm run build || true); \
	fi

# Constrói as imagens Docker de Backend e Frontend usando BuildKit e Cache
build-all: build-shared dev-network
	@echo "-> [Docker] Construindo imagem do Backend com BuildKit..."
	cd apps/backend && DOCKER_BUILDKIT=1 docker compose -f docker-compose.yml -f docker-compose.dev.yml --env-file .env.development build
	@echo "-> [Docker] Construindo imagem do Frontend com BuildKit..."
	cd apps/frontend && DOCKER_BUILDKIT=1 docker compose -f docker-compose.yml -f docker-compose.dev.yml --env-file .env.development build
	@echo "✅ [Docker] Imagens de desenvolvimento construídas com sucesso!"

# Sobe os containers de desenvolvimento em background (modo daemon)
dev-upd: dev-network build-shared
	@echo "-> [Docker] Iniciando stack de desenvolvimento..."
	cd apps/backend && docker compose -f docker-compose.yml -f docker-compose.dev.yml --env-file .env.development up -d -V
	cd apps/frontend && docker compose -f docker-compose.yml -f docker-compose.dev.yml --env-file .env.development up -d -V
	@echo "🚀 Stack de desenvolvimento ativa:"
	@echo "   • Frontend:      http://localhost:5174"
	@echo "   • Backend API:   http://localhost:5001/api"
	@echo "   • Swagger UI:    http://localhost:5001/api-docs"
	@echo "   • MinIO API:     http://localhost:9005"
	@echo "   • MinIO Console: http://localhost:9021"
	@echo "   • Jaeger UI:     http://localhost:16687"
	@echo "   • PostgreSQL:    localhost:5434"

# Sobe em modo interativo com logs anexados
dev-up: dev-network build-shared
	cd apps/backend && docker compose -f docker-compose.yml -f docker-compose.dev.yml --env-file .env.development up -V & \
	cd apps/frontend && docker compose -f docker-compose.yml -f docker-compose.dev.yml --env-file .env.development up -V

# Pipeline de CD Local completa (Dev):
# Pull 'dev' -> CI Local -> BuildKit Images -> Start Daemon -> Migrations -> Prune
cd-local: sync-dev ci-local build-all dev-upd migrate prune
	@echo "===================================================================="
	@echo " 🎉 PIPELINE DE CD LOCAL FINALIZADA COM SUCESSO!"
	@echo " O ambiente local de desenvolvimento está atualizado e em execução."
	@echo "===================================================================="

# Derruba os containers de desenvolvimento
dev-down:
	cd apps/frontend && docker compose -f docker-compose.yml -f docker-compose.dev.yml --env-file .env.development down --remove-orphans
	cd apps/backend && docker compose -f docker-compose.yml -f docker-compose.dev.yml --env-file .env.development down --remove-orphans

# Zera o ambiente de desenvolvimento e apaga volumes do banco de dados
dev-reset:
	cd apps/frontend && docker compose -f docker-compose.yml -f docker-compose.dev.yml --env-file .env.development down -v --remove-orphans
	cd apps/backend && docker compose -f docker-compose.yml -f docker-compose.dev.yml --env-file .env.development down -v --remove-orphans
	@echo "🧹 Ambiente de desenvolvimento limpo e volumes resetados!"

# ------------------------------------------------------------------------------
# 4. MinIO Object Storage (Operações Isoladas)
# ------------------------------------------------------------------------------

# Sobe apenas o serviço MinIO
minio-up: dev-network
	@echo "-> [MinIO] Subindo MinIO em background..."
	cd apps/backend && docker compose -f docker-compose.yml -f docker-compose.dev.yml --env-file .env.development up -d minio
	@echo "📦 MinIO ativo:"
	@echo "   • API (S3):      http://localhost:9005"
	@echo "   • Console (UI):  http://localhost:9021"

# Para o serviço MinIO
minio-down:
	cd apps/backend && docker compose -f docker-compose.yml -f docker-compose.dev.yml --env-file .env.development stop minio

# Acompanha logs do MinIO
minio-logs:
	cd apps/backend && docker compose -f docker-compose.yml -f docker-compose.dev.yml --env-file .env.development logs -f minio

logs-minio: minio-logs

# ------------------------------------------------------------------------------
# 5. Ambiente de Produção
# ------------------------------------------------------------------------------

# Prepara o pacote compartilhado para build de produção autocontido
prod-prep:
	@if [ ! -f apps/backend/lib-shared.tgz ] || [ ! -f apps/frontend/lib-shared.tgz ]; then \
		echo "-> [Shared] Empacotando @lib/shared para os builds de produção..."; \
		(cd packages/shared && npm run build && npm pack); \
		cp packages/shared/lib-shared-*.tgz apps/backend/lib-shared.tgz; \
		cp packages/shared/lib-shared-*.tgz apps/frontend/lib-shared.tgz; \
	fi

prod-prep-force:
	@echo "-> [Shared] Forçando empacotamento do @lib/shared..."
	@(cd packages/shared && npm run build && npm pack)
	@cp packages/shared/lib-shared-*.tgz apps/backend/lib-shared.tgz
	@cp packages/shared/lib-shared-*.tgz apps/frontend/lib-shared.tgz

# Sobe a stack unificada de produção
prod-up: prod-prep
	@echo "-> [Docker] Subindo stack de produção unificada..."
	docker compose -f docker-compose.prod.yml --env-file .env.production up -d --build

# Derruba a stack de produção
prod-down:
	docker compose -f docker-compose.prod.yml --env-file .env.production down --remove-orphans

prod-reset:
	docker compose -f docker-compose.prod.yml --env-file .env.production down -v --remove-orphans
	@echo "🧹 Ambiente de produção resetado!"

# ------------------------------------------------------------------------------
# 6. Utilitários, Logs e Limpeza
# ------------------------------------------------------------------------------

logs:
	cd apps/backend && docker compose -f docker-compose.yml -f docker-compose.dev.yml --env-file .env.development logs -f & \
	cd apps/frontend && docker compose -f docker-compose.yml -f docker-compose.dev.yml --env-file .env.development logs -f

logs-back:
	cd apps/backend && docker compose -f docker-compose.yml -f docker-compose.dev.yml --env-file .env.development logs -f backend

logs-front:
	cd apps/frontend && docker compose -f docker-compose.yml -f docker-compose.dev.yml --env-file .env.development logs -f frontend

logs-db:
	cd apps/backend && docker compose -f docker-compose.yml -f docker-compose.dev.yml --env-file .env.development logs -f db

status:
	@echo "--- Orquestrador ---"
	@git status -s
	@echo "--- Submódulos ---"
	@git submodule status

migrate:
	@echo "-> [Prisma] Aplicando migrations no banco de dados de desenvolvimento..."
	@cd apps/backend && docker compose -f docker-compose.yml -f docker-compose.dev.yml --env-file .env.development exec -T backend npx prisma migrate deploy || npm run db-migrate-dev

migrate-prod:
	@echo "-> [Prisma] Aplicando migrations de produção..."
	@docker compose -f docker-compose.prod.yml --env-file .env.production exec -T backend npx prisma migrate deploy || docker exec -T sulflux_backend_prod npx prisma migrate deploy

seed:
	@echo "-> [Prisma] Executando seed inicial no banco de desenvolvimento..."
	@cd apps/backend && docker compose -f docker-compose.yml -f docker-compose.dev.yml --env-file .env.development exec -T backend npx tsx prisma/seed.ts --force

seed-prod:
	@echo "-> [Prisma] Executando seed de produção..."
	@docker compose -f docker-compose.prod.yml --env-file .env.production exec -T backend node dist/seed.js || docker exec -T sulflux_backend_prod node dist/seed.js



migrate-local:
	cd apps/backend && npm run db-migrate-dev

generate:
	cd apps/backend && npm run prisma-generate

shared-update:
	cd packages/shared && npm run build
	cd apps/backend && npm update @lib/shared
	cd apps/frontend && npm update @lib/shared

# Limpa imagens dangling geradas por builds sucessivos
prune:
	@echo "-> [Docker] Limpando imagens dangling e caches órfãos..."
	@docker image prune -f

# Limpeza completa e profunda
clean-all: dev-down prune
	@echo "🧹 Limpeza completa concluída."