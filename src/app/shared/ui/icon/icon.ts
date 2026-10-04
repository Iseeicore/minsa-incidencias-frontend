import { Component, computed, input } from "@angular/core";
import { LucideDynamicIcon } from "@lucide/angular";
import type { IconName } from "@/shared/enums/icon-name.enum";
import { ICONS } from "./icon.registry";

@Component({
  selector: "app-icon",
  imports: [LucideDynamicIcon],
  host: { class: "inline-flex" },
  template: `<svg [lucideIcon]="data()" [size]="size()" />`,
})
export class Icon {
  readonly name = input.required<IconName>();
  readonly size = input(18);
  protected readonly data = computed(() => ICONS[this.name()]);
}
