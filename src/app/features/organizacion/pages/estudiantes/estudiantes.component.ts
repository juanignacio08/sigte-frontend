import { Component, computed, inject, OnInit, signal, viewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PanelModule } from '@openng/optimus-ui/panel';
import { SelectModule } from '@openng/optimus-ui/select';
import { TableModule } from '@openng/optimus-ui/table';

import { TitleSubtitleComponent } from '../../../../shared/components/title-subtitle/title-subtitle.component';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { BadgeComponent } from '../../../../shared/components/badge/badge.component';
import { TableSkeletonComponent } from '../../../../shared/components/table-skeleton/table-skeleton.component';
import { NoConnectionComponent } from '../../../../shared/components/no-connection/no-connection.component';
import { ConfirmActionType, ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';

import { Estudiante, EstudianteFiltro } from '../../../../shared/models/personas/estudiante.model';
import { Facultad, FACULTY_MOCK } from '../../../../shared/models/master/facultad.model';
import { EscuelaProfesional } from '../../../../shared/models/master/escuela_profesional.model';
import { MasterTable } from '../../../../shared/models/master/tabla_maestra.model';

import { EstudianteService } from '../../service/estudiante.service';
import { EscuelaService } from '../../service/escuela.service';
import { TablaMaestraService } from '../../../configuracion/services/tabla-maestra.service';
import { NotificacionService } from '../../../../shared/services/notificacion.service';
import { EstudianteAddEditComponent } from './estudiante-add-edit/estudiante-add-edit.component';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-estudiantes',
  standalone: true,
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
    ConfirmDialogComponent,
    EstudianteAddEditComponent
  ],
  templateUrl: './estudiantes.component.html',
  styleUrl: './estudiantes.component.css'
})
export class EstudiantesComponent implements OnInit {

  facultad: Facultad = FACULTY_MOCK;

  // Views Child
  estudianteModal = viewChild<EstudianteAddEditComponent>('estudianteModal');
  confirmModal = viewChild<ConfirmDialogComponent>('confirmModal');

  // Signals de datos
  estudiantes = signal<Estudiante[]>([]);
  paginaActual = signal(0);
  tamanoPagina = signal(10);
  totalItems = signal(0);
  totalPaginas = signal(0);

  // Filtros
  escuelasFiltro = signal<EscuelaProfesional[]>([]);
  generosFiltro = signal<MasterTable[]>([]);
  estadosFiltro = [
    { label: 'Todos los estados', value: null },
    { label: 'Activos (Regulares)', value: 1 },
    { label: 'Inactivos', value: 0 }
  ];

  filtroEscuela = signal<number | null>(null);
  filtroNombre = signal<string>('');
  filtroCodigo = signal<string>('');
  filtroDocumento = signal<string>('');
  filtroGenero = signal<string | null>(null);
  filtroCorreo = signal<string>('');

  filtro: EstudianteFiltro = {
    facultadId: this.facultad.id
  };

  controls = {
    operation: {
      loading: signal<boolean>(false),
      connectionError: signal<boolean>(false)
    },
    filters: {
      loading: signal<boolean>(false)
    },
    confirmAction: {
      selectedItem: signal<Estudiante | null>(null),
      selectedAction: signal<ConfirmActionType>('delete')
    }
  };

  private readonly estudianteService = inject(EstudianteService);
  private readonly escuelaService = inject(EscuelaService);
  private readonly tablaMaestraService = inject(TablaMaestraService);
  private readonly notificationService = inject(NotificacionService);

  ngOnInit(): void {
    this.cargarFiltros();
    this.cargarEstudiantes(this.filtro, this.paginaActual(), this.tamanoPagina());
  }

  cargarFiltros(): void {
    this.controls.filters.loading.set(true);
    forkJoin({
      escuelas: this.escuelaService.getActivesByFacultad(this.facultad.id),
      generos: this.tablaMaestraService.getItemsActives(TablaMaestraService.genderTableCode)
    }).subscribe({
      next: ({ escuelas, generos }) => {
        this.escuelasFiltro.set(escuelas.data || []);
        this.generosFiltro.set(generos.data || []);
        this.controls.filters.loading.set(false);
      },
      error: (err) => {
        this.controls.filters.loading.set(false);
        console.error('Error al cargar catálogos:', err);
      }
    });
  }

