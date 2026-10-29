import { Component, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
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
import { ExpedienteWizardStore } from '../expediente-wizard.store';

@Component({
  imports: [
    CommonModule,
    ButtonComponent
  ],
  selector: 'app-expediente-memorando',
  styleUrl: './expediente-memorando.component.css',
  templateUrl: './expediente-memorando.component.html',
})
export class ExpedienteMemorandoComponent implements OnInit {

  private readonly router = inject(Router);

  private readonly expedienteService = inject(TesisExpedienteService);
  private readonly notificationService = inject(NotificacionService);

  // ✅ Store compartido — el wizard padre ya cargó tesis y expediente
  protected readonly store = inject(ExpedienteWizardStore);
  readonly tesis = this.store.tesis;
  readonly expediente = this.store.expediente;
  readonly tesisId = this.store.tesisId;        // string | null
  readonly expedienteId = this.store.expedienteId;  // number | null

  readonly loadingOperation = signal(false);
  readonly connectionErrorOperation = signal(false);

  ngOnInit(): void {
    
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
