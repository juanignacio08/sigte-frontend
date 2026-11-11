import { Component, inject, OnInit, signal, viewChild } from '@angular/core';
import { Router } from '@angular/router';
import { DividerModule } from '@openng/optimus-ui/divider';
import { NotificacionService } from '../../../../../shared/services/notificacion.service';
import { NoConnectionComponent } from '../../../../../shared/components/no-connection/no-connection.component';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from '../../../../../shared/components/button/button.component';
import { ExpedienteWizardStore } from '../expediente-wizard.store';
import { TesisDocumentoService } from '../../../services/tesis-documento.service';
import { DocumentoTesis } from '../../../../../shared/models/tramites/documento-tesis.model';
import { ConfirmActionType, ConfirmDialogComponent } from '../../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { TableSkeletonComponent } from '../../../../../shared/components/table-skeleton/table-skeleton.component';
import { GenerarMemoModalComponent } from './generar-memo-modal/generar-memo-modal.component';
import { FileService } from '../../../../../shared/services/file.service';
import { GlobalLoadingComponent } from '../../../../../shared/components/global-loading/global-loading.component';

@Component({
  imports: [
    CommonModule,
    ButtonComponent,
    TableSkeletonComponent,
    NoConnectionComponent,
    GenerarMemoModalComponent,
    DividerModule,
    ConfirmDialogComponent,
    GlobalLoadingComponent
  ],
  selector: 'app-expediente-memorando',
  styleUrl: './expediente-memorando.component.css',
  templateUrl: './expediente-memorando.component.html',
})
export class ExpedienteMemorandoComponent implements OnInit {
  private readonly modalMemo = viewChild<GenerarMemoModalComponent>('modalMemo');
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

  confirmAction = { selectedItem: signal<DocumentoTesis | null>(null), selectedAction: signal<ConfirmActionType>('delete') }
  documento = signal<DocumentoTesis | null>(null);

  ngOnInit(): void {
    const idTesis = this.tesisId();
    const exp = this.expediente();
    if (idTesis && exp) {
      this.cargarMemo(exp.id);
    }
  }

  cargarMemo(expedienteId: number) {
    this.loadingOperation.set(true);
    this.connectionErrorOperation.set(false);

    this.documentoTesisService.listarPorExpediente(expedienteId).subscribe({
      next: (response) => {
        this.documento.set(response.data);
        this.loadingOperation.set(false);
      },
      error: (err) => {
        this.documento.set(null);
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

  generarMemorandoModal() {
    this.modalMemo()?.abrir();
  }

  onMemoGenerado(): void {
    const expedienteId = this.expedienteId();
    if (expedienteId !== null) {
      this.cargarMemo(expedienteId);
    }
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

  volverAGenerarMemo() {
    if (!this.documento()) return;
    this.confirmAction.selectedItem.set(this.documento());
    this.confirmAction.selectedAction.set('volverAGenerarMemo');
    this.confirmModal()?.abrir('volverAGenerarMemo', this.buildNombreArchivo(this.documento()!));
  }

  eliminar() {
    if (!this.documento()) return;
    this.confirmAction.selectedItem.set(this.documento());
    this.confirmAction.selectedAction.set('delete');
    this.confirmModal()?.abrir('delete', this.buildNombreArchivo(this.documento()!));
  }

  ejecutarAccionConfirmada(): void {
    const memo = this.confirmAction.selectedItem();
    const action = this.confirmAction.selectedAction();

    if (!memo) return;

    // Activamos el spinner en el botón de confirmación
    this.confirmModal()?.loading.set(true);
    this.loadingGlobal.set(true);
    let request$;
    switch (action) {
      case 'volverAGenerarMemo':
        request$ = this.documentoTesisService.volverAGenerarMemo(memo.id);
        break;
      case 'delete':
        request$ = this.documentoTesisService.eliminarMemo(memo.id);
        break;
      default:
        request$ = this.documentoTesisService.eliminarMemo(memo.id);
        break;
    }

    request$.subscribe({
      next: (res) => {
        this.notificationService.showSuccess(res.message);
        this.loadingGlobal.set(false);
        this.confirmModal()?.cerrar();
        this.onMemoGenerado();
      },
      error: () => {
        this.confirmModal()?.loading.set(false);
        this.loadingGlobal.set(false);
      }
    });

  }

  buildNombreArchivo(memo: DocumentoTesis): string {
    const tesis = this.tesis();
    const expediente = this.expediente();
    if (!tesis || !expediente) return 'memorando.docx';

    const numeroCorrelacional = memo.numeroCorrelativo;
    const anio = memo.anioCorrelativo;

    return `MM N° ${numeroCorrelacional}-${anio}-UNSCH-FCSA-D`;
  }

  parseIntToString(value: number | undefined | null): string {
    if (value === null || value === undefined) {
      return '';
    }
    return value.toString().padStart(3, '0');
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
        'comision'
      ]);
    }
  }

  continuarSiguientePaso(): void {
    if (this.documento()) {
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
}
