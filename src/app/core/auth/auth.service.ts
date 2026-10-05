import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { firstValueFrom, type Observable } from "rxjs";
import { API_BASE_URL } from "@/core/config/api.config";
import { toAuthError } from "./auth-error";
import { AUTH_PATH } from "./auth.paths";
import type { Credentials, SesionUsuario } from "./auth.types";

@Injectable({ providedIn: "root" })
export class AuthService {
  private readonly http = inject(HttpClient);

  async login(credentials: Credentials): Promise<void> {
    await this.request(this.http.post<void>(`${API_BASE_URL}${AUTH_PATH.LOGIN}`, credentials, { withCredentials: true }));
  }

  me(): Promise<SesionUsuario> {
    return this.request(this.http.get<SesionUsuario>(`${API_BASE_URL}${AUTH_PATH.ME}`, { withCredentials: true }));
  }

  async logout(): Promise<void> {
    await this.request(this.http.post<void>(`${API_BASE_URL}${AUTH_PATH.LOGOUT}`, null, { withCredentials: true }));
  }

  private async request<T>(call: Observable<T>): Promise<T> {
    try {
      return await firstValueFrom(call);
    } catch (error) {
      throw toAuthError(error);
    }
  }
}
