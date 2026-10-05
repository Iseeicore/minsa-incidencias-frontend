import { ChangeDetectionStrategy, Component, input } from "@angular/core";
import { BadgeTone } from "@/shared/enums/badge.enum";
import { Badge } from "@/shared/ui/badge/badge";
import { Card } from "@/shared/ui/card/card";

@Component({
  selector: "app-stat-card",
  imports: [Card, Badge],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: "block" },
  template: `
    <app-card>
      <p class="text-sm font-medium text-gray-600">{{ label() }}</p>
      <p class="mt-2 text-3xl font-bold text-gray-900">{{ value() }}</p>
      <app-badge class="mt-3" [tone]="tone()">{{ delta() }}</app-badge>
    </app-card>
  `,
})
export class StatCard {
  readonly label = input.required<string>();
  readonly value = input.required<string>();
  readonly delta = input.required<string>();
  readonly tone = input<BadgeTone>(BadgeTone.NEUTRAL);
}
