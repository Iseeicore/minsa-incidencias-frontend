import { AccionCaso } from "@/features/casos/enums/accion-caso.enum";
import { CategoriaCaso } from "@/features/casos/enums/categoria-caso.enum";
import { EstadoCaso } from "@/features/casos/enums/estado-caso.enum";
import { RolDemo } from "@/features/casos/enums/rol-demo.enum";
import { crearCaso } from "@/features/casos/testing/caso-builder";
import { accionesPermitidas, visiblePara } from "./acciones-caso";

const { CONFIRMAR, CORREGIR, DERIVAR, TOMAR, RESOLVER } = AccionCaso;

describe("roles de la demostración", () => {
  it("son cinco: el revisor ya no existe", () => {
    expect(Object.values(RolDemo).sort()).toEqual([
      "ADMINISTRADOR",
      "AREA_DENUNCIA_CORRUPCION",
      "AREA_QUEJA",
      "AREA_RECLAMO",
      "GESTOR",
    ]);
  });
});

describe("visiblePara", () => {
  const denuncia = crearCaso({ categoria: CategoriaCaso.DENUNCIA_CORRUPCION });
  const queja = crearCaso({ categoria: CategoriaCaso.QUEJA });
  const otro = crearCaso({ categoria: CategoriaCaso.OTRO });
  const sinCategoria = crearCaso({ categoria: null, estado: EstadoCaso.REGISTRADO });

  it("el administrador ve todo", () => {
    for (const caso of [denuncia, queja, otro, sinCategoria]) {
      expect(visiblePara(caso, RolDemo.ADMINISTRADOR)).toBe(true);
    }
  });

  it("el gestor ve queja, reclamo, otro y sin categoría, pero no la corrupción", () => {
    expect(visiblePara(denuncia, RolDemo.GESTOR)).toBe(false);
    expect(visiblePara(queja, RolDemo.GESTOR)).toBe(true);
    expect(visiblePara(otro, RolDemo.GESTOR)).toBe(true);
    expect(visiblePara(sinCategoria, RolDemo.GESTOR)).toBe(true);
  });

  it("cada área ve solo su categoría", () => {
    expect(visiblePara(queja, RolDemo.AREA_QUEJA)).toBe(true);
    expect(visiblePara(queja, RolDemo.AREA_RECLAMO)).toBe(false);
    expect(visiblePara(denuncia, RolDemo.AREA_DENUNCIA_CORRUPCION)).toBe(true);
    expect(visiblePara(queja, RolDemo.AREA_DENUNCIA_CORRUPCION)).toBe(false);
    expect(visiblePara(sinCategoria, RolDemo.AREA_QUEJA)).toBe(false);
  });
});

type Celda = { sinRevisar: AccionCaso[]; revisado: AccionCaso[] };
const NADA: Celda = { sinRevisar: [], revisado: [] };
const CERRADOS = { [EstadoCaso.RESUELTO]: NADA, [EstadoCaso.ARCHIVADO]: NADA };

const CATEGORIA_DEL_ROL: Record<RolDemo, CategoriaCaso> = {
  [RolDemo.ADMINISTRADOR]: CategoriaCaso.RECLAMO,
  [RolDemo.GESTOR]: CategoriaCaso.RECLAMO,
  [RolDemo.AREA_RECLAMO]: CategoriaCaso.RECLAMO,
  [RolDemo.AREA_QUEJA]: CategoriaCaso.QUEJA,
  [RolDemo.AREA_DENUNCIA_CORRUPCION]: CategoriaCaso.DENUNCIA_CORRUPCION,
};

const AREA_COMUN: Record<EstadoCaso, Celda> = {
  [EstadoCaso.REGISTRADO]: NADA,
  [EstadoCaso.CLASIFICADO]: NADA,
  [EstadoCaso.DERIVADO]: { sinRevisar: [TOMAR, RESOLVER], revisado: [TOMAR, RESOLVER] },
  [EstadoCaso.EN_GESTION]: { sinRevisar: [RESOLVER], revisado: [RESOLVER] },
  ...CERRADOS,
};

