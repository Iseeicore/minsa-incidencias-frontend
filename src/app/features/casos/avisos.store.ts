import { computed, effect, inject, Injectable, signal, untracked } from "@angular/core";
import { CasosStore } from "@/features/casos/casos.store";
import { MENSAJE_CARGA } from "@/features/casos/constants/casos-messages";
import { CargaEstado } from "@/features/casos/enums/carga-estado.enum";
import { mensajeDeError } from "@/features/casos/services/incidencia-error";
import { IncidenciasApi } from "@/features/casos/services/incidencias.api";
import type { CasosPorVencer } from "@/features/casos/types/caso.types";

/** Casos por vencer de la persona (campana de avisos). El servidor decide qué le toca atender y cuándo vence. */
@Injectable({ providedIn: "root" })
export class AvisosStore {
  private readonly api = inject(IncidenciasApi);
  private readonly datos = signal<CasosPorVencer | null>(null);
  private peticion = 0;

  readonly estadoCarga = signal<CargaEstado>(CargaEstado.INICIAL);
  readonly error = signal<string | null>(null);
  readonly casos = computed(() => this.datos()?.casos ?? []);
  readonly porVencer = computed(() => this.datos()?.porVencer ?? 0);
  readonly vencidos = computed(() => this.datos()?.vencidos ?? 0);
  readonly contador = computed(() => this.porVencer() + this.vencidos());

  constructor() {
    const casos = inject(CasosStore);
    const cambiosIniciales = casos.cambios();
    effect(() => {
      if (casos.cambios() === cambiosIniciales) return;
      untracked(() => void this.refrescar());
    });
  }

  async refrescar(): Promise<void> {
    const token = ++this.peticion;
    this.estadoCarga.set(CargaEstado.CARGANDO);
    this.error.set(null);
    try {
      const datos = await this.api.porVencer();
      if (token !== this.peticion) return;
      this.datos.set(datos);
      this.estadoCarga.set(CargaEstado.LISTO);
    } catch (error) {
      if (token !== this.peticion) return;
      this.error.set(`${MENSAJE_CARGA.AVISOS} ${mensajeDeError(error)}`);
      this.estadoCarga.set(CargaEstado.ERROR);
    }
  }
}
