import { Component, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogModule } from '@openng/optimus-ui/dialog';
import { ButtonAction, ButtonComponent } from '../button/button.component';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputTextModule } from '@openng/optimus-ui/inputtext';

export type ConfirmActionType = 'active' | 'deactive' | 'delete' | 'volverAGenerarMemo';

interface ConfirmDialogConfig {
  title: string;
  message: string;
  confirmLabel: string;
  confirmSeverity: 'success' | 'warn' | 'danger' | 'info';
  icon: string;
  iconBgColor: string;
  iconTextColor: string;
}

@Component({
  imports: [CommonModule, DialogModule, ReactiveFormsModule, InputTextModule, ButtonComponent],
  selector: 'app-confirm-dialog',
  styleUrl: './confirm-dialog.component.css',
  templateUrl: './confirm-dialog.component.html',
})
export class ConfirmDialogComponent {
  private readonly fb = new FormBuilder();

  // Evento que se dispara al presionar el botón de confirmación
  onConfirm = output<string | void>();

  visible = signal<boolean>(false);
  loading = signal<boolean>(false);

  // Controla si se debe mostrar el input de motivo
  requiereMotivo = signal<boolean>(false);

  form: FormGroup = this.fb.group({
    motivo: ['']
  });

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
   * Abre el modal de confirmación.
   * @param action Tipo de acción ('active' | 'deactive' | 'delete')
   * @param itemName Nombre del elemento
   * @param pedirMotivo Booleano opcional (por defecto false). Si es true y la acción es 'deactive', pide el motivo.
   */
  abrir(action: ConfirmActionType, itemName: string = 'este registro', pedirMotivo: boolean = false): void {
    this.actionType = action;
    this.requiereMotivo = signal<boolean>(action === 'deactive' && pedirMotivo);
    
    // Configuramos validadores dinámicos si se requiere motivo
    if (this.requiereMotivo()) {
      this.form.get('motivo')?.setValidators([Validators.required, Validators.minLength(5)]);
    } else {
      this.form.get('motivo')?.clearValidators();
    }
    this.form.get('motivo')?.updateValueAndValidity();
    this.form.reset();

    this.config.set(this.buildConfig(action, itemName));
    this.visible.set(true);
  }

  confirmar(): void {
    if (this.requiereMotivo() && this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const motivoValue = this.form.get('motivo')?.value;
    
    // Si requiere motivo, enviamos el texto ingresado, caso contrario ejecutamos normal
    if (this.requiereMotivo()) {
      this.onConfirm.emit(motivoValue);
    } else {
      this.onConfirm.emit();
    }
  }

  cerrar(): void {
    this.visible.set(false);
    this.loading.set(false);
    this.form.reset();
  }

  // Mapea la acción al tipo de botón de tu `ButtonComponent`
  protected actionToButtonType(): ButtonAction {
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

      case 'volverAGenerarMemo':
        return {
          title: '¿Volver a Generar Memorando?',
          message: `¿Está seguro de volver a generar el memorando "${itemName}"?`,
          confirmLabel: 'Sí, Volver a Generar',
          confirmSeverity: 'info',
          icon: 'pi-refresh',
          iconBgColor: 'bg-info-100',
          iconTextColor: 'text-info-700'
        };
    }
  }
}
