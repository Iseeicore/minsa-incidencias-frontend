import { BANDEJAS } from "@/features/casos/constants/casos-constants";
import { BandejaTab } from "@/features/casos/enums/bandeja-tab.enum";
import { conteo, crearConteos } from "@/features/casos/testing/conteos-builder";
import { bandejasConConteo, conteoDeBandeja, sufijoMostrando, textoTotal } from "./conteos-bandeja";

describe("conteos de la bandeja", () => {
  it.each([
    [BandejaTab.POR_REVISAR, 12],
    [BandejaTab.EN_GESTION, 5],
    [BandejaTab.DERIVADOS, 3],
    [BandejaTab.RESUELTOS, 1000],
    [BandejaTab.ARCHIVADOS, 9],
    [BandejaTab.TODOS, 50],
  ])("la pestaña %s toma su cantidad (%i)", (pestana, cantidad) => {
    expect(conteoDeBandeja(crearConteos(), pestana).cantidad).toBe(cantidad);
  });

  it("agrega la cantidad a cada pestaña y conserva el resto", () => {
    const opciones = bandejasConConteo(BANDEJAS, crearConteos());
    expect(opciones.map((opcion) => [opcion.label, opcion.cantidad, opcion.conMas])).toEqual([
      ["Por revisar", 12, false],
      ["En gestión", 5, false],
      ["Derivados", 3, false],
      ["Resueltos", 1000, true],
      ["Archivados", 9, false],
      ["Todos", 50, false],
    ]);
    expect(opciones[0].ayuda).toBe(BANDEJAS[0].ayuda);
  });

  it("sin conteos deja las pestañas sin número", () => {
    expect(bandejasConConteo(BANDEJAS, null)).toBe(BANDEJAS);
  });

  it("el total se escribe con + cuando hay más", () => {
    expect(textoTotal(null)).toBeNull();
    expect(textoTotal(conteo(7))).toBe("7");
    expect(textoTotal(conteo(1000, true))).toBe("1000+");
  });

  it("«Mostrando N de Y casos» y, sin conteo, solo «casos»", () => {
    expect(sufijoMostrando(3, conteo(7))).toBe(" de 7 casos");
    expect(sufijoMostrando(1, conteo(1))).toBe(" de 1 caso");
    expect(sufijoMostrando(20, conteo(1000, true))).toBe(" de 1000+ casos");
    expect(sufijoMostrando(3, null)).toBe(" casos");
    expect(sufijoMostrando(1, null)).toBe(" caso");
  });
});
