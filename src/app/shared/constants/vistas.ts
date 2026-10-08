import { VistaCodigo } from "@/shared/enums/vista-codigo.enum";
import { ROUTE } from "./routes";

/** Ruta de cada vista de la plataforma. */
export const RUTA_DE_VISTA: Readonly<Record<VistaCodigo, string>> = {
  [VistaCodigo.INICIO]: ROUTE.INICIO,
  [VistaCodigo.CASOS]: ROUTE.BANDEJA,
  [VistaCodigo.DERIVACIONES]: ROUTE.DERIVACIONES,
  [VistaCodigo.QR]: ROUTE.QR,
  [VistaCodigo.USUARIOS]: ROUTE.USUARIOS,
};
