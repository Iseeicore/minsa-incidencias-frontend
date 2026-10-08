import type { Environment } from "./environment.types";

export const environment: Environment = {
  production: false,
  apiUrl: "http://localhost:3033",
  plazos: {
    atencionDias: 3,
    vigenciaResolucionDias: 3,
    avisoHoras: 24,
  },
  whatsapp: {
    numero: "51944023973",
  },
};
