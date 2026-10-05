export const TipoEvidencia = {
  IMAGEN: "imagen",
  DOCUMENTO: "documento",
  AUDIO: "audio",
} as const;
export type TipoEvidencia = (typeof TipoEvidencia)[keyof typeof TipoEvidencia];
