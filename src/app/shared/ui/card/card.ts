import { ChangeDetectionStrategy, Component, input } from "@angular/core";

@Component({
  selector: "app-card",
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: "block rounded-2xl bg-white p-5" },
  template: `
    @if (titulo(); as texto) {
      <h2 class="mb-4 text-sm font-medium text-gray-600">{{ texto }}</h2>
    }
    <ng-content />
  `,
})
export class Card {
  readonly titulo = input<string>();
}
