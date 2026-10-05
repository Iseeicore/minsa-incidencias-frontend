export interface PlazosEnvironment {
  atencionDias: number;
  vigenciaResolucionDias: number;
  avisoHoras: number;
}

export interface Environment {
  production: boolean;
  apiUrl: string;
  plazos: PlazosEnvironment;
}
