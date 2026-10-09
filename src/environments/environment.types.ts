export interface PlazosEnvironment {
  atencionDias: number;
  vigenciaResolucionDias: number;
  avisoHoras: number;
}

export interface WhatsappEnvironment {
  numero: string;
}

export interface Environment {
  production: boolean;
  apiUrl: string;
  plazos: PlazosEnvironment;
  whatsapp: WhatsappEnvironment;
}
