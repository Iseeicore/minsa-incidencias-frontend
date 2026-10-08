import { ChangeDetectionStrategy, Component, computed, effect, inject, model, signal, untracked } from "@angular/core";
import { SessionStore } from "@/core/auth/session.store";
import { CasosStore } from "@/features/casos/casos.store";
import { AreaSelector } from "@/features/casos/components/area-selector";
import { CasoCierre } from "@/features/casos/components/caso-cierre";
import { FormularioArchivo, type DatosArchivo } from "@/features/casos/components/formulario-archivo";
import { FormularioReapertura } from "@/features/casos/components/formulario-reapertura";
import { FormularioResolucion } from "@/features/casos/components/formulario-resolucion";
import {
  CATEGORIA_LABEL,
  ESTADO_BADGE,
  PRIORIDAD_CASO_BADGE,
  SIN_AREA,
  SIN_DATO,
  SIN_ESTABLECIMIENTO,
  TIPO_EVIDENCIA_LABEL,
} from "@/features/casos/constants/casos-constants";
import { MENSAJE_ERROR } from "@/features/casos/constants/casos-messages";
import { AccionCaso } from "@/features/casos/enums/accion-caso.enum";
import { CargaEstado } from "@/features/casos/enums/carga-estado.enum";
import { CategoriaCaso } from "@/features/casos/enums/categoria-caso.enum";
import { EstadoCaso } from "@/features/casos/enums/estado-caso.enum";
import { ModoPanel } from "@/features/casos/enums/modo-panel.enum";
import { MotivoArchivo } from "@/features/casos/enums/motivo-archivo.enum";
import type { AreaOpcion } from "@/features/casos/types/area.types";
import type { DatosResolucion, ResultadoAccion } from "@/features/casos/types/caso.types";
import { categoriasCorregibles, corregirASaleDeLaBandeja, tipoAreaDeDestino } from "@/features/casos/utils/categorias-corregibles";
import { tonoConfianza } from "@/features/casos/utils/confianza-tone";
import { textoRenipress } from "@/features/casos/utils/texto-establecimiento";
import { textoPlazo, textoReapertura } from "@/features/casos/utils/texto-plazo";
import { BadgeTone } from "@/shared/enums/badge.enum";
import { ButtonSize, ButtonTone, ButtonVariant } from "@/shared/enums/button.enum";
import { Alert } from "@/shared/ui/alert/alert";
import { Badge } from "@/shared/ui/badge/badge";
import { Button } from "@/shared/ui/button/button";
import { Drawer } from "@/shared/ui/drawer/drawer";
import { SelectField, type SelectOption } from "@/shared/ui/select-field/select-field";
import { Timeline } from "@/shared/ui/timeline/timeline";

