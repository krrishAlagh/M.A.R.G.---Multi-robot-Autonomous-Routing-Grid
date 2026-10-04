# ─── Stage 1: Build the React frontend ───────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci --ignore-scripts

COPY . .
RUN npm run build

# ─── Stage 2: Production runtime ─────────────────────────────────────────────
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Copy only what the server needs at runtime
COPY package*.json ./
RUN npm ci --omit=dev --ignore-scripts

# Copy compiled frontend assets
COPY --from=builder /app/dist ./dist

# Copy server source (tsx will compile on-the-fly, no separate tsc step needed)
COPY server ./server
COPY tsconfig.json ./

# Expose backend port (Cloud Run maps to 8080 by default, but we read $PORT)
EXPOSE 8080

CMD ["node_modules/.bin/tsx", "server/server.ts"]
