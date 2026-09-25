import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { MessageService } from '@openng/optimus-ui/api';
import { catchError, retry, throwError } from 'rxjs';
import { ErrorResponse } from '../../shared/models/error/error_response.model';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const toastService = inject(MessageService);

  const esMetodoSeguro = req.method === 'GET';

  return next(req).pipe(
    retry({
      count: esMetodoSeguro ? 1 : 0,
      delay: 1000
    }),
    catchError((error: HttpErrorResponse) => {
      
      let mensajeMostrar = 'Ha ocurrido un error inesperado de comunicación.';
      let tituloMostrar = 'Error de Servidor';

      // Si el backend respondió con el JSON estandarizado ErrorResponse
      if (error.error && typeof error.error === 'object' && 'mensaje' in error.error) {
        const backendError = error.error as ErrorResponse;
        mensajeMostrar = backendError.mensaje;
        tituloMostrar = `Error (${backendError.codigo || error.status})`;
      } else if (error.status === 0) {
        mensajeMostrar = 'No se pudo conectar con el servidor. Verifique su conexión a internet.';
        tituloMostrar = 'Error de Conexión';
      }

      // Mostrar el Toast de Optimus UI
      toastService.add({
        severity: 'error',
        summary: tituloMostrar,
        detail: mensajeMostrar,
        life: 5000
      });

      // Re-lanzar el error para que el componente también sepa si necesita detener un spinner o estado
      return throwError(() => error);
    })
  );
};
