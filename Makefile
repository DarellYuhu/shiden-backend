auth-generate:
	bunx @better-auth/cli@latest generate

auth-migrate:
	bunx @better-auth/cli@latest migrate

novu-start:
	bunx novu@latest dev -p 3000 -d https://nv.binili.net

db-generate:
	bunx prisma generate

db-migrate:
	dotenv -e .env.development -- bunx prisma migrate dev

db-deploy:
	bunx prisma migrate deploy

compose-up:
	docker compose up -d

compose-down:
	docker compose down

docker-build:
	docker build -t darellyuhu/shiden-backend:latest .
