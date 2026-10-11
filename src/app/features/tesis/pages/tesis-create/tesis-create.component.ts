import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TesisService } from '../../services/tesis.service';
import { EscuelaService } from '../../../organizacion/service/escuela.service';
import { EstudianteService } from '../../../organizacion/service/estudiante.service';
import { TablaMaestraService } from '../../../configuracion/services/tabla-maestra.service';
import { NotificacionService } from '../../../../shared/services/notificacion.service';
import { Facultad, FACULTY_MOCK } from '../../../../shared/models/master/facultad.model';
import { EscuelaProfesional } from '../../../../shared/models/master/escuela_profesional.model';
import { MasterTable } from '../../../../shared/models/master/tabla_maestra.model';
import { Estudiante, EstudianteRequest } from '../../../../shared/models/personas/estudiante.model';
import { forkJoin } from 'rxjs';
import { RegistrarTesisRequest } from '../../../../shared/models/tramites/tesis.model';
import { TitleSubtitleComponent } from '../../../../shared/components/title-subtitle/title-subtitle.component';
import { AutoCompleteModule, AutoCompleteSelectEvent } from '@openng/optimus-ui/autocomplete';
import { CommonModule } from '@angular/common';
import { DialogModule } from '@openng/optimus-ui/dialog';
import { SelectModule } from '@openng/optimus-ui/select';
import { InputTextModule } from '@openng/optimus-ui/inputtext';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { KeyFilterModule } from '@openng/optimus-ui/keyfilter';

