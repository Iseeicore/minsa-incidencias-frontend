import { booleanAttribute, ChangeDetectionStrategy, Component, input } from "@angular/core";
import type { IconName } from "@/shared/enums/icon-name.enum";
import { Icon } from "@/shared/ui/icon/icon";

@Component({
  selector: "app-icon-button",
  imports: [Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: "contents" },
  template: `
    <button
      type="button"
      class="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-white text-gray-700 transition-colors hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500 disabled:cursor-not-allowed disabled:opacity-50"
      [attr.aria-label]="label()"
      [disabled]="disabled()"
    >
      <app-icon [name]="icon()" [size]="18" />
    </button>
  `,
})
export class IconButton {
  readonly icon = input.required<IconName>();
  readonly label = input.required<string>();
  readonly disabled = input(false, { transform: booleanAttribute });
}
