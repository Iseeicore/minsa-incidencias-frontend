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
  ESTILO_JERARQUIA,
  ETIQUETA_BOTON_ACCION,
  ICONO_ACCION,
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
import { JerarquiaAccion } from "@/features/casos/enums/jerarquia-accion.enum";
import { ModoPanel } from "@/features/casos/enums/modo-panel.enum";
import { MotivoArchivo } from "@/features/casos/enums/motivo-archivo.enum";
import type { AreaOpcion } from "@/features/casos/types/area.types";
import type { DatosResolucion, ResultadoAccion } from "@/features/casos/types/caso.types";
import { categoriasCorregibles, corregirASaleDeLaBandeja, tipoAreaDeDestino } from "@/features/casos/utils/categorias-corregibles";
import { tonoConfianza } from "@/features/casos/utils/confianza-tone";
import { jerarquiaDeAcciones } from "@/features/casos/utils/jerarquia-acciones";
import { textoRenipress } from "@/features/casos/utils/texto-establecimiento";
import { textoPlazo, textoReapertura } from "@/features/casos/utils/texto-plazo";
import { BadgeTone } from "@/shared/enums/badge.enum";
import { ButtonSize, ButtonTone, ButtonVariant } from "@/shared/enums/button.enum";
import { IconName } from "@/shared/enums/icon-name.enum";
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
  protected readonly IconName = IconName;
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
  protected readonly etiquetaAccion = ETIQUETA_BOTON_ACCION;
  protected readonly iconoAccion = ICONO_ACCION;

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

  /** Principal primero y luego las secundarias; las destructivas van en su propio grupo, separado. */
  protected readonly botonesDeAvance = computed(() => {
    const { principal, secundarias } = this.jerarquia();
    const botones = secundarias.map((accion) => ({ accion, ...ESTILO_JERARQUIA[JerarquiaAccion.SECUNDARIA] }));
    return principal === null ? botones : [{ accion: principal, ...ESTILO_JERARQUIA[JerarquiaAccion.PRINCIPAL] }, ...botones];
  });

  protected readonly botonesDestructivos = computed(() =>
    this.jerarquia().destructivas.map((accion) => ({ accion, ...ESTILO_JERARQUIA[JerarquiaAccion.DESTRUCTIVA] })),
  );

  private readonly jerarquia = computed(() => {
    const caso = this.caso();
    return jerarquiaDeAcciones(caso ?? { estado: EstadoCaso.REGISTRADO, revisadoPorHumano: false }, this.acciones());
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

  /** La categoría actual va primero y marcada; el resto son las que se pueden elegir. */
  protected readonly opcionesCategoria = computed<readonly SelectOption[]>(() => {
    const actual = this.caso()?.categoria ?? null;
    return [
      actual === null
        ? { value: "", label: "Elige una categoría" }
        : { value: actual, label: `Actual: ${CATEGORIA_LABEL[actual]}` },
      ...categoriasCorregibles()
        .filter((categoria) => categoria !== actual)
        .map((categoria) => ({ value: categoria, label: CATEGORIA_LABEL[categoria] })),
    ];
  });

  protected readonly puedeAplicarCorreccion = computed(() => this.nuevaCategoriaDistinta() !== null);

  protected readonly saleDeMiBandeja = computed(() => corregirASaleDeLaBandeja(this.area()?.tipo ?? null, this.nuevaCategoria()));
  protected readonly avisoCorrupcion = computed(
    () => this.nuevaCategoriaDistinta() === CategoriaCaso.DENUNCIA_CORRUPCION && !this.saleDeMiBandeja(),
  );

  /** La categoría elegida si es otra que la actual; `null` mientras siga la actual o no se haya elegido nada. */
  private readonly nuevaCategoriaDistinta = computed(() => {
    const nueva = this.nuevaCategoria();
    return nueva === "" || nueva === this.caso()?.categoria ? null : nueva;
  });


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
    this.nuevaCategoria.set(this.caso()?.categoria ?? "");
    this.modo.set(ModoPanel.CORREGIR);
  }

  protected aplicarCorreccion(): void {
    const nueva = this.nuevaCategoriaDistinta();
    if (!nueva) return;
    if (this.saleDeMiBandeja() && !this.confirmandoOtrans()) {
      this.confirmandoOtrans.set(true);
      return;
    }
    void this.ejecutar((codigo) => this.store.corregir(codigo, nueva as CategoriaCaso));
  }

  protected iniciar(accion: AccionCaso): void {
    switch (accion) {
      case AccionCaso.CONFIRMAR:
        return this.confirmar();
      case AccionCaso.CORREGIR:
        return this.abrirCorreccion();
      case AccionCaso.DERIVAR:
        return this.abrirDerivacion();
      case AccionCaso.TOMAR:
        return this.tomar();
      case AccionCaso.RESOLVER:
        return this.abrirResolucion();
      case AccionCaso.ARCHIVAR:
        return this.abrirArchivo();
      case AccionCaso.REABRIR:
        return this.abrirReapertura();
    }
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
