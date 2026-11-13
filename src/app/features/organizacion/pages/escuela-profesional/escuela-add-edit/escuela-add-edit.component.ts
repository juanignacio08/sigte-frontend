import { Component, inject, input, output, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DepartamentoService } from '../../../service/departamento.service';
import { NotificacionService } from '../../../../../shared/services/notificacion.service';
import { EscuelaService } from '../../../service/escuela.service';
import { EscuelaProfesional, EscuelaProfesionalRequest } from '../../../../../shared/models/master/escuela_profesional.model';
import { Dialog } from '@openng/optimus-ui/dialog';
import { ButtonComponent } from '../../../../../shared/components/button/button.component';
import { DepartamentoAcademico } from '../../../../../shared/models/master/departamento_academico.model';
import { Select } from '@openng/optimus-ui/select';
import { InputTextModule } from '@openng/optimus-ui/inputtext';

@Component({
  imports: [Dialog, ReactiveFormsModule, ButtonComponent, Select, InputTextModule],
  selector: 'app-escuela-add-edit',
  styleUrl: './escuela-add-edit.component.css',
  templateUrl: './escuela-add-edit.component.html',
})
export class EscuelaAddEditComponent {
  private readonly fb = inject(FormBuilder);
  private readonly departamentoService = inject(DepartamentoService);
  private readonly escuelaService = inject(EscuelaService)
  private readonly notificationService = inject(NotificacionService);

  // Entradas y Salidas mediante Signals y Outputs de Angular 18+
  facultadId = input.required<number>();
  departamentoId = input<number | null>(null);
  departamentoNombre = input<string>('');

  // Evento que notifica al padre cuando se guardó con éxito
  onSuccess = output<void>();

  // Controles de estado
  visible = signal<boolean>(false);
  loading = signal<boolean>(false);
  isEdit = signal<boolean>(false);
  departamentos = signal<DepartamentoAcademico[]>([]); // Lista de departamentos para el select
  loadingDepartamentos = signal<boolean>(false);

  private currentId: number | null = null;

  // Formulario Reactivo
  form: FormGroup = this.fb.group({
    id: [null],
    departamentoId: [null, [Validators.required, Validators.min(1)]],
    codigo: [null, [Validators.required, Validators.min(1)]],
    denominacion: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(200)]],
    abreviatura: ['', [Validators.required, Validators.maxLength(10)]],
  });

  get tieneDepartamentoFijo(): boolean {
    const depId = this.departamentoId();
    return depId !== null && depId > 0;
  }

  cargarDepartamentos(): void {
    if (this.tieneDepartamentoFijo) return;

    this.loadingDepartamentos.set(true);
    this.departamentoService.getActivesByFacultad(this.facultadId()).subscribe({
      next: (res) => {
        this.departamentos.set(res.data);
        this.loadingDepartamentos.set(false);
      },
      error: (err) => {
        console.error('Error al cargar departamentos:', err);
        this.loadingDepartamentos.set(false);
      }
    });
  }

  // Abre el modal para crear un registro nuevo
  abrirNuevo(): void {
    this.isEdit.set(false);
    this.currentId = null;
    this.resetState();;

    if (this.tieneDepartamentoFijo) {
      this.form.patchValue({
        departamentoId: this.departamentoId()
      });
    } else {
      this.cargarDepartamentos();
    }

    this.visible.set(true);
  }

  // Abre el modal para editar un registro existente
  abrirEdicion(escuela: EscuelaProfesional) {
    this.isEdit.set(true);
    this.currentId = escuela.id;
    this.resetState();

    const targetDeptId = this.tieneDepartamentoFijo ? this.departamentoId() : escuela.departamento.id;

    if (!this.tieneDepartamentoFijo) {
      this.cargarDepartamentos();
    }

    this.form.patchValue({
      id: this.currentId,
      departamentoId: targetDeptId,
      codigo: escuela.codigo,
      denominacion: escuela.denominacion,
      abreviatura: escuela.abreviatura,
    });

    this.visible.set(true);
  }

  cerrarModal(): void {
    this.resetState();
    this.visible.set(false);
  }

  private resetState(): void {
    this.form.reset();
    this.loading.set(false);
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
    const payload: EscuelaProfesionalRequest = {
      ...this.form.value
    };

    // Petición al Backend (si es edición o creación)
    const request$ = this.isEdit() && this.currentId
      ? this.escuelaService.update(payload) // Asegúrate de tener este método en tu servicio
      : this.escuelaService.create(payload);                // Método para guardar

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
