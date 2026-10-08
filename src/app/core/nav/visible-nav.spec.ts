import { VistaCodigo } from "@/shared/enums/vista-codigo.enum";
import { NAV_SECTIONS } from "./nav.config";
import { visibleNav } from "./visible-nav";

const ids = (vistas: VistaCodigo[]) =>
  visibleNav(NAV_SECTIONS, vistas).flatMap((section) => section.entries.map((entry) => entry.id));

describe("visibleNav", () => {
  it("sin vistas no muestra nada: las entradas sin pantalla nunca se ven", () => {
    expect(ids([])).toEqual([]);
    expect(visibleNav(NAV_SECTIONS, [])).toEqual([]);
  });

  it("oculta las entradas sin pantalla aunque el rol tenga todas las vistas, y sus secciones", () => {
    const secciones = visibleNav(NAV_SECTIONS, Object.values(VistaCodigo));
    const visibles = secciones.flatMap((section) => section.entries.map((entry) => entry.id));
    for (const id of ["revision-ia", "dataset", "modelos", "etiquetas", "usuarios", "evidencias", "auditoria"]) {
      expect(visibles).not.toContain(id);
    }
    expect(secciones.map((section) => section.id)).toEqual(["operacion"]);
  });

  it("una entrada sin vista se muestra solo si está implementada", () => {
    const entradas = [
      { id: "a", label: "A", icon: "users", implementada: true },
      { id: "b", label: "B", icon: "users", implementada: false },
    ] as const;
    const secciones = visibleNav([{ id: "x", label: "X", entries: entradas }], []);
    expect(secciones[0]?.entries.map((entry) => entry.id)).toEqual(["a"]);
  });

  it("agrega solo la entrada de cada vista que el usuario tiene", () => {
    const visibles = ids([VistaCodigo.INICIO, VistaCodigo.CASOS]);
    expect(visibles).toEqual(expect.arrayContaining(["dashboard", "casos"]));
    expect(visibles).not.toContain("bandejas");
    expect(visibles).not.toContain("derivaciones");
  });

  it("con todas las vistas muestra todas las entradas implementadas", () => {
    const todas = Object.values(VistaCodigo);
    const total = NAV_SECTIONS.flatMap((section) => section.entries).filter((entry) => entry.implementada).length;
    expect(ids(todas)).toHaveLength(total);
  });

  it("cada vista tiene exactamente una entrada en el menú", () => {
    const usadas = NAV_SECTIONS.flatMap((section) => section.entries)
      .map((entry) => entry.vista)
      .filter((vista) => vista !== undefined)
      .sort();
    expect(usadas).toEqual(Object.values(VistaCodigo).sort());
  });

  describe("menú de los cuatro roles (vistas que manda /auth/me)", () => {
    const TODAS = Object.values(VistaCodigo);
    const SIN_DERIVACIONES = TODAS.filter((vista) => vista !== VistaCodigo.DERIVACIONES);
    const operacion = (vistas: VistaCodigo[]) =>
      ids(vistas).filter((id) => ["dashboard", "casos", "bandejas", "derivaciones"].includes(id));

    it.each([
      ["ADMINISTRADOR", TODAS],
      ["GESTOR", TODAS],
    ])("%s ve Dashboard, Casos, Mis bandejas y Derivaciones", (_rol, vistas) => {
      expect(operacion(vistas)).toEqual(["dashboard", "casos", "bandejas", "derivaciones"]);
    });

    it.each([["OTRANS"], ["ESTABLECIMIENTO"]])("%s ve Dashboard, Casos y Mis bandejas, sin Derivaciones", (_rol) => {
      expect(operacion(SIN_DERIVACIONES)).toEqual(["dashboard", "casos", "bandejas"]);
    });
  });

  it("quita las secciones que quedan vacías", () => {
    const secciones = visibleNav(
      [{ id: "x", label: "X", entries: [{ id: "a", label: "A", icon: "users", vista: VistaCodigo.CASOS, implementada: true }] }],
      [],
    );
    expect(secciones).toEqual([]);
  });
});
