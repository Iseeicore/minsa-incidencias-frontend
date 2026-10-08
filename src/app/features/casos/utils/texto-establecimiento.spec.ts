import { NivelAtencion } from "@/features/casos/enums/nivel-atencion.enum";
import { textoEstablecimiento, textoRenipress } from "./texto-establecimiento";

describe("textoRenipress", () => {
  it("junta código, nivel y categoría", () => {
    expect(textoRenipress({ codigoRenipress: "6206", nivelAtencion: NivelAtencion.III, categoria: "III-1" })).toBe(
      "RENIPRESS 6206 · Nivel III · Cat. III-1",
    );
  });

  it("omite lo que el servidor no mandó", () => {
    expect(textoRenipress({ codigoRenipress: "5614", nivelAtencion: null, categoria: null })).toBe("RENIPRESS 5614");
    expect(textoRenipress({ codigoRenipress: "5614", nivelAtencion: NivelAtencion.I, categoria: null })).toBe("RENIPRESS 5614 · Nivel I");
  });
});

describe("textoEstablecimiento", () => {
  it("pone el nombre y, entre paréntesis, los datos RENIPRESS", () => {
    expect(
      textoEstablecimiento({ codigoRenipress: "5946", nombre: "Hospital Hipólito Unanue", nivelAtencion: NivelAtencion.III, categoria: null }),
    ).toBe("Hospital Hipólito Unanue (RENIPRESS 5946 · Nivel III)");
  });
});
