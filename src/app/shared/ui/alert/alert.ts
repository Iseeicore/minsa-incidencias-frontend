import { ChangeDetectionStrategy, Component, computed, input } from "@angular/core";
import { BadgeTone } from "@/shared/enums/badge.enum";
import { joinClasses } from "@/shared/utils/join-classes";

const BASE_CLASSES = "block rounded-xl px-4 py-3 text-sm font-medium";

const TONE_CLASSES: Record<BadgeTone, string> = {
  [BadgeTone.NEUTRAL]: "bg-gray-100 text-gray-700",
  [BadgeTone.PRIMARY]: "bg-primary-50 text-primary-700",
  [BadgeTone.SUCCESS]: "bg-success-50 text-success-600",
  [BadgeTone.WARNING]: "bg-warning-50 text-warning-600",
  [BadgeTone.DANGER]: "bg-danger-50 text-danger-700",
};

@Component({
  selector: "app-alert",
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { "[class]": "classes()", "[attr.role]": "rol()" },
  template: "<ng-content />",
})
export class Alert {
  readonly tone = input<BadgeTone>(BadgeTone.NEUTRAL);

  protected readonly classes = computed(() => joinClasses(BASE_CLASSES, TONE_CLASSES[this.tone()]));
  protected readonly rol = computed(() => (this.tone() === BadgeTone.DANGER ? "alert" : "status"));
}
