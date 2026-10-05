import { VistaCodigo } from "@/shared/enums/vista-codigo.enum";
import { NAV_SECTIONS } from "./nav.config";
import { visibleNav } from "./visible-nav";

const ids = (vistas: VistaCodigo[]) =>
  visibleNav(NAV_SECTIONS, vistas).flatMap((section) => section.entries.map((entry) => entry.id));

describe("visibleNav", () => {
  it("sin vistas oculta las entradas que piden una vista y deja las que aún no tienen pantalla", () => {
    const visibles = ids([]);
    expect(visibles).not.toContain("dashboard");
    expect(visibles).not.toContain("casos");
    expect(visibles).toContain("usuarios");
  });

  it("agrega solo la entrada de cada vista que el usuario tiene", () => {
    const visibles = ids([VistaCodigo.INICIO, VistaCodigo.CASOS]);
    expect(visibles).toEqual(expect.arrayContaining(["dashboard", "casos"]));
    expect(visibles).not.toContain("bandejas");
    expect(visibles).not.toContain("derivaciones");
  });

  it("con todas las vistas muestra todo el menú", () => {
    const todas = Object.values(VistaCodigo);
    const total = NAV_SECTIONS.flatMap((section) => section.entries).length;
    expect(ids(todas)).toHaveLength(total);
  });

  it("cada vista tiene exactamente una entrada en el menú", () => {
    const usadas = NAV_SECTIONS.flatMap((section) => section.entries)
      .map((entry) => entry.vista)
      .filter((vista) => vista !== undefined)
      .sort();
    expect(usadas).toEqual(Object.values(VistaCodigo).sort());
  });

  it("quita las secciones que quedan vacías", () => {
    const secciones = visibleNav(
      [{ id: "x", label: "X", entries: [{ id: "a", label: "A", icon: "users", vista: VistaCodigo.CASOS }] }],
      [],
    );
    expect(secciones).toEqual([]);
  });
});
