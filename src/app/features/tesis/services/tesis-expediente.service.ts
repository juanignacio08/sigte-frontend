import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { environment } from '../../../../environments/environment.development';
import { Observable } from 'rxjs';
import { ActualizarExpedienteRequest, ExpedienteListResponse, ExpedienteResponse } from '../../../shared/models/tramites/expediente.model';

@Service()
export class TesisExpedienteService {
    private readonly http = inject(HttpClient);
    private readonly apiUrl = `${environment.apiUrl}/expediente`;

    listarPorTesis(tesisId: string): Observable<ExpedienteListResponse> {
        return this.http.get<ExpedienteListResponse>(`${this.apiUrl}/listarPorTesis/${tesisId}`);
    }

    obtenerPorId(id: number): Observable<ExpedienteResponse> {
        return this.http.get<ExpedienteResponse>(`${this.apiUrl}/${id}`);
    }

    registrar(formData: FormData): Observable<ExpedienteResponse> {
        return this.http.post<ExpedienteResponse>(this.apiUrl, formData);
    }

    editar(id: number, request: ActualizarExpedienteRequest): Observable<ExpedienteResponse> {
        return this.http.put<ExpedienteResponse>(`${this.apiUrl}/${id}`, request);
    }

    activar(id: number): Observable<ExpedienteResponse> {
        return this.http.put<ExpedienteResponse>(`${this.apiUrl}/activar/${id}`, null);
    }

    desactivar(id: number, motivo: string): Observable<ExpedienteResponse> {
        const params = new HttpParams().set('id', id.toString()).set('motivo', motivo);
        return this.http.put<ExpedienteResponse>(`${this.apiUrl}/desactivar`, null, { params });
    }

    eliminar(id: number): Observable<ExpedienteResponse> {
        return this.http.delete<ExpedienteResponse>(`${this.apiUrl}/${id}`);
    }

}
