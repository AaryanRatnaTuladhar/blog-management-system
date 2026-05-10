.PHONY: help up down api web dev seed status

help:
	@echo Commands:
	@echo   make up      - start Postgres, Redis, and RabbitMQ with Docker
	@echo   make api     - run the NestJS backend on http://localhost:4000
	@echo   make web     - run the Next.js frontend on http://localhost:3000
	@echo   make dev     - run backend and frontend together
	@echo   make seed    - seed demo users, blogs, and comments
	@echo   make status  - check whether backend and frontend are responding
	@echo   make down    - stop Docker services

up:
	docker compose up -d

down:
	docker compose down

api:
	cd backend && npm run start:dev

web:
	cd frontend && npx next dev

dev:
	$(MAKE) -j2 api web

seed:
	cd backend && npm run seed

status:
	@powershell -NoProfile -ExecutionPolicy Bypass -Command "try { Invoke-WebRequest -UseBasicParsing http://localhost:4000/health | Out-Null; Write-Host 'backend: running at http://localhost:4000' } catch { Write-Host 'backend: not responding at http://localhost:4000' }"
	@powershell -NoProfile -ExecutionPolicy Bypass -Command "try { Invoke-WebRequest -UseBasicParsing http://localhost:3000 | Out-Null; Write-Host 'frontend: running at http://localhost:3000' } catch { Write-Host 'frontend: not responding at http://localhost:3000' }"
