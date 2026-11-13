import { Component, computed, inject, input, output, signal } from '@angular/core';
import { FileService } from '../../../../../../shared/services/file.service';
import { NotificacionService } from '../../../../../../shared/services/notificacion.service';
import { TesisDocumentoService } from '../../../../services/tesis-documento.service';
import { ContenidoEmailMemo } from '../../../../../../shared/models/tramites/contenido-email';
import { DialogModule } from '@openng/optimus-ui/dialog';
import { CommonModule } from '@angular/common';
import { ExpedienteArchivo } from '../../../../../../shared/models/tramites/expediente.model';
import { ButtonComponent } from '../../../../../../shared/components/button/button.component';
import { GlobalLoadingComponent } from '../../../../../../shared/components/global-loading/global-loading.component';
import { TableSkeletonComponent } from '../../../../../../shared/components/table-skeleton/table-skeleton.component';

@Component({
  imports: [DialogModule, CommonModule, ButtonComponent, GlobalLoadingComponent, TableSkeletonComponent],
  selector: 'app-enviar-resolucion',
  styleUrl: './enviar-resolucion.component.css',
  templateUrl: './enviar-resolucion.component.html',
})
export class EnviarResolucionComponent {

  onSuccess = output<void>();

  private readonly documentoTesisService = inject(TesisDocumentoService);
  private readonly fileService = inject(FileService);
  private readonly notificationService = inject(NotificacionService);

  readonly visible = signal(false);
  readonly loadingOperation = signal(false);
  readonly enviando = signal(false);
  readonly connectionErrorOperation = signal(false);

  readonly contenido = signal<ContenidoEmailMemo | null>(null);

  readonly destinatarios = computed(
    () => this.contenido()?.destinatarios ?? []
  );

  readonly archivos = computed(
    () => this.contenido()?.archivos ?? []
  );

  readonly asunto = computed(
    () => this.contenido()?.asunto ?? ''
  );

  readonly cuerpo = computed(
    () => this.contenido()?.cuerpo ?? ''
  );

  readonly pesoTotal = computed(() =>
    this.archivos().reduce(
      (total, archivo) => total + archivo.tamanioBytes,
      0
    )
  );

  abrir(documentoId: number | null | undefined): void {
    if (!documentoId) {
      this.notificationService.showWarn('Falta el documento a enviar');
      return;
    }
    this.visible.set(true);
    this.cargarContenido(documentoId);
  }

  cerrarModal(): void {
    this.contenido.set(null);
    this.visible.set(false);
  }

  cargarContenido(documentoId: number) {
    if (!documentoId) {
      return;
    }

    this.loadingOperation.set(true);
    this.connectionErrorOperation.set(false);
    this.documentoTesisService.obtenerContenidoResolucionEnviar(documentoId).subscribe({
      next: (response) => {
        this.contenido.set(response.data);
        this.loadingOperation.set(false);
      },
      error: (err) => {
        this.contenido.set(null);
        this.loadingOperation.set(false);
        if (err.status === 404) {
          this.notificationService.showInfo('No se encontró un Memorandum. Genere una nueva…');
        } else if (err.status === 0) {
          this.connectionErrorOperation.set(true);
        } else {
          this.notificationService.showError('No se pudo cargar el Memorandum... Intente nuevamente.');
        }
      }
    });
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

  enviarEmail() {
    if (this.contenido()) {
      this.enviando.set(true);

      this.documentoTesisService.enviarResolucionProyecto(this.contenido()!.documentoId).subscribe({
        next: (res) => {
          this.notificationService.showSuccess(res.message || 'Se envio correctamente la resolucion a los interesados.');
          this.enviando.set(false);
          this.onSuccess.emit();
          this.cerrarModal();
        },
        error: (err) => {
          this.enviando.set(false);
          this.notificationService.showError('No se pudo enviar el expediente. Intente nuevamente.' + (err?.error?.message ? ` (${err.error.message})` : ''));
        }
      });
    }
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

}
