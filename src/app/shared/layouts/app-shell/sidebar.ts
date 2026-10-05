import { booleanAttribute, ChangeDetectionStrategy, Component, computed, input, output } from "@angular/core";
import { RouterLink, RouterLinkActive } from "@angular/router";
import type { NavSection } from "@/core/nav/nav.types";
import { IconName } from "@/shared/enums/icon-name.enum";
import { Icon } from "@/shared/ui/icon/icon";
import { IconButton } from "@/shared/ui/icon-button/icon-button";
import { SidebarGroup } from "@/shared/ui/sidebar-group/sidebar-group";
import { initials } from "@/shared/utils/initials";
import { joinClasses } from "@/shared/utils/join-classes";

const ENTRY_BASE_CLASSES =
  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium focus-visible:outline-2 focus-visible:outline-primary-500";
const ENTRY_ACTIVE_CLASSES = `${ENTRY_BASE_CLASSES} bg-gray-900 text-white`;
const ENTRY_IDLE_CLASSES = `${ENTRY_BASE_CLASSES} text-gray-700 transition-colors hover:bg-gray-100`;
const ENTRY_DISABLED_CLASSES = `${ENTRY_BASE_CLASSES} cursor-not-allowed text-gray-400`;

@Component({
  selector: "app-sidebar",
  imports: [RouterLink, RouterLinkActive, Icon, IconButton, SidebarGroup],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { "[class]": "hostClasses()" },
  templateUrl: "./sidebar.html",
})
export class Sidebar {
  readonly secciones = input.required<readonly NavSection[]>();
  readonly nombre = input.required<string>();
  readonly correo = input.required<string>();
  readonly compact = input(false, { transform: booleanAttribute });
  readonly cerrar = output<void>();

  protected readonly IconName = IconName;
  protected readonly activeClasses = ENTRY_ACTIVE_CLASSES;
  protected readonly idleClasses = ENTRY_IDLE_CLASSES;
  protected readonly disabledClasses = ENTRY_DISABLED_CLASSES;
  protected readonly iniciales = computed(() => initials(this.nombre()));
  protected readonly hostClasses = computed(() =>
    joinClasses(
      "sticky top-0 block h-dvh shrink-0 p-3 transition-all",
      this.compact() ? "w-sidebar-collapsed" : "w-sidebar",
    ),
  );
}
