import { ChangeDetectionStrategy, Component, computed, signal } from "@angular/core";
import {
  ESTADO_DERIVACION_BADGE,
  TABS_DERIVACION,
} from "@/features/derivaciones/constants/derivaciones-constants";
import { DERIVACIONES_DEMO } from "@/features/derivaciones/data/derivaciones.demo";
import { EstadoDerivacion } from "@/features/derivaciones/enums/estado-derivacion.enum";
import type { Derivacion } from "@/features/derivaciones/types/derivacion.types";
import { filtrarDerivaciones } from "@/features/derivaciones/utils/filtrar-derivaciones";
import { BadgeTone } from "@/shared/enums/badge.enum";
import { ButtonSize, ButtonTone, ButtonVariant } from "@/shared/enums/button.enum";
import { Badge } from "@/shared/ui/badge/badge";
import { Button } from "@/shared/ui/button/button";
import { Card } from "@/shared/ui/card/card";
import { Drawer } from "@/shared/ui/drawer/drawer";
import { ScrollArea } from "@/shared/ui/scroll-area/scroll-area";
import { Tabs, type TabOption } from "@/shared/ui/tabs/tabs";
import { Timeline } from "@/shared/ui/timeline/timeline";

const ENCABEZADO = "sticky top-0 z-10 bg-white pb-3 pr-6 text-xs font-medium text-gray-500";

const COLUMNAS = [
  { key: "caso", label: "Caso" },
  { key: "origen", label: "Origen" },
  { key: "destino", label: "Destino" },
  { key: "regla", label: "Regla aplicada" },
  { key: "usuario", label: "Usuario" },
  { key: "fecha", label: "Fecha" },
  { key: "estado", label: "Estado" },
  { key: "trazabilidad", label: "Trazabilidad" },
] as const;

@Component({
  selector: "app-derivaciones-page",
  imports: [Badge, Button, Card, Drawer, ScrollArea, Tabs, Timeline],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: "./derivaciones-page.html",
})
export class DerivacionesPage {
  protected readonly BadgeTone = BadgeTone;
  protected readonly ButtonSize = ButtonSize;
  protected readonly ButtonTone = ButtonTone;
  protected readonly ButtonVariant = ButtonVariant;
  protected readonly columnas = COLUMNAS;
  protected readonly encabezado = ENCABEZADO;
  protected readonly estados = ESTADO_DERIVACION_BADGE;

  protected readonly tab = signal<string>(EstadoDerivacion.PENDIENTE);
  protected readonly seleccionada = signal<Derivacion | null>(null);

  protected readonly opciones = computed<readonly TabOption[]>(() =>
    TABS_DERIVACION.map((item) => ({
      value: item.value,
      label: `${item.label} (${filtrarDerivaciones(DERIVACIONES_DEMO, item.value).length})`,
    })),
  );

  protected readonly titulo = computed(() => TABS_DERIVACION.find((item) => item.value === this.tab())?.label ?? "");
  protected readonly derivaciones = computed(() => filtrarDerivaciones(DERIVACIONES_DEMO, this.tab() as EstadoDerivacion));

  protected ver(derivacion: Derivacion): void {
    this.seleccionada.set(derivacion);
  }

  protected alCambiarPanel(abierto: boolean): void {
    if (!abierto) this.seleccionada.set(null);
  }
}
