export interface ProgramacionGrupo {
  id: string;
  grupoId: string;
  horaInicio: string;
  horaFin: string;
  frecuencia: "una_vez" | "diario" | "dias_especificos";
  dias: string[];
  activo: boolean;
  createdAt: string;
}
