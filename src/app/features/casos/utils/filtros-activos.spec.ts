import { FILTRO_TODOS } from "@/features/casos/constants/casos-constants";
import { BandejaTab } from "@/features/casos/enums/bandeja-tab.enum";
import { FiltroActivoId } from "@/features/casos/enums/filtro-activo.enum";
import { FiltroTab } from "@/features/casos/enums/filtro-tab.enum";
import type { AreaOpcion } from "@/features/casos/types/area.types";
import { filtrosActivos, type FiltrosAplicados } from "@/features/casos/utils/filtros-activos";
import { TipoArea } from "@/shared/enums/tipo-area.enum";

const SIN_FILTROS: FiltrosAplicados = {
  bandeja: BandejaTab.TODOS,
  categoria: FiltroTab.TODOS,
  motivoArchivo: FILTRO_TODOS,
  establecimiento: null,
  desde: "",
  hasta: "",
  texto: "",
};

const HOSPITAL: AreaOpcion = {
  id: "10",
  codigo: "EESS-6206",
  nombre: "Hospital Dos de Mayo",
  tipoArea: TipoArea.ESTABLECIMIENTO,
  establecimiento: { codigoRenipress: "6206", nivelAtencion: null, categoria: null },
};

describe("filtrosActivos", () => {
  it("sin filtros no devuelve nada", () => {
    expect(filtrosActivos(SIN_FILTROS)).toEqual([]);
  });

  it("describe cada filtro en orden y con su identificador", () => {
    const lista = filtrosActivos({
      bandeja: BandejaTab.ARCHIVADOS,
      categoria: FiltroTab.QUEJAS,
      motivoArchivo: "NO_CORRESPONDE",
      establecimiento: HOSPITAL,
      desde: "2026-10-01",
      hasta: "2026-10-07",
      texto: "  demora ",
    });
    expect(lista).toEqual([
      { id: FiltroActivoId.ESTADO, label: "Estado: Archivados" },
      { id: FiltroActivoId.CATEGORIA, label: "Categoría: Quejas" },
      { id: FiltroActivoId.MOTIVO, label: "Motivo: No corresponde" },
      { id: FiltroActivoId.ESTABLECIMIENTO, label: "Establecimiento: Hospital Dos de Mayo" },
      { id: FiltroActivoId.FECHAS, label: "Fecha: del 01/10/2026 al 07/10/2026" },
      { id: FiltroActivoId.TEXTO, label: "Búsqueda: «demora»" },
    ]);
  });

  it("un solo día, solo desde o solo hasta se escriben distinto", () => {
    const fechas = (desde: string, hasta: string) => filtrosActivos({ ...SIN_FILTROS, desde, hasta })[0].label;
    expect(fechas("2026-10-08", "2026-10-08")).toBe("Fecha: 08/10/2026");
    expect(fechas("2026-10-08", "")).toBe("Desde: 08/10/2026");
    expect(fechas("", "2026-10-08")).toBe("Hasta: 08/10/2026");
  });

  it("un texto solo con espacios no cuenta como filtro", () => {
    expect(filtrosActivos({ ...SIN_FILTROS, texto: "   " })).toEqual([]);
  });

  it("un motivo desconocido se muestra tal cual en lugar de romper", () => {
    expect(filtrosActivos({ ...SIN_FILTROS, motivoArchivo: "OTRO_MOTIVO" })[0].label).toBe("Motivo: OTRO_MOTIVO");
  });
});
