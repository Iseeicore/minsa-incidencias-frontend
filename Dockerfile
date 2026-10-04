FROM node:24-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:24-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ARG API_URL=http://localhost:3033
RUN node scripts/init-env.mjs && sed -i "s#http://localhost:3033#${API_URL}#" src/environments/environment.ts && npm run build

FROM nginxinc/nginx-unprivileged:alpine AS runtime
COPY nginx/default.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist/minsa-incidencias-frontend/browser /usr/share/nginx/html

EXPOSE 4010

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://127.0.0.1:4010/healthz || exit 1
