import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { environment } from '../../../environments/environment.development';
import { Observable } from 'rxjs';

@Service()
export class FileService {
    private readonly http = inject(HttpClient);
    private readonly apiUrl = `${environment.apiUrl}/file`;

    descargarPlantilla(ruta: string): Observable<Blob> {
        return this.http.get(`${this.apiUrl}/plantillas/descargar`, {
            params: { ruta },
            responseType: 'blob'
        });
    }

    descargarPdf(ruta: string): Observable<Blob> {
        return this.http.get(`${this.apiUrl}/descargarPdf`, {
            params: { ruta },
            responseType: 'blob'
        });
    }
}
