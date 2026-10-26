import { Component, computed, inject, input, OnInit, output, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TesisComisionService } from '../../../services/tesis-comision.service';
import { TablaMaestraService } from '../../../../configuracion/services/tabla-maestra.service';
import { NotificacionService } from '../../../../../shared/services/notificacion.service';
import { MasterTable } from '../../../../../shared/models/master/tabla_maestra.model';
import { ComisionMiembro, ComisionMiembroRequest } from '../../../../../shared/models/tramites/comision.model';
import { CommonModule } from '@angular/common';
import { DialogModule } from '@openng/optimus-ui/dialog';
import { InputTextModule } from '@openng/optimus-ui/inputtext';
import { SelectModule } from '@openng/optimus-ui/select';
import { ButtonComponent } from '../../../../../shared/components/button/button.component';
import { DocenteService } from '../../../../organizacion/service/docente.service';
import { Docente } from '../../../../../shared/models/personas/docente.model';
import { AutoCompleteModule, AutoCompleteSelectEvent } from '@openng/optimus-ui/autocomplete';
import { EscuelaProfesional } from '../../../../../shared/models/master/escuela_profesional.model';
import { DepartamentoAcademico } from '../../../../../shared/models/master/departamento_academico.model';

type ModoModal = 'agregar' | 'editar';

@Component({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DialogModule,
    InputTextModule,
    AutoCompleteModule,
    SelectModule,
    ButtonComponent,
  ],
  selector: 'app-agregar-miembro-comision',
  styleUrl: './agregar-miembro-comision.component.css',
  templateUrl: './agregar-miembro-comision.component.html',
})
export class AgregarMiembroComisionComponent implements OnInit {

  private readonly fb = inject(FormBuilder);
  private readonly comisionService = inject(TesisComisionService);
  private readonly tablaMaestraService = inject(TablaMaestraService);
  private readonly docenteService = inject(DocenteService);
  private readonly notificationService = inject(NotificacionService);

  miembrosActuales = input.required<ComisionMiembro[]>();

  onSuccess = output<void>();

  modo = signal<ModoModal>('agregar');
  miembroId = signal<number | null>(null);
  rolActual = signal<string | null>(null);

  visible = signal<boolean>(false);
  loading = signal<boolean>(false);
  buscando = signal<boolean>(false);
  roles = signal<MasterTable[]>([]);
  docentesSugeridos = signal<Docente[]>([]);
  docenteSeleccionado = signal<Docente | null>(null);

  private comisionId: number | null = null;

  private readonly rolesMultiples = new Set<string>([
    TablaMaestraService.rolesCommissionJury,
    TablaMaestraService.rolesCommissionCoAdvisor,
  ]);

  form: FormGroup = this.fb.group({
    // Guarda el objeto DocenteSugerido (para que PrimeNG muestre `field="fullName"`)
    docente: [null, [Validators.required]],
    rolCodigo: [null, [Validators.required]],
  });

  ngOnInit(): void {
    this.cargarRoles();
  }

  rolesDisponibles = computed(() => {
    const miembros = this.miembrosActuales();

    return this.roles().filter(rol => {
      const cantidadActual = miembros.filter(
        miembro => miembro.rolCodigo === rol.code
      ).length;

      const permiteDos = this.rolesMultiples.has(rol.code);
      const limite = permiteDos ? 2 : 1;

      return cantidadActual < limite;
    });
  });

  cargarRoles(): void {
    this.tablaMaestraService.getItemsActives(TablaMaestraService.rolesCommissionTableCode).subscribe({
      next: (res) => this.roles.set(res.data || []),
      error: () => this.roles.set([]),
    });
  }

  abrir(comisionId: number): void {
    this.modo.set('agregar');
    this.comisionId = comisionId;
    this.miembroId.set(null);
    this.rolActual.set(null);

    this.form.reset({
      docente: null,
      rolCodigo: null,
    });

    this.docenteSeleccionado.set(null);
    this.docentesSugeridos.set([]);

    this.visible.set(true);
  }

