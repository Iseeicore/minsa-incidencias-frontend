import { ChangeDetectionStrategy, Component, input, model } from "@angular/core";
import { IconName } from "@/shared/enums/icon-name.enum";
import { Icon } from "@/shared/ui/icon/icon";

@Component({
  selector: "app-search-input",
  imports: [Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: "block" },
  template: `
    <label class="relative block">
      <span class="sr-only">{{ label() }}</span>
      <app-icon
        class="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
        [name]="IconName.SEARCH"
        [size]="16"
      />
      <input
        type="search"
        class="w-full rounded-full bg-white py-2.5 pl-11 pr-4 text-sm font-medium text-gray-800 placeholder:text-gray-500 focus-visible:outline-2 focus-visible:outline-primary-500"
        [placeholder]="placeholder()"
        [value]="value()"
        (input)="alEscribir($event)"
      />
    </label>
  `,
})
export class SearchInput {
  readonly label = input.required<string>();
  readonly placeholder = input("Buscar...");
  readonly value = model("");

  protected readonly IconName = IconName;

  protected alEscribir(evento: Event): void {
    this.value.set((evento.target as HTMLInputElement).value);
  }
}
