import { formatearFecha } from "./formatear-fecha";

describe("formatearFecha", () => {
  it("da una fecha legible a un instante ISO", () => {
    expect(formatearFecha("2026-10-08T15:30:00.000Z")).toMatch(/2026/);
  });

  it("si no se puede leer devuelve el texto tal cual", () => {
    expect(formatearFecha("no es una fecha")).toBe("no es una fecha");
  });
});
