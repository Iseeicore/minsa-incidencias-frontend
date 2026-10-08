import { AccionCaso } from "@/features/casos/enums/accion-caso.enum";
import { EstadoCaso } from "@/features/casos/enums/estado-caso.enum";
import { jerarquiaDeAcciones } from "@/features/casos/utils/jerarquia-acciones";

const { CONFIRMAR, CORREGIR, DERIVAR, TOMAR, RESOLVER, ARCHIVAR, REABRIR } = AccionCaso;

describe("jerarquiaDeAcciones", () => {
  it("clasificado sin revisar: Confirmar es la principal, Corregir y Derivar secundarias y Archivar aparte", () => {
    const resultado = jerarquiaDeAcciones(
      { estado: EstadoCaso.CLASIFICADO, revisadoPorHumano: false },
      [CONFIRMAR, CORREGIR, DERIVAR, ARCHIVAR],
    );
    expect(resultado).toEqual({ principal: CONFIRMAR, secundarias: [CORREGIR, DERIVAR], destructivas: [ARCHIVAR] });
  });

  it("clasificado ya revisado: Tomar es la principal y Derivar pasa a secundaria", () => {
    const resultado = jerarquiaDeAcciones({ estado: EstadoCaso.CLASIFICADO, revisadoPorHumano: true }, [DERIVAR, TOMAR, ARCHIVAR]);
    expect(resultado).toEqual({ principal: TOMAR, secundarias: [DERIVAR], destructivas: [ARCHIVAR] });
  });

  it("clasificado ya revisado, sin Tomar: Derivar es la principal", () => {
    const resultado = jerarquiaDeAcciones({ estado: EstadoCaso.CLASIFICADO, revisadoPorHumano: true }, [CORREGIR, DERIVAR]);
    expect(resultado.principal).toBe(DERIVAR);
    expect(resultado.secundarias).toEqual([CORREGIR]);
  });

  it("derivado: Tomar es la principal", () => {
    const resultado = jerarquiaDeAcciones({ estado: EstadoCaso.DERIVADO, revisadoPorHumano: true }, [TOMAR, ARCHIVAR]);
    expect(resultado).toEqual({ principal: TOMAR, secundarias: [], destructivas: [ARCHIVAR] });
  });

  it("en gestión: Resolver es la principal", () => {
    const resultado = jerarquiaDeAcciones({ estado: EstadoCaso.EN_GESTION, revisadoPorHumano: true }, [RESOLVER, ARCHIVAR]);
    expect(resultado).toEqual({ principal: RESOLVER, secundarias: [], destructivas: [ARCHIVAR] });
  });

  it("archivado: Reabrir es la única acción y es la principal", () => {
    const resultado = jerarquiaDeAcciones({ estado: EstadoCaso.ARCHIVADO, revisadoPorHumano: true }, [REABRIR]);
    expect(resultado).toEqual({ principal: REABRIR, secundarias: [], destructivas: [] });
  });

  it("si el servidor no permite la acción esperada, no se inventa una principal", () => {
    const resultado = jerarquiaDeAcciones({ estado: EstadoCaso.CLASIFICADO, revisadoPorHumano: false }, [CORREGIR, DERIVAR]);
    expect(resultado).toEqual({ principal: null, secundarias: [CORREGIR, DERIVAR], destructivas: [] });
  });

  it("sin acciones permitidas no hay nada que mostrar", () => {
    expect(jerarquiaDeAcciones({ estado: EstadoCaso.EN_GESTION, revisadoPorHumano: true }, [])).toEqual({
      principal: null,
      secundarias: [],
      destructivas: [],
    });
  });

  it("nunca hay más de una principal ni una acción repetida", () => {
    for (const estado of Object.values(EstadoCaso)) {
      for (const revisado of [true, false]) {
        const { principal, secundarias, destructivas } = jerarquiaDeAcciones(
          { estado, revisadoPorHumano: revisado },
          Object.values(AccionCaso),
        );
        const todas = [...(principal ? [principal] : []), ...secundarias, ...destructivas];
        expect(new Set(todas).size).toBe(todas.length);
        expect(todas.length).toBe(Object.values(AccionCaso).length);
      }
    }
  });
});
