FROM node:20-alpine AS base

# Install OpenSSL for Prisma
RUN apk add --no-cache openssl

WORKDIR /app

# Copy root package files
COPY package.json package-lock.json ./
COPY packages/shared/package.json ./packages/shared/
COPY apps/api/package.json ./apps/api/

# Install dependencies
RUN npm ci --workspace=packages/shared --workspace=apps/api --include-workspace-root

# Copy source code
COPY packages/shared/ ./packages/shared/
COPY apps/api/ ./apps/api/
COPY tsconfig.base.json ./

# Generate Prisma client
RUN cd apps/api && npx prisma generate

# Build shared package
RUN npm run build:shared

# Build API
RUN cd apps/api && npx tsc

# Production stage
FROM node:20-alpine AS production

# Install OpenSSL for Prisma runtime
RUN apk add --no-cache openssl

WORKDIR /app

COPY --from=base /app/package.json /app/package-lock.json ./
COPY --from=base /app/packages/shared/package.json ./packages/shared/
COPY --from=base /app/apps/api/package.json ./apps/api/

RUN npm ci --workspace=packages/shared --workspace=apps/api --include-workspace-root --omit=dev

COPY --from=base /app/packages/shared/dist/ ./packages/shared/dist/
COPY --from=base /app/packages/shared/package.json ./packages/shared/
COPY --from=base /app/apps/api/dist/ ./apps/api/dist/
COPY --from=base /app/apps/api/prisma/ ./apps/api/prisma/
COPY --from=base /app/node_modules/.prisma/ ./node_modules/.prisma/
COPY --from=base /app/node_modules/@prisma/ ./node_modules/@prisma/

ENV NODE_ENV=production
EXPOSE 3001

WORKDIR /app/apps/api
CMD ["node", "dist/index.js"]
