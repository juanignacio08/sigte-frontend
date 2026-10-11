import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { environment } from '../../../../environments/environment.development';
import { RegistrarTesisRequest, TesisFiltro, TesisPaginatedResponse, TesisResponse } from '../../../shared/models/tramites/tesis.model';
import { Observable } from 'rxjs';

@Service()
export class TesisService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/tesis`;

  /**
   * Registra una tesis con archivos PDFs (multipart/form-data)
   */
  guardar(request: RegistrarTesisRequest, archivosPdfs: File[]): Observable<TesisResponse> {
    const formData = new FormData();

    // Campos simples
    formData.append('escuelaId', String(request.escuelaId));
    formData.append('titulo', request.titulo);
    formData.append('numeroExpediente', request.numeroExpediente);
    if (request.etapaTesisCodigo) {
      formData.append('etapaTesisCodigo', request.etapaTesisCodigo);
    }
    if (request.numeroRevision) {
      formData.append('numeroRevision', String(request.numeroRevision));
    }

    // Lista de IDs → mismo nombre repetido
    request.estudiantesIds.forEach(id => {
      formData.append('estudiantesIds', String(id));
    });

    // Archivos → mismo nombre repetido (DEBE coincidir con el campo del record)
    archivosPdfs.forEach(file => {
      formData.append('archivosPdfs', file);
    });

    return this.http.post<TesisResponse>(this.apiUrl, formData);
  }

  /**
   * Obtiene el detalle completo por UUID
   */
  getById(id: string): Observable<TesisResponse> {
    return this.http.get<TesisResponse>(`${this.apiUrl}/${id}`);
  }

  /**
   * Consulta paginada con filtros
   */
  getByFilters(filtro: TesisFiltro, page: number = 0, size: number = 10): Observable<TesisPaginatedResponse> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.post<TesisPaginatedResponse>(`${this.apiUrl}/filtrar`, filtro, { params });
  }
}
