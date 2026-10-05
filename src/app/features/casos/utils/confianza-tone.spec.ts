import { BadgeTone } from "@/shared/enums/badge.enum";
import { tonoConfianza } from "./confianza-tone";

describe("tonoConfianza", () => {
  it("85 o más es éxito", () => {
    expect(tonoConfianza(85)).toBe(BadgeTone.SUCCESS);
    expect(tonoConfianza(100)).toBe(BadgeTone.SUCCESS);
  });

  it("de 60 a 84 es advertencia", () => {
    expect(tonoConfianza(60)).toBe(BadgeTone.WARNING);
    expect(tonoConfianza(84)).toBe(BadgeTone.WARNING);
  });

  it("menos de 60 es peligro", () => {
    expect(tonoConfianza(59)).toBe(BadgeTone.DANGER);
    expect(tonoConfianza(0)).toBe(BadgeTone.DANGER);
  });
});
