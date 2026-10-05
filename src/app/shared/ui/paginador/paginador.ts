import { ChangeDetectionStrategy, Component, computed, input, model } from "@angular/core";
import { IconName } from "@/shared/enums/icon-name.enum";
import { Icon } from "@/shared/ui/icon/icon";
import { ELIPSIS, paginasVisibles } from "@/shared/utils/paginas-visibles";

const BOTON_BASE =
  "inline-flex size-9 items-center justify-center rounded-full text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500 disabled:cursor-not-allowed disabled:opacity-40";
const BOTON_NUMERO = `${BOTON_BASE} text-gray-700 hover:bg-gray-100`;
const BOTON_ACTUAL = `${BOTON_BASE} bg-gray-900 text-white`;

@Component({
  selector: "app-paginador",
  imports: [Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: "block" },
  template: `
    @if (total() > 0) {
      <nav
        [attr.aria-label]="label()"
        class="flex flex-col items-center gap-3 sm:flex-row sm:justify-between"
      >
        <p class="text-sm font-medium text-gray-600" aria-live="polite">{{ desde() }}-{{ hasta() }} de {{ total() }}</p>
        @if (totalPaginas() > 1) {
          <div class="flex max-w-full items-center gap-1 overflow-x-auto">
            <button
              type="button"
              [class]="botonNumero"
              aria-label="Página anterior"
              [disabled]="pagina() <= 1"
              (click)="ir(pagina() - 1)"
            >
              <app-icon [name]="IconName.CHEVRON_LEFT" [size]="16" />
            </button>
            @for (item of paginas(); track $index) {
              @if (item === elipsis) {
                <span class="inline-flex size-9 items-center justify-center text-gray-500" aria-hidden="true" data-elipsis>
                  {{ elipsis }}
                </span>
              } @else {
                <button
                  type="button"
                  data-pagina
                  [class]="item === pagina() ? botonActual : botonNumero"
                  [attr.aria-label]="'Página ' + item"
                  [attr.aria-current]="item === pagina() ? 'page' : null"
                  (click)="ir(+item)"
                >
                  {{ item }}
                </button>
              }
            }
            <button
              type="button"
              [class]="botonNumero"
              aria-label="Página siguiente"
              [disabled]="pagina() >= totalPaginas()"
              (click)="ir(pagina() + 1)"
            >
              <app-icon [name]="IconName.CHEVRON_RIGHT" [size]="16" />
            </button>
          </div>
        }
      </nav>
    }
  `,
})
export class Paginador {
  readonly pagina = model.required<number>();
  readonly total = input.required<number>();
  readonly tamano = input(20);
  readonly label = input("Paginación");

  protected readonly IconName = IconName;
  protected readonly elipsis = ELIPSIS;
  protected readonly botonNumero = BOTON_NUMERO;
  protected readonly botonActual = BOTON_ACTUAL;

  protected readonly totalPaginas = computed(() => Math.ceil(this.total() / this.tamano()));
  protected readonly desde = computed(() => (this.pagina() - 1) * this.tamano() + 1);
  protected readonly hasta = computed(() => Math.min(this.pagina() * this.tamano(), this.total()));
  protected readonly paginas = computed(() => paginasVisibles(this.pagina(), this.totalPaginas()));

  protected ir(destino: number): void {
    if (destino === this.pagina() || destino < 1 || destino > this.totalPaginas()) return;
    this.pagina.set(destino);
  }
}
