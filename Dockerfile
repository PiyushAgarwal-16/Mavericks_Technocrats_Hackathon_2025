# Multi-service Dockerfile for ZeroTrace
# This builds the backend service

FROM node:18-alpine AS builder

WORKDIR /app/backend

# Copy backend package files
COPY backend/package*.json ./
# Install ALL dependencies (including devDependencies) for build
RUN npm install

# Copy backend source
COPY backend/ ./
RUN npm run build

# Clean dev dependencies after build
RUN npm prune --omit=dev

# Production stage
FROM node:18-alpine

WORKDIR /app

ENV NODE_ENV=production

# Copy built backend
COPY --from=builder /app/backend/dist ./dist
COPY --from=builder /app/backend/node_modules ./node_modules
COPY --from=builder /app/backend/package*.json ./

# Create keys directory
RUN mkdir -p /app/keys

EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=3s --start-period=40s \
  CMD node -e "require('http').get('http://localhost:5000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

CMD ["node", "dist/index.js"]
