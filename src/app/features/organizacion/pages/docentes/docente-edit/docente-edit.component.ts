import { CommonModule } from '@angular/common';
import { Component, inject, input, OnInit, output, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DialogModule } from '@openng/optimus-ui/dialog';
import { InputTextModule } from '@openng/optimus-ui/inputtext';
import { SelectModule } from '@openng/optimus-ui/select';
import { ButtonComponent } from '../../../../../shared/components/button/button.component';
import { IconFieldModule } from '@openng/optimus-ui/iconfield';
import { InputIconModule } from '@openng/optimus-ui/inputicon';
import { DocenteService } from '../../../service/docente.service';
import { DepartamentoService } from '../../../service/departamento.service';
import { EscuelaService } from '../../../service/escuela.service';
import { NotificacionService } from '../../../../../shared/services/notificacion.service';
import { TablaMaestraService } from '../../../../configuracion/services/tabla-maestra.service';
import { DepartamentoAcademico } from '../../../../../shared/models/master/departamento_academico.model';
import { EscuelaProfesional } from '../../../../../shared/models/master/escuela_profesional.model';
import { MasterTable } from '../../../../../shared/models/master/tabla_maestra.model';
import { finalize, forkJoin } from 'rxjs';
import { Docente, DocenteRequest } from '../../../../../shared/models/personas/docente.model';

