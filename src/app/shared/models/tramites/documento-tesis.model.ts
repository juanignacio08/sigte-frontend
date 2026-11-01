import { ResponseDTO } from "../base/ResponseDTO.model";

export interface DocumentoTesis {
  id: number;
  expedienteTesisId: number;
  tipoDocumentoCodigo: string;
  tipoDocumentoDenominacion: string;
  numeroCorrelativo: number;
  anioCorrelativo: number;
  numeroCompleto: string;
  fechaEmision: string;
  archivoWordUrl: string;
  archivoPdfUrl: string;
  tamanioBytesWord: number;
  tamanioBytesPdf: number;
  resultadoCodigo: string;
  resultadoDenominacion: string;
  observaciones: string;
  estadoCodigo: string;
  estadoDenominacion: string;
}

export interface GenerarMemoRequest {
  tesisId: string;
  expedienteId: number;
  numeroCorrelativo: number;
  anio: number;
}

export type DocumentoTesisResponse = ResponseDTO<DocumentoTesis>;
export type DocumentoTesisListResponse = ResponseDTO<DocumentoTesis[]>;
