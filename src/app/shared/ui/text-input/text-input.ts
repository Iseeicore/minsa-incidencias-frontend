import { booleanAttribute, computed, Directive, input } from "@angular/core";
import { CAMPO_BASE, CAMPO_INVALIDO, CAMPO_VALIDO } from "@/shared/constants/campo-clases";
import { joinClasses } from "@/shared/utils/join-classes";

const BASE_CLASSES = `${CAMPO_BASE} rounded-md py-2.5 pl-3`;
const END_PADDING_CLASSES = { default: "pr-3", withIcon: "pr-11" } as const;

@Directive({
  selector: "input[appTextInput]",
  host: {
    "[class]": "classes()",
    "[attr.aria-invalid]": "invalid() || null",
  },
})
export class TextInput {
  readonly invalid = input(false, { transform: booleanAttribute });
  readonly withEndIcon = input(false, { transform: booleanAttribute });

  protected readonly classes = computed(() =>
    joinClasses(
      BASE_CLASSES,
      this.invalid() ? CAMPO_INVALIDO : CAMPO_VALIDO,
      this.withEndIcon() ? END_PADDING_CLASSES.withIcon : END_PADDING_CLASSES.default,
    ),
  );
}
