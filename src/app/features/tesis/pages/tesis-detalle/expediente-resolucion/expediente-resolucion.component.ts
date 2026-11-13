import { Component, inject, OnInit, signal, viewChild } from '@angular/core';
import { ConfirmActionType, ConfirmDialogComponent } from '../../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { Router } from '@angular/router';
import { FileService } from '../../../../../shared/services/file.service';
import { TesisDocumentoService } from '../../../services/tesis-documento.service';
import { NotificacionService } from '../../../../../shared/services/notificacion.service';
import { ExpedienteWizardStore } from '../expediente-wizard.store';
import { DocumentoTesis } from '../../../../../shared/models/tramites/documento-tesis.model';
import { GlobalLoadingComponent } from '../../../../../shared/components/global-loading/global-loading.component';
import { TableSkeletonComponent } from '../../../../../shared/components/table-skeleton/table-skeleton.component';
import { NoConnectionComponent } from '../../../../../shared/components/no-connection/no-connection.component';
import { ButtonComponent } from '../../../../../shared/components/button/button.component';
import { Divider } from '@openng/optimus-ui/divider';
import { CommonModule } from '@angular/common';
import { EnvioCorreo } from '../../../../../shared/models/tramites/contenido-email';
import { GenerarResolucionProyectoComponent } from './generar-resolucion-proyecto/generar-resolucion-proyecto.component';
import { EnviarResolucionComponent } from './enviar-resolucion/enviar-resolucion.component';
import { VerDetalleEnvioComponent } from '../expediente-enviar-memorando/ver-detalle-envio/ver-detalle-envio.component';

@Component({
  imports: [
    GlobalLoadingComponent,
    TableSkeletonComponent,
    NoConnectionComponent,
    ButtonComponent,
    Divider,
    CommonModule,
    ConfirmDialogComponent,
    GenerarResolucionProyectoComponent,
    EnviarResolucionComponent,
    VerDetalleEnvioComponent
  ],
  selector: 'app-expediente-resolucion',
  styleUrl: './expediente-resolucion.component.css',
  templateUrl: './expediente-resolucion.component.html',
})
export class ExpedienteResolucionComponent implements OnInit {
  private readonly modalDetalleEnvio = viewChild<VerDetalleEnvioComponent>('modalDetalleEnvio');
  private readonly modalRes = viewChild<GenerarResolucionProyectoComponent>('modalRes');
  private readonly modalEnvioRes = viewChild<EnviarResolucionComponent>('modalEnvioRes');
  confirmModal = viewChild<ConfirmDialogComponent>('confirmModal');

  private readonly router = inject(Router);

  private readonly fileService = inject(FileService);
  private readonly documentoTesisService = inject(TesisDocumentoService);
  private readonly notificationService = inject(NotificacionService);

  // ✅ Store compartido — el wizard padre ya cargó tesis y expediente
  protected readonly store = inject(ExpedienteWizardStore);
  readonly tesis = this.store.tesis;
  readonly expediente = this.store.expediente;
  readonly tesisId = this.store.tesisId;        // string | null
  readonly expedienteId = this.store.expedienteId;  // number | null

  readonly loadingOperation = signal(false);
  readonly connectionErrorOperation = signal(false);
  readonly loadingGlobal = signal(false);
  readonly cargandoHistorial = signal(false);

  confirmAction = { selectedItem: signal<DocumentoTesis | null>(null), selectedAction: signal<ConfirmActionType>('delete') }
  documento = signal<DocumentoTesis | null>(null);
  readonly historial = signal<EnvioCorreo[]>([]);

  readonly documentoId = signal<number | null>(null);

  ngOnInit(): void {
    const idTesis = this.tesisId();
    const exp = this.expediente();
    if (idTesis && exp) {
      this.cargarResolucionProyecto(exp.id);
    }
  }

  cargarResolucionProyecto(expedienteId: number) {
    this.loadingOperation.set(true);
    this.connectionErrorOperation.set(false);
    this.cargandoHistorial.set(true);

    this.documentoTesisService.obtenerResolucionProyecto(expedienteId).subscribe({
      next: (response) => {
        this.documento.set(response.data);
        this.documentoId.set(response.data.id);
        this.cargarHistorial(this.documentoId());
        this.loadingOperation.set(false);
      },
      error: (err) => {
        this.documento.set(null);
        this.loadingOperation.set(false);
        if (err.status === 404) {
          this.notificationService.showInfo('No se encontró una Resolucion. Genere una nueva…');
        } else if (err.status === 0) {
          this.connectionErrorOperation.set(true);
        } else {
          this.notificationService.showError('No se pudo cargar la Resolucion... Intente nuevamente.');
        }
      }
    });
  }

