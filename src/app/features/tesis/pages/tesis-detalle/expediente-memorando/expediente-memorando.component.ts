import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TesisService } from '../../../services/tesis.service';
import { TesisExpedienteService } from '../../../services/tesis-expediente.service';
import { NotificacionService } from '../../../../../shared/services/notificacion.service';
import { Tesis } from '../../../../../shared/models/tramites/tesis.model';
import { Expediente } from '../../../../../shared/models/tramites/expediente.model';
import { forkJoin } from 'rxjs';
import { NoConnectionComponent } from '../../../../../shared/components/no-connection/no-connection.component';
import { LoadingSpinnerComponent } from '../../../../../shared/components/loading-spinner/loading-spinner.component';
import { ExpedienteStepperComponent } from '../../../components/expediente-stepper/expediente-stepper.component';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from '../../../../../shared/components/button/button.component';

@Component({
  imports: [
    NoConnectionComponent,
    LoadingSpinnerComponent,
    ExpedienteStepperComponent,
    CommonModule,
    ButtonComponent
  ],
  selector: 'app-expediente-memorando',
  styleUrl: './expediente-memorando.component.css',
  templateUrl: './expediente-memorando.component.html',
})
export class ExpedienteMemorandoComponent implements OnInit {

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  private readonly tesisService = inject(TesisService);
  private readonly expedienteService = inject(TesisExpedienteService);
  private readonly notificationService = inject(NotificacionService);

  readonly loading = signal(false);
  readonly connectionError = signal(false);
  readonly loadingOperation = signal(false);
  readonly connectionErrorOperation = signal(false);

  readonly tesis = signal<Tesis | null>(null);
  readonly expediente = signal<Expediente | null>(null);

  readonly tesisId = signal<string | null>(
    this.route.snapshot.paramMap.get('tesisId')
  );

  readonly expedienteId = signal<number | null>(
    this.obtenerExpedienteId()
  );

  private obtenerExpedienteId(): number | null {
    const id = this.route.snapshot.paramMap.get('expedienteId');

    if (!id || !/^[1-9]\d*$/.test(id)) {
      return null;
    }

    const parsedId = Number(id);

    return Number.isSafeInteger(parsedId) ? parsedId : null;
  }

  ngOnInit(): void {
    const tesisId = this.tesisId();
    const expedienteId = this.expedienteId();

    if (!tesisId || !expedienteId) {
      this.notificationService.showError(
        'Los parámetros de la ruta no son válidos.'
      );
      return;
    }

    this.cargarDatos(tesisId, expedienteId);
  }

  private cargarDatos(tesisId: string, expedienteId: number): void {
    this.loading.set(true);
    this.connectionError.set(false);

    const tesisGuardada = localStorage.getItem('tesisSeleccionada');
    const expedienteGuardado = localStorage.getItem('expedienteSeleccionado');

    if (tesisGuardada && expedienteGuardado) {
      const tsi: Tesis = JSON.parse(tesisGuardada);
      const exp: Expediente = JSON.parse(expedienteGuardado);

      this.tesis.set(tsi);
      this.expediente.set(exp);
      this.loading.set(false)

    } else {
      forkJoin({
        tesis: this.tesisService.getById(tesisId),
        expediente: this.expedienteService.obtenerPorId(expedienteId),
      }).subscribe({
        next: ({ tesis, expediente }) => {
          this.tesis.set(tesis.data);
          localStorage.setItem('tesisSeleccionada', JSON.stringify(tesis.data));

          this.expediente.set(expediente.data);
          localStorage.setItem('expedienteSeleccionado', JSON.stringify(expediente.data));

          this.loading.set(false);

        },
        error: (err) => {
          this.loading.set(false);

          if (err.status === 0) {
            this.connectionError.set(true);
            return;
          }

          this.notificationService.showError(
            'No se pudo cargar la información del expediente.'
          );
        },
      });
    }
  }

  volverAtras(): void {
    const expedienteId = this.expedienteId();

    if (expedienteId) {
      this.router.navigate([
        '/tesis',
        'detalle',
        this.tesisId(),
        'expediente',
        this.expedienteId(),
        'comision'
      ]);
    }
  }

  continuarSiguientePaso(): void {
    this.router.navigate([
      '/tesis',
      'detalle',
      this.tesisId(),
      'expediente',
      this.expedienteId(),
      'memorando'
    ]);
  }
}
