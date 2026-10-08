import type { IconName } from "@/shared/enums/icon-name.enum";
import type { VistaCodigo } from "@/shared/enums/vista-codigo.enum";

export interface NavEntry {
  readonly id: string;
  readonly label: string;
  readonly icon: IconName;
  readonly path?: string;
  readonly vista?: VistaCodigo;
  /** Activar al crear la pantalla: mientras sea false la entrada no se muestra. */
  readonly implementada: boolean;
}

export interface NavSection {
  readonly id: string;
  readonly label: string;
  readonly entries: readonly NavEntry[];
}
