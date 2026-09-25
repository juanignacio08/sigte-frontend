import { Component, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogModule } from '@openng/optimus-ui/dialog';
import { ButtonAction, ButtonComponent } from '../button/button.component';

export type ConfirmActionType = 'active' | 'deactive' | 'delete';

interface ConfirmDialogConfig {
  title: string;
  message: string;
  confirmLabel: string;
  confirmSeverity: 'success' | 'warn' | 'danger';
  icon: string;
  iconBgColor: string;
  iconTextColor: string;
}

@Component({
  imports: [CommonModule, DialogModule, ButtonComponent],
  selector: 'app-confirm-dialog',
  styleUrl: './confirm-dialog.component.css',
  templateUrl: './confirm-dialog.component.html',
})
export class ConfirmDialogComponent {
  // Evento que se dispara al presionar el botón de confirmación
  onConfirm = output<void>();

  visible = signal<boolean>(false);
  loading = signal<boolean>(false);

  // Configuración actual calculada según el tipo de acción
  config = signal<ConfirmDialogConfig>({
    title: '¿Confirmar Acción?',
    message: '¿Está seguro de realizar esta operación?',
    confirmLabel: 'Confirmar',
    confirmSeverity: 'danger',
    icon: 'pi-exclamation-triangle',
    iconBgColor: 'bg-amber-50 dark:bg-amber-950/30',
    iconTextColor: 'text-amber-600 dark:text-amber-400'
  });

  private actionType: ConfirmActionType = 'delete';

  /**
   * Abre el modal configurando los textos, íconos y colores según la acción elegida.
   * @param action 'active' | 'deactive' | 'delete'
   * @param itemName Nombre del elemento (ej. "Departamento de Cirugía")
   */
  abrir(action: ConfirmActionType, itemName: string = 'este registro'): void {
    this.actionType = action;
    this.config.set(this.buildConfig(action, itemName));
    this.visible.set(true);
  }

  confirmar(): void {
    this.onConfirm.emit();
  }

  cerrar(): void {
    this.visible.set(false);
    this.loading.set(false);
  }

  // Mapea la acción al tipo de botón de tu `ButtonComponent`
  protected actionToButtonType(): ButtonAction  {
    switch (this.actionType) {
      case 'active': return 'active';
      case 'deactive': return 'deactive';
      case 'delete': return 'delete';
      default: return 'save';
    }
  }

  // Diccionario de configuraciones por acción
  private buildConfig(action: ConfirmActionType, itemName: string): ConfirmDialogConfig {
    switch (action) {
      case 'active':
        return {
          title: 'Activar Registro',
          message: `¿Está seguro de activar "${itemName}"? El registro volverá a estar disponible en las operaciones del sistema.`,
          confirmLabel: 'Sí, Activar',
          confirmSeverity: 'success',
          icon: 'pi-arrow-circle-up',
          iconBgColor: 'bg-primary-200',
          iconTextColor: 'text-primary-700'
        };

      case 'deactive':
        return {
          title: 'Desactivar Registro',
          message: `¿Está seguro de inhabilitar "${itemName}"? No se podrán realizar operaciones asociadas hasta que vuelva a ser activado.`,
          confirmLabel: 'Sí, Desactivar',
          confirmSeverity: 'warn',
          icon: 'pi-arrow-circle-down',
          iconBgColor: 'bg-warning-100',
          iconTextColor: 'text-warning-700'
        };

      case 'delete':
        return {
          title: '¿Eliminar Registro?',
          message: `¿Está seguro de eliminar permanentemente "${itemName}"? Esta acción no se puede deshacer.`,
          confirmLabel: 'Sí, Eliminar',
          confirmSeverity: 'danger',
          icon: 'pi-trash',
          iconBgColor: 'bg-danger-100',
          iconTextColor: 'text-danger-700'
        };
    }
  }
}