  cargarEstudiantes(filtro: EstudianteFiltro, page: number, size: number): void {
    this.controls.operation.loading.set(true);
    this.estudianteService.getByFilters(filtro, page, size).subscribe({
      next: (res) => {
        this.estudiantes.set(res.data || []);
        this.paginaActual.set(res.currentPage);
        this.tamanoPagina.set(res.size);
        this.totalItems.set(res.totalItems);
        this.totalPaginas.set(res.totalPages);
        this.controls.operation.loading.set(false);
      },
      error: (err) => {
        console.error('Error al cargar estudiantes:', err);
        this.controls.operation.loading.set(false);
        if (err.status === 0) {
          this.controls.operation.connectionError.set(true);
        }
      }
    });
  }

  aplicarFiltros(): void {
    this.filtro = {
      facultadId: this.facultad.id,
      escuelaId: this.filtroEscuela() ?? undefined,
      nombre: this.filtroNombre().trim() ?? undefined,
      codigo: this.filtroCodigo().trim() ?? undefined,
      numeroDocumento: this.filtroDocumento().trim() ?? undefined,
      generoCodigo: this.filtroGenero() ?? undefined,
      email: this.filtroCorreo().trim() ?? undefined
    };

    this.cargarEstudiantes(this.filtro, 0, this.tamanoPagina());
  }

  limpiarFiltros(): void {
    this.filtroEscuela.set(null);
    this.filtroNombre.set('');
    this.filtroCodigo.set('');
    this.filtroDocumento.set('');
    this.filtroGenero.set(null);
    this.filtroCorreo.set('');

    this.filtro = { facultadId: this.facultad.id };
    this.cargarEstudiantes(this.filtro, 0, this.tamanoPagina());
  }

  cambiarPagina(pagina: number): void {
    if (pagina < 0 || pagina >= this.totalPaginas() || pagina === this.paginaActual()) return;
    this.cargarEstudiantes(this.filtro, pagina, this.tamanoPagina());
  }

  paginaAnterior(): void {
    this.cambiarPagina(this.paginaActual() - 1);
  }

  paginaSiguiente(): void {
    this.cambiarPagina(this.paginaActual() + 1);
  }

  crearNuevo(): void {
    this.estudianteModal()?.abrirNuevo();
  }

  editar(estudiante: Estudiante): void {
    this.estudianteModal()?.abrirEdicion(estudiante);
  }

  onGuardadoExitoso(): void {
    this.cargarEstudiantes(this.filtro, this.paginaActual(), this.tamanoPagina());
  }

  activar(item: Estudiante): void {
    this.controls.confirmAction.selectedItem.set(item);
    this.controls.confirmAction.selectedAction.set('active');
    this.confirmModal()?.abrir('active', `${item.nombres} ${item.primerApellido} ${item.segundoApellido}`);
  }

  desactivar(item: Estudiante): void {
    this.controls.confirmAction.selectedItem.set(item);
    this.controls.confirmAction.selectedAction.set('deactive');
    this.confirmModal()?.abrir('deactive', `${item.nombres} ${item.primerApellido} ${item.segundoApellido}`);
  }

  eliminar(item: Estudiante): void {
    this.controls.confirmAction.selectedItem.set(item);
    this.controls.confirmAction.selectedAction.set('delete');
    this.confirmModal()?.abrir('delete', `${item.nombres} ${item.primerApellido} ${item.segundoApellido}`);
  }

  ejecutarAccionConfirmada(): void {
    const item = this.controls.confirmAction.selectedItem();
    const action = this.controls.confirmAction.selectedAction();

    if (!item) return;

    this.confirmModal()?.loading.set(true);

    let request$;
    switch (action) {
      case 'active':
        request$ = this.estudianteService.activar(item.id);
        break;
      case 'deactive':
        request$ = this.estudianteService.desactivar(item.id);
        break;
      case 'delete':
        request$ = this.estudianteService.eliminar(item.id);
        break;
      default:
        request$ = this.estudianteService.activar(item.id);
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