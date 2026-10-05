import { ChangeDetectionStrategy, Component, input } from "@angular/core";

export interface TimelineItem {
  readonly titulo: string;
  readonly detalle?: string;
  readonly hora?: string;
  readonly pendiente?: boolean;
}

@Component({
  selector: "app-timeline",
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: "block" },
  template: `
    <ol class="space-y-6 border-l border-gray-200 pl-6" [attr.aria-label]="label()">
      @for (item of items(); track $index) {
        <li class="relative">
          <span
            class="absolute top-1 -left-7.5 size-3 rounded-full ring-4 ring-white"
            [class]="item.pendiente ? 'bg-gray-300' : 'bg-primary-500'"
            aria-hidden="true"
          ></span>
          <div class="flex items-start justify-between gap-3">
            <p class="text-sm font-bold text-gray-900">{{ item.titulo }}</p>
            @if (item.hora) {
              <p class="shrink-0 text-xs font-medium text-gray-500">{{ item.hora }}</p>
            }
          </div>
          @if (item.detalle) {
            <p class="mt-1 text-sm text-gray-600">{{ item.detalle }}</p>
          }
        </li>
      }
    </ol>
  `,
})
export class Timeline {
  readonly items = input.required<readonly TimelineItem[]>();
  readonly label = input.required<string>();
}
