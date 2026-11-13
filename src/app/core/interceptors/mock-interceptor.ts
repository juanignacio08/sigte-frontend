import { HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { MOCK_ROUTES } from '../mocks/mock-routes';

export const mockInterceptor: HttpInterceptorFn = (req, next) => {
  // Si explícitamente apagaste el modo mock en el environment, 
  // permitimos que vaya al backend real.
  if (!environment.useMock) return next(req);

  // 1. Obtener la ruta (sin dominio ni query params)
  const pathname = new URL(req.url, 'http://localhost').pathname;
  const segments = pathname.split('/').filter(Boolean);

  // 2. Encontrar a qué grupo pertenece esta URL
  const resource = segments.find(seg => MOCK_ROUTES[seg] !== undefined);

  // Si no encuentra el grupo, NO va al backend, lanza error local
  if (!resource) {
    console.error(`[MOCK] Recurso no mockeado: ${req.method} ${req.url}`);
    return throwError(() => ({
      status: 404,
      message: `Mock no implementado para el recurso: ${req.url}`
    })).pipe(delay(300));
  }

  // 3. Buscar el handler solo dentro de ese grupo
  const routes = MOCK_ROUTES[resource];
  const handler = routes.find(r => r.method === req.method && (r.test ? r.test(req.url) : false));

  // Si no encuentra el handler, NO va al backend, lanza error local
  if (!handler) {
    console.error(`[MOCK] Endpoint no mockeado: ${req.method} ${req.url} en el grupo "${resource}"`);
    return throwError(() => ({
      status: 404,
      message: `Mock no implementado: ${req.method} ${req.url}`
    })).pipe(delay(300));
  }

  // 4. Ejecutar el handler y devolver la respuesta local
  try {
    const body = handler.handle(req);
    return of(new HttpResponse({ status: 200, body })).pipe(delay(300));
  } catch (err: any) {
    // Si el handler lanza un error (ej. throw { status: 404, message: 'No encontrado' })
    return throwError(() => ({
      status: err?.status ?? 500,
      message: err?.message ?? 'Error en mock'
    })).pipe(delay(300));
  }
};