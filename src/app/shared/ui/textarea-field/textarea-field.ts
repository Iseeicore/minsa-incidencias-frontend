import { booleanAttribute, ChangeDetectionStrategy, Component, computed, input, model } from "@angular/core";
import { CAMPO_BASE, CAMPO_INVALIDO, CAMPO_VALIDO } from "@/shared/constants/campo-clases";
import { joinClasses } from "@/shared/utils/join-classes";

const BASE_CLASSES = `${CAMPO_BASE} resize-y rounded-md p-3 text-sm`;

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
    joinClasses(BASE_CLASSES, this.invalid() ? CAMPO_INVALIDO : CAMPO_VALIDO),
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
