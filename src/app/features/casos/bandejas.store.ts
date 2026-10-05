import { computed, effect, inject, Injectable, signal, untracked } from "@angular/core";
import { CasosStore } from "@/features/casos/casos.store";
import { LIMITE_BANDEJA } from "@/features/casos/constants/casos-constants";
import { MENSAJE_CARGA } from "@/features/casos/constants/casos-messages";
import type { BandejaTab } from "@/features/casos/enums/bandeja-tab.enum";
import { CargaEstado } from "@/features/casos/enums/carga-estado.enum";
import { EstadoCaso } from "@/features/casos/enums/estado-caso.enum";
import { DireccionOrden, OrdenCaso } from "@/features/casos/enums/orden-caso.enum";
import { mensajeDeError } from "@/features/casos/services/incidencia-error";
import { IncidenciasApi } from "@/features/casos/services/incidencias.api";
import type { Caso } from "@/features/casos/types/caso.types";
import { casosDeBandeja, type CasosPorEstado } from "@/features/casos/utils/bandeja-de-casos";

const ESTADOS_DE_BANDEJA: readonly { readonly estado: EstadoCaso; readonly direccion: DireccionOrden }[] = [
  { estado: EstadoCaso.CLASIFICADO, direccion: DireccionOrden.ASCENDENTE },
  { estado: EstadoCaso.DERIVADO, direccion: DireccionOrden.ASCENDENTE },
  { estado: EstadoCaso.EN_GESTION, direccion: DireccionOrden.ASCENDENTE },
  { estado: EstadoCaso.RESUELTO, direccion: DireccionOrden.DESCENDENTE },
  { estado: EstadoCaso.ARCHIVADO, direccion: DireccionOrden.DESCENDENTE },
];

/**
 * Bandejas del usuario: trae hasta 100 casos de cada estado (los abiertos, los más antiguos primero; los
 * cerrados, los más recientes) y los reparte en pestañas con las acciones y los plazos que calculó el servidor.
 * Se provee en la página.
 */
@Injectable()
export class BandejasStore {
  private readonly api = inject(IncidenciasApi);
  private readonly totales = signal<Partial<Record<EstadoCaso, number>>>({});
  private peticion = 0;

  readonly porEstado = signal<CasosPorEstado>({});
  readonly estadoCarga = signal<CargaEstado>(CargaEstado.INICIAL);
  readonly error = signal<string | null>(null);

  readonly casosSinMostrar = computed(() =>
    ESTADOS_DE_BANDEJA.reduce((suma, { estado }) => {
      const traidos = this.porEstado()[estado]?.length ?? 0;
      return suma + Math.max((this.totales()[estado] ?? 0) - traidos, 0);
    }, 0),
  );
  readonly hayCasosSinMostrar = computed(() => this.casosSinMostrar() > 0);

  constructor() {
    const casos = inject(CasosStore);
    const cambiosIniciales = casos.cambios();
    effect(() => {
      if (casos.cambios() === cambiosIniciales) return;
      untracked(() => void this.recargar());
    });
    void this.recargar();
  }

  casosDe(tab: BandejaTab): Caso[] {
    return casosDeBandeja(tab, this.porEstado());
  }

  cantidad(tab: BandejaTab): number {
    return this.casosDe(tab).length;
  }

  async recargar(): Promise<void> {
    const token = ++this.peticion;
    this.estadoCarga.set(CargaEstado.CARGANDO);
    this.error.set(null);
    try {
      const listas = await Promise.all(
        ESTADOS_DE_BANDEJA.map(({ estado, direccion }) =>
          this.api.listar({ estado, tamano: LIMITE_BANDEJA, orden: OrdenCaso.FECHA, direccion }),
        ),
      );
      if (token !== this.peticion) return;
      const porEstado: CasosPorEstado = {};
      const totales: Partial<Record<EstadoCaso, number>> = {};
      ESTADOS_DE_BANDEJA.forEach(({ estado }, indice) => {
        porEstado[estado] = listas[indice].casos;
        totales[estado] = listas[indice].total;
      });
      this.porEstado.set(porEstado);
      this.totales.set(totales);
      this.estadoCarga.set(CargaEstado.LISTO);
    } catch (error) {
      if (token !== this.peticion) return;
      this.error.set(`${MENSAJE_CARGA.LISTA} ${mensajeDeError(error)}`);
      this.estadoCarga.set(CargaEstado.ERROR);
    }
  }
}
