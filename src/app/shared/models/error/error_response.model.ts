export interface ErrorResponse<T = unknown> {
  codigo: string;
  mensaje: string;
  estadoStatus: number;
  timestamp: string;
  detalles?: T;
}