import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

export type BadgeVariant = 
  | 'success' 
  | 'danger' 
  | 'warning' 
  | 'info' 
  | 'primary' 
  | 'secondary' 
  | 'active' 
  | 'inactive' 
  | 'outline';

export type BadgeSize = 'sm' | 'md' | 'lg';

interface StateConfig {
  variantClasses: string;
  dotColorClass: string;
  defaultText: string;
}

// Mapeo predefinido para variantes y estados comunes
const VARIANT_CONFIGS: Record<BadgeVariant, StateConfig> = {
  success: {
    variantClasses: 'bg-sky-100 text-sky-800 border-sky-200',
    dotColorClass: 'bg-sky-500',
    defaultText: 'Éxito'
  },
  active: {
    variantClasses: 'bg-emerald-200 text-emerald-800 border-emerald-300',
    dotColorClass: 'bg-emerald-500',
    defaultText: 'Activo'
  },
  danger: {
    variantClasses: 'bg-danger-100 text-danger-800 border-danger-300',
    dotColorClass: 'bg-danger-500',
    defaultText: 'Error'
  },
  inactive: {
    variantClasses: 'bg-slate-300 text-slate-700 border-slate-200',
    dotColorClass: 'bg-slate-500',
    defaultText: 'Inactivo'
  },
  warning: {
    variantClasses: 'bg-warning-100 text-warning-900 border-warning-300',
    dotColorClass: 'bg-warning-500',
    defaultText: 'Advertencia'
  },
  info: {
    variantClasses: 'bg-info-50 text-info-700 border-info-200',
    dotColorClass: 'bg-info-500',
    defaultText: 'Información'
  },
  primary: {
    variantClasses: 'bg-primary-100 text-primary-700 border-primary-200',
    dotColorClass: 'bg-primary-500',
    defaultText: 'Principal'
  },
  secondary: {
    variantClasses: 'bg-secondary-100 text-secondary-800 border-secondary-400',
    dotColorClass: 'bg-secondary-500',
    defaultText: 'Secundario'
  },
  outline: {
    variantClasses: 'bg-transparent text-info-700 border-info-200',
    dotColorClass: 'bg-info-500',
    defaultText: ''
  }
};

@Component({
  selector: 'app-badge',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './badge.component.html'
})
export class BadgeComponent {
  /** Variante estética o estado */
  @Input() variant: BadgeVariant = 'primary';
  
  /** Tamaño del badge */
  @Input() size: BadgeSize = 'md';
  
  /** Muestra un circulito indicador antes del texto */
  @Input() withDot: boolean = false;
  
  /** Permite cambiar el color del circulito por una clase personalizada de Tailwind (ej: 'bg-purple-500') */
  @Input() customDotClass?: string;
  
  /** Icono de PrimeIcons / Optimus (ej: 'pi-check', 'pi-shield') */
  @Input() icon?: string;
  
  /** Define si el badge es una píldora totalmente redondeada (rounded-full) o un rectángulo suave (rounded-md) */
  @Input() pill: boolean = true;

  /** Hace que el borde sea visible */
  @Input() bordered: boolean = false;

  get badgeClasses(): string {
    const config = VARIANT_CONFIGS[this.variant] || VARIANT_CONFIGS.primary;
    const border = this.bordered ? 'border' : '';
    const rounded = this.pill ? 'rounded-full' : 'rounded-md';

    let sizeClass = 'px-2.5 py-1 text-sm';
    if (this.size === 'sm') sizeClass = 'px-2 py-1 text-xs';
    if (this.size === 'lg') sizeClass = 'px-3 py-1.5 text-base';

    return `${config.variantClasses} ${border} ${rounded} ${sizeClass}`;
  }

  get effectiveDotClass(): string {
    if (this.customDotClass) return this.customDotClass;
    return VARIANT_CONFIGS[this.variant]?.dotColorClass || 'bg-slate-500';
  }

  get defaultText(): string {
    return VARIANT_CONFIGS[this.variant]?.defaultText || '';
  }

  get dotSizeClass(): string {
    switch (this.size) {
      case 'sm': return 'w-1 h-1';
      case 'lg': return 'w-2 h-2';
      default: return 'w-1.5 h-1.5';
    }
  }
}