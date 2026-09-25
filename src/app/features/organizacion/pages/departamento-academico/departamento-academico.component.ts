import { Component, computed, inject, OnInit, signal, viewChild } from '@angular/core';
import { TitleSubtitleComponent } from '../../../../shared/components/title-subtitle/title-subtitle.component';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { CommonModule } from '@angular/common';
import { BadgeComponent } from '../../../../shared/components/badge/badge.component';
import { DepartamentoAcademico } from '../../../../shared/models/master/departamento_academico.model';
import { TableModule } from '@openng/optimus-ui/table'
import { Facultad, FACULTY_MOCK } from '../../../../shared/models/master/facultad.model';
import { DepartamentoService } from '../../service/departamento.service';
import { TableSkeletonComponent } from '../../../../shared/components/table-skeleton/table-skeleton.component';
import { NoConnectionComponent } from '../../../../shared/components/no-connection/no-connection.component';
import { DepartamentoAddEditComponent } from './departamento-add-edit/departamento-add-edit.component';
import { ConfirmActionType, ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { NotificacionService } from '../../../../shared/services/notificacion.service';

@Component({
  imports: [
    TitleSubtitleComponent,
    TableModule,
    ButtonComponent,
    CommonModule,
    BadgeComponent,
    TableSkeletonComponent,
    NoConnectionComponent,
    DepartamentoAddEditComponent,
    ConfirmDialogComponent
  ],
  selector: 'app-departamento-academico',
  styleUrl: './departamento-academico.component.css',
  templateUrl: './departamento-academico.component.html',
})
export class DepartamentoAcademicoComponent implements OnInit {
  title = 'Departamentos Académicos';
  subtitle = 'Gestión de Departamentos Académicos para la Facultad de Ciencias de la Salud.';
  icon = 'pi-building-columns';

  // Referencia al componente de confirmación
  confirmModal = viewChild<ConfirmDialogComponent>('confirmModal');

  modalForm = viewChild<DepartamentoAddEditComponent>('departamentoModal');

  controls = {
    operation: { error: signal<boolean>(false), loading: signal<boolean>(true), connectionError: signal<boolean>(false) },
    confirmAction: { selectedDept: signal<DepartamentoAcademico | null>(null), selectedAction: signal<ConfirmActionType>('delete') }
  };

  facultad: Facultad = FACULTY_MOCK;

  departamentos = signal<DepartamentoAcademico[]>([]);

  // Contadores calculados para las tarjetas superiores
  totalRegistrados = computed(() => this.departamentos().length);
  totalActivos = computed(() => this.departamentos().filter(d => d.estado === 1).length);
  totalEscuelasVinculadas = computed(() =>
    this.departamentos().reduce((acc, curr) => acc + curr.totalEscuelas, 0)
  );

  private readonly departamentoService = inject(DepartamentoService);
  private readonly notificationService = inject(NotificacionService);

  ngOnInit(): void {
    this.cargarDepartamentos(this.facultad.id);
  }

  cargarDepartamentos(facultad_id: number): void {
    this.controls.operation.loading.set(true);

    this.departamentoService.getByFacultad(facultad_id).subscribe({
      next: (data) => {
        this.departamentos.set(data.data);
        this.controls.operation.loading.set(false);
      },
      error: (err) => {
        console.error('Error al obtener los departamentos:', err);
        this.controls.operation.loading.set(false);
        if (err.status === 0) {
          this.controls.operation.connectionError.set(true);
        }
      }
    });
  }

  // Acciones
  crearNuevo() {
    this.modalForm()?.abrirNuevo();
  }

  exportar() {
    console.log('Exportar lista');
  }

  verEscuelas(dept: DepartamentoAcademico) {
    console.log('Ver escuelas adscritas a:', dept.denominacion);
  }

  editar(dept: DepartamentoAcademico) {
    this.modalForm()?.abrirEdicion(dept);
  }

  activar(dept: DepartamentoAcademico) {
    this.controls.confirmAction.selectedDept.set(dept);
    this.controls.confirmAction.selectedAction.set('active');
    this.confirmModal()?.abrir('active', dept.denominacion);
  }

  desactivar(dept: DepartamentoAcademico) {
    this.controls.confirmAction.selectedDept.set(dept);
    this.controls.confirmAction.selectedAction.set('deactive');
    this.confirmModal()?.abrir('deactive', dept.denominacion);
  }

  eliminar(dept: DepartamentoAcademico) {
    this.controls.confirmAction.selectedDept.set(dept);
    this.controls.confirmAction.selectedAction.set('delete');
    this.confirmModal()?.abrir('delete', dept.denominacion);
  }

  verDetalle(dept: DepartamentoAcademico) {
    console.log('Ver detalle:', dept.id);
  }

  onGuardadoExitoso() {
    this.cargarDepartamentos(this.facultad.id);
  }

  ejecutarAccionConfirmada(): void {
    const dept = this.controls.confirmAction.selectedDept();
    const action = this.controls.confirmAction.selectedAction();

    if (!dept) return;

    // Activamos el spinner en el botón de confirmación
    this.confirmModal()?.loading.set(true);

    let request$;
    switch (action) {
      case 'active':
        request$ = this.departamentoService.active(dept.id);
        break;
      case 'deactive':
        request$ = this.departamentoService.deactive(dept.id);
        break;
      case 'delete':
        request$ = this.departamentoService.delete(dept.id);
        break;
    }

    request$.subscribe({
      next: (res) => {
        this.notificationService.showSuccess(res.message);
        this.confirmModal()?.cerrar();
        this.cargarDepartamentos(this.facultad.id);
      },
      error: () => this.confirmModal()?.loading.set(false)
    });
    
  }

}
