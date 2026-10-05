import { AccionCaso } from "@/features/casos/enums/accion-caso.enum";
import { CategoriaCaso } from "@/features/casos/enums/categoria-caso.enum";
import { EstadoCaso } from "@/features/casos/enums/estado-caso.enum";
import { RolDemo } from "@/features/casos/enums/rol-demo.enum";
import { crearCaso } from "@/features/casos/testing/caso-builder";
import { accionesPermitidas, visiblePara } from "./acciones-caso";

describe("visiblePara", () => {
  const denuncia = crearCaso({ categoria: CategoriaCaso.DENUNCIA_CORRUPCION });
  const queja = crearCaso({ categoria: CategoriaCaso.QUEJA });
  const sinCategoria = crearCaso({ categoria: null, estado: EstadoCaso.REGISTRADO });

  it("el administrador y el revisor ven todo", () => {
    for (const rol of [RolDemo.ADMINISTRADOR, RolDemo.REVISOR]) {
      expect(visiblePara(denuncia, rol)).toBe(true);
      expect(visiblePara(queja, rol)).toBe(true);
      expect(visiblePara(sinCategoria, rol)).toBe(true);
    }
  });

  it("el gestor no ve las denuncias por corrupción", () => {
    expect(visiblePara(denuncia, RolDemo.GESTOR)).toBe(false);
    expect(visiblePara(queja, RolDemo.GESTOR)).toBe(true);
    expect(visiblePara(sinCategoria, RolDemo.GESTOR)).toBe(true);
  });

  it("cada área ve solo su categoría", () => {
    expect(visiblePara(queja, RolDemo.AREA_QUEJA)).toBe(true);
    expect(visiblePara(queja, RolDemo.AREA_RECLAMO)).toBe(false);
    expect(visiblePara(denuncia, RolDemo.AREA_DENUNCIA_CORRUPCION)).toBe(true);
    expect(visiblePara(sinCategoria, RolDemo.AREA_QUEJA)).toBe(false);
  });
});

describe("accionesPermitidas", () => {
  it("el revisor puede confirmar o corregir un caso clasificado que nadie revisó", () => {
    expect(accionesPermitidas(crearCaso(), RolDemo.REVISOR)).toEqual([AccionCaso.CONFIRMAR, AccionCaso.CORREGIR]);
  });

  it("la revisión es una sola vez: ya revisado, el revisor no tiene acciones", () => {
    expect(accionesPermitidas(crearCaso({ revisadoPorHumano: true }), RolDemo.REVISOR)).toEqual([]);
  });

  it("el revisor no actúa sobre un caso aún no clasificado", () => {
    expect(accionesPermitidas(crearCaso({ estado: EstadoCaso.REGISTRADO, categoriaIa: null }), RolDemo.REVISOR)).toEqual([]);
  });

  it("el gestor deriva un caso clasificado y ya revisado", () => {
    expect(accionesPermitidas(crearCaso({ revisadoPorHumano: true }), RolDemo.GESTOR)).toEqual([AccionCaso.DERIVAR]);
  });

  it("el gestor no deriva si nadie revisó la categoría", () => {
    expect(accionesPermitidas(crearCaso(), RolDemo.GESTOR)).toEqual([]);
  });

  it("la categoría Otro no tiene área: no se puede derivar", () => {
    const otro = crearCaso({ categoria: CategoriaCaso.OTRO, revisadoPorHumano: true });
    expect(accionesPermitidas(otro, RolDemo.GESTOR)).toEqual([]);
  });

  it("el gestor no ve ni actúa sobre denuncias por corrupción", () => {
    const denuncia = crearCaso({ categoria: CategoriaCaso.DENUNCIA_CORRUPCION, revisadoPorHumano: true });
    expect(accionesPermitidas(denuncia, RolDemo.GESTOR)).toEqual([]);
  });

  it("el área toma y resuelve lo derivado de su categoría", () => {
    const derivado = crearCaso({ estado: EstadoCaso.DERIVADO, revisadoPorHumano: true });
    expect(accionesPermitidas(derivado, RolDemo.AREA_RECLAMO)).toEqual([AccionCaso.TOMAR, AccionCaso.RESOLVER]);
  });

  it("el área solo resuelve lo que ya está en gestión", () => {
    const enGestion = crearCaso({ estado: EstadoCaso.EN_GESTION, revisadoPorHumano: true });
    expect(accionesPermitidas(enGestion, RolDemo.AREA_RECLAMO)).toEqual([AccionCaso.RESOLVER]);
  });

  it("un área no actúa sobre casos de otra categoría", () => {
    const derivado = crearCaso({ estado: EstadoCaso.DERIVADO, revisadoPorHumano: true });
    expect(accionesPermitidas(derivado, RolDemo.AREA_QUEJA)).toEqual([]);
  });

  it("un caso resuelto o archivado no admite acciones de nadie", () => {
    for (const estado of [EstadoCaso.RESUELTO, EstadoCaso.ARCHIVADO]) {
      for (const rol of Object.values(RolDemo)) {
        expect(accionesPermitidas(crearCaso({ estado, revisadoPorHumano: true }), rol)).toEqual([]);
      }
    }
  });

  it("el administrador no tiene acciones del flujo diario", () => {
    expect(accionesPermitidas(crearCaso(), RolDemo.ADMINISTRADOR)).toEqual([]);
  });
});
