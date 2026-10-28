import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NotificacionService } from '../../../../../shared/services/notificacion.service';
import { TesisService } from '../../../services/tesis.service';
import { ComisionMiembro } from '../../../../../shared/models/tramites/comision.model';
import { ConfirmActionType } from '../../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { Tesis } from '../../../../../shared/models/tramites/tesis.model';
import { NoConnectionComponent } from '../../../../../shared/components/no-connection/no-connection.component';
import { LoadingSpinnerComponent } from '../../../../../shared/components/loading-spinner/loading-spinner.component';
import { ExpedienteStepperComponent } from '../../../components/expediente-stepper/expediente-stepper.component';
import { Expediente } from '../../../../../shared/models/tramites/expediente.model';
import { CommonModule } from '@angular/common';
import { forkJoin } from 'rxjs';
import { TesisExpedienteService } from '../../../services/tesis-expediente.service';

@Component({
  imports: [CommonModule, NoConnectionComponent, LoadingSpinnerComponent, ExpedienteStepperComponent],
  selector: 'app-expediente-comision',
  styleUrl: './expediente-comision.component.css',
  templateUrl: './expediente-comision.component.html',
})
export class ExpedienteComisionComponent implements OnInit {

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  private readonly tesisService = inject(TesisService);
  private readonly expedienteService = inject(TesisExpedienteService);
  private readonly notificationService = inject(NotificacionService);

  readonly loading = signal(false);
  readonly connectionError = signal(false);
  // Confirm Action
  confirmAction = { selectedItem: signal<ComisionMiembro | null>(null), selectedAction: signal<ConfirmActionType>('delete') }

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

    forkJoin({
      tesis: this.tesisService.getById(tesisId),
      expediente: this.expedienteService.obtenerPorId(expedienteId),
    }).subscribe({
      next: ({ tesis, expediente }) => {
        this.tesis.set(tesis.data);
        this.expediente.set(expediente.data);
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
