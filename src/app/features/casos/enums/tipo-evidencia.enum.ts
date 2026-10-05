export const TipoEvidencia = {
  IMAGEN: "imagen",
  DOCUMENTO: "documento",
  AUDIO: "audio",
  VIDEO: "video",
} as const;
export type TipoEvidencia = (typeof TipoEvidencia)[keyof typeof TipoEvidencia];
