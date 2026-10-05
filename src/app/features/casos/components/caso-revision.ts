import { ChangeDetectionStrategy, Component, computed, effect, inject, model, signal, untracked } from "@angular/core";
import { PLAZOS_TOKEN } from "@/core/config/plazos.config";
import { CasosStore, MAX_RESOLUCION } from "@/features/casos/casos.store";
import {
  CATEGORIA_LABEL,
  ESTADO_BADGE,
  PRIORIDAD_CASO_BADGE,
  SIN_DATO,
  TIPO_EVIDENCIA_LABEL,
} from "@/features/casos/constants/casos-constants";
import { AccionCaso } from "@/features/casos/enums/accion-caso.enum";
import { CategoriaCaso } from "@/features/casos/enums/categoria-caso.enum";
import { EstadoCaso } from "@/features/casos/enums/estado-caso.enum";
import { ModoPanel } from "@/features/casos/enums/modo-panel.enum";
import type { ResultadoAccion } from "@/features/casos/types/caso.types";
import { accionesPermitidas } from "@/features/casos/utils/acciones-caso";
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
  protected readonly plazos = inject(PLAZOS_TOKEN);

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

  protected readonly caso = computed(() => {
    const codigo = this.codigo();
    return codigo ? (this.store.casos().find((candidato) => candidato.codigo === codigo) ?? null) : null;
  });

  protected readonly acciones = computed(() => {
    const caso = this.caso();
    return caso ? accionesPermitidas(caso, this.store.rol()) : [];
  });

  protected readonly plazoTexto = computed(() => {
    const caso = this.caso();
    return caso ? textoPlazo(caso, this.plazos) : "";
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

  protected readonly areaDestino = computed(() => areaDe(this.caso()?.categoria ?? null));

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
      this.codigo();
      untracked(() => this.reiniciar());
    });
  }

  protected alCambiarPanel(abierto: boolean): void {
    if (!abierto) this.codigo.set(null);
  }

  protected confirmar(): void {
    this.ejecutar((codigo) => this.store.confirmar(codigo));
  }

  protected derivar(): void {
    this.ejecutar((codigo) => this.store.derivar(codigo));
  }

  protected tomar(): void {
    this.ejecutar((codigo) => this.store.tomar(codigo));
  }

  protected abrirCorreccion(): void {
    this.feedback.set(null);
    this.modo.set(ModoPanel.CORREGIR);
  }

  protected aplicarCorreccion(): void {
    const nueva = this.nuevaCategoria();
    if (!nueva) return;
    this.ejecutar((codigo) => this.store.corregir(codigo, nueva as CategoriaCaso));
  }

  protected abrirResolucion(): void {
    this.feedback.set(null);
    this.modo.set(ModoPanel.RESOLVER);
  }

  protected aplicarResolucion(): void {
    this.ejecutar((codigo) => this.store.resolver(codigo, this.resolucion()));
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

  private ejecutar(accion: (codigo: string) => ResultadoAccion): void {
    const codigo = this.codigo();
    if (!codigo) return;
    const resultado = accion(codigo);
    this.feedback.set(resultado);
    if (resultado.ok) this.cancelar();
  }

  private reiniciar(): void {
    this.cancelar();
    this.feedback.set(null);
    this.evidenciasAbiertas.set([]);
  }
}
