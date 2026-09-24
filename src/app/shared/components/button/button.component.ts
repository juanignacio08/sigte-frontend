import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TooltipModule } from '@openng/optimus-ui/tooltip';

export type ButtonAction = 
  | 'new' 
  | 'edit' 
  | 'view' 
  | 'active' 
  | 'deactive' 
  | 'delete' 
  | 'save' 
  | 'cancel' 
  | 'download-pdf' 
  | 'download-xlsx' 
  | 'download-doc' 
  | 'default';

export type ButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'success' | 'danger' | 'warning' | 'info' | 'pdf' | 'word' | 'excel' | 'active' | 'deactive' | 'outline';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ActionConfig {
  variant: ButtonVariant;
  icon: string;
  defaultText: string;
}

// Diccionario con las reglas de cada acción
const ACTION_CONFIGS: Record<ButtonAction, ActionConfig | null> = {
  'new': { variant: 'secondary', icon: 'pi-plus', defaultText: 'Nuevo' },
  'edit': { variant: 'tertiary', icon: 'pi-pen-to-square', defaultText: 'Editar' },
  'view': { variant: 'info', icon: 'pi-folder-open', defaultText: 'Ver' },
  'active': { variant: 'active', icon: 'pi-arrow-circle-up', defaultText: 'Activar' },
  'deactive': { variant: 'deactive', icon: 'pi-arrow-circle-down', defaultText: 'Desactivar' },
  'delete': { variant: 'danger', icon: 'pi-trash', defaultText: 'Eliminar' },
  'save': { variant: 'success', icon: 'pi-save', defaultText: 'Guardar' },
  'cancel': { variant: 'outline', icon: 'pi-ban', defaultText: 'Cancelar' },
  'download-pdf': { variant: 'pdf', icon: 'pi-file-pdf', defaultText: 'Exportar PDF' },
  'download-xlsx': { variant: 'excel', icon: 'pi-file-excel', defaultText: 'Exportar Excel' },
  'download-doc': { variant: 'word', icon: 'pi-file-word', defaultText: 'Exportar Word' },
  'default': null
};

@Component({
  standalone: true,
  imports: [CommonModule, TooltipModule],
  selector: 'app-button',
  styleUrl: './button.component.css',
  templateUrl: './button.component.html',
})
export class ButtonComponent {
  @Input() variant?: ButtonVariant;
  @Input() size: ButtonSize = 'md';
  @Input() type: 'button' | 'submit' | 'reset' = 'button';
  @Input() disabled: boolean = false;
  @Input() loading: boolean = false;
  @Input() icon?: string;
  @Input() action: ButtonAction = 'default';
  @Input() withIcon: boolean = false;
  @Input() onlyIcon: boolean = false;
  @Input() messageTootip ?: string;

  @Output() onClick = new EventEmitter<MouseEvent>();

  readonly variantClasses: Record<ButtonVariant, string> = {
    primary: 'bg-primary-800 text-white hover:bg-primary-700',
    secondary: 'bg-secondary-700 text-white hover:bg-secondary-800',
    tertiary: 'bg-tertiary text-white hover:bg-tertiary-700',
    success: 'bg-success text-white hover:bg-primary-600',
    danger: 'bg-danger-600 text-white hover:bg-danger-700',
    warning: 'bg-warning-500 text-white hover:bg-warning-600',
    info: 'bg-info text-black border border-info-200 hover:bg-info-300',
    active: 'bg-primary-300 text-white hover:bg-primary-400',
    deactive: 'bg-info-400 text-white hover:bg-info-500',
    pdf: 'bg-danger-700 text-white hover:bg-warning-800',
    word: 'bg-success text-white hover:bg-primary-600',
    excel: 'bg-secondary-600 text-secondary-900 border border-secondary hover:bg-secondary-700',
    outline: 'border border-slate-300 text-slate-700 hover:bg-slate-50'
  };

  get sizeClasses(): string {
    if (this.onlyIcon) {
      // Usamos dimensiones exactas y 'aspect-square' para garantizar la forma de cuadrado perfecto
      switch (this.size) {
        case 'sm': return 'w-8 h-8 p-0 text-xs aspect-square shrink-0';
        case 'lg': return 'w-10 h-10 p-0 text-base aspect-square shrink-0';
        case 'md': return 'w-9 h-9 p-0 text-sm aspect-square shrink-0';
        default: return 'w-9 h-9 p-0 text-sm aspect-square shrink-0';
      }
    }

    switch (this.size) {
      case 'sm': return 'px-2.5 py-1 text-xs';
      case 'lg': return 'px-4 py-2 text-base';
      case 'md': return 'px-3 py-1.5 text-sm';
      default: return 'px-3 py-1.5 text-sm';
    }
  }

  // Getter de la variante efectiva
  get effectiveVariant(): ButtonVariant {
    if (this.variant) return this.variant;
    const config = ACTION_CONFIGS[this.action];
    return config ? config.variant : 'primary';
  }

  // Getter del icono efectivo (activa el icono si onlyIcon o withIcon son true)
  get effectiveIcon(): string | undefined {
    if (this.icon) return this.icon; 
    if ((this.withIcon || this.onlyIcon) && this.action !== 'default') {
      return ACTION_CONFIGS[this.action]?.icon;
    }
    return undefined;
  }

  // Getter del texto por defecto
  get defaultText(): string {
    if (this.action !== 'default') {
      return ACTION_CONFIGS[this.action]?.defaultText || '';
    }
    return '';
  }
}