import { ChangeDetectionStrategy, Component } from "@angular/core";
import { BadgeTone } from "@/shared/enums/badge.enum";
import { Alert } from "@/shared/ui/alert/alert";

@Component({
  selector: "app-sin-acceso-page",
  imports: [Alert],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: "./sin-acceso-page.html",
})
export class SinAccesoPage {
  protected readonly BadgeTone = BadgeTone;
}
