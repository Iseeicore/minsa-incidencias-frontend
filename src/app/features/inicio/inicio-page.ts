import { ChangeDetectionStrategy, Component, computed, signal } from "@angular/core";
import { BadgeTone } from "@/shared/enums/badge.enum";
import { Badge } from "@/shared/ui/badge/badge";
import { BarChart } from "@/shared/ui/bar-chart/bar-chart";
import { Card } from "@/shared/ui/card/card";
import { ProgressBar } from "@/shared/ui/progress-bar/progress-bar";
import { StatCard } from "@/shared/ui/stat-card/stat-card";
import { Tabs } from "@/shared/ui/tabs/tabs";
import { CasosAtencionTabla } from "./components/casos-atencion-tabla";
import { PERIODO_OPCIONES } from "./constants/periodo-opciones";
import {
  ALERTAS_DEMO,
  CASOS_ATENCION_DEMO,
  CATEGORIAS_DEMO,
  DERIVACIONES_DEMO,
  EVOLUCION_DEMO,
  KPIS_DEMO,
} from "./data/dashboard.demo";
import { Periodo } from "./enums/periodo.enum";

@Component({
  selector: "app-inicio-page",
  imports: [Badge, BarChart, Card, CasosAtencionTabla, ProgressBar, StatCard, Tabs],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: "./inicio-page.html",
})
export class InicioPage {
  protected readonly BadgeTone = BadgeTone;
  protected readonly kpis = KPIS_DEMO;
  protected readonly categorias = CATEGORIAS_DEMO;
  protected readonly casosAtencion = CASOS_ATENCION_DEMO;
  protected readonly derivaciones = DERIVACIONES_DEMO;
  protected readonly alertas = ALERTAS_DEMO;
  protected readonly periodoOpciones = PERIODO_OPCIONES;

  protected readonly periodo = signal<string>(Periodo.SIETE_DIAS);
  protected readonly evolucion = computed(() => EVOLUCION_DEMO[this.periodo() as Periodo]);
}
