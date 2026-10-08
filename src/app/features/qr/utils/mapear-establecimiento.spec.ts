import type { AreaOpcion } from "@/features/casos/types/area.types";
import { TipoArea } from "@/shared/enums/tipo-area.enum";
import { aEstablecimientoQr, aEstablecimientosQr } from "./mapear-establecimiento";

const HOSPITAL: AreaOpcion = {
  id: "10",
  codigo: "EESS-6206",
  nombre: "HOSPITAL NACIONAL DOS DE MAYO",
  tipoArea: TipoArea.ESTABLECIMIENTO,
  establecimiento: { codigoRenipress: "6206", nivelAtencion: "III", categoria: "III-1" },
};
const OTRANS: AreaOpcion = { id: "1", codigo: "OTRANS", nombre: "OTRANS", tipoArea: TipoArea.OTRANS, establecimiento: null };

describe("aEstablecimientoQr", () => {
  it("toma nombre, código RENIPRESS, nivel y categoría del área", () => {
    expect(aEstablecimientoQr(HOSPITAL)).toEqual({
      id: "10",
      nombre: "HOSPITAL NACIONAL DOS DE MAYO",
      codigoRenipress: "6206",
      nivelAtencion: "III",
      categoria: "III-1",
    });
  });

  it("un área sin datos de establecimiento no tiene QR", () => {
    expect(aEstablecimientoQr(OTRANS)).toBeNull();
    expect(aEstablecimientosQr([OTRANS, HOSPITAL, OTRANS]).map((e) => e.codigoRenipress)).toEqual(["6206"]);
  });
});