  abrirEdicion(miembro: ComisionMiembro): void {
    this.modo.set('editar');
    this.miembroId.set(miembro.id);

    const docente : Docente = {
      id: miembro.docenteId,
      escuela: {} as EscuelaProfesional,
      departamento: {} as DepartamentoAcademico,
      correoInstitucional: miembro.correoInstitucional,
      eliminado: false,
      estado: 1,
      generoCodigo: TablaMaestraService.genderMaleCode,
      nombres: miembro.docenteNombre,
      primerApellido: miembro.docenteNombre,
      segundoApellido: miembro.docenteNombre,
      fullName: miembro.docenteNombre 
    }

    this.rolActual.set(miembro.rolDenominacion);

    this.form.reset({
      docente: docente,
      rolCodigo: null
    });

    this.docenteSeleccionado.set(docente);
    this.docentesSugeridos.set([]);

    this.visible.set(true);
  }

  cerrarModal(): void {
    this.form.reset();
    this.docenteSeleccionado.set(null);
    this.docentesSugeridos.set([]);
    this.loading.set(false);
    this.visible.set(false);
  }

  private obtenerDocentesDisponibles(docentes: Docente[]): Docente[] {
    const docentesAsignados = new Set(
      this.miembrosActuales().map(m => String(m.docenteId))
    );

    return docentes.filter(
      docente => !docentesAsignados.has(String(docente.id))
    );
  }

  // ============ AUTOCOMPLETE DOCENTE ============
  buscarDocente(event: { query: string }): void {
    const query = event.query?.trim() ?? '';
    if (!query) {
      this.docentesSugeridos.set([]);
      return;
    }

    this.buscando.set(true);

    this.docenteService.getByFilters({ nombre: query }, 0, 5).subscribe({
      next: (res) => {
        this.buscando.set(false);
        const docentes: Docente[] = (res.data || []).map((d: Docente) => ({
          ...d,
          fullName: `${d.nombres ?? ''} ${d.primerApellido ?? ''} ${d.segundoApellido ?? ''}`.trim(),
        }));

        this.docentesSugeridos.set(
          this.obtenerDocentesDisponibles(docentes)
        );
      },
      error: () => {
        this.buscando.set(false);
        this.docentesSugeridos.set([]);
      },
    });
  }

  onDocenteSeleccionado(event: AutoCompleteSelectEvent<Docente>): void {
    this.docenteSeleccionado.set(event.value);
  }

  onDocenteDeseleccionado(): void {
    this.docenteSeleccionado.set(null);
    this.form.get('docente')?.setValue(null);
  }

  // ============ GUARDAR ============
  guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    if (this.modo() === 'agregar') {
      this.agregarMiembro();
    } else {
      this.modificarRol();
    }
  }

  agregarMiembro() {
    if (!this.comisionId) return;

    const docente = this.form.get('docente')?.value as Docente;
    if (!docente?.id) {
      this.notificationService.showWarn('Debe seleccionar un docente de la lista.');
      return;
    }

    const request: ComisionMiembroRequest = {
      comisionId: this.comisionId,
      docenteId: docente.id,
      rolCodigo: this.form.get('rolCodigo')?.value,
    };

    this.loading.set(true);
    this.comisionService.registrarMiembro(request).subscribe({
      next: (res) => {
        this.loading.set(false);
        this.cerrarModal();
        this.notificationService.showSuccess(res.message || 'Miembro agregado correctamente');
        this.onSuccess.emit();
      },
      error: () => this.loading.set(false),
    });
  }

  modificarRol(): void {
    const miembroId = this.miembroId();
    const rolCodigo = this.form.get('rolCodigo')?.value;

    if (miembroId == null || !rolCodigo) {
      return;
    }

    this.loading.set(true);
    this.comisionService.actualizarRolMiembro(miembroId, rolCodigo).subscribe({
      next: (res) => {
        this.loading.set(false);
        this.cerrarModal();
        this.notificationService.showSuccess(res.message || 'Miembro actualizado correctamente');
        this.onSuccess.emit();
      },
      error: () => this.loading.set(false),
    });
  }
}
