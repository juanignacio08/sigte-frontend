import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { environment } from '../../../../environments/environment.development';
import { Observable } from 'rxjs';
import { DocumentoTesisListResponse, DocumentoTesisResponse, GenerarMemoRequest } from '../../../shared/models/tramites/documento-tesis.model';

@Service()
export class TesisDocumentoService {
    private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/documento`;

  listarPorExpediente(expedienteId: number): Observable<DocumentoTesisResponse> {
    return this.http.get<DocumentoTesisResponse>(
      `${this.apiUrl}/expediente/${expedienteId}`
    );
  }

  listarPorTesis(tesisId: string): Observable<DocumentoTesisListResponse> {
    return this.http.get<DocumentoTesisListResponse>(
      `${this.apiUrl}/tesis/${tesisId}`
    );
  }

  listarPorExpedienteYTipoDocumento(expedienteId: number, tipoCodigo: string): Observable<DocumentoTesisListResponse> {
    return this.http.get<DocumentoTesisListResponse>(
      `${this.apiUrl}/expediente/${expedienteId}/tipo/${tipoCodigo}`
    );
  }

  generarMemo(request: GenerarMemoRequest): Observable<DocumentoTesisResponse> {
    return this.http.post<DocumentoTesisResponse>(
      `${this.apiUrl}/memo`,
      request
    );
  }

  volverAGenerarMemo(documentoId: number): Observable<DocumentoTesisResponse> {
    return this.http.put<DocumentoTesisResponse>(
      `${this.apiUrl}/memo/${documentoId}/regenerar`,
      null
    );
  }

  eliminar(documentoId: number): Observable<DocumentoTesisResponse> {
    return this.http.delete<DocumentoTesisResponse>(
      `${this.apiUrl}/${documentoId}`
    );
  }
}
