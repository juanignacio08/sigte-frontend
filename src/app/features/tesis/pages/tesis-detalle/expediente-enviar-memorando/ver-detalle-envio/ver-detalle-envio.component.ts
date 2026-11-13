import { Component, inject, signal } from '@angular/core';
import { DialogModule } from '@openng/optimus-ui/dialog';
import { EnvioCorreo } from '../../../../../../shared/models/tramites/contenido-email';
import { CommonModule } from '@angular/common';
import { ExpedienteArchivo } from '../../../../../../shared/models/tramites/expediente.model';
import { FileService } from '../../../../../../shared/services/file.service';
import { NotificacionService } from '../../../../../../shared/services/notificacion.service';

@Component({
  imports: [DialogModule, CommonModule],
  selector: 'app-ver-detalle-envio',
  styleUrl: './ver-detalle-envio.component.css',
  templateUrl: './ver-detalle-envio.component.html',
})
export class VerDetalleEnvioComponent {

  private readonly fileService = inject(FileService);
  private readonly notificationService = inject(NotificacionService);

  envioSeleccionado = signal<EnvioCorreo | null>(null);

  readonly visible = signal(false);

  abrirModal(envioSeleccionado: EnvioCorreo): void {
    this.envioSeleccionado.set(envioSeleccionado);
    this.visible.set(true);
  }

  descargarArchivo(archivo: ExpedienteArchivo): void {
    const ruta = archivo.archivoUrl;

    if (!ruta) return;

    const win = window.open('', '_blank');

    this.fileService.descargarPdf(ruta).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        if (win) win.location.href = url;
        else window.open(url, '_blank');
        setTimeout(() => URL.revokeObjectURL(url), 60_000);
      },
      error: (err) => {
        win?.close();
        console.error('Error al abrir el PDF:', err);
        this.notificationService.showError('No se pudo abrir el archivo.');
      },
    });
  }

  obtenerIniciales(nombre: string): string {
    return nombre
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map(palabra => palabra.charAt(0))
      .join('')
      .toUpperCase();
  }

  obtenerColorAvatar(nombre: string): string {
    const colores = [
      'bg-blue-600 text-white',
      'bg-gray-600 text-white',
      'bg-sky-600 text-white',
      'bg-red-600 text-white'
    ];

    const indice = nombre.length % colores.length;
    return colores[indice];
  }

  obtenerExtension(nombre: string): string {
    return nombre.split('.').pop()?.toUpperCase() ?? 'ARCHIVO';
  }

  obtenerIconoArchivo(nombre: string): string {
    const extension = this.obtenerExtension(nombre);

    if (extension === 'PDF') return 'pi pi-file-pdf';
    if (['DOC', 'DOCX'].includes(extension)) return 'pi pi-file-word';

    return 'pi pi-file';
  }

  obtenerClaseArchivo(nombre: string): string {
    const extension = this.obtenerExtension(nombre);

    if (extension === 'PDF') {
      return 'bg-red-100 text-red-600';
    }

    if (['DOC', 'DOCX'].includes(extension)) {
      return 'bg-blue-100 text-blue-700';
    }

    return 'bg-slate-100 text-slate-600';
  }

  formatearBytes(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(0)} KB`;

    return `${(bytes / 1048576).toFixed(2)} MB`;
  }

  obtenerClaseRol(rol: string): string {
    const clases: Record<string, string> = {
      PRESIDENTE: 'bg-blue-900 text-white',
      MIEMBRO: 'bg-indigo-100 text-indigo-800',
      ASESOR: 'bg-green-400 text-sky-800',
      SECRETARIO: 'bg-red-400 text-red-800',
      AUTOR: 'bg-gray-400 text-gray-800',
    };

    return clases[rol.toUpperCase()] ?? 'bg-slate-100 text-slate-700';
  }

  obtenerClaseEstado(estado: string): string {
    const clases: Record<string, string> = {
      ENVIADO: 'bg-emerald-100 text-emerald-700',
      PARCIAL: 'bg-amber-100 text-amber-700',
      FALLIDO: 'bg-red-100 text-red-700'
    };

    return clases[estado.toUpperCase()] ??
      'bg-slate-100 text-slate-600';
  }

  obtenerIconoEstado(estado: string): string {
    const iconos: Record<string, string> = {
      ENVIADO: 'pi pi-check',
      PARCIAL: 'pi pi-exclamation-triangle',
      FALLIDO: 'pi pi-times'
    };

    return iconos[estado.toUpperCase()] ?? 'pi pi-clock';
  }

  cerrarModal(): void {
    this.visible.set(false);
  }
}
