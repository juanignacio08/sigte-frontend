import { ResponseDTO } from "../base/ResponseDTO.model";

export interface DepartamentoAcademico {
  id: number;
  facultadId: number;
  abreviatura: string;
  denominacion: string;
  estado: number;
  totalEscuelas: number;
}

export interface DepartamentoAcademicoRequest {
  id?: number;
  facultadId: number;
  abreviatura: string;
  denominacion: string;
}

export type DepartamentoAcademicoResponse = ResponseDTO<DepartamentoAcademico>;
export type DepartamentoAcademicoResponseList = ResponseDTO<DepartamentoAcademico[]>;