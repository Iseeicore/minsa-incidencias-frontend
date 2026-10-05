import { ChangeDetectionStrategy, Component, input } from "@angular/core";

@Component({
  selector: "app-progress-bar",
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: "block h-2 overflow-hidden rounded-full bg-gray-100" },
  template: `
    <div
      role="progressbar"
      aria-valuemin="0"
      aria-valuemax="100"
      class="h-full rounded-full bg-primary-500"
      [attr.aria-valuenow]="value()"
      [attr.aria-label]="label()"
      [style.width.%]="value()"
    ></div>
  `,
})
export class ProgressBar {
  readonly value = input.required<number>();
  readonly label = input.required<string>();
}
