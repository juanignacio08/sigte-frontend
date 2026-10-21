import { PaginatedResponseDTO, ResponseDTO } from "../base/ResponseDTO.model";

export interface TesisAutor {
  id: number;
  tesisId: string;
  estudianteId: number;
  estudianteNombres: string;
  estudiantePrimerApellido: string;
  estudianteSegundoApellido: string;
  estudianteDNI: string;
  estudianteCorreo: string;
  fechaAsociacion: string;
  estado: number;
}

export interface ExpedienteTesis {
  id: number;
  tesisId: string;
  numeroExpediente: string;
  etapaCodigo: string;
  etapaDenominacion: string;
  numRevision: number;
  fechaAsociacion: string;
  estado: number;
}

export interface Tesis {
  id: string; // UUID
  escuelaId: number;
  escuelaDenominacion: string;
  titulo: string;
  tituloDictaminado?: string;
  estadoCodigo: string;
  estadoDenominacion: string;
  fechaRegistro: string;
  autores: TesisAutor[];
  expedienteActivo: ExpedienteTesis;
}

export interface RegistrarTesisRequest {
  escuelaId: number;
  titulo: string;
  estudiantesIds: number[];
  numeroExpediente: string;
  etapaTesisCodigo?: string;
  fechaIngreso?: string;
  numeroRevision?: number;
}

export interface TesisFiltro {
  facultadId: number;
  escuelaId?: number;
  estadoCodigo?: string;
  textoBusqueda?: string;
}

export type TesisResponse = ResponseDTO<Tesis>;
export type TesisListResponse = ResponseDTO<Tesis[]>;
export type TesisPaginatedResponse = PaginatedResponseDTO<Tesis[]>;