import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { firstValueFrom } from "rxjs";
import { API_BASE_URL } from "@/core/config/api.config";
import { toAuthError } from "./auth-error";
import type { Credentials } from "./auth.types";

@Injectable({ providedIn: "root" })
export class AuthService {
  private readonly http = inject(HttpClient);

  async login(credentials: Credentials): Promise<void> {
    try {
      await firstValueFrom(
        this.http.post<void>(`${API_BASE_URL}/auth/login`, credentials, { withCredentials: true }),
      );
    } catch (error) {
      throw toAuthError(error);
    }
  }
}
