import { ChangeDetectionStrategy, Component, input, output } from "@angular/core";
import { IconName } from "@/shared/enums/icon-name.enum";
import { Icon } from "@/shared/ui/icon/icon";

@Component({
  selector: "app-chip-quitable",
  imports: [Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: "inline-flex min-w-0 max-w-full" },
  template: `
    <button
      type="button"
      class="inline-flex min-w-0 max-w-full items-center gap-1.5 rounded-full bg-primary-50 py-1 pl-3 pr-2 text-sm font-medium text-primary-700 transition-colors hover:bg-primary-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
      [attr.aria-label]="'Quitar filtro: ' + label()"
      [attr.title]="label()"
      (click)="quitar.emit()"
    >
      <span class="min-w-0 truncate">{{ label() }}</span>
      <app-icon [name]="IconName.CLOSE" [size]="14" />
    </button>
  `,
})
export class ChipQuitable {
  readonly label = input.required<string>();
  readonly quitar = output();

  protected readonly IconName = IconName;
}
