# Frontend de incidencias MINSA

Panel de la plataforma de gestión de incidencias: visor, revisión, entrenamiento de la IA e indicadores, más el portal público de carga de archivos en rutas separadas. Está construido con Angular 22 (sin zonas) y Tailwind CSS 4. Habla con `minsa-incidencias-backend`.

> **Estado (v0.1.0):** proyecto base con la vista de login. Todavía no hay sesión real ni pantallas de negocio: dependen de la autenticación del backend.

## Inicio rápido

| Quiero… | Comando | Detalle |
|---|---|---|
| Levantar el sitio en Docker | `npm run docker:up` | [Ejecutar con Docker](#ejecutar-con-docker) |
| Desarrollar en local | `npm start` | [Desarrollo local](#desarrollo-local) |
| Correr las pruebas | `npm test` | [Pruebas](#pruebas) |

## Ejecutar con Docker

Un solo comando construye la imagen, levanta el contenedor y **espera hasta que el healthcheck lo marque sano**:

```bash
npm run docker:up
```

1. Ejecuta `npm run docker:up`. No necesita `.env`: es un sitio estático. Si el backend no está en `http://localhost:3033`, define `API_URL` al compilar (ver [Entornos](#entornos-y-url-del-backend)).
2. Abre `http://localhost:4010` o verifica la salud:

   ```bash
   curl http://localhost:4010/healthz
   # ok
   ```

| Comando | Qué hace |
|---|---|
| `npm run docker:up` | Construye la imagen y levanta el contenedor en segundo plano; termina cuando está sano (máximo 180 s). |
| `npm run docker:logs` | Muestra los logs del contenedor en vivo. |
| `npm run docker:down` | Detiene y elimina el contenedor. |

**Desarrollo con recarga sobre el mismo compose.** Copia `docker-compose.override.yml.example` a `docker-compose.override.yml` (ignorado por git, nunca se versiona): monta el código como volumen y corre `ng serve` dentro del contenedor, en el mismo puerto 4010.

Detalles de la imagen:

- **Base:** compila con `node:24-alpine` (Angular 22 exige Node `^24.15`) y sirve con `nginx-unprivileged`; la imagen final solo lleva el sitio compilado.
- **Seguridad:** nginx corre sin privilegios (usuario `nginx`) y envía `X-Content-Type-Options`, `X-Frame-Options: DENY` y `Referrer-Policy`.
- **Rutas del navegador:** cualquier ruta que no sea un archivo devuelve `index.html`, para que el enrutador de Angular la resuelva; `index.html` no se cachea y los archivos con hash, un año.
- **Salud:** el `HEALTHCHECK` consulta `GET /healthz`.
- **Puerto:** 4010 dentro del contenedor; `HOST_PORT` cambia el puerto publicado (por defecto 4010).
- **Configuración:** el contenedor no lee variables de entorno al arrancar. La URL del backend se fija al **compilar** la imagen con `API_URL`. HTTPS lo termina el proxy inverso del servidor.

## Desarrollo local

Requiere Node `^24.15` (campo `engines` de `package.json`). TypeScript queda en 6.0.x porque Angular 22 no admite la 7.

```bash
npm install
npm start          # http://localhost:4010 (el backend debe estar en el puerto 3033)
```

`npm start`, `npm run build` y `npm test` generan antes los archivos de entorno si faltan (ver abajo).

> **Windows con control de aplicaciones.** Si una política de Windows bloquea `esbuild.exe` o el binario nativo de Tailwind, `npm start`, `npm run build` y `npm test` no arrancan. Usa Docker (`npm run docker:up` y el override de desarrollo) o WSL. No se modifica la política. Tailwind tiene una variante WebAssembly (`npm i --force --no-save @tailwindcss/oxide-wasm32-wasi@4.3.3`) que **no debe quedar en `package.json`** porque rompe `npm ci` en otras plataformas.

## Entornos y URL del backend

El frontend llama a la API en otro origen (el backend, puerto 3033), con cookies (`withCredentials`). La URL sale de `src/environments/`:

| Archivo | ¿Se sube a git? | Cuándo se usa | `apiUrl` |
|---|---|---|---|
| `environment.example.ts` | **Sí** (la plantilla) | Origen de los dos de abajo | `http://localhost:3033` |
| `environment.development.ts` | **No** (ignorado) | `npm start` y `ng build --configuration development` | el de la plantilla |
| `environment.ts` | **No** (ignorado) | `ng build` (producción) y las pruebas | el de la plantilla; en Docker, `API_URL` |
| `environment.types.ts` | Sí | El tipo `Environment` | — |

Los dos archivos de entorno **no se versionan**: los genera `npm run env:init` (lo ejecutan solos `start`, `build` y `test`) a partir de la plantilla, solo si no existen. Así una URL de producción nunca llega al repositorio. Para otra URL en tu máquina, edita tu copia local.

Para otra URL en la imagen, compila con `API_URL` (el `Dockerfile` la escribe en `environment.ts` antes de compilar):

```bash
API_URL=https://api-gestion.minsa.gob.pe docker compose build
# o, sin compose:
docker build --build-arg API_URL=https://api-gestion.minsa.gob.pe -t minsa-incidencias-frontend .
```

Del lado del backend, ese origen del frontend debe estar en `CORS_ORIGINS`. Frontend y API deben ser del **mismo sitio** (mismo dominio registrable) para que la cookie `SameSite=Strict` viaje. Una variable nueva se agrega a `environment.types.ts` y a `environment.example.ts`.

## Estructura del proyecto

```
src/
  main.ts                      Arranque de Angular
  styles.css                   Solo importa tailwind, theme y base
  styles/
    theme.css                  Tokens (@theme): colores y fuentes
    base.css                   Valores por defecto de elementos
  environments/                URL del backend por entorno (alias @env/)
  app/
    app.ts · app.config.ts · app.routes.ts
    core/                      Infraestructura transversal (config, auth)
    shared/                    Reutilizable, sin conocimiento del negocio
      enums/ constants/ utils/ layouts/ ui/
    features/                  Un directorio por módulo (auth, inicio, ...)
scripts/
  check-reglas.mjs             Chequeo automático de las reglas
  init-env.mjs                 Genera los archivos de entorno desde la plantilla
nginx/default.conf             Servidor del sitio compilado (puerto 4010)
```

**Dependencias:** `features` usa `shared` y `core`; `core` usa `shared`; `shared` no importa de ninguna. Un módulo nunca importa de otro. Imports con el alias `@/` (apunta a `src/app/`), nunca `../`.

## Reglas

Las reglas del frontend (estilos, componentes, enums, seguridad y accesibilidad) están en el vault de Obsidian, `Base de dato/Plataforma de gestión/Frontend de gestión - Reglas y árbol de carpetas.md`. `npm run check:reglas` hace cumplir las que se pueden automatizar:

- Colores solo como tokens en `styles/theme.css`; sin hexadecimales ni valores arbitrarios de Tailwind (`text-[10px]`, `shadow-[...]`).
- Botones con el componente `Button`; iconos con el componente `Icon` (sin `<svg>` ni emojis en las vistas).
- Sin `localStorage`/`sessionStorage` (la sesión es una cookie `HttpOnly`), sin `console.*`, sin `innerHTML`, sin `style="..."`.
- Estados, tipos y variantes como `as const` en `enums/`; sus etiquetas, en `constants/`.
- El texto de una incidencia (lo escribe un ciudadano) se muestra como texto.
- **La sesión no guarda nada en el navegador:** ni token, ni roles, ni datos de la persona. Lo que puede ver o hacer el usuario lo decide el backend en cada petición.

## Pruebas

```bash
npm test               # vitest (el ejecutor por defecto de Angular 22)
npm run check:reglas   # reglas del frontend; debe terminar con 0 infracciones
npm run build          # compilación de producción
```

## Documentación relacionada

El diseño y las decisiones de la plataforma están en el vault de Obsidian, carpeta `Base de dato/Plataforma de gestión/`. El backend hermano es `minsa-incidencias-backend`.
