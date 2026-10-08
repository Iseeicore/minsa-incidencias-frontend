import { booleanAttribute, ChangeDetectionStrategy, Component, computed, input } from "@angular/core";
import { ButtonSize, ButtonTone, ButtonVariant } from "@/shared/enums/button.enum";
import { IconName } from "@/shared/enums/icon-name.enum";
import { joinClasses } from "@/shared/utils/join-classes";
import { Icon } from "@/shared/ui/icon/icon";

const BASE_CLASSES =
  "inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-60";

const SIZE_CLASSES: Record<ButtonSize, string> = {
  [ButtonSize.SM]: "px-3 py-1.5 text-sm",
  [ButtonSize.MD]: "px-4 py-3 text-base",
};

const ICON_SIZES: Record<ButtonSize, number> = {
  [ButtonSize.SM]: 16,
  [ButtonSize.MD]: 18,
};

const VARIANT_TONE_CLASSES: Record<ButtonVariant, Record<ButtonTone, string>> = {
  [ButtonVariant.SOLID]: {
    [ButtonTone.PRIMARY]:
      "bg-primary-500 text-white hover:bg-primary-600 active:bg-primary-700 focus-visible:outline-primary-500",
    [ButtonTone.DANGER]:
      "bg-danger-500 text-white hover:bg-danger-600 active:bg-danger-700 focus-visible:outline-danger-500",
    [ButtonTone.NEUTRAL]:
      "bg-gray-500 text-white hover:bg-gray-600 active:bg-gray-700 focus-visible:outline-gray-500",
  },
  [ButtonVariant.OUTLINE]: {
    [ButtonTone.PRIMARY]:
      "border border-primary-500 text-primary-700 hover:bg-primary-50 focus-visible:outline-primary-500",
    [ButtonTone.DANGER]:
      "border border-danger-500 text-danger-700 hover:bg-danger-50 focus-visible:outline-danger-500",
    [ButtonTone.NEUTRAL]:
      "border border-gray-300 text-gray-700 hover:bg-gray-100 focus-visible:outline-gray-500",
  },
};

@Component({
  selector: "app-button",
  imports: [Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: "contents" },
  template: `
    <button [type]="type()" [class]="classes()" [disabled]="disabled() || loading()" [attr.aria-busy]="loading()">
      @if (loading()) {
        <app-icon [name]="IconName.SPINNER" class="animate-spin" [size]="iconSize()" />
      } @else if (icon(); as nombre) {
        <app-icon [name]="nombre" [size]="iconSize()" />
      }
      <ng-content />
    </button>
  `,
})
export class Button {
  readonly type = input<"button" | "submit">("button");
  readonly variant = input<ButtonVariant>(ButtonVariant.SOLID);
  readonly tone = input<ButtonTone>(ButtonTone.PRIMARY);
  readonly size = input<ButtonSize>(ButtonSize.MD);
  readonly loading = input(false, { transform: booleanAttribute });
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly block = input(false, { transform: booleanAttribute });
  /** Icono a la izquierda del texto; del registro `Icon`. */
  readonly icon = input<IconName | null>(null);

  protected readonly IconName = IconName;

  protected readonly iconSize = computed(() => ICON_SIZES[this.size()]);

  protected readonly classes = computed(() =>
    joinClasses(
      BASE_CLASSES,
      SIZE_CLASSES[this.size()],
      VARIANT_TONE_CLASSES[this.variant()][this.tone()],
      this.block() && "w-full",
    ),
  );
}
