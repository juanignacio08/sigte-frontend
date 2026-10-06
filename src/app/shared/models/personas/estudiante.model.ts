import { PaginatedResponseDTO, ResponseDTO } from "../base/ResponseDTO.model";
import { EscuelaProfesional } from "../master/escuela_profesional.model";

export interface Estudiante {
  id: number;
  codigo: string;
  escuela: EscuelaProfesional;
  numeroDocumento: string;
  nombres: string;
  primerApellido: string;
  segundoApellido: string;
  correoInstitucional: string;
  generoCodigo: string;
  generoDenominacion?: string;
  telefono?: string;
  estado: number; 
  eliminado?: boolean;
}

export interface EstudianteRequest {
  escuelaId: number;
  codigo?: string;
  numeroDocumento?: string;
  nombres: string;
  primerApellido: string;
  segundoApellido: string;
  correoInstitucional: string;
  generoCodigo: string;
  telefono?: string;
}

export interface EstudianteFiltro {
  facultadId?: number;
  escuelaId?: number;
  codigo?: string;
  numeroDocumento?: string;
  nombre?: string;
  email?: string;
  generoCodigo?: string;
}

export type EstudianteResponse = ResponseDTO<Estudiante>;
export type EstudianteResponseList = ResponseDTO<Estudiante[]>;
export type EstudiantePaginatedResponse = PaginatedResponseDTO<Estudiante[]>;