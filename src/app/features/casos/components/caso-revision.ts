import { ChangeDetectionStrategy, Component, computed, effect, inject, model, signal, untracked } from "@angular/core";
import { CasosStore } from "@/features/casos/casos.store";
import {
  CATEGORIA_LABEL,
  ESTADO_BADGE,
  MAX_RESOLUCION,
  PRIORIDAD_CASO_BADGE,
  SIN_DATO,
  TIPO_EVIDENCIA_LABEL,
} from "@/features/casos/constants/casos-constants";
import { MENSAJE_ERROR } from "@/features/casos/constants/casos-messages";
import { AccionCaso } from "@/features/casos/enums/accion-caso.enum";
import { CargaEstado } from "@/features/casos/enums/carga-estado.enum";
import { CategoriaCaso } from "@/features/casos/enums/categoria-caso.enum";
import { EstadoCaso } from "@/features/casos/enums/estado-caso.enum";
import { ModoPanel } from "@/features/casos/enums/modo-panel.enum";
import type { ResultadoAccion } from "@/features/casos/types/caso.types";
import { areaDe } from "@/features/casos/utils/area-de-categoria";
import { tonoConfianza } from "@/features/casos/utils/confianza-tone";
import { textoPlazo } from "@/features/casos/utils/texto-plazo";
import { BadgeTone } from "@/shared/enums/badge.enum";
import { ButtonSize, ButtonTone, ButtonVariant } from "@/shared/enums/button.enum";
import { Alert } from "@/shared/ui/alert/alert";
import { Badge } from "@/shared/ui/badge/badge";
import { Button } from "@/shared/ui/button/button";
import { Drawer } from "@/shared/ui/drawer/drawer";
import { SelectField, type SelectOption } from "@/shared/ui/select-field/select-field";
import { TextareaField } from "@/shared/ui/textarea-field/textarea-field";
import { Timeline } from "@/shared/ui/timeline/timeline";

@Component({
  selector: "app-caso-revision",
  imports: [Alert, Badge, Button, Drawer, SelectField, TextareaField, Timeline],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: "./caso-revision.html",
})
export class CasoRevision {
  private readonly store = inject(CasosStore);

  readonly codigo = model<string | null>(null);

  protected readonly AccionCaso = AccionCaso;
  protected readonly BadgeTone = BadgeTone;
  protected readonly ButtonSize = ButtonSize;
  protected readonly ButtonTone = ButtonTone;
  protected readonly ButtonVariant = ButtonVariant;
  protected readonly ModoPanel = ModoPanel;
  protected readonly maxResolucion = MAX_RESOLUCION;
  protected readonly sinDato = SIN_DATO;
  protected readonly categoriaLabel = CATEGORIA_LABEL;
  protected readonly estadoBadge = ESTADO_BADGE;
  protected readonly prioridadBadge = PRIORIDAD_CASO_BADGE;
  protected readonly tipoEvidencia = TIPO_EVIDENCIA_LABEL;
  protected readonly tonoConfianza = tonoConfianza;

  protected readonly modo = signal<ModoPanel>(ModoPanel.NINGUNO);
  protected readonly nuevaCategoria = signal("");
  protected readonly resolucion = signal("");
  protected readonly feedback = signal<ResultadoAccion | null>(null);
  protected readonly evidenciasAbiertas = signal<readonly string[]>([]);
  protected readonly procesando = signal(false);

  protected readonly caso = this.store.detalle;
  protected readonly errorCarga = this.store.errorDetalle;
  protected readonly cargando = computed(() => this.store.estadoDetalle() === CargaEstado.CARGANDO);
  protected readonly noDisponible = computed(() => this.errorCarga() === MENSAJE_ERROR.NO_DISPONIBLE);

  protected readonly acciones = computed(() => this.caso()?.acciones ?? []);

  protected readonly plazoTexto = computed(() => {
    const caso = this.caso();
    return caso ? textoPlazo(caso) : "";
  });

