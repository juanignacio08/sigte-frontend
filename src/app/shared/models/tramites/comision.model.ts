import { ResponseDTO } from "../base/ResponseDTO.model";

export interface ComisionRequest {
    tesisId: string;
    etapaCodigo: string;
    fechaConformacion?: string;
}

export interface ComisionMiembroRequest {
    comisionId: number;
    docenteId: number;
    rolCodigo: string;
    orden?: number;
}

export interface Comision {
    id: number;
    tesisId: string;
    etapaCodigo: string;
    etapaDenominacion: string;
    fechaConformacion: string;
    estado: number;
    miembros: ComisionMiembro[]
}

export interface ComisionMiembro {
    id: number;
    docenteId: number;
    docenteNombre: string;
    correoInstitucional: string;
    rolCodigo: string;
    rolDenominacion: string;
    orden: number;
    fechaAlta: string;
    fechaBaja: string;
    motivoBaja: string;
}

export type ComisionResponse = ResponseDTO<Comision>;
export type ComisionListResponse = ResponseDTO<Comision[]>;
export type ComisionMiembroResponse = ResponseDTO<ComisionMiembro>;