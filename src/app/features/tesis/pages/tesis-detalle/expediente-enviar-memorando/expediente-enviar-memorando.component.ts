import { Component, computed, inject, OnInit, signal, viewChild } from '@angular/core';
import { Router } from '@angular/router';
import { NotificacionService } from '../../../../../shared/services/notificacion.service';
import { ExpedienteWizardStore } from '../expediente-wizard.store';
import { TesisDocumentoService } from '../../../services/tesis-documento.service';
import { ButtonComponent } from '../../../../../shared/components/button/button.component';
import { ContenidoEmailMemo, EnvioCorreo } from '../../../../../shared/models/tramites/contenido-email';
import { ExpedienteArchivo } from '../../../../../shared/models/tramites/expediente.model';
import { TableSkeletonComponent } from '../../../../../shared/components/table-skeleton/table-skeleton.component';
import { NoConnectionComponent } from '../../../../../shared/components/no-connection/no-connection.component';
import { CommonModule } from '@angular/common';
import { FileService } from '../../../../../shared/services/file.service';
import { ConfirmActionType, ConfirmDialogComponent } from '../../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { GlobalLoadingComponent } from '../../../../../shared/components/global-loading/global-loading.component';
import { VerDetalleEnvioComponent } from './ver-detalle-envio/ver-detalle-envio.component';

@Component({
  imports: [ButtonComponent, TableSkeletonComponent, NoConnectionComponent, CommonModule, ConfirmDialogComponent, GlobalLoadingComponent, VerDetalleEnvioComponent],
  selector: 'app-expediente-enviar-memorando',
  styleUrl: './expediente-enviar-memorando.component.css',
  templateUrl: './expediente-enviar-memorando.component.html',
})
export class ExpedienteEnviarMemorandoComponent implements OnInit {
  private readonly modalDetalleEnvio = viewChild<VerDetalleEnvioComponent>('modalDetalleEnvio');
  confirmModal = viewChild<ConfirmDialogComponent>('confirmModal');

  private readonly router = inject(Router);

  private readonly documentoTesisService = inject(TesisDocumentoService);
  private readonly fileService = inject(FileService);
  private readonly notificationService = inject(NotificacionService);

  // ✅ Store compartido — el wizard padre ya cargó tesis y expediente
  protected readonly store = inject(ExpedienteWizardStore);
  readonly tesis = this.store.tesis;
  readonly expediente = this.store.expediente;
  readonly tesisId = this.store.tesisId;        // string | null
  readonly expedienteId = this.store.expedienteId;  // number | null

  readonly loadingOperation = signal(false);
  readonly enviando = signal(false);
  readonly cargandoHistorial = signal(false);
  readonly connectionErrorOperation = signal(false);

  readonly confirmAction = {
    selectedItem: signal<ContenidoEmailMemo | null>(null),
    selectedAction: signal<ConfirmActionType>('delete'),
  };

  readonly contenido = signal<ContenidoEmailMemo | null>(null);
  readonly historial = signal<EnvioCorreo[]>([]);

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

  ngOnInit(): void {
    const idTesis = this.tesisId();
    const exp = this.expediente();
    if (idTesis && exp) {
      this.cargarContenido(exp.id);
      this.cargarHistorial(exp.id);
    }
  }

  cargarContenido(expedienteId: number) {
    this.loadingOperation.set(true);
    this.connectionErrorOperation.set(false);

    this.documentoTesisService.obtenerContenidoEnviar(expedienteId).subscribe({
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

  cargarHistorial(expedienteId: number): void {
    this.cargandoHistorial.set(true);

    this.documentoTesisService
      .listarEnviosPorExpediente(expedienteId)
      .subscribe({
        next: (res) => {
          this.historial.set(res.data ?? []);
          this.cargandoHistorial.set(false);
        },
        error: () => {
          this.cargandoHistorial.set(false);
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

  enviarNotificacion(): void {
    this.confirmAction.selectedItem.set(this.contenido());
    this.confirmAction.selectedAction.set('enviarMemo');
    this.confirmModal()?.abrir('enviarMemo');
  }

  ejecutarAccionConfirmada(): void {
    const contenido = this.confirmAction.selectedItem();
    if (!contenido) return;

    this.confirmModal()?.loading.set(true);
    this.enviando.set(true);

    this.documentoTesisService.enviarMemo(contenido.documentoId).subscribe({
      next: (res) => {
        this.notificationService.showSuccess(res.message || 'Se envio correctamente el expediente a los interesados.');
        this.confirmModal()?.cerrar();
        this.enviando.set(false);
        this.cargarHistorial(this.expedienteId()!);
      },
      error: (err) => {
        this.confirmModal()?.loading.set(false),
          this.enviando.set(false);
        this.notificationService.showError('No se pudo enviar el expediente. Intente nuevamente.' + (err?.error?.message ? ` (${err.error.message})` : ''));
      }
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

  verDetalleEnvio(envio: EnvioCorreo): void {
    this.modalDetalleEnvio()?.abrirModal(envio);
  }

  volverAtras(): void {
    const expedienteId = this.expedienteId();

    if (expedienteId) {
      this.router.navigate([
        '/tesis',
        'detalle',
        this.tesisId(),
        'expediente',
        this.expedienteId(),
        'memorando'
      ]);
    }
  }

  continuarSiguientePaso(): void {
    this.router.navigate([
      '/tesis',
      'detalle',
      this.tesisId(),
      'expediente',
      this.expedienteId(),
      'dictamen'
    ]);
  }

}
