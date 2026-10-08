import { ChangeDetectionStrategy, Component, computed, ElementRef, inject, input, model } from "@angular/core";
import { TabsVariante } from "@/shared/enums/tabs.enum";
import { indiceDeTecla } from "@/shared/utils/indice-de-tecla";
import { textoConteo } from "@/shared/utils/texto-conteo";

export interface TabOption {
  readonly value: string;
  readonly label: string;
  /** Si viene, se muestra en una píldora junto al texto; `conMas` agrega el `+` de un conteo acotado. */
  readonly cantidad?: number | null;
  readonly conMas?: boolean;
}

interface EstiloTabs {
  readonly host: string;
  readonly lista: string;
  readonly boton: string;
  readonly activo: string;
  readonly inactivo: string;
  readonly contador: string;
  readonly contadorActivo: string;
  readonly contadorInactivo: string;
}

const FOCO = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500";
const BOTON_BASE = `shrink-0 whitespace-nowrap rounded-full text-sm font-medium transition-colors ${FOCO}`;
const CONTADOR_BASE = "ml-2 min-w-7 rounded-full px-2 py-0.5 text-center text-xs font-bold tabular-nums";
const ACTIVO = "bg-gray-900 text-white";
const CONTADOR_ACTIVO = "bg-white/20 text-white";

const ESTILOS: Record<TabsVariante, EstiloTabs> = {
  [TabsVariante.PILDORA]: {
    host: "relative block max-w-full overflow-x-auto rounded-full",
    lista: "flex w-max gap-1 rounded-full bg-gray-100 p-1",
    boton: `${BOTON_BASE} px-3 py-1.5 sm:px-4`,
    activo: ACTIVO,
    inactivo: "text-gray-600 hover:bg-gray-200",
    contador: CONTADOR_BASE,
    contadorActivo: CONTADOR_ACTIVO,
    contadorInactivo: "bg-white text-gray-700",
  },
  [TabsVariante.TARJETA]: {
    host: "relative block max-w-full overflow-x-auto rounded-2xl bg-white p-2",
    lista: "flex w-max gap-1",
    boton: `${BOTON_BASE} px-4 py-2.5`,
    activo: ACTIVO,
    inactivo: "text-gray-700 hover:bg-gray-100",
    contador: CONTADOR_BASE,
    contadorActivo: CONTADOR_ACTIVO,
    contadorInactivo: "bg-gray-100 text-gray-700",
  },
  [TabsVariante.CHIPS]: {
    host: "relative block max-w-full overflow-x-auto p-1",
    lista: "flex w-max gap-2",
    boton: `${BOTON_BASE} px-3.5 py-1.5`,
    activo: ACTIVO,
    inactivo: "bg-gray-100 text-gray-700 hover:bg-gray-200",
    contador: CONTADOR_BASE,
    contadorActivo: CONTADOR_ACTIVO,
    contadorInactivo: "bg-white text-gray-700",
  },
};

@Component({
  selector: "app-tabs",
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { "[class]": "estilo().host" },
  template: `
    <div role="tablist" [attr.aria-label]="label()" [class]="estilo().lista" (keydown)="alTeclear($event)">
      @for (option of options(); track option.value) {
        <button
          type="button"
          role="tab"
          [attr.aria-selected]="option.value === value()"
          [attr.tabindex]="option.value === enFoco() ? 0 : -1"
          [class]="claseBoton(option.value === value())"
          (click)="value.set(option.value)"
        >
          {{ option.label }}
          @if (option.cantidad !== undefined && option.cantidad !== null) {
            <span [class]="claseContador(option.value === value())">{{ texto(option.cantidad, option.conMas) }}</span>
          }
        </button>
      }
    </div>
  `,
})
export class Tabs {
  private readonly anfitrion = inject<ElementRef<HTMLElement>>(ElementRef);

  readonly options = input.required<readonly TabOption[]>();
  readonly label = input.required<string>();
  readonly variante = input<TabsVariante>(TabsVariante.PILDORA);
  readonly value = model.required<string>();

  protected readonly estilo = computed(() => ESTILOS[this.variante()]);
  protected readonly texto = textoConteo;
  /** Solo una pestaña entra en el orden del Tab: la activa, o la primera si el valor no está entre las opciones. */
  protected readonly enFoco = computed(() => {
    const opciones = this.options();
    return opciones.some((opcion) => opcion.value === this.value()) ? this.value() : opciones[0]?.value;
  });

  protected claseBoton(activa: boolean): string {
    const estilo = this.estilo();
    return `${estilo.boton} ${activa ? estilo.activo : estilo.inactivo}`;
  }

  protected claseContador(activa: boolean): string {
    const estilo = this.estilo();
    return `${estilo.contador} ${activa ? estilo.contadorActivo : estilo.contadorInactivo}`;
  }

  protected alTeclear(evento: KeyboardEvent): void {
    const opciones = this.options();
    const actual = opciones.findIndex((opcion) => opcion.value === this.enFoco());
    const siguiente = indiceDeTecla(evento.key, Math.max(actual, 0), opciones.length);
    if (siguiente === null) return;
    evento.preventDefault();
    this.value.set(opciones[siguiente].value);
    this.anfitrion.nativeElement.querySelectorAll<HTMLElement>("[role='tab']")[siguiente]?.focus();
  }
}
