import { PaginatedResponseDTO, ResponseDTO } from "../base/ResponseDTO.model";
import { DepartamentoAcademico } from "../master/departamento_academico.model";
import { EscuelaProfesional } from "../master/escuela_profesional.model";

export interface Docente {
  id: number;
  codigo: string;
  escuela: EscuelaProfesional;
  departamento: DepartamentoAcademico;
  tipoDocumentoCodigo: string;
  tipoDocumentoDenominacion: string;
  numeroDocumento: string;
  nombres: string;
  primerApellido: string;
  segundoApellido: string;
  correoInstitucional: string;
  generoCodigo: string;
  generoDenominacion: string;
  telefono: string;
  estado: number;
  eliminado: boolean;
}

export interface DocenteRequest {
  codigo?: string;
  escuelaId: number;
  departamentoAcademicoId: number;
  tipoDocumentoCodigo?: string;
  numeroDocumento?: string;
  nombres: string;
  primerApellido: string;
  segundoApellido: string;
  correoInstitucional: string;
  generoCodigo: string;
  telefono?: string;
}

export interface DocenteFiltro {
  facultadId?: number;
  departamentoAcademicoId?: number;
  escuelaId?: number;
  estado?: number;
  generoCodigo?: string;
  numeroDocumento?: string;
  correo?: string;
}

export interface DocenteMetrica {
  total?: number;
  totalActivos?: number;
  porcentajeActivos?: number;
  totalInactivos?: number;
  porcentajeInactivos?: number;
}

export type DocenteResponse = ResponseDTO<Docente>;
export type DocenteResponseList = ResponseDTO<Docente[]>;
export type DocentePaginatedResponse = PaginatedResponseDTO<Docente[]>;
export type DocenteMetricaResponse = ResponseDTO<DocenteMetrica>;
