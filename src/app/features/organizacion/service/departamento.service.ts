import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { environment } from '../../../../environments/environment.development';
import { Observable } from 'rxjs';
import { DepartamentoAcademico, DepartamentoAcademicoRequest, DepartamentoAcademicoResponse, DepartamentoAcademicoResponseList } from '../../../shared/models/master/departamento_academico.model';

@Service()
export class DepartamentoService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/departamentos`;

  /**
   * Obtiene la lista de departamentos académicos pertenecientes a una facultad.
   * @param facultadId ID de la facultad
   */
  getByFacultad(facultadId: number): Observable<DepartamentoAcademicoResponseList> {
    const url = `${this.apiUrl}/listarPorFacultad/${facultadId}`;

    return this.http.get<DepartamentoAcademicoResponseList>(url);
  }

  /** Obtener un departamento por su ID */
  getById(id: number): Observable<DepartamentoAcademico> {
    return this.http.get<DepartamentoAcademico>(`${this.apiUrl}/${id}`);
  }

  /** Crear un nuevo departamento */
  create(departamento: DepartamentoAcademicoRequest): Observable<DepartamentoAcademicoResponse> {
    const url = `${this.apiUrl}/guardar`;

    return this.http.post<DepartamentoAcademicoResponse>(url, departamento);
  }

  /** Actualizar un departamento existente */
  update(departamento: DepartamentoAcademicoRequest): Observable<DepartamentoAcademicoResponse> {
    const url = `${this.apiUrl}/editar`;
    return this.http.put<DepartamentoAcademicoResponse>(url, departamento);
  }

  /** Activar un departamento existente */
  active(id: number): Observable<DepartamentoAcademicoResponse> {
    const url = `${this.apiUrl}/activar/${id}`;
    return this.http.put<DepartamentoAcademicoResponse>(url, null);
  }

  /** Actualizar un departamento existente */
  deactive(id: number): Observable<DepartamentoAcademicoResponse> {
    const url = `${this.apiUrl}/desactivar/${id}`;
    return this.http.put<DepartamentoAcademicoResponse>(url, null);
  }

  /** Eliminar un departamento */
  delete(id: number): Observable<DepartamentoAcademicoResponse> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.delete<DepartamentoAcademicoResponse>(url);
  }
}
