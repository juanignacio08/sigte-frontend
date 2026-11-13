import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment.development';
import { EstudianteFiltro, EstudiantePaginatedResponse, EstudianteRequest, EstudianteResponse } from '../../../shared/models/personas/estudiante.model';

@Injectable({
  providedIn: 'root'
})
export class EstudianteService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/estudiantes`;

  /** POST /estudiantes - Registra un nuevo estudiante */
  guardar(request: EstudianteRequest): Observable<EstudianteResponse> {
    return this.http.post<EstudianteResponse>(this.apiUrl, request);
  }

  /** PUT /estudiantes/{id} - Actualiza datos de un estudiante */
  editar(id: number, request: EstudianteRequest): Observable<EstudianteResponse> {
    return this.http.put<EstudianteResponse>(`${this.apiUrl}/${id}`, request);
  }

  /** GET /estudiantes/{id} - Obtiene el detalle completo por ID */
  getById(id: number): Observable<EstudianteResponse> {
    return this.http.get<EstudianteResponse>(`${this.apiUrl}/${id}`);
  }

  /** POST /estudiantes/filtrar?page=0&size=10 - Consulta paginada con filtros dinámicos */
  getByFilters(filtro: EstudianteFiltro, page: number = 0, size: number = 10): Observable<EstudiantePaginatedResponse> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.post<EstudiantePaginatedResponse>(`${this.apiUrl}/filtrar`, filtro, { params });
  }

  /** PUT /estudiantes/activar/{id} - Cambia estado a activo (1) */
  activar(id: number): Observable<EstudianteResponse> {
    return this.http.put<EstudianteResponse>(`${this.apiUrl}/activar/${id}`, null);
  }

  /** PUT /estudiantes/desactivar/{id} - Cambia estado a inactivo (0) */
  desactivar(id: number): Observable<EstudianteResponse> {
    return this.http.put<EstudianteResponse>(`${this.apiUrl}/desactivar/${id}`, null);
  }

  /** DELETE /estudiantes/{id} - Realiza un borrado lógico */
  eliminar(id: number): Observable<EstudianteResponse> {
    return this.http.delete<EstudianteResponse>(`${this.apiUrl}/${id}`);
  }
}