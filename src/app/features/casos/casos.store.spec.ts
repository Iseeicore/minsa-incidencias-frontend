import { TestBed } from "@angular/core/testing";
import { CASOS_INICIALES, CasosStore, MAX_RESOLUCION } from "@/features/casos/casos.store";
import { CategoriaCaso } from "@/features/casos/enums/categoria-caso.enum";
import { EstadoCaso } from "@/features/casos/enums/estado-caso.enum";
import { RolDemo } from "@/features/casos/enums/rol-demo.enum";
import { crearCaso } from "@/features/casos/testing/caso-builder";
import type { Caso } from "@/features/casos/types/caso.types";

describe("CasosStore", () => {
  function crearStore(casos: readonly Caso[]) {
    TestBed.configureTestingModule({ providers: [{ provide: CASOS_INICIALES, useValue: casos }] });
    return TestBed.inject(CasosStore);
  }

  const buscar = (store: CasosStore, codigo: string) => store.casos().find((caso) => caso.codigo === codigo) as Caso;

  it("empieza con el rol de gestor", () => {
    expect(crearStore([]).rol()).toBe(RolDemo.GESTOR);
  });

  it("solo expone los casos que el rol puede ver", () => {
    const store = crearStore([
      crearCaso({ codigo: "A", categoria: CategoriaCaso.QUEJA }),
      crearCaso({ codigo: "B", categoria: CategoriaCaso.RECLAMO }),
    ]);
    store.cambiarRol(RolDemo.AREA_QUEJA);
    expect(store.casos().map((caso) => caso.codigo)).toEqual(["A"]);
  });

  it("al arrancar archiva lo vencido, como el trabajo programado de la base", () => {
    const store = crearStore([crearCaso({ codigo: "VIEJO", horasDesdeLlegada: 100 })]);
    expect(buscar(store, "VIEJO").estado).toBe(EstadoCaso.ARCHIVADO);
  });

  describe("confirmar", () => {
    it("el gestor confirma: queda revisado y se anota en el historial", () => {
      const store = crearStore([crearCaso({ codigo: "A" })]);
      const resultado = store.confirmar("A");
      expect(resultado.ok).toBe(true);
      expect(buscar(store, "A").revisadoPorHumano).toBe(true);
      expect(buscar(store, "A").estado).toBe(EstadoCaso.CLASIFICADO);
      expect(buscar(store, "A").historial.at(-1)?.titulo).toBe("Categoría confirmada");
    });

    it("la revisión es una sola vez: la segunda se rechaza y no cambia nada", () => {
      const store = crearStore([crearCaso({ codigo: "A" })]);
      store.confirmar("A");
      const historial = buscar(store, "A").historial.length;
      const segunda = store.confirmar("A");
      expect(segunda.ok).toBe(false);
      expect(buscar(store, "A").historial).toHaveLength(historial);
    });
  });

  describe("corregir", () => {
    it("cambia la categoría y el área sigue a la categoría", () => {
      const store = crearStore([crearCaso({ codigo: "A", categoria: CategoriaCaso.QUEJA, categoriaIa: CategoriaCaso.QUEJA })]);
      const resultado = store.corregir("A", CategoriaCaso.RECLAMO);
      expect(resultado.ok).toBe(true);
      const caso = buscar(store, "A");
      expect(caso.categoria).toBe(CategoriaCaso.RECLAMO);
      expect(caso.categoriaIa).toBe(CategoriaCaso.QUEJA);
      expect(caso.corregida).toBe(true);
      expect(caso.revisadoPorHumano).toBe(true);
      expect(caso.historial.at(-1)?.detalle).toContain("Área de reclamos");
    });

    it("rechaza dejar la misma categoría: para eso se confirma", () => {
      const store = crearStore([crearCaso({ codigo: "A" })]);
      const resultado = store.corregir("A", CategoriaCaso.RECLAMO);
      expect(resultado).toEqual({ ok: false, error: expect.stringContaining("distinta") });
      expect(buscar(store, "A").revisadoPorHumano).toBe(false);
    });

    it("tras corregir ya no se puede volver a revisar", () => {
      const store = crearStore([crearCaso({ codigo: "A" })]);
      store.corregir("A", CategoriaCaso.QUEJA);
      expect(store.corregir("A", CategoriaCaso.OTRO).ok).toBe(false);
      expect(buscar(store, "A").categoria).toBe(CategoriaCaso.QUEJA);
    });

    it("una corrección dentro de lo que el rol ve no avisa de ningún traslado", () => {
      const store = crearStore([crearCaso({ codigo: "A" })]);
      const resultado = store.corregir("A", CategoriaCaso.QUEJA);
      expect(resultado.ok).toBe(true);
      expect(resultado.ok && resultado.mensaje).not.toContain("ya no aparece");
    });

    it("el gestor que corrige a corrupción pierde el caso de su lista y se le avisa a qué área pasó", () => {
      const store = crearStore([crearCaso({ codigo: "A" })]);
      const resultado = store.corregir("A", CategoriaCaso.DENUNCIA_CORRUPCION);
      expect(resultado.ok).toBe(true);
      expect(resultado.ok && resultado.mensaje).toContain("Área de denuncias por corrupción");
      expect(resultado.ok && resultado.mensaje).toContain("ya no aparece en tu lista");
      expect(store.casos().map((caso) => caso.codigo)).toEqual([]);

      store.cambiarRol(RolDemo.AREA_DENUNCIA_CORRUPCION);
      const caso = buscar(store, "A");
      expect(caso.categoria).toBe(CategoriaCaso.DENUNCIA_CORRUPCION);
      expect(caso.corregida).toBe(true);
      expect(caso.estado).toBe(EstadoCaso.CLASIFICADO);
    });

    it("si el área de corrupción corrige a Otro, que no tiene área, el aviso lo manda a la bandeja del gestor", () => {
      const store = crearStore([
        crearCaso({
          codigo: "A",
          categoria: CategoriaCaso.DENUNCIA_CORRUPCION,
          categoriaIa: CategoriaCaso.DENUNCIA_CORRUPCION,
        }),
      ]);
      store.cambiarRol(RolDemo.AREA_DENUNCIA_CORRUPCION);
      const resultado = store.corregir("A", CategoriaCaso.OTRO);
      expect(resultado.ok && resultado.mensaje).toContain("bandeja del gestor");
      expect(resultado.ok && resultado.mensaje).toContain("ya no aparece en tu lista");
    });

    it("el área de corrupción que corrige a queja pasa el caso al gestor", () => {
      const store = crearStore([
        crearCaso({
          codigo: "A",
          categoria: CategoriaCaso.DENUNCIA_CORRUPCION,
          categoriaIa: CategoriaCaso.DENUNCIA_CORRUPCION,
        }),
      ]);
      store.cambiarRol(RolDemo.AREA_DENUNCIA_CORRUPCION);
      const resultado = store.corregir("A", CategoriaCaso.QUEJA);
      expect(resultado.ok).toBe(true);
      expect(resultado.ok && resultado.mensaje).toContain("Área de quejas");
      expect(resultado.ok && resultado.mensaje).toContain("ya no aparece en tu lista");
      expect(store.casos()).toEqual([]);

      store.cambiarRol(RolDemo.GESTOR);
      expect(buscar(store, "A").categoria).toBe(CategoriaCaso.QUEJA);
      expect(buscar(store, "A").revisadoPorHumano).toBe(true);
    });
  });

  describe("derivar", () => {
    it("el gestor deriva un caso revisado: pasa a DERIVADO", () => {
      const store = crearStore([crearCaso({ codigo: "A", revisadoPorHumano: true })]);
      store.cambiarRol(RolDemo.GESTOR);
      const resultado = store.derivar("A");
      expect(resultado).toEqual({ ok: true, mensaje: expect.stringContaining("Área de reclamos") });
      expect(buscar(store, "A").estado).toBe(EstadoCaso.DERIVADO);
    });

    it("no se deriva un caso sin área (categoría Otro)", () => {
      const store = crearStore([crearCaso({ codigo: "A", categoria: CategoriaCaso.OTRO, revisadoPorHumano: true })]);
      store.cambiarRol(RolDemo.GESTOR);
      expect(store.derivar("A").ok).toBe(false);
      expect(buscar(store, "A").estado).toBe(EstadoCaso.CLASIFICADO);
    });
  });

  describe("tomar y resolver", () => {
    const derivado = () => crearCaso({ codigo: "A", estado: EstadoCaso.DERIVADO, revisadoPorHumano: true });

    it("el área toma el caso: pasa a EN_GESTION", () => {
      const store = crearStore([derivado()]);
      store.cambiarRol(RolDemo.AREA_RECLAMO);
      expect(store.tomar("A").ok).toBe(true);
      expect(buscar(store, "A").estado).toBe(EstadoCaso.EN_GESTION);
    });

    it("resolver exige un texto", () => {
      const store = crearStore([derivado()]);
      store.cambiarRol(RolDemo.AREA_RECLAMO);
      expect(store.resolver("A", "   ")).toEqual({ ok: false, error: "La resolución no puede estar vacía." });
      expect(buscar(store, "A").estado).toBe(EstadoCaso.DERIVADO);
    });

    it("resolver rechaza un texto demasiado largo", () => {
      const store = crearStore([derivado()]);
      store.cambiarRol(RolDemo.AREA_RECLAMO);
      expect(store.resolver("A", "x".repeat(MAX_RESOLUCION + 1)).ok).toBe(false);
    });

    it("resolver registra el texto, pasa a RESUELTO y empieza la vigencia", () => {
      const store = crearStore([derivado()]);
      store.cambiarRol(RolDemo.AREA_RECLAMO);
      const resultado = store.resolver("A", "  Se devolvió el dinero.  ");
      expect(resultado).toEqual({ ok: true, mensaje: expect.stringContaining("3 días") });
      const caso = buscar(store, "A");
      expect(caso.estado).toBe(EstadoCaso.RESUELTO);
      expect(caso.resolucion).toBe("Se devolvió el dinero.");
      expect(caso.horasDesdeResolucion).toBe(0);
    });
  });

  describe("el área de corrupción toma directo, sin derivar", () => {
    const denuncia = (parcial: Partial<Caso> = {}) =>
      crearCaso({
        codigo: "A",
        categoria: CategoriaCaso.DENUNCIA_CORRUPCION,
        categoriaIa: CategoriaCaso.DENUNCIA_CORRUPCION,
        ...parcial,
      });

    it("revisada la categoría, toma el caso clasificado y pasa a EN_GESTION", () => {
      const store = crearStore([denuncia({ revisadoPorHumano: true })]);
      store.cambiarRol(RolDemo.AREA_DENUNCIA_CORRUPCION);
      expect(store.tomar("A").ok).toBe(true);
      const caso = buscar(store, "A");
      expect(caso.estado).toBe(EstadoCaso.EN_GESTION);
      expect(caso.historial.at(-1)?.titulo).toBe("En gestión");
      expect(caso.historial.at(-1)?.detalle).toContain("sin derivar");
    });

    it("sin revisar la categoría no puede tomarlo", () => {
      const store = crearStore([denuncia()]);
      store.cambiarRol(RolDemo.AREA_DENUNCIA_CORRUPCION);
      expect(store.tomar("A")).toEqual({ ok: false, error: "No tienes permiso para esta acción sobre este caso." });
      expect(buscar(store, "A").estado).toBe(EstadoCaso.CLASIFICADO);
    });

    it("otra área no puede tomar un caso clasificado: debe esperar la derivación", () => {
      const store = crearStore([crearCaso({ codigo: "A", revisadoPorHumano: true })]);
      store.cambiarRol(RolDemo.AREA_RECLAMO);
      expect(store.tomar("A").ok).toBe(false);
      expect(buscar(store, "A").estado).toBe(EstadoCaso.CLASIFICADO);
    });

    it("flujo completo de corrupción: confirma, toma y resuelve, y todo alimenta el historial", () => {
      const store = crearStore([denuncia()]);
      store.cambiarRol(RolDemo.AREA_DENUNCIA_CORRUPCION);

      expect(store.confirmar("A").ok).toBe(true);
      expect(store.tomar("A").ok).toBe(true);
      expect(store.resolver("A", "Se remitió a Integridad.").ok).toBe(true);

      const caso = buscar(store, "A");
      expect(caso.estado).toBe(EstadoCaso.RESUELTO);
      expect(caso.historial.map((paso) => paso.titulo)).toEqual(["Categoría confirmada", "En gestión", "Resuelto"]);
    });
  });

  describe("permisos", () => {
    it("un rol sin la acción es rechazado, como haría el servidor", () => {
      const store = crearStore([crearCaso({ codigo: "A", revisadoPorHumano: true })]);
      store.cambiarRol(RolDemo.AREA_RECLAMO);
      expect(store.derivar("A")).toEqual({ ok: false, error: "No tienes permiso para esta acción sobre este caso." });
    });

    it("el administrador no puede ejecutar ninguna acción sobre los casos", () => {
      const store = crearStore([crearCaso({ codigo: "A" })]);
      store.cambiarRol(RolDemo.ADMINISTRADOR);
      expect(store.confirmar("A").ok).toBe(false);
      expect(store.corregir("A", CategoriaCaso.QUEJA).ok).toBe(false);
    });

    it("un caso inexistente se informa", () => {
      expect(crearStore([]).confirmar("NO-EXISTE")).toEqual({ ok: false, error: "No se encontró el caso." });
    });

    it("un caso fuera de la vista del rol tampoco se puede tocar", () => {
      const store = crearStore([crearCaso({ codigo: "A", categoria: CategoriaCaso.DENUNCIA_CORRUPCION, revisadoPorHumano: true })]);
      store.cambiarRol(RolDemo.GESTOR);
      expect(store.derivar("A").ok).toBe(false);
    });
  });

  it("flujo completo: el gestor confirma y deriva, el área toma y resuelve", () => {
    const store = crearStore([crearCaso({ codigo: "A" })]);

    expect(store.confirmar("A").ok).toBe(true);
    expect(store.derivar("A").ok).toBe(true);
    store.cambiarRol(RolDemo.AREA_RECLAMO);
    expect(store.tomar("A").ok).toBe(true);
    expect(store.resolver("A", "Atendido.").ok).toBe(true);

    const caso = buscar(store, "A");
    expect(caso.estado).toBe(EstadoCaso.RESUELTO);
    expect(caso.historial.map((paso) => paso.titulo)).toEqual([
      "Categoría confirmada",
      "Derivado",
      "En gestión",
      "Resuelto",
    ]);
  });
});
