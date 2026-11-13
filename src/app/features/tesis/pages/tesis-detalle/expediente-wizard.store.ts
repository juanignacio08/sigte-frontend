import { Injectable, computed, inject, signal } from '@angular/core';
import { forkJoin, Observable, of, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { TesisService } from '../../services/tesis.service';
import { TesisExpedienteService } from '../../services/tesis-expediente.service';
import { Tesis } from '../../../../shared/models/tramites/tesis.model';
import { Expediente } from '../../../../shared/models/tramites/expediente.model';

@Injectable()  // ⚠️ SIN providedIn: 'root' → lo provee el wizard padre
export class ExpedienteWizardStore {

  private readonly tesisService = inject(TesisService);
  private readonly expedienteService = inject(TesisExpedienteService);

  private readonly _tesis       = signal<Tesis | null>(null);
  private readonly _expediente  = signal<Expediente | null>(null);
  private readonly _loading     = signal(false);
  private readonly _error       = signal<string | null>(null);
  private readonly _cargado     = signal(false);

  readonly tesis      = this._tesis.asReadonly();
  readonly expediente = this._expediente.asReadonly();
  readonly loading    = this._loading.asReadonly();
  readonly error      = this._error.asReadonly();

  // Derivados útiles
  readonly tesisId      = computed(() => this._tesis()?.id ?? null);
  readonly expedienteId = computed(() => this._expediente()?.id ?? null);
  readonly etapaCodigo  = computed(() => this._expediente()?.etapaCodigo ?? null);

  cargar(tesisId: string, expedienteId: number): Observable<void> {
    // Cache hit — ya cargados los mismos
    if (this._cargado()
        && this._tesis()?.id === tesisId
        && this._expediente()?.id === expedienteId) {
      return of(undefined);
    }

    this._loading.set(true);
    this._error.set(null);

    return forkJoin({
      tesis:      this.tesisService.getById(tesisId),
      expediente: this.expedienteService.obtenerPorId(expedienteId),
    }).pipe(
      tap(({ tesis, expediente }) => {
        this._tesis.set(tesis.data);
        this._expediente.set(expediente.data);
        this._loading.set(false);
        this._cargado.set(true);
      }),
      map(() => undefined),
      catchError((err) => {
        this._loading.set(false);
        this._error.set(
          err.status === 0
            ? 'Sin conexión al servidor'
            : 'No se pudo cargar la información del expediente'
        );
        return throwError(() => err);
      }),
    );
  }

  /** Actualiza el expediente en memoria (ej. tras actualizar paso/estado). */
  actualizarExpediente(exp: Expediente): void {
    this._expediente.set(exp);
  }

  /** Refresca el expediente desde el backend. */
  refrescarExpediente(): Observable<Expediente | null> {
    const id = this._expediente()?.id;
    if (!id) return of(null);
    return this.expedienteService.obtenerPorId(id).pipe(
      tap(res => this._expediente.set(res.data)),
      map(res => res.data),
    );
  }
}