import { Component, computed, inject, input, OnInit, signal, viewChild } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TesisComisionService } from '../../services/tesis-comision.service';
import { NotificacionService } from '../../../../shared/services/notificacion.service';

import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { TableSkeletonComponent } from '../../../../shared/components/table-skeleton/table-skeleton.component';
import { NoConnectionComponent } from '../../../../shared/components/no-connection/no-connection.component';
import { ConfirmActionType, ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';

import { AgregarMiembroComisionComponent } from './agregar-miembro-comision/agregar-miembro-comision.component';
import { Comision, ComisionMiembro, ComisionRequest } from '../../../../shared/models/tramites/comision.model';
import { TableModule } from '@openng/optimus-ui/table';

@Component({
  imports: [
    CommonModule,
    TableModule,
    ButtonComponent,
    TableSkeletonComponent,
    NoConnectionComponent,
    ConfirmDialogComponent,
    AgregarMiembroComisionComponent,
  ],
  selector: 'app-comision-tab',
  styleUrl: './comision-tab.component.css',
  templateUrl: './comision-tab.component.html',
})
export class ComisionTabComponent implements OnInit {

  private readonly comisionService = inject(TesisComisionService);
  private readonly notificacionService = inject(NotificacionService);

  tesisId = input.required<string>();
  stage = input.required<string>();

  // Referencias a modales hijos (patrón Expediente)
  modalAgregarMiembro = viewChild<AgregarMiembroComisionComponent>('modalAgregarMiembro');
  confirmModal = viewChild<ConfirmDialogComponent>('confirmModal');

  // Estado principal
  loading = signal<boolean>(true);
  connectionError = signal<boolean>(false);
  comisionId = signal<number | null>(null);
  comision = signal<Comision | null>(null);
  miembros = signal<ComisionMiembro[]>([]);

  // Confirm Action
  confirmAction = { selectedItem: signal<ComisionMiembro | null>(null), selectedAction: signal<ConfirmActionType>('delete') }

  ngOnInit(): void {
    this.cargarComision();
  }

  // ============ CARGA ============
  cargarComision(): void {
    this.loading.set(true);
    this.connectionError.set(false);

    this.comisionService.obtenerPorTesisYEtapa(this.tesisId(), this.stage()).subscribe({
      next: (res) => {
        this.comision.set(res.data);
        this.comisionId.set(res.data.id);
        this.miembros.set(res.data.miembros || []);
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        if (err.status === 404) {
          this.notificacionService.showInfo('No se encontró comisión. Creando una nueva…');
          this.crearComision();
        } else if (err.status === 0) {
          this.connectionError.set(true);
        } else {
          this.notificacionService.showError('No se pudo cargar la comisión.');
        }
      },
    });
  }

  crearComision(): void {
    const request: ComisionRequest = {
      tesisId: this.tesisId(),
      etapaCodigo: this.stage(),
    };

    this.comisionService.registrar(request).subscribe({
      next: (res) => {
        this.comisionId.set(res.data.id);
        this.miembros.set([]);
        this.notificacionService.showInfo('Comisión creada. Agrega los miembros del comité.');
      },
      error: (err) => {
        console.error('Error al crear comisión:', err);
        this.notificacionService.showError('No se pudo crear la comisión.');
      },
    });
  }

  // ============ MODALES ============
  abrirAgregarMiembro(): void {
    const id = this.comisionId();
    if (!id) {
      this.notificacionService.showWarn('Espera a que la comisión esté creada.');
      return;
    }
    this.modalAgregarMiembro()?.abrir(id);
  }

  abrirCambiarRol(miembro: ComisionMiembro): void {
    if (miembro == null || miembro == undefined) {
      this.notificacionService.showWarn('Seleccione un miembro de la comision');
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
        this.notificacionService.showSuccess(res.message || 'Miembro eliminado del comité.');
        this.confirmModal()?.cerrar();
        this.onGuardadoExitoso();
      },
      error: () => this.confirmModal()?.loading.set(false)
    });
  }

  // ============ EVENTOS DE HIJOS ============
  onGuardadoExitoso(): void {
    this.cargarComision();
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