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
import { TesisComisionService } from '../../services/tesis-comision.service';
import { Comision, ComisionMiembro } from '../../../../shared/models/tramites/comision.model';

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
    LoadingSpinnerComponent
  ],
  selector: 'app-tesis-detalle',
  styleUrl: './tesis-detalle.component.css',
  templateUrl: './tesis-detalle.component.html',
})
export class TesisDetalleComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly tesisService = inject(TesisService);
  private readonly comisionService = inject(TesisComisionService);
  private readonly notificationService = inject(NotificacionService);

  private readonly proyecto = TablaMaestraService.stageThesisProject;

  tesis = signal<Tesis | null>(null);
  comision = signal<Comision | null>(null);
  miembros = signal<ComisionMiembro[]>([]);

  controls = {
    loading: signal<boolean>(false),
    loadingComision: signal<boolean>(false),
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
    { route: 'expediente', label: 'Expediente y Archivos', icon: 'pi pi-folder' },
  ];

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.cargarDetalle(id);
      this.cargarComision(id);
    }
  }

  cargarDetalle(id: string): void {
    this.controls.loading.set(true);
    this.controls.connectionError.set(false);

    this.tesisService.getDetalleById(id).subscribe({
      next: (res) => {
        this.tesis.set(res.data);
        if (this.tesis()?.expedienteActivo.etapaCodigo === TablaMaestraService.stageThesisDraft) {
          this.activeStep.set(2);          
        }
        this.controls.loading.set(false);
      },
      error: (err) => {
        this.notificationService.showError('No se pudo cargar la información de la tesis.');
        this.controls.loading.set(false);
        if (err.status === 0) this.controls.connectionError.set(true);
      }
    });
  }

  cargarComision(tesisId: string): void {
    this.controls.loadingComision.set(true);
    this.controls.connectionError.set(false);

    this.comisionService.obtenerPorTesisYEtapa(tesisId, this.etapaActiva().codigo).subscribe({
      next: (res) => {
        this.comision.set(res.data);
        this.miembros.set(res.data.miembros || []);
        this.controls.loadingComision.set(false);
      },
      error: (err) => {
        this.controls.loadingComision.set(false);
        if (err.status === 0) {
          this.controls.connectionError.set(true);
        } else {
          this.notificationService.showError('No se pudo cargar la comisión.');
        }
      },
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

  getAvatarClass(rol: string): string {
    const r = (rol ?? '').toUpperCase();
    if (r.includes('PRESIDENTE')) return 'bg-gradient-to-br from-slate-400 to-slate-600';
    if (r.includes('SECRETARIO')) return 'bg-gradient-to-br from-red-400 to-red-600';
    if (r.includes('MIEMBRO')) return 'bg-gradient-to-br from-emerald-400 to-emerald-600';
    if (r.includes('ASESOR')) return 'bg-gradient-to-br from-purple-400 to-purple-600';
    return 'bg-gradient-to-br from-amber-400 to-amber-600';
  }

  getInitials(nombre: string): string {
    if (!nombre) return '?';
    if (nombre.includes('-') && nombre.length > 20) return nombre.substring(0, 2).toUpperCase();
    return nombre
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  }

  getRolBadgeClass(rol: string): string {
    const r = (rol ?? '').toUpperCase(); 
    if (r.includes('PRESIDENTE')) return 'bg-slate-50 text-slate-700 border-slate-200';
    if (r.includes('SECRETARIO')) return 'bg-red-50 text-red-700 border-red-200';
    if (r.includes('MIEMBRO')) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (r.includes('ASESOR')) return 'bg-purple-50 text-purple-700 border-purple-200';
    return 'bg-amber-50 text-amber-700 border-amber-200';
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