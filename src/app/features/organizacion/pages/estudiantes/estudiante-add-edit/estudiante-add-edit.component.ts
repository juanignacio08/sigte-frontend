import { Component, DestroyRef, inject, input, OnInit, output, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DialogModule } from '@openng/optimus-ui/dialog';
import { InputTextModule } from '@openng/optimus-ui/inputtext';
import { SelectModule } from '@openng/optimus-ui/select';
import { IconFieldModule } from '@openng/optimus-ui/iconfield';
import { InputIconModule } from '@openng/optimus-ui/inputicon';
import { finalize, forkJoin } from 'rxjs';
import { ButtonComponent } from '../../../../../shared/components/button/button.component';
import { EstudianteService } from '../../../service/estudiante.service';
import { EscuelaService } from '../../../service/escuela.service';
import { NotificacionService } from '../../../../../shared/services/notificacion.service';
import { TablaMaestraService } from '../../../../configuracion/services/tabla-maestra.service';
import { EscuelaProfesional } from '../../../../../shared/models/master/escuela_profesional.model';
import { Estudiante, EstudianteRequest } from '../../../../../shared/models/personas/estudiante.model';


@Component({
  selector: 'app-estudiante-add-edit',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DialogModule,
    InputTextModule,
    SelectModule,
    ButtonComponent,
    IconFieldModule,
    InputIconModule
  ],
  templateUrl: './estudiante-add-edit.component.html',
  styleUrl: './estudiante-add-edit.component.css'
})
export class EstudianteAddEditComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly estudianteService = inject(EstudianteService);
  private readonly escuelaService = inject(EscuelaService);
  private readonly notificationService = inject(NotificacionService);

  private readonly destroyRef = inject(DestroyRef);

  // Inputs & Outputs
  facultadId = input.required<number>();
  onSuccess = output<void>();

  // Estados
  visible = signal<boolean>(false);
  loading = signal<boolean>(false);
  loadingCatalogos = signal<boolean>(false);
  isEdit = signal<boolean>(false);

  private currentId: number | null = null;

  // Catálogos
  escuelas = signal<EscuelaProfesional[]>([]);
  genderMaleCode = TablaMaestraService.genderMaleCode;
  genderFemaleCode = TablaMaestraService.genderFemaleCode;

  // Formulario Reactivo con validaciones backend/request
  form: FormGroup = this.fb.group({
    id: [null],
    escuelaId: [null, [Validators.required]],
    codigo: ['', [Validators.maxLength(10)]],
    numeroDocumento: ['', [Validators.maxLength(15)]],
    nombres: ['', [Validators.required, Validators.maxLength(100)]],
    primerApellido: ['', [Validators.required, Validators.maxLength(100)]],
    segundoApellido: ['', [Validators.required, Validators.maxLength(100)]],
    correoInstitucional: ['', [Validators.required, Validators.email, Validators.maxLength(100)]],
    generoCodigo: [this.genderMaleCode, [Validators.required]],
    telefono: ['', [Validators.maxLength(15)]]
  });

  ngOnInit(): void {
    this.form.get('nombres')?.valueChanges
    .pipe(takeUntilDestroyed(this.destroyRef))
    .subscribe(() => this.generarCorreoAutomatico());

    this.form.get('primerApellido')?.valueChanges
    .pipe(takeUntilDestroyed(this.destroyRef))
    .subscribe(() => this.generarCorreoAutomatico());

    this.form.get('escuelaId')?.valueChanges
    .pipe(takeUntilDestroyed(this.destroyRef))
    .subscribe(() => this.generarCorreoAutomatico());
  }

  private generarCorreoAutomatico(): void {
    const nombres: string = this.form.get('nombres')?.value || '';
    const primerApellido: string = this.form.get('primerApellido')?.value || '';
    const escuelaId = this.form.get('escuelaId')?.value;

    if (!nombres.trim() || !primerApellido.trim() || !escuelaId || this.isEdit()) return;

    // Obtener el código de la escuela seleccionada
    const escuelaSeleccionada = this.escuelas()?.find(e => e.id === escuelaId);
    const codigoEscuela = escuelaSeleccionada?.codigo;

    if (!codigoEscuela) return;

    const primerNombre = nombres.trim().split(/\s+/)[0];
    const nombreSanitizado = this.sanitizarTexto(primerNombre);
    const apellidoSanitizado = this.sanitizarTexto(primerApellido.replace(/\s+/g, ''));
    
    if (nombreSanitizado && apellidoSanitizado && codigoEscuela) {
      const correoSugerido = `${nombreSanitizado}.${apellidoSanitizado}.${codigoEscuela}@unsch.edu.pe`;
      this.form.get('correoInstitucional')?.setValue(correoSugerido, { emitEvent: false });
    }
  }

  private sanitizarTexto(str: string): string {
    return str
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/ñ/g, 'n')
      .replace(/[^a-z0-9]/g, '');
  }

  cargarCatalogos() {
    this.loadingCatalogos.set(true);
    this.form.get('escuelaId')?.disable({ emitEvent: false });

    return forkJoin({
      escuelas: this.escuelaService.getActivesByFacultad(this.facultadId())
    }).pipe(
      finalize(() => {
        this.loadingCatalogos.set(false);
        this.form.get('escuelaId')?.enable({ emitEvent: false });
      })
    );
  }

  abrirNuevo(): void {
    this.isEdit.set(false);
    this.currentId = null;
    this.form.reset({
      generoCodigo: this.genderMaleCode
    });

    this.cargarCatalogos().subscribe({
      next: ({ escuelas }) => {
        this.escuelas.set(escuelas.data || []);
      }
    });

    this.visible.set(true);
  }

  abrirEdicion(estudiante: Estudiante): void {
    this.isEdit.set(true);
    this.currentId = estudiante.id;

    this.cargarCatalogos().subscribe({
      next: ({ escuelas }) => {
        this.escuelas.set(escuelas.data || []);

        this.form.patchValue({
          id: estudiante.id,
          escuelaId: estudiante.escuela?.id,
          codigo: estudiante.codigo,
          numeroDocumento: estudiante.numeroDocumento,
          nombres: estudiante.nombres,
          primerApellido: estudiante.primerApellido,
          segundoApellido: estudiante.segundoApellido,
          correoInstitucional: estudiante.correoInstitucional,
          generoCodigo: estudiante.generoCodigo,
          telefono: estudiante.telefono
        });
      }
    });

    this.visible.set(true);
  }

  campoInvalido(campo: string): boolean {
    const control = this.form.get(campo);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  cerrarModal(): void {
    this.form.reset();
    this.loading.set(false);
    this.visible.set(false);
  }

  guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.notificationService.showWarn('Por favor, complete todos los campos obligatorios.', 'Formulario incompleto');
      return;
    }

    this.loading.set(true);
    const v = this.form.getRawValue();

    const payload: EstudianteRequest = {
      escuelaId: v.escuelaId,
      codigo: v.codigo,
      numeroDocumento: v.numeroDocumento,
      nombres: v.nombres,
      primerApellido: v.primerApellido,
      segundoApellido: v.segundoApellido,
      correoInstitucional: v.correoInstitucional,
      generoCodigo: v.generoCodigo,
      telefono: v.telefono
    };

    const request$ = this.isEdit() && this.currentId
      ? this.estudianteService.editar(this.currentId, payload)
      : this.estudianteService.guardar(payload);

    request$.subscribe({
      next: (res) => {
        this.loading.set(false);
        this.cerrarModal();
        this.notificationService.showSuccess(res.message || 'Estudiante guardado correctamente');
        this.onSuccess.emit();
      },
      error: (err) => {
        console.error('Error al guardar estudiante:', err);
        this.loading.set(false);
      }
    });
  }
}