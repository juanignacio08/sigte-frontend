import { ResponseDTO } from "../base/ResponseDTO.model";

export interface Facultad {
    id: number,
    denominacion: string,
    abreviatura: string,
    estado: number
}

export const FACULTY_MOCK: Facultad = {
    id: 1,
    denominacion: 'Facultad de Ciencias de la Salud',
    abreviatura: 'FCSA',
    estado: 1
};

export type FacultadResponse = ResponseDTO<Facultad>;
export type FacultadResponseList = ResponseDTO<Facultad[]>;