/** Un establecimiento de salud para el que se puede generar el código QR. */
export interface EstablecimientoQr {
  readonly id: string;
  readonly nombre: string;
  readonly codigoRenipress: string;
  readonly nivelAtencion: string | null;
  readonly categoria: string | null;
}
