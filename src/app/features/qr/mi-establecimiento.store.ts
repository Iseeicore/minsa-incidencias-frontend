import { computed, inject, Injectable, signal } from "@angular/core";
import { CargaEstado } from "@/features/casos/enums/carga-estado.enum";
import { AreasApi } from "@/features/casos/services/areas.api";
import { mensajeDeError } from "@/features/casos/services/incidencia-error";
import { MENSAJE_QR } from "@/features/qr/constants/qr-constants";
import type { EstablecimientoQr } from "@/features/qr/types/establecimiento-qr.types";
import { aEstablecimientosQr } from "@/features/qr/utils/mapear-establecimiento";
import { TipoArea } from "@/shared/enums/tipo-area.enum";

/** El establecimiento de la persona: `GET /areas` solo devuelve su propia área, de ahí sale su código RENIPRESS. */
@Injectable()
export class MiEstablecimientoStore {
  private readonly api = inject(AreasApi);

  readonly establecimiento = signal<EstablecimientoQr | null>(null);
  readonly estadoCarga = signal<CargaEstado>(CargaEstado.INICIAL);
  readonly error = signal<string | null>(null);
  readonly vacio = computed(() => this.estadoCarga() === CargaEstado.LISTO && this.establecimiento() === null);

  constructor() {
    void this.cargar();
  }

  async cargar(): Promise<void> {
    this.estadoCarga.set(CargaEstado.CARGANDO);
    this.error.set(null);
    try {
      const lista = await this.api.listar({ tipo: TipoArea.ESTABLECIMIENTO, limite: 1 });
      this.establecimiento.set(aEstablecimientosQr(lista.areas)[0] ?? null);
      this.estadoCarga.set(CargaEstado.LISTO);
    } catch (error) {
      this.error.set(`${MENSAJE_QR.CARGA_PROPIO} ${mensajeDeError(error)}`);
      this.estadoCarga.set(CargaEstado.ERROR);
    }
  }
}
