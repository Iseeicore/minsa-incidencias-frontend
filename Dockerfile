FROM node:24-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:24-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ARG API_URL=http://localhost:3033
ARG PLAZO_ATENCION_DIAS=3
ARG PLAZO_VIGENCIA_RESOLUCION_DIAS=3
ARG PLAZO_AVISO_HORAS=24
ARG WHATSAPP_NUMERO=51944023973
RUN node scripts/init-env.mjs \
  && sed -i "s#http://localhost:3033#${API_URL}#" src/environments/environment.ts \
  && sed -i "s#atencionDias: 3,#atencionDias: ${PLAZO_ATENCION_DIAS},#" src/environments/environment.ts \
  && sed -i "s#vigenciaResolucionDias: 3,#vigenciaResolucionDias: ${PLAZO_VIGENCIA_RESOLUCION_DIAS},#" src/environments/environment.ts \
  && sed -i "s#avisoHoras: 24,#avisoHoras: ${PLAZO_AVISO_HORAS},#" src/environments/environment.ts \
  && sed -i "s#numero: \"51944023973\",#numero: \"${WHATSAPP_NUMERO}\",#" src/environments/environment.ts \
  && npm run build

FROM nginxinc/nginx-unprivileged:alpine AS runtime
COPY nginx/default.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist/minsa-incidencias-frontend/browser /usr/share/nginx/html

EXPOSE 4010

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://127.0.0.1:4010/healthz || exit 1
