export const TabsVariante = {
  PILDORA: "pildora",
  TARJETA: "tarjeta",
  CHIPS: "chips",
} as const;
export type TabsVariante = (typeof TabsVariante)[keyof typeof TabsVariante];
