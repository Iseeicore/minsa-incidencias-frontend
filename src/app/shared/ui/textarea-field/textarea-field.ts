import { booleanAttribute, ChangeDetectionStrategy, Component, computed, input, model } from "@angular/core";
import { joinClasses } from "@/shared/utils/join-classes";

const BASE_CLASSES =
  "w-full resize-y rounded-xl border-2 bg-white p-3 text-sm text-gray-800 transition-colors placeholder:text-gray-500 focus:outline-none";
const VALID_CLASSES = "border-gray-200 hover:border-gray-300 focus:border-primary-500";
const INVALID_CLASSES = "border-danger-200 focus:border-danger-500";

@Component({
  selector: "app-textarea-field",
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: "block" },
  template: `
    <label class="block">
      <span class="mb-1.5 block text-sm font-medium text-gray-700">{{ label() }}</span>
      <textarea
        [class]="classes()"
        [rows]="rows()"
        [placeholder]="placeholder()"
        [value]="value()"
        [attr.maxlength]="maxlength()"
        [attr.aria-invalid]="invalid() || null"
        (input)="alEscribir($event)"
      ></textarea>
    </label>
    @if (maxlength(); as maximo) {
      <p class="mt-1 flex justify-between gap-3 text-xs font-medium text-gray-500">
        <span [class.text-danger-600]="faltaMinimo()">{{ avisoMinimo() }}</span>
        <span>{{ value().length }} / {{ maximo }}</span>
      </p>
    }
  `,
})
export class TextareaField {
  readonly label = input.required<string>();
  readonly placeholder = input("");
  readonly rows = input(4);
  readonly maxlength = input<number>();
  /** Solo avisa cuántos caracteres faltan; quien lo usa decide si bloquea el envío. */
  readonly minlength = input<number>();
  readonly invalid = input(false, { transform: booleanAttribute });
  readonly value = model("");

  protected readonly classes = computed(() =>
    joinClasses(BASE_CLASSES, this.invalid() ? INVALID_CLASSES : VALID_CLASSES),
  );

  protected readonly faltaMinimo = computed(() => {
    const minimo = this.minlength();
    return minimo !== undefined && this.value().trim().length < minimo;
  });

  protected readonly avisoMinimo = computed(() => {
    const minimo = this.minlength();
    return minimo === undefined ? "" : `Mínimo ${minimo} caracteres`;
  });

  protected alEscribir(evento: Event): void {
    this.value.set((evento.target as HTMLTextAreaElement).value);
  }
}
