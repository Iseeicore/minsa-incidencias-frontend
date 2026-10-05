import { booleanAttribute, ChangeDetectionStrategy, Component, computed, input, signal } from "@angular/core";
import { IconName } from "@/shared/enums/icon-name.enum";
import { joinClasses } from "@/shared/utils/join-classes";
import { Icon } from "@/shared/ui/icon/icon";

@Component({
  selector: "app-sidebar-group",
  imports: [Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: "block" },
  template: `
    @if (compact()) {
      <div class="mx-3 my-2 border-t border-gray-200"></div>
    } @else {
      <button
        type="button"
        class="flex w-full items-center justify-between rounded-md px-3 py-2 text-xs font-medium uppercase tracking-wide text-gray-500 hover:text-gray-700 focus-visible:outline-2 focus-visible:outline-primary-500"
        [attr.aria-expanded]="abierto()"
        (click)="abierto.update(valor => !valor)"
      >
        {{ titulo() }}
        <app-icon [name]="IconName.CHEVRON_DOWN" [size]="14" [class]="chevronClasses()" />
      </button>
    }
    <div [class.hidden]="!visible()">
      <ng-content />
    </div>
  `,
})
export class SidebarGroup {
  readonly titulo = input.required<string>();
  readonly compact = input(false, { transform: booleanAttribute });

  protected readonly IconName = IconName;
  protected readonly abierto = signal(true);
  protected readonly visible = computed(() => this.compact() || this.abierto());
  protected readonly chevronClasses = computed(() =>
    joinClasses("transition-transform", !this.abierto() && "-rotate-90"),
  );
}
