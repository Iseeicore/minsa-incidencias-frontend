import { ModuloCodigo } from "@/shared/enums/modulo-codigo.enum";
import { NAV_SECTIONS } from "./nav.config";
import { visibleNav } from "./visible-nav";

const ids = (modulos: ModuloCodigo[]) =>
  visibleNav(NAV_SECTIONS, modulos).flatMap((section) => section.entries.map((entry) => entry.id));

describe("visibleNav", () => {
  it("sin módulos deja solo las entradas que no piden módulo", () => {
    const visibles = ids([]);
    expect(visibles).toContain("dashboard");
    expect(visibles).not.toContain("casos");
    expect(visibles).not.toContain("usuarios");
  });

  it("agrega las entradas del módulo que el usuario tiene", () => {
    const visibles = ids([ModuloCodigo.INCIDENCIAS]);
    expect(visibles).toEqual(expect.arrayContaining(["casos", "bandejas", "derivaciones"]));
    expect(visibles).not.toContain("revision-ia");
  });

  it("con todos los módulos muestra todo el menú", () => {
    const todos = Object.values(ModuloCodigo);
    const total = NAV_SECTIONS.flatMap((section) => section.entries).length;
    expect(ids(todos)).toHaveLength(total);
  });

  it("quita las secciones que quedan vacías", () => {
    const secciones = visibleNav(
      [{ id: "x", label: "X", entries: [{ id: "a", label: "A", icon: "users", modulo: ModuloCodigo.USUARIOS }] }],
      [],
    );
    expect(secciones).toEqual([]);
  });
});