@Component({
  selector: "app-caso-revision",
  imports: [
    Alert,
    AreaSelector,
    Badge,
    Button,
    CasoCierre,
    Drawer,
    FormularioArchivo,
    FormularioReapertura,
    FormularioResolucion,
    SelectField,
    Timeline,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: "./caso-revision.html",
})
export class CasoRevision {
  private readonly store = inject(CasosStore);
  private readonly area = inject(SessionStore).area;

  readonly codigo = model<string | null>(null);

  protected readonly AccionCaso = AccionCaso;
  protected readonly BadgeTone = BadgeTone;
  protected readonly ButtonSize = ButtonSize;
  protected readonly ButtonTone = ButtonTone;
  protected readonly ButtonVariant = ButtonVariant;
  protected readonly ModoPanel = ModoPanel;
  protected readonly sinDato = SIN_DATO;
  protected readonly sinArea = SIN_AREA;
  protected readonly sinEstablecimiento = SIN_ESTABLECIMIENTO;
  protected readonly renipress = textoRenipress;
  protected readonly categoriaLabel = CATEGORIA_LABEL;
  protected readonly estadoBadge = ESTADO_BADGE;
  protected readonly prioridadBadge = PRIORIDAD_CASO_BADGE;
  protected readonly tipoEvidencia = TIPO_EVIDENCIA_LABEL;
  protected readonly tonoConfianza = tonoConfianza;

  protected readonly modo = signal<ModoPanel>(ModoPanel.NINGUNO);
  protected readonly nuevaCategoria = signal("");
  protected readonly areaElegida = signal<AreaOpcion | null>(null);
  protected readonly feedback = signal<ResultadoAccion | null>(null);
  protected readonly evidenciasAbiertas = signal<readonly string[]>([]);
  protected readonly procesando = signal(false);
  protected readonly confirmandoOtrans = signal(false);

  protected readonly caso = this.store.detalle;
  protected readonly errorCarga = this.store.errorDetalle;
  protected readonly cargando = computed(() => this.store.estadoDetalle() === CargaEstado.CARGANDO);
  protected readonly noDisponible = computed(() => this.errorCarga() === MENSAJE_ERROR.NO_DISPONIBLE);

  protected readonly esCorrupcion = computed(() => this.caso()?.categoria === CategoriaCaso.DENUNCIA_CORRUPCION);
  protected readonly tipoDestino = computed(() => tipoAreaDeDestino(this.caso()?.categoria ?? null));

  /** Las acciones las manda el servidor; solo se oculta reabrir en lo que se archivó por vigencia, que no se reabre. */
  protected readonly acciones = computed(() => {
    const caso = this.caso();
    if (!caso) return [];
    const sinReapertura = caso.archivo?.motivo === MotivoArchivo.RESUELTA_VIGENCIA;
    return caso.acciones.filter((accion) => accion !== AccionCaso.REABRIR || !sinReapertura);
  });

  protected readonly plazoTexto = computed(() => {
    const caso = this.caso();
    return caso ? textoPlazo(caso) : "";
  });

  protected readonly reaperturaTexto = computed(() => {
    const caso = this.caso();
    return caso ? textoReapertura(caso) : null;
  });

  protected readonly hayEvidenciaSensible = computed(() => this.caso()?.evidencias.some((item) => item.sensible) ?? false);

  protected readonly opcionesCategoria = computed<readonly SelectOption[]>(() => [
    { value: "", label: "Elige una categoría" },
    ...categoriasCorregibles()
      .filter((categoria) => categoria !== this.caso()?.categoria)
      .map((categoria) => ({ value: categoria, label: CATEGORIA_LABEL[categoria] })),
  ]);

  protected readonly saleDeMiBandeja = computed(() => corregirASaleDeLaBandeja(this.area()?.tipo ?? null, this.nuevaCategoria()));
  protected readonly avisoCorrupcion = computed(() => this.nuevaCategoria() === CategoriaCaso.DENUNCIA_CORRUPCION && !this.saleDeMiBandeja());

  protected readonly motivoSinAcciones = computed(() => {
    const caso = this.caso();
    if (!caso || this.acciones().length > 0) return "";
    if (caso.archivo?.motivo === MotivoArchivo.RESUELTA_VIGENCIA) {
      return "Este caso se archivó porque la resolución cumplió su vigencia y no se puede reabrir.";
    }
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

  protected abrirDerivacion(): void {
    this.feedback.set(null);
    this.modo.set(ModoPanel.DERIVAR);
  }

  protected aplicarDerivacion(): void {
    const area = this.areaElegida();
    if (!area && !this.esCorrupcion()) return;
    void this.ejecutar((codigo) => this.store.derivar(codigo, area?.codigo));
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
    if (this.saleDeMiBandeja() && !this.confirmandoOtrans()) {
      this.confirmandoOtrans.set(true);
      return;
    }
    void this.ejecutar((codigo) => this.store.corregir(codigo, nueva as CategoriaCaso));
  }

  protected abrirResolucion(): void {
    this.feedback.set(null);
    this.modo.set(ModoPanel.RESOLVER);
  }

  protected aplicarResolucion(datos: DatosResolucion): void {
    void this.ejecutar((codigo) => this.store.resolver(codigo, datos));
  }

  protected abrirArchivo(): void {
    this.feedback.set(null);
    this.modo.set(ModoPanel.ARCHIVAR);
  }

  protected aplicarArchivo(datos: DatosArchivo): void {
    void this.ejecutar((codigo) => this.store.archivar(codigo, datos.motivo, datos.detalle));
  }

  protected abrirReapertura(): void {
    this.feedback.set(null);
    this.modo.set(ModoPanel.REABRIR);
  }

  protected aplicarReapertura(motivo: string): void {
    void this.ejecutar((codigo) => this.store.reabrir(codigo, motivo));
  }

  protected cancelar(): void {
    this.modo.set(ModoPanel.NINGUNO);
    this.nuevaCategoria.set("");
    this.areaElegida.set(null);
    this.confirmandoOtrans.set(false);
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
      if (resultado.ok && resultado.enviadoAOtrans) {
        this.codigo.set(null);
        return;
      }
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
