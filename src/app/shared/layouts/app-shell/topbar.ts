import { booleanAttribute, ChangeDetectionStrategy, Component, computed, input, output } from "@angular/core";
import { IconName } from "@/shared/enums/icon-name.enum";
import { Icon } from "@/shared/ui/icon/icon";
import { IconButton } from "@/shared/ui/icon-button/icon-button";
import { formatLongDate } from "@/shared/utils/format-today";
import { firstName } from "@/shared/utils/initials";

@Component({
  selector: "app-topbar",
  imports: [Icon, IconButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: "flex items-center justify-between gap-3 px-4 py-4 sm:px-6" },
  template: `
    <div class="flex min-w-0 items-center gap-3">
      <app-icon-button [icon]="iconoMenu()" [label]="etiquetaMenu()" (click)="alternar.emit()" />
      <p class="hidden truncate text-sm font-medium text-gray-600 sm:block">Hola, {{ saludo() }}</p>
    </div>
    <div class="flex shrink-0 items-center gap-2">
      <span
        role="img"
        tabindex="0"
        class="inline-flex size-10 items-center justify-center rounded-full bg-white text-gray-700 focus-visible:outline-2 focus-visible:outline-primary-500"
        [attr.title]="fecha"
        [attr.aria-label]="fecha"
      >
        <app-icon [name]="IconName.CALENDAR" [size]="18" />
      </span>
      <ng-content select="[avisos]" />
    </div>
  `,
})
export class Topbar {
  readonly nombre = input.required<string>();
  readonly compact = input(false, { transform: booleanAttribute });
  readonly pantallaChica = input(false, { transform: booleanAttribute });
  readonly alternar = output<void>();

  protected readonly IconName = IconName;
  protected readonly fecha = formatLongDate();
  protected readonly saludo = computed(() => firstName(this.nombre()));

  protected readonly iconoMenu = computed(() => {
    if (this.pantallaChica()) return IconName.MENU;
    return this.compact() ? IconName.SIDEBAR_OPEN : IconName.SIDEBAR_CLOSE;
  });

  protected readonly etiquetaMenu = computed(() => {
    if (this.pantallaChica()) return "Abrir el menú";
    return this.compact() ? "Expandir el menú" : "Contraer el menú";
  });
}
