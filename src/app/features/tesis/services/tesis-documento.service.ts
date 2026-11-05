import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { environment } from '../../../../environments/environment.development';
import { Observable } from 'rxjs';
import { DocumentoTesisListResponse, DocumentoTesisResponse, GenerarMemoRequest, RegistrarDictamenRequest } from '../../../shared/models/tramites/documento-tesis.model';
import { ContenidoEmailResponse, EnvioCorreo, EnvioCorreoListResponse } from '../../../shared/models/tramites/contenido-email';
import { ResponseDTO } from '../../../shared/models/base/ResponseDTO.model';

@Service()
export class TesisDocumentoService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/documento`;
  private readonly apiUrlEnvioCorreos = `${environment.apiUrl}/envio_correo`;

  listarPorExpediente(expedienteId: number): Observable<DocumentoTesisResponse> {
    return this.http.get<DocumentoTesisResponse>(
      `${this.apiUrl}/expediente/obtenerMemorando/${expedienteId}`
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

  eliminarMemo(documentoId: number): Observable<DocumentoTesisResponse> {
    return this.http.delete<DocumentoTesisResponse>(
      `${this.apiUrl}/memo/${documentoId}`
    );
  }

  registrarDictamen(request: RegistrarDictamenRequest): Observable<DocumentoTesisResponse> {
    const formData = new FormData();
    formData.append('expedienteId', request.expedienteId.toString());
    formData.append('resultadoCodigo', request.resultadoCodigo);
    if (request.observaciones) {
      formData.append('observaciones', request.observaciones);
    }
    if (request.fechaEmision) {
      formData.append('fechaEmision', request.fechaEmision);
    }
    if (request.archivoPdf) {
      formData.append('archivoPdf', request.archivoPdf);
    }
    if (request.archivoWord) {
      formData.append('archivoWord', request.archivoWord);
    }
    return this.http.post<DocumentoTesisResponse>(
      `${this.apiUrl}/dictamen`,
      formData
    );
  }

  obtenerDictamen(expedienteId: number) : Observable<DocumentoTesisResponse> {
    return this.http.get<DocumentoTesisResponse>(
      `${this.apiUrl}/dictamen/expediente/${expedienteId}`
    );
  }

  eliminarDictamen(expedienteId: number) : Observable<DocumentoTesisResponse> {
    return this.http.delete<DocumentoTesisResponse>(
      `${this.apiUrl}/dictamen/expediente/${expedienteId}`
    );
  }

  enviarMemo(documentoId: number): Observable<DocumentoTesisResponse> {
    return this.http.post<DocumentoTesisResponse>(
      `${this.apiUrl}/${documentoId}/enviar`,
      null
    );
  }

  obtenerContenidoEnviar(
    expedienteId: number
  ): Observable<ContenidoEmailResponse> {
    return this.http.get<ContenidoEmailResponse>(
      `${this.apiUrl}/contenidoEnviarMemo/${expedienteId}`
    );
  }

  listarEnviosPorExpediente(
    expedienteId: number
  ): Observable<EnvioCorreoListResponse> {
    return this.http.get<EnvioCorreoListResponse>(
      `${this.apiUrlEnvioCorreos}/historial/${expedienteId}`
    );
  }
}
