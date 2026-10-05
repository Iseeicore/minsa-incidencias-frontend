const NICE_STEPS = [1, 2, 2.5, 5, 10] as const;

export interface NiceScale {
  readonly max: number;
  readonly ticks: readonly number[];
}

/** Redondea el máximo hacia arriba a un paso "bonito" y devuelve las marcas del eje de mayor a menor. */
export function niceScale(value: number, intervals = 4): NiceScale {
  if (!(value > 0)) {
    return { max: intervals, ticks: Array.from({ length: intervals + 1 }, (_, index) => intervals - index) };
  }
  const rawStep = value / intervals;
  const magnitude = 10 ** Math.floor(Math.log10(rawStep));
  const step = (NICE_STEPS.find((factor) => factor * magnitude >= rawStep) ?? 10) * magnitude;
  return {
    max: step * intervals,
    ticks: Array.from({ length: intervals + 1 }, (_, index) => step * (intervals - index)),
  };
}
