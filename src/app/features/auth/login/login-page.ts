import { ChangeDetectionStrategy, Component } from "@angular/core";
import { AuthLayout } from "@/shared/layouts/auth-layout/auth-layout";
import { LOGIN_ASIDE_ITEMS } from "@/features/auth/constants/auth-messages";
import { LoginForm } from "./login-form";

@Component({
  selector: "app-login-page",
  imports: [AuthLayout, LoginForm],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: "./login-page.html",
})
export class LoginPage {
  protected readonly asideItems = LOGIN_ASIDE_ITEMS;
}
