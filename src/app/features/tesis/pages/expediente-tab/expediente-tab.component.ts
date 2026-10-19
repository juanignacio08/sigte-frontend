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
    ExpedienteAddEditComponent
],
  selector: 'app-expediente-tab',
  styleUrl: './expediente-tab.component.css',
  templateUrl: './expediente-tab.component.html',
})
export class ExpedienteTabComponent implements OnInit {
  private readonly expedienteService = inject(TesisExpedienteService);

  tesisId = input.required<string>();

  // Referencias a los modales hijos
  modalAddEdit = viewChild<ExpedienteAddEditComponent>('modalAddEdit');
  modalDetail = viewChild<VerExpedienteDetalleComponent>('modalDetail');

  controls = {
    loading: signal<boolean>(false),
    connectionError: signal<boolean>(false)
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

    this.expedienteService.listarPorTesis(this.tesisId()).subscribe({
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

  verDetalle(id: number): void {
    this.modalDetail()?.abrir(id);
  }

  onGuardadoExitoso(): void {
    this.cargarExpedientes();
  }
}