  generarResolucionModal() {
    this.modalRes()?.abrir();
  }

  descargarWord(ruta: string | undefined | null, nombrePorDefecto: string): void {
    if (!ruta) return;

    this.fileService.descargarWord(ruta).subscribe({
      next: (blob: Blob) => {
        // Crear un objeto URL para forzar la descarga en el navegador
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = nombrePorDefecto;
        document.body.appendChild(a);
        a.click();

        // Limpiar recurso de memoria
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      },
      error: (err) => {
        console.error('Error al descargar el memorandum en word:', err);
        this.notificationService.showError('No se pudo descargar el archivo.');
      }
    });
  }

  mostrarPdf(ruta: string | null | undefined): void {
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

  eliminar() {
    if (!this.documento()) return;
    this.confirmAction.selectedItem.set(this.documento());
    this.confirmAction.selectedAction.set('delete');
    this.confirmModal()?.abrir('delete', this.buildNombreArchivo(this.documento()!));
  }

  volverAGenerarResolucion() {
    if (!this.documento()) return;
    this.confirmAction.selectedItem.set(this.documento());
    this.confirmAction.selectedAction.set('volverAGenerarResolucion');
    this.confirmModal()?.abrir('volverAGenerarResolucion', this.buildNombreArchivo(this.documento()!));
  }

  ejecutarAccionConfirmada(): void {
    const resolucion = this.confirmAction.selectedItem();
    const action = this.confirmAction.selectedAction();

    if (!resolucion) return;

    // Activamos el spinner en el botón de confirmación
    this.confirmModal()?.loading.set(true);
    this.loadingGlobal.set(true);
    let request$;
    switch (action) {
      case 'volverAGenerarResolucion':
        request$ = this.documentoTesisService.volverAGenerarResolucionProyecto(resolucion.id);
        break;
      case 'delete':
        request$ = this.documentoTesisService.eliminarResolucion(resolucion.id);
        break;
      default:
        request$ = this.documentoTesisService.eliminarResolucion(resolucion.id);
        break;
    }

    request$.subscribe({
      next: (res) => {
        this.notificationService.showSuccess(res.message);
        this.loadingGlobal.set(false);
        this.confirmModal()?.cerrar();
        this.onResolucionGenerado();
      },
      error: () => {
        this.confirmModal()?.loading.set(false);
        this.loadingGlobal.set(false);
      }
    });

  }

  onResolucionGenerado(): void {
    const expedienteId = this.expedienteId();
    if (expedienteId !== null) {
      this.cargarResolucionProyecto(expedienteId);
    }
  }

  enviarEmail() {
    if (!this.documento()) {
      return;
    }

    this.modalEnvioRes()?.abrir(this.documento()?.id);
  }

  cargarHistorial(documentoId: number | undefined | null): void {
    if (!documentoId) {
      return;
    }
    this.cargandoHistorial.set(true);

    this.documentoTesisService
      .listarEnviosPorDocumento(documentoId)
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

  buildNombreArchivo(resolucion: DocumentoTesis): string {
    const tesis = this.tesis();
    const expediente = this.expediente();
    if (!tesis || !expediente) return 'memorando.docx';

    const numeroCorrelacional = resolucion.numeroCorrelativo;
    const anio = resolucion.anioCorrelativo;

    return `RD N° ${numeroCorrelacional}-${anio}-UNSCH-FCSA-D`;
  }

  parseIntToString(value: number | undefined | null): string {
    if (value === null || value === undefined) {
      return '';
    }
    return value.toString().padStart(3, '0');
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
        'dictamen'
      ]);
    }
  }

  finalizar(): void {
    if (this.documento()) {
      if (this.historial().length === 0) {
        this.notificationService.showWarn('Para finalizar el tramite debe de enviar la resolución a los interesados!');
      } else {
        this.notificationService.showSuccess('Tramite finalizado correctamente!')
        this.router.navigate([
          '/tesis',
          'detalle',
          this.tesisId()
        ]);
      }
    }
  }

}
