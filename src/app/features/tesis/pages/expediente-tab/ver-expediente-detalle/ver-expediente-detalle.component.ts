import { Component, effect, inject, input, signal } from '@angular/core';
import { DialogModule } from '@openng/optimus-ui/dialog';
import { ButtonComponent } from '../../../../../shared/components/button/button.component';
import { TesisExpedienteService } from '../../../services/tesis-expediente.service';
import { Expediente } from '../../../../../shared/models/tramites/expediente.model';
import { CommonModule } from '@angular/common';
import { LoadingSpinnerComponent } from '../../../../../shared/components/loading-spinner/loading-spinner.component';
import { FileService } from '../../../../../shared/services/file.service';
import { NotificacionService } from '../../../../../shared/services/notificacion.service';

@Component({
  imports: [DialogModule, ButtonComponent, CommonModule, LoadingSpinnerComponent],
  selector: 'app-ver-expediente-detalle',
  styleUrl: './ver-expediente-detalle.component.css',
  templateUrl: './ver-expediente-detalle.component.html',
})
export class VerExpedienteDetalleComponent {
  private readonly expedienteService = inject(TesisExpedienteService);
  private readonly fileService = inject(FileService);
  private readonly notificationService = inject(NotificacionService);

  visible = signal<boolean>(false);
  loading = signal<boolean>(false);
  expediente = signal<Expediente | null>(null);

  abrir(id: number): void {
    this.cargarDetalle(id);
  }

  cargarDetalle(id: number): void {
    this.loading.set(true);
    this.visible.set(true);

    this.expedienteService.obtenerPorId(id).subscribe({
      next: (res) => {
        this.expediente.set(res.data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error al cargar detalle del expediente:', err);
        this.loading.set(false);
      }
    });
  }

  cerrar(): void {
    this.visible.set(false);
    this.expediente.set(null);
  }

  mostrarPdf(ruta: string | null): void {
    if (!ruta) return;

    // Abrimos la pestaña SÍNCRONAMENTE para que el navegador no la bloquee
    const win = window.open('', '_blank');

    this.fileService.descargarPdf(ruta).subscribe({
      next: (blob: Blob) => {
        const url = URL.createObjectURL(blob);

        if (win) {
          win.location.href = url;
        } else {
          // Fallback si el popup fue bloqueado
          window.open(url, '_blank');
        }

        // ⚠️ NO revoques inmediatamente: la pestaña aún está cargando el blob.
        setTimeout(() => URL.revokeObjectURL(url), 60_000);
      },
      error: (err) => {
        win?.close();
        console.error('Error al abrir el PDF:', err);
        this.notificationService.showError('No se pudo abrir el archivo.');
      }
    });
  }
}
