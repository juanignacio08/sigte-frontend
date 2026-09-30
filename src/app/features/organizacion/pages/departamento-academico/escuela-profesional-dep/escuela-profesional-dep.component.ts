import { Component, computed, inject, input, OnInit, signal, viewChild } from '@angular/core';
import { TitleSubtitleComponent } from '../../../../../shared/components/title-subtitle/title-subtitle.component';
import { DepartamentoService } from '../../../service/departamento.service';
import { DepartamentoAcademico } from '../../../../../shared/models/master/departamento_academico.model';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from '../../../../../shared/components/button/button.component';
import { TableSkeletonComponent } from '../../../../../shared/components/table-skeleton/table-skeleton.component';
import { NoConnectionComponent } from '../../../../../shared/components/no-connection/no-connection.component';
import { TableModule } from '@openng/optimus-ui/table';
import { BadgeComponent } from '../../../../../shared/components/badge/badge.component';
import { EscuelaProfesional } from '../../../../../shared/models/master/escuela_profesional.model';
import { EscuelaAddEditComponent } from '../../escuela-profesional/escuela-add-edit/escuela-add-edit.component';
import { Facultad, FACULTY_MOCK } from '../../../../../shared/models/master/facultad.model';
import { EscuelaService } from '../../../service/escuela.service';
import { ConfirmActionType, ConfirmDialogComponent } from '../../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { NotificacionService } from '../../../../../shared/services/notificacion.service';

@Component({
  imports: [TitleSubtitleComponent, CommonModule, ButtonComponent, TableSkeletonComponent, NoConnectionComponent, TableModule, BadgeComponent, EscuelaAddEditComponent, ConfirmDialogComponent],
  selector: 'app-escuela-profesional-dep',
  styleUrl: './escuela-profesional-dep.component.css',
  templateUrl: './escuela-profesional-dep.component.html',
})
export class EscuelaProfesionalDepComponent implements OnInit {

  id = input.required<number>();
  title = signal<string>('Escuela Profesional');
  subtitle = 'Gestione las escuelas profesionales de este departamento académico';
  icon = 'pi-building-columns';

  modalForm = viewChild<EscuelaAddEditComponent>('modalEscuela');
  confirmModal = viewChild<ConfirmDialogComponent>('confirmModal');

  departamento !: DepartamentoAcademico;

  facultad: Facultad = FACULTY_MOCK;

  escuelas = signal<EscuelaProfesional[]>([]);

  controls = {
    operation: { error: signal<boolean>(false), loading: signal<boolean>(true), loadingInitial: signal<boolean>(true), connectionError: signal<boolean>(false) },
    confirmAction: { selectedItem: signal<EscuelaProfesional | null>(null), selectedAction: signal<ConfirmActionType>('delete') }
  };

  // Contadores calculados para las tarjetas superiores
  totalRegistrados = computed(() => this.escuelas().length);
  totalActivos = computed(() => this.escuelas().filter(d => d.estado === 1).length);

  private readonly departamentoService = inject(DepartamentoService);
  private readonly escuelaService = inject(EscuelaService);
  private readonly notificationService = inject(NotificacionService);

  ngOnInit(): void {
    this.cargaInicial(this.id());
  }

  cargaInicial(id: number) {
    this.controls.operation.loadingInitial.set(true);
    this.controls.operation.loading.set(true);

    this.departamentoService.getById(id).subscribe({
      next: (res) => {
        this.departamento = res.data;
        this.escuelas.set(this.departamento.escuelas);
        this.title.set(this.departamento.denominacion);
        this.controls.operation.loading.set(false);
        this.controls.operation.loadingInitial.set(false);
      },
      error: (err) => {
        console.error('Error al obtener ek departamento:', err);
        this.controls.operation.loadingInitial.set(false);
        this.controls.operation.loading.set(false);
        if (err.status === 0) {
          this.controls.operation.connectionError.set(true);
        }
      }
    })
  }

  crearNuevo() {
    this.modalForm()?.abrirNuevo();
  }

  exportar() {
    console.log('Exportar lista');
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
    this.cargarEscuelas(this.departamento.id);
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

  cargarEscuelas(departamentoId: number) {
    this.controls.operation.loading.set(true);

    this.escuelaService.getByDepartment(departamentoId).subscribe({
      next: (res) => {
        this.departamento.escuelas = res.data;
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
