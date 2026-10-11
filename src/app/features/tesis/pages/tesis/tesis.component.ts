import { Component, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { TesisService } from '../../services/tesis.service';
import { EscuelaService } from '../../../organizacion/service/escuela.service';
import { TablaMaestraService } from '../../../configuracion/services/tabla-maestra.service';
import { Facultad, FACULTY_MOCK } from '../../../../shared/models/master/facultad.model';
import { Tesis, TesisFiltro } from '../../../../shared/models/tramites/tesis.model';
import { EscuelaProfesional } from '../../../../shared/models/master/escuela_profesional.model';
import { MasterTable } from '../../../../shared/models/master/tabla_maestra.model';
import { forkJoin } from 'rxjs';
import { TitleSubtitleComponent } from '../../../../shared/components/title-subtitle/title-subtitle.component';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { Panel } from '@openng/optimus-ui/panel';
import { SelectModule } from '@openng/optimus-ui/select';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TesisCardComponent } from '../../components/tesis-card/tesis-card.component';
import { AppEmptyStateComponent } from '../../../../shared/components/app-empty-state/app-empty-state.component';
import { TableSkeletonComponent } from '../../../../shared/components/table-skeleton/table-skeleton.component';
import { NoConnectionComponent } from '../../../../shared/components/no-connection/no-connection.component';
import { BadgeComponent } from '../../../../shared/components/badge/badge.component';

@Component({
  imports: [TitleSubtitleComponent, ButtonComponent, Panel, SelectModule, FormsModule, CommonModule, TesisCardComponent, AppEmptyStateComponent, TableSkeletonComponent, NoConnectionComponent, BadgeComponent],
  selector: 'app-tesis',
  styleUrl: './tesis.component.css',
  templateUrl: './tesis.component.html',
})
export class TesisComponent implements OnInit {

  private readonly router = inject(Router);
  private readonly tesisService = inject(TesisService);
  private readonly escuelaService = inject(EscuelaService);
  private readonly tablaMaestraService = inject(TablaMaestraService);

  facultad: Facultad = FACULTY_MOCK;

  tesisList = signal<Tesis[]>([]);
  paginaActual = signal(0);
  tamanoPagina = signal(10);
  totalItems = signal(0);
  totalPaginas = signal(0);

  controls = {
    loading: signal<boolean>(false),
    loadingCatalogos: signal<boolean>(false),
    connectionError: signal<boolean>(false)
  };

  // Catálogos
  escuelasFiltro = signal<EscuelaProfesional[]>([]);
  estadosFiltro = signal<MasterTable[]>([]);

  // Filtros
  filtroEscuela = signal<number | null>(null);
  filtroEstado = signal<string | null>(null);
  textoBusqueda = signal<string>('');

  ngOnInit(): void {
    this.cargarCatalogos();
    this.cargarTesis();
  }

  cargarCatalogos(): void {
    this.controls.loadingCatalogos.set(true);
    forkJoin({
      escuelas: this.escuelaService.getActivesByFacultad(this.facultad.id),
      estados: this.tablaMaestraService.getItemsActives(TablaMaestraService.stateThesisTableCode) // Código tabla estados tesis
    }).subscribe({
      next: ({ escuelas, estados }) => {
        this.escuelasFiltro.set(escuelas.data || []);
        this.estadosFiltro.set(estados.data || []);
        this.controls.loadingCatalogos.set(false);
      },
      error: () => this.controls.loadingCatalogos.set(false)
    });
  }

  cargarTesis(): void {
    this.controls.loading.set(true);
    this.controls.connectionError.set(false);

    const filtro: TesisFiltro = {
      facultadId: this.facultad.id,
      escuelaId: this.filtroEscuela() ?? undefined,
      estadoCodigo: this.filtroEstado() ?? undefined,
      textoBusqueda: this.textoBusqueda().trim() ?? undefined
    };

    this.tesisService.getByFilters(filtro, this.paginaActual(), this.tamanoPagina()).subscribe({
      next: (res) => {
        this.tesisList.set(res.data || []);
        this.paginaActual.set(res.currentPage);
        this.totalItems.set(res.totalItems);
        this.totalPaginas.set(res.totalPages);
        this.controls.loading.set(false);
      },
      error: (err) => {
        console.error('Error al cargar las tesis:', err);
        this.controls.loading.set(false);
        if (err.status === 0) {
          this.controls.connectionError.set(true);
        }
      }
    });
  }

  limpiarFiltros(): void {
    this.filtroEscuela.set(null);
    this.filtroEstado.set(null);
    this.textoBusqueda.set('');
    this.cargarTesis();
  }

  irANuevo(): void {
    this.router.navigate(['/tesis/registrar']);
  }

  verDetalle(tesis: Tesis): void {
    this.router.navigate(['/tesis', tesis.id]);
  }

  paginaAnterior(): void {
    if (this.paginaActual() > 0) {
      this.paginaActual.update(p => p - 1);
      this.cargarTesis();
    }
  }

  paginaSiguiente(): void {
    if (this.paginaActual() < this.totalPaginas() - 1) {
      this.paginaActual.update(p => p + 1);
      this.cargarTesis();
    }
  }

}
