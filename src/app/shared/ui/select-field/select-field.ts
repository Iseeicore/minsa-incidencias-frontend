import { ChangeDetectionStrategy, Component, input, model } from "@angular/core";
import { CAMPO_BASE, CAMPO_VALIDO } from "@/shared/constants/campo-clases";
import { IconName } from "@/shared/enums/icon-name.enum";
import { Icon } from "@/shared/ui/icon/icon";

const SELECT_CLASSES = `${CAMPO_BASE} ${CAMPO_VALIDO} appearance-none rounded-md py-2.5 pl-3 pr-10 text-sm font-medium`;

export interface SelectOption {
  readonly value: string;
  readonly label: string;
}

@Component({
  selector: "app-select-field",
  imports: [Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: "block" },
  template: `
    <label class="relative block">
      <span [class]="etiquetaVisible() ? 'mb-1 block text-sm font-medium text-gray-700' : 'sr-only'">{{ label() }}</span>
      <span class="relative block">
        <select
          [class]="selectClasses"
          (change)="alCambiar($event)"
        >
          @for (opcion of options(); track opcion.value) {
            <option [value]="opcion.value" [selected]="opcion.value === value()">{{ opcion.label }}</option>
          }
        </select>
        <app-icon
          class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
          [name]="IconName.CHEVRON_DOWN"
          [size]="14"
        />
      </span>
    </label>
  `,
})
export class SelectField {
  readonly options = input.required<readonly SelectOption[]>();
  readonly label = input.required<string>();
  /** Por defecto la etiqueta solo la leen los lectores de pantalla (filtros); en formularios se muestra. */
  readonly etiquetaVisible = input(false);
  readonly value = model.required<string>();

  protected readonly IconName = IconName;
  protected readonly selectClasses = SELECT_CLASSES;

  protected alCambiar(evento: Event): void {
    this.value.set((evento.target as HTMLSelectElement).value);
  }
}
