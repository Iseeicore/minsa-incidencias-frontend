import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  effect,
  ElementRef,
  inject,
  Injector,
  input,
  model,
} from "@angular/core";
import { IconName } from "@/shared/enums/icon-name.enum";
import { IconButton } from "@/shared/ui/icon-button/icon-button";

const FOCUSABLE = "button:not([disabled]), [href], input, select, textarea, [tabindex]:not([tabindex='-1'])";
let siguienteId = 0;

@Component({
  selector: "app-drawer",
  imports: [IconButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { "(document:keydown.escape)": "cerrar()" },
  template: `
    @if (abierto()) {
      <div class="fixed inset-0 z-40 bg-gray-900/40" aria-hidden="true" (click)="cerrar()"></div>
      <aside
        role="dialog"
        aria-modal="true"
        class="fixed inset-y-0 right-0 z-50 flex w-full flex-col bg-white sm:w-130"
        [attr.aria-labelledby]="tituloId"
        (keydown.tab)="atraparFoco($event, false)"
        (keydown.shift.tab)="atraparFoco($event, true)"
      >
        <header class="flex items-start justify-between gap-3 border-b border-gray-100 p-5">
          <div class="min-w-0">
            <h2 class="text-base font-bold text-gray-900" [id]="tituloId">{{ titulo() }}</h2>
            @if (subtitulo(); as texto) {
              <p class="mt-1 text-sm text-gray-600">{{ texto }}</p>
            }
          </div>
          <app-icon-button [icon]="IconName.CLOSE" label="Cerrar el panel" (click)="cerrar()" />
        </header>
        <div class="min-h-0 flex-1 overflow-y-auto p-5">
          <ng-content />
        </div>
      </aside>
    }
  `,
})
export class Drawer {
  readonly titulo = input.required<string>();
  readonly subtitulo = input<string>();
  readonly abierto = model.required<boolean>();

  protected readonly IconName = IconName;
  protected readonly tituloId = `drawer-titulo-${siguienteId++}`;

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly injector = inject(Injector);
  private elementoPrevio: HTMLElement | null = null;

  constructor() {
    effect(() => {
      if (this.abierto()) {
        this.elementoPrevio = document.activeElement as HTMLElement | null;
        afterNextRender(() => this.host.nativeElement.querySelector<HTMLElement>("button")?.focus(), {
          injector: this.injector,
        });
      } else if (this.elementoPrevio) {
        this.elementoPrevio.focus();
        this.elementoPrevio = null;
      }
    });
  }

  protected cerrar(): void {
    if (this.abierto()) this.abierto.set(false);
  }

  /** Mantiene el foco del teclado dentro del panel mientras está abierto. */
  protected atraparFoco(evento: Event, haciaAtras: boolean): void {
    const enfocables = Array.from(this.host.nativeElement.querySelectorAll<HTMLElement>(FOCUSABLE));
    if (enfocables.length === 0) return;
    const primero = enfocables[0];
    const ultimo = enfocables[enfocables.length - 1];
    const activo = document.activeElement;
    if (haciaAtras && activo === primero) {
      evento.preventDefault();
      ultimo.focus();
    } else if (!haciaAtras && activo === ultimo) {
      evento.preventDefault();
      primero.focus();
    }
  }
}
