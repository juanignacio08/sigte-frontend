import { Component, inject, OnInit, signal, viewChild } from '@angular/core';
import { Router } from '@angular/router';
import { MessageModule } from '@openng/optimus-ui/message';
import { NotificacionService } from '../../../../../shared/services/notificacion.service';
import { Comision, ComisionMiembro, ComisionRequest } from '../../../../../shared/models/tramites/comision.model';
import { ConfirmActionType, ConfirmDialogComponent } from '../../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { NoConnectionComponent } from '../../../../../shared/components/no-connection/no-connection.component';
import { CommonModule } from '@angular/common';
import { TesisExpedienteService } from '../../../services/tesis-expediente.service';
import { TesisComisionService } from '../../../services/tesis-comision.service';
import { TableModule } from '@openng/optimus-ui/table';
import { ButtonComponent } from '../../../../../shared/components/button/button.component';
import { AgregarMiembroComisionComponent } from '../../comision-tab/agregar-miembro-comision/agregar-miembro-comision.component';
import { TableSkeletonComponent } from '../../../../../shared/components/table-skeleton/table-skeleton.component';
import { TablaMaestraService } from '../../../../configuracion/services/tabla-maestra.service';
import { ExpedienteWizardStore } from '../expediente-wizard.store';

@Component({
  imports: [
    CommonModule,
    NoConnectionComponent,
    TableModule,
    ButtonComponent,
    AgregarMiembroComisionComponent,
    ConfirmDialogComponent,
    TableSkeletonComponent,
    MessageModule
  ],
  selector: 'app-expediente-comision',
  styleUrl: './expediente-comision.component.css',
  templateUrl: './expediente-comision.component.html',
})
export class ExpedienteComisionComponent implements OnInit {

  // Referencias a modales hijos (patrón Expediente)
  modalAgregarMiembro = viewChild<AgregarMiembroComisionComponent>('modalAgregarMiembro');
  confirmModal = viewChild<ConfirmDialogComponent>('confirmModal');

  private readonly router = inject(Router);

  private readonly expedienteService = inject(TesisExpedienteService);
  private readonly comisionService = inject(TesisComisionService);
  private readonly notificationService = inject(NotificacionService);

  // ✅ Store compartido — el wizard padre ya cargó tesis y expediente
  protected readonly store = inject(ExpedienteWizardStore);
  readonly tesis = this.store.tesis;
  readonly expediente = this.store.expediente;
  readonly tesisId = this.store.tesisId;        // string | null
  readonly expedienteId = this.store.expedienteId;  // number | null

  readonly loadingOperation = signal(false);
  readonly connectionErrorOperation = signal(false);
  // Confirm Action
  confirmAction = { selectedItem: signal<ComisionMiembro | null>(null), selectedAction: signal<ConfirmActionType>('delete') }

  comision = signal<Comision | null>(null);
  miembros = signal<ComisionMiembro[]>([]);

  erroresList = signal<string[]>([]);

  ngOnInit(): void {
    const idTesis = this.tesisId();
    const exp = this.expediente();
    if (idTesis && exp) {
      this.cargarComision(idTesis, exp.etapaCodigo);
    }
  }

  cargarComision(tesisId: string, stage: string): void {
    this.loadingOperation.set(true);
    this.connectionErrorOperation.set(false);

    this.comisionService.obtenerPorTesisYEtapa(tesisId, stage).subscribe({
      next: (res) => {
        this.comision.set(res.data);
        this.miembros.set(res.data.miembros || []);
        if (this.erroresList().length > 0) {
          this.erroresList.set(this.validarComision(this.miembros()).errores);
        }
        this.loadingOperation.set(false);
      },
      error: (err) => {
        this.loadingOperation.set(false);
        if (err.status === 404) {
          this.notificationService.showInfo('No se encontró comisión. Registre una nueva…');
          this.crearComision();
        } else if (err.status === 0) {
          this.connectionErrorOperation.set(true);
        } else {
          this.notificationService.showError('No se pudo cargar la comisión.');
        }
      },
    });
  }

  crearComision(): void {
    if (!this.tesisId() || !this.expediente()) {
      return;
    }

    this.loadingOperation.set(true);

    const request: ComisionRequest = {
      tesisId: this.tesisId()!,
      etapaCodigo: this.expediente()?.etapaCodigo!,
    };

    this.comisionService.registrar(request).subscribe({
      next: (res) => {
        this.comision.set(res.data);
        this.miembros.set(res.data.miembros || []);
        this.loadingOperation.set(false);
        this.notificationService.showInfo('Comisión creada. Agrega los miembros del comité.');
      },
      error: (err) => {
        console.error('Error al crear comisión:', err);
        this.loadingOperation.set(false);
        this.notificationService.showError('No se pudo crear la comisión.');
      },
    });
  }

