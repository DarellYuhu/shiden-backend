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
