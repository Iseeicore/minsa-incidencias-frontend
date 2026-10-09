import { ChangeDetectionStrategy, Component, input, model } from "@angular/core";
import { CAMPO_BASE, CAMPO_VALIDO } from "@/shared/constants/campo-clases";
import { IconName } from "@/shared/enums/icon-name.enum";
import { Icon } from "@/shared/ui/icon/icon";

const INPUT_CLASSES = `campo-busqueda ${CAMPO_BASE} ${CAMPO_VALIDO} rounded-md py-2.5 pl-10 pr-10 text-sm font-medium`;

@Component({
  selector: "app-search-input",
  imports: [Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: "block" },
  template: `
    <div class="relative">
      <label class="block">
        <span class="sr-only">{{ label() }}</span>
        <app-icon
          class="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500"
          [name]="IconName.SEARCH"
          [size]="16"
        />
        <input
          type="search"
          [class]="inputClasses"
          [placeholder]="placeholder()"
          [value]="value()"
          (input)="alEscribir($event)"
        />
      </label>
      @if (value() !== "") {
        <button
          type="button"
          class="absolute right-2 top-1/2 inline-flex size-7 -translate-y-1/2 items-center justify-center rounded-full text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 focus-visible:outline-2 focus-visible:outline-primary-500"
          [attr.aria-label]="'Limpiar ' + label().toLowerCase()"
          (click)="limpiar()"
        >
          <app-icon [name]="IconName.CLOSE" [size]="14" />
        </button>
      }
    </div>
  `,
})
export class SearchInput {
  readonly label = input.required<string>();
  readonly placeholder = input("Buscar...");
  readonly value = model("");

  protected readonly IconName = IconName;
  protected readonly inputClasses = INPUT_CLASSES;

  protected alEscribir(evento: Event): void {
    this.value.set((evento.target as HTMLInputElement).value);
  }

  protected limpiar(): void {
    this.value.set("");
  }
}
