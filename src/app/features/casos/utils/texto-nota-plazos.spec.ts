import { textoNotaPlazos } from "./texto-nota-plazos";

describe("textoNotaPlazos", () => {
  it("usa los plazos configurados", () => {
    expect(textoNotaPlazos({ atencionDias: 5, vigenciaResolucionDias: 10, avisoHoras: 24 })).toBe(
      "Plazo de atención: 5 días desde que llega el caso. Una resolución dura 10 días. Pasado el plazo, el caso se archiva solo.",
    );
  });

  it("dice «1 día» en singular", () => {
    expect(textoNotaPlazos({ atencionDias: 1, vigenciaResolucionDias: 1, avisoHoras: 24 })).toContain("1 día desde");
  });
});
