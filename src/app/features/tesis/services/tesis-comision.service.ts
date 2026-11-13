import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { environment } from '../../../../environments/environment.development';
import { ComisionMiembroRequest, ComisionMiembroResponse, ComisionRequest, ComisionResponse } from '../../../shared/models/tramites/comision.model';
import { Observable } from 'rxjs';

@Service()
export class TesisComisionService {
    
    private readonly http = inject(HttpClient);
    private readonly apiUrl = `${environment.apiUrl}/comision`;

    registrar(request: ComisionRequest): Observable<ComisionResponse> {
        return this.http.post<ComisionResponse>(this.apiUrl, request);
    }

    registrarMiembro(request: ComisionMiembroRequest): Observable<ComisionMiembroResponse> {
        return this.http.post<ComisionMiembroResponse>(`${this.apiUrl}/registrarMiembro`, request);
    }

    actualizarRolMiembro(id: number, rol: string): Observable<ComisionMiembroResponse> {
        return this.http.post<ComisionMiembroResponse>(
            `${this.apiUrl}/miembro/actualizarRol/${id}/${rol}`,
            null
        );
    }

    eliminarMiembro(id: number): Observable<ComisionMiembroResponse> {
        return this.http.delete<ComisionMiembroResponse>(`${this.apiUrl}/miembro/${id}`);
    }

    obtenerPorTesisYEtapa(tesisId: string, etapa: string): Observable<ComisionResponse> {
        return this.http.get<ComisionResponse>(`${this.apiUrl}/${tesisId}/${etapa}`);
    }

    obtenerDetalle(id: number): Observable<ComisionResponse> {
        return this.http.get<ComisionResponse>(`${this.apiUrl}/${id}`);
    }

    listarPorTesis(tesisId: string): Observable<ComisionResponse[]> {
        return this.http.get<ComisionResponse[]>(`${this.apiUrl}/listarPorTesis/${tesisId}`);
    }
}
