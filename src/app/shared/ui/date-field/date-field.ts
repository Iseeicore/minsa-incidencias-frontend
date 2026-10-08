import { booleanAttribute, ChangeDetectionStrategy, Component, input, model } from "@angular/core";
import { IconName } from "@/shared/enums/icon-name.enum";
import { Icon } from "@/shared/ui/icon/icon";
import { TextInput } from "@/shared/ui/text-input/text-input";

/** Fecha con el selector nativo del navegador. El valor es `YYYY-MM-DD`, o vacío si no hay fecha completa. */
@Component({
  selector: "app-date-field",
  imports: [Icon, TextInput],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: "block" },
  template: `
    <label class="block">
      <span class="mb-1 block text-sm font-medium text-gray-700">{{ label() }}</span>
      <span class="relative block">
        <input
          type="date"
          appTextInput
          withEndIcon
          class="campo-fecha text-sm"
          [invalid]="invalid()"
          [value]="value()"
          (input)="alEscribir($event)"
        />
        <app-icon
          class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
          [name]="IconName.CALENDAR"
          [size]="16"
        />
      </span>
    </label>
  `,
})
export class DateField {
  readonly label = input.required<string>();
  readonly value = model("");
  readonly invalid = input(false, { transform: booleanAttribute });

  protected readonly IconName = IconName;

  protected alEscribir(evento: Event): void {
    this.value.set((evento.target as HTMLInputElement).value);
  }
}
