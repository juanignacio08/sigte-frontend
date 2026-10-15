import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { environment } from '../../../../environments/environment.development';
import { Observable } from 'rxjs';
import { ExpedienteListResponse, ExpedienteResponse } from '../../../shared/models/tramites/expediente.model';

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

    registrar(formData: FormData): Observable<any> {
        return this.http.post<any>(this.apiUrl, formData);
    }

    editar(id: number, formData: FormData): Observable<any> {
        return this.http.put<any>(`${this.apiUrl}/${id}`, formData);
    }

    activar(id: number): Observable<any> {
        return this.http.put<any>(`${this.apiUrl}/activar/${id}`, null);
    }

    desactivar(id: number, motivo: string): Observable<any> {
        const params = new HttpParams().set('id', id.toString()).set('motivo', motivo);
        return this.http.put<any>(`${this.apiUrl}/desactivar`, null, { params });
    }

    eliminar(id: number): Observable<any> {
        return this.http.delete<any>(`${this.apiUrl}/${id}`);
    }
}
