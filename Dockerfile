FROM node:22-alpine AS builder

RUN apk add --no-cache openssl

WORKDIR /app

# Copy monorepo root
COPY package*.json turbo.json ./

# Copy all packages and server app
COPY packages/ ./packages/
COPY apps/server/ ./apps/server/

# Install all dependencies (resolves @repo/* as workspace packages)
RUN npm install

# Generate Prisma client
RUN npx prisma generate --schema=packages/db/prisma/schema.prisma

# Build the server (tsup bundles @repo/* inline, externalises npm deps)
RUN npm run build --workspace=server

# ── Runtime stage ──────────────────────────────────────────────────────────
FROM node:22-alpine

RUN apk add --no-cache openssl

WORKDIR /app

# Copy only what's needed at runtime
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/server/dist ./dist
COPY --from=builder /app/apps/server/package.json ./package.json
COPY --from=builder /app/packages/db/prisma ./prisma


CMD ["node", "dist/index.js"]
