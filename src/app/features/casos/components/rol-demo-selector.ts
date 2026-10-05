import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { CasosStore } from "@/features/casos/casos.store";
import { ROL_OPCIONES } from "@/features/casos/constants/casos-constants";
import type { RolDemo } from "@/features/casos/enums/rol-demo.enum";
import { SelectField } from "@/shared/ui/select-field/select-field";

@Component({
  selector: "app-rol-demo-selector",
  imports: [SelectField],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: "flex flex-col gap-1.5 sm:flex-row sm:items-center sm:gap-3" },
  template: `
    <span class="text-xs font-medium text-gray-600">Ver como (solo en la demostración)</span>
    <app-select-field
      label="Rol de demostración"
      [options]="opciones"
      [value]="store.rol()"
      (valueChange)="cambiar($event)"
    />
  `,
})
export class RolDemoSelector {
  protected readonly store = inject(CasosStore);
  protected readonly opciones = ROL_OPCIONES;

  protected cambiar(rol: string): void {
    this.store.cambiarRol(rol as RolDemo);
  }
}
