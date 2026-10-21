# ==============================================================
# QUIMICORP TALENT — Evaluación Comercial
# Multi-stage Dockerfile para despliegue unificado (Vite + Express)
# ==============================================================

# --------------------------------------------------------------
# ETAPA 1: Compilación del Frontend (React + TypeScript + Tailwind)
# --------------------------------------------------------------
FROM node:22-alpine AS client-builder
WORKDIR /app/client

# Instalar dependencias con caché optimizada
COPY client/package*.json ./
RUN npm ci

# Copiar código fuente y compilar bundle de producción
COPY client ./
RUN npm run build

# --------------------------------------------------------------
# ETAPA 2: Entorno de Producción y Servidor API (Node.js + Express)
# --------------------------------------------------------------
FROM node:22-alpine AS runner
WORKDIR /app

# Variables de entorno
ENV NODE_ENV=production
ENV PORT=1234

# Instalar dependencias del backend
COPY server/package*.json ./server/
RUN cd server && npm ci

# Copiar código fuente del servidor
COPY server ./server

# Copiar bundle web compilado de la Etapa 1
COPY --from=client-builder /app/client/dist ./client/dist

# Exponer puerto configurado (1234)
EXPOSE 1234

WORKDIR /app/server

# Healthcheck para monitoreo del contenedor
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:1234/api/health || exit 1

# Comando de arranque
CMD ["npm", "start"]
