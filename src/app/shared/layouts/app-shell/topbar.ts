import { booleanAttribute, ChangeDetectionStrategy, Component, computed, input, output } from "@angular/core";
import { IconName } from "@/shared/enums/icon-name.enum";
import { Icon } from "@/shared/ui/icon/icon";
import { IconButton } from "@/shared/ui/icon-button/icon-button";
import { formatToday } from "@/shared/utils/format-today";
import { firstName } from "@/shared/utils/initials";

@Component({
  selector: "app-topbar",
  imports: [Icon, IconButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: "flex items-center justify-between gap-4 px-6 py-4" },
  template: `
    <div class="flex items-center gap-3">
      <app-icon-button
        [icon]="compact() ? IconName.SIDEBAR_OPEN : IconName.SIDEBAR_CLOSE"
        [label]="compact() ? 'Expandir el menú' : 'Contraer el menú'"
        (click)="alternar.emit()"
      />
      <p class="text-sm text-gray-600">Hola, {{ saludo() }}</p>
    </div>
    <div class="flex items-center gap-2">
      <span class="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-sm text-gray-700">
        <app-icon [name]="IconName.CALENDAR" [size]="16" />
        {{ hoy }}
      </span>
      <app-icon-button [icon]="IconName.BELL" label="Alertas (próximamente)" disabled />
    </div>
  `,
})
export class Topbar {
  readonly nombre = input.required<string>();
  readonly compact = input(false, { transform: booleanAttribute });
  readonly alternar = output<void>();

  protected readonly IconName = IconName;
  protected readonly hoy = formatToday();
  protected readonly saludo = computed(() => firstName(this.nombre()));
}