  protected readonly hayEvidenciaSensible = computed(() => this.caso()?.evidencias.some((item) => item.sensible) ?? false);

  protected readonly opcionesCategoria = computed<readonly SelectOption[]>(() => [
    { value: "", label: "Elige una categoría" },
    ...Object.values(CategoriaCaso)
      .filter((categoria) => categoria !== this.caso()?.categoria)
      .map((categoria) => ({ value: categoria, label: CATEGORIA_LABEL[categoria] })),
  ]);

  protected readonly areaNueva = computed(() => {
    const nueva = this.nuevaCategoria();
    return nueva ? areaDe(nueva as CategoriaCaso) : null;
  });

  protected readonly areaDestino = computed(() => {
    const caso = this.caso();
    return caso?.area ?? areaDe(caso?.categoria ?? null);
  });

  protected readonly motivoSinAcciones = computed(() => {
    const caso = this.caso();
    if (!caso || this.acciones().length > 0) return "";
    if (caso.estado === EstadoCaso.RESUELTO || caso.estado === EstadoCaso.ARCHIVADO) return "Este caso ya está cerrado.";
    if (caso.categoria === CategoriaCaso.OTRO && caso.estado === EstadoCaso.CLASIFICADO && caso.revisadoPorHumano) {
      return "La categoría Otro no tiene un área a la que derivar y la revisión de la categoría ya se hizo.";
    }
    return "No hay acciones disponibles para tu rol en este estado del caso.";
  });

  constructor() {
    effect(() => {
      const codigo = this.codigo();
      untracked(() => {
        this.reiniciar();
        if (codigo) void this.store.abrir(codigo);
        else this.store.cerrar();
      });
    });
  }

  protected alCambiarPanel(abierto: boolean): void {
    if (!abierto) this.codigo.set(null);
  }

  protected reintentar(): void {
    void this.store.reintentar();
  }

  protected confirmar(): void {
    void this.ejecutar((codigo) => this.store.confirmar(codigo));
  }

  protected derivar(): void {
    void this.ejecutar((codigo) => this.store.derivar(codigo));
  }

  protected tomar(): void {
    void this.ejecutar((codigo) => this.store.tomar(codigo));
  }

  protected abrirCorreccion(): void {
    this.feedback.set(null);
    this.modo.set(ModoPanel.CORREGIR);
  }

  protected aplicarCorreccion(): void {
    const nueva = this.nuevaCategoria();
    if (!nueva) return;
    void this.ejecutar((codigo) => this.store.corregir(codigo, nueva as CategoriaCaso));
  }

  protected abrirResolucion(): void {
    this.feedback.set(null);
    this.modo.set(ModoPanel.RESOLVER);
  }

  protected aplicarResolucion(): void {
    void this.ejecutar((codigo) => this.store.resolver(codigo, this.resolucion()));
  }

  protected cancelar(): void {
    this.modo.set(ModoPanel.NINGUNO);
    this.nuevaCategoria.set("");
    this.resolucion.set("");
  }

  protected abrirEvidencia(nombre: string): void {
    this.evidenciasAbiertas.update((abiertas) => [...abiertas, nombre]);
  }

  protected estaAbierta(nombre: string): boolean {
    return this.evidenciasAbiertas().includes(nombre);
  }

  private async ejecutar(accion: (codigo: string) => Promise<ResultadoAccion>): Promise<void> {
    const codigo = this.codigo();
    if (!codigo || this.procesando()) return;
    this.procesando.set(true);
    try {
      const resultado = await accion(codigo);
      if (this.codigo() !== codigo) return;
      this.feedback.set(resultado);
      if (resultado.ok) this.cancelar();
    } finally {
      this.procesando.set(false);
    }
  }

  private reiniciar(): void {
    this.cancelar();
    this.feedback.set(null);
    this.evidenciasAbiertas.set([]);
    this.procesando.set(false);
  }
}
