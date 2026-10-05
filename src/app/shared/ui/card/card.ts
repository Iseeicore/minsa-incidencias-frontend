import { ChangeDetectionStrategy, Component, input } from "@angular/core";

@Component({
  selector: "app-card",
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: "block min-w-0 rounded-2xl bg-white p-4 sm:p-5" },
  template: `
    @if (titulo(); as texto) {
      <h2 class="mb-4 text-base font-bold text-gray-900">{{ texto }}</h2>
    }
    <ng-content />
  `,
})
export class Card {
  readonly titulo = input<string>();
}
