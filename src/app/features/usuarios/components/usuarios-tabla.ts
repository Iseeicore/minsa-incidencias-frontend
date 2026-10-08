import { ChangeDetectionStrategy, Component, input, output } from "@angular/core";
import { ROL_LABEL, SIN_AREA_USUARIO, SIN_ROL } from "@/features/usuarios/constants/usuarios-constants";
import type { Usuario } from "@/features/usuarios/types/usuario.types";
import { BadgeTone } from "@/shared/enums/badge.enum";
import { ButtonSize, ButtonTone, ButtonVariant } from "@/shared/enums/button.enum";
import { Badge } from "@/shared/ui/badge/badge";
import { Button } from "@/shared/ui/button/button";
import { ScrollArea } from "@/shared/ui/scroll-area/scroll-area";

const ENCABEZADO = "bg-white pb-3 pr-6 text-xs font-medium text-gray-500";

const COLUMNAS: readonly { readonly key: string; readonly label: string }[] = [
  { key: "nombre", label: "Nombre" },
  { key: "correo", label: "Correo" },
  { key: "rol", label: "Rol" },
  { key: "area", label: "Área" },
  { key: "estado", label: "Estado" },
  { key: "acciones", label: "Acciones" },
];

@Component({
  selector: "app-usuarios-tabla",
  imports: [Badge, Button, ScrollArea],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: "block" },
  template: `
    <app-scroll-area [label]="descripcion()">
      <table class="w-full whitespace-nowrap text-left text-sm">
        <thead>
          <tr>
            @for (columna of columnas; track columna.key) {
              <th scope="col" [class]="encabezado">{{ columna.label }}</th>
            }
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          @for (usuario of usuarios(); track usuario.id) {
            <tr>
              <td class="py-3 pr-6 font-medium text-gray-900">{{ usuario.nombreCompleto }}</td>
              <td class="py-3 pr-6 text-gray-700">{{ usuario.correo }}</td>
              <td class="py-3 pr-6 text-gray-700">{{ usuario.rol ? rolLabel[usuario.rol] : sinRol }}</td>
              <td class="py-3 pr-6 text-gray-700">{{ usuario.area?.nombre ?? sinArea }}</td>
              <td class="py-3 pr-6">
                <app-badge [tone]="usuario.activo ? BadgeTone.SUCCESS : BadgeTone.NEUTRAL">
                  {{ usuario.activo ? "Activo" : "Inactivo" }}
                </app-badge>
              </td>
              <td class="py-3">
                <app-button
                  [variant]="ButtonVariant.OUTLINE"
                  [tone]="ButtonTone.NEUTRAL"
                  [size]="ButtonSize.SM"
                  (click)="editar.emit(usuario)"
                >
                  Editar<span class="sr-only"> a {{ usuario.nombreCompleto }}</span>
                </app-button>
              </td>
            </tr>
          }
        </tbody>
      </table>
    </app-scroll-area>
  `,
})
export class UsuariosTabla {
  readonly usuarios = input.required<readonly Usuario[]>();
  readonly descripcion = input("Listado de usuarios");
  readonly editar = output<Usuario>();

  protected readonly BadgeTone = BadgeTone;
  protected readonly ButtonSize = ButtonSize;
  protected readonly ButtonTone = ButtonTone;
  protected readonly ButtonVariant = ButtonVariant;
  protected readonly columnas = COLUMNAS;
  protected readonly encabezado = ENCABEZADO;
  protected readonly rolLabel = ROL_LABEL;
  protected readonly sinRol = SIN_ROL;
  protected readonly sinArea = SIN_AREA_USUARIO;
}
