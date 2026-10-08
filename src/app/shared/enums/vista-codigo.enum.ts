export const VistaCodigo = {
  INICIO: "INICIO",
  CASOS: "CASOS",
  DERIVACIONES: "DERIVACIONES",
  QR: "QR",
  USUARIOS: "USUARIOS",
} as const;
export type VistaCodigo = (typeof VistaCodigo)[keyof typeof VistaCodigo];
