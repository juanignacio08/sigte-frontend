import { Component, inject, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DialogModule } from '@openng/optimus-ui/dialog';
import { InputTextModule } from '@openng/optimus-ui/inputtext';
import { ButtonComponent } from '../../../../../shared/components/button/button.component';
import { DepartamentoService } from '../../../service/departamento.service';
import { DepartamentoAcademico, DepartamentoAcademicoRequest } from '../../../../../shared/models/master/departamento_academico.model';
import { NotificacionService } from '../../../../../shared/services/notificacion.service';

@Component({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DialogModule,
    InputTextModule,
    ButtonComponent
  ],
  selector: 'app-departamento-add-edit',
  styleUrl: './departamento-add-edit.component.css',
  templateUrl: './departamento-add-edit.component.html',
})
export class DepartamentoAddEditComponent {
  private readonly fb = inject(FormBuilder);
  private readonly departamentoService = inject(DepartamentoService);
  private readonly notificationService = inject(NotificacionService);
  
  // Entradas y Salidas mediante Signals y Outputs de Angular 18+
  facultadId = input.required<number>();

  // Evento que notifica al padre cuando se guardó con éxito
  onSuccess = output<void>();

  // Controles de estado
  visible = signal<boolean>(false);
  loading = signal<boolean>(false);
  isEdit = signal<boolean>(false);
  private currentId: number | null = null;

  // Formulario Reactivo
  form: FormGroup = this.fb.group({
    id: [, Validators.min(1)],
    facultadId: [, [Validators.required, Validators.min(1)]],
    denominacion: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(200)]],
    abreviatura: ['', [Validators.required, Validators.maxLength(10)]]
  });

  // Abre el modal para crear un registro nuevo
  abrirNuevo(): void {
    this.isEdit.set(false);
    this.currentId = null;
    this.form.reset();
    this.form.patchValue({
      facultadId: this.facultadId()
    });
    this.visible.set(true);
  }

  // Abre el modal para editar un registro existente
  abrirEdicion(departamento: DepartamentoAcademico) {
    this.isEdit.set(true);
    this.currentId = departamento.id;
    this.form.patchValue({
      id: this.currentId,
      facultadId: this.facultadId(),
      denominacion: departamento.denominacion,
      abreviatura: departamento.abreviatura
    });
    this.visible.set(true);
  }

  cerrarModal(): void {
    this.form.reset();
    this.loading.set(false);
    this.isEdit.set(false);
    this.visible.set(false);
  }

  campoInvalido(campo: string): boolean {
    const control = this.form.get(campo);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    const payload : DepartamentoAcademicoRequest = {
      ...this.form.value
    };

    // Petición al Backend (si es edición o creación)
    const request$ = this.isEdit() && this.currentId
      ? this.departamentoService.update(payload) // Asegúrate de tener este método en tu servicio
      : this.departamentoService.create(payload);                // Método para guardar

    request$.subscribe({
      next: (res) => {
        this.loading.set(false);
        this.cerrarModal();
        
        this.notificationService.showSuccess(res.message);

        this.onSuccess.emit(); // Notifica al componente padre para refrescar la tabla
      },
      error: (err) => {
        console.error('Error al guardar el departamento:', err);
        this.loading.set(false);
      }
    });
  }
}
