import { Component, computed, inject, OnInit, signal, viewChild } from '@angular/core';
import { TitleSubtitleComponent } from '../../../../shared/components/title-subtitle/title-subtitle.component';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { Docente, DocenteFiltro, DocenteMetrica } from '../../../../shared/models/personas/docente.model';
import { DepartamentoAcademico } from '../../../../shared/models/master/departamento_academico.model';
import { EscuelaProfesional } from '../../../../shared/models/master/escuela_profesional.model';
import { SelectModule } from '@openng/optimus-ui/select';
import { TableSkeletonComponent } from '../../../../shared/components/table-skeleton/table-skeleton.component';
import { NoConnectionComponent } from '../../../../shared/components/no-connection/no-connection.component';
import { TableModule } from '@openng/optimus-ui/table';
import { BadgeComponent } from '../../../../shared/components/badge/badge.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Facultad, FACULTY_MOCK } from '../../../../shared/models/master/facultad.model';
import { DepartamentoService } from '../../service/departamento.service';
import { DocenteService } from '../../service/docente.service';
import { EscuelaService } from '../../service/escuela.service';
import { forkJoin } from 'rxjs';
import { MasterTable } from '../../../../shared/models/master/tabla_maestra.model';
import { TablaMaestraService } from '../../../configuracion/services/tabla-maestra.service';
import { MetricaTotalPorcentaje } from '../../../../shared/models/base/MetricaTotalPorcentaje.model';
import { DocenteAddEditComponent } from './docente-add-edit/docente-add-edit.component';
import { DocenteEditComponent } from './docente-edit/docente-edit.component';
import { ConfirmActionType, ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { NotificacionService } from '../../../../shared/services/notificacion.service';
import { PanelModule } from '@openng/optimus-ui/panel';

@Component({
  imports: [
    CommonModule,
    FormsModule,
    PanelModule,
    SelectModule,
    TableModule,
    TitleSubtitleComponent,
    ButtonComponent,
    BadgeComponent,
    TableSkeletonComponent,
    NoConnectionComponent,
    DocenteAddEditComponent,
    DocenteEditComponent,
    ConfirmDialogComponent
],
  selector: 'app-docentes',
  styleUrl: './docentes.component.css',
  templateUrl: './docentes.component.html',
})
export class DocentesComponent implements OnInit {

  facultad: Facultad = FACULTY_MOCK;

  docenteModal = viewChild<DocenteAddEditComponent>('docenteModal');
  docenteModalEdit = viewChild<DocenteEditComponent>('docenteModalEdit');
  confirmModal = viewChild<ConfirmDialogComponent>('confirmModal');

  docentes = signal<Docente[]>([]);
  paginaActual = signal(0);
  tamanoPagina = signal(10);
  totalItems = signal(0);
  totalPaginas = signal(0);

  departamentosFiltro = signal<DepartamentoAcademico[]>([]);
  private todasLasEscuelas = signal<EscuelaProfesional[]>([]);
  escuelasFiltro = computed(() => {
    const deptId = this.filtroDepartamento();
    const escuelas = this.todasLasEscuelas();

    if (!deptId) {
      return escuelas;
    }

    return escuelas.filter(esc => esc.departamento.id === deptId);
  });
  estadosFiltro = [
    { label: 'Todos', value: null },
    { label: 'Activo (Habilitado)', value: 1 },
    { label: 'Inactivo', value: 0 }
  ];
  generosFiltro = signal<MasterTable[]>([]);

  // Filtros vinculados por modelo
  filtroDepartamento = signal<number | null>(null);
  filtroEscuela = signal<number | null>(null);
  filtroEstado = signal<number | null>(null);
  filtroGenero = signal<string | null>(null);
  filtroNumeroDocumento = signal<string>('');
  filtroCorreo = signal<string>('');

  // Elemento Seleccionado
  selectedDocente = signal<Docente | null>(null);

  filtro: DocenteFiltro = {
    facultadId: this.facultad.id,
  }

  controls = {
    operation: {
      loading: signal<boolean>(false),
      connectionError: signal<boolean>(false)
    },
    filters: {
      loading: signal<boolean>(false),
    },
    confirmAction: { selectedItem: signal<Docente | null>(null), selectedAction: signal<ConfirmActionType>('delete') }
  };

  private readonly docenteService = inject(DocenteService);
  private readonly departamentoService = inject(DepartamentoService);
  private readonly escuelaService = inject(EscuelaService);
  private readonly tablaMaestraService = inject(TablaMaestraService);
  private readonly notificationService = inject(NotificacionService);

  constructor() { }

  ngOnInit(): void {
    this.cargarFiltros();
    this.cargarDocentes(this.filtro, this.paginaActual(), this.tamanoPagina());
  }

  cargarFiltros(): void {
    this.controls.filters.loading.set(true);
    forkJoin({
      departamentos: this.departamentoService.getActivesByFacultad(this.facultad.id),
      escuelas: this.escuelaService.getActivesByFacultad(this.facultad.id),
      generos: this.tablaMaestraService.getItemsActives('002')
    }).subscribe({
      next: ({ departamentos, escuelas, generos }) => {
        this.departamentosFiltro.set(departamentos.data || []);
        this.todasLasEscuelas.set(escuelas.data || []);
        this.generosFiltro.set(generos.data || []);
        this.controls.filters.loading.set(false);
      },
      error: (err) => {
        this.controls.filters.loading.set(false);
        console.error('Error al cargar los filtros de departamento/escuela:', err);
      }
    });
  }

  onDepartamentoChange(deptId: number | null): void {
    this.filtroDepartamento.set(deptId);

    const escuelaActual = this.filtroEscuela();
    if (escuelaActual) {
      const escuelasDisponibles = this.escuelasFiltro();
      const sigueValida = escuelasDisponibles.some(e => e.id === escuelaActual);
      if (!sigueValida) {
        this.filtroEscuela.set(null);
      }
    }
  }

  cargarDocentes(filtro: DocenteFiltro, page: number, size: number): void {
    this.controls.operation.loading.set(true);
    this.controls.filters.loading.set(true);
    this.docenteService.getByFilters(filtro, page, size).subscribe({
      next: (respuesta) => {
        this.docentes.set(respuesta.data || []);
        this.paginaActual.set(respuesta.currentPage);
        this.tamanoPagina.set(respuesta.size);
        this.totalItems.set(respuesta.totalItems);
        this.totalPaginas.set(respuesta.totalPages);
        this.controls.operation.loading.set(false);
        this.controls.filters.loading.set(false);

      },
      error: (err) => {
        console.error('Error al obtener los docentes:', err);
        this.controls.operation.loading.set(false);
        this.controls.filters.loading.set(false);
        if (err.status === 0) {
          this.controls.operation.connectionError.set(true);
        }
      }
    });
  }

  aplicarFiltros(): void {
    this.filtro = {
      facultadId: this.facultad.id,
      departamentoAcademicoId: this.filtroDepartamento() ?? undefined,
      escuelaId: this.filtroEscuela() ?? undefined,
      estado: this.filtroEstado() ?? undefined,
      generoCodigo: this.filtroGenero() ?? undefined,
      numeroDocumento: this.filtroNumeroDocumento().trim() ?? undefined,
      correo: this.filtroCorreo().trim() ?? undefined
    };

    this.cargarDocentes(this.filtro, 0, this.tamanoPagina());
  }

  limpiarFiltros(): void {
    this.filtroDepartamento.set(null);
    this.filtroEscuela.set(null);
    this.filtroEstado.set(null);
    this.filtroGenero.set(null);
    this.filtroNumeroDocumento.set('');
    this.filtroCorreo.set('');

    this.filtro = { facultadId: this.facultad.id };
    this.cargarDocentes(this.filtro, 0, this.tamanoPagina());
  }

  cambiarPagina(pagina: number): void {
    if (pagina < 0 || pagina >= this.totalPaginas() || pagina === this.paginaActual()) {
      return;
    }

    this.cargarDocentes(this.filtro, pagina, this.tamanoPagina());
  }

  paginaAnterior(): void {
    this.cambiarPagina(this.paginaActual() - 1);
  }

  paginaSiguiente(): void {
    this.cambiarPagina(this.paginaActual() + 1);
  }
  
  exportar(): void { }

  crearNuevo() {
    this.docenteModal()?.abrirNuevo();
  }

  editar(docente: Docente) {
    this.docenteModalEdit()?.abrirEdicion(docente);
  }

  onGuardadoExitoso() {
    this.cargarDocentes(this.filtro, this.paginaActual(), this.tamanoPagina());
  }

  activar(item: Docente): void {
    this.controls.confirmAction.selectedItem.set(item);
    this.controls.confirmAction.selectedAction.set('active');
    this.confirmModal()?.abrir('active', item.nombres + ' ' + item.primerApellido + ' ' + item.segundoApellido);
  }

  desactivar(item: Docente): void {
    this.controls.confirmAction.selectedItem.set(item);
    this.controls.confirmAction.selectedAction.set('deactive');
    this.confirmModal()?.abrir('deactive', item.nombres + ' ' + item.primerApellido + ' ' + item.segundoApellido);
  }

  eliminar(item: Docente): void {
    this.controls.confirmAction.selectedItem.set(item);
    this.controls.confirmAction.selectedAction.set('delete');
    this.confirmModal()?.abrir('delete', item.nombres + ' ' + item.primerApellido + ' ' + item.segundoApellido);
  }

  ejecutarAccionConfirmada(): void {
    const item = this.controls.confirmAction.selectedItem();
    const action = this.controls.confirmAction.selectedAction();

    if (!item) return;

    // Activamos el spinner en el botón de confirmación
    this.confirmModal()?.loading.set(true);

    let request$;
    switch (action) {
      case 'active':
        request$ = this.docenteService.activar(item.id);
        break;
      case 'deactive':
        request$ = this.docenteService.desactivar(item.id);
        break;
      case 'delete':
        request$ = this.docenteService.eliminar(item.id);
        break;
      default:
        request$ = this.docenteService.activar(item.id);
        break;
    }

    request$.subscribe({
      next: (res) => {
        this.notificationService.showSuccess(res.message);
        this.confirmModal()?.cerrar();
        this.onGuardadoExitoso();
      },
      error: () => this.confirmModal()?.loading.set(false)
    });
    
  }

}
