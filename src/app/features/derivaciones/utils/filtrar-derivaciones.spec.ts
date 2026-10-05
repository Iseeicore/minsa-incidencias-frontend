import { DERIVACIONES_DEMO } from "@/features/derivaciones/data/derivaciones.demo";
import { EstadoDerivacion } from "@/features/derivaciones/enums/estado-derivacion.enum";
import { filtrarDerivaciones } from "./filtrar-derivaciones";

describe("filtrarDerivaciones", () => {
  it("cada estado deja solo las derivaciones de ese estado", () => {
    for (const estado of Object.values(EstadoDerivacion)) {
      const resultado = filtrarDerivaciones(DERIVACIONES_DEMO, estado);
      expect(resultado.length).toBeGreaterThan(0);
      expect(resultado.every((derivacion) => derivacion.estado === estado)).toBe(true);
    }
  });

  it("los cuatro estados juntos cubren todas las derivaciones sin repetir", () => {
    const total = Object.values(EstadoDerivacion).flatMap((estado) => filtrarDerivaciones(DERIVACIONES_DEMO, estado));
    expect(total).toHaveLength(DERIVACIONES_DEMO.length);
  });

  it("cada derivación cuenta los cinco pasos de la trazabilidad", () => {
    expect(DERIVACIONES_DEMO.every((derivacion) => derivacion.pasos.length === 5)).toBe(true);
  });
});
