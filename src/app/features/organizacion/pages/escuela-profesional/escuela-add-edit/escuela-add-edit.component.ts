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

  // Nombres descriptivos de los archivos previamente guardados (para mostrar en modo edición)
  fileNameMemo = signal<string | null>(null);
  fileNameRes = signal<string | null>(null);

  // Guardan la ruta del servidor para la descarga (solo existen en modo edición)
  rutaMemo = signal<string | null>(null);
  rutaRes = signal<string | null>(null);

  private currentId: number | null = null;

  // Formulario Reactivo
  form: FormGroup = this.fb.group({
    id: [null],
    departamentoId: [null, [Validators.required, Validators.min(1)]],
    codigo: [null, [Validators.required, Validators.min(1)]],
    denominacion: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(200)]],
    abreviatura: ['', [Validators.required, Validators.maxLength(10)]],
    plantillaMemo: [null],
    plantillaRes: [null],
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

  // Captura de archivos desde el input de la vista
  onFileChange(event: Event, field: 'plantillaMemo' | 'plantillaRes'): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];

      // Validar tipo de archivo (.doc, .docx)
      const allowedExtensions = ['application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedExtensions.includes(file.type) && !file.name.match(/\.(doc|docx)$/i)) {
        this.notificationService.showWarn('Solo se permiten archivos Word (.doc, .docx)');
        input.value = '';
        return;
      }

      this.form.patchValue({ [field]: file });

      if (field === 'plantillaMemo') {
        this.fileNameMemo.set(file.name);
      } else {
        this.fileNameRes.set(file.name);
      }
    }
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

    // Rutas guardadas en backend
    this.rutaMemo.set(escuela.plantillaMemo || null);
    this.rutaRes.set(escuela.plantillaRes || null);

    // Si la entidad escuela ya trae rutas/nombres de plantilla guardados:
    this.fileNameMemo.set(escuela.plantillaMemo ? this.generarFileNamePlantilla(escuela, 'MEMO') : null);
    this.fileNameRes.set(escuela.plantillaRes ? this.generarFileNamePlantilla(escuela, 'RES') : null);

    this.form.patchValue({
      id: this.currentId,
      departamentoId: targetDeptId,
      codigo: escuela.codigo,
      denominacion: escuela.denominacion,
      abreviatura: escuela.abreviatura,
    });

    this.visible.set(true);
  }

  generarFileNamePlantilla(escuela: EscuelaProfesional, tipoDoc: 'MEMO' | 'RES'): string {
    if (tipoDoc === 'MEMO' && escuela.plantillaMemo) {
      return 'Plantilla_Memorandum_' + escuela.abreviatura + '.docx';
    }

    if (tipoDoc === 'RES' && escuela.plantillaRes) {
      return 'Plantilla_Resolucion_' + escuela.abreviatura + '.docx';
    }

    return 'Plantilla_Actual';
  }

  // Método para descargar la plantilla desde el Backend
  descargarArchivo(ruta: string | null, nombrePorDefecto: string): void {
    if (!ruta) return;

    this.escuelaService.descargarPlantilla(ruta).subscribe({
      next: (blob: Blob) => {
        // Crear un objeto URL para forzar la descarga en el navegador
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = nombrePorDefecto;
        document.body.appendChild(a);
        a.click();

        // Limpiar recurso de memoria
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      },
      error: (err) => {
        console.error('Error al descargar la plantilla:', err);
        this.notificationService.showError('No se pudo descargar el archivo.');
      }
    });
  }

  cerrarModal(): void {
    this.resetState();
    this.visible.set(false);
  }

  private resetState(): void {
    this.form.reset();
    this.loading.set(false);
    this.fileNameMemo.set(null);
    this.fileNameRes.set(null);
    this.rutaMemo.set(null);
    this.rutaRes.set(null);
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
