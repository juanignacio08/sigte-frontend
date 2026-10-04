import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { environment } from '../../../../environments/environment.development';
import { DocenteFiltro, DocenteMetricaResponse, DocentePaginatedResponse, DocenteRequest, DocenteResponse } from '../../../shared/models/personas/docente.model';
import { Observable } from 'rxjs';

@Service()
export class DocenteService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/docentes`;

  /**
   * Registrar un nuevo docente en el sistema
   * POST /docentes
   */
  guardar(request: DocenteRequest): Observable<DocenteResponse> {
    return this.http.post<DocenteResponse>(this.apiUrl, request);
  }

  /**
   * Editar un docente existente por su ID
   * PUT /docentes/{id}
   */
  editar(id: number, request: DocenteRequest): Observable<DocenteResponse> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.put<DocenteResponse>(url, request);
  }

  /**
   * Obtener lista paginada de docentes por filtros de búsqueda
   * POST /docentes/filtrar?page={page}&size={size}
   */
  getByFilters(filtro: DocenteFiltro, page: number = 0, size: number = 10): Observable<DocentePaginatedResponse> {
    const url = `${this.apiUrl}/filtrar`;
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.post<DocentePaginatedResponse>(url, filtro, { params });
  }

  getMetricsByFacultad(facultadId: number): Observable<DocenteMetricaResponse> {
    const url = `${this.apiUrl}/metricas/${facultadId}`;
    return this.http.get<DocenteMetricaResponse>(url);
  }

  getById(id: number): Observable<DocenteResponse> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.get<DocenteResponse>(url);
  }

  getByNumDocumento(tipoDocumento: string, numeroDocumento: string): Observable<DocenteResponse> {
    const url = `${this.apiUrl}/obtenerPorNumDocumento`;
    const params = new HttpParams()
      .set('tipoDocumento', tipoDocumento)
      .set('numeroDocumento', numeroDocumento);

    return this.http.get<DocenteResponse>(url, { params });
  }

  /**
   * Activar un docente por ID
   * PUT /docentes/activar/{id}
   */
  activar(id: number): Observable<DocenteResponse> {
    const url = `${this.apiUrl}/activar/${id}`;
    return this.http.put<DocenteResponse>(url, null);
  }

  /**
   * Desactivar un docente por ID
   * PUT /docentes/desactivar/{id}
   */
  desactivar(id: number): Observable<DocenteResponse> {
    const url = `${this.apiUrl}/desactivar/${id}`;
    return this.http.put<DocenteResponse>(url, null);
  }

  /**
   * Eliminar un docente por ID
   * DELETE /docentes/{id}
   */
  eliminar(id: number): Observable<DocenteResponse> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.delete<DocenteResponse>(url);
  }
}
