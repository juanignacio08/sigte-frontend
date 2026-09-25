import { inject, Service } from '@angular/core';
import { MessageService } from '@openng/optimus-ui/api';

@Service()
export class NotificacionService {
    private readonly messageService = inject(MessageService);

    /**
   * Muestra un mensaje de éxito (Toast verde)
   */
    showSuccess(detail: string, summary: string = '¡Éxito!'): void {
        this.messageService.add({
            severity: 'success',
            summary,
            detail,
            life: 4000
        });
    }

    /**
     * Muestra un mensaje de información
     */
    showInfo(detail: string, summary: string = 'Información'): void {
        this.messageService.add({
            severity: 'info',
            summary,
            detail,
            life: 4000
        });
    }

    /**
     * Muestra un mensaje de advertencia
     */
    showWarn(detail: string, summary: string = 'Advertencia'): void {
        this.messageService.add({
            severity: 'warn',
            summary,
            detail,
            life: 5000
        });
    }

    /**
     * Muestra un mensaje de error personalizado
     */
    showError(detail: string, summary: string = 'Error'): void {
        this.messageService.add({
            severity: 'error',
            summary,
            detail,
            life: 5000
        });
    }
}
