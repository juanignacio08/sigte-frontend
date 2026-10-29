import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { environment } from '../../../../environments/environment.development';
import { MasterTableListResponse, MasterTableRequest, MasterTableResponse } from '../../../shared/models/master/tabla_maestra.model';
import { Observable } from 'rxjs';

@Service()
export class TablaMaestraService {
    private readonly http = inject(HttpClient);
    private readonly apiUrl = `${environment.apiUrl}/maestros`;

    public static readonly documentTypeTableCode = '001';
    public static readonly genderTableCode = '002';
    public static readonly stateThesisTableCode = '003';
    public static readonly stageThesisTableCode = '004';
    public static readonly rolesCommissionTableCode = '005';

    public static readonly dniCode = '001001';
    public static readonly genderMaleCode = '002001';
    public static readonly genderFemaleCode = '002002';

    public static readonly stageThesisProject = '004001';
    public static readonly stageThesisDraft = '004002';
    public static readonly stageThesisThesisDefense = '004004';


    public static readonly rolesCommissionJury = '005002';
    public static readonly rolesCommissionCoAdvisor = '005003';

    public static readonly stateFileInRegister = '007001';
    public static readonly stateFileMemorandumGenerated = '007002';
    public static readonly stateFileMemorandumSent = '007003';
    public static readonly stateFileDictamenApproved = '007004';
    public static readonly stateFileDictamenObservation = '007005';
    public static readonly stateFileApproved = '007006';

    /**
     * Crea un nuevo maestro (tabla o ítem).
     */
    create(request: MasterTableRequest): Observable<MasterTableResponse> {
        return this.http.post<MasterTableResponse>(this.apiUrl, request);
    }

    /**
     * Actualiza la denominación y el flag de sistema de un maestro existente.
     * @param code Código del maestro (ej. '001000')
     */
    update(code: string, request: MasterTableRequest): Observable<MasterTableResponse> {
        return this.http.put<MasterTableResponse>(`${this.apiUrl}/${code}`, request);
    }

    /**
     * Lista las tablas maestras (agrupadores) filtrando por si son de sistema o no.
     * @param isSystem true para tablas de sistema, false para las creadas por el usuario
     */
    getTables(isSystem: boolean): Observable<MasterTableListResponse> {
        const params = new HttpParams().set('isSystem', isSystem);
        return this.http.get<MasterTableListResponse>(`${this.apiUrl}/getTables`, { params });
    }

    /**
     * Lista los ítems pertenecientes a una tabla maestra.
     * @param tableCode Código de la tabla (ej. '001')
     */
    getItems(tableCode: string): Observable<MasterTableListResponse> {
        return this.http.get<MasterTableListResponse>(`${this.apiUrl}/getItems/${tableCode}`);
    }

    /**
     * Lista los ítems activos pertenecientes a una tabla maestra.
     * @param tableCode Código de la tabla (ej. '001')
     */
    getItemsActives(tableCode: string): Observable<MasterTableListResponse> {
        return this.http.get<MasterTableListResponse>(`${this.apiUrl}/getItemsActives/${tableCode}`);
    }

    /**
     * Activa un maestro existente.
     * @param code Código del maestro
     */
    activate(code: string): Observable<MasterTableResponse> {
        return this.http.put<MasterTableResponse>(`${this.apiUrl}/activate/${code}`, null);
    }

    /**
     * Desactiva un maestro existente.
     * @param code Código del maestro
     */
    deactivate(code: string): Observable<MasterTableResponse> {
        return this.http.put<MasterTableResponse>(`${this.apiUrl}/deactivate/${code}`, null);
    }

    /**
     * Elimina (lógicamente) un maestro.
     * @param code Código del maestro
     */
    delete(code: string): Observable<MasterTableResponse> {
        return this.http.delete<MasterTableResponse>(`${this.apiUrl}/${code}`);
    }

}