@Component({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    DialogModule,
    SelectModule,
    InputTextModule,
    TitleSubtitleComponent,
    ButtonComponent,
    AutoCompleteModule,
    KeyFilterModule
  ],
  selector: 'app-tesis-create',
  styleUrl: './tesis-create.component.css',
  templateUrl: './tesis-create.component.html',
})
export class TesisCreateComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly tesisService = inject(TesisService);
  private readonly escuelaService = inject(EscuelaService);
  private readonly estudianteService = inject(EstudianteService);
  private readonly tablaMaestraService = inject(TablaMaestraService);
  private readonly notificationService = inject(NotificacionService);

  facultad: Facultad = FACULTY_MOCK;

  controls = {
    loading: signal<boolean>(false),
    loadingCatalogos: signal<boolean>(false),
    connectionError: signal<boolean>(false),
    loadingEstudianteRegistro: signal<boolean>(false)
  };

  // Catálogos
  escuelas = signal<EscuelaProfesional[]>([]);
  etapasTesis = signal<MasterTable[]>([]);
  genderMaleCode = TablaMaestraService.genderMaleCode;
  genderFemaleCode = TablaMaestraService.genderFemaleCode;

  sugerenciasEstudiante = signal<Estudiante[]>([]);

  // Autores seleccionados (Max 2)
  autoresSeleccionados = signal<Estudiante[]>([]);
  busquedaEstudiante = signal<string>('');
  buscandoEstudiante = signal<boolean>(false);

  // Archivos PDFs Subidos (Max 5)
  archivosPDF = signal<File[]>([]);

  // Modal para agregar estudiante rápido
  modalEstudianteVisible = signal<boolean>(false);
  modalEstudianteForm: FormGroup = this.fb.group({
    escuelaId: [null, Validators.required],
    nombres: ['', [Validators.required, Validators.maxLength(100)]],
    primerApellido: ['', [Validators.required, Validators.maxLength(100)]],
    segundoApellido: ['', [Validators.required, Validators.maxLength(100)]],
    correoInstitucional: ['', [Validators.required, Validators.email, Validators.maxLength(100)]],
    generoCodigo: [this.genderMaleCode, [Validators.required]],
  });

  // Formulario Principal Tesis
  form: FormGroup = this.fb.group({
    escuelaId: [null, Validators.required],
    titulo: ['', [Validators.required, Validators.maxLength(350)]],
    numeroExpediente: ['', [Validators.required, Validators.maxLength(50)]],
    etapaTesisCodigo: ['', Validators.required],
    numeroRevision: [1, [Validators.min(1)]]
  });

  ngOnInit(): void {
    this.cargarCatalogos();
  }

  cargarCatalogos(): void {
    this.controls.loadingCatalogos.set(true);
    forkJoin({
      escuelas: this.escuelaService.getActivesByFacultad(this.facultad.id),
      etapas: this.tablaMaestraService.getItemsActives(TablaMaestraService.stageThesisTableCode) // Código tabla etapas tesis
    }).subscribe({
      next: ({ escuelas, etapas }) => {
        this.escuelas.set(escuelas.data || []);
        this.etapasTesis.set(etapas.data || []);
        this.controls.loadingCatalogos.set(false);
      },
      error: () => this.controls.loadingCatalogos.set(false)
    });
  }

  // --- BÚSQUEDA Y ASIGNACIÓN DE AUTORES ---
  buscarEstudiante(event: { query: string }): void {
    const query = event.query.trim();

    // Si la búsqueda está vacía, limpiamos las sugerencias y salimos
    if (!query) {
      this.sugerenciasEstudiante.set([]);
      return;
    }

    this.buscandoEstudiante.set(true);

    // Obtenemos el escuelaId del formulario (si existe)
    const escuelaId = this.form.get('escuelaId')?.value;

    this.estudianteService.getByFilters({
      facultadId: this.facultad.id,
      escuelaId: escuelaId, // <-- Filtro por escuela seleccionada
      nombre: query
    }, 0, 5).subscribe({
      next: (res) => {
        this.buscandoEstudiante.set(false);
        if (res.data && res.data.length > 0) {
          // Mostramos los resultados en el desplegable
          this.sugerenciasEstudiante.set(res.data);
        } else {
          // Si no hay resultados, la plantilla "empty" se encargará de mostrar el botón
          this.sugerenciasEstudiante.set([]);
        }
      },
      error: () => {
        this.buscandoEstudiante.set(false);
        this.sugerenciasEstudiante.set([]);
      }
    });
  }

  onEstudianteSeleccionado(event: AutoCompleteSelectEvent<Estudiante>): void {
    const estudiante = event.value;
    if (!estudiante) return;

    this.agregarAutor(estudiante);
    this.busquedaEstudiante.set('');        // Limpia el input
    this.sugerenciasEstudiante.set([]);     // Oculta el dropdown
}

  agregarAutor(estudiante: Estudiante): void {
    if (this.autoresSeleccionados().length >= 2) {
      this.notificationService.showWarn('Solo se permite un máximo de 2 autores por proyecto de tesis.');
      return;
    }
    if (this.autoresSeleccionados().some(a => a.id === estudiante.id)) {
      this.notificationService.showWarn('El estudiante ya se encuentra asignado como autor.');
      return;
    }

    this.autoresSeleccionados.update(list => [...list, estudiante]);
    this.busquedaEstudiante.set('');
  }

  removerAutor(id: number): void {
    this.autoresSeleccionados.update(list => list.filter(a => a.id !== id));
  }

  // --- MODAL ESTUDIANTE RÁPIDO ---
  abrirModalNuevoEstudiante(): void {
    this.modalEstudianteForm.reset({
      escuelaId: this.form.get('escuelaId')?.value || null,
      generoCodigo: TablaMaestraService.genderMaleCode
    });

    // Listener para generar correo dinámico
    this.modalEstudianteForm.get('escuelaId')?.valueChanges.subscribe(() => this.generarCorreoAutomaticoEstudiante());
    this.modalEstudianteForm.get('nombres')?.valueChanges.subscribe(() => this.generarCorreoAutomaticoEstudiante());
    this.modalEstudianteForm.get('primerApellido')?.valueChanges.subscribe(() => this.generarCorreoAutomaticoEstudiante());

    this.modalEstudianteVisible.set(true);
  }

  cerrarModalEstudiante(): void {
    this.modalEstudianteVisible.set(false);
  }

  generarCorreoAutomaticoEstudiante(): void {
    const idEscuela = this.modalEstudianteForm.get('escuelaId')?.value;
    const nombres = this.modalEstudianteForm.get('nombres')?.value || '';
    const ape = this.modalEstudianteForm.get('primerApellido')?.value || '';
    const codigoEscuela = this.escuelas().find(e => e.id === idEscuela)?.codigo || '';
      
    if (idEscuela && nombres && ape) {
      const pNombre = nombres.trim().split(' ')[0].toLowerCase();
      const pApe = ape.trim().toLowerCase();
      this.modalEstudianteForm.get('correoInstitucional')?.setValue(`${pNombre}.${pApe}.${codigoEscuela}@unsch.edu.pe`, { emitEvent: false });
    }
  }

  guardarEstudianteRapido(): void {
    if (this.modalEstudianteForm.invalid) return;
    this.controls.loadingEstudianteRegistro.set(true);

    const payload: EstudianteRequest = this.modalEstudianteForm.getRawValue();
    this.estudianteService.guardar(payload).subscribe({
      next: (res) => {
        this.notificationService.showSuccess('Estudiante registrado exitosamente.');
        this.agregarAutor(res.data);
        this.modalEstudianteVisible.set(false);
        this.controls.loadingEstudianteRegistro.set(false);
      }, error: () => {
        this.notificationService.showError('Error al registrar el estudiante.');
        this.controls.loadingEstudianteRegistro.set(false);
      }
    });
  }

  // --- MANEJO DE PDFS (1 a 5 Archivos) ---
  onFilesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files) return;

    const filesArray = Array.from(input.files);
    const validPdfs = filesArray.filter(f => f.type === 'application/pdf');

    if (this.archivosPDF().length + validPdfs.length > 5) {
      this.notificationService.showWarn('Solo puede adjuntar un máximo de 5 archivos PDF.');
      return;
    }

    this.archivosPDF.update(list => [...list, ...validPdfs]);
  }

  removerPDF(index: number): void {
    this.archivosPDF.update(list => list.filter((_, i) => i !== index));
  }

  // --- GUARDAR PROYECTO DE TESIS ---
  guardarTesis(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.notificationService.showWarn('Por favor complete todos los campos obligatorios.');
      return;
    }

    if (this.autoresSeleccionados().length === 0) {
      this.notificationService.showWarn('Debe asignar al menos un autor a la tesis.');
      return;
    }

    if (this.archivosPDF().length < 1 || this.archivosPDF().length > 5) {
      this.notificationService.showWarn('Debe adjuntar entre 1 y 5 archivos PDF.');
      return;
    }

    this.controls.loading.set(true);
    const v = this.form.getRawValue();

    const request: RegistrarTesisRequest = {
      escuelaId: v.escuelaId,
      titulo: v.titulo,
      numeroExpediente: v.numeroExpediente,
      etapaTesisCodigo: v.etapaTesisCodigo,
      estudiantesIds: this.autoresSeleccionados().map(a => a.id)
    };

    console.log(request);
    

    this.tesisService.guardar(request, this.archivosPDF()).subscribe({
      next: () => {
        this.controls.loading.set(false);
        this.notificationService.showSuccess('Proyecto de tesis registrado correctamente.');
        this.router.navigate(['/tesis/listar']);
      },
      error: () => this.controls.loading.set(false)
    });
  }

  cancelar(): void {
    this.router.navigate(['/tesis/listar']);
  }

}
