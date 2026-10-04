import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const carpeta = fileURLToPath(new URL("../src/environments/", import.meta.url));
const plantilla = readFileSync(join(carpeta, "environment.example.ts"), "utf8");

const destinos = [
  ["environment.development.ts", plantilla],
  ["environment.ts", plantilla.replace("production: false", "production: true")],
];

for (const [nombre, contenido] of destinos) {
  const ruta = join(carpeta, nombre);
  if (existsSync(ruta)) continue;
  writeFileSync(ruta, contenido);
  console.log(`creado ${nombre} desde environment.example.ts`);
}
