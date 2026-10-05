import { PLAZOS_POR_DEFECTO, plazosDesde } from "./plazos.config";

describe("plazosDesde", () => {
  it("toma los valores configurados", () => {
    expect(plazosDesde({ atencionDias: 5, vigenciaResolucionDias: 2, avisoHoras: 12 })).toEqual({
      atencionDias: 5,
      vigenciaResolucionDias: 2,
      avisoHoras: 12,
    });
  });

  it("sin configuración usa los valores por defecto (3 días, 3 días y 24 horas)", () => {
    expect(plazosDesde(undefined)).toEqual(PLAZOS_POR_DEFECTO);
    expect(PLAZOS_POR_DEFECTO).toEqual({ atencionDias: 3, vigenciaResolucionDias: 3, avisoHoras: 24 });
  });

  it("un valor inválido (cero, negativo, no numérico) cae al valor por defecto", () => {
    const resultado = plazosDesde({ atencionDias: 0, vigenciaResolucionDias: -1, avisoHoras: Number.NaN });
    expect(resultado).toEqual(PLAZOS_POR_DEFECTO);
    expect(plazosDesde({ atencionDias: "3" as never }).atencionDias).toBe(3);
  });

  it("acepta cambiar solo uno y deja los demás por defecto", () => {
    expect(plazosDesde({ atencionDias: 7 })).toEqual({ ...PLAZOS_POR_DEFECTO, atencionDias: 7 });
  });
});
