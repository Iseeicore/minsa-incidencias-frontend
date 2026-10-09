export const NivelAtencion = {
  I: "I",
  II: "II",
  III: "III",
} as const;
export type NivelAtencion = (typeof NivelAtencion)[keyof typeof NivelAtencion];
