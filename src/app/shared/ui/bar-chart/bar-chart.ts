import { ChangeDetectionStrategy, Component, computed, input } from "@angular/core";

export interface BarDatum {
  readonly label: string;
  readonly value: number;
}

const BAR_BASE_CLASSES = "w-full max-w-5 rounded-full";
const BAR_HIGHLIGHT_CLASSES = `${BAR_BASE_CLASSES} bg-primary-500`;
const BAR_IDLE_CLASSES = `${BAR_BASE_CLASSES} bg-gray-800`;

@Component({
  selector: "app-bar-chart",
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: "block" },
  template: `
    <div role="img" [attr.aria-label]="description()" class="flex h-52 items-stretch gap-2">
      @for (bar of bars(); track bar.label) {
        <div class="flex min-w-0 flex-1 flex-col gap-2">
          <div class="flex flex-1 items-end justify-center">
            <div
              [class]="bar.highlighted ? highlightClasses : idleClasses"
              [style.height.%]="bar.height"
              [attr.title]="bar.label + ': ' + bar.value"
            ></div>
          </div>
          <span class="truncate text-center text-xs text-gray-500">{{ bar.label }}</span>
        </div>
      }
    </div>
  `,
})
export class BarChart {
  readonly data = input.required<readonly BarDatum[]>();
  readonly description = input.required<string>();

  protected readonly highlightClasses = BAR_HIGHLIGHT_CLASSES;
  protected readonly idleClasses = BAR_IDLE_CLASSES;

  protected readonly bars = computed(() => {
    const max = Math.max(0, ...this.data().map((item) => item.value));
    return this.data().map((item) => ({
      ...item,
      height: max > 0 ? Math.round((item.value / max) * 100) : 0,
      highlighted: max > 0 && item.value === max,
    }));
  });
}
