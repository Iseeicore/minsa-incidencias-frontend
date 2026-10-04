import { ChangeDetectionStrategy, Component } from "@angular/core";
import { Brand } from "@/shared/ui/brand/brand";

@Component({
  selector: "app-auth-layout",
  imports: [Brand],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: "./auth-layout.html",
})
export class AuthLayout {}
