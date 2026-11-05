import { ResponseDTO } from "../base/ResponseDTO.model";
import { ExpedienteArchivo } from "./expediente.model";

export interface DestinatarioEmail {
  email: string;
  nombre: string;
  rol: string;
}

export interface ContenidoEmailMemo {
  documentoId: number;
  destinatarios: DestinatarioEmail[];
  asunto: string;
  cuerpo: string;
  archivos: ExpedienteArchivo[];
}

export interface EnvioCorreo {
  id: number;
  documentoTesisId: number;
  asunto: string;
  destinatarios: DestinatarioEmail[];
  adjuntos: ExpedienteArchivo[];
  fechaEnvio: string;
  estado: string;
}

export type ContenidoEmailResponse = ResponseDTO<ContenidoEmailMemo>;
export type EnvioCorreoListResponse = ResponseDTO<EnvioCorreo[]>;