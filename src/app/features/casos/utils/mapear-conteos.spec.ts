import { crearConteos, crearConteosDto } from "@/features/casos/testing/conteos-builder";
import type { ConteosDto } from "@/features/casos/types/incidencias-api.types";
import { mapearConteos } from "./mapear-conteos";

describe("mapearConteos", () => {
  it("traduce la respuesta del servidor", () => {
    expect(mapearConteos(crearConteosDto())).toEqual(crearConteos());
  });

  it("rechaza una respuesta incompleta en vez de inventar ceros", () => {
    const sinEstado = { ...crearConteosDto(), porEstado: { clasificado: { cantidad: 1, conMas: false } } };
    expect(() => mapearConteos(sinEstado)).toThrow();
    expect(() => mapearConteos({ ...crearConteosDto(), total: undefined } as unknown as ConteosDto)).toThrow();
  });

  it("rechaza una cantidad que no es número", () => {
    const mala = { ...crearConteosDto(), todos: { cantidad: "12", conMas: false } } as unknown as ConteosDto;
    expect(() => mapearConteos(mala)).toThrow();
  });
});
