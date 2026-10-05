import { ChangeDetectionStrategy, Component, computed, signal } from "@angular/core";
import { CasosTabla } from "@/features/casos/components/casos-tabla";
import { CASOS_DEMO } from "@/features/casos/data/casos.demo";
import { BandejaTab } from "@/features/casos/enums/bandeja-tab.enum";
import { filtrarBandeja } from "@/features/casos/utils/filtrar-bandeja";
import { BadgeTone } from "@/shared/enums/badge.enum";
import { Badge } from "@/shared/ui/badge/badge";
import { Card } from "@/shared/ui/card/card";
import { Tabs, type TabOption } from "@/shared/ui/tabs/tabs";

const BANDEJAS: readonly { readonly value: BandejaTab; readonly label: string }[] = [
  { value: BandejaTab.ASIGNADOS, label: "Asignados a mí" },
  { value: BandejaTab.PENDIENTES, label: "Pendientes" },
  { value: BandejaTab.PROXIMOS, label: "Próximos a vencer" },
  { value: BandejaTab.VENCIDOS, label: "Vencidos" },
  { value: BandejaTab.DEVUELTOS, label: "Devueltos" },
  { value: BandejaTab.REVISION_IA, label: "En revisión IA" },
];

@Component({
  selector: "app-bandejas-page",
  imports: [Badge, Card, CasosTabla, Tabs],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: "./bandejas-page.html",
})
export class BandejasPage {
  protected readonly BadgeTone = BadgeTone;
  protected readonly tab = signal<string>(BandejaTab.ASIGNADOS);

  protected readonly opciones = computed<readonly TabOption[]>(() =>
    BANDEJAS.map((bandeja) => ({
      value: bandeja.value,
      label: `${bandeja.label} (${filtrarBandeja(CASOS_DEMO, bandeja.value).length})`,
    })),
  );

  protected readonly titulo = computed(() => BANDEJAS.find((bandeja) => bandeja.value === this.tab())?.label ?? "");
  protected readonly casos = computed(() => filtrarBandeja(CASOS_DEMO, this.tab() as BandejaTab));
}
