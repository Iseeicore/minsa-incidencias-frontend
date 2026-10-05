import type { IconName } from "@/shared/enums/icon-name.enum";
import type { ModuloCodigo } from "@/shared/enums/modulo-codigo.enum";

export interface NavEntry {
  readonly id: string;
  readonly label: string;
  readonly icon: IconName;
  readonly path?: string;
  readonly modulo?: ModuloCodigo;
}

export interface NavSection {
  readonly id: string;
  readonly label: string;
  readonly entries: readonly NavEntry[];
}
