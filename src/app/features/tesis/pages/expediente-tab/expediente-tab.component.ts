import { Component, inject, input, OnInit, signal } from '@angular/core';
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
    BadgeComponent
  ],
  selector: 'app-expediente-tab',
  styleUrl: './expediente-tab.component.css',
  templateUrl: './expediente-tab.component.html',
})
export class ExpedienteTabComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly expedienteService = inject(TesisExpedienteService);
  private readonly tablaMaestraService = inject(TablaMaestraService);
  private readonly notificationService = inject(NotificacionService);

  tesisId = input.required<string>();

  expedientes = signal<Expediente[]>([]);
  loading = signal<boolean>(true);
  guardando = signal<boolean>(false);
  isEdit = signal<boolean>(false);

  modalVisible = signal<boolean>(false);
  modalDetalleVisible = signal<boolean>(false);
  expedienteSeleccionado = signal<Expediente | null>(null);

  etapas = signal<MasterTable[]>([]);
  archivosNuevos: File[] = [];
  currentExpedienteId: number | null = null;

  form: FormGroup = this.fb.group({
    numeroExpediente: ['', [Validators.required, Validators.maxLength(50)]],
    etapaCodigo: ['', Validators.required],
    numeroRevision: [1, Validators.required],
    fechaRegistro: [null]
  });

  ngOnInit(): void {
    this.cargarExpedientes();
    this.cargarCatalogos();
  }

  cargarExpedientes(): void {
    if (!this.tesisId()) return;
    this.loading.set(true);
    this.expedienteService.listarPorTesis(this.tesisId()).subscribe({
      next: (res) => {
        this.expedientes.set(res.data || []);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  cargarCatalogos(): void {
    this.tablaMaestraService.getItemsActives('005').subscribe({
      next: (res) => this.etapas.set(res.data || [])
    });
  }

  abrirNuevo(): void {
    this.isEdit.set(false);
    this.currentExpedienteId = null;
    this.archivosNuevos = [];
    this.form.reset({ numeroRevision: 1 });
    this.modalVisible.set(true);
  }

  abrirEdicion(exp: Expediente): void {
    this.isEdit.set(true);
    this.currentExpedienteId = exp.id;
    this.archivosNuevos = [];
    this.form.patchValue({
      numeroExpediente: exp.numeroExpediente,
      etapaCodigo: exp.etapaCodigo,
      numeroRevision: exp.numRevision
    });
    this.modalVisible.set(true);
  }

  verDetalle(id: number): void {
    this.expedienteService.obtenerPorId(id).subscribe({
      next: (res) => {
        this.expedienteSeleccionado.set(res.data);
        this.modalDetalleVisible.set(true);
      }
    });
  }

  onArchivosSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.archivosNuevos = Array.from(input.files);
    }
  }

  guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.guardando.set(true);
    const v = this.form.getRawValue();
    const formData = new FormData();

    if (!this.isEdit()) {
      formData.append('tesisId', this.tesisId());
      formData.append('numeroExpediente', v.numeroExpediente);
      formData.append('etapaCodigo', v.etapaCodigo);
      formData.append('numeroRevision', v.numeroRevision.toString());
      if (v.fechaRegistro) {
        formData.append('fechaRegistro', new Date(v.fechaRegistro).toISOString());
      }
      this.archivosNuevos.forEach(file => formData.append('archivos', file));

      this.expedienteService.registrar(formData).subscribe({
        next: () => {
          this.guardando.set(false);
          this.modalVisible.set(false);
          this.notificationService.showSuccess('Expediente registrado correctamente');
          this.cargarExpedientes();
        },
        error: () => this.guardando.set(false)
      });
    } else {
      formData.append('numeroExpediente', v.numeroExpediente);
      formData.append('etapaCodigo', v.etapaCodigo);
      formData.append('numeroRevision', v.numeroRevision.toString());
      this.archivosNuevos.forEach(file => formData.append('nuevosArchivos', file));

      if (this.currentExpedienteId) {
        this.expedienteService.editar(this.currentExpedienteId, formData).subscribe({
          next: () => {
            this.guardando.set(false);
            this.modalVisible.set(false);
            this.notificationService.showSuccess('Expediente actualizado correctamente');
            this.cargarExpedientes();
          },
          error: () => this.guardando.set(false)
        });
      }
    }
  }
}
