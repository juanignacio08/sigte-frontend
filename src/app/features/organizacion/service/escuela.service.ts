import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { environment } from '../../../../environments/environment.development';
import { Observable } from 'rxjs';
import { EscuelaProfesionalRequest, EscuelaResponse, EscuelaResponseList } from '../../../shared/models/master/escuela_profesional.model';

@Service()
export class EscuelaService {
    private readonly http = inject(HttpClient);
    private readonly apiUrl = `${environment.apiUrl}/escuelas`;

    /**
     * Obtiene la lista de escuelas pertenecientes a una facultad.
     * @param facultadId ID de la facultad
     */
    getByFacultad(facultadId: number): Observable<EscuelaResponseList> {
        const url = `${this.apiUrl}/listarPorFacultad/${facultadId}`;

        return this.http.get<EscuelaResponseList>(url);
    }

    /**
     * Obtiene la lista de escuelas activas pertenecientes a una facultad.
     * @param facultadId ID de la facultad
     */
    getActivesByFacultad(facultadId: number): Observable<EscuelaResponseList> {
        const url = `${this.apiUrl}/listarActivosPorFacultad/${facultadId}`;

        return this.http.get<EscuelaResponseList>(url);
    }

    /**
     * Obtiene la lista de escuelas pertenecientes a un departamento.
     * @param departamentoId ID del departamento
     */
    getByDepartment(departamentoId: number): Observable<EscuelaResponseList> {
        const url = `${this.apiUrl}/listarPorDepartamento/${departamentoId}`;

        return this.http.get<EscuelaResponseList>(url);
    }

    /** Obtener una escuela a detalle por su ID */
    getById(id: number): Observable<EscuelaResponse> {
        return this.http.get<EscuelaResponse>(`${this.apiUrl}/${id}`);
    }

    /** Crear una nueva escuela */
    create(escuela: EscuelaProfesionalRequest): Observable<EscuelaResponse> {
        const url = `${this.apiUrl}`;
        return this.http.post<EscuelaResponse>(url, escuela);
    }

    /** Actualizar una escuela existente */
    update(escuela: EscuelaProfesionalRequest): Observable<EscuelaResponse> {
        const url = `${this.apiUrl}`;
        return this.http.put<EscuelaResponse>(url, escuela);
    }

    /** Activar un departamento existente */
    active(id: number): Observable<EscuelaResponse> {
        const url = `${this.apiUrl}/activar/${id}`;
        return this.http.put<EscuelaResponse>(url, null);
    }

    /** Actualizar un departamento existente */
    deactive(id: number): Observable<EscuelaResponse> {
        const url = `${this.apiUrl}/desactivar/${id}`;
        return this.http.put<EscuelaResponse>(url, null);
    }

    /** Eliminar un departamento */
    delete(id: number): Observable<EscuelaResponse> {
        const url = `${this.apiUrl}/${id}`;
        return this.http.delete<EscuelaResponse>(url);
    }

    descargarPlantilla(ruta: string): Observable<Blob> {
        return this.http.get(`${this.apiUrl}/plantillas/descargar`, {
            params: { ruta },
            responseType: 'blob'
        });
    }
}
