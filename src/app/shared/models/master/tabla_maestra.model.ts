import { ResponseDTO } from "../base/ResponseDTO.model";

export interface MasterTable {
    id: number,
    tableCode: string,
    itemCode: string,
    code: string,
    denomination: string,
    isSystem: boolean,
    state: number
}

export interface MasterTableRequest {
    tableCode: string,
    itemCode: string,
    denomination: string,
    isSystem: boolean
}

export type MasterTableResponse = ResponseDTO<MasterTable>;
export type MasterTableListResponse = ResponseDTO<MasterTable[]>;