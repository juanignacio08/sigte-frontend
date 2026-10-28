import { Component, inject, input, OnInit, output, signal } from '@angular/core';
import { ButtonComponent } from '../../../../../shared/components/button/button.component';
import { DatePickerModule } from '@openng/optimus-ui/datepicker';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DialogModule } from '@openng/optimus-ui/dialog';
import { InputTextModule } from '@openng/optimus-ui/inputtext';
import { SelectModule } from '@openng/optimus-ui/select';
import { TesisExpedienteService } from '../../../services/tesis-expediente.service';
import { TablaMaestraService } from '../../../../configuracion/services/tabla-maestra.service';
import { NotificacionService } from '../../../../../shared/services/notificacion.service';
import { MasterTable } from '../../../../../shared/models/master/tabla_maestra.model';
import { ActualizarExpedienteRequest, Expediente } from '../../../../../shared/models/tramites/expediente.model';

@Component({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DialogModule,
    InputTextModule,
    SelectModule,
    DatePickerModule,
    ButtonComponent
  ],
  selector: 'app-expediente-add-edit',
  styleUrl: './expediente-add-edit.component.css',
  templateUrl: './expediente-add-edit.component.html',
})
export class ExpedienteAddEditComponent implements OnInit {

  private readonly fb = inject(FormBuilder);
  private readonly expedienteService = inject(TesisExpedienteService);
  private readonly tablaMaestraService = inject(TablaMaestraService);
  private readonly notificationService = inject(NotificacionService);

  tesisId = input.required<string>();
  onSuccess = output<void>();
  onExpedienteGuardado = output<Expediente>();

  visible = signal<boolean>(false);
  loading = signal<boolean>(false);
  isEdit = signal<boolean>(false);
  readonly puedeEditarEtapa = signal(true);
  etapaActual = signal<string | null>(null);

  etapas = signal<MasterTable[]>([]);
  archivosNuevos: File[] = [];
  private currentExpedienteId: number | null = null;

  form: FormGroup = this.fb.group({
    numeroExpediente: ['', [Validators.required, Validators.maxLength(50)]],
    etapaCodigo: ['', Validators.required],
    numeroRevision: [1, [Validators.required, Validators.min(1)]],
    fechaRegistro: [null]
  });

  ngOnInit(): void {
    this.cargarCatalogos();
  }

  cargarCatalogos(): void {
    this.tablaMaestraService.getItemsActives(TablaMaestraService.stageThesisTableCode).subscribe({
      next: (res) => this.etapas.set(res.data || [])
    });
  }

  abrirNuevo(): void {
    this.isEdit.set(false);
    this.currentExpedienteId = null;
    this.archivosNuevos = [];
    this.form.reset({ numeroRevision: 1 });
    this.visible.set(true);
  }

  abrirEdicion(exp: Expediente): void {
    this.isEdit.set(true);
    this.puedeEditarEtapa.set(true);
    this.etapaActual.set(exp.etapaCodigo);
    this.currentExpedienteId = exp.id;
    this.archivosNuevos = [];

    this.form.reset({
      numeroExpediente: exp.numeroExpediente,
      etapaCodigo: exp.etapaCodigo,
      numeroRevision: exp.numRevision,
      fechaRegistro: exp.fechaAsociacion
        ? new Date(exp.fechaAsociacion)
        : null
    });

    this.form.get('etapaCodigo')?.enable();
    this.visible.set(true);
  }

  abrirEdicionDesdeDetalle(exp: Expediente): void {
    this.abrirEdicion(exp);

    this.puedeEditarEtapa.set(false);
    this.etapaActual.set(exp.etapaCodigo);
    this.form.get('etapaCodigo')?.disable();
  }

  cerrarModal(): void {
    this.form.reset();
    this.archivosNuevos = [];
    this.etapaActual.set(null);
    this.loading.set(false);
    this.visible.set(false);
  }

  onArchivosSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      const filesArray = Array.from(input.files);
      const validPdfs = filesArray.filter(f => f.type === 'application/pdf');

      if (validPdfs.length > 5) {
        this.notificationService.showWarn('Solo puede adjuntar un máximo de 5 archivos PDF.');
        return;
      }
      this.archivosNuevos = validPdfs;
    }
  }

  guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    // Validación obligatoria de archivos PDF solo para creación
    if (!this.isEdit() && (this.archivosNuevos.length === 0 || this.archivosNuevos.length > 5)) {
      this.notificationService.showWarn('Debe adjuntar entre 1 y 5 archivos PDF obligatoriamente.');
      return;
    }

    this.loading.set(true);
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
        next: (res) => {
          this.loading.set(false);
          this.cerrarModal();
          this.notificationService.showSuccess(res.message || 'Expediente registrado correctamente');
          this.onSuccess.emit();
        },
        error: () => this.loading.set(false)
      });
    } else {
      // En edición solo enviamos los campos permitidos principales, omitiendo archivos
      const request: ActualizarExpedienteRequest = {
        numeroExpediente: v.numeroExpediente,
        etapaCodigo: this.puedeEditarEtapa() ? v.etapaCodigo : this.etapaActual(),
        numeroRevision: v.numeroRevision,
        fechaIngreso: v.fechaRegistro ? new Date(v.fechaRegistro).toISOString() : undefined
      }

      if (this.currentExpedienteId) {
        this.expedienteService.editar(this.currentExpedienteId, request).subscribe({
          next: (res) => {
            this.loading.set(false);
            this.cerrarModal();
            this.notificationService.showSuccess(res.message || 'Expediente actualizado correctamente');
            this.onExpedienteGuardado.emit(res.data);
            this.onSuccess.emit();
          },
          error: () => this.loading.set(false)
        });
      }
    }
  }

}
