import { booleanAttribute, computed, Directive, input } from "@angular/core";
import { joinClasses } from "@/shared/utils/join-classes";

const BASE_CLASSES =
  "w-full rounded-md border-2 py-2.5 pl-3 text-gray-800 transition-colors focus:outline-none";
const VALID_CLASSES = "border-gray-200 hover:border-gray-300 focus:border-primary-500";
const INVALID_CLASSES = "border-danger-200 focus:border-danger-500";
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
      this.invalid() ? INVALID_CLASSES : VALID_CLASSES,
      this.withEndIcon() ? END_PADDING_CLASSES.withIcon : END_PADDING_CLASSES.default,
    ),
  );
}
