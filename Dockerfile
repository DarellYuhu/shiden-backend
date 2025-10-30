FROM oven/bun:alpine AS base

FROM base AS deps
WORKDIR /app
COPY package.json bun.lock prisma ./
RUN bun install --frozen-lockfile \
  && bunx prisma generate

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /generated ./generated
COPY . .
RUN bun run build
#
FROM alpine:3.22
RUN apk add libgcc libstdc++
WORKDIR /app
COPY --from=deps /generated ./generated
COPY --from=builder /app/dist ./dist

# Expose the application port
EXPOSE 3000

# Command to run the application
CMD ["./dist/main"]
