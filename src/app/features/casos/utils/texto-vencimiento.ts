const HORAS_POR_DIA = 24;

function dias(cantidad: number): string {
  return cantidad === 1 ? "1 día" : `${cantidad} días`;
}

/** Convierte las horas que faltan (negativas si ya pasó) en un texto corto para la tabla. */
export function textoVencimiento(horasParaVencer: number | null): string {
  if (horasParaVencer === null) return "Sin plazo";
  if (horasParaVencer < 0) {
    const horas = Math.abs(horasParaVencer);
    return horas < HORAS_POR_DIA ? `Vencido hace ${horas} h` : `Vencido hace ${dias(Math.round(horas / HORAS_POR_DIA))}`;
  }
  return horasParaVencer < HORAS_POR_DIA ? `En ${horasParaVencer} h` : `En ${dias(Math.round(horasParaVencer / HORAS_POR_DIA))}`;
}
