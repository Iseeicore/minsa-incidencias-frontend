import { booleanAttribute, ChangeDetectionStrategy, Component, computed, input, output } from "@angular/core";
import { IconName } from "@/shared/enums/icon-name.enum";
import { Icon } from "@/shared/ui/icon/icon";

const BOTON_CLASSES =
  "inline-flex items-center gap-1 rounded text-xs font-medium text-gray-500 hover:text-gray-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500";

@Component({
  selector: "app-sort-header",
  imports: [Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: "inline-flex" },
  template: `
    <button type="button" [class]="botonClasses" [attr.aria-label]="etiqueta()" (click)="ordenar.emit()">
      {{ label() }}
      @if (activo()) {
        <app-icon
          [name]="direccion() === 'asc' ? IconName.ARROW_UP : IconName.ARROW_DOWN"
          [size]="14"
          [attr.data-direccion]="direccion()"
        />
      } @else {
        <app-icon [name]="IconName.ARROWS_UP_DOWN" [size]="14" />
      }
    </button>
  `,
})
export class SortHeader {
  readonly label = input.required<string>();
  readonly activo = input(false, { transform: booleanAttribute });
  readonly direccion = input<"asc" | "desc">("asc");
  readonly ordenar = output<void>();

  protected readonly IconName = IconName;
  protected readonly botonClasses = BOTON_CLASSES;

  protected readonly etiqueta = computed(() => {
    if (!this.activo()) return `Ordenar por ${this.label()}`;
    const orden = this.direccion() === "asc" ? "ascendente" : "descendente";
    return `Ordenar por ${this.label()}, orden ${orden} actual`;
  });
}
