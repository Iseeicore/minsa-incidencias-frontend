import { ChangeDetectionStrategy, Component, computed, inject, signal } from "@angular/core";
import { PLAZOS_TOKEN } from "@/core/config/plazos.config";
import { CasosStore } from "@/features/casos/casos.store";
import { CasoRevision } from "@/features/casos/components/caso-revision";
import { CasosTabla } from "@/features/casos/components/casos-tabla";
import { RolDemoSelector } from "@/features/casos/components/rol-demo-selector";
import { BandejaTab } from "@/features/casos/enums/bandeja-tab.enum";
import { filtrarBandeja } from "@/features/casos/utils/filtrar-bandeja";
import { BadgeTone } from "@/shared/enums/badge.enum";
import { Badge } from "@/shared/ui/badge/badge";
import { Card } from "@/shared/ui/card/card";
import { Tabs, type TabOption } from "@/shared/ui/tabs/tabs";

const BANDEJAS: readonly { readonly value: BandejaTab; readonly label: string; readonly ayuda: string }[] = [
  { value: BandejaTab.PARA_ACTUAR, label: "Para actuar", ayuda: "Casos donde tu rol puede hacer algo ahora." },
  { value: BandejaTab.REVISION_IA, label: "En revisión IA", ayuda: "Clasificados por la IA que ninguna persona revisó." },
  { value: BandejaTab.POR_DERIVAR, label: "Por derivar", ayuda: "Categoría ya revisada, pendientes de enviar al área." },
  { value: BandejaTab.EN_GESTION, label: "En gestión", ayuda: "Derivados o que el área está atendiendo." },
  { value: BandejaTab.POR_VENCER, label: "Por vencer", ayuda: "Abiertos que están por cumplir el plazo de atención." },
  { value: BandejaTab.RESUELTOS, label: "Resueltos", ayuda: "Con resolución vigente; se archivan solos." },
  { value: BandejaTab.ARCHIVADOS, label: "Archivados", ayuda: "Resueltos que cumplieron su vigencia y los que vencieron sin atenderse." },
];

@Component({
  selector: "app-bandejas-page",
  imports: [Badge, Card, CasoRevision, CasosTabla, RolDemoSelector, Tabs],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: "./bandejas-page.html",
})
export class BandejasPage {
  private readonly store = inject(CasosStore);

  protected readonly plazos = inject(PLAZOS_TOKEN);
  protected readonly BadgeTone = BadgeTone;
  protected readonly tab = signal<string>(BandejaTab.PARA_ACTUAR);
  protected readonly seleccionado = signal<string | null>(null);

  protected readonly opciones = computed<readonly TabOption[]>(() =>
    BANDEJAS.map((bandeja) => ({
      value: bandeja.value,
      label: `${bandeja.label} (${filtrarBandeja(this.store.casos(), bandeja.value, this.store.rol(), this.plazos).length})`,
    })),
  );

  protected readonly actual = computed(() => BANDEJAS.find((bandeja) => bandeja.value === this.tab()) ?? BANDEJAS[0]);

  protected readonly casos = computed(() =>
    filtrarBandeja(this.store.casos(), this.tab() as BandejaTab, this.store.rol(), this.plazos),
  );
}
