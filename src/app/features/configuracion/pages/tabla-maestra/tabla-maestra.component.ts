import { Component, inject, signal, viewChild } from '@angular/core';
import { TitleSubtitleComponent } from '../../../../shared/components/title-subtitle/title-subtitle.component';
import { Select } from '@openng/optimus-ui/select';
import { NotificacionService } from '../../../../shared/services/notificacion.service';
import { TablaMaestraService } from '../../services/tabla-maestra.service';
import { CommonModule } from '@angular/common';
import { MasterTable } from '../../../../shared/models/master/tabla_maestra.model';
import { FormsModule } from '@angular/forms';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { TableSkeletonComponent } from '../../../../shared/components/table-skeleton/table-skeleton.component';
import { NoConnectionComponent } from '../../../../shared/components/no-connection/no-connection.component';
import { TableModule } from '@openng/optimus-ui/table';
import { BadgeComponent } from '../../../../shared/components/badge/badge.component';
import { ConfirmActionType, ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { MaestroAddEditComponent } from './maestro-add-edit/maestro-add-edit.component';

@Component({
  imports: [TitleSubtitleComponent, Select, CommonModule, FormsModule, ButtonComponent, TableSkeletonComponent, NoConnectionComponent, TableModule, BadgeComponent, MaestroAddEditComponent, ConfirmDialogComponent],
  selector: 'app-tabla-maestra',
  styleUrl: './tabla-maestra.component.css',
  templateUrl: './tabla-maestra.component.html',
})
export class TablaMaestraComponent {
  private readonly tablaMaestraService = inject(TablaMaestraService);
  private readonly notificationService = inject(NotificacionService);

  // Referencia al componente de confirmación
  confirmModal = viewChild<ConfirmDialogComponent>('confirmModal');
  modalForm = viewChild<MaestroAddEditComponent>('maestroModal');

  // Colecciones reactivas mediante Signals
  masterTablesList = signal<MasterTable[]>([]);
  itemsList = signal<MasterTable[]>([]);

  // Elementos seleccionados
  selectedMasterTable = signal<MasterTable | null>(null);
  selectedItem = signal<MasterTable | null>(null);
  selectedIsSystemOption = signal<boolean | null>(null);

  isSystem = [
    { label: 'Es Sistema', value: true },
    { label: 'No es sistema', value: false }
  ]

  // Controles de UI y Estados de Operación
  controls = {
    operation: {
      loading: signal<boolean>(false),
      connectionError: signal<boolean>(false),
      error: signal<boolean>(false)
    },
    confirmAction: { selectedItem: signal<MasterTable | null>(null), selectedAction: signal<ConfirmActionType>('delete') }
  };

  // Carga inicial del combo de tablas maestras
  cargarTablasMaestras(isSystem: boolean): void {
    this.controls.operation.loading.set(true);
    this.controls.operation.connectionError.set(false);
    this.controls.operation.error.set(false);

    this.tablaMaestraService.getTables(isSystem).subscribe({
      next: (res) => {
        this.masterTablesList.set(res.data || []);
        this.controls.operation.loading.set(false);
      },
      error: (err) => {
        console.error('Error al cargar tablas maestras:', err);
        this.controls.operation.loading.set(false);
        if (err.status === 0) {
          this.controls.operation.connectionError.set(true);
        }
      }
    });
  }

  onIsSystemOption(value: boolean | null) {
    this.refreshOptions();

    if (value == null) {
      return
    }

    this.cargarTablasMaestras(value);
  }

  refreshOptions() {
    this.masterTablesList.set([]);
    this.itemsList.set([]);

    this.selectedMasterTable.set(null);
    this.selectedItem.set(null);
  }

  // Evento al cambiar de opción en el Select
  onTableChange(tabla: MasterTable | null): void {
    this.selectedMasterTable.set(tabla);
    if (tabla) {
      this.cargarItemsTabla(tabla.tableCode);
    } else {
      this.itemsList.set([]);
    }
  }

  // Carga los ítems pertenecientes a la tabla maestra seleccionada
  cargarItemsTabla(tableCode: string): void {
    this.controls.operation.loading.set(true);
    this.controls.operation.connectionError.set(false);

    this.tablaMaestraService.getItems(tableCode).subscribe({
      next: (res) => {
        this.itemsList.set(res.data || []);
        this.controls.operation.loading.set(false);
      },
      error: (err) => {
        console.error('Error al cargar ítems de la tabla:', err);
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

  editar(item: MasterTable) {
    this.modalForm()?.abrirEdicion(item);
  }

  activar(item: MasterTable) {
    this.controls.confirmAction.selectedItem.set(item);
    this.controls.confirmAction.selectedAction.set('active');
    this.confirmModal()?.abrir('active', item.denomination);
  }

  desactivar(item: MasterTable) {
    this.controls.confirmAction.selectedItem.set(item);
    this.controls.confirmAction.selectedAction.set('deactive');
    this.confirmModal()?.abrir('deactive', item.denomination);
  }

  eliminar(item: MasterTable) {
    this.controls.confirmAction.selectedItem.set(item);
    this.controls.confirmAction.selectedAction.set('delete');
    this.confirmModal()?.abrir('delete', item.denomination);
  }

  onGuardadoExitoso() {
    this.cargarItemsTabla(this.selectedMasterTable()?.tableCode || '');
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
        request$ = this.tablaMaestraService.activate(item.code);
        break;
      case 'deactive':
        request$ = this.tablaMaestraService.deactivate(item.code);
        break;
      case 'delete':
        request$ = this.tablaMaestraService.delete(item.code);
        break;
      default:
        request$ = this.tablaMaestraService.activate(item.code);
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
