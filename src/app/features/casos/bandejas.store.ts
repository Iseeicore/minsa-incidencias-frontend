import { computed, effect, inject, Injectable, signal, untracked } from "@angular/core";
import { CasosStore } from "@/features/casos/casos.store";
import { FILTRO_TODOS, LIMITE_BANDEJA } from "@/features/casos/constants/casos-constants";
import { MENSAJE_CARGA } from "@/features/casos/constants/casos-messages";
import type { BandejaTab } from "@/features/casos/enums/bandeja-tab.enum";
import { CargaEstado } from "@/features/casos/enums/carga-estado.enum";
import { EstadoCaso } from "@/features/casos/enums/estado-caso.enum";
import { mensajeDeError } from "@/features/casos/services/incidencia-error";
import { IncidenciasApi } from "@/features/casos/services/incidencias.api";
import type { Caso } from "@/features/casos/types/caso.types";
import type { ConsultaCasos } from "@/features/casos/types/incidencias-api.types";
import { casosDeBandeja, type CasosPorEstado } from "@/features/casos/utils/bandeja-de-casos";

const ESTADOS_DE_BANDEJA: readonly EstadoCaso[] = [
  EstadoCaso.CLASIFICADO,
  EstadoCaso.DERIVADO,
  EstadoCaso.EN_GESTION,
  EstadoCaso.RESUELTO,
  EstadoCaso.ARCHIVADO,
];

/**
 * Bandejas del usuario: trae la primera página (hasta 100 casos, los más recientes primero: el servidor no deja
 * elegir el orden) de cada estado y los reparte en pestañas con las acciones y los plazos que calculó el servidor.
 * El alcance (área y categorías) lo impone el servidor. Se provee en la página.
 */
@Injectable()
export class BandejasStore {
  private readonly api = inject(IncidenciasApi);
  private readonly estadosConMas = signal<readonly EstadoCaso[]>([]);
  private peticion = 0;

  readonly porEstado = signal<CasosPorEstado>({});
  /** Por qué se archivaron los casos de la bandeja Archivados; el servidor filtra. */
  readonly motivoArchivo = signal<string>(FILTRO_TODOS);
  readonly estadoCarga = signal<CargaEstado>(CargaEstado.INICIAL);
  readonly error = signal<string | null>(null);

  /** Hay estados con más casos de los que caben en la primera página: esta pantalla no los muestra. */
  readonly hayCasosSinMostrar = computed(() => this.estadosConMas().length > 0);

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

  cambiarMotivoArchivo(motivo: string): Promise<void> {
    this.motivoArchivo.set(motivo);
    return this.recargar();
  }

  async recargar(): Promise<void> {
    const token = ++this.peticion;
    this.estadoCarga.set(CargaEstado.CARGANDO);
    this.error.set(null);
    try {
      const listas = await Promise.all(
        ESTADOS_DE_BANDEJA.map((estado) => this.api.listar(this.consulta(estado))),
      );
      if (token !== this.peticion) return;
      const porEstado: CasosPorEstado = {};
      ESTADOS_DE_BANDEJA.forEach((estado, indice) => {
        porEstado[estado] = listas[indice].casos;
      });
      this.porEstado.set(porEstado);
      this.estadosConMas.set(ESTADOS_DE_BANDEJA.filter((_, indice) => listas[indice].hayMas));
      this.estadoCarga.set(CargaEstado.LISTO);
    } catch (error) {
      if (token !== this.peticion) return;
      this.error.set(`${MENSAJE_CARGA.LISTA} ${mensajeDeError(error)}`);
      this.estadoCarga.set(CargaEstado.ERROR);
    }
  }

  private consulta(estado: EstadoCaso): ConsultaCasos {
    const motivo = this.motivoArchivo();
    const filtraPorMotivo = estado === EstadoCaso.ARCHIVADO && motivo !== FILTRO_TODOS;
    return { estado, limite: LIMITE_BANDEJA, ...(filtraPorMotivo && { motivoArchivo: motivo }) };
  }
}
