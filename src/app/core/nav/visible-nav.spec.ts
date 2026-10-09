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
    for (const id of ["revision-ia", "dataset", "modelos", "etiquetas", "evidencias", "auditoria"]) {
      expect(visibles).not.toContain(id);
    }
    expect(secciones.map((section) => section.id)).toEqual(["operacion", "configuracion"]);
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
    expect(visibles).toEqual(expect.arrayContaining(["dashboard", "bandeja"]));
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

  describe("administrador (superadmin)", () => {
    const todas = Object.values(VistaCodigo);
    const total = NAV_SECTIONS.flatMap((section) => section.entries);

    it("ve todas las secciones y las 14 entradas, también con la sesión sin vistas", () => {
      for (const vistas of [todas, []]) {
        const secciones = visibleNav(NAV_SECTIONS, vistas, true);
        expect(secciones.map((section) => section.id)).toEqual(NAV_SECTIONS.map((section) => section.id));
        expect(secciones.flatMap((section) => section.entries)).toHaveLength(total.length);
      }
    });

    it("las entradas sin pantalla siguen marcadas como no implementadas (se dibujan en gris)", () => {
      const grises = visibleNav(NAV_SECTIONS, todas, true).flatMap((section) => section.entries.filter((entry) => !entry.implementada));
      expect(grises.map((entry) => entry.id)).toEqual([
        "revision-ia",
        "dataset",
        "modelos",
        "etiquetas",
        "competencias",
        "organismos",
        "evidencias",
        "alertas",
        "auditoria",
      ]);
    });

    it("quien no es administrador no ve las entradas sin pantalla, solo Usuarios si tiene esa vista", () => {
      expect(visibleNav(NAV_SECTIONS, todas, false).map((section) => section.id)).toEqual(["operacion", "configuracion"]);
      const sinUsuarios = todas.filter((vista) => vista !== VistaCodigo.USUARIOS);
      expect(visibleNav(NAV_SECTIONS, sinUsuarios, false).map((section) => section.id)).toEqual(["operacion"]);
    });
  });

  describe("menú de los cuatro roles (vistas que manda /auth/me)", () => {
    const TODAS = Object.values(VistaCodigo);
    const SIN_QR_NI_USUARIOS = TODAS.filter((vista) => vista !== VistaCodigo.QR && vista !== VistaCodigo.USUARIOS);
    const SIN_DERIVACIONES_QR_NI_USUARIOS = SIN_QR_NI_USUARIOS.filter((vista) => vista !== VistaCodigo.DERIVACIONES);
    const SIN_DERIVACIONES = TODAS.filter((vista) => vista !== VistaCodigo.DERIVACIONES);
    const operacion = (vistas: VistaCodigo[]) =>
      ids(vistas).filter((id) => ["dashboard", "bandeja", "derivaciones", "qr", "usuarios"].includes(id));

    it("ADMINISTRADOR ve Dashboard, Bandeja, Derivaciones, Códigos QR y Usuarios", () => {
      expect(operacion(TODAS)).toEqual(["dashboard", "bandeja", "derivaciones", "qr", "usuarios"]);
    });

    it("GESTOR ve Dashboard y Bandeja, sin Derivaciones, Códigos QR ni Usuarios", () => {
      expect(operacion(SIN_DERIVACIONES_QR_NI_USUARIOS)).toEqual(["dashboard", "bandeja"]);
    });

    it("la lista fija por rol no existe: Derivaciones aparece solo si la API manda la vista", () => {
      expect(operacion(SIN_QR_NI_USUARIOS)).toContain("derivaciones");
      expect(operacion(SIN_DERIVACIONES_QR_NI_USUARIOS)).not.toContain("derivaciones");
    });

    it("OTRANS ve Dashboard y Bandeja, sin Derivaciones, Códigos QR ni Usuarios", () => {
      expect(operacion(SIN_DERIVACIONES_QR_NI_USUARIOS)).toEqual(["dashboard", "bandeja"]);
    });

    it("ESTABLECIMIENTO ve Dashboard, Bandeja, Códigos QR y Usuarios, sin Derivaciones", () => {
      expect(operacion(SIN_DERIVACIONES)).toEqual(["dashboard", "bandeja", "qr", "usuarios"]);
    });

    it("la entrada «Usuarios» está implementada, en Configuración, y apunta a /usuarios", () => {
      const entrada = NAV_SECTIONS.find((section) => section.id === "configuracion")?.entries.find((candidata) => candidata.id === "usuarios");
      expect(entrada).toMatchObject({ label: "Usuarios", path: "/usuarios", vista: VistaCodigo.USUARIOS, implementada: true });
    });

    it("la entrada «Códigos QR» está implementada y apunta a /qr", () => {
      const entrada = NAV_SECTIONS.flatMap((section) => section.entries).find((candidata) => candidata.id === "qr");
      expect(entrada).toMatchObject({ label: "Códigos QR", path: "/qr", vista: VistaCodigo.QR, implementada: true });
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
