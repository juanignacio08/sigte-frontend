import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { Tesis } from '../../../../shared/models/tramites/tesis.model';
import { ActivatedRoute, Router } from '@angular/router';
import { TesisService } from '../../services/tesis.service';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { CommonModule } from '@angular/common';
import { NotificacionService } from '../../../../shared/services/notificacion.service';
import { TabsModule } from '@openng/optimus-ui/tabs';
import { ExpedienteTabComponent } from '../expediente-tab/expediente-tab.component';
import { NoConnectionComponent } from '../../../../shared/components/no-connection/no-connection.component';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';
import { TablaMaestraService } from '../../../configuracion/services/tabla-maestra.service';
import { ComisionTabComponent } from '../comision-tab/comision-tab.component';

interface EtapaStep {
  codigo: string;
  label: string;
  icon: string;
  descripcion: string;
}

@Component({
  imports: [
    ButtonComponent,
    CommonModule,
    TabsModule,
    ExpedienteTabComponent,
    NoConnectionComponent,
    LoadingSpinnerComponent,
    ComisionTabComponent
],
  selector: 'app-tesis-detalle',
  styleUrl: './tesis-detalle.component.css',
  templateUrl: './tesis-detalle.component.html',
})
export class TesisDetalleComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly tesisService = inject(TesisService);
  private readonly notificationService = inject(NotificacionService);

  private readonly proyecto = TablaMaestraService.stageThesisProject;

  tesis = signal<Tesis | null>(null);

  controls = {
    loading: signal<boolean>(false),
    connectionError: signal<boolean>(false)
  };

  activeTab = signal<string>('resumen');
  activeStep = signal<number>(1);

  readonly etapas: EtapaStep[] = [
    {
      codigo: TablaMaestraService.stageThesisProject,
      label: 'Proyecto',
      icon: 'pi pi-folder',
      descripcion: 'Revisión y aprobación del proyecto'
    },
    {
      codigo: TablaMaestraService.stageThesisDraft,
      label: 'Borrador',
      icon: 'pi pi-file-edit',
      descripcion: 'Revisión del borrador de tesis'
    },
    {
      codigo: TablaMaestraService.stageThesisThesisDefense,
      label: 'Sustentación',
      icon: 'pi pi-graduation-cap',
      descripcion: 'Sustentación y acta final'
    }
  ];

  readonly etapaActiva = computed(() =>
    this.etapas[this.activeStep() - 1] ?? this.etapas[0]
  );

  tabs = [
    { route: 'resumen', label: 'Resumen y Autores', icon: 'pi pi-user' },
    { route: 'comision', label: 'Comisión Revisora', icon: 'pi pi-users' },
    { route: 'expediente', label: 'Expediente y Archivos', icon: 'pi pi-folder' },
  ];

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) this.cargarDetalle(id);
  }

  cargarDetalle(id: string): void {
    this.controls.loading.set(true);
    this.controls.connectionError.set(false);

    this.tesisService.getDetalleById(id).subscribe({
      next: (res) => {
        this.tesis.set(res.data);
        this.controls.loading.set(false);
      },
      error: (err) => {
        this.notificationService.showError('No se pudo cargar la información de la tesis.');
        this.controls.loading.set(false);
        if (err.status === 0) this.controls.connectionError.set(true);
      }
    });
  }

  setStep(step: number): void {
    // Aquí puedes validar: no permitir saltar a etapas futuras
    // ej: if (step > this.maxStepReached()) return;
    this.activeStep.set(step);
  }

  onTabChange(value: string | number | undefined): void {
    if (value) this.activeTab.set(value.toString());
  }

  volver(): void {
    this.router.navigate(['/tesis/listar']);
  }

  generarResolucion(): void {
    this.notificationService.showSuccess('Generando documento de resolución oficial...');
  }

  notificarComision(): void {
    this.notificationService.showSuccess('Notificación enviada a los miembros de la comisión.');
  }

  registrarRevision(): void {
    this.notificationService.showSuccess('Abriendo módulo de registro de revisión...');
  }
}