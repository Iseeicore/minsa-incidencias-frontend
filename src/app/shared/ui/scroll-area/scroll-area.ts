import { ChangeDetectionStrategy, Component, input } from "@angular/core";

@Component({
  selector: "app-scroll-area",
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class:
      "relative block max-w-full overflow-x-auto overscroll-x-contain focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500",
    role: "region",
    tabindex: "0",
    "[attr.aria-label]": "label()",
  },
  template: "<ng-content />",
})
export class ScrollArea {
  readonly label = input.required<string>();
}
