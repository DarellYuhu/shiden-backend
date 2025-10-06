auth-generate:
	bunx @better-auth/cli@latest generate

auth-migrate:
	bunx @better-auth/cli@latest migrate

db-generate:
	bunx prisma generate

db-migrate:
	dotenv -e .env.development -- bunx prisma migrate dev

compose-up:
	docker compose up -d

compose-down:
	docker compose down

docker-build:
	docker build -t darellyuhu/shiden-backend:latest .
