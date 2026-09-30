import { ResponseDTO } from "../base/ResponseDTO.model";
import { DepartamentoAcademico } from "./departamento_academico.model";

export interface EscuelaProfesional {
  id: number;
  departamento: DepartamentoAcademico;
  codigo: string;
  abreviatura: string;
  denominacion: string;
  plantillaMemo: string;
  plantillaRes: string;
  estado: number;
}

export interface EscuelaProfesionalRequest {
  id: number;
  departamentoId: number;
  codigo: string;
  abreviatura: string;
  denominacion: string;
  plantillaMemo?: File;
  plantillaRes?: File;
}

export type EscuelaResponse = ResponseDTO<EscuelaProfesional>;
export type EscuelaResponseList = ResponseDTO<EscuelaProfesional[]>;