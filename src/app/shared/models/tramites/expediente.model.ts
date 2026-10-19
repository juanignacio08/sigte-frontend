import { ResponseDTO } from "../base/ResponseDTO.model";

export interface ExpedienteArchivo {
  id: number;
  nombreArchivo: string;
  archivoUrl: string;
  tamanioBytes: number;
}

export interface Expediente {
  id: number;
  tesisId: string;
  numeroExpediente: string;
  etapaCodigo: string;
  etapaDenominacion: string;
  numRevision: number;
  fechaAsociacion: string;
  estado: number; // 1: Activo, 0: Inactivo
  archivos: ExpedienteArchivo[];
}

export interface ActualizarExpedienteRequest {
  numeroExpediente: string;
  etapaCodigo: string;
  numeroRevision: number;
  fechaIngreso?: string;
}

export type ExpedienteResponse = ResponseDTO<Expediente>;
export type ExpedienteListResponse = ResponseDTO<Expediente[]>;