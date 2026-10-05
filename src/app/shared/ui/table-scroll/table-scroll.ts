import { ChangeDetectionStrategy, Component, input } from "@angular/core";

@Component({
  selector: "app-table-scroll",
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class:
      "block max-h-128 overflow-auto focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500",
    role: "region",
    tabindex: "0",
    "[attr.aria-label]": "label()",
  },
  template: "<ng-content />",
})
export class TableScroll {
  readonly label = input.required<string>();
}
