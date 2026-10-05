import { ChangeDetectionStrategy, Component, input, model } from "@angular/core";

export interface TabOption {
  readonly value: string;
  readonly label: string;
}

const TAB_BASE_CLASSES =
  "rounded-full px-3 py-1.5 text-sm font-medium transition-colors sm:px-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500";
const TAB_ACTIVE_CLASSES = `${TAB_BASE_CLASSES} bg-gray-900 text-white`;
const TAB_IDLE_CLASSES = `${TAB_BASE_CLASSES} text-gray-600 hover:bg-gray-200`;

@Component({
  selector: "app-tabs",
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: "inline-flex" },
  template: `
    <div role="tablist" [attr.aria-label]="label()" class="inline-flex gap-1 rounded-full bg-gray-100 p-1">
      @for (option of options(); track option.value) {
        <button
          type="button"
          role="tab"
          [attr.aria-selected]="option.value === value()"
          [class]="option.value === value() ? activeClasses : idleClasses"
          (click)="value.set(option.value)"
        >
          {{ option.label }}
        </button>
      }
    </div>
  `,
})
export class Tabs {
  readonly options = input.required<readonly TabOption[]>();
  readonly label = input.required<string>();
  readonly value = model.required<string>();

  protected readonly activeClasses = TAB_ACTIVE_CLASSES;
  protected readonly idleClasses = TAB_IDLE_CLASSES;
}
