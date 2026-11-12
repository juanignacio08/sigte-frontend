import { ResponseDTO } from "../base/ResponseDTO.model";

export interface PlantillaDocumento {
  id: number;
  escuelaId: number;
  nombreDocumento: string;
  tipoDocumentoCodigo: string;
  tipoDocumentoDenominacion: string;
  archivoUrl: string;
  plazoDias: number | null;
  plazoMeses: number | null;
  estado: number;
}

export interface RegistrarPlantillaDocumentoRequest {
  escuelaId: number;
  tipoDocumentoCodigo: string;
  plazoDias?: number;
  plazoMeses?: number;
  archivoDocx: File;
}

export interface ActualizarPlantillaDocumentoRequest {
  plazoDias?: number;
  plazoMeses?: number;
  archivoDocx?: File;
}

export interface TipoDocumentoOpcion {
  codigo: string;
  denominacion: string;
}

export type PlantillaDocumentoResponse = ResponseDTO<PlantillaDocumento>;
export type PlantillaDocumentoResponseList = ResponseDTO<PlantillaDocumento[]>;