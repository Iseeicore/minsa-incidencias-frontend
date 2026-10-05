import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("../src", import.meta.url));
const EXTENSIONS = new Set([".ts", ".html", ".css"]);
const ICON_FOLDER = `app${sep}shared${sep}ui${sep}icon${sep}`;
const UI_FOLDER = `app${sep}shared${sep}ui${sep}`;
const THEME_FILE = `styles${sep}theme.css`;

const RULES = [
  { id: 1, name: "svg en línea (usar el componente Icon)", pattern: /<svg/, skip: [ICON_FOLDER], ext: [".ts", ".html"] },
  { id: 2, name: "color hexadecimal (declararlo en theme.css)", pattern: /(?<!href="|&)#[0-9a-fA-F]{3,8}\b/, skip: [THEME_FILE], ext: [".ts", ".html", ".css"] },
  { id: 3, name: "valor arbitrario de Tailwind", pattern: /\b[a-z-]+-\[[^\]]+\]/, ext: [".ts", ".html"] },
  { id: 4, name: "degradado de Tailwind v3 o decorativo", pattern: /bg-gradient-|bg-linear-/, ext: [".ts", ".html"] },
  { id: 5, name: "import relativo hacia arriba (usar @/)", pattern: /from\s+["']\.\.\//, ext: [".ts"] },
  { id: 6, name: "almacenamiento del navegador (el token va en cookie HttpOnly)", pattern: /\b(localStorage|sessionStorage)\b/, ext: [".ts"], skipSpec: true },
  { id: 7, name: "console.* en el código", pattern: /\bconsole\./, ext: [".ts"], skip: ["main.ts"], skipSpec: true },
  { id: 8, name: "innerHTML (el texto del ciudadano se muestra como texto)", pattern: /innerHTML/, ext: [".ts", ".html"], skipSpec: true },
  { id: 9, name: "estilo en línea (usar clases)", pattern: /\sstyle\s*=\s*["']/, ext: [".html", ".ts"] },
  { id: 10, name: "<th class copiado (usar un arreglo de columnas)", pattern: /<th\s+class/, ext: [".html", ".ts"] },
  { id: 11, name: "<button directo (usar el componente Button)", pattern: /<button\b/, skip: [UI_FOLDER], ext: [".ts", ".html"] },
  { id: 12, name: "emoji en las vistas (usar el componente Icon)", pattern: /\p{Extended_Pictographic}/u, ext: [".ts", ".html"] },
  { id: 13, name: "!important", pattern: /!important/, ext: [".css", ".ts", ".html"] },
];

function walk(directory) {
  return readdirSync(directory).flatMap((entry) => {
    const path = join(directory, entry);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });
}

const findings = [];
for (const file of walk(ROOT)) {
  const extension = file.slice(file.lastIndexOf("."));
  if (!EXTENSIONS.has(extension)) continue;
  const path = relative(ROOT, file);
  const isSpec = path.endsWith(".spec.ts");
  const lines = readFileSync(file, "utf8").split(/\r?\n/);

  for (const rule of RULES) {
    if (!rule.ext.includes(extension)) continue;
    if (rule.skip?.some((fragment) => path.includes(fragment))) continue;
    if (rule.skipSpec && isSpec) continue;
    lines.forEach((line, index) => {
      if (rule.pattern.test(line)) {
        findings.push(`${path}:${index + 1}  [${rule.id}] ${rule.name}`);
      }
    });
  }
}

if (findings.length > 0) {
  console.error(findings.join("\n"));
  console.error(`\n${findings.length} infracciones de las reglas del frontend.`);
  process.exit(1);
}
console.log("check:reglas sin infracciones");
