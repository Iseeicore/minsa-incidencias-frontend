import { BANDEJAS, FILTRO_TODOS, MOTIVO_ARCHIVO_LABEL, TABS_OPCIONES } from "@/features/casos/constants/casos-constants";
import { BandejaTab } from "@/features/casos/enums/bandeja-tab.enum";
import { FiltroActivoId } from "@/features/casos/enums/filtro-activo.enum";
import { FiltroTab } from "@/features/casos/enums/filtro-tab.enum";
import type { MotivoArchivo } from "@/features/casos/enums/motivo-archivo.enum";
import type { AreaOpcion } from "@/features/casos/types/area.types";
import type { FiltroActivo } from "@/features/casos/types/filtro-activo.types";
import { fechaCorta } from "@/features/casos/utils/fechas-lima";

export interface FiltrosAplicados {
  readonly bandeja: BandejaTab;
  readonly categoria: FiltroTab;
  readonly motivoArchivo: string;
  readonly establecimiento: AreaOpcion | null;
  readonly desde: string;
  readonly hasta: string;
  readonly texto: string;
}

function textoDeFechas(desde: string, hasta: string): string {
  if (desde !== "" && desde === hasta) return `Fecha: ${fechaCorta(desde)}`;
  if (desde !== "" && hasta !== "") return `Fecha: del ${fechaCorta(desde)} al ${fechaCorta(hasta)}`;
  return desde !== "" ? `Desde: ${fechaCorta(desde)}` : `Hasta: ${fechaCorta(hasta)}`;
}

/** Los filtros que hoy recortan la lista, en el orden en que se muestran. */
export function filtrosActivos(aplicados: FiltrosAplicados): readonly FiltroActivo[] {
  const lista: FiltroActivo[] = [];
  if (aplicados.bandeja !== BandejaTab.TODOS) {
    const etiqueta = BANDEJAS.find((bandeja) => bandeja.value === aplicados.bandeja)?.label ?? aplicados.bandeja;
    lista.push({ id: FiltroActivoId.ESTADO, label: `Estado: ${etiqueta}` });
  }
  if (aplicados.categoria !== FiltroTab.TODOS) {
    const etiqueta = TABS_OPCIONES.find((tab) => tab.value === aplicados.categoria)?.label ?? aplicados.categoria;
    lista.push({ id: FiltroActivoId.CATEGORIA, label: `Categoría: ${etiqueta}` });
  }
  if (aplicados.motivoArchivo !== FILTRO_TODOS) {
    const etiqueta = MOTIVO_ARCHIVO_LABEL[aplicados.motivoArchivo as MotivoArchivo] ?? aplicados.motivoArchivo;
    lista.push({ id: FiltroActivoId.MOTIVO, label: `Motivo: ${etiqueta}` });
  }
  if (aplicados.establecimiento !== null) {
    lista.push({ id: FiltroActivoId.ESTABLECIMIENTO, label: `Establecimiento: ${aplicados.establecimiento.nombre}` });
  }
  if (aplicados.desde !== "" || aplicados.hasta !== "") {
    lista.push({ id: FiltroActivoId.FECHAS, label: textoDeFechas(aplicados.desde, aplicados.hasta) });
  }
  const texto = aplicados.texto.trim();
  if (texto !== "") lista.push({ id: FiltroActivoId.TEXTO, label: `Búsqueda: «${texto}»` });
  return lista;
}
