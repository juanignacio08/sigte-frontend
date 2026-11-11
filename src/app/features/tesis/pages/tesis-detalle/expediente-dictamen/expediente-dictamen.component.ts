import { Component, computed, inject, OnInit, signal, viewChild } from '@angular/core';
import { ConfirmActionType, ConfirmDialogComponent } from '../../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { Router } from '@angular/router';
import { TesisDocumentoService } from '../../../services/tesis-documento.service';
import { FileService } from '../../../../../shared/services/file.service';
import { NotificacionService } from '../../../../../shared/services/notificacion.service';
import { ExpedienteWizardStore } from '../expediente-wizard.store';
import { DocumentoTesis } from '../../../../../shared/models/tramites/documento-tesis.model';
import { TableSkeletonComponent } from '../../../../../shared/components/table-skeleton/table-skeleton.component';
import { NoConnectionComponent } from '../../../../../shared/components/no-connection/no-connection.component';
import { ButtonComponent } from '../../../../../shared/components/button/button.component';
import { CommonModule } from '@angular/common';
import { RegistrarDictamenComponent } from './registrar-dictamen/registrar-dictamen.component';
import { TablaMaestraService } from '../../../../configuracion/services/tabla-maestra.service';

@Component({
  imports: [CommonModule, TableSkeletonComponent, NoConnectionComponent, ButtonComponent, RegistrarDictamenComponent, ConfirmDialogComponent],
  selector: 'app-expediente-dictamen',
  styleUrl: './expediente-dictamen.component.css',
  templateUrl: './expediente-dictamen.component.html',
})
export class ExpedienteDictamenComponent implements OnInit {
  modalDictamen = viewChild<RegistrarDictamenComponent>('modalDictamen');
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
  readonly connectionErrorOperation = signal(false);

  readonly confirmAction = {
    selectedItem: signal<DocumentoTesis | null>(null),
    selectedAction: signal<ConfirmActionType>('delete'),
  };

  readonly dictamen = signal<DocumentoTesis | null>(null);

  readonly tieneDictamen = computed(() => this.dictamen() !== null);
  readonly dictamenAprobado = TablaMaestraService.resultDocumenApproved;

  readonly archivoDictamen = computed(() => {
    const dictamen = this.dictamen();

    if (!dictamen) return null;

    if (dictamen.archivoPdfUrl) {
      return {
        url: dictamen.archivoPdfUrl,
        nombre: dictamen.archivoPdfUrl.split('/').pop() ?? 'Dictamen.pdf',
        extension: 'PDF',
        tamanio: dictamen.tamanioBytesPdf
      };
    }

    if (dictamen.archivoWordUrl) {
      return {
        url: dictamen.archivoWordUrl,
        nombre: dictamen.archivoWordUrl.split('/').pop() ?? 'Dictamen.docx',
        extension: 'WORD',
        tamanio: dictamen.tamanioBytesWord
      };
    }

    return null;
  });

  constructor() { }

  ngOnInit(): void {
    const idTesis = this.tesisId();
    const exp = this.expediente();
    if (idTesis && exp) {
      this.cargarDictamen(exp.id);
    }
  }

  cargarDictamen(expedienteId: number): void {
    this.loadingOperation.set(true);
    this.connectionErrorOperation.set(false);

    this.documentoTesisService.obtenerDictamen(expedienteId).subscribe({
      next: (response) => {
        this.dictamen.set(response.data);
        this.loadingOperation.set(false);
      },
      error: (err) => {
        this.dictamen.set(null);
        this.loadingOperation.set(false);
        if (err.status === 404) {
          this.notificationService.showInfo('No se encontró un Dictamen. Registre uno nuevo…');
        } else if (err.status === 0) {
          this.connectionErrorOperation.set(true);
        } else {
          this.notificationService.showError(
            'No se pudo consultar el dictamen del expediente.'
          );
        }
      }
    });
  }

  abrirRegistro(): void {
    console.log("Sss");

    this.modalDictamen()?.abrirModal();
  }

  eliminarDictamen(): void {
    if (!this.dictamen()) return;
    this.confirmAction.selectedItem.set(this.dictamen());
    this.confirmAction.selectedAction.set('delete');
    this.confirmModal()?.abrir('delete', 'el dictamen');
  }

  ejecutarAccionConfirmada() {
    const dictamen = this.confirmAction.selectedItem();
    const action = this.confirmAction.selectedAction();

    if (this.expedienteId() == null) { return };
    if (!dictamen) return;

    // Activamos el spinner en el botón de confirmación
    this.confirmModal()?.loading.set(true);
    let request$;
    switch (action) {
      case 'delete':
        request$ = this.documentoTesisService.eliminarDictamen(this.expedienteId()!);
        break;
      default:
        request$ = this.documentoTesisService.eliminarDictamen(this.expedienteId()!);
        break;
    }

    request$.subscribe({
      next: (res) => {
        this.notificationService.showSuccess(res.message);
        this.confirmModal()?.cerrar();
        this.cargarDictamen(this.expedienteId()!);
      },
      error: () => {
        this.confirmModal()?.loading.set(false);
      }
    });
  }

  reiterarNotificacion() {

  }

  onDictamenRegistrado(): void {
    if (this.expedienteId()) {
      this.cargarDictamen(this.expedienteId()!);
    }
  }

  descargarArchivoWord(ruta: string): void {
    if (!ruta) return;

    this.fileService.descargarWord(ruta).subscribe({
      next: (blob: Blob) => {
        // Crear un objeto URL para forzar la descarga en el navegador
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'Dictamen';
        document.body.appendChild(a);
        a.click();

        // Limpiar recurso de memoria
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      },
      error: (err) => {
        console.error('Error al descargar el dictamen:', err);
        this.notificationService.showError('No se pudo descargar el archivo.');
      }
    });
  }

  descargarArchivo(ruta: string): void {
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

  formatearBytes(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(0)} KB`;

    return `${(bytes / 1048576).toFixed(2)} MB`;
  }

  obtenerClaseResultado(codigo: string): string {
    return codigo === '008001'
      ? 'bg-emerald-100 text-emerald-700'
      : 'bg-red-100 text-red-700';
  }

  obtenerIconoResultado(codigo: string): string {
    return codigo === '008001'
      ? 'pi pi-check-circle'
      : 'pi pi-times-circle';
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
        'envio'
      ]);
    }
  }

  continuarSiguientePaso(): void {
    if (this.dictamen() && this.dictamen()?.resultadoCodigo === this.dictamenAprobado) {
      this.router.navigate([
        '/tesis',
        'detalle',
        this.tesisId(),
        'expediente',
        this.expedienteId(),
        'resolucion'
      ]);
    }
  }

  finalizar(): void {
    if (this.dictamen() && this.dictamen()?.resultadoCodigo === TablaMaestraService.resultDocumenObservation) {
      this.notificationService.showSuccess('Tramite finalizado correctamente!')
      this.router.navigate([
        '/tesis',
        'detalle',
        this.tesisId()
      ]);
    }
  }

}
