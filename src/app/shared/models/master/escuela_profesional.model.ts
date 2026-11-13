import { ResponseDTO } from "../base/ResponseDTO.model";
import { DepartamentoAcademico } from "./departamento_academico.model";

export interface EscuelaProfesional {
  id: number;
  departamento: DepartamentoAcademico;
  codigo: number;
  abreviatura: string;
  denominacion: string;
  estado: number;
}

export interface EscuelaProfesionalRequest {
  id: number;
  departamentoId: number;
  codigo: number;
  abreviatura: string;
  denominacion: string;
}

export type EscuelaResponse = ResponseDTO<EscuelaProfesional>;
export type EscuelaResponseList = ResponseDTO<EscuelaProfesional[]>;