import { Component, computed, inject, OnInit, signal, viewChild } from '@angular/core';
import { EscuelaAddEditComponent } from './escuela-add-edit/escuela-add-edit.component';
import { ConfirmActionType, ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { EscuelaProfesional } from '../../../../shared/models/master/escuela_profesional.model';
import { Facultad, FACULTY_MOCK } from '../../../../shared/models/master/facultad.model';
import { EscuelaService } from '../../service/escuela.service';
import { NotificacionService } from '../../../../shared/services/notificacion.service';
import { TitleSubtitleComponent } from '../../../../shared/components/title-subtitle/title-subtitle.component';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { TableSkeletonComponent } from '../../../../shared/components/table-skeleton/table-skeleton.component';
import { NoConnectionComponent } from '../../../../shared/components/no-connection/no-connection.component';
import { TableModule } from '@openng/optimus-ui/table';
import { BadgeComponent } from '../../../../shared/components/badge/badge.component';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  imports: [TitleSubtitleComponent, ButtonComponent, TableSkeletonComponent, NoConnectionComponent, TableModule, BadgeComponent, CommonModule, EscuelaAddEditComponent, ConfirmDialogComponent],
  selector: 'app-escuela-profesional',
  styleUrl: './escuela-profesional.component.css',
  templateUrl: './escuela-profesional.component.html',
})
export class EscuelaProfesionalComponent implements OnInit {
  title = 'Escuelas Profesionales';
  subtitle = 'Gestión de Escuelas Profesionales de la Facultad de Ciencias de la Salud.';
  icon = 'pi-building';

  modalForm = viewChild<EscuelaAddEditComponent>('modalEscuela');
  confirmModal = viewChild<ConfirmDialogComponent>('confirmModal');

  controls = {
    operation: { error: signal<boolean>(false), loading: signal<boolean>(true), loadingInitial: signal<boolean>(true), connectionError: signal<boolean>(false) },
    confirmAction: { selectedItem: signal<EscuelaProfesional | null>(null), selectedAction: signal<ConfirmActionType>('delete') }
  };

  facultad: Facultad = FACULTY_MOCK;

  escuelas = signal<EscuelaProfesional[]>([]);

  // Contadores calculados para las tarjetas superiores
  totalRegistrados = computed(() => this.escuelas().length);
  totalActivos = computed(() => this.escuelas().filter(d => d.estado === 1).length);

  private readonly escuelaService = inject(EscuelaService);
  private readonly notificationService = inject(NotificacionService);

  private readonly router = inject(Router);

  ngOnInit(): void {
    this.cargarEscuelas(this.facultad.id);
  }

  crearNuevo() {
    this.modalForm()?.abrirNuevo();
  }

  exportar() {
    console.log('Exportar lista');
  }

  verPlantillas(escuela: EscuelaProfesional): void {
    this.router.navigate(
      ['/organizacion', 'escuelas', escuela.id, 'plantillas'],
      {
        state: { escuela }
      }
    );
  }

  editar(escuela: EscuelaProfesional) {
    this.modalForm()?.abrirEdicion(escuela);
  }

  desactivar(escuela: EscuelaProfesional) {
    this.controls.confirmAction.selectedItem.set(escuela);
    this.controls.confirmAction.selectedAction.set('deactive');
    this.confirmModal()?.abrir('deactive', escuela.denominacion);
  }

  activar(escuela: EscuelaProfesional) {
    this.controls.confirmAction.selectedItem.set(escuela);
    this.controls.confirmAction.selectedAction.set('active');
    this.confirmModal()?.abrir('active', escuela.denominacion);
  }

  eliminar(escuela: EscuelaProfesional) {
    this.controls.confirmAction.selectedItem.set(escuela);
    this.controls.confirmAction.selectedAction.set('delete');
    this.confirmModal()?.abrir('delete', escuela.denominacion);
  }

  onGuardadoExitoso() {
    this.cargarEscuelas(this.facultad.id);
  }

  ejecutarAccionConfirmada(): void {
    const escuela = this.controls.confirmAction.selectedItem();
    const action = this.controls.confirmAction.selectedAction();

    if (!escuela) return;

    // Activamos el spinner en el botón de confirmación
    this.confirmModal()?.loading.set(true);

    let request$;
    switch (action) {
      case 'active':
        request$ = this.escuelaService.active(escuela.id);
        break;
      case 'deactive':
        request$ = this.escuelaService.deactive(escuela.id);
        break;
      case 'delete':
        request$ = this.escuelaService.delete(escuela.id);
        break;
      default:
        request$ = this.escuelaService.active(escuela.id);
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

  cargarEscuelas(facultadId: number) {
    this.controls.operation.loading.set(true);

    this.escuelaService.getByFacultad(facultadId).subscribe({
      next: (res) => {
        this.escuelas.set(res.data);
        this.controls.operation.loading.set(false);
      },
      error: (err) => {
        console.error('Error al obtener las escuelas de un departamento:', err);
        this.controls.operation.loading.set(false);
        if (err.status === 0) {
          this.controls.operation.connectionError.set(true);
        }
      }
    })
  }
}
