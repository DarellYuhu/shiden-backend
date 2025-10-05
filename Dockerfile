FROM oven/bun:alpine AS base

FROM base AS deps
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN bunx prisma generate \
  && bun run build 

FROM base AS runner
WORKDIR /app
COPY --from=builder /app/generated ./generated
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json /app/bun.lock ./
RUN bun install --production

# Expose the application port
EXPOSE 3000

# Command to run the application
CMD ["bun", "run", "dist/main"]