@Component({
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
  selector: 'app-docente-edit',
  styleUrl: './docente-edit.component.css',
  templateUrl: './docente-edit.component.html',
})
export class DocenteEditComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly docenteService = inject(DocenteService);
  private readonly departamentoService = inject(DepartamentoService);
  private readonly escuelaService = inject(EscuelaService);
  private readonly notificationService = inject(NotificacionService);
  private readonly tablaMaestraService = inject(TablaMaestraService);

  // Inputs/Outputs
  facultadId = input.required<number>();
  onSuccess = output<void>();

  // Estados
  visible = signal<boolean>(false);
  loading = signal<boolean>(false);
  loadingCatalogos = signal<boolean>(false);
  photoPreviewUrl = signal<string | null>(null);

  private currentId: number | null = null;

  // Catálogos
  departamentos = signal<DepartamentoAcademico[]>([]);
  todasLasEscuelas = signal<EscuelaProfesional[]>([]);
  tiposDocumento = signal<MasterTable[]>([]);
  generos = signal<MasterTable[]>([]);
  genderMaleCode = TablaMaestraService.genderMaleCode;
  genderFemaleCode = TablaMaestraService.genderFemaleCode;

  // Escuelas filtradas según el D.A. seleccionado en el formulario
  escuelasFiltradas = signal<EscuelaProfesional[]>([]);

  // Formulario Reactivo
  form: FormGroup = this.fb.group({
    id: [null, Validators.required],
    codigo: [''],
    tipoDocumentoCodigo: [null],
    numeroDocumento: ['', [Validators.minLength(8), Validators.maxLength(12)]],
    nombres: ['', [Validators.required, Validators.minLength(2)]],
    primerApellido: ['', [Validators.required, Validators.minLength(2)]],
    segundoApellido: ['', [Validators.required, Validators.minLength(2)]],
    generoCodigo: [this.genderMaleCode, Validators.required],
    telefono: [''],
    correoInstitucional: ['', [Validators.required, Validators.email]],
    departamentoAcademicoId: [null, Validators.required],
    escuelaId: [null, Validators.required]
  });

  ngOnInit(): void {
    this.form.get('nombres')?.valueChanges.subscribe(() => this.generarCorreoAutomatico());
    this.form.get('primerApellido')?.valueChanges.subscribe(() => this.generarCorreoAutomatico());
  }

  private generarCorreoAutomatico(): void {
    const nombres: string = this.form.get('nombres')?.value || '';
    const primerApellido: string = this.form.get('primerApellido')?.value || '';

    if (!nombres.trim() || !primerApellido.trim()) {
      return;
    }

    // Tomar solo el primer nombre
    const primerNombre = nombres.trim().split(/\s+/)[0];

    // Sanitización
    const nombreSanitizado = this.sanitizarTexto(primerNombre);
    const apellidoSanitizado = this.sanitizarTexto(primerApellido.replace(/\s+/g, '')); // elimina espacios internos

    if (nombreSanitizado && apellidoSanitizado) {
      const correoSugerido = `${nombreSanitizado}.${apellidoSanitizado}@unsch.edu.pe`;
      this.form.get('correoInstitucional')?.setValue(correoSugerido, { emitEvent: false });
    }
  }

  private sanitizarTexto(str: string): string {
    return str
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Quita tildes y diacríticos
      .replace(/ñ/g, 'n')               // Reemplaza 'ñ' por 'n'
      .replace(/[^a-z0-0]/g, '');       // Remueve caracteres no alfanuméricos
  }

  cargarCatalogos() {
    this.loadingCatalogos.set(true);
    this.form.get('tipoDocumentoCodigo')?.disable({ emitEvent: false });
    this.form.get('departamentoAcademicoId')?.disable({ emitEvent: false });
    this.form.get('escuelaId')?.disable({ emitEvent: false });

    return forkJoin({
      departamentos: this.departamentoService.getActivesByFacultad(this.facultadId()),
      escuelas: this.escuelaService.getActivesByFacultad(this.facultadId()),
      tiposDocumento: this.tablaMaestraService.getItemsActives(TablaMaestraService.documentTypeTableCode)
    }).pipe(
      finalize(() => {
        this.loadingCatalogos.set(false);
        this.form.get('tipoDocumentoCodigo')?.enable({ emitEvent: false });
        this.form.get('departamentoAcademicoId')?.enable({ emitEvent: false });
        this.form.get('escuelaId')?.enable({ emitEvent: false });
      })
    );
  }

  abrirEdicion(docente: Docente): void {
    this.currentId = docente.id;

    this.cargarCatalogos().subscribe({
      next: ({ departamentos, escuelas, tiposDocumento }) => {
        this.departamentos.set(departamentos.data || []);
        this.todasLasEscuelas.set(escuelas.data || []);
        this.tiposDocumento.set(tiposDocumento.data || []);

        this.setForm(docente);
      },
      error: (err) => {
        console.error('Error al cargar los catálogos:', err);
      }
    });

    this.visible.set(true);
  }

  onDepartamentoChange(deptId: number): void {
    if (!deptId) {
      this.escuelasFiltradas.set(this.todasLasEscuelas());
      return;
    }
    const filtradas = this.todasLasEscuelas().filter(e => e.departamento.id === deptId);
    this.escuelasFiltradas.set(filtradas);
  }

  setForm(docente: Docente): void {
    this.form.patchValue({
      id: docente.id,
      codigo: docente.codigo,
      tipoDocumentoCodigo: docente.tipoDocumentoCodigo,
      numeroDocumento: docente.numeroDocumento,
      nombres: docente.nombres,
      primerApellido: docente.primerApellido,
      segundoApellido: docente.segundoApellido,
      generoCodigo: docente.generoCodigo,
      telefono: docente.telefono,
      correoInstitucional: docente.correoInstitucional,
      departamentoAcademicoId: docente.departamento?.id,
      escuelaId: docente.escuela?.id
    }, { emitEvent: false }); // Evita re-disparar generación automática al cargar datos

    if (docente.departamento?.id) {
      this.onDepartamentoChange(docente.departamento.id);
    }
  }

  onPhotoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = (e) => this.photoPreviewUrl.set(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  }

  removePhoto(): void {
    this.photoPreviewUrl.set(null);
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
      this.notificationService.showWarn('Por favor, complete todos los campos requeridos correctamente.', 'Formulario inválido');
      return;
    }

    if (this.currentId === null) {
      this.notificationService.showError('No se puede guardar el docente. ID no establecido.', 'Error');
      return;
    }

    this.loading.set(true);
    const formVal = this.form.getRawValue();

    const payload: DocenteRequest = {
      codigo: formVal.codigo,
      escuelaId: formVal.escuelaId,
      departamentoAcademicoId: formVal.departamentoAcademicoId,
      tipoDocumentoCodigo: formVal.tipoDocumentoCodigo,
      numeroDocumento: formVal.numeroDocumento,
      nombres: formVal.nombres,
      primerApellido: formVal.primerApellido,
      segundoApellido: formVal.segundoApellido,
      correoInstitucional: formVal.correoInstitucional,
      generoCodigo: formVal.generoCodigo,
      telefono: formVal.telefono
    };

    const request$ = this.docenteService.editar(this.currentId, payload);

    request$.subscribe({
      next: (res) => {
        this.loading.set(false);
        this.cerrarModal();
        this.notificationService.showSuccess(res.message || 'Operación completada con éxito');
        this.onSuccess.emit();
      },
      error: (err) => {
        console.error('Error al guardar el docente:', err);
        this.loading.set(false);
      }
    });
  }
}
