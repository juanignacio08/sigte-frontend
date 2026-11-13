import { inject, Service } from '@angular/core';
import { environment } from '../../../../environments/environment.development';
import { HttpClient } from '@angular/common/http';
import { ActualizarPlantillaDocumentoRequest, PlantillaDocumentoResponse, PlantillaDocumentoResponseList, RegistrarPlantillaDocumentoRequest } from '../../../shared/models/master/plantilla-documento.model';
import { Observable } from 'rxjs';

@Service()
export class PlantillaDocumentoService {
    private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/plantilla`;

  registrar(request: RegistrarPlantillaDocumentoRequest) : Observable<PlantillaDocumentoResponse> {
    const formData = new FormData();

    formData.append('escuelaId', request.escuelaId.toString());
    formData.append('tipoDocumentoCodigo', request.tipoDocumentoCodigo);
    formData.append('archivoDocx', request.archivoDocx);

    if (request.plazoDias != null) {
      formData.append('plazoDias', request.plazoDias.toString());
    }

    if (request.plazoMeses != null) {
      formData.append('plazoMeses', request.plazoMeses.toString());
    }

    return this.http.post<PlantillaDocumentoResponse>(
      this.apiUrl,
      formData
    );
  }

  actualizar(
    id: number,
    request: ActualizarPlantillaDocumentoRequest
  ) : Observable<PlantillaDocumentoResponse> {
    const formData = new FormData();

    if (request.plazoDias != null) {
      formData.append('plazoDias', request.plazoDias.toString());
    }

    if (request.plazoMeses != null) {
      formData.append('plazoMeses', request.plazoMeses.toString());
    }

    if (request.archivoDocx) {
      formData.append('archivoDocx', request.archivoDocx);
    }

    return this.http.put<PlantillaDocumentoResponse>(
      `${this.apiUrl}/${id}`,
      formData
    );
  }

  listarPorEscuela(escuelaId: number) : Observable<PlantillaDocumentoResponseList> {
    return this.http.get<PlantillaDocumentoResponseList>(
      `${this.apiUrl}/escuela/${escuelaId}`
    );
  }

  obtenerPorEscuelaYTipo(escuelaId: number, tipoCodigo: string) : Observable<PlantillaDocumentoResponse> {
    return this.http.get<PlantillaDocumentoResponse>(
      `${this.apiUrl}/escuela/${escuelaId}/tipo/${tipoCodigo}`
    );
  }

  eliminar(id: number) : Observable<PlantillaDocumentoResponse> {
    return this.http.delete<PlantillaDocumentoResponse>(
      `${this.apiUrl}/${id}`
    );
  }
}