const MATRIZ: Record<RolDemo, Record<EstadoCaso, Celda>> = {
  [RolDemo.ADMINISTRADOR]: {
    [EstadoCaso.REGISTRADO]: NADA,
    [EstadoCaso.CLASIFICADO]: NADA,
    [EstadoCaso.DERIVADO]: NADA,
    [EstadoCaso.EN_GESTION]: NADA,
    ...CERRADOS,
  },
  [RolDemo.GESTOR]: {
    [EstadoCaso.REGISTRADO]: NADA,
    [EstadoCaso.CLASIFICADO]: { sinRevisar: [CONFIRMAR, CORREGIR], revisado: [DERIVAR] },
    [EstadoCaso.DERIVADO]: NADA,
    [EstadoCaso.EN_GESTION]: NADA,
    ...CERRADOS,
  },
  [RolDemo.AREA_RECLAMO]: AREA_COMUN,
  [RolDemo.AREA_QUEJA]: AREA_COMUN,
  [RolDemo.AREA_DENUNCIA_CORRUPCION]: {
    [EstadoCaso.REGISTRADO]: NADA,
    [EstadoCaso.CLASIFICADO]: { sinRevisar: [CONFIRMAR, CORREGIR], revisado: [TOMAR] },
    [EstadoCaso.DERIVADO]: { sinRevisar: [TOMAR, RESOLVER], revisado: [TOMAR, RESOLVER] },
    [EstadoCaso.EN_GESTION]: { sinRevisar: [RESOLVER], revisado: [RESOLVER] },
    ...CERRADOS,
  },
};

describe("accionesPermitidas: una prueba por rol, estado y revisión", () => {
  for (const rol of Object.values(RolDemo)) {
    for (const estado of Object.values(EstadoCaso)) {
      for (const revisado of [false, true]) {
        const titulo = `${rol} · ${estado} · ${revisado ? "revisado" : "sin revisar"}`;
        it(titulo, () => {
          const caso = crearCaso({ estado, revisadoPorHumano: revisado, categoria: CATEGORIA_DEL_ROL[rol] });
          const esperado = MATRIZ[rol][estado][revisado ? "revisado" : "sinRevisar"];
          expect(accionesPermitidas(caso, rol)).toEqual(esperado);
        });
      }
    }
  }
});

describe("accionesPermitidas: reglas de categoría", () => {
  it("el gestor revisa también la categoría Otro, pero no la puede derivar: no tiene área", () => {
    const sinRevisar = crearCaso({ categoria: CategoriaCaso.OTRO });
    const revisado = crearCaso({ categoria: CategoriaCaso.OTRO, revisadoPorHumano: true });
    expect(accionesPermitidas(sinRevisar, RolDemo.GESTOR)).toEqual([CONFIRMAR, CORREGIR]);
    expect(accionesPermitidas(revisado, RolDemo.GESTOR)).toEqual([]);
  });

  it("el gestor no ve ni actúa sobre denuncias por corrupción", () => {
    for (const revisadoPorHumano of [false, true]) {
      const denuncia = crearCaso({ categoria: CategoriaCaso.DENUNCIA_CORRUPCION, revisadoPorHumano });
      expect(accionesPermitidas(denuncia, RolDemo.GESTOR)).toEqual([]);
    }
  });

  it("un área no actúa sobre casos de otra categoría", () => {
    const derivado = crearCaso({ estado: EstadoCaso.DERIVADO, revisadoPorHumano: true });
    expect(accionesPermitidas(derivado, RolDemo.AREA_QUEJA)).toEqual([]);
    expect(accionesPermitidas(derivado, RolDemo.AREA_DENUNCIA_CORRUPCION)).toEqual([]);
  });

  it("solo el área de corrupción toma directo un caso clasificado y revisado", () => {
    const revisado = crearCaso({ revisadoPorHumano: true });
    expect(accionesPermitidas(revisado, RolDemo.AREA_RECLAMO)).toEqual([]);
    const denuncia = crearCaso({ categoria: CategoriaCaso.DENUNCIA_CORRUPCION, revisadoPorHumano: true });
    expect(accionesPermitidas(denuncia, RolDemo.AREA_DENUNCIA_CORRUPCION)).toEqual([TOMAR]);
  });
});
