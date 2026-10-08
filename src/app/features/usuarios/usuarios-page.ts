import { ChangeDetectionStrategy, Component, computed, inject, signal } from "@angular/core";
import { SessionStore } from "@/core/auth/session.store";
import { AreaSelector } from "@/features/casos/components/area-selector";
import { CargaEstado } from "@/features/casos/enums/carga-estado.enum";
import { ClaveInicialDialogo } from "@/features/usuarios/components/clave-inicial-dialogo";
import { UsuarioEdicion } from "@/features/usuarios/components/usuario-edicion";
import { UsuarioNuevo } from "@/features/usuarios/components/usuario-nuevo";
import { UsuariosTabla } from "@/features/usuarios/components/usuarios-tabla";
import { TOPE_USUARIOS_ACTIVOS } from "@/features/usuarios/constants/usuarios-constants";
import { ListaUsuariosStore } from "@/features/usuarios/lista-usuarios.store";
import type { CredencialInicial, Usuario } from "@/features/usuarios/types/usuario.types";
import { BadgeTone } from "@/shared/enums/badge.enum";
import { ButtonSize, ButtonTone, ButtonVariant } from "@/shared/enums/button.enum";
import { IconName } from "@/shared/enums/icon-name.enum";
import { Alert } from "@/shared/ui/alert/alert";
import { Badge } from "@/shared/ui/badge/badge";
import { Button } from "@/shared/ui/button/button";
import { Card } from "@/shared/ui/card/card";
import { Icon } from "@/shared/ui/icon/icon";
import { PaginadorCursor } from "@/shared/ui/paginador-cursor/paginador-cursor";
import { SearchInput } from "@/shared/ui/search-input/search-input";

@Component({
  selector: "app-usuarios-page",
  imports: [
    Alert,
    AreaSelector,
    Badge,
    Button,
    Card,
    ClaveInicialDialogo,
    Icon,
    PaginadorCursor,
    SearchInput,
    UsuarioEdicion,
    UsuarioNuevo,
    UsuariosTabla,
  ],
  providers: [ListaUsuariosStore],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: "./usuarios-page.html",
})
export class UsuariosPage {
  private readonly sesion = inject(SessionStore);

  protected readonly lista = inject(ListaUsuariosStore);
  protected readonly area = this.sesion.area;
  protected readonly veTodasLasAreas = this.sesion.veTodasLasAreas;
  protected readonly BadgeTone = BadgeTone;
  protected readonly ButtonSize = ButtonSize;
  protected readonly ButtonTone = ButtonTone;
  protected readonly ButtonVariant = ButtonVariant;
  protected readonly CargaEstado = CargaEstado;
  protected readonly IconName = IconName;
  protected readonly tope = TOPE_USUARIOS_ACTIVOS;

  protected readonly creando = signal(false);
  protected readonly editando = signal<Usuario | null>(null);
  /** La clave inicial vive solo aquí y solo mientras el diálogo está abierto; no va a ningún almacenamiento. */
  protected readonly credencial = signal<CredencialInicial | null>(null);

  protected readonly limiteAlcanzado = computed(() => this.lista.activos() >= this.tope);
  protected readonly parcial = computed(() => this.lista.hayMas() || this.lista.hayAnterior());

  protected mostrarClave(credencial: CredencialInicial): void {
    this.credencial.set(credencial);
  }

  protected cerrarClave(): void {
    this.credencial.set(null);
  }
}
