import { Component, computed, inject, input, OnInit, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DialogModule } from '@openng/optimus-ui/dialog';
import { InputTextModule } from '@openng/optimus-ui/inputtext';
import { SelectModule } from '@openng/optimus-ui/select';
import { IconFieldModule } from '@openng/optimus-ui/iconfield';
import { InputIconModule } from '@openng/optimus-ui/inputicon';

import { ButtonComponent } from '../../../../../shared/components/button/button.component';
import { DocenteService } from '../../../service/docente.service';
import { DepartamentoService } from '../../../service/departamento.service';
import { EscuelaService } from '../../../service/escuela.service';
import { NotificacionService } from '../../../../../shared/services/notificacion.service';

import { Docente, DocenteRequest } from '../../../../../shared/models/personas/docente.model';
import { DepartamentoAcademico } from '../../../../../shared/models/master/departamento_academico.model';
import { EscuelaProfesional } from '../../../../../shared/models/master/escuela_profesional.model';
import { TablaMaestraService } from '../../../../configuracion/services/tabla-maestra.service';
import { MasterTable } from '../../../../../shared/models/master/tabla_maestra.model';
import { finalize, forkJoin } from 'rxjs';

@Component({
  selector: 'app-docente-add-edit',
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
  templateUrl: './docente-add-edit.component.html',
  styleUrl: './docente-add-edit.component.css',
})
export class DocenteAddEditComponent implements OnInit {
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
  isEdit = signal<boolean>(false);
  consultandoDni = signal<boolean>(false);
  docenteValidoDni = signal<boolean>(false);
  docenteEsElimiado = signal<boolean>(false);
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
    id: [null],
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

    return forkJoin({
      departamentos: this.departamentoService.getActivesByFacultad(this.facultadId()),
      escuelas: this.escuelaService.getActivesByFacultad(this.facultadId()),
      tiposDocumento: this.tablaMaestraService.getItemsActives(TablaMaestraService.documentTypeTableCode)
    }).pipe(
      finalize(() => this.loadingCatalogos.set(false)) // Se ejecuta siempre (éxito o error)
    );
  }

  abrirNuevo(): void {
    this.isEdit.set(false);
    this.currentId = null;
    this.docenteValidoDni.set(false);
    this.photoPreviewUrl.set(null);
    this.habilitarFormulario();

    this.cargarCatalogos().subscribe({
      next: ({ departamentos, escuelas, tiposDocumento }) => {
        this.departamentos.set(departamentos.data || []);
        this.todasLasEscuelas.set(escuelas.data || []);
        this.tiposDocumento.set(tiposDocumento.data || []);
      },
      error: (err) => {
        console.error('Error al cargar los catálogos:', err);
      }
    });
    
    this.form.reset({
      tipoDocumentoCodigo: TablaMaestraService.dniCode,
      generoCodigo: this.genderMaleCode,
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

  consultarDni(): void {
    const tipoDoc = this.form.get('tipoDocumentoCodigo')?.value;
    let numDoc = this.form.get('numeroDocumento')?.value;

    if (!tipoDoc || !numDoc) {
      this.notificationService.showWarn('Por favor, ingrese el tipo y número de documento antes de consultar.', 'Datos incompletos');
      return;
    }

    if (numDoc.length < 8 || numDoc.length > 12) {
      this.notificationService.showWarn('El número de documento debe tener entre 8 y 12 caracteres.', 'Número de documento inválido');
      return;
    }

    this.consultandoDni.set(true);

    this.docenteService.getByNumDocumento(tipoDoc, numDoc).subscribe({
      next: (res) => {
        const docenteEncontrado = res.data;
        this.consultandoDni.set(false);

        if (docenteEncontrado) {
          // Si el docente ya existe en BD, cambiamos el estado del flujo a Edición automáticamente
          this.isEdit.set(true);
          this.currentId = docenteEncontrado.id;
          this.docenteValidoDni.set(true);
          this.setForm(docenteEncontrado);
          
          if (docenteEncontrado.eliminado) {
            this.docenteEsElimiado.set(true);
            this.inhabiltarFormulario();
            this.notificationService.showWarn('El docente se encuentra eliminado de la base de datos. Restáurelo para permitir ediciones.', 'Registro Eliminado');
          } else {
            this.docenteEsElimiado.set(false);
            this.habilitarFormulario();
            this.notificationService.showSuccess('El docente fue localizado y sus datos han sido cargados en el formulario.', 'Docente Encontrado');
          }
        }
      },
      error: (err) => {
        console.error('Error al consultar documento:', err);
        this.consultandoDni.set(false);
        this.docenteValidoDni.set(false);
        if (err.status === 404) {
          this.notificationService.showWarn('No se encontraron datos asociados a este número de documento.', 'Documento no registrado');
        }
      }
    });
  }

  restaurarDocente(): void {
    if (!this.currentId) return;

    // TODO: Invocar servicio de restauración del backend cuando se implemente la API
    // ej. this.docenteService.restaurar(this.currentId).subscribe(...)

    this.docenteEsElimiado.set(false);
    this.habilitarFormulario();
    this.notificationService.showSuccess('El registro del docente ha sido restaurado correctamente.', 'Restauración Exitosa');
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

  resetForm(): void {
    this.form.reset({
      tipoDocumentoCodigo: TablaMaestraService.dniCode,
      generoCodigo: this.genderMaleCode,
    });
    this.docenteValidoDni.set(false);
    this.photoPreviewUrl.set(null);
  }

  inhabiltarFormulario(): void {
    this.form.disable();
    this.form.get('tipoDocumentoCodigo')?.enable();
    this.form.get('numeroDocumento')?.enable();
  }

  habilitarFormulario(): void {
    this.form.enable();
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
    this.isEdit.set(false);
    this.docenteEsElimiado.set(false);
    this.docenteValidoDni.set(false);
    this.visible.set(false);
  }

  guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.notificationService.showWarn('Por favor, complete todos los campos requeridos correctamente.', 'Formulario inválido');
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

    const request$ = this.isEdit() && this.currentId
      ? this.docenteService.editar(this.currentId, payload)
      : this.docenteService.guardar(payload);

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