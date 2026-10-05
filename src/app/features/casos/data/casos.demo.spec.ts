import { CASOS_DEMO } from "@/features/casos/data/casos.demo";
import { DERIVACIONES_DEMO } from "@/features/derivaciones/data/derivaciones.demo";

describe("datos de demostración", () => {
  it("ya no mencionan al revisor: el gestor revisa y deriva", () => {
    expect(JSON.stringify(CASOS_DEMO)).not.toMatch(/revisor/i);
    expect(JSON.stringify(DERIVACIONES_DEMO)).not.toMatch(/revisor/i);
  });
});
