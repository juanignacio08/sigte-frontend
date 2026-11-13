import { ResponseDTO } from "../base/ResponseDTO.model";
import { EscuelaProfesional } from "./escuela_profesional.model";

export interface DepartamentoAcademico {
  id: number;
  facultadId: number;
  abreviatura: string;
  denominacion: string;
  estado: number;
  totalEscuelas: number;
  escuelas?: EscuelaProfesional[];
}

export interface DepartamentoAcademicoRequest {
  id?: number;
  facultadId: number;
  abreviatura: string;
  denominacion: string;
}

export type DepartamentoAcademicoResponse = ResponseDTO<DepartamentoAcademico>;
export type DepartamentoAcademicoResponseList = ResponseDTO<DepartamentoAcademico[]>;