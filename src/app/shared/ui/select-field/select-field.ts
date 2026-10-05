import { ChangeDetectionStrategy, Component, input, model } from "@angular/core";
import { IconName } from "@/shared/enums/icon-name.enum";
import { Icon } from "@/shared/ui/icon/icon";

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
      <span class="sr-only">{{ label() }}</span>
      <select
        class="w-full appearance-none rounded-full bg-white py-2.5 pl-4 pr-10 text-sm font-medium text-gray-700 focus-visible:outline-2 focus-visible:outline-primary-500"
        (change)="alCambiar($event)"
      >
        @for (opcion of options(); track opcion.value) {
          <option [value]="opcion.value" [selected]="opcion.value === value()">{{ opcion.label }}</option>
        }
      </select>
      <app-icon
        class="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-500"
        [name]="IconName.CHEVRON_DOWN"
        [size]="14"
      />
    </label>
  `,
})
export class SelectField {
  readonly options = input.required<readonly SelectOption[]>();
  readonly label = input.required<string>();
  readonly value = model.required<string>();

  protected readonly IconName = IconName;

  protected alCambiar(evento: Event): void {
    this.value.set((evento.target as HTMLSelectElement).value);
  }
}
