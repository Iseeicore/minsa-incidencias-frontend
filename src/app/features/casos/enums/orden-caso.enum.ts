export const OrdenCaso = {
  FECHA: "fecha",
  CODIGO: "codigo",
  CATEGORIA: "categoria",
  ESTADO: "estado",
  CONFIANZA: "confianza",
} as const;
export type OrdenCaso = (typeof OrdenCaso)[keyof typeof OrdenCaso];

export const DireccionOrden = {
  ASCENDENTE: "asc",
  DESCENDENTE: "desc",
} as const;
export type DireccionOrden = (typeof DireccionOrden)[keyof typeof DireccionOrden];
