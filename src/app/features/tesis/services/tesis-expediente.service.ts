import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { environment } from '../../../../environments/environment.development';
import { Observable } from 'rxjs';
import { ActualizarExpedienteRequest, ExpedienteArchivoListResponse, ExpedienteArchivoResponse, ExpedienteListResponse, ExpedienteResponse } from '../../../shared/models/tramites/expediente.model';

@Service()
export class TesisExpedienteService {
    private readonly http = inject(HttpClient);
    private readonly apiUrl = `${environment.apiUrl}/expediente`;

    listarPorTesis(tesisId: string): Observable<ExpedienteListResponse> {
        return this.http.get<ExpedienteListResponse>(`${this.apiUrl}/listarPorTesis/${tesisId}`);
    }

    listarPorTesisYEtapa(tesisId: string, etapa: string): Observable<ExpedienteListResponse> {
        return this.http.get<ExpedienteListResponse>(`${this.apiUrl}/listarPorTesis/${tesisId}/${etapa}`);
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

    obtenerArchivosPorExpediente(expedienteId: number): Observable<ExpedienteArchivoListResponse> {
        return this.http.get<ExpedienteArchivoListResponse>(`${this.apiUrl}/listarArchivosPorExpediente/${expedienteId}`);
    }

    registrarArchivo(formData: FormData): Observable<ExpedienteArchivoResponse> {
        return this.http.post<ExpedienteArchivoResponse>(`${this.apiUrl}/agregarArchivo`, formData);
    }

    eliminarArchivo(id: number): Observable<ExpedienteArchivoResponse> {
        return this.http.delete<ExpedienteArchivoResponse>(`${this.apiUrl}/eliminarArchivo/${id}`);
    }

    actualizarPasoYEstado(id: number, paso: number, estado: string): Observable<ExpedienteResponse> {
        const url = `${this.apiUrl}/actualizarPasoYEstado`;
        const params = new HttpParams()
            .set('id', id)
            .set('paso', paso)
            .set('estado', estado);

        return this.http.put<ExpedienteResponse>(url, null, { params });
    }

}
