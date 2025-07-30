// src/types/grupo.ts
import { Actuador } from "./actuador";

export interface Grupo {
  id: string;
  nombre: string;
  GrupoActuador: {
    actuador: Actuador;
  }[];
}
