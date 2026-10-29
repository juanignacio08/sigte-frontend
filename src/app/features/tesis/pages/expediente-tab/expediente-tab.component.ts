import { Component, inject, input, OnInit, signal, viewChild } from '@angular/core';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TesisExpedienteService } from '../../services/tesis-expediente.service';
import { TablaMaestraService } from '../../../configuracion/services/tabla-maestra.service';
import { NotificacionService } from '../../../../shared/services/notificacion.service';
import { Expediente } from '../../../../shared/models/tramites/expediente.model';
import { MasterTable } from '../../../../shared/models/master/tabla_maestra.model';
import { TableModule } from '@openng/optimus-ui/table';
import { BadgeComponent } from '../../../../shared/components/badge/badge.component';
import { Dialog, DialogModule } from '@openng/optimus-ui/dialog';
import { CommonModule } from '@angular/common';
import { SelectModule } from '@openng/optimus-ui/select';
import { InputTextModule } from '@openng/optimus-ui/inputtext';
import { DatePickerModule } from '@openng/optimus-ui/datepicker';
import { TableSkeletonComponent } from '../../../../shared/components/table-skeleton/table-skeleton.component';
import { NoConnectionComponent } from '../../../../shared/components/no-connection/no-connection.component';
import { VerExpedienteDetalleComponent } from './ver-expediente-detalle/ver-expediente-detalle.component';
import { ExpedienteAddEditComponent } from './expediente-add-edit/expediente-add-edit.component';
import { ConfirmActionType, ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { Router } from '@angular/router';
import { FileService } from '../../../../shared/services/file.service';

@Component({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TableModule,
    DialogModule,
    SelectModule,
    InputTextModule,
    DatePickerModule,
    ButtonComponent,
    BadgeComponent,
    TableSkeletonComponent,
    NoConnectionComponent,
    VerExpedienteDetalleComponent,
    ExpedienteAddEditComponent,
    ConfirmDialogComponent
  ],
  selector: 'app-expediente-tab',
  styleUrl: './expediente-tab.component.css',
  templateUrl: './expediente-tab.component.html',
})
export class ExpedienteTabComponent implements OnInit {
  private readonly expedienteService = inject(TesisExpedienteService);
  private readonly notificationService = inject(NotificacionService);

  private readonly router = inject(Router);

  tesisId = input.required<string>();
  stage = input.required<string>();

  // Referencias a los modales hijos
  modalAddEdit = viewChild<ExpedienteAddEditComponent>('modalAddEdit');
  modalDetail = viewChild<VerExpedienteDetalleComponent>('modalDetail');
  confirmModal = viewChild<ConfirmDialogComponent>('confirmModal');

  controls = {
    loading: signal<boolean>(false),
    connectionError: signal<boolean>(false),
    confirmAction: { selectedItem: signal<Expediente | null>(null), selectedAction: signal<ConfirmActionType>('delete') }
  };

  expedientes = signal<Expediente[]>([]);
  selectedExpedienteId = signal<number | null>(null);

  ngOnInit(): void {
    this.cargarExpedientes();
  }

  cargarExpedientes(): void {
    if (!this.tesisId()) return;
    this.controls.loading.set(true);
    this.controls.connectionError.set(false);

    this.expedienteService.listarPorTesisYEtapa(this.tesisId(), this.stage()).subscribe({
      next: (res) => {
        this.expedientes.set(res.data || []);
        this.controls.loading.set(false);
      },
      error: (err) => {
        console.error('Error al cargar los expedientes:', err);
        this.controls.loading.set(false);
        if (err.status === 0) {
          this.controls.connectionError.set(true);
        }
      }
    });
  }

  abrirNuevo(): void {
    this.modalAddEdit()?.abrirNuevo();
  }

  abrirEdicion(exp: Expediente): void {
    this.modalAddEdit()?.abrirEdicion(exp);
  }

  desactivar(expediente: Expediente) {
    this.controls.confirmAction.selectedItem.set(expediente);
    this.controls.confirmAction.selectedAction.set('deactive');
    const mensaje = 'El expediente número ' + expediente.numeroExpediente;
    this.confirmModal()?.abrir('deactive', mensaje, true);
  }

  activar(expediente: Expediente) {
    this.controls.confirmAction.selectedItem.set(expediente);
    this.controls.confirmAction.selectedAction.set('active');
    const mensaje = 'El expediente número ' + expediente.numeroExpediente;
    this.confirmModal()?.abrir('active', mensaje);
  }

  eliminar(expediente: Expediente) {
    this.controls.confirmAction.selectedItem.set(expediente);
    this.controls.confirmAction.selectedAction.set('delete');
    const mensaje = 'El expediente número ' + expediente.numeroExpediente;
    this.confirmModal()?.abrir('delete', mensaje);
  }

  verDetalle(expediente: Expediente): void {
    const tesisId = this.tesisId();
    const paso = expediente.ultimoPaso ?? 1;

    const segmentosPorPaso: Record<number, string[]> = {
      1: [],
      2: ['comision'],
      3: ['memorando'],
      4: ['envio'],
      5: ['dictamen'],
      6: ['resolucion'],
    };

    this.router.navigate([
      '/tesis', 'detalle', tesisId,
      'expediente', expediente.id,
      ...(segmentosPorPaso[paso] ?? []),
    ]);
  }

  ejecutarAccionConfirmada(motivo?: string | void): void {
    const expediente = this.controls.confirmAction.selectedItem();
    const action = this.controls.confirmAction.selectedAction();

    if (!expediente) return;

    // Activamos el spinner en el botón de confirmación
    this.confirmModal()?.loading.set(true);

    let request$;
    switch (action) {
      case 'active':
        request$ = this.expedienteService.activar(expediente.id);
        break;
      case 'deactive':
        request$ = this.expedienteService.desactivar(expediente.id, motivo?.toString() || '');
        break;
      case 'delete':
        request$ = this.expedienteService.eliminar(expediente.id);
        break;
    }

    request$.subscribe({
      next: (res) => {
        this.notificationService.showSuccess(res.message);
        this.confirmModal()?.cerrar();
        this.onGuardadoExitoso();
      },
      error: () => this.confirmModal()?.loading.set(false)
    });

  }

  onGuardadoExitoso(): void {
    this.cargarExpedientes();
  }
}