  // ============ MODALES ============
  abrirAgregarMiembro(): void {
    const id = this.comision()?.id;
    if (!id) {
      this.notificationService.showWarn('Espera a que la comisión esté creada.');
      return;
    }
    this.modalAgregarMiembro()?.abrir(id);
  }

  abrirCambiarRol(miembro: ComisionMiembro): void {
    if (miembro == null || miembro == undefined) {
      this.notificationService.showWarn('Seleccione un miembro de la comision');
      return;
    }
    this.modalAgregarMiembro()?.abrirEdicion(miembro);
  }

  eliminarMiembro(miembro: ComisionMiembro): void {
    this.confirmAction.selectedItem.set(miembro);
    this.confirmAction.selectedAction.set('delete');
    const mensaje = `al miembro ${miembro.docenteNombre} de esta comision`;
    this.confirmModal()?.abrir('delete', mensaje);
  }

  ejecutarAccionConfirmada(_motivo?: string | void): void {
    const miembro = this.confirmAction.selectedItem();
    const action = this.confirmAction.selectedAction();

    if (!miembro) return;

    // Activamos el spinner en el botón de confirmación
    this.confirmModal()?.loading.set(true);

    let request$;
    switch (action) {
      case 'delete':
        request$ = this.comisionService.eliminarMiembro(miembro.id);
        break;
      default:
        request$ = this.comisionService.eliminarMiembro(miembro.id);
        break;
    }

    request$.subscribe({
      next: (res) => {
        this.notificationService.showSuccess(res.message || 'Miembro eliminado del comité.');
        this.confirmModal()?.cerrar();
        this.onGuardadoExitoso();
      },
      error: () => this.confirmModal()?.loading.set(false)
    });
  }

  // ============ EVENTOS DE HIJOS ============
  onGuardadoExitoso(): void {
    const tesisId = this.tesis()?.id;
    const stage = this.expediente()?.etapaCodigo;

    if (tesisId && stage) {
      this.cargarComision(tesisId, stage);
    }

    this.actualizarPasoYEstado();
  }

  actualizarPasoYEstado() {
    const id = this.expedienteId();
    const estado = TablaMaestraService.stateFileInRegister;

    if (id) {
      this.expedienteService.actualizarPasoYEstado(id, 2, estado).subscribe({
        next: () => {
          console.log('paso actualizado');
          this.actualizarExpediente(2, estado);
        }
      })
    }
  }

  actualizarExpediente(paso: number, estado: string): void {
    const actual = this.expediente();
    if (!actual) return;

    this.store.actualizarExpediente({
      ...actual,
      ultimoPaso: paso,
      estadoCodigo: estado
    });
  }

  validarComision(miembros: ComisionMiembro[]): { esValida: boolean; errores: string[] } {
    const errores: string[] = [];

    const tienePresidente = miembros.some(m => m.rolCodigo === TablaMaestraService.rolesCommissionPresident);
    if (!tienePresidente) {
      errores.push('La comisión debe incluir un Presidente.');
    }

    const tieneJurado = miembros.some(m => m.rolCodigo === TablaMaestraService.rolesCommissionJury);
    if (!tieneJurado) {
      errores.push('La comisión debe tener al menos un Jurado.');
    }

    const tieneAsesor = miembros.some(m => m.rolCodigo === TablaMaestraService.rolesCommissionAdvisor);
    if (!tieneAsesor) {
      errores.push('La comisión debe tener al menos un Asesor.');
    }

    return {
      esValida: errores.length === 0,
      errores
    };
  }

  volverAtras(): void {
    const expedienteId = this.expedienteId();

    if (expedienteId) {
      this.router.navigate([
        '/tesis',
        'detalle',
        this.tesisId(),
        'expediente',
        expedienteId,
      ]);
    }
  }

  continuarSiguientePaso(): void {
    const validar: { esValida: boolean; errores: string[] } = this.validarComision(this.miembros());
    if (validar.esValida) {
      this.router.navigate([
        '/tesis',
        'detalle',
        this.tesisId(),
        'expediente',
        this.expedienteId(),
        'memorando'
      ]);
    } else {
      this.erroresList.set(validar.errores);
    }

  }

  // ============ HELPERS VISUALES ============
  getRolBadgeClass(rol: string): string {
    const r = (rol ?? '').toUpperCase();
    if (r.includes('PRESIDENTE')) return 'bg-slate-50 text-slate-700 border-slate-200';
    if (r.includes('SECRETARIO')) return 'bg-red-50 text-red-700 border-red-200';
    if (r.includes('MIEMBRO')) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (r.includes('ASESOR')) return 'bg-purple-50 text-purple-700 border-purple-200';
    return 'bg-amber-50 text-amber-700 border-amber-200';
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

}
